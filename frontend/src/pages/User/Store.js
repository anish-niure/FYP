import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Store.css';

const Store = () => {
    const navigate = useNavigate();

    // Check if user is authenticated
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    // Dummy product data
    const products = [
        { id: 1, name: 'Product 1', price: 10, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Product 2', price: 20, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Product 3', price: 15, image: 'https://via.placeholder.com/150' },
        { id: 4, name: 'Product 4', price: 25, image: 'https://via.placeholder.com/150' },
    ];

    return (
        <div className="store-page">
            <h1>Our Store</h1>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.name} className="product-image" />
                        <h3>{product.name}</h3>
                        <p>${product.price}</p>
                        <button className="view-details-btn">View Details</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Store;