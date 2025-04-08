import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/StylistDashboard.css';

const StylistDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access the dashboard.');
      navigate('/');
      return;
    }

    axios
      .get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('User Info:', response.data); // Debug user ID
        setUserInfo(response.data);
        setUsername(response.data.username);
        setError('');
      })
      .catch((error) => {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setError('Failed to load profile. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      });

    axios
      .get('http://localhost:5001/api/bookings/stylist', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Bookings:', response.data); // Debug bookings
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error.response?.data || error.message);
        setError('Failed to load bookings.');
      });
  }, [navigate]);

  const handleApprove = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Approving booking:', bookingId, 'with token:', token); // Debug
      const response = await axios.put(
        `http://localhost:5001/api/bookings/${bookingId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Approval response:', response.data); // Debug response
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId ? response.data.booking : booking
        )
      );
      setError('');
    } catch (error) {
      console.error('Error approving:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to approve booking.');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        'http://localhost:5001/api/user/update',
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserInfo({ ...userInfo, username: response.data.username });
      setEditMode(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile.');
    }
  };

  if (!userInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div className="stylist-dashboard">
      <h1>Welcome, {userInfo.username}!</h1>
      {error && <p className="error">{error}</p>}

      <div className="profile-section">
        <h2>Your Profile</h2>
        {editMode ? (
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Edit your username"
            />
            <button onClick={handleSave} className="save-button">Save</button>
            <button onClick={() => setEditMode(false)} classClassName="cancel-button">Cancel</button>
          </div>
        ) : (
          <div>
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Role:</strong> {userInfo.role}</p>
            <button onClick={() => setEditMode(true)} className="edit-button">Edit Username</button>
          </div>
        )}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/');
          }}
          className="logout-button"
        >
          Logout
        </button>
      </div>

      <div className="bookings-section">
        <h2>Your Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Client</th>
                <th>Date & Time</th>
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