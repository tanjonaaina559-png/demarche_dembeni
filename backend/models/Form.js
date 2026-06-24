const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['civil', 'documents', 'enfance', 'logement', 'urbanisme', 'ecologie', 'autre'],
    default: 'autre'
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String, default: '' },
  fileSize: { type: String, default: '' },
  downloads: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
