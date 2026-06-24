const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'Général' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  helpful: { type: Number, default: 0 },
  notHelpful: { type: Number, default: 0 },
  relatedService: { type: mongoose.Schema.Types.ObjectId, ref: 'Procedure', default: null },
  tags: [{ type: String }],
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

faqSchema.index({ category: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
