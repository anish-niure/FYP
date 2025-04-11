import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
    const { token } = useParams(); // Get token from URL for reset password
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // If there's a token in the URL, we're in "reset password" mode
    const isResetMode = !!token;

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message || 'An error occurred.');
            }
        } catch (err) {
            setError('Failed to connect to server. Check your network or backend.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:5001/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => navigate('/'), 2000); // Redirect to home after 2 seconds
            } else {
                setError(data.message || 'An error occurred.');
            }
        } catch (err) {
            setError('Failed to connect to server. Check your network or backend.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>{isResetMode ? 'Reset Password' : 'Forgot Password'}</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                {!isResetMode ? (
                    <form onSubmit={handleForgotPassword}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;