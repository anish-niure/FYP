const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stylist = require('../models/Stylist');
const bcrypt = require('bcryptjs');
const { verifyAdmin, verifyToken, stylistCheck } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const Notification = require('../models/Notification');

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
  let { username, email, password, secondaryRole, description } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
  }

  try {
    // Log the incoming data
    console.log('Creating stylist with provided data:', { 
      username, 
      email, 
      passwordLength: password ? password.length : 0,
      secondaryRole, 
      description,
      hasImage: req.files && req.files.image ? true : false
    });

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
    if (req.files && req.files.image) {
      const file = req.files.image;
      
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return res.status(400).json({ message: 'Only JPEG/PNG images are allowed' });
      }
      
      try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'stylists',
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
      }
    }

    // Create new user with proper fields to enable login
    const newUser = new User({
      username: String(username),
      email: String(email),
      password: hashedPassword,
      role: 'stylist',
      profilePicture: imageUrl || "",
      isBlocked: false,
      createdAt: new Date(),
      secondaryRole: secondaryRole || '',
      description: description || ''
    });
    
    console.log('About to save user:', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    // Save the user first
    const savedUser = await newUser.save();
    console.log('User saved successfully with ID:', savedUser._id);

    // Create new stylist with reference to the user
    const newStylist = new Stylist({
      username: String(username),
      email: String(email),
      userId: savedUser._id,
      imageUrl,
      secondaryRole: secondaryRole || '',
      description: description || ''
    });
    
    console.log('About to save stylist:', {
      username: newStylist.username,
      email: newStylist.email,
      userId: newStylist.userId,
      secondaryRole: newStylist.secondaryRole
    });
    
    await newStylist.save();
    console.log('Stylist saved successfully');

    res.status(201).json({ 
      message: 'Stylist created successfully',
      stylistId: newStylist._id,
      userId: savedUser._id
    });
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
    console.log('Deleting stylist with ID:', req.params.id);
    
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
      try {
        const publicId = stylist.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`stylists/${publicId}`);
        console.log('Image deleted from Cloudinary:', publicId);
      } catch (imageError) {
        console.error('Error deleting image from Cloudinary:', imageError);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete the stylist and user
    await Stylist.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(stylist.userId);
    
    console.log('Stylist and user deleted successfully');
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

// Get stylist notifications
router.get('/notifications', verifyToken, function(req, res, next) {
  // Inline middleware to replace stylistCheck
  if (req.user.role !== 'stylist') {
    return res.status(403).json({ message: 'Access denied. Stylist only.' });
  }
  next();
}, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id 
    })
    .sort({ date: -1 })
    .limit(20);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching stylist notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// Mark stylist notifications as read
router.put('/notifications/read', verifyToken, async (req, res) => {
  try {
    // Verify the user is a stylist first
    if (req.user.role !== 'stylist') {
      return res.status(403).json({ message: 'Access denied. Stylist only.' });
    }
    
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read.' });
  }
});

module.exports = router;