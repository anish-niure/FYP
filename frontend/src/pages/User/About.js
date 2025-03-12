import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/About.css';  // ✅ Updated to match new file name

const AboutUs = () => {
    return (
        <div className="about-page">
            <Navbar />
            <div className="about-header">
                <h1>About <span>Moon’s Salon</span></h1>
                <p>Experience luxury, elegance, and the best beauty services in town.</p>
            </div>

            {/* About Section */}
            <div className="about-content">
                <div className="about-text">
                    <h2>Our Story</h2>
                    <p>
                        At Moon’s Salon, we believe in bringing out the best in you. 
                        Established in 2025, our salon has been the ultimate destination 
                        for luxury hair, skin, and wellness services. 
                    </p>
                    <p>
                        Our experienced professionals ensure that you receive the best 
                        quality treatments in a relaxing and sophisticated environment.
                    </p>
                </div>
                <div className="about-image">
                    <img src="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2669&auto=format&fit=crop" alt="Salon Interior" />
                </div>
            </div>

            {/* Team Section */}
            <div className="team-section">
                <h2>Meet Our Experts</h2>
                <div className="team-grid">
                    <div className="team-member">
                        <img src="https://via.placeholder.com/150" alt="Stylist" />
                        <h3>Emily Johnson</h3>
                        <p>Senior Stylist</p>
                    </div>
                    <div className="team-member">
                        <img src="https://via.placeholder.com/150" alt="Therapist" />
                        <h3>Michael Lee</h3>
                        <p>Massage Therapist</p>
                    </div>
                    <div className="team-member">
                        <img src="https://via.placeholder.com/150" alt="Nail Artist" />
                        <h3>Sophia Kim</h3>
                        <p>Nail Artist</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;