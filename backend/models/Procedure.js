const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  value: { type: String, default: '' },
  label: { type: String, default: '' },
  icon: { type: String, default: '' }
}, { _id: false });

const featureSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  type: { type: String, enum: ['accepted', 'refused', 'neutral'], default: 'neutral' },
  items: [{ type: String }]
}, { _id: false });

const documentSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  required: { type: Boolean, default: false }
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'date', 'number', 'email', 'tel', 'textarea', 'select'], default: 'text' },
  required: { type: Boolean, default: false },
  options: [{ type: String }]
}, { _id: false });

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const actionSchema = new mongoose.Schema({
  icon: { type: String, default: '' },
  text: { type: String, default: '' }
}, { _id: false });

const procedureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, unique: true },
  category: { type: String, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, default: '' },
  detailedDescription: { type: String, trim: true },
  image: { type: String, default: '' },
  backgroundImage: { type: String, default: '' },
  statistics: [statisticSchema],
  features: [featureSchema],
  documents: [documentSchema],
  requiredFields: [fieldSchema],
  steps: [stepSchema],
  actions: [actionSchema],
  duration: { type: String, default: '' },
  price: { type: String, default: 'Gratuit' },
  status: { type: String, default: 'active' },
  buttonText: { type: String, default: 'Faire la demande' },
  buttonLink: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save hook to generate slug if not present
procedureSchema.pre('save', function() {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD') // remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Virtuals to ensure compatibility with any old fields
procedureSchema.virtual('processingTime').get(function() {
  return this.duration;
}).set(function(v) {
  this.duration = v;
});

procedureSchema.virtual('fees').get(function() {
  return this.price;
}).set(function(v) {
  this.price = v;
});

procedureSchema.virtual('active').get(function() {
  return this.isActive;
}).set(function(v) {
  this.isActive = v;
});

procedureSchema.virtual('requiredDocs').get(function() {
  return this.documents ? this.documents.map(d => d.name) : [];
}).set(function(docs) {
  if (Array.isArray(docs)) {
    this.documents = docs.map(d => typeof d === 'string' ? { name: d, required: true } : d);
  }
});

procedureSchema.set('toJSON', { virtuals: true });
procedureSchema.set('toObject', { virtuals: true });

procedureSchema.index({ category: 1 });
procedureSchema.index({ isActive: 1 });

module.exports = mongoose.model('Procedure', procedureSchema);
