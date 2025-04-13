import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminStylists.css';

const AdminStylists = () => {
    const [stylists, setStylists] = useState([]);
    const [newStylist, setNewStylist] = useState({
        username: '',
        email: '',
        password: '',
        image: null,
    });
    const [editStylist, setEditStylist] = useState(null);
    const [resetPassword, setResetPassword] = useState({ id: null, password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchStylists = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/stylists', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStylists(response.data.map(stylist => ({
                ...stylist,
                imageUrl: stylist.imageUrl || 'https://via.placeholder.com/150', // Fallback image
            })));
        } catch (err) {
            console.error('Error fetching stylists:', err);
            setError(err.response?.data?.message || 'Failed to load stylists.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        fetchStylists();
    }, [token, navigate, fetchStylists]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editStylist) {
            setEditStylist(prev => ({ ...prev, [name]: value }));
        } else {
            setNewStylist(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (editStylist) {
            setEditStylist(prev => ({ ...prev, image: file }));
        } else {
            setNewStylist(prev => ({ ...prev, image: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const formData = new FormData();
            formData.append('username', editStylist ? editStylist.username : newStylist.username);
            formData.append('email', editStylist ? editStylist.email : newStylist.email);
            if (!editStylist) {
                formData.append('password', newStylist.password);
            }
            if ((editStylist && editStylist.image) || newStylist.image) {
                formData.append('image', (editStylist && editStylist.image) || newStylist.image);
            }

            if (editStylist) {
                await axios.put(`/api/stylists/${editStylist._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setEditStylist(null);
                setSuccess('Stylist updated successfully!');
            } else {
                if (!newStylist.password) {
                    setError('Password is required for new stylists.');
                    return;
                }
                await axios.post('/api/stylists/create', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setNewStylist({ username: '', email: '', password: '', image: null });
                setSuccess('Stylist created successfully!');
            }

            fetchStylists();
        } catch (err) {
            console.error('Error adding/updating stylist:', err);
            setError(err.response?.data?.message || 'Failed to add/update stylist.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (stylist) => {
        setEditStylist({
            ...stylist,
            image: null, // Reset image to avoid sending old image unless updated
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this stylist?')) return;
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            await axios.delete(`/api/stylists/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Stylist deleted successfully!');
            fetchStylists();
        } catch (err) {
            console.error('Error deleting stylist:', err);
            setError(err.response?.data?.message || 'Failed to delete stylist.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetPassword.id || !resetPassword.password) {
            setError('Please select a stylist and enter a new password.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            await axios.put(`/api/stylists/${resetPassword.id}/reset-password`, {
                password: resetPassword.password,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Password reset successfully!');
            setResetPassword({ id: null, password: '' });
        } catch (err) {
            console.error('Error resetting password:', err);
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const openResetPassword = (id) => {
        setResetPassword({ id, password: '' });
    };

    return (
        <div className="admin-stylists">
            <h1>Manage Stylists</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {loading && <div className="loading">Loading...</div>}

            <form onSubmit={handleSubmit} className="stylist-form">
                <h2>{editStylist ? 'Edit Stylist' : 'Create New Stylist'}</h2>
                <div className="form-input">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={editStylist ? editStylist.username : newStylist.username}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-input">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={editStylist ? editStylist.email : newStylist.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                {!editStylist && (
                    <div className="form-input">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={newStylist.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                )}
                <div className="form-input">
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Processing...' : editStylist ? 'Update Stylist' : 'Create Stylist'}
                </button>
                {editStylist && (
                    <button
                        type="button"
                        onClick={() => setEditStylist(null)}
                        className="cancel-btn"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {resetPassword.id && (
                <form onSubmit={handleResetPassword} className="reset-password-form">
                    <h2>Reset Password</h2>
                    <div className="form-input">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={resetPassword.password}
                            onChange={(e) => setResetPassword({ ...resetPassword, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setResetPassword({ id: null, password: '' })}
                        className="cancel-btn"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div className="stylists-list">
                <h2>Existing Stylists</h2>
                {stylists.length === 0 ? (
                    <p>No stylists available.</p>
                ) : (
                    stylists.map(stylist => (
                        <div key={stylist._id} className="stylist-card">
                            <img
                                src={stylist.imageUrl}
                                alt={stylist.username}
                                className="stylist-image"
                            />
                            <h3>{stylist.username}</h3>
                            <p>{stylist.email}</p>
                            <button
                                onClick={() => handleEdit(stylist)}
                                className="edit-btn"
                                disabled={loading}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(stylist._id)}
                                className="delete-btn"
                                disabled={loading}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => openResetPassword(stylist._id)}
                                className="reset-btn"
                                disabled={loading}
                            >
                                Reset Password
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminStylists;