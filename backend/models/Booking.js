const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: String, required: true },
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    locationType: { type: String, enum: ['Home', 'Salon'], required: true },
    dateTime: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);