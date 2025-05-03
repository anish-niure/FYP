const express = require('express');
const router = express.Router();
const { authenticate, verifyAdmin, verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Notification = require('../models/Notification');
const Stylist = require('../models/Stylist');
const path = require('path');

// Configure multer with disk storage and file limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed.'));
  },
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 5 MB limit.' });
    }
    return res.status(400).json({ message: 'Multer error.', details: err.message });
  }
  if (err.message === 'Only JPEG and PNG images are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

// Get all users - admin only
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username email role isBlocked');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.', details: error.message });
  }
});

// Update user profile
router.post('/update', authenticate, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    console.log('Incoming request body:', req.body);
    console.log('Incoming file:', req.file);

    const { username, phoneNumber, gender, location, email } = req.body;
    const userId = req.user.id;

    // Validate input fields
    if (!username && !phoneNumber && !gender && !location && !email && !req.file) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    // Validate gender if provided
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value. Must be Male, Female, or Other.' });
    }

    // Prepare updates
    const updates = {};
    if (username) updates.username = username; // Virtual field sets firstName and lastName
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (gender) updates.gender = gender;
    if (location) updates.location = location;
    if (email) {
      // Check for email uniqueness
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      updates.email = email;
    }

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
        });
        updates.profilePicture = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload image to Cloudinary.', details: cloudinaryError.message });
      }
    }

    console.log('Prepared updates:', updates);

    // Update the user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('Updated user:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error.', details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error.', details: error.message });
    }
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ message: 'Cloudinary upload error.', details: error.message });
    }
    return res.status(500).json({ message: 'Failed to update user.', details: error.message });
  }
});

// Update user profile (secondaryRole and description for stylists)
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { secondaryRole, description } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If the user is a stylist, update secondaryRole and description
    if (user.role === 'stylist') {
      const stylist = await Stylist.findOne({ userId: user._id });
      if (!stylist) {
        return res.status(404).json({ message: 'Stylist profile not found.' });
      }

      if (secondaryRole) stylist.secondaryRole = secondaryRole;
      if (description) stylist.description = description;

      await stylist.save();
    }

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.', details: error.message });
  }
});

// Fetch notifications for a user or role
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { role } = req.user;
    const notifications = await Notification.find({
      $or: [
        { userId: req.user.id },
        { role },
      ],
    }).sort({ date: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.', details: error.message });
  }
});

module.exports = router;