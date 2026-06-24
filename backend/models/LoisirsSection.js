const mongoose = require('mongoose');

const loisirsSectionSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  // Section Header
  tagText: { type: String, default: 'Petite enfance' },
  tagIcon: { type: String, default: 'fa-child' },
  title: { type: String, default: 'Enfance & Loisirs' },
  
  // Activities
  activitiesTitle: { type: String, default: 'Activités du centre de loisirs' },
  activities: [{
    icon: { type: String, default: 'fa-palette' },
    label: { type: String, default: '' }
  }],
  
  // Pricing
  pricingTitle: { type: String, default: 'Tarifs Crèche — Quotient Familial' },
  pricingNote: { type: String, default: 'Tarifs définis selon le quotient familial CAF. Sur dossier.' },
  tarifs: [{
    label: { type: String, default: '' },
    price: { type: String, default: '' },
    unit: { type: String, default: '€/h' },
    isFeatured: { type: Boolean, default: false }
  }],
  
  // CTA Button
  buttonText: { type: String, default: 'Inscrire mon enfant' },
  buttonLink: { type: String, default: '/inscription' },
  
  // Display
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('LoisirsSection', loisirsSectionSchema);
