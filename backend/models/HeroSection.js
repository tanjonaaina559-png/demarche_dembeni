const mongoose = require('mongoose');

const heroSectionSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  // Main Content
  title: { type: String, default: 'Toutes vos démarches en un seul endroit' },
  subtitle: { type: String, default: 'État civil, documents officiels, collecte d\'encombrants, crèche...' },
  description: { type: String, default: 'Accédez à tous les services administratifs de la Commune de Dembéni en ligne' },
  
  // Background
  backgroundImage: { type: String, default: '' },
  backgroundColor: { type: String, default: '#f0f4f8' },
  textColor: { type: String, default: '#333' },
  
  // Call-to-Action Buttons
  buttons: [{
    text: { type: String, default: 'Commencer' },
    link: { type: String, default: '/inscription' },
    color: { type: String, default: '#007bff' },
    order: { type: Number, default: 0 }
  }],
  
  // Hero Statistics Block (displays on homepage)
  showStats: { type: Boolean, default: true },
  stats: [{
    value: { type: String, default: '12+' },
    label: { type: String, default: 'Démarches' },
    icon: { type: String, default: 'fa-briefcase' }
  }],
  
  // Services Block
  showServices: { type: Boolean, default: true },
  servicesHeading: { type: String, default: 'Services disponibles' },
  servicesSubheading: { type: String, default: 'Découvrez tous nos services administratifs' },
  
  // Contact Info
  showContactInfo: { type: Boolean, default: true },
  contactTitle: { type: String, default: 'Besoin d\'aide ?' },
  contactSubtitle: { type: String, default: 'Notre équipe est disponible du lundi au vendredi' },
  
  // Global Info Alert
  showAlert: { type: Boolean, default: true },
  alertText: { type: String, default: 'Mairie ouverte du lundi au vendredi de 8h à 16h30' },
  alertType: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  
  // SEO
  metaTitle: { type: String, default: 'Accueil - Commune de Dembéni' },
  metaDescription: { type: String, default: 'Portail administratif de la Commune de Dembéni' },
  
  // Tracking
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

module.exports = mongoose.model('HeroSection', heroSectionSchema);
