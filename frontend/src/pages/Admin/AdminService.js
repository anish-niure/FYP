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
    const [editService, setEditService] = useState(null);
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
                imageUrl: service.imageUrl || 'https://via.placeholder.com/150', // Fallback image
            })));
            setError('');
        } catch (error) {
            console.error('Error fetching services:', error);
            setError(error.response?.data?.message || 'Failed to fetch services. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editService) {
            setEditService(prev => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setNewService(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (editService) {
            setEditService(prev => ({
                ...prev,
                image: file,
            }));
        } else {
            setNewService(prev => ({
                ...prev,
                image: file,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to add/update a service.');
                return;
            }

            const formData = new FormData();
            
            // Add text fields
            formData.append('name', editService ? editService.name : newService.name);
            formData.append('description', editService ? editService.description : newService.description);
            formData.append('priceRange', editService ? editService.priceRange : newService.priceRange);

            // Add image if it exists
            const imageFile = editService ? editService.image : newService.image;
            if (imageFile && imageFile instanceof File) {
                formData.append('image', imageFile);
            }

            // Let axios set the content type automatically
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            if (editService) {
                await axios.put(`/api/services/${editService._id}`, formData, config);
                setEditService(null);
            } else {
                await axios.post('/api/services', formData, config);
            }

            setNewService({ name: '', description: '', priceRange: '', image: null });
            fetchServices();
            setError('');
            alert(editService ? 'Service updated successfully!' : 'Service added successfully!');
        } catch (error) {
            console.error('Error adding/updating service:', error);
            setError(error.response?.data?.message || 'Failed to add/update service. Please try again.');
        }
    };

    const handleEdit = (service) => {
        setEditService({
            ...service,
            image: null, // Reset image to avoid sending old image unless updated
        });
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
                <div className="form-input">
                    <input
                        type="text"
                        name="name"
                        placeholder="Service Name"
                        value={editService ? editService.name : newService.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input">
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={editService ? editService.description : newService.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input">
                    <input
                        type="text"
                        name="priceRange"
                        placeholder="Price Range (e.g., Starting from $50)"
                        value={editService ? editService.priceRange : newService.priceRange}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input">
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit" className="submit-btn">
                    {editService ? 'Update Service' : 'Add Service'}
                </button>
                {editService && (
                    <button
                        type="button"
                        onClick={() => setEditService(null)}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div className="services-list">
                {services.map(service => (
                    <div key={service._id} className="service-card">
                        <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="service-image"
                        />
                        <h3>{service.name}</h3>
                        <p>{service.description}</p>
                        <p>{service.priceRange}</p>
                        <button onClick={() => handleEdit(service)} className="edit-btn">
                            Edit
                        </button>
                        <button onClick={() => handleDelete(service._id)} className="delete-btn">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminService;