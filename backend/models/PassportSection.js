const mongoose = require('mongoose');

const passportSectionSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  // Section Header
  tagText: { type: String, default: 'Documents' },
  tagIcon: { type: String, default: 'fa-passport' },
  title: { type: String, default: 'Passeport & CNI' },
  
  // Steps
  steps: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  
  // CTA Button
  buttonText: { type: String, default: 'Commencer ma demande de passeport' },
  buttonLink: { type: String, default: '/demarches' },
  
  // Display
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PassportSection', passportSectionSchema);
