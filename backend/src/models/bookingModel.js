import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

    // ── Enrollment form fields ────────────────────────────────────────────────
    studentName:         { type: String, required: true },
    studentUniversityId: { type: String, required: true },
    studentEmail:        { type: String, required: true },
    phone:               { type: String, required: true },
    reason:              { type: String, required: true },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    lecturerNote: { type: String, default: '' },

    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },

    // 🔴 Mentorship Specifics
    definedOutcomes: { type: String, trim: true }, // The "Goal" for this session
    matchingScore:   { type: Number },              // Compatibility score at time of request

    // ── Feedback (unlocked after completion) ──────────────────────────────────
    feedback: {
      rating:      { type: Number, min: 1, max: 5 },
      comment:     { type: String },
      skillMatrix: { type: Map, of: Number }, // e.g. { "React": 4, "State Mgmt": 5 }
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// ── Unique index: prevents double booking ─────────────────────────────────────
bookingSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;


