const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User'); // adjust if file path is different

// Get all users - admin only
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username email role isBlocked');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

module.exports = router;