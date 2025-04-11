import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import '../../styles/Home.css';

const Home = ({ openModal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch services from the database
        const fetchServices = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/services');
                setServices(response.data);
            } catch (err) {
                setError('Failed to load services. Please try again later.');
            }
        };

        fetchServices();
    }, []);

    return (
        <div className="home">
            <Navbar openModal={openModal} />
            <Header openModal={openModal} />
            <div className="content">
                <section className="services">
                    <h2>Our Services</h2>
                    {error && <p className="error">{error}</p>}
                    <div className="services-grid">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service._id} className="service">
                                    <img
                                        src={service.imageUrl || 'https://via.placeholder.com/300'}
                                        alt={service.name}
                                    />
                                    <h3>{service.name}</h3>
                                    <p>{service.description}</p>
                                    <p>{service.priceRange}</p>
                                    <Link to={`/booking?serviceId=${service._id}`} className="book-now-btn">
                                        Book Now
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>No services available at the moment.</p>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
            <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Home;