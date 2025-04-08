import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminUserManagement.css'; // For custom styling

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Users:', response.data);
        setUsers(response.data);
      } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  // Handle blocking/unblocking user
  const handleBlock = async (id) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5001/api/block-user/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess(response.data.message);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
    } catch (err) {
      setError('Failed to block/unblock user.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting user
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5001/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('User deleted successfully!');
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        setError('Failed to delete user.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle password reset
  const handleResetPassword = async (id) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5001/api/reset-password/${id}`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Password reset successfully!');
    } catch (err) {
      setError('Failed to reset password.');
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
                  <button onClick={() => handleBlock(user._id)}>
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => handleResetPassword(user._id)}>
                    Reset Password
                  </button>
                  <button onClick={() => handleDelete(user._id)}>Delete</button>
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