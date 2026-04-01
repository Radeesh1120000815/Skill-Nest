import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lecturerId: { type: String },
    studentId: { type: String },
    role: {
      type: String,
      enum: ['junior', 'senior', 'both', 'lecturer', 'student', 'admin'], // Only lowercase roles allowed
      default: 'junior',
    },
    batch_details: {
      year: Number,
      semester: Number,
      specialization: String,
    },

    // Account status for admin management
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    
    // 🔴 Gamification: Badges array with timestamp
    badges: [
      {
        badgeName: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now }
      }
    ],
    
    // 🔴 Total Points (Experience Points)
    points: { type: Number, default: 0 },
    
    rating: { type: Number, default: 0 },

    // 🔐 Forgot Password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;