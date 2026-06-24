const mongoose = require('mongoose');

const footerSettingsSchema = new mongoose.Schema({
  // Brand
  brandName: { type: String, default: 'DEMBÉNI' },
  brandDescription: { type: String, default: 'Portail citoyen officiel de la commune de Dembéni, Mayotte. Simplifiez vos démarches administratives en ligne, en toute sécurité.' },
  
  // Social Networks
  socialLinks: [{
    platform: { type: String, default: '' },
    url: { type: String, default: '#' },
    icon: { type: String, default: '' }
  }],
  
  // Navigation Column
  navigationLinks: [{
    label: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  
  // Services Column
  servicesLinks: [{
    label: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  
  // Contact Info
  address: { type: String, default: 'Mairie de Dembéni, Mayotte 97680' },
  phone: { type: String, default: '+262 269 XX XX XX' },
  email: { type: String, default: 'dembenimairie@gmail.com' },
  openingHours: { type: String, default: 'Lun–Ven · 8h00 – 16h30' },
  
  // Bottom Bar
  copyrightText: { type: String, default: '© 2026 Mairie de Dembéni — Tous droits réservés' },
  legalLinks: [{
    label: { type: String, default: '' },
    url: { type: String, default: '#' }
  }],
  
  // Help/CTA Section (green band above footer)
  ctaTitle: { type: String, default: 'Besoin d\'aide pour vos démarches ?' },
  ctaDescription: { type: String, default: 'Notre équipe est disponible pour vous accompagner et répondre à toutes vos questions.' },
  ctaButtons: [{
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    icon: { type: String, default: '' },
    variant: { type: String, default: 'primary' }
  }],
  
  // Display
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);
