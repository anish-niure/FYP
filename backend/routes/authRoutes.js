const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const User = require('../models/User');
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
  const { firstName, lastName, email, password, phoneNumber, gender, confirmPassword, location } = req.body;

  // Combine firstName and lastName into username for backward compatibility
  const username = `${firstName} ${lastName}`;

  try {
    // Validate phone number
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits long.' });
    }

    // Validate gender
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender option selected.' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 5 characters long, contain at least one number, and one special character (!, @, #, $, etc.).',
      });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create new user with additional fields
    const newUser = new User({ firstName, lastName, username, email, password, phoneNumber, gender, location, role: 'user' });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send welcome email
    const msg = {
      to: email,
      from: 'niureanish@gmail.com',
      subject: 'Welcome to Moon Beauty Salon',
      text: `Hi ${username},\n\nWelcome to Moon Beauty Salon! We're excited to have you on board.`,
      html: `<p>Hi ${username},</p><p>Welcome to Moon Beauty Salon! We're excited to have you on board.</p>`,
    };

    const result = await sgMail.send(msg);
    console.log('Welcome email sent to:', email, result);

    res.status(201).json({
      token,
      user: { id: newUser._id, username, email, role: newUser.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.response) console.error('SendGrid response:', err.response.body);
    res.status(500).json({ message: 'Server error during signup.', error: err.message });
  }
});

// Login Route (Updated to return user data)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const userRole = user.role || 'user';
    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('User logged in:', email, 'Role:', userRole);
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: userRole },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.', error: err.message });
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