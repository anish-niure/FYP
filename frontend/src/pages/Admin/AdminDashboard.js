import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="card-grid">
        <Link to="/admin/stylists" className="card">
          <h2>Stylists</h2>
          <p>Create, edit, and remove stylists.</p>
        </Link>
        <Link to="/admin/store" className="card">
          <h2>Products</h2>
          <p>Add, edit, and remove products.</p>
        </Link>
        <Link to="/admin/orders" className="card">
          <h2>Orders</h2>
          <p>View completed orders with details.</p>
        </Link>
        <Link to="/admin/services" className="card">
          <h2>Services</h2>
          <p>Edit and add services and details.</p>
        </Link>
        {/* Link to manage users */}
        <Link to="/admin/user-management" className="card">
          <h2>Users</h2>
          <p>View user info, remove, or block users.</p>
        </Link>
        <Link to="/admin/appointments" className="card">
          <h2>Appointments</h2>
          <p>View and cancel appointments.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;