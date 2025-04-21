// userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, verifyAdmin, verifyToken } = require('../middleware/authMiddleware'); // Fixed import
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Notification = require('../models/Notification'); // Import Notification model
const Stylist = require('../models/Stylist'); // Import the Stylist model

// Configure multer to store the file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Get all users - admin only
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username email role isBlocked');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Update user profile (username and profile picture)
router.post('/update', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id; // From authenticate middleware
    const { username } = req.body;
    let profilePictureUrl = null;

    // Handle image upload to Cloudinary if a file is provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profile_pictures' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      profilePictureUrl = result.secure_url;
    }

    // Prepare updates
    const updates = {};
    if (username) updates.username = username;
    if (profilePictureUrl) updates.profilePicture = profilePictureUrl;

    // Update the user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// Update user profile (secondaryRole and description for stylists)
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const { secondaryRole, description } = req.body;

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is a stylist, update secondaryRole and description
        if (user.role === 'stylist') {
            const stylist = await Stylist.findOne({ userId: user._id });
            if (!stylist) {
                return res.status(404).json({ message: 'Stylist profile not found' });
            }

            if (secondaryRole) stylist.secondaryRole = secondaryRole;
            if (description) stylist.description = description;

            await stylist.save();
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
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
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

module.exports = router;