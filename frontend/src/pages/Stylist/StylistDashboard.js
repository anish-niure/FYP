import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/StylistDashboard.css';

const StylistDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [secondaryRole, setSecondaryRole] = useState('');
  const [description, setDescription] = useState('');

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
        console.log('User Info:', response.data);
        setUserInfo(response.data);
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
        console.log('Bookings for stylist:', response.data); 
        // Check if any bookings were returned
        if (response.data.length === 0) {
          console.log('No bookings found for this stylist');
        } else {
          console.log('First booking:', response.data[0]);
        }
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching stylist bookings:', error.response?.data || error.message);
        setError('Failed to load bookings.');
      });

    const fetchStylistDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/stylists/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecondaryRole(response.data.secondaryRole || '');
        setDescription(response.data.description || '');
      } catch (error) {
        console.error('Error fetching stylist details:', error);
      }
    };

    fetchStylistDetails();
  }, [navigate]);

  const handleApprove = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Approving booking:', bookingId, 'with token:', token);
      const response = await axios.put(
        `http://localhost:5001/api/bookings/${bookingId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Approval response:', response.data);
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

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5001/api/stylists/update-details', {
        secondaryRole,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error updating stylist details:', error);
      alert('Failed to update details.');
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
        <div>
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Role:</strong> {userInfo.role}</p>
          <p><strong>Specialization:</strong> {secondaryRole}</p>
        </div>
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
        <h2>Client Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service(s)</th>
                <th>Date & Time</th>
                <th>Location</th>
                {/* <th>Status</th> */}
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.userId?.username || 'Unknown'}</td>
                  <td>
                    {booking.services ? (
                      Array.isArray(booking.services) ? (
                        booking.services.map(service => 
                          typeof service === 'object' ? service.name : service
                        ).join(', ')
                      ) : (
                        typeof booking.services === 'object' ? booking.services.name : booking.services
                      )
                    ) : (
                      'Not specified'
                    )}
                  </td>
                  <td>{new Date(booking.dateTime).toLocaleString()}</td>
                  <td>{booking.locationType || 'Not specified'}</td>
                  {/* <td>{booking.status}</td> */}
                  <td>
                    {/* {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleApprove(booking._id)}
                        className="approve-button"
                      >
                        Approve
                      </button>
                    )} */}
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