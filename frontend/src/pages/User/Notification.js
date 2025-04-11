import React from 'react';
import Navbar from '../../components/Navbar'; // Adjusted to match App.js structure
import Footer from '../../components/Footer'; // Assuming Footer exists here
import '../../styles/Notification.css'; // CSS file needs to be created

const Notification = () => {
    const notifications = [
        { id: 1, message: 'Your booking for Haircut & Styling is confirmed.', date: '2025-03-15' },
        { id: 2, message: 'New product available in the store.', date: '2025-03-14' },
    ];

    return (
        <div className="notification-page">
            <Navbar />
            <div className="notification-header">
                <h1>Notifications</h1>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <p>No notifications available.</p>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification.id} className="notification-item">
                            <p>{notification.message}</p>
                            <span>{notification.date}</span>
                        </div>
                    ))
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Notification;