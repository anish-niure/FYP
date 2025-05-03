import React from 'react';

const ConfirmationStep = ({ bookingDetails }) => {
    const { services, stylist, location, date, timeSlot } = bookingDetails;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Calculate total duration
    const calculateTotalDuration = () => {
        // Each service is 45 minutes
        return services.length * 45;
    };
    
    // Calculate total price with support for multiple currency formats
    const calculateTotalPrice = () => {
        let total = 0;
        let currencySymbol = '$';
        
        services.forEach(service => {
            // Check for RS- format (Indian Rupees)
            let priceMatch = service.priceRange.match(/RS-(\d+(?:\.\d+)?)/);
            
            // If not found, try $ format
            if (!priceMatch) {
                priceMatch = service.priceRange.match(/\$(\d+(?:\.\d+)?)/);
            }
            
            if (priceMatch && priceMatch[1]) {
                total += parseFloat(priceMatch[1]);
                
                // Determine which currency format to use in the output
                if (service.priceRange.includes('RS-')) {
                    currencySymbol = 'RS-';
                }
            } else {
                console.log(`Could not parse price from: ${service.priceRange}`);
            }
        });
        
        return total > 0 ? `${currencySymbol}${total.toFixed(2)}` : 'Price not available';
    };
    
    return (
        <div className="booking-step confirmation-step">
            <div className="confirmation-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p className="confirmation-message">
                Your appointment has been successfully scheduled. We look forward to seeing you!
            </p>
            
            <div className="booking-summary">
                <h3>Booking Summary</h3>
                
                <div className="summary-item">
                    <span className="summary-label">Services:</span>
                    <div className="summary-services">
                        {services.map(service => (
                            <div key={service._id} className="summary-service-item">
                                {service.name} ({service.priceRange})
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Total Duration:</span>
                    <span className="summary-value">{calculateTotalDuration()} minutes</span>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Estimated Price:</span>
                    <span className="summary-value">{calculateTotalPrice()}</span>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Stylist:</span>
                    <span className="summary-value">{stylist?.username || 'N/A'}</span>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Location:</span>
                    <span className="summary-value">{location || 'N/A'}</span>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">{formatDate(date)}</span>
                </div>
                
                <div className="summary-item">
                    <span className="summary-label">Time:</span>
                    <span className="summary-value">{timeSlot || 'N/A'}</span>
                </div>
            </div>
            
            <div className="booking-instructions">
                <h3>What's Next?</h3>
                <ul>
                    <li>You'll receive a confirmation email with your booking details</li>
                    <li>Your stylist will be notified of the booking</li>
                    <li>Please arrive 10 minutes before your appointment time if at the salon</li>
                    <li>Need to reschedule? Contact us at least 24 hours before your appointment</li>
                </ul>
            </div>
        </div>
    );
};

export default ConfirmationStep;