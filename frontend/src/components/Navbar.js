import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import menuIcon from '../assets/icons/menu.png';
import cartIcon from '../assets/icons/shopping-cart.png';
import userIcon from '../assets/icons/user.png';
import notificationIcon from '../assets/icons/notification.png'; // Ensure this exists
import moonLogo from '../assets/icons/moon.svg';

const Navbar = ({ openModal }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showLogout, setShowLogout] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    const handleProfileClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            openModal();
        }
    };

    const handleNotificationClick = () => {
        console.log('Notification clicked'); // Placeholder for notification logic
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