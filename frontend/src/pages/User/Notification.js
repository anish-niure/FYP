import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Notification.css';
import axios from 'axios';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view notifications.');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/user/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch notifications.');
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-page">
      <Navbar />
      <div className="notification-header">
        <h1>Notifications</h1>
      </div>
      <div className="notification-list">
        {error && <p className="error-message">{error}</p>}
        {notifications.length === 0 && !error ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className="notification-item">
              <p>{notification.message}</p>
              <span>{new Date(notification.date).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notification;