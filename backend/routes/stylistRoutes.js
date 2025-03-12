const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Stylist-only route
router.get('/appointments', authenticate, authorize(['stylist']), (req, res) => {
  res.status(200).json({ message: 'Welcome to the Stylist Appointments Page!' });
});

module.exports = router;