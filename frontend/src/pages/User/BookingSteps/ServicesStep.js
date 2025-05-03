import React from 'react';

const ServicesStep = ({ services, selectedServices, onSelectService, loading }) => {
    if (loading) {
        return <div className="loading-spinner">Loading services...</div>;
    }
    
    return (
        <div className="booking-step service-step">
            <h2>Select Services</h2>
            <p className="step-description">Choose one or more beauty services you'd like to book:</p>
            
            {selectedServices.length > 0 && (
                <div className="selected-services-summary">
                    <h3>Selected Services: {selectedServices.length}</h3>
                </div>
            )}
            
            <div className="services-grid">
                {services.map((service) => (
                    <div 
                        key={service._id} 
                        className={`service-card ${selectedServices.includes(service._id) ? 'selected' : ''}`}
                        onClick={() => onSelectService(service._id)}
                    >
                        <div className="service-image-container">
                            <img 
                                src={service.imageUrl} 
                                alt={service.name} 
                                className="service-image" 
                            />
                        </div>
                        <h3 className="service-name">{service.name}</h3>
                        <p className="service-price">{service.priceRange}</p>
                        <p className="service-description">{service.description}</p>
                        
                        {selectedServices.includes(service._id) && (
                            <div className="selected-indicator">✓</div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="instruction-text">
                <p>You can select multiple services. Click Next when you're done.</p>
            </div>
        </div>
    );
};

export default ServicesStep;