const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  // Page Information
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true }, // Rich HTML content
  excerpt: { type: String, default: '' },
  
  // Media
  featuredImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
  galleryImages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  
  // Page Settings
  layout: { type: String, enum: ['default', 'full-width', 'sidebar', 'banner'], default: 'default' },
  displayInMenu: { type: Boolean, default: true },
  menuOrder: { type: Number, default: 0 },
  parentPage: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  
  // SEO
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: [{ type: String }],
  
  // Status
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  
  // Visibility
  isVisible: { type: Boolean, default: true },
  requiresAuth: { type: Boolean, default: false },
  authLevel: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  
  // Tracking
  viewCount: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

pageSchema.index({ slug: 1, status: 1 });
pageSchema.index({ status: 1, isVisible: 1 });

// Pre-save hook to generate slug if not present
pageSchema.pre('save', function() {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Page', pageSchema);
