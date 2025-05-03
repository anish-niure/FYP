import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/NotificationDropdown.css';

const NotificationDropdown = ({ show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (show && user) {
      fetchNotifications();
      
      // Mark notifications as read when dropdown is opened
      if (user) {
        markNotificationsAsRead();
      }
    }
  }, [show, user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Different endpoint for admin vs regular users
      const endpoint = user.role === 'admin' 
        ? '/api/admin/notifications'
        : user.role === 'stylist'
          ? '/api/stylists/notifications'
          : '/api/store/notifications';
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const markNotificationsAsRead = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Different endpoint for admin vs regular users
      const endpoint = user.role === 'admin' 
        ? '/api/admin/notifications/read'
        : user.role === 'stylist'
          ? '/api/stylists/notifications/read'
          : '/api/store/notifications/read';
      
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Dispatch an event to let Navbar know notifications have been read
      document.dispatchEvent(new CustomEvent('notificationsRead'));
      
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };
  
  const handleNotificationClick = (notification) => {
    // If notification has a link, navigate to it
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-notification-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="notification-content">
        {loading ? (
          <p className="notification-loading">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="notification-empty">No notifications.</p>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.type ? `notification-${notification.type}` : ''} 
                ${notification.link ? 'clickable' : ''} 
                ${!notification.read ? 'notification-unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <p>{notification.message}</p>
              <span className="notification-time">
                {new Date(notification.date).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;