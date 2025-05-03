const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stylist = require('../models/Stylist');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;

// Get all stylists (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const stylists = await Stylist.find();
    res.json(stylists);
  } catch (error) {
    console.error('Error fetching stylists:', error);
    res.status(500).json({ message: 'Server error while fetching stylists', error: error.message });
  }
});

// Create a new stylist (admin only)
router.post('/create', verifyAdmin, async (req, res) => {
  const { username, email, password } = req.body;
  const file = req.files?.image;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
  }

  // Validate file type if provided
  if (file && !['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return res.status(400).json({ message: 'Only JPEG/PNG images are allowed' });
  }

  try {
    console.log('Creating stylist with:', { username, email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingStylist = await Stylist.findOne({ email });
    if (existingStylist) {
      return res.status(400).json({ message: 'Stylist with this email already exists' });
    }

    const existingUsername = await Stylist.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image to Cloudinary if provided
    let imageUrl = '';
    if (file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'stylists',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.data);
      });
      imageUrl = result.secure_url;
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'stylist',
    });
    await newUser.save();

    // Create new stylist
    const newStylist = new Stylist({
      username,
      email,
      userId: newUser._id,
      imageUrl,
    });
    await newStylist.save();

    res.status(201).json({ message: 'Stylist created successfully' });
  } catch (error) {
    console.error('Error creating stylist:', error);
    res.status(500).json({ message: 'Server error while creating stylist', error: error.message });
  }
});

// Update a stylist (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { username, email } = req.body;
  try {
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      console.log('Stylist not found:', req.params.id);
      return res.status(404).json({ message: 'Stylist not found' });
    }

    const user = await User.findById(stylist.userId);
    if (!user) {
      console.log('Associated user not found:', stylist.userId);
      return res.status(404).json({ message: 'Associated user not found' });
    }

    // Check if the new email is already taken by another user
    if (email && email !== stylist.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already taken in User collection:', email);
        return res.status(400).json({ message: 'Email is already taken' });
      }
      const existingStylist = await Stylist.findOne({ email });
      if (existingStylist && existingStylist._id.toString() !== stylist._id.toString()) {
        console.log('Email already taken in Stylist collection:', email);
        return res.status(400).json({ message: 'Email is already taken by another stylist' });
      }
    }

    // Check if the new username is already taken by another stylist
    if (username && username !== stylist.username) {
      const existingUsername = await Stylist.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== stylist._id.toString()) {
        console.log('Username already taken:', username);
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Update Stylist model
    stylist.username = username || stylist.username;
    stylist.email = email || stylist.email;
    await stylist.save();
    console.log('Stylist updated:', stylist._id);

    // Update User model if email changed
    if (email && email !== user.email) {
      user.email = email;
      await user.save();
      console.log('User email updated:', user._id);
    }

    res.json({ message: 'Stylist updated successfully' });
  } catch (error) {
    console.error('Error updating stylist:', error);
    res.status(500).json({ message: 'Server error while updating stylist', error: error.message });
  }
});

// Delete a stylist (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      console.log('Stylist not found:', req.params.id);
      return res.status(404).json({ message: 'Stylist not found' });
    }

    const user = await User.findById(stylist.userId);
    if (!user) {
      console.log('Associated user not found:', stylist.userId);
      return res.status(404).json({ message: 'Associated user not found' });
    }

    // Delete image from Cloudinary if it exists
    if (stylist.imageUrl) {
      const publicId = stylist.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`stylists/${publicId}`);
      console.log('Image deleted from Cloudinary:', publicId);
    }

    // Delete both the stylist and the associated user
    await Stylist.findByIdAndDelete(req.params.id);
    console.log('Stylist deleted:', req.params.id);
    await User.findByIdAndDelete(stylist.userId);
    console.log('Associated user deleted:', stylist.userId);

    res.json({ message: 'Stylist deleted successfully' });
  } catch (error) {
    console.error('Error deleting stylist:', error);
    res.status(500).json({ message: 'Server error while deleting stylist', error: error.message });
  }
});

// Reset stylist password (admin only)
router.put('/:id/reset-password', verifyAdmin, async (req, res) => {
  const { password } = req.body;
  try {
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      console.log('Stylist not found:', req.params.id);
      return res.status(404).json({ message: 'Stylist not found' });
    }

    const user = await User.findById(stylist.userId);
    if (!user) {
      console.log('Associated user not found:', stylist.userId);
      return res.status(404).json({ message: 'Associated user not found' });
    }

    // Hash the new password and update the User model
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    console.log('User password reset:', user._id);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error while resetting password', error: error.message });
  }
});

// Get public stylists
router.get('/public', async (req, res) => {
  try {
    const stylists = await Stylist.find().populate('userId', 'username role description');
    res.json(stylists);
  } catch (error) {
    console.error('Error fetching public stylists:', error);
    res.status(500).json({ message: 'Failed to fetch stylists.' });
  }
});

module.exports = router;