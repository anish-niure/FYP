// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css'; // Updated path
function Footer() {
    return (
        <footer className="footer">
            <p>&copy; 2024 The Moon’s Salon. All Rights Reserved.</p>
            <p>
                Visit our <a href="/store">Store</a> for amazing products.
            </p>
        </footer>
    );
}

export default Footer;