const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: false }, // Add imageUrl field
});

module.exports = mongoose.model('Stylist', stylistSchema);