const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Make username required for all users
        unique: true,   // Ensure usernames are unique across all users
        trim: true,     // Remove leading/trailing whitespace
      },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'stylist', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: { type: String }, // Add this
  resetPasswordExpires: { type: Date }, // Add this
});

module.exports = mongoose.model('User', userSchema);