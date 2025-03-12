import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Service.css';

const Services = () => {
  return (
    <div className="services-page">
      {/* Navbar at the top */}
      <Navbar />
      
      <div className="services-content">
        <h2>Our Services</h2>
        <div className="services-list">
          <div className="service-item">
            <img
              src="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2669&auto=format&fit=crop"
              alt="Haircut & Styling"
            />
            <h3>Haircut & Styling</h3>
            <p>Experience the latest trends in haircuts and styles.</p>
          </div>

          <div className="service-item">
            <img
              src="https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=2572&auto=format&fit=crop"
              alt="Massage Therapy"
            />
            <h3>Massage Therapy</h3>
            <p>Relax and unwind with our soothing massage services.</p>
          </div>

          <div className="service-item">
            <img
              src="https://images.unsplash.com/photo-1618328769009-b1a3e561f5e8?q=80&w=2670&auto=format&fit=crop"
              alt="Manicure & Pedicure"
            />
            <h3>Manicure & Pedicure</h3>
            <p>Keep your nails healthy and beautiful.</p>
          </div>
          
          {/* ...Add more as needed... */}
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Services;