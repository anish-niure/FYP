import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ openModal }) => { // Accept openModal prop
    const isAuthenticated = () => !!localStorage.getItem('token'); // Check login status

    const handleBookClick = (e) => {
        if (!isAuthenticated()) {
            e.preventDefault(); // Prevent navigation
            openModal(); // Open login/signup modal
        }
        // If authenticated, Link will navigate to /booking as normal
    };

    return (
        <header className="header">
            <h1>Welcome to The Moon’s Salon</h1>
            <p>Your one-stop destination for beauty and wellness</p>
            <div className="cta-buttons">
                <Link
                    to="/booking"
                    onClick={handleBookClick} // Add click handler
                >
                    Book an Appointment
                </Link>
                <Link to="/services">Explore Services</Link>
            </div>
        </header>
    );
};

export default Header;