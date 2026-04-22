import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['junior', 'senior', 'both','STUDENT', 'LECTURER', 'ADMIN'], 
    },
    universityId:{type: String},
    
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

    // 🔴 Mentorship Profile Fields
    headline:  { type: String, trim: true },
    bio:       { type: String, trim: true },
    skills:    [{ type: String }],
    interests: [{ type: String }],
    industry:  { type: String, trim: true },
    languages: [{ type: String, default: ['English'] }],

    // 🔓 Privacy & Notifications Preferences
    profilePublic: { type: Boolean, default: true },
    emailNotif:    { type: Boolean, default: true },
    pushNotif:     { type: Boolean, default: false },

    // 🔐 Forgot Password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;