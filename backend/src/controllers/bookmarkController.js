import Bookmark from '../models/bookmarkModel.js';
import Resource from '../models/resourceModel.js';

// @desc    Bookmark a resource with a study intent
// @route   POST /api/resources/:id/bookmark
// @access  Private (authenticated)

export const addBookmark = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { intent }  = req.body;

    // Validate intent
    const validIntents = ['EXAM', 'CONCEPT', 'ASSIGNMENT', 'QUICK_REVIEW'];
    if (!intent || !validIntents.includes(intent)) {
      return res.status(400).json({
        message: `Study intent is required. Must be one of: ${validIntents.join(', ')}`,
      });
    }

    // Verify resource exists and is approved
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (resource.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'You can only bookmark approved resources' });
    }

    // Business Rule: one bookmark per user per resource — upsert with new intent
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user._id, resourceId },
      { intent },
      { new: true, upsert: true, runValidators: true }
    );

    const isNew = bookmark.createdAt.getTime() === bookmark.updatedAt.getTime();

    res.status(200).json({
      success:  true,
      message:  isNew ? '🔖 Resource bookmarked!' : '🔖 Bookmark intent updated!',
      data:     bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Already bookmarked' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/resources/:id/bookmark
// @access  Private (own bookmarks only)

export const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      userId:     req.user._id,
      resourceId: req.params.id,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ success: true, message: '🗑️ Bookmark removed!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's bookmarks (filterable by intent)
// @route   GET /api/bookmarks/my
// @access  Private

export const getMyBookmarks = async (req, res) => {
  try {
    const { intent } = req.query;
    const filter = { userId: req.user._id };

    // Business Rule: filter by study intent for structured study planning
    if (intent && ['EXAM', 'CONCEPT', 'ASSIGNMENT', 'QUICK_REVIEW'].includes(intent)) {
      filter.intent = intent;
    }

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'resourceId',
        select: 'title moduleCode moduleName academicYear semester type approvalStatus downloadCount latestVersionId createdBy',
        populate: [
          { path: 'createdBy',      select: 'name role' },
          { path: 'latestVersionId', select: 'versionNumber storageType fileUrl externalUrl' },
        ],
      })
      .lean();

    // Filter out bookmarks whose resource was deleted or archived
    const valid = bookmarks.filter(
      (b) => b.resourceId && b.resourceId.approvalStatus === 'APPROVED'
    );

    // Group by intent for dashboard summary
    const grouped = {
      EXAM:         valid.filter((b) => b.intent === 'EXAM'),
      CONCEPT:      valid.filter((b) => b.intent === 'CONCEPT'),
      ASSIGNMENT:   valid.filter((b) => b.intent === 'ASSIGNMENT'),
      QUICK_REVIEW: valid.filter((b) => b.intent === 'QUICK_REVIEW'),
    };

    res.json({
      success: true,
      total:   valid.length,
      data:    valid,
      grouped,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
