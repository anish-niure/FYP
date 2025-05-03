import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Clients.css';

const OurTeam = () => {
    const [stylists, setStylists] = useState([]);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const fetchStylists = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/stylists/public');
                setStylists(response.data.map(stylist => ({
                    ...stylist,
                    imageUrl: stylist.imageUrl || '/assets/images/placeholder.png'
                })));
            } catch (error) {
                console.error('Error fetching stylists:', error);
            }
        };

        fetchStylists();
    }, []);

    const handleShowMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div className="clients-page">
            <Navbar />
            <div className="clients-header">
                <h1>Meet Our Team</h1>
                <p>Get to know the professionals behind Moon's Salon.</p>
            </div>

            <div className="client-reviews">
                {stylists.slice(0, 3).map((stylist, index) => (
                    <div className="review-card" key={index}>
                        <img
                            src={stylist.imageUrl}
                            alt={stylist.userId?.username || 'Stylist'}
                            className="client-image"
                        />
                        <h3>{stylist.userId?.username || 'Unknown'}</h3>
                        <p className="specialization">Specialization: {stylist.secondaryRole || 'Not specified'}</p>
                        <p>{stylist.description || 'No description available.'}</p>
                    </div>
                ))}
            </div>

            {stylists.length > 3 && (
                <div className="more-reviews-section">
                    <button className="show-more-btn" onClick={handleShowMore}>
                        {showMore ? 'Hide Team Members' : 'Show More Team Members'}
                    </button>

                    {showMore && (
                        <div className={`additional-reviews ${showMore ? 'slide-in' : ''}`}>
                            {stylists.slice(3).map((stylist, index) => (
                                <div className="review-card additional" key={index + 3}>
                                    <img
                                        src={stylist.imageUrl}
                                        alt={stylist.userId?.username || 'Stylist'}
                                        className="client-image"
                                    />
                                    <h3>{stylist.userId?.username || 'Unknown'}</h3>
                                    <p className="specialization">Specialization: {stylist.secondaryRole || 'Not specified'}</p>
                                    <p>{stylist.description || 'No description available.'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OurTeam;