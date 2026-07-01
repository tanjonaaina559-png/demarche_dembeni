const mongoose = require('mongoose');

// Auto-incrementing counter for reference numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const requestSchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  procedureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Procedure',
    required: true
  },
  formData: {
    type: Object,
    default: {}
  },
  uploadedFiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedDocument'
  }],
  status: {
    type: String,
    enum: ['En attente', 'Reçue', 'En cours', 'Complément demandé', 'Validée', 'Rejetée', 'Terminée'],
    default: 'En attente'
  },
  adminComment: {
    type: String,
    default: ''
  },
  finalDocument: {
    type: String,
    default: ''
  },
  generatedPdf: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Auto-generate reference number before saving new docs
requestSchema.pre('save', async function () {
  if (!this.isNew || this.referenceNumber) return;
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `request_${year}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  this.referenceNumber = `DEM-${year}-${String(counter.seq).padStart(6, '0')}`;
});

// Indexes for common queries
requestSchema.index({ citizenId: 1, createdAt: -1 });
requestSchema.index({ status: 1 });
requestSchema.index({ procedureId: 1 });

module.exports = mongoose.model('Request', requestSchema);
