const mongoose = require('mongoose');

const citizenDocumentSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  formData: {
    nom: { type: String, default: '' },
    prenom: { type: String, default: '' },
    dateNaissance: { type: String, default: '' },
    lieuNaissance: { type: String, default: '' },
    adresse: { type: String, default: '' },
    telephone: { type: String, default: '' },
    cin: { type: String, default: '' },
    nationalite: { type: String, default: 'Mahoraise' },
    profession: { type: String, default: '' },
    nomPere: { type: String, default: '' },
    nomMere: { type: String, default: '' }
  },
  pdfUrl: { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
  isDemo: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('CitizenDocument', citizenDocumentSchema);
