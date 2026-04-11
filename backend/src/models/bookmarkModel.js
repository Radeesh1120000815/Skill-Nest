import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource ID is required'],
    },

    intent: {
      type: String,
      required: [true, 'Study intent is required'],
      enum: {
        values: ['EXAM', 'CONCEPT', 'ASSIGNMENT', 'QUICK_REVIEW'],
        message: 'Intent must be EXAM, CONCEPT, ASSIGNMENT, or QUICK_REVIEW',
      },
    },
  },
  { timestamps: true }
);
// One bookmark per user per resource
bookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });
// Filter bookmarks by study intent (My Bookmarks page)
bookmarkSchema.index({ userId: 1, intent: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
