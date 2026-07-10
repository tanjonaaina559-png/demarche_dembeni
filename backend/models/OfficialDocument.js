const mongoose = require('mongoose');

const officialDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['Etat civil', 'Documents officiels', 'Urbanisme', 'Enfance et loisirs', 'Ecologie', 'Logement'],
  },
  fileName: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v) => !v || v.startsWith('https://res.cloudinary.com/'),
      message: 'pdfUrl doit être une URL Cloudinary valide (https://res.cloudinary.com/...)',
    },
  },
  size: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('OfficialDocument', officialDocumentSchema);
