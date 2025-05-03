import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import CartModal from '../../components/CartModal';
import '../../styles/Store.css';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({ items: [] });
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/store/products');
      setProducts(res.data);
    } catch (error) {
      setError('Failed to fetch products.');
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/store/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/store/cart', 
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      await fetchCart(); // Refresh cart
      setLoading(false);
      alert('Product added to cart!');
    } catch (error) {
      setLoading(false);
      alert('Failed to add product to cart.');
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/store/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchCart(); // Refresh cart
    } catch (error) {
      alert('Failed to remove item from cart.');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to checkout.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/store/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Checkout successful!');
      setCart({ items: [] });
      setShowCart(false);
    } catch (error) {
      alert('Failed to complete checkout.');
    }
  };

  return (
    <div className="store-page">
      <h1>Our Store</h1>
      
      <div className="store-actions">
        <button 
          className="view-cart-btn"
          onClick={() => setShowCart(true)}
        >
          View Cart ({cart.items?.length || 0})
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-image" 
            />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button 
              onClick={() => handleAddToCart(product._id)}
              disabled={loading}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Modal */}
      <CartModal 
        show={showCart} 
        onClose={() => setShowCart(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Store;