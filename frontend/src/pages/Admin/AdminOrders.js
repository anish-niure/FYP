import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusLoading, setStatusLoading] = useState(null); // Track which order is being updated
    const [deleteLoading, setDeleteLoading] = useState(null); // Track which order is being deleted

    // List of possible order statuses
    const orderStatuses = [
        'Pending', 
        'Processing', 
        'Packed', 
        'Ready for Pickup', 
        'Shipped', 
        'Delivered', 
        'Cancelled'
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to view orders.');
                setLoading(false);
                return;
            }

            const response = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || 'Failed to fetch orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        setStatusLoading(orderId);
        setSuccess('');
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to update orders.');
                setStatusLoading(null);
                return;
            }

            const response = await axios.put(
                `/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update order in state
            setOrders(orders.map(order => 
                order._id === orderId ? response.data.order : order
            ));
            
            setSuccess(`Order status updated to ${newStatus}`);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.response?.data?.message || 'Failed to update order status. Please try again.');
        } finally {
            setStatusLoading(null);
        }
    };

    // Delete order
    const handleDeleteOrder = async (orderId) => {
        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        setDeleteLoading(orderId);
        setSuccess('');
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to delete orders.');
                setDeleteLoading(null);
                return;
            }

            await axios.delete(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove order from state
            setOrders(orders.filter(order => order._id !== orderId));
            setSuccess('Order deleted successfully');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting order:', error);
            setError(error.response?.data?.message || 'Failed to delete order. Please try again.');
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="admin-orders">
            <h1>Order Management</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {loading ? (
                <p className="loading-message">Loading orders...</p>
            ) : orders.length === 0 ? (
                <p className="no-orders-message">No orders found.</p>
            ) : (
                <div className="orders-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Customer</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Order Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id.substring(order._id.length - 8)}</td>
                                    <td>{order.productName}</td>
                                    <td>{order.userId ? order.userId.username : 'Unknown User'}</td>
                                    <td>{order.quantity}</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>{formatDate(order.purchaseDate)}</td>
                                    <td>
                                        <select 
                                            value={order.status || 'Pending'}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            disabled={statusLoading === order._id}
                                            className={`status-dropdown status-${(order.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}
                                        >
                                            {orderStatuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => handleDeleteOrder(order._id)}
                                            disabled={deleteLoading === order._id}
                                        >
                                            {deleteLoading === order._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;