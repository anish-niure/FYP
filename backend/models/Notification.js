const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  role: { type: String, enum: ['admin', 'stylist', 'user'], required: false },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['order', 'booking', 'general'], default: 'general' },
  link: { type: String, required: false }
});

module.exports = mongoose.model('Notification', notificationSchema);