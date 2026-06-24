const mongoose = require('mongoose');

const homeContentSchema = new mongoose.Schema({
  section: { type: String, required: true },
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  backgroundImage: { type: String },
  imageUrl: { type: String },
  posterImage: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  buttons: { type: mongoose.Schema.Types.Mixed },
  servicesHeading: { type: String },
  alertText: { type: String },
  showAlert: { type: Boolean },
  instructions: { type: String },
  importantNotes: { type: mongoose.Schema.Types.Mixed },
  tagText: { type: String },
  tagIcon: { type: String },
  activitiesTitle: { type: String },
  pricingTitle: { type: String },
  pricingNote: { type: String },
  ctaTitle: { type: String },
  ctaDescription: { type: String },
  ctaButtons: { type: mongoose.Schema.Types.Mixed },
  statistics: { type: mongoose.Schema.Types.Mixed }, // For numbers/stats
  activities: { type: mongoose.Schema.Types.Mixed }, // For Loisirs
  tarifs: { type: mongoose.Schema.Types.Mixed }, // For pricing
  advantages: { type: mongoose.Schema.Types.Mixed }, // For Collecte
  steps: { type: mongoose.Schema.Types.Mixed }, // For Passeport
  question: { type: String }, // For FAQ
  answer: { type: String }, // For FAQ
  address: { type: String }, // For Footer
  phone: { type: String },
  email: { type: String },
  schedule: { type: mongoose.Schema.Types.Mixed },
  socialLinks: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HomeContent', homeContentSchema);
