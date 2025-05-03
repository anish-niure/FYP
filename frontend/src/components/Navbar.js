import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Navbar.css';
import menuIcon from '../assets/icons/menu.png';
import cartIcon from '../assets/icons/shopping-cart.png';
import userIcon from '../assets/icons/user.png';
import notificationIcon from '../assets/icons/notification.png';
import moonLogo from '../assets/icons/moon.svg';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ openModal }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      
      // Set up an interval to periodically check for new notifications
      const interval = setInterval(fetchNotificationCount, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleBookingCreated = () => {
      fetchNotificationCount();
    };
    
    document.addEventListener('bookingCreated', handleBookingCreated);
    
    return () => {
      document.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/store/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationCount(res.data.length);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      openModal();
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleBookAppointmentClick = (e) => {
    if (!user) {
      e.preventDefault(); // Prevent navigation
      openModal(); // Open login/signup modal
    } else {
      navigate('/booking'); // Navigate to booking page
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="dropdown-container">
          <img src={menuIcon} alt="Menu Icon" className="menu-icon" />
          <ul className="dropdown-menu">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/user/about">About Us</Link></li>
            <li><Link to="/user/clients">Our Team</Link></li>
            <li><Link to="/user/contact">Contact Info</Link></li>
            <li>
              <Link to="/booking" onClick={handleBookAppointmentClick}>Book Appointment</Link>
            </li>
            <li><Link to="/store">Store</Link></li>

            {/* Admin and Stylist Dashboard Links */}
            {user && user.role === 'stylist' && (
              <li><Link to="/stylist-dashboard">Stylist Dashboard</Link></li>
            )}
            {user && user.role === 'admin' && (
              <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
            )}
          </ul>
        </div>
      </div>

      <div className="nav-center">
        <img
          src={moonLogo}
          alt="Moon's Salon Logo"
          className="nav-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div className="nav-right">
        <div onClick={() => navigate('/store')} className="icon-link" style={{ cursor: 'pointer' }}>
          <img src={cartIcon} alt="Store Icon" className="nav-icon" />
        </div>
        <div
          className="icon-link profile-icon-container"
          onClick={handleProfileClick}
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <img src={userIcon} alt="Profile Icon" className="nav-icon" />
          {user && showLogout && (
            <button onClick={handleLogout} className="logout-button hover-logout">
              Logout
            </button>
          )}
        </div>
        {user && (
          <div className="icon-link" onClick={handleNotificationClick} style={{ cursor: 'pointer', position: 'relative' }}>
            <img src={notificationIcon} alt="Notification Icon" className="nav-icon" />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
            {showNotifications && (
              <NotificationDropdown 
                show={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;