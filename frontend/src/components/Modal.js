import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Modal.css';
import { AuthContext } from '../context/AuthContext';

const Modal = ({ isOpen, closeModal }) => {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const endpoint = isLogin
      ? 'http://localhost:5001/api/auth/login'
      : 'http://localhost:5001/api/auth/signup';

    const formData = new FormData(e.target);
    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (isLogin) delete payload.username;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(isLogin ? 'Login successful!' : 'Signup successful!');
        login(data.user, data.token);
        closeModal();
      } else {
        setErrorMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Login/Signup Error:', error);
      setErrorMessage('Failed to connect to server. Check your network or backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
            />
            <span
              className="eye-icon"
              onClick={togglePasswordVisibility}
              style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          {isLogin && (
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          )}
          <button type="submit" disabled={isLoading}>
            {isLogin ? 'Login' : 'Sign Up'} {/* Always show "Login" or "Sign Up", no "Processing..." */}
          </button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="toggle-section">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;