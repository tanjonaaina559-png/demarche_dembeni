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
