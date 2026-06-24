const mongoose = require('mongoose');

// This model extends service management beyond the Procedure model
// It provides CMS features for service descriptions and management

const serviceDescriptionSchema = new mongoose.Schema({
  // Link to Procedure
  procedure: { type: mongoose.Schema.Types.ObjectId, ref: 'Procedure', required: true, unique: true },
  
  // Extended Description
  longDescription: { type: String, default: '' }, // Rich text HTML
  benefits: [{ type: String }],
  whoCan: [{ type: String }], // Who can apply
  requirements: [{ type: String }], // Requirements list
  
  // Contacts & Support
  contactName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  
  // Related Resources
  relatedProcedures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Procedure' }],
  relatedFAQs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FAQ' }],
  downloadableFiles: [{
    title: String,
    fileUrl: String,
    fileType: String // 'pdf', 'doc', 'xlsx', etc.
  }],
  
  // Gallery
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  
  // Testimonials
  testimonials: [{
    author: String,
    text: String,
    rating: { type: Number, min: 1, max: 5 }
  }],
  
  // Availability
  openingHours: [{
    day: { type: String },
    startTime: String,
    endTime: String,
    isClosed: { type: Boolean, default: false }
  }],
  
  // Display Settings
  showOnHomepage: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  
  // SEO
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  
  // Tracking
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

serviceDescriptionSchema.index({ featured: 1, showOnHomepage: 1 });

module.exports = mongoose.model('ServiceDescription', serviceDescriptionSchema);
