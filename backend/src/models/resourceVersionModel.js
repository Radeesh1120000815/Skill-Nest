import mongoose from mongoose;

const resourceVersionSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource ID is required'],
    },

    // Auto-incremented by resourceController — never set by client
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
      min: [1, 'Version number must be at least 1'],
    },

    storageType: {
      type: String,
      enum: {
        values: ['FILE', 'LINK'],
        message: 'Storage type must be FILE or LINK',
      },
      required: [true, 'Storage type is required'],
    },

    // Populated when storageType = 'FILE'  (Cloudinary / S3 URL)
    fileUrl: { type: String, trim: true },
    fileName: { type: String, trim: true },
    fileSize: { type: Number }, // bytes

    // Populated when storageType = 'LINK'
    externalUrl: { type: String, trim: true },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },

    // Exactly ONE document per resource has this true
    isLatest: {
      type: Boolean,
      default: true,
    },

    changeNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Change note cannot exceed 500 characters'],
      default: 'Initial upload',
    },
  },
  { timestamps: true }
);

// Version history query: find all versions for a resource, sorted desc
resourceVersionSchema.index({ resourceId: 1, versionNumber: -1 });
// Fast lookup: "give me the latest version for this resource"
resourceVersionSchema.index({ resourceId: 1, isLatest: 1 });

const ResourceVersion = mongoose.model('ResourceVersion', resourceVersionSchema);
export default ResourceVersion;
