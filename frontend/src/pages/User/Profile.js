import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../../assets/images/placeholder.png';
import '../../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Fetch user profile
        axios
            .get('http://localhost:5001/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUser(response.data);
                setName(response.data.username);
                setError('');
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile. Please log in again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
            });

        // Fetch booking history
        axios
            .get('http://localhost:5001/api/bookings/user', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setBookings(response.data);
            })
            .catch((error) => {
                console.error('Error fetching bookings:', error);
                setError('Failed to load booking history.');
            });
    }, [navigate]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleSaveClick = async () => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        if (name !== user.username) formData.append('username', name);
        if (profilePicture) formData.append('profilePicture', profilePicture);

        try {
            const response = await axios.post(
                'http://localhost:5001/api/user/update',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEditMode(false);
            setProfilePicture(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile.');
        }
    };

    const handleImageChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    if (!user && !error) return <p>Loading profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="profile-container">
            <h1>Welcome, {user.username}</h1>
            <div className="profile-info">
                {editMode ? (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="profile-picture-input"
                        />
                        {profilePicture ? (
                            <img
                                src={URL.createObjectURL(profilePicture)}
                                alt="Profile Preview"
                                className="profile-picture"
                            />
                        ) : (
                            <img
                                src={user.profilePicture || placeholderImage}
                                alt="Profile"
                                className="profile-picture"
                            />
                        )}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="edit-input"
                        />
                        <button onClick={handleSaveClick} className="save-button">Save</button>
                        <button onClick={() => setEditMode(false)} className="cancel-button">Cancel</button>
                    </>
                ) : (
                    <>
                        <img
                            src={user.profilePicture || placeholderImage}
                            alt="Profile"
                            className="profile-picture"
                        />
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <button onClick={handleEditClick} className="edit-button">Edit Profile</button>
                    </>
                )}
                <h2>About Me</h2>
                <p>
                    Hello! I’m {user.username}, a valued client of Moon's Salon. I enjoy
                    our premium beauty services!
                </p>
            </div>

            <div className="booking-history">
                <h2>Booking History</h2>
                {bookings.length === 0 ? (
                    <p>No bookings yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Stylist</th>
                                <th>Date/Time</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.service}</td>
                                    <td>{booking.stylist}</td>
                                    <td>{new Date(booking.dateTime).toLocaleString()}</td>
                                    <td>{booking.locationType}</td>
                                    <td>{booking.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="purchases-section">
                <h2>Purchases</h2>
                <p>No purchases yet. Visit the <Link to="/store">store</Link> to explore products!</p>
            </div>

            <button onClick={handleLogout} className="logout-button profile-logout">
                Logout
            </button>
        </div>
    );
};

export default Profile;