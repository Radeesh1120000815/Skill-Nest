import ResourceRating from '../models/resourceRatingModel.js';
import Resource from '../models/resourceModel.js';


// @desc    Submit or update a rating (one per user per resource)
// @route   POST /api/resources/:id/ratings
// @access  Private (authenticated)

export const upsertRating = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const resourceId = req.params.id;

    // Validate stars
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    // Verify resource exists and is approved
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (resource.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'You can only rate approved resources' });
    }

    // Business Rule: findOneAndUpdate with upsert = one rating per user per resource
    // If it exists → update; if not → insert. Unique index is the safety net.
    const rating = await ResourceRating.findOneAndUpdate(
      { resourceId, userId: req.user._id },
      {
        stars:   parseInt(stars),
        comment: comment?.trim() || '',
      },
      {
        new:    true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate('userId', 'name role');

    res.status(200).json({
      success: true,
      message: '⭐ Rating submitted successfully!',
      data:    rating,
    });
  } catch (error) {
    // Duplicate key error (E11000) should not happen with upsert,
    // but guard just in case of race condition
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already rated this resource' });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete own rating (or admin can delete any)
// @route   DELETE /api/ratings/:id

export const deleteRating = async (req, res) => {
  try {
    const rating = await ResourceRating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    if (rating.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own ratings' });
    }

    await rating.deleteOne();
    res.json({ success: true, message: '🗑️ Rating deleted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all ratings for a resource
// @route   GET /api/resources/:id/ratings
// @access  Public

export const getResourceRatings = async (req, res) => {
  try {
    const ratings = await ResourceRating.find({ resourceId: req.params.id })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name role')
      .lean();

    const stats = ratings.length
      ? {
          avg:   Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10,
          count: ratings.length,
          distribution: [1, 2, 3, 4, 5].map((n) => ({
            stars: n,
            count: ratings.filter((r) => r.stars === n).length,
          })),
        }
      : { avg: 0, count: 0, distribution: [] };

    res.json({ success: true, data: ratings, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
