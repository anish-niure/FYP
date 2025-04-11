import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminStylists.css';

const AdminStylists = () => {
  const [stylists, setStylists] = useState([]);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', image: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchStylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const response = await axios.get('http://localhost:5001/api/stylists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStylists(response.data);
    } catch (err) {
      console.error('Error fetching stylists:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load stylists. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/'); // Redirect to login if unauthorized
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to login if no token
      return;
    }
    fetchStylists();
  }, [token, navigate, fetchStylists]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields (username, email, password) are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post(
        'http://localhost:5001/api/stylists/create',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(response.data.message || 'Stylist created successfully!');
      setFormData({ username: '', email: '', password: '', image: null });
      fetchStylists();
    } catch (err) {
      console.error('Error creating stylist:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create stylist. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stylist?')) return;
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setSuccess(''); // Clear previous success message
      const response = await axios.delete(`http://localhost:5001/api/stylists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(response.data.message || 'Stylist deleted successfully!');
      fetchStylists();
    } catch (err) {
      console.error('Error deleting stylist:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete stylist. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/'); // Redirect to login if unauthorized
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, currentUsername, currentEmail) => {
    const newUsername = prompt('Enter new username:', currentUsername);
    const newEmail = prompt('Enter new email:', currentEmail);
    if (!newUsername || !newEmail) return;
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setSuccess(''); // Clear previous success message
      const response = await axios.put(
        `http://localhost:5001/api/stylists/${id}`,
        { username: newUsername, email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message || 'Stylist updated successfully!');
      fetchStylists();
    } catch (err) {
      console.error('Error updating stylist:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update stylist. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/'); // Redirect to login if unauthorized
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setSuccess(''); // Clear previous success message
      const response = await axios.put(
        `http://localhost:5001/api/stylists/${id}/reset-password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message || 'Password reset successfully!');
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/'); // Redirect to login if unauthorized
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-stylists">
      <h1>Manage Stylists</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {loading && <p className="loading">Loading...</p>}

      <form onSubmit={handleSubmit} className="create-stylist-form" autoComplete="off">
        <h2>Create New Stylist</h2>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Stylist'}
        </button>
      </form>

      <h2>Existing Stylists</h2>
      {stylists.length === 0 ? (
        <p>No stylists available.</p>
      ) : (
        <table className="stylists-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stylists.map((stylist) => (
              <tr key={stylist._id}>
                <td>
                  {stylist.imageUrl ? (
                    <img
                      src={`http://localhost:5001${stylist.imageUrl}`}
                      alt={stylist.username}
                      className="stylist-image"
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td>{stylist.username}</td>
                <td>{stylist.email}</td>
                <td>
                  <button
                    onClick={() => handleEdit(stylist._id, stylist.username, stylist.email)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(stylist._id)} disabled={loading}>
                    Delete
                  </button>
                  <button onClick={() => handleResetPassword(stylist._id)} disabled={loading}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminStylists;