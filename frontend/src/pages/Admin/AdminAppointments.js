import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminAppointments.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    dateTime: '',
    locationType: '',
    stylist: '',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin to view appointments.');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch appointments: ' + (err.response?.data?.message || err.message));
      }
    };

    const fetchStylists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin to view stylists.');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/stylists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStylists(response.data);
      } catch (err) {
        setError('Failed to fetch stylists: ' + (err.response?.data?.message || err.message));
      }
    };

    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in as an admin to view services.');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
      } catch (err) {
        setError('Failed to fetch services: ' + (err.response?.data?.message || err.message));
      }
    };

    fetchAppointments();
    fetchStylists();
    fetchServices();
  }, []);

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status,
      dateTime: new Date(appointment.dateTime).toISOString().slice(0, 16),
      locationType: appointment.locationType,
      stylist: appointment.stylist?._id || appointment.stylist,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin to edit appointments.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5001/api/bookings/${selectedAppointment._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the appointments list with the updated appointment
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === selectedAppointment._id ? response.data : appt
        )
      );

      setModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError('Failed to update appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin to delete appointments.');
        return;
      }

      await axios.delete(`http://localhost:5001/api/bookings/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments((prev) => prev.filter((appt) => appt._id !== appointmentId));
      setError('');
    } catch (err) {
      setError('Failed to delete appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-appointments">
      <h1>Manage Appointments</h1>
      {error && <p className="error">{error}</p>}
      {appointments.length === 0 ? (
        <p>No appointments available.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Client</th>
              <th>Stylist</th>
              <th>Location</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>
                  {Array.isArray(appointment.services) && appointment.services.length > 0
                    ? appointment.services.map(serviceId => {
                        const service = services.find(s => s._id === serviceId);
                        return service ? service.name : 'Unknown Service';
                      }).join(', ')
                    : 'No services'}
                </td>
                <td>{appointment.userId?.username || 'Unknown'}</td>
                <td>{appointment.stylist?.username || 'Unknown'}</td>
                <td>{appointment.locationType}</td>
                <td>{new Date(appointment.dateTime).toLocaleString()}</td>
                <td>{appointment.status}</td>
                <td>
                  <button onClick={() => handleEditClick(appointment)} style={{ marginLeft: '10px',
                      backgroundColor: '#yellow', 
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDelete(appointment._id)} style={{ marginLeft: '10px',
                      backgroundColor: '#FF4D4D', 
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Appointment</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Status:
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <label>
                Date & Time:
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Location:
                <select
                  name="locationType"
                  value={formData.locationType}
                  onChange={handleFormChange}
                >
                  <option value="Home">Home</option>
                  <option value="Salon">Salon</option>
                </select>
              </label>
              <label>
                Stylist:
                <select
                  name="stylist"
                  value={formData.stylist}
                  onChange={handleFormChange}
                >
                  <option value="">Select a stylist</option>
                  {stylists.map((stylist) => (
                    <option key={stylist._id} value={stylist._id}>
                      {stylist.username}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;