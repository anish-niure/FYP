import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/StylistDashboard.css';

const StylistDashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [stylistInfo, setStylistInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Fetch stylist profile
        axios
            .get('http://localhost:5001/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setStylistInfo(response.data);
                setName(response.data.username);
                setError('');
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile. Please log in again.');
                localStorage.removeItem('token');
                navigate('/');
            });

        // Fetch stylist bookings
        axios
            .get('http://localhost:5001/api/bookings/stylist', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setBookings(response.data);
                setError('');
            })
            .catch((error) => {
                console.error('Error fetching bookings:', error);
                setError('Failed to load bookings.');
            });
    }, [navigate]);

    const handleApprove = async (bookingId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `http://localhost:5001/api/bookings/${bookingId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(
                bookings.map((booking) =>
                    booking._id === bookingId ? response.data.booking : booking
                )
            );
            setError('');
        } catch (error) {
            console.error('Error approving booking:', error);
            setError(error.response?.data?.message || 'Failed to approve booking.');
        }
    };

    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                'http://localhost:5001/api/user/update',
                { username: name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStylistInfo(response.data.user);
            setEditMode(false);
            setError('');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile.');
        }
    };

    if (!stylistInfo) return <p>Loading...</p>;

    return (
        <div className="stylist-dashboard">
            <h1>Stylist Dashboard</h1>
            {error && <p className="error">{error}</p>}

            <div className="profile-section">
                <h2>Your Profile</h2>
                {editMode ? (
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="edit-input"
                            placeholder="Enter your name"
                        />
                        <button onClick={handleSaveProfile} className="save-button">
                            Save
                        </button>
                        <button onClick={() => setEditMode(false)} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div>
                        <p><strong>Name:</strong> {stylistInfo.username}</p>
                        <p><strong>Email:</strong> {stylistInfo.email}</p>
                        <button onClick={() => setEditMode(true)} className="edit-button">
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>

            <div className="bookings-section">
                <h2>Upcoming Bookings</h2>
                {bookings.length === 0 ? (
                    <p>No upcoming bookings.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Client</th>
                                <th>Date & Time</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.service}</td>
                                    <td>{booking.userId?.username || 'Unknown'}</td>
                                    <td>{new Date(booking.dateTime).toLocaleString()}</td>
                                    <td>{booking.locationType}</td>
                                    <td>{booking.status}</td>
                                    <td>
                                        {booking.status === 'Pending' && (
                                            <button
                                                onClick={() => handleApprove(booking._id)}
                                                className="approve-button"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StylistDashboard;