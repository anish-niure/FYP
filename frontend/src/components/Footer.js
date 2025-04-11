import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // For custom styling

// FontAwesome icons import
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa'; // Added Pinterest icon

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h2>About Us</h2>
                    <p>
                        We are a salon that offers the best services for hair, nails, skincare, and more. Join us and experience beauty like never before!
                    </p>

                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook size={24} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FaTwitter size={24} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram size={24} />
                        </a>
                        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                            <FaPinterest size={24} /> {/* Pinterest icon */}
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><Link to="/services">Our Services</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/store">Store</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h2>Contact Info</h2>
                    <p>Phone: (123) 456-7890</p>
                    <p>Email: info@moonsalon.com</p>
                    <p>Address: 123 Beauty St, Salon City, SC 12345</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 The Moon’s Salon. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;