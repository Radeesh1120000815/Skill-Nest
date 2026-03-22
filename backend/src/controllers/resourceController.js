import Resource from '../models/resourceModel.js';
import ResourceVersion from '../models/resourceVersionModel.js';
import ResourceRating from '../models/resourceRatingModel.js';
import Bookmark from '../models/bookmarkModel.js';

// @desc    Get all APPROVED resources (public listing with search + filters)
// @route   GET /api/resources
// @access  Public (optionalAuth — adds isBookmarked/userRating when logged in)
export const getResources = async (req, res) => {
  try {
    const {
      search,
      moduleCode,
      academicYear,
      semester,
      type,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Only APPROVED + ACTIVE resources are publicly visible (Business Rule)
    const filter = { approvalStatus: 'APPROVED', status: 'ACTIVE' };

    if (moduleCode)   filter.moduleCode   = moduleCode.toUpperCase().trim();
    if (academicYear) filter.academicYear = academicYear.trim();
    if (semester)     filter.semester     = semester;
    if (type)         filter.type         = type;

    // Keyword search across title, moduleName, tags
    if (search && search.trim()) {
      filter.$or = [
        { title:      { $regex: search.trim(), $options: 'i' } },
        { moduleName: { $regex: search.trim(), $options: 'i' } },
        { tags:       { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    // Sorting strategy
    const sortMap = {
      newest:         { createdAt: -1 },
      most_downloaded:{ downloadCount: -1 },
      top_rated:      { 'ratingStats.avg': -1 }, // virtual — handled post-aggregation
    };
    const mongoSort = sortMap[sort] || { createdAt: -1 };

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort(mongoSort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name role')
        .populate('latestVersionId', 'versionNumber storageType fileUrl externalUrl createdAt')
        .lean(),
      Resource.countDocuments(filter),
    ]);

    // Attach aggregate rating stats for each resource
    const resourceIds = resources.map((r) => r._id);
    const ratingAgg = await ResourceRating.aggregate([
      { $match: { resourceId: { $in: resourceIds } } },
      {
        $group: {
          _id:   '$resourceId',
          avg:   { $avg: '$stars' },
          count: { $sum: 1 },
        },
      },
    ]);
    const ratingMap = {};
    ratingAgg.forEach((r) => {
      ratingMap[r._id.toString()] = {
        avg:   Math.round(r.avg * 10) / 10,
        count: r.count,
      };
    });

    // Attach personalised data when user is logged in
    let bookmarkSet = new Set();
    if (req.user) {
      const bookmarks = await Bookmark.find({
        userId: req.user._id,
        resourceId: { $in: resourceIds },
      }).select('resourceId').lean();
      bookmarks.forEach((b) => bookmarkSet.add(b.resourceId.toString()));
    }

    const enriched = resources.map((r) => ({
      ...r,
      ratingStats:  ratingMap[r._id.toString()] || { avg: 0, count: 0 },
      isBookmarked: req.user ? bookmarkSet.has(r._id.toString()) : null,
    }));

    // Handle top_rated sort post-enrichment (can't sort by computed field in Mongo easily)
    if (sort === 'top_rated') {
      enriched.sort((a, b) => (b.ratingStats.avg - a.ratingStats.avg));
    }

    res.json({
      success: true,
      data:       enriched,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resource by ID (full detail + versions + ratings)
// @route   GET /api/resources/:id
// @access  Public (optionalAuth)
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy',  'name role email')
      .populate('approvedBy', 'name')
      .populate('latestVersionId');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Non-APPROVED resources only visible to owner or ADMIN
    const isOwner = req.user && resource.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (resource.approvalStatus !== 'APPROVED' && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'This resource is not yet publicly available' });
    }

    // Fetch full version history
    const versions = await ResourceVersion.find({ resourceId: resource._id })
      .sort({ versionNumber: -1 })
      .populate('uploadedBy', 'name role')
      .lean();

    // Fetch all ratings + comments
    const ratings = await ResourceRating.find({ resourceId: resource._id })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name role')
      .lean();

    const ratingStats = ratings.length
      ? {
          avg:   Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10,
          count: ratings.length,
        }
      : { avg: 0, count: 0 };

    // Personalised data
    let userRating   = null;
    let isBookmarked = false;
    let bookmarkIntent = null;

    if (req.user) {
      userRating = await ResourceRating.findOne({
        resourceId: resource._id,
        userId:     req.user._id,
      }).lean();

      const bookmark = await Bookmark.findOne({
        userId:     req.user._id,
        resourceId: resource._id,
      }).lean();
      isBookmarked   = !!bookmark;
      bookmarkIntent = bookmark ? bookmark.intent : null;
    }

    res.json({
      success: true,
      data: {
        resource,
        versions,
        ratings,
        ratingStats,
        userRating,
        isBookmarked,
        bookmarkIntent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a new resource (version 1 created automatically)
// @route   POST /api/resources
// @access  Private (STUDENT → PENDING, LECTURER/ADMIN → APPROVED)

export const createResource = async (req, res) => {
  try {
    const {
      title, moduleCode, moduleName, academicYear,
      semester, type, description, tags,
      storageType, externalUrl, changeNote,
    } = req.body;

    // Validation — required fields
    if (!title || !moduleCode || !moduleName || !academicYear || !semester || !type) {
      return res.status(400).json({
        message: 'title, moduleCode, moduleName, academicYear, semester, and type are required',
      });
    }

    // Validate storageType + content
    if (!storageType || !['FILE', 'LINK'].includes(storageType)) {
      return res.status(400).json({ message: 'storageType must be FILE or LINK' });
    }
    if (storageType === 'LINK' && !externalUrl) {
      return res.status(400).json({ message: 'externalUrl is required when storageType is LINK' });
    }
    if (storageType === 'FILE' && !req.file) {
      return res.status(400).json({ message: 'A file must be uploaded when storageType is FILE' });
    }

    // Business Rule: Lecturer/Admin → auto-approved
    const isAutoApproved = ['LECTURER', 'ADMIN'].includes(req.user.role);

    const resource = await Resource.create({
      title:        title.trim(),
      moduleCode:   moduleCode.toUpperCase().trim(),
      moduleName:   moduleName.trim(),
      academicYear: academicYear.trim(),
      semester,
      type,
      description:  description?.trim(),
      tags:         tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim().toLowerCase())) : [],
      createdBy:    req.user._id,
      approvalStatus: isAutoApproved ? 'APPROVED' : 'PENDING',
      ...(isAutoApproved && {
        approvedBy: req.user._id,
        approvedAt: new Date(),
      }),
    });

    // Create Version 1
    const version = await ResourceVersion.create({
      resourceId:  resource._id,
      versionNumber: 1,
      storageType,
      fileUrl:     storageType === 'FILE' ? req.file.path : undefined,
      fileName:    storageType === 'FILE' ? req.file.originalname : undefined,
      fileSize:    storageType === 'FILE' ? req.file.size : undefined,
      externalUrl: storageType === 'LINK' ? externalUrl.trim() : undefined,
      uploadedBy:  req.user._id,
      isLatest:    true,
      changeNote:  changeNote?.trim() || 'Initial upload',
    });

    // Point resource to its first (and only) version
    resource.latestVersionId = version._id;
    await resource.save();

    res.status(201).json({
      success: true,
      message: isAutoApproved
        ? '✅ Resource uploaded and published successfully!'
        : '⏳ Resource submitted for review. It will appear publicly once approved by an admin.',
      data: resource,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a new version of an existing resource
// @route   POST /api/resources/:id/versions
// @access  Private (owner or ADMIN only — enforced by ownershipMiddleware)
export const uploadNewVersion = async (req, res) => {
  try {
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only add versions to your own resources' });
    }

    const { storageType, externalUrl, changeNote } = req.body;

    if (!storageType || !['FILE', 'LINK'].includes(storageType)) {
      return res.status(400).json({ message: 'storageType must be FILE or LINK' });
    }
    if (storageType === 'LINK' && !externalUrl) {
      return res.status(400).json({ message: 'externalUrl is required for LINK type' });
    }
    if (storageType === 'FILE' && !req.file) {
      return res.status(400).json({ message: 'A file must be uploaded for FILE type' });
    }

    // Business Rule: mark all existing versions as not-latest
    await ResourceVersion.updateMany(
      { resourceId: resource._id },
      { $set: { isLatest: false } }
    );

    // Determine next version number
    const latest = await ResourceVersion.findOne({ resourceId: resource._id })
      .sort({ versionNumber: -1 })
      .lean();
    const nextVersionNumber = latest ? latest.versionNumber + 1 : 1;

    // Create new latest version
    const newVersion = await ResourceVersion.create({
      resourceId:    resource._id,
      versionNumber: nextVersionNumber,
      storageType,
      fileUrl:       storageType === 'FILE' ? req.file.path : undefined,
      fileName:      storageType === 'FILE' ? req.file.originalname : undefined,
      fileSize:      storageType === 'FILE' ? req.file.size : undefined,
      externalUrl:   storageType === 'LINK' ? externalUrl.trim() : undefined,
      uploadedBy:    req.user._id,
      isLatest:      true,
      changeNote:    changeNote?.trim() || `Version ${nextVersionNumber}`,
    });

    // Update resource pointer
    resource.latestVersionId = newVersion._id;
    await resource.save();

    res.status(201).json({
      success: true,
      message: `✅ Version ${nextVersionNumber} uploaded successfully!`,
      data:    newVersion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update resource metadata (title, description, tags, etc.)
// @route   PUT /api/resources/:id
// @access  Private (owner or ADMIN — ownershipMiddleware)
export const updateResource = async (req, res) => {
  try {
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only edit your own resources' });
    }
    
    const { title, description, tags, moduleName, moduleCode, academicYear, semester, type } = req.body;

    // Only update fields that were provided
    if (title)        resource.title        = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (moduleName)   resource.moduleName   = moduleName.trim();
    if (moduleCode)   resource.moduleCode   = moduleCode.toUpperCase().trim();
    if (academicYear) resource.academicYear = academicYear.trim();
    if (semester)     resource.semester     = semester;
    if (type)         resource.type         = type;
    if (tags !== undefined) {
      resource.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase())
        : tags.split(',').map((t) => t.trim().toLowerCase());
    }

    // Business Rule: Editing a REJECTED resource resets it to PENDING for re-review
    if (resource.approvalStatus === 'REJECTED') {
      resource.approvalStatus = 'PENDING';
      resource.rejectionReason = undefined;
    }

    const updated = await resource.save();

    res.json({
      success: true,
      message: '✅ Resource updated successfully!',
      data:    updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resource (soft archive OR hard delete)
// @route   DELETE /api/resources/:id
// @access  Private (owner or ADMIN — ownershipMiddleware)
export const deleteResource = async (req, res) => {
  try {
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own resources' });
    }

    // Hard delete: remove resource + all child documents
    await ResourceVersion.deleteMany({ resourceId: resource._id });
    await ResourceRating.deleteMany({ resourceId: resource._id });
    await Bookmark.deleteMany({ resourceId: resource._id });
    await resource.deleteOne();

    res.json({ success: true, message: '🗑️ Resource deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment download count + return download URL
// @route   POST /api/resources/:id/download
// @access  Private (authenticated users only)
export const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('latestVersionId');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (resource.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Resource is not available for download' });
    }

    // Business Rule: downloadCount increments per successful download
    resource.downloadCount += 1;
    await resource.save();

    const version = resource.latestVersionId;
    const downloadUrl = version?.storageType === 'FILE'
      ? version.fileUrl
      : version?.externalUrl;

    res.json({
      success:     true,
      downloadUrl,
      downloadCount: resource.downloadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's own uploads (all statuses)
// @route   GET /api/resources/my-uploads
// @access  Private
export const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('latestVersionId', 'versionNumber storageType fileUrl externalUrl fileName')
      .lean();

    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
