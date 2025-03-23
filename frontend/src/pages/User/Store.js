import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Store.css';

const Store = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    // Check if user is authenticated and fetch products
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(res.data.map(product => ({
                ...product,
                imageUrl: product.imageUrl || 'https://via.placeholder.com/150', // Placeholder image
            })));
            setError('');
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            setError(error.response?.data?.message || 'Failed to fetch products. Please try again.');
        }
    };

    return (
        <div className="store-page">
            <h1>Our Store</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="products-grid">
                {products.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="product-card">
                            <img src={product.imageUrl} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p>${product.price.toFixed(2)}</p>
                            <button className="view-details-btn">View Details</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Store;