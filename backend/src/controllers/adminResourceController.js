import Resource from '../models/resourceModel.js';
import ResourceVersion from '../models/resourceVersionModel.js';
import ResourceRating from '../models/resourceRatingModel.js';

// @desc    Get all PENDING resources (admin review queue)
// @route   GET /api/admin/resources/pending
// @access  Private (ADMIN only)

export const getPendingResources = async (req, res) => {
  try {
    const pending = await Resource.find({
      approvalStatus: 'PENDING',
      status: 'ACTIVE',
    })
      .sort({ createdAt: 1 }) // Oldest first (FIFO queue)
      .populate('createdBy', 'name email role')
      .populate('latestVersionId', 'versionNumber storageType fileUrl externalUrl fileName')
      .lean();

    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a pending resource
// @route   PUT /api/admin/resources/:id/approve
// @access  Private (ADMIN only)

export const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('createdBy', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Business Rule: Cannot approve an already-approved resource
    if (resource.approvalStatus === 'APPROVED') {
      return res.status(400).json({ message: 'Resource is already approved' });
    }

    resource.approvalStatus  = 'APPROVED';
    resource.approvedBy      = req.user._id;
    resource.approvedAt      = new Date();
    resource.rejectionReason = undefined; // Clear any previous rejection

    await resource.save();

    // TODO: Trigger notification to uploader (resource.createdBy.email)
    // e.g. sendEmail(resource.createdBy.email, 'Your resource was approved', ...)

    res.json({
      success: true,
      message: `✅ "${resource.title}" has been approved and is now publicly visible.`,
      data:    resource,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a pending resource with a reason
// @route   PUT /api/admin/resources/:id/reject
// @access  Private (ADMIN only)

export const rejectResource = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const resource = await Resource.findById(req.params.id).populate('createdBy', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.approvalStatus === 'REJECTED') {
      return res.status(400).json({ message: 'Resource is already rejected' });
    }

    resource.approvalStatus  = 'REJECTED';
    resource.rejectionReason = reason.trim();
    resource.approvedBy      = undefined;
    resource.approvedAt      = undefined;

    await resource.save();

    // TODO: Trigger notification to uploader with rejection reason
    // e.g. sendEmail(resource.createdBy.email, 'Resource review update', reason)

    res.json({
      success: true,
      message: `❌ "${resource.title}" has been rejected.`,
      data:    resource,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources (admin overview — all statuses)
// @route   GET /api/admin/resources
// @access  Private (ADMIN only)

export const getAllResourcesAdmin = async (req, res) => {
  try {
    const { approvalStatus, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (type)           filter.type           = type;

    //const pageNum  = Math.max(1, parseInt(page));
    //const limitNum = Math.min(100, parseInt(limit));
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Number.parseInt(limit, 10) || 20);
    const skip     = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy',  'name email role')
        .populate('approvedBy', 'name')
        .lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:       resources,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resource module statistics (admin dashboard)
// @route   GET /api/admin/resources/stats
// @access  Private (ADMIN only)

export const getResourceStats = async (req, res) => {
  try {
    const [
      totalResources, pendingCount, approvedCount, rejectedCount,
      totalDownloads, totalRatings, byType,
    ] = await Promise.all([
      Resource.countDocuments({ status: 'ACTIVE' }),
      Resource.countDocuments({ approvalStatus: 'PENDING',  status: 'ACTIVE' }),
      Resource.countDocuments({ approvalStatus: 'APPROVED', status: 'ACTIVE' }),
      Resource.countDocuments({ approvalStatus: 'REJECTED', status: 'ACTIVE' }),
      Resource.aggregate([{ $match: { status: 'ACTIVE' } },{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      ResourceRating.countDocuments(),
      Resource.aggregate([
        { $match: { approvalStatus: 'APPROVED', status: 'ACTIVE' } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalResources,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalRatings,
        byType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


