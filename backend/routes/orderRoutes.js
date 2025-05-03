const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET all orders (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const orders = await Purchase.find()
            .sort({ purchaseDate: -1 }) // Show newest orders first
            .populate('userId', 'username email'); // Get user details

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
});

// GET order details by ID (admin only)
router.get('/:id', verifyAdmin, async (req, res) => {
    try {
        const order = await Purchase.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Server error while fetching order details' });
    }
});

// UPDATE order status (admin only)
router.put('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const order = await Purchase.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error while updating order status' });
    }
});

// DELETE an order (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const order = await Purchase.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error while deleting order' });
    }
});

module.exports = router;