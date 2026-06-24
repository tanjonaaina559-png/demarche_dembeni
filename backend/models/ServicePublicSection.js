const mongoose = require('mongoose');

const servicePublicSectionSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  // Section Content
  tagText: { type: String, default: 'Proximité' },
  tagIcon: { type: String, default: 'fa-landmark' },
  title: { type: String, default: 'Service public de proximité' },
  description: { type: String, default: 'Les services municipaux accompagnent les habitants de Dembéni dans toutes leurs démarches. État civil, vie scolaire, action sociale, urbanisme.' },
  
  // Image
  image: { type: String, default: '' },
  imageAlt: { type: String, default: 'Service public Dembeni' },
  
  // Statistics
  stats: [{
    value: { type: String, default: '' },
    label: { type: String, default: '' }
  }],
  
  // CTA Button
  buttonText: { type: String, default: 'Voir tous les services' },
  buttonLink: { type: String, default: '/service-public' },
  
  // Display
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ServicePublicSection', servicePublicSectionSchema);
