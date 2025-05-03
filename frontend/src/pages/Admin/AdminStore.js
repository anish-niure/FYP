import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import '../../styles/AdminStore.css';  

const AdminStore = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image: null,
    });
    const [editProduct, setEditProduct] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    // Fetch products when component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch products from the backend
    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to view products.');
                return;
            }

            const res = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(res.data.map(product => ({
                ...product,
                imageUrl: product.imageUrl || 'https://via.placeholder.com/150', // Fallback image
            })));
            setError('');
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.message || 'Failed to fetch products. Please try again.');
        }
    };

    // Handle changes in input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editProduct) {
            setEditProduct(prev => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setNewProduct(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle file input change for image
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (editProduct) {
            setEditProduct((prev) => ({ ...prev, image: file }));
        } else {
            setNewProduct((prev) => ({ ...prev, image: file }));
        }
    };

    // Submit the form for adding or editing a product
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in as an admin to add a product.');
                return;
            }

            // Make sure data is valid before proceeding
            const productName = editProduct ? editProduct.name : newProduct.name;
            const productDescription = editProduct ? editProduct.description : newProduct.description;
            const productPrice = editProduct ? editProduct.price : newProduct.price;
            
            if (!productName || !productDescription || !productPrice) {
                setError('Please fill in all required fields.');
                return;
            }

            const formData = new FormData();
            
            // Append text fields with explicit toString() conversion
            formData.append('name', productName.toString());
            formData.append('description', productDescription.toString());
            formData.append('price', productPrice.toString());

            // Handle image file
            const imageFile = editProduct ? editProduct.image : newProduct.image;
            if (imageFile && imageFile instanceof File) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Let axios set the content type automatically
                }
            };

            // Proceed with the request
            if (editProduct) {
                await axios.put(`/api/products/${editProduct._id}`, formData, config);
                setEditProduct(null);
            } else {
                await axios.post('/api/products', formData, config);
            }

            // Reset form after successful submission
            setNewProduct({
                name: '',
                description: '',
                price: '',
                image: null,
            });
            
            fetchProducts();
            setError('');
            alert(editProduct ? 'Product updated successfully!' : 'Product added successfully!');
        } catch (error) {
            console.error('Error adding/updating product:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                setError(error.response.data?.message || 'Failed to add/update product. Please try again.');
            } else {
                setError('Network error or server not responding. Please try again.');
            }
        }
    };

    // Edit a specific product
    const handleEdit = (product) => {
        setEditProduct(product);
    };

    // Delete a product
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please log in as an admin to delete a product.');
                    return;
                }

                await axios.delete(`/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProducts(products.filter(product => product._id !== id)); 
                setError('');
            } catch (error) {
                console.error('Error deleting product:', error);
                setError(error.response?.data?.message || 'Failed to delete product. Please try again.');
            }
        }
    };

    // Navigate to the store page for users
    const goToStore = () => {
        navigate('/store');
    };

    return (
        <div className="admin-store">
            <h1>Manage Store Products</h1>
            {error && <div className="error-message">{error}</div>}

            <div className="store-section">
                <button onClick={goToStore} className="view-store-btn">
                    View Store as User
                </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-input">
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={editProduct ? editProduct.name : newProduct.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input">
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={editProduct ? editProduct.description : newProduct.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input">
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={editProduct ? editProduct.price : newProduct.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
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
                    {editProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editProduct && (
                    <button type="button" onClick={() => setEditProduct(null)} className="cancel-btn">
                        Cancel
                    </button>
                )}
            </form>

            <div className="products-list">
                {products.map((product) => (
                    <div key={product._id} className="product-card">
                        <img
                            src={product.imageUrl ? product.imageUrl : 'https://via.placeholder.com/150'} 
                            alt={product.name}
                            className="product-image"
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Price: ${product.price.toFixed(2)}</p>
                        <button onClick={() => handleEdit(product)} className="edit-btn">
                            Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="delete-btn">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStore;