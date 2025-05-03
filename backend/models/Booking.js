const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }], // Changed to array
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    locationType: { type: String, enum: ['Home', 'Salon'], required: true },
    dateTime: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    duration: { type: Number, default: 45 }, // Duration in minutes
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);