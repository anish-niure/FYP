import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/Booking.css'; // Create this file for styling

const Booking = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState('');
    const [selectedStylist, setSelectedStylist] = useState('');
    const [locationType, setLocationType] = useState('Salon');
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [error, setError] = useState('');

    // Hardcoded services and stylists
    const services = [
        'Haircut & Styling',
        'Massage Therapy',
        'Manicure & Pedicure',
    ];
    const stylists = [
        'Sophia Carter',
        'Michael Brown',
        'Emily Johnson',
        'Alex Rodriguez',
        'Olivia Davis',
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        if (selectedDate) {
            fetchAvailability();
        }
    }, [selectedDate, navigate]);

    const fetchAvailability = async () => {
        const token = localStorage.getItem('token');
        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        try {
            const response = await fetch(`http://localhost:5001/api/bookings/availability?date=${dateStr}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                const bookedSlots = data.bookedSlotsByStylist[selectedStylist] || [];
                const freeSlots = data.allSlots.filter(slot => !bookedSlots.includes(slot));
                setAvailableSlots(freeSlots);
            } else {
                setError(data.message || 'Failed to fetch availability.');
            }
        } catch (err) {
            setError('Error fetching availability.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedService || !selectedStylist || !selectedSlot) {
            setError('Please fill all fields.');
            return;
        }

        const token = localStorage.getItem('token');
        const dateTime = new Date(selectedDate);
        const [hours] = selectedSlot.split(':');
        dateTime.setHours(parseInt(hours, 10), 0, 0, 0);

        try {
            const response = await fetch('http://localhost:5001/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    service: selectedService,
                    stylist: selectedStylist,
                    locationType,
                    dateTime: dateTime.toISOString(),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Booking successful!');
                navigate('/profile');
            } else {
                setError(data.message || 'Booking failed.');
            }
        } catch (err) {
            setError('Error submitting booking.');
        }
    };

    return (
        <div className="booking-page">
            <h1>Book an Appointment</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Service:</label>
                    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                        <option value="">Select a service</option>
                        {services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Stylist:</label>
                    <select
                        value={selectedStylist}
                        onChange={(e) => {
                            setSelectedStylist(e.target.value);
                            if (selectedDate) fetchAvailability();
                        }}
                    >
                        <option value="">Select a stylist</option>
                        {stylists.map((stylist) => (
                            <option key={stylist} value={stylist}>{stylist}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Location:</label>
                    <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                        <option value="Salon">Salon Service</option>
                        <option value="Home">Home Service</option>
                    </select>
                </div>

                <div>
                    <label>Date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        excludeDates={[]}
                        placeholderText="Select a date"
                    />
                </div>

                {selectedDate && selectedStylist && (
                    <div>
                        <label>Time Slot:</label>
                        <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                            <option value="">Select a time slot</option>
                            {availableSlots.map((slot) => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Confirm Booking</button>
            </form>
        </div>
    );
};

export default Booking;