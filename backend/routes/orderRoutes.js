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

        // Update order status and populate user info for email
        const order = await Purchase.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If the status was changed from "Pending" to "Shipped" or "Cancelled",
        // send an email notification to the user
        if (['Shipped', 'Cancelled'].includes(status)) {
            const { sendEmail } = require('../utils/emailService');
            const subject = `Order Update - Your Order is now ${order.status}`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 10px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #d4af37;">The Moon Salon</h1>
                  </div>
                  <p>Hello ${order.userId.username},</p>
                  <p>Your order for <strong>${order.productName}</strong> (x${order.quantity}) has been updated to <strong>${order.status}</strong>.</p>
                  <p>If you have any questions, please contact our support.</p>
                </div>
            `;
            
            // Send the notification email (ignore failure to send so admin updates still succeed)
            sendEmail(order.userId.email, subject, htmlContent)
                .then(success => {
                    if (success) {
                        console.log(`Order status update email sent successfully to ${order.userId.email}`);
                    } else {
                        console.error(`Failed to send order status update email to ${order.userId.email}`);
                    }
                })
                .catch(err => console.error('Error sending order status update email:', err));
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