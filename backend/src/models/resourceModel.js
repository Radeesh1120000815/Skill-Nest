import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    moduleCode: {
      type: String,
      //required: [true, 'Module code is required'],
      trim: true,
      uppercase: true,
    },
    moduleName: {
      type: String,
      //required: [true, 'Module name is required'],
      trim: true,
    },

    academicYear: {
      type: String,
      //required: [true, 'Academic year is required'],
      trim: true,
      // Format: "2023/2024"
    },

    semester: {
      type: String,
      //required: [true, 'Semester is required'],
      enum: {
        values: ['SEMESTER_1', 'SEMESTER_2', 'FULL_YEAR'],
        message: 'Semester must be SEMESTER_1, SEMESTER_2, or FULL_YEAR',
      },
    },

    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: ['NOTES', 'SLIDES', 'PAST_PAPER', 'LINK', 'OTHER'],
        message: 'Type must be one of: NOTES, SLIDES, PAST_PAPER, LINK, OTHER',
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resource must have an owner'],
    },

    // ACTIVE = visible to approved audience, ARCHIVED = soft-deleted
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },

    // Student → PENDING, Lecturer/Admin → APPROVED auto
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },

    // Fast pointer to latest version — avoids sorting resourceVersions on every list call
    latestVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceVersion',
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    visibility: {
      type: String,
      enum: ['PUBLIC', 'MODULE_ONLY'],
      default: 'PUBLIC',
    },
  },
  { timestamps: true }
);

resourceSchema.index({ moduleCode: 1, academicYear: 1, semester: 1 });
resourceSchema.index({ approvalStatus: 1, status: 1 });
resourceSchema.index({ createdBy: 1, createdAt: -1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ title: 'text', moduleName: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
