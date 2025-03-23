import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Navbar.css';
import menuIcon from '../assets/icons/menu.png';
import cartIcon from '../assets/icons/shopping-cart.png';
import userIcon from '../assets/icons/user.png';
import notificationIcon from '../assets/icons/notification.png';
import moonLogo from '../assets/icons/moon.svg';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ openModal }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

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
    console.log('Notification clicked');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="dropdown-container">
          <img src={menuIcon} alt="Menu Icon" className="menu-icon" />
          <ul className="dropdown-menu">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/user/about">About Us</Link></li>
            <li><Link to="/user/clients">Our Clients</Link></li>
            <li><Link to="/user/contact">Contact Info</Link></li>
            <li><Link to="/booking">Book Appointment</Link></li>
            <li><Link to="/store">Store</Link></li>
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
          <div className="icon-link" onClick={handleNotificationClick} style={{ cursor: 'pointer' }}>
            <img src={notificationIcon} alt="Notification Icon" className="nav-icon" />
            <span className="notification-badge">3</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;