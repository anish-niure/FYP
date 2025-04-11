import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Contact.css';
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
        {/* First Row: Contact Info and Map */}
        <div className="contact-row contact-row-first">
          <div className="contact-info">
            <h2>Our Contact Details</h2>
            <p><strong>Address:</strong> Battisputali, Kathmandu, Nepal</p>
            <p><strong>Phone:</strong> 9812345678</p>
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
              title="Moon's Salon Location in Battisputali, Kathmandu"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.318463073155!2d85.34061431506247!3d27.70168498279512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1b2f2c5b5b5b%3A0x5c6f0b5b5b5b5b5b!2sBattisputali%2C%20Kathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sus!4v1634567890123"
              width="100%"
              height="300"
              style={{ border: '1px solid rgba(255, 215, 0, 0.1)' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Second Row: Contact Form */}
        <div className="contact-row contact-row-second">
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;