const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Site Information
  siteName: { type: String, default: 'Commune de Dembéni' },
  siteDescription: { type: String, default: 'Portail administratif de la Commune de Dembéni' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  
  // Contact Information
  contactEmail: { type: String, default: 'contact@dembeni.fr' },
  contactPhone: { type: String, default: '+262 XXX XXX XXX' },
  contactPhone2: { type: String, default: '' },
  address: { type: String, default: 'Dembéni, Île de Mayotte' },
  mapLocation: { type: String, default: '' }, // Google Maps embed URL
  
  // Opening Hours
  openingHours: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    open: { type: String, default: '08:00' }, // HH:mm format
    close: { type: String, default: '16:30' },
    isClosed: { type: Boolean, default: false }
  }],
  
  // Social Networks
  socialNetworks: [{
    platform: { type: String, enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] },
    url: { type: String }
  }],
  
  // Footer Information
  footerText: { type: String, default: '© 2026 Commune de Dembéni. Tous droits réservés.' },
  footerLinks: [{
    title: String,
    url: String
  }],
  
  // Global Settings
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Site en maintenance. Veuillez revenir plus tard.' },
  
  // Email Settings
  emailNotificationsEnabled: { type: Boolean, default: true },
  
  // Updated tracking
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

// Ensure only one settings document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
