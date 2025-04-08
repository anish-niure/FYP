// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const { verifyAdmin } = require('../middleware/authMiddleware');

// // GET all stylists
// router.get('/stylists', verifyAdmin, async (req, res) => {
//     try {
//         const stylists = await User.find({ role: 'stylist' }).select('username email');
//         res.json(stylists);
//     } catch (err) {
//         res.status(500).json({ message: 'Failed to fetch stylists.' });
//     }
// });

// // POST create a new stylist
// router.post('/create-stylist', verifyAdmin, async (req, res) => {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//         return res.status(400).json({ message: 'All fields are required.' });
//     }

//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const user = new User({
//             username,
//             email,
//             password: hashedPassword,
//             role: 'stylist',
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         });

//         await user.save();
//         res.status(201).json({ 
//             message: 'Stylist created successfully!', 
//             user: { id: user._id, username: user.username, email: user.email, role: user.role } 
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error during stylist creation.' });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Get all users (Admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username email role createdAt isBlocked');
    console.log('Fetched users:', users);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Update user information (Admin)
router.put('/update-user/:id', verifyAdmin, async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    );
    console.log('Updated user:', updatedUser);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// Delete user (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => { // Changed from '/users/:id' to '/:id'
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await User.findByIdAndDelete(req.params.id);
    console.log('Deleted user ID:', req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// Block/unblock user (Admin)
router.patch('/block-user/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.isBlocked = !user.isBlocked; // Toggle blocked status
    await user.save();
    console.log(`User ${user.isBlocked ? 'blocked' : 'unblocked'}:`, user._id);
    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', user });
  } catch (err) {
    console.error('Error blocking/unblocking user:', err.message);
    res.status(500).json({ message: 'Failed to block/unblock user.' });
  }
});

// Reset user password (Admin)
router.put('/reset-password/:id', verifyAdmin, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    );
    console.log('Password reset for user:', updatedUser._id);
    res.json({ message: 'Password reset successfully', user: updatedUser });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});

module.exports = router;