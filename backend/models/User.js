const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
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
    enum: ['admin', 'stylist', 'user'],
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('User', userSchema);