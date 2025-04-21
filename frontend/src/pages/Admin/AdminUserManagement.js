import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    if (!token) {
      navigate('/');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5001/api/user/users', { // Changed to /api/user/users
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load users. Please try again.';
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
    fetchUsers();
  }, [fetchUsers]);

  const handleBlock = async (id) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await axios.patch(
        `http://localhost:5001/api/user/block-user/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
    } catch (err) {
      console.error('Error toggling block status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to block/unblock user.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await axios.delete(`http://localhost:5001/api/user/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User deleted successfully!');
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete user.';
      setError(errorMessage);
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
      await axios.put(
        `http://localhost:5001/api/user/reset-password/${id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password reset successfully!');
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-user-management">
      <h1>Manage Users</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users available.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                <td>
                  <button onClick={() => handleBlock(user._id)} disabled={loading}>
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => handleResetPassword(user._id)} disabled={loading}>
                    Reset Password
                  </button>
                  <button onClick={() => handleDelete(user._id)} disabled={loading}>
                    Delete
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

export default AdminUserManagement;