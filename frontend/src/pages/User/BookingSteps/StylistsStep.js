import React, { useEffect } from 'react';

const StylistsStep = ({ stylists, selectedStylist, onSelectStylist, selectedServices, loading }) => {
    useEffect(() => {
        console.log("Available stylists:", stylists);
        console.log("Selected services:", selectedServices);
        
        // Log each stylist and their role to debug
        stylists.forEach(stylist => {
            console.log(`Stylist: ${stylist.username}, Role: ${stylist.secondaryRole || 'No role assigned'}`);
        });
    }, [stylists, selectedServices]);
    
    if (loading) {
        return <div className="loading-spinner">Loading stylists...</div>;
    }
    
    return (
        <div className="booking-step stylist-step">
            <h2>Choose Your Stylist</h2>
            <p className="step-description">
                Select a professional who can perform your selected services:
            </p>
            
            <div className="selected-services-info">
                <h3>Selected Services:</h3>
                <ul className="services-list">
                    {selectedServices.map(service => (
                        <li key={service._id}>
                            {service.name} ({service.priceRange})
                        </li>
                    ))}
                </ul>
            </div>
            
            {stylists.length === 0 ? (
                <div className="no-stylists-message">
                    <p>No stylists are available for your selected services.</p>
                    <p>Please go back and select different services or contact us for assistance.</p>
                    <p className="support-contact">Contact support: <a href="mailto:support@example.com">support@example.com</a></p>
                    <div className="stylist-debug-info">
                        <p>Available services looking for:</p>
                        <ul>
                            {selectedServices.map(service => (
                                <li key={service._id}>{service.name} (needs {service.name === 'Hair Styling' ? 'Hair Style' : 
                                                           service.name === 'MakeUp' ? 'Make Up' : service.name} stylist)</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="stylists-grid">
                    {stylists.map((stylist) => (
                        <div 
                            key={stylist._id} 
                            className={`stylist-card ${selectedStylist === stylist._id ? 'selected' : ''}`}
                            onClick={() => onSelectStylist(stylist._id)}
                        >
                            <div className="stylist-image-container">
                                <img 
                                    src={stylist.profilePicture || "https://via.placeholder.com/150?text=Stylist"} 
                                    alt={stylist.username} 
                                    className="stylist-image" 
                                />
                            </div>
                            <h3 className="stylist-name">{stylist.username}</h3>
                            
                            {stylist.specializations && (
                                <div className="stylist-specializations">
                                    {stylist.specializations.join(', ')}
                                </div>
                            )}
                            
                            {stylist.secondaryRole && (
                                <div className="stylist-specializations">
                                    <span className="specialization-label">Specialization:</span> {stylist.secondaryRole}
                                </div>
                            )}
                            
                            {selectedStylist === stylist._id && (
                                <div className="selected-indicator">✓</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StylistsStep;