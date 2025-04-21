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
                    imageUrl: stylist.imageUrl || '/assets/images/placeholder.png', // Ensure imageUrl is used
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
        <div className="our-team-page">
            <Navbar />
            <div className="our-team-header">
                <h1>Meet Our Team</h1>
                <p>Get to know the professionals behind Moon's Salon.</p>
            </div>

            <div className="team-members">
                {stylists.slice(0, 3).map((stylist, index) => (
                    <div className="team-card" key={index}>
                        <img
                            src={stylist.imageUrl}
                            alt={stylist.userId?.username || 'Stylist'}
                            className="team-image"
                            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <h3>{stylist.userId?.username || 'Unknown'}</h3>
                        <h4>Specialization: {stylist.secondaryRole || 'Not specified'}</h4>
                        <p>{stylist.description || 'No description available.'}</p>
                    </div>
                ))}
            </div>

            {stylists.length > 3 && (
                <div className="more-team-section">
                    <button className="show-more-btn" onClick={handleShowMore}>
                        {showMore ? 'Hide Team Members' : 'Show More Team Members'}
                    </button>

                    {showMore && (
                        <div className={`additional-team ${showMore ? 'slide-in' : ''}`}>
                            {stylists.slice(3).map((stylist, index) => (
                                <div className="team-card additional" key={index + 3}>
                                    <img
                                        src={stylist.imageUrl}
                                        alt={stylist.userId?.username || 'Stylist'}
                                        className="team-image"
                                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <h3>{stylist.userId?.username || 'Unknown'}</h3>
                                    <h4>Specialization: {stylist.secondaryRole || 'Not specified'}</h4>
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