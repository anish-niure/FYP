import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
        localStorage.setItem('token', data.token); // Save token
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>LOGIN</h2>
      <p style={styles.subtitle}>Enter your email and password to login:</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <div style={styles.forgotWrapper}>
          <Link to="/forgot-password" style={styles.forgotLink}>
            Forgot your password?
          </Link>
        </div>

        <button type="submit" style={styles.button}>LOGIN</button>

        {message && <p style={styles.message}>{message}</p>}
      </form>

      <p style={styles.signupText}>
        Don’t have an account?{' '}
        <Link to="/signup" style={styles.signupLink}>Sign up</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#fff',
  },
  title: {
    margin: '0 0 10px',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  subtitle: {
    margin: '0 0 30px',
    fontSize: '16px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  forgotWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  forgotLink: {
    fontSize: '14px',
    color: '#666',
    textDecoration: 'none',
  },
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  signupText: {
    fontSize: '14px',
    color: '#666',
  },
  signupLink: {
    color: '#000',
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginTop: '10px',
    color: '#333',
  },
};

export default Login;