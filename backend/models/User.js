const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Trim whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'stylist'],
    default: 'user',
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
    enum: ['male', 'female', 'other', ''],
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  adminLevel: {
    type: String,
  },
  specializations: [
    {
      type: String,
    },
  ], // Add specializations array for stylists
  secondaryRole: {
    type: String,
  },
  description: {
    type: String,
  },
});

// Password hashing method
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure virtuals are included in toJSON and toObject
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);