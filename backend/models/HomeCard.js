const mongoose = require('mongoose');

const homeCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  icon: { type: String },
  informations: { type: [String] },
  statistics: { type: mongoose.Schema.Types.Mixed },
  actions: { type: mongoose.Schema.Types.Mixed },
  buttonText: { type: String },
  buttonLink: { type: String },
  slug: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HomeCard', homeCardSchema);
