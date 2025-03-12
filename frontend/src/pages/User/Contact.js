import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Contact.css';

// Import social media images (place these in assets/images)
import facebookIcon from '../../assets/icons/facebook.png';
import tiktokIcon from '../../assets/icons/tiktok.png';
import instagramIcon from '../../assets/icons/instagram.png';

const Contact = () => {
    return (
        <div className="contact-page">
            <Navbar />
            <div className="contact-header">
                <h1>Contact Us</h1>
                <p>Get in touch with Moon's Salon for appointments or inquiries.</p>
            </div>

            <div className="contact-content">
                <div className="contact-form">
                    <h2>Send Us a Message</h2>
                    <form>
                        <input type="text" placeholder="Your Name" required />
                        <input type="email" placeholder="Your Email" required />
                        <input type="tel" placeholder="Your Phone (Optional)" />
                        <textarea placeholder="Your Message" required></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                </div>

                <div className="contact-info">
                    <h2>Our Contact Details</h2>
                    <p><strong>Address:</strong> 123 Beauty Lane, Serenity City, SC 45678</p>
                    <p><strong>Phone:</strong> (555) 123-4567</p>
                    <p><strong>Email:</strong> info@moonsalon.com</p>
                    <p><strong>Hours:</strong> Mon-Fri: 9 AM - 7 PM, Sat: 10 AM - 5 PM, Sun: Closed</p>

                    <div className="social-links">
                        <a href="https://facebook.com/moonsalon" target="_blank" rel="noopener noreferrer">
                            <img src={facebookIcon} alt="Facebook" className="social-icon" onError={(e) => { e.target.src = 'https://via.placeholder.com/24'; }} />
                        </a>
                        <a href="https://tiktok.com/@moonsalon" target="_blank" rel="noopener noreferrer">
                            <img src={tiktokIcon} alt="TikTok" className="social-icon" onError={(e) => { e.target.src = 'https://via.placeholder.com/24'; }} />
                        </a>
                        <a href="https://instagram.com/moonsalon" target="_blank" rel="noopener noreferrer">
                            <img src={instagramIcon} alt="Instagram" className="social-icon" onError={(e) => { e.target.src = 'https://via.placeholder.com/24'; }} />
                        </a>
                    </div>
                </div>

                <div className="contact-map">
                    <h2>Our Location</h2>
                    <iframe
                        title="Moon's Salon Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434692567!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan+Francisco%2C+CA%2C+USA!5e0!3m2!1sen!2sus!4v1634567890123"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;