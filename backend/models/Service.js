const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priceRange: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;