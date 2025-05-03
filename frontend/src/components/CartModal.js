import React from 'react';
import '../styles/CartModal.css';

const CartModal = ({ show, onClose, cart, onRemoveItem, onCheckout }) => {
  if (!show) return null;
  
  // Calculate total price
  const totalPrice = cart.items?.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  ) || 0;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Your Shopping Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="cart-modal-body">
          {!cart.items || cart.items.length === 0 ? (
            <p className="empty-cart-message">Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map(item => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-image">
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName} 
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3>{item.productName}</h3>
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                      <p className="cart-item-total">
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => onRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <button 
                  className="checkout-btn"
                  onClick={onCheckout}
                >
                  Confirm Purchase
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;