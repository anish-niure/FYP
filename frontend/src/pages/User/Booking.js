import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation
import '../../styles/Booking.css';

const Booking = () => {
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [formData, setFormData] = useState({
        service: '',
        stylist: '',
        locationType: 'Salon',
        dateTime: '',
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [error, setError] = useState('');

    const location = useLocation(); // Get the current location
    const queryParams = new URLSearchParams(location.search);
    const serviceIdFromQuery = queryParams.get('serviceId'); // Extract serviceId from query params

    useEffect(() => {
        // Fetch services
        axios
            .get('http://localhost:5001/api/bookings/services')
            .then((response) => {
                setServices(response.data);
                setError(''); // Clear any previous error

                // Pre-select the service if serviceId is in the query params
                if (serviceIdFromQuery) {
                    const selectedService = response.data.find(
                        (service) => service._id === serviceIdFromQuery
                    );
                    if (selectedService) {
                        setFormData((prev) => ({
                            ...prev,
                            service: selectedService._id,
                        }));
                    }
                }
            })
            .catch((err) => {
                setError('Failed to load services: ' + (err.response?.data?.message || err.message));
            });

        // Fetch stylists
        axios
            .get('http://localhost:5001/api/bookings/stylists')
            .then((response) => {
                setStylists(response.data);
                setError(''); // Clear any previous error
            })
            .catch((err) => {
                setError('Failed to load stylists: ' + (err.response?.data?.message || err.message));
            });
    }, [serviceIdFromQuery]); // Re-run if serviceIdFromQuery changes

    const handleDateChange = async (e) => {
        const date = e.target.value;
        setFormData({ ...formData, dateTime: date });
        if (!date) {
            setAvailableSlots([]);
            return;
        }
        try {
            const response = await axios.get(
                `http://localhost:5001/api/bookings/availability?date=${date}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setAvailableSlots(response.data.allSlots || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch availability: ' + (err.response?.data?.message || err.message));
            setAvailableSlots([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to book an appointment.');
            return;
        }
        if (!formData.service || !formData.stylist || !formData.dateTime) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            // Get service and stylist names for better feedback
            const selectedService = services.find(s => s._id === formData.service);
            const selectedStylist = stylists.find(s => s._id === formData.stylist);
            
            // Create the booking
            await axios.post(
                'http://localhost:5001/api/bookings',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Show success notification
            const successElement = document.createElement('div');
            successElement.className = 'success-message-popup';
            successElement.textContent = 'Booking created successfully!';
            document.body.appendChild(successElement);
            
            // Remove popup after 2 seconds
            setTimeout(() => {
                if (document.querySelector('.success-message-popup')) {
                    document.body.removeChild(document.querySelector('.success-message-popup'));
                }
            }, 2000);
            
            // Reset form
            setFormData({ service: '', stylist: '', locationType: 'Salon', dateTime: '' });
            setAvailableSlots([]);
            setError('');
        } catch (err) {
            setError('Failed to create booking: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="booking-page">
            <h1>Book an Appointment</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Service:</label>
                    <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        required
                    >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                            <option key={service._id} value={service._id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Stylist:</label>
                    <select
                        value={formData.stylist}
                        onChange={(e) => setFormData({ ...formData, stylist: e.target.value })}
                        required
                    >
                        <option value="">Select a stylist</option>
                        {stylists.map((stylist) => (
                            <option key={stylist._id} value={stylist._id}>
                                {stylist.username}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Location:</label>
                    <select
                        value={formData.locationType}
                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    >
                        <option value="Salon">Salon</option>
                        <option value="Home">Home Service</option>
                    </select>
                </div>
                <div>
                    <label>Date & Time:</label>
                    <input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={handleDateChange}
                        required
                    />
                </div>
                {availableSlots.length > 0 && (
                    <div>
                        <label>Available Slots:</label>
                        <select
                            value={formData.dateTime}
                            onChange={(e) =>
                                setFormData({ ...formData, dateTime: e.target.value })
                            }
                        >
                            {availableSlots.map((slot, index) => (
                                <option key={index} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <button type="submit">Book Now</button>
            </form>
        </div>
    );
};

export default Booking;