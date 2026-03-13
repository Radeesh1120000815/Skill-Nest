import mongoose from 'mongoose';

// It is best practice to use 'new mongoose.Schema'
const kuppiGroupSchema = new mongoose.Schema(
  {
    senior_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Senior ID is required'],
      index: true // Added index for faster queries when searching by senior
    },
    title: { 
      type: String, 
      required: false, // 🔴 Meka optional kala parana form eka wada karanna
      trim: true // New: A title for the specific session
    },
    module_name: { 
      type: String, 
      required: [true, 'Module name is required'],
      trim: true, // Trims whitespace from both ends
      index: true
    },
    semester: { 
      type: String, 
      required: [true, 'Semester is required'],
      trim: true
    },
    scheduled_date: { 
      type: Date, 
      required: false // 🔴 Meka optional kala parana form eka wada karanna
    },
    max_members: { 
      type: Number, 
      default: 10,
      min: [1, 'Max members must be at least 1'] 
    },
    min_members: { 
      type: Number, 
      default: 5,
      min: [1, 'Min members must be at least 1']
    },
    current_members: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    pending_members: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    status: { 
      type: String, 
      enum: ['pending', 'active', 'completed', 'cancelled'], // Added 'cancelled' state
      default: 'pending' 
    },
    session_link: { 
      type: String, 
      trim: true,
      // Consider removing 'required: true' if links are generated AFTER group creation
      required: [true, 'Session link is required'] 
    },
    quiz_link: { 
      type: String, 
      trim: true,
      required: false // 🔴 Meka optional kala parana form eka wada karanna
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
    toObject: { virtuals: true }
  }
);

// --- VIRTUALS ---

// Virtual property to quickly check if the group is full
kuppiGroupSchema.virtual('is_full').get(function() {
  return this.current_members.length >= this.max_members;
});

// Virtual property to get the current member count
kuppiGroupSchema.virtual('member_count').get(function() {
  return this.current_members.length;
});

const KuppiGroup = mongoose.model('KuppiGroup', kuppiGroupSchema);
export default KuppiGroup;