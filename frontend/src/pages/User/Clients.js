import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Clients.css';

// ✅ Import images directly from assets
import member1 from '../../assets/images/client1.jpeg';
import member2 from '../../assets/images/client2.jpeg';
import member3 from '../../assets/images/client3.jpeg';
import member4 from '../../assets/images/client4.png';
import member5 from '../../assets/images/client5.png';

// Team members data
const teamMembers = [
    { 
        name: "Sophia Carter", 
        role: "Team Leader",
        description: "Oversees team operations and ensures top quality service.", 
        image: member1 
    },
    { 
        name: "Michael Brown", 
        role: "Hair Stylist",
        description: "Expert in creative cuts and styling, bringing modern trends to life.", 
        image: member2 
    },
    { 
        name: "Emily Johnson", 
        role: "Nail Artist",
        description: "Innovative nail designs that add a touch of elegance to every look.", 
        image: member3 
    },
    { 
        name: "Alex Rodriguez", 
        role: "Makeup Artist",
        description: "Enhances natural beauty with professional makeup techniques.", 
        image: member4 
    },
    { 
        name: "Olivia Davis", 
        role: "Team Member",
        description: "Handles client relations and ensures a smooth salon experience.", 
        image: member5 
    }
];

const Clients = () => {
    const [showMore, setShowMore] = useState(false);

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
                {teamMembers.slice(0, 3).map((member, index) => (
                    <div className="review-card" key={index}>
                        <img src={member.image} alt={member.name} className="client-image" />
                        <h3>{member.name}</h3>
                        <h4>{member.role}</h4>
                        <p>{member.description}</p>
                    </div>
                ))}
            </div>

            {teamMembers.length > 3 && (
                <div className="more-reviews-section">
                    <button className="show-more-btn" onClick={handleShowMore}>
                        {showMore ? 'Hide Team Members' : 'Show More Team Members'}
                    </button>

                    {showMore && (
                        <div className={`additional-reviews ${showMore ? 'slide-in' : ''}`}>
                            {teamMembers.slice(3, 5).map((member, index) => (
                                <div className="review-card additional" key={index + 3}>
                                    <img src={member.image} alt={member.name} className="client-image" />
                                    <h3>{member.name}</h3>
                                    <h4>{member.role}</h4>
                                    <p>{member.description}</p>
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

export default Clients;