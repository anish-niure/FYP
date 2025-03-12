const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin-only route
router.get('/dashboard', authenticate, authorize(['admin']), (req, res) => {
  res.status(200).json({ message: 'Welcome to the Admin Dashboard!' });
});

module.exports = router;