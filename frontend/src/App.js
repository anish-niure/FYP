import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/User/Home';
import Services from './pages/User/Services';
import Navbar from './components/Navbar';
import About from './pages/User/About';
import Clients from './pages/User/Clients';
import Contact from './pages/User/Contact';
import Profile from './pages/User/Profile';
import Booking from './pages/User/Booking';
import Store from './pages/User/Store'; // Updated to match User/ directory
import Modal from './components/Modal';

function App() {
    const [modalOpen, setModalOpen] = useState(false);

    const isAuthenticated = () => !!localStorage.getItem('token');

    return (
        <Router>
            <Navbar openModal={() => setModalOpen(true)} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/user/about" element={<About />} />
                <Route path="/user/clients" element={<Clients />} />
                <Route path="/user/contact" element={<Contact />} />
                <Route
                    path="/profile"
                    element={isAuthenticated() ? <Profile /> : <Navigate to="/" />}
                />
                <Route
                    path="/booking"
                    element={isAuthenticated() ? <Booking /> : <Navigate to="/" />}
                />
                <Route
                    path="/store"
                    element={isAuthenticated() ? <Store /> : <Navigate to="/" />}
                />
            </Routes>
            <Modal
                isOpen={modalOpen}
                closeModal={() => setModalOpen(false)}
            />
        </Router>
    );
}

export default App;