const mongoose = require('mongoose');

const generatedDocumentSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  documentType: {
    type: String,
    enum: ['receipt', 'official'],
    required: true
  },
  referenceNumber: {
    type: String,
    required: true,
    unique: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['generated', 'available'],
    default: 'available'
  }
}, { timestamps: true });

// Ensure a citizen can quickly query their documents
generatedDocumentSchema.index({ citizenId: 1, createdAt: -1 });

module.exports = mongoose.model('GeneratedDocument', generatedDocumentSchema);
