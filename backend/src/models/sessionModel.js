import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalised for fast reads 
    lecturerName: {
      type: String,
      default: '',
      trim: true,
    },

    // Core fields (kept from teammate) 
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    maxStudents: {
      type: Number,
      required: true,
      min: 1,
    },

    //  Added for student booking flow 
    sessionLink: {
      type: String,
      trim: true,
    },
    time: {
      type: String,   // e.g. "10:00 AM" — stored as string for display
      trim: true,
    },
    currentEnrollments: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },

    //Rating (recalculated from booking feedback) 
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
