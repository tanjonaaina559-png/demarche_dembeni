const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  // File Information
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true }, // in bytes
  
  // File Path & URLs
  filePath: { type: String, required: true },
  url: { type: String, required: true },
  thumbUrl: { type: String, default: '' }, // thumbnail URL
  
  // Image Metadata
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  alt: { type: String, default: '' },
  title: { type: String, default: '' },
  
  // Usage & Organization
  category: { type: String, enum: ['hero', 'service', 'collecte', 'cms', 'other'], default: 'other' },
  tags: [{ type: String }],
  description: { type: String, default: '' },
  
  // Usage Tracking
  usedIn: [{
    type: { type: String }, // e.g., 'procedure', 'page', 'hero'
    referenceId: mongoose.Schema.Types.ObjectId
  }],
  downloadCount: { type: Number, default: 0 },
  
  // Upload Information
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedFrom: { type: String, default: 'admin' }, // 'admin', 'citizen', etc.
  
  // Optimization
  optimized: { type: Boolean, default: false },
  formats: {
    original: { type: String, default: '' },
    large: { type: String, default: '' },
    medium: { type: String, default: '' },
    small: { type: String, default: '' },
    thumbnail: { type: String, default: '' }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
}, { timestamps: true });

mediaSchema.index({ category: 1, isActive: 1 });
mediaSchema.index({ uploadedBy: 1, createdAt: 1 });
mediaSchema.index({ tags: 1 });

module.exports = mongoose.model('Media', mediaSchema);
