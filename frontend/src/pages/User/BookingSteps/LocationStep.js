import React from 'react';

const LocationStep = ({ selectedLocation, onSelectLocation }) => {
    return (
        <div className="booking-step location-step">
            <h2>Choose Service Location</h2>
            <p className="step-description">Where would you like to receive your service?</p>
            
            <div className="location-options">
                <div 
                    className={`location-card ${selectedLocation === 'Salon' ? 'selected' : ''}`}
                    onClick={() => onSelectLocation('Salon')}
                >
                    <div className="location-icon salon-icon">🏢</div>
                    <h3>At Our Salon</h3>
                    <p>Visit our professional salon with all equipment and amenities</p>
                    
                    {selectedLocation === 'Salon' && (
                        <div className="selected-indicator">✓</div>
                    )}
                </div>
                
                <div 
                    className={`location-card ${selectedLocation === 'Home' ? 'selected' : ''}`}
                    onClick={() => onSelectLocation('Home')}
                >
                    <div className="location-icon home-icon">🏠</div>
                    <h3>At Your Home</h3>
                    <p>Our professional will visit you at your provided address</p>
                    
                    {selectedLocation === 'Home' && (
                        <div className="selected-indicator">✓</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationStep;