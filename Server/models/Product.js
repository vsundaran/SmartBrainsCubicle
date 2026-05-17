const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, required: true },
  contents: { type: String, required: true },
  materials: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Velcro Binders', 'Flashcards', 'Activity Books']
  },
  minAgeMonths: { type: Number, required: true, min: 0 },
  maxAgeMonths: { type: Number, required: true, max: 84 },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  videoUrl: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
