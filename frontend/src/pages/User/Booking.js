import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../../styles/Booking.css';

// Step Components
import ServicesStep from './BookingSteps/ServicesStep';
import StylistsStep from './BookingSteps/StylistsStep';
import LocationStep from './BookingSteps/LocationStep';
import DateTimeStep from './BookingSteps/DateTimeStep';
import ConfirmationStep from './BookingSteps/ConfirmationStep';
import ProgressBar from './BookingSteps/ProgressBar';

const Booking = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [formData, setFormData] = useState({
        services: [],
        stylist: '',
        locationType: 'Salon',
        date: '',
        timeSlot: '',
    });
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [selectedServicesDetails, setSelectedServicesDetails] = useState([]);
    const [selectedStylistDetails, setSelectedStylistDetails] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const serviceIdFromQuery = queryParams.get('serviceId');

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5001/api/bookings/services')
            .then((response) => {
                setServices(response.data);
                setError('');
                
                if (serviceIdFromQuery) {
                    const selectedService = response.data.find(
                        (service) => service._id === serviceIdFromQuery
                    );
                    if (selectedService) {
                        setFormData((prev) => ({
                            ...prev,
                            services: [selectedService._id],
                        }));
                        setSelectedServicesDetails([selectedService]);
                        setCurrentStep(2);
                    }
                }
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to load services: ' + (err.response?.data?.message || err.message));
                setLoading(false);
            });

        axios
            .get('http://localhost:5001/api/bookings/stylists')
            .then((response) => {
                setStylists(response.data);
                setError('');
            })
            .catch((err) => {
                setError('Failed to load stylists: ' + (err.response?.data?.message || err.message));
            });
    }, [serviceIdFromQuery]);

    const calculateTotalDuration = () => {
        return selectedServicesDetails.length * 45;
    };

    const handleDateChange = async (date) => {
        setFormData({ ...formData, date });
        
        if (!date) {
            setAvailableTimeSlots([]);
            return;
        }
        
        try {
            const slots = generateTimeSlots(date, calculateTotalDuration());
            setAvailableTimeSlots(slots);
            setError('');
        } catch (err) {
            setError('Failed to generate time slots: ' + err.message);
            setAvailableTimeSlots([]);
        }
    };

    const generateTimeSlots = (selectedDate, serviceDuration) => {
        const dayOfWeek = new Date(selectedDate).getDay();
        
        if (dayOfWeek === 0) {
            return [];
        }
        
        const slots = [];
        const startHour = 10;
        const endHour = 18;
        const slotDuration = 45;
        const breakDuration = 15;
        
        let currentMinute = startHour * 60;
        const endMinute = endHour * 60;
        
        while (currentMinute + serviceDuration <= endMinute) {
            if (currentMinute < 13 * 60 && (currentMinute + serviceDuration) > 13 * 60) {
                currentMinute = 14 * 60;
                continue;
            }
            
            const startTime = formatTimeFromMinutes(currentMinute);
            const endTime = formatTimeFromMinutes(currentMinute + serviceDuration);
            
            slots.push({
                id: `${startTime}-${endTime}`,
                startTime,
                endTime,
                label: `${startTime} - ${endTime}`
            });
            
            currentMinute += slotDuration + breakDuration;
        }
        
        return slots;
    };
    
    const formatTimeFromMinutes = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    const handleTimeSlotSelect = (timeSlot) => {
        setFormData({ ...formData, timeSlot });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to book an appointment.');
            return;
        }
        
        if (formData.services.length === 0 || !formData.stylist || !formData.date || !formData.timeSlot) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            
            const selectedSlot = availableTimeSlots.find(slot => slot.id === formData.timeSlot);
            const [startTime] = selectedSlot.label.split(' - ');
            
            const dateTime = new Date(formData.date);
            const [hours, minutes] = startTime.replace(/(AM|PM)/, '').trim().split(':');
            let hourValue = parseInt(hours);
            
            if (startTime.includes('PM') && hourValue < 12) {
                hourValue += 12;
            }
            if (startTime.includes('AM') && hourValue === 12) {
                hourValue = 0;
            }
            
            dateTime.setHours(hourValue, parseInt(minutes), 0, 0);
            
            const bookingData = {
                services: formData.services,
                stylist: formData.stylist,
                locationType: formData.locationType,
                dateTime: dateTime.toISOString(),
                duration: calculateTotalDuration()
            };
            
            await axios.post(
                'http://localhost:5001/api/bookings',
                bookingData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const successElement = document.createElement('div');
            successElement.className = 'success-message-popup';
            successElement.textContent = 'Booking created successfully!';
            document.body.appendChild(successElement);
            
            setTimeout(() => {
                if (document.querySelector('.success-message-popup')) {
                    document.body.removeChild(document.querySelector('.success-message-popup'));
                }
            }, 2000);
            
            setCurrentStep(5);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setError('Failed to create booking: ' + (err.response?.data?.message || err.message));
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && formData.services.length === 0) {
            setError('Please select at least one service to continue.');
            return;
        }
        if (currentStep === 2 && !formData.stylist) {
            setError('Please select a stylist to continue.');
            return;
        }
        if (currentStep === 4 && (!formData.date || !formData.timeSlot)) {
            setError('Please select both a date and time slot to continue.');
            return;
        }
        
        setError('');
        setCurrentStep(prevStep => prevStep + 1);
        
        if (currentStep === 4) {
            handleSubmit();
        }
    };

    const prevStep = () => {
        setError('');
        setCurrentStep(prevStep => prevStep - 1);
    };

    const handleServiceSelect = (serviceId) => {
        setFormData(prev => {
            const newServices = prev.services.includes(serviceId)
                ? prev.services.filter(id => id !== serviceId)
                : [...prev.services, serviceId];
                
            return { ...prev, services: newServices };
        });
        
        updateSelectedServicesDetails(serviceId);
    };
    
    const updateSelectedServicesDetails = (serviceId) => {
        const service = services.find(s => s._id === serviceId);
        
        setSelectedServicesDetails(prev => {
            if (prev.some(s => s._id === serviceId)) {
                return prev.filter(s => s._id !== serviceId);
            } else {
                return [...prev, service];
            }
        });
    };

    const handleStylistSelect = (stylistId) => {
        setFormData({ ...formData, stylist: stylistId });
        const stylist = stylists.find(s => s._id === stylistId);
        setSelectedStylistDetails(stylist);
    };

    const handleLocationSelect = (locationType) => {
        setFormData({ ...formData, locationType });
    };

    const getFilteredStylists = () => {
        if (formData.services.length === 0) return [];
        
        // Direct mappings from service names to stylist secondary roles
        const serviceToRoleMap = {
            'Hair Styling': 'Hair Style', // Match Hair Styling service to Hair Style stylists
            'MakeUp': 'Make Up',          // Match MakeUp service to Make Up stylists
            'Massage': 'Massage'          // Massage is the same in both
        };
        
        // Log selected services for debugging
        console.log("Selected services:", selectedServicesDetails);
        
        // Filter stylists based on the direct mapping of service name to stylist role
        const filtered = stylists.filter(stylist => {
            // Print all stylists with their roles for debugging
            console.log(`Checking stylist: ${stylist.username}, Role: ${stylist.secondaryRole}`);
            
            // For each selected service, check if the stylist's secondaryRole matches
            return selectedServicesDetails.some(service => {
                // Get the expected stylist role for this service
                const expectedRole = serviceToRoleMap[service.name];
                console.log(`Service: ${service.name}, Expected role: ${expectedRole}, Stylist role: ${stylist.secondaryRole}`);
                
                // Check if this stylist's role matches what we need for the service
                return stylist.secondaryRole === expectedRole;
            });
        });
        
        console.log(`Filtered from ${stylists.length} stylists to ${filtered.length} stylists`);
        return filtered;
    };

    const totalSteps = 5;

    return (
        <div className="booking-page">
            <h1>Book an Appointment</h1>
            
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="booking-container">
                {currentStep === 1 && (
                    <ServicesStep 
                        services={services} 
                        selectedServices={formData.services}
                        onSelectService={handleServiceSelect}
                        loading={loading}
                    />
                )}
                
                {currentStep === 2 && (
                    <StylistsStep 
                        stylists={getFilteredStylists()} 
                        selectedStylist={formData.stylist}
                        onSelectStylist={handleStylistSelect}
                        selectedServices={selectedServicesDetails}
                        loading={loading}
                    />
                )}
                
                {currentStep === 3 && (
                    <LocationStep 
                        selectedLocation={formData.locationType}
                        onSelectLocation={handleLocationSelect}
                    />
                )}
                
                {currentStep === 4 && (
                    <DateTimeStep 
                        selectedDate={formData.date}
                        selectedTimeSlot={formData.timeSlot}
                        onDateChange={handleDateChange}
                        onTimeSlotSelect={handleTimeSlotSelect}
                        availableTimeSlots={availableTimeSlots}
                    />
                )}
                
                {currentStep === 5 && (
                    <ConfirmationStep 
                        bookingDetails={{
                            services: selectedServicesDetails,
                            stylist: selectedStylistDetails,
                            location: formData.locationType,
                            date: formData.date,
                            timeSlot: formData.timeSlot ? availableTimeSlots.find(slot => slot.id === formData.timeSlot)?.label : ''
                        }}
                    />
                )}
                
                <div className="booking-navigation">
                    {currentStep > 1 && currentStep < 5 && (
                        <button 
                            type="button" 
                            className="back-btn"
                            onClick={prevStep}
                            disabled={loading}
                        >
                            Back
                        </button>
                    )}
                    
                    {currentStep < 4 && (
                        <button 
                            type="button" 
                            className="next-btn"
                            onClick={nextStep}
                            disabled={loading}
                        >
                            Next
                        </button>
                    )}
                    
                    {currentStep === 4 && (
                        <button 
                            type="button" 
                            className="confirm-btn"
                            onClick={nextStep}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    )}
                    
                    {currentStep === 5 && (
                        <button 
                            type="button" 
                            className="new-booking-btn"
                            onClick={() => {
                                setFormData({
                                    services: [],
                                    stylist: '',
                                    locationType: 'Salon',
                                    date: '',
                                    timeSlot: '',
                                });
                                setSelectedServicesDetails([]);
                                setCurrentStep(1);
                            }}
                        >
                            Book Another Appointment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking;