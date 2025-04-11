import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminService.css';

const AdminService = () => {
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        priceRange: '',
        image: null,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to view services.');
                return;
            }

            const res = await axios.get('/api/services', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setServices(res.data.map(service => ({
                ...service,
                imageUrl: service.imageUrl || 'default-image-url.jpg',
            })));
            setError('');
        } catch (error) {
            console.error('Error fetching services:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            setError(error.response?.data?.message || 'Failed to fetch services. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewService(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewService(prev => ({
            ...prev,
            image: file,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to add a service.');
                return;
            }

            const formData = new FormData();
            formData.append('name', newService.name);
            formData.append('description', newService.description);
            formData.append('priceRange', newService.priceRange);
            if (newService.image) {
                formData.append('image', newService.image); // Append the image file
            }

            const res = await axios.post('/api/services', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setNewService({ name: '', description: '', priceRange: '', image: null });
            fetchServices();
            setError('');
            alert('Service added successfully!');
        } catch (error) {
            console.error('Error adding service:', error);
            setError(error.response?.data?.message || 'Failed to add service. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please log in as an admin to delete a service.');
                    return;
                }

                await axios.delete(`/api/services/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setServices(services.filter(service => service._id !== id));
                setError('');
            } catch (error) {
                console.error('Error deleting service:', error);
                setError(error.response?.data?.message || 'Failed to delete service. Please try again.');
            }
        }
    };

    return (
        <div className="admin-service">
            <h1>Manage Services</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="service-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={newService.description}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="priceRange"
                    placeholder="Price Range (e.g., Starting from $50)"
                    value={newService.priceRange}
                    onChange={handleChange}
                    required
                />
                <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                />
                <button type="submit">Add Service</button>
            </form>

            <div className="services-list">
                {services.map(service => (
                    <div key={service._id} className="service-card">
                        <img src={service.imageUrl} alt={service.name} />
                        <h3>{service.name}</h3>
                        <p>{service.description}</p>
                        <p>{service.priceRange}</p>
                        <button onClick={() => handleDelete(service._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminService;