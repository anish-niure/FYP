const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stylist = require('../models/Stylist');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/authMiddleware');

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
  try {
    console.log('Creating stylist with:', { username, email });

    // Check if user already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists in User collection:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if stylist already exists in Stylist collection
    const existingStylist = await Stylist.findOne({ email });
    if (existingStylist) {
      console.log('Stylist already exists in Stylist collection:', email);
      return res.status(400).json({ message: 'Stylist with this email already exists' });
    }

    // Check if username is taken
    const existingUsername = await Stylist.findOne({ username });
    if (existingUsername) {
      console.log('Username already taken:', username);
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create new user with role 'stylist'
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'stylist',
    });
    await newUser.save();
    console.log('New user created in User collection:', newUser._id);
    // Create new stylist with reference to the user
    const newStylist = new Stylist({
      username,
      email,
      userId: newUser._id,
    });
    await newStylist.save();
    console.log('New stylist created in Stylist collection:', newStylist._id);

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

module.exports = router;