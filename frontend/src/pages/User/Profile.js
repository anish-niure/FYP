// frontend/src/components/Profile.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../../assets/images/placeholder.png';
import '../../styles/Profile.css';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myProfile'); // Default to 'myProfile'
  const [settingsMode, setSettingsMode] = useState(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [secondaryRole, setSecondaryRole] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('resetToken');
    if (token) {
      setResetToken(token);
      setSettingsMode('resetPasswordWithToken');
      setActiveTab('myProfile');
    }
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    axios
      .get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
        setName(response.data.username);
        setRole(response.data.role || '');
        setDescription(response.data.description || '');
        setSecondaryRole(response.data.secondaryRole || '');
        setError('');

        // If the user is an admin, set the active tab to 'myProfile' and hide other tabs
        if (response.data.role === 'admin') {
          setActiveTab('myProfile');
        }
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please log in again.');
        logout();
        navigate('/');
      });

    axios
      .get('http://localhost:5001/api/bookings/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setBookings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching bookings:', error);
        setError('Failed to load booking history.');
      });
  }, [navigate, logout]);

  const handleEditProfileClick = () => {
    setSettingsMode('editProfile');
  };

  const handleResetPasswordClick = async () => {
    setSettingsMode('resetPassword');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', {
        email: user.email,
      });
      setShowPopup(true);
      setError('');
    } catch (error) {
      console.error('Error sending reset email:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSettingsMode(null);
  };

  const handleCancelClick = () => {
    setSettingsMode(null);
    setProfilePicture(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setResetToken(null);
    navigate('/profile', { replace: true });
  };

  const handleSaveProfileClick = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    if (name !== user.username) formData.append('username', name);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    try {
      const response = await axios.post(
        'http://localhost:5001/api/user/update',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSettingsMode(null);
      setProfilePicture(null);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/api/auth/reset-password/${resetToken}`,
        { password: newPassword }
      );
      setError(response.data.message);
      setNewPassword('');
      setConfirmNewPassword('');
      setResetToken(null);
      setSettingsMode('resetPasswordWithToken');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5001/api/user/update-profile', {
        role,
        description,
        secondaryRole,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      // Update user state to reflect changes
      setUser({ ...user, role, description, secondaryRole });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  if (!user && !error) return <p className="loading-text">Loading profile...</p>;
  if (error && !showPopup) return <p className="error-text" style={{ color: error.includes('successful') ? '#28a745' : '#dc3545' }}>{error}</p>;

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <button
          className={`sidebar-button ${activeTab === 'myProfile' ? 'active' : ''}`}
          onClick={() => setActiveTab('myProfile')}
        >
          My Profile
        </button>
        {role !== 'admin' && (
          <>
            <button
              className={`sidebar-button ${activeTab === 'updateProfile' ? 'active' : ''}`}
              onClick={() => setActiveTab('updateProfile')}
            >
              Update Profile
            </button>
            <button
              className={`sidebar-button ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              Booking History
            </button>
            <button
              className={`sidebar-button ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchase History
            </button>
          </>
        )}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="profile-content">
        {activeTab === 'myProfile' && (
          <div className="my-profile-section">
            <h2>My Profile</h2>
            <div className="profile-info">
              <img
                src={user.profilePicture || placeholderImage}
                alt="Profile"
                className="profile-picture"
              />
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <div className="settings-options">
                <button onClick={handleEditProfileClick} className="edit-button">
                  Edit Profile
                </button>
                <button onClick={handleResetPasswordClick} className="reset-password-button">
                  Reset Password
                </button>
              </div>
              {settingsMode === 'editProfile' && (
                <div className="edit-profile-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="profile-picture-input"
                  />
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile Preview"
                      className="profile-picture"
                    />
                  ) : (
                    <img
                      src={user.profilePicture || placeholderImage}
                      alt="Profile"
                      className="profile-picture"
                    />
                  )}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="edit-input"
                  />
                  <button onClick={handleSaveProfileClick} className="save-button">
                    Save
                  </button>
                  <button onClick={handleCancelClick} className="cancel-button">
                    Cancel
                  </button>
                </div>
              )}
              {settingsMode === 'resetPassword' && (
                <div className="reset-password-section">
                  <p>Requesting password reset...</p>
                </div>
              )}
              {settingsMode === 'resetPasswordWithToken' && (
                <div className="reset-password-section">
                  <h3>Reset Your Password</h3>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="password-input"
                    required
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="password-input"
                    required
                  />
                  <button onClick={handleResetPasswordSubmit} className="save-button">
                    Submit
                  </button>
                  <button onClick={handleCancelClick} className="cancel-button">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {role !== 'admin' && activeTab === 'updateProfile' && (
          <div className="update-profile-section">
            <h2>Update Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div>
                <label htmlFor="role">Role:</label>
                <input
                  type="text"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Hair Stylist, Beautician"
                />
              </div>
              <div>
                <label htmlFor="secondaryRole">Secondary Role:</label>
                <input
                  type="text"
                  id="secondaryRole"
                  value={secondaryRole}
                  onChange={(e) => setSecondaryRole(e.target.value)}
                  placeholder="e.g., Hair Stylist, Makeup Artist"
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write about your services, experience, and skills"
                ></textarea>
              </div>
              <button type="submit">Update Profile</button>
            </form>
            {message && <p>{message}</p>}
          </div>
        )}
        {role !== 'admin' && activeTab === 'bookings' && (
          <div className="booking-history">
            <h2>Booking History</h2>
            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Stylist</th>
                    <th>Date/Time</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.service}</td>
                      <td>{booking.stylist?.username || 'N/A'}</td>
                      <td>{new Date(booking.dateTime).toLocaleString()}</td>
                      <td>{booking.locationType}</td>
                      <td>{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {role !== 'admin' && activeTab === 'purchases' && (
          <div className="purchases-section">
            <h2>Purchase History</h2>
            <p>
              No purchases yet. Visit the <Link to="/store">store</Link> to explore products!
            </p>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Password Reset Link Sent</h3>
            <p>Password reset link sent to your registered email address: {user.email}</p>
            <button onClick={handlePopupClose} className="popup-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;