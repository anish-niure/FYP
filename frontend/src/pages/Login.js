import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || 'Login successful!');
                localStorage.setItem('token', data.token); // Save token for future requests
            } else {
                setMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formWrapper}>
                <h2 style={styles.heading}>Login</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Email:</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                {message && <p style={styles.message}>{message}</p>}

                {/* Signup Button */}
                <p style={styles.signupText}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={styles.signupLink}>Signup</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
    },
    formWrapper: {
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
    },
    heading: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555555',
    },
    input: {
        padding: '10px',
        border: '1px solid #dddddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
        cursor: 'pointer',
    },
    signupText: {
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#555555',
    },
    signupLink: {
        color: '#4CAF50',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    message: {
        marginTop: '15px',
        textAlign: 'center',
        color: '#333333',
    },
};

export default Login;