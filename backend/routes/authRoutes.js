const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const User = require('../models/User');
const Stylist = require('../models/Stylist');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test Email Route (for debugging SendGrid)
router.post('/test-email', async (req, res) => {
  const { to } = req.body;
  try {
    const msg = {
      to: to || 'niureanish@gmail.com',
      from: 'niureanish@gmail.com',
      subject: 'Test Email from SendGrid',
      text: 'This is a test email sent from your backend.',
      html: '<p>This is a test email sent from your backend.</p>',
    };

    const result = await sgMail.send(msg);
    console.log('Test email sent successfully:', result);
    res.status(200).json({ message: 'Test email sent successfully.', result });
  } catch (err) {
    console.error('Test email error:', err);
    if (err.response) console.error('SendGrid response:', err.response.body);
    res.status(500).json({ message: 'Failed to send test email.', error: err.message });
  }
});

// Signup Route (for regular users)
router.post('/signup', async (req, res) => {
  try {
    let { username, email, password, gender, phoneNumber, location } = req.body;
    
    // Trim and normalize username and email
    username = username.trim();
    email = email.trim().toLowerCase();

    // Check if user already exists in User collection (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, 'i') },
        { username: new RegExp(`^${username}$`, 'i') }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email.toLowerCase() === email ? 'Email already in use.' : 'Username already taken.'
      });
    }
    
    // Also check Stylist collection for duplicates (case-insensitive)
    const existingStylist = await Stylist.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, 'i') },
        { username: new RegExp(`^${username}$`, 'i') }
      ]
    });
    if (existingStylist) {
      return res.status(400).json({
        message: existingStylist.email.toLowerCase() === email ? 'Email already in use.' : 'Username already taken.'
      });
    }
    
    // Create new user with gender value converted to lowercase
    const newUser = new User({
      username,
      email,
      password, // Password will be hashed by the pre-save hook
      gender: gender ? gender.toLowerCase() : '',
      phoneNumber,
      location
    });
    
    await newUser.save();
    
    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    // Return success response with token and user info
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        gender: newUser.gender,
        phoneNumber: newUser.phoneNumber,
        location: newUser.location
      }
    });
  } catch (error) {
    console.warn('Signup error:', error);
    res.status(500).json({ message: 'Error registering new user', error: error.message });
  }
});

// Login Route (Updated to return user data)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email (this should work for any role)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Create token - ensure role is included in payload
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role  // Make sure role is included in the token
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Log the successful login with role information
    console.log(`User logged in successfully: ${user.email} (${user.role})`);
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    console.log('Forgot password request for:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log('Reset token saved for:', email, 'Token:', resetToken);

    // Send reset email
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const msg = {
      to: email,
      from: 'niureanish@gmail.com',
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetLink}\nThis link expires in 1 hour.`,
      html: `<p>You requested a password reset. Click <a href="${resetLink}">${resetLink}</a> to reset your password.</p><p>This link expires in 1 hour.</p>`,
    };

    const result = await sgMail.send(msg);
    console.log('Reset email sent to:', email, result);
    res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    if (err.response) console.error('SendGrid response:', err.response.body);
    res.status(500).json({ message: 'Failed to send reset email. Try again later.', error: err.message });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      console.log('Invalid or expired reset token:', token);
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for:', user.email);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error during password reset.', error: err.message });
  }
});

// Get Current User (Protected Route)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found in /me route:', req.user.id);
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;