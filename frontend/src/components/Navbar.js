// src/components/Navbar.js
import React from 'react';
import '../styles/Home.css'; // Updated path
function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <a href="/">Home</a>
                <a href="/services">Services</a>
                <a href="/about">About Us</a>
                <a href="/contact">Contact Us</a>
            </div>
            <div className="nav-right">
                <a href="/store" className="store-icon">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
                        alt="Store Icon"
                    />
                </a>
                <a href="/login" className="login-section">Login/Sign Up</a>
            </div>
        </nav>
    );
}

export default Navbar;