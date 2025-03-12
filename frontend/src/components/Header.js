import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for proper navigation
import '../styles/Header.css';

const Header = () => {
    return (
        <header className="header">
            <h1>Welcome to The Moon’s Salon</h1>
            <p>Your one-stop destination for beauty and wellness</p>
            <div className="cta-buttons">
                <Link to="/booking">Book an Appointment</Link> {/* Updated to /booking */}
                <Link to="/services">Explore Services</Link>
            </div>
        </header>
    );
};

export default Header;