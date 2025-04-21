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

            <div className="about-content">
                <div className="about-image">
                    <img src="https://images.unsplash.com/photo-1642759464832-5d8290d987fd?q=80&w=2754&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Future Goals" />
                </div>
                <div className="about-text">
                    <h2>Our Future Goals</h2>
                    <p>
                        At our salon, we envision a future where everyone has access to top-notch beauty and grooming services. Our goal is to expand our reach, ensuring that our services are available to every community, no matter how remote. We aim to innovate and adapt to the latest trends and technologies, providing our clients with the best possible experience. Together, we strive to make beauty and self-care accessible to all.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;