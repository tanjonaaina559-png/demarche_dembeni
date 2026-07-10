const mongoose = require('mongoose');

/**
 * OfficialPdfTemplate — stores admin-uploaded PDF templates
 * and associates them with a procedure.
 */
const officialPdfTemplateSchema = new mongoose.Schema({
  procedureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Procedure',
    default: null,
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  templateFile: {
    type: String, // Cloudinary URL: https://res.cloudinary.com/...
    required: [true, 'Le fichier PDF est requis'],
    validate: {
      validator: (v) => !v || v.startsWith('https://res.cloudinary.com/'),
      message: 'templateFile doit être une URL Cloudinary valide (https://res.cloudinary.com/...)',
    },
  },
  fileName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  // Visual Mapping for dynamic fields
  mapping: [{
    key: String,       // 'nom', 'prenom', 'date', etc.
    x: Number,
    y: Number,
    page: { type: Number, default: 1 }, // 1-indexed
    size: { type: Number, default: 12 },
    font: { type: String, default: 'Helvetica' },
    type: { type: String, default: 'text' }
  }],
  isDemonstration: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('OfficialPdfTemplate', officialPdfTemplateSchema);
