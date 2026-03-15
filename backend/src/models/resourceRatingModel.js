const resourceRatingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource ID is required'],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    stars: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);
//No duplicate ratings per user-resource combination
resourceRatingSchema.index({ resourceId: 1, userId: 1 }, { unique: true });
// Efficiently fetch all ratings for a resource
resourceRatingSchema.index({ resourceId: 1, createdAt: -1 });

const ResourceRating = mongoose.model('ResourceRating', resourceRatingSchema);
export default ResourceRating;
