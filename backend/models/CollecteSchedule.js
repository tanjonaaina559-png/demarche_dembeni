const mongoose = require('mongoose');

const collecteScheduleSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  // Schedule Information
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  monthName: { type: String, required: true }, // January, February, etc.
  
  // Collection Details
  collectionDates: [{
    date: { type: Date, required: true },
    area: { type: String, required: true }, // e.g., "Quartier Nord"
    description: { type: String, default: '' },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
  }],
  
  // Image/Poster
  posterImage: { type: String, default: '' },
  
  // Instructions
  instructions: { type: String, default: '' },
  importantNotes: [{ type: String }],
  
  // Contact/Support
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  
  // Display Settings
  isPublished: { type: Boolean, default: true },
  displayOnHomepage: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  
  // Tracking
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

collecteScheduleSchema.index({ year: 1, month: 1 });
collecteScheduleSchema.index({ isPublished: 1, displayOnHomepage: 1 });

module.exports = mongoose.model('CollecteSchedule', collecteScheduleSchema);
