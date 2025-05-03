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
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myProfile');
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [adminLevel, setAdminLevel] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('resetToken');
    if (token) {
      setResetToken(token);
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
        const userData = response.data;
        setUser(userData);
        setUsername(userData.username || '');
        setPhoneNumber(userData.phoneNumber || '');
        setEmail(userData.email || '');
        setGender(userData.gender || '');
        setUserLocation(userData.location || '');
        setError('');

        if (userData.role === 'admin') {
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

    axios
      .get('/api/store/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPurchases(response.data);
      })
      .catch((error) => {
        console.error('Error fetching purchases:', error);
        setError('Failed to load purchase history.');
      });
  }, [navigate, logout]);

  useEffect(() => {
    // Check if user is admin and set the appropriate tab
    if (user?.role === 'admin') {
      // You can add any admin-specific initialization here
      console.log('Admin user detected');
    }
  }, [user]);

  const refreshAllUserData = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setError(''); // Clear any errors
    
    // Fetch user data
    axios.get('http://localhost:5001/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const userData = response.data;
      setUser(userData);
      setUsername(userData.username || '');
      setPhoneNumber(userData.phoneNumber || '');
      setEmail(userData.email || '');
      setGender(userData.gender || '');
      setUserLocation(userData.location || '');
      
      // Set admin-specific fields if present
      if (userData.adminLevel) {
        setAdminLevel(userData.adminLevel);
      }
    })
    .catch(error => {
      console.error('Error refreshing user data:', error);
    });
    
    // Fetch bookings
    axios.get('http://localhost:5001/api/bookings/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setBookings(response.data);
    })
    .catch(error => {
      console.error('Error refreshing bookings:', error);
    });
    
    // Fetch purchases
    axios.get('/api/store/purchases', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setPurchases(response.data);
    })
    .catch(error => {
      console.error('Error refreshing purchases:', error);
    });
  };

  const handleSaveProfileClick = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    if (!username && !phoneNumber && !email && !gender && !userLocation && !profilePicture) {
      setError('Please provide at least one field to update.');
      return;
    }

    if (username && username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phoneNumber && !/^\d{10,15}$/.test(phoneNumber.replace(/[^\d]/g, ''))) {
      setError('Please enter a valid phone number (10-15 digits).');
      return;
    }

    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      setError('Invalid gender selection.');
      return;
    }

    if (username.trim()) formData.append('username', username.trim());
    if (phoneNumber.trim()) formData.append('phoneNumber', phoneNumber.trim());
    if (email.trim()) formData.append('email', email.trim());
    if (gender) formData.append('gender', gender);
    if (userLocation.trim()) formData.append('location', userLocation.trim());
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    if (user?.role === 'admin' && adminLevel) {
      formData.append('adminLevel', adminLevel);
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/user/update',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = response.data;
      setUser(updatedUser);
      setUsername(updatedUser.username || '');
      setPhoneNumber(updatedUser.phoneNumber || '');
      setEmail(updatedUser.email || '');
      setGender(updatedUser.gender || '');
      setUserLocation(updatedUser.location || '');

      if (updatedUser.adminLevel) {
        setAdminLevel(updatedUser.adminLevel);
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setProfilePicture(null);

      const successElement = document.createElement('div');
      successElement.className = 'success-message-popup';
      successElement.textContent = 'Profile updated successfully!';
      document.body.appendChild(successElement);

      setTimeout(() => {
        if (document.querySelector('.success-message-popup')) {
          document.body.removeChild(document.querySelector('.success-message-popup'));
        }

        refreshAllUserData();
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.response?.data?.message || error.message}`);
      setIsEditing(true);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setError('');
    setUsername(user?.username || '');
    setPhoneNumber(user?.phoneNumber || '');
    setEmail(user?.email || '');
    setGender(user?.gender || '');
    setUserLocation(user?.location || '');
  };

  const handleResetPasswordClick = async () => {
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

  const renderMyProfileSection = () => (
    <div className="my-profile-section">
      <h2>My Profile {user?.role === 'admin' && '(Admin)'}</h2>
      <div className="profile-info">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-picture"
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={placeholderImage}
            alt="Profile"
            className="profile-picture"
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <div className="edit-field">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={!isEditing}
          />
        </div>
        <div className="edit-field">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={!isEditing}
          />
        </div>
        <div className="edit-field">
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            disabled={!isEditing}
          />
        </div>
        <div className="edit-field">
          <label>Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="edit-field">
          <label>Location:</label>
          <input
            type="text"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            placeholder="Enter your location"
            disabled={!isEditing}
          />
        </div>
        {isEditing && (
          <div className="edit-field">
            <label>Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProfilePicture(e.target.files[0]);
                }
              }}
              className="file-input"
            />
            {profilePicture && (
              <div className="preview-container">
                <img
                  src={typeof profilePicture === 'string' 
                    ? profilePicture 
                    : URL.createObjectURL(profilePicture)}
                  alt="Profile Preview"
                  className="profile-picture-preview"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px' }}
                />
                <p className="preview-text">Preview</p>
              </div>
            )}
          </div>
        )}
        {user?.role === 'admin' && isEditing && (
          <div className="edit-field admin-field">
            <label>Admin Level:</label>
            <select
              value={adminLevel || ''}
              onChange={(e) => setAdminLevel(e.target.value)}
              disabled={!isEditing}
            >
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>
        )}
        {isEditing ? (
          <>
            <button onClick={handleSaveProfileClick} className="save-button">
              Save Changes
            </button>
            <button onClick={handleCancelClick} className="cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="edit-button">
            Edit Profile
          </button>
        )}
        <button onClick={handleResetPasswordClick} className="reset-password-button">
          Reset Password
        </button>
      </div>
      {error && (
        <p className={error.includes('successful') ? 'success-message' : 'error-text'}>
          {error}
        </p>
      )}
    </div>
  );

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
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="profile-content">
        {activeTab === 'myProfile' && renderMyProfileSection()}
        {activeTab === 'bookings' && (
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
        {activeTab === 'purchases' && (
          <div className="purchases-section">
            <h2>Purchase History</h2>
            {purchases.length === 0 ? (
              <p>
                No purchases yet. Visit the <Link to="/store">store</Link> to explore products!
              </p>
            ) : (
              <div className="purchases-container">
                <table className="purchases-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase._id}>
                        <td>{purchase.productName}</td>
                        <td>{purchase.quantity}</td>
                        <td>${purchase.pricePerUnit.toFixed(2)}</td>
                        <td>${purchase.totalPrice.toFixed(2)}</td>
                        <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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