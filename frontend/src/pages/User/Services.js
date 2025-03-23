import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Service.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.map(service => ({
        ...service,
        imageUrl: service.imageUrl || 'https://placehold.co/150x150', // Same placeholder as products
      })));
      setError('');
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.response?.data?.message || 'Failed to fetch services. Please try again.');
      if (error.response?.status === 401) {
        navigate('/'); // Redirect to login if unauthorized
      }
    }
  };

  return (
    <div className="services-container">
      <h1>Available Services</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="services-list">
        {services.length === 0 ? (
          <p>No services available.</p>
        ) : (
          services.map((service) => (
            <div key={service._id} className="service-card">
              <img src={service.imageUrl} alt={service.name} className="service-image" />
              <h3>{service.name}</h3>
              <p>{service.priceRange}</p>
              <Link to={`/booking/${service._id}`} className="book-now-btn">
                Book Now
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;