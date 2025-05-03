import React from 'react';

const DateTimeStep = ({ selectedDate, selectedTimeSlot, onDateChange, onTimeSlotSelect, availableTimeSlots, loading }) => {
    const handleDateInputChange = (e) => {
        onDateChange(e.target.value);
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    return (
        <div className="booking-step datetime-step">
            <h2>Select Date & Time</h2>
            <p className="step-description">Choose when you'd like to schedule your appointment:</p>
            
            <div className="datetime-selector">
                <div className="date-input-container">
                    <label>Select a Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateInputChange}
                        min={today}
                        required
                        className="date-input"
                    />
                    <p className="date-note">
                        Note: We are closed on Sundays. Our business hours are 10:00 AM - 6:00 PM.
                    </p>
                </div>
                
                {selectedDate && availableTimeSlots.length === 0 && (
                    <div className="no-slots-message">
                        <p>No available time slots for the selected date. Please choose another date.</p>
                    </div>
                )}
                
                {availableTimeSlots.length > 0 && (
                    <div className="time-slots">
                        <label>Available Time Slots:</label>
                        <div className="slots-grid">
                            {availableTimeSlots.map(slot => (
                                <button
                                    key={slot.id}
                                    className={`time-slot ${selectedTimeSlot === slot.id ? 'selected' : ''}`}
                                    onClick={() => onTimeSlotSelect(slot.id)}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>
                        <div className="time-slots-info">
                            <p>Each service takes 45 minutes. Appointments have 15-minute breaks between them.</p>
                            <p>Lunch break: 1:00 PM - 2:00 PM</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateTimeStep;