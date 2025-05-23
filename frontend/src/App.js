import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import Home from './pages/User/Home';
import Services from './pages/User/Services';
import Navbar from './components/Navbar';
import About from './pages/User/About';
import Clients from './pages/User/Clients';
import Contact from './pages/User/Contact';
import Profile from './pages/User/Profile';
import Booking from './pages/User/Booking';
import Store from './pages/User/Store';
import Notification from './pages/User/Notification';
import StylistDashboard from './pages/Stylist/StylistDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminStylists from './pages/Admin/AdminStylists';
import AdminService from './pages/Admin/AdminService';
import AdminStore from './pages/Admin/AdminStore';
import AdminAppointments from './pages/Admin/AdminAppointments';
import Modal from './components/Modal';
import ForgotPassword from './components/ForgotPassword';

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Navbar openModal={() => setModalOpen(true)} />
        <Routes>
          <Route path="/" element={<Home openModal={() => setModalOpen(true)} />} />
          <Route path="/services" element={<Services />} />
          <Route path="/user/about" element={<About />} />
          <Route path="/user/clients" element={<Clients />} />
          <Route path="/user/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/store" element={<Store />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/stylist-dashboard" element={<StylistDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/stylists" element={<AdminStylists />} />
          <Route path="/admin/services" element={<AdminService />} />
          <Route path="/admin/store" element={<AdminStore />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
      </Router>
    </AuthProvider>
  );
}

export default App;