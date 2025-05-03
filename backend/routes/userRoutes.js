const express = require('express');
const router = express.Router();
const { authenticate, verifyAdmin, verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Notification = require('../models/Notification');
const Stylist = require('../models/Stylist');
const path = require('path');

// Add this near the top of your file
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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
router.post('/update', authenticate, async (req, res) => {
  try {
    console.log('Incoming request body:', req.body);
    console.log('Incoming files:', req.files);

    const { username, phoneNumber, gender, location, email } = req.body;
    const userId = req.user.id;
    
    // Get the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prepare updates - explicitly set each field
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (gender !== undefined) updates.gender = gender.toLowerCase();
    if (location !== undefined) updates.location = location;
    if (email !== undefined && email !== currentUser.email) {
      // Check for email uniqueness
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      updates.email = email;
    }
    
    // Handle image upload
    if (req.files && req.files.profilePicture) {
      try {
        const file = req.files.profilePicture;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'profile_pictures',
        });
        updates.profilePicture = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary error:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload profile picture.' });
      }
    }

    console.log('Applying updates:', updates);
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    console.log('Updated user:', updatedUser);

    // If user is a stylist, update stylist document too
    if (currentUser.role === 'stylist') {
      const stylist = await Stylist.findOne({ email: currentUser.email });
      if (stylist) {
        const stylistUpdates = {};
        if (username !== undefined) stylistUpdates.username = username;
        if (email !== undefined) stylistUpdates.email = email;
        
        if (Object.keys(stylistUpdates).length > 0) {
          await Stylist.updateOne(
            { _id: stylist._id },
            { $set: stylistUpdates }
          );
        }
      }
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.', details: error.message });
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