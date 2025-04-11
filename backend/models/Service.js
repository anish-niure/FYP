// backend/models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priceRange: { type: String, required: true },
  imageUrl: { type: String, required: false },  // Image URL field
});

module.exports = mongoose.model('Service', serviceSchema);