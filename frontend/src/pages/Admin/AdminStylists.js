import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminStylists.css';

const AdminStylists = () => {
  const [stylists, setStylists] = useState([]);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    image: null,
    secondaryRole: 'Hair Style', // Default value
    description: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchStylists = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:5001/api/stylists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStylists(response.data);
    } catch (err) {
      console.error('Error fetching stylists:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load stylists. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchStylists();
  }, [token, navigate, fetchStylists]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields (username, email, password) are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Log what we're sending to the server
      console.log('Sending to server:', {
        username: formData.username,
        email: formData.email,
        password: '****' + formData.password.slice(-4), // Only show last 4 chars for security
        secondaryRole: formData.secondaryRole,
        description: formData.description,
        hasImage: formData.image ? true : false
      });

      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('secondaryRole', formData.secondaryRole);
      formDataToSend.append('description', formData.description);
      
      // Only append the image if it exists
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
      setFormData({
        username: '',
        email: '',
        password: '',
        image: null,
        secondaryRole: 'Hair Style',
        description: ''
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
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
    // Ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this stylist? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');

      const response = await axios.delete(
        `http://localhost:5001/api/stylists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(response.data.message || 'Stylist deleted successfully!');
      
      // Refresh the list of stylists
      fetchStylists();
    } catch (err) {
      console.error('Error deleting stylist:', err);
      let errorMessage = 'Failed to delete stylist. Please try again.';
      
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (id, currentUsername, currentEmail) => {
    const newUsername = prompt('Enter new username:', currentUsername);
    const newEmail = prompt('Enter new email:', currentEmail);
    if (!newUsername || !newEmail) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
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
        localStorage.removeItem('token');
        navigate('/');
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
      setError('');
      setSuccess('');
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
        localStorage.removeItem('token');
        navigate('/');
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
        
        <div className="form-group">
          <label htmlFor="username">Full Name:</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter full name"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create password"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="secondaryRole">Specialty:</label>
          <select
            id="secondaryRole"
            value={formData.secondaryRole}
            onChange={(e) => setFormData({ ...formData, secondaryRole: e.target.value })}
            disabled={loading}
          >
            <option value="Hair Style">Hair Style</option>
            <option value="Make Up">Make Up</option>
            <option value="Massage">Massage</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter stylist's description and experience"
            disabled={loading}
            rows="4"
          />
        </div>
        
        <div className="form-group profile-picture-field">
          <label className="file-input-label">Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="file-input"
          />
        </div>
        <div className="form-group" style={{marginTop: '-10px'}}>
          <label></label> {/* Empty label to maintain grid alignment */}
          <p className="file-hint">Image is optional. Only JPEG/PNG files accepted.</p>
        </div>
        
        <button type="submit" disabled={loading} className="form-button">
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
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stylists.map((stylist) => (
              <tr key={stylist._id}>
                <td>
                  {stylist.imageUrl ? (
                    <img
                      src={stylist.imageUrl}
                      alt={stylist.username}
                      className="stylist-image"
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td>{stylist.username}</td>
                <td>{stylist.email}</td>
                <td>{stylist.secondaryRole || 'Not specified'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(stylist._id, stylist.username, stylist.email)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(stylist._id)} 
                    disabled={loading || deletingId === stylist._id}
                  >
                    {deletingId === stylist._id ? 'Deleting...' : 'Delete'}
                  </button>
                  <button 
                    onClick={() => handleResetPassword(stylist._id)} 
                    disabled={loading}
                  >
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