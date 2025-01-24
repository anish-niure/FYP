import React, { useState } from 'react';
import '../styles/Home.css'; // Create a CSS file for styling if necessary

function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginForm, setIsLoginForm] = useState(true);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const switchForm = () => setIsLoginForm(!isLoginForm);

    return (
        <div>
            {/* Header Section */}
            <header className="header">
                <h1>Welcome to The Moon’s Salon</h1>
                <p>Your one-stop destination for beauty and wellness</p>
                <div className="cta-buttons">
                    <a href="/appointment">Book an Appointment</a>
                    <a href="/services">Explore Services</a>
                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-left">
                    <a href="/">Home</a>
                    <a href="/services">Services</a>
                    <a href="/about">About Us</a>
                    <a href="/contact">Contact Us</a>
                </div>
                <div className="nav-right">
                    <a href="/store" className="store-icon">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
                            alt="Store Icon"
                        />
                    </a>
                    <button className="login-section" onClick={toggleModal}>
                        Login/Sign Up
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="content">
                <section className="services">
                    <h2>Our Services</h2>
                    <div className="services-grid">
                        <div className="service">
                            <img
                                src="https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2669&auto=format&fit=crop"
                                alt="Haircut & Styling"
                            />
                            <h3>Haircut & Styling</h3>
                            <p>Experience the latest trends in haircuts and styles.</p>
                        </div>
                        <div className="service">
                            <img
                                src="https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=2572&auto=format&fit=crop"
                                alt="Massage Therapy"
                            />
                            <h3>Massage Therapy</h3>
                            <p>Relax and unwind with our soothing massage services.</p>
                        </div>
                        <div className="service">
                            <img
                                src="https://images.unsplash.com/photo-1618328769009-b1a3e561f5e8?q=80&w=2670&auto=format&fit=crop"
                                alt="Manicure & Pedicure"
                            />
                            <h3>Manicure & Pedicure</h3>
                            <p>Keep your nails healthy and beautiful.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Section */}
            <footer>
                <p>&copy; 2024 The Moon’s Salon. All Rights Reserved.</p>
                <p>
                    Visit our <a href="/store">Store</a> for amazing products.
                </p>
            </footer>

            {/* Login Modal */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isLoginForm ? 'Login' : 'Sign Up'}</h2>
                        <form>
                            {isLoginForm ? (
                                <>
                                    <input type="email" placeholder="Email" required />
                                    <input type="password" placeholder="Password" required />
                                    <button type="submit">Login</button>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Username" required />
                                    <input type="email" placeholder="Email" required />
                                    <input type="password" placeholder="Password" required />
                                    <button type="submit">Sign Up</button>
                                </>
                            )}
                        </form>
                        <div className="modal-footer">
                            <button onClick={switchForm}>
                                {isLoginForm
                                    ? "Don't have an account? Create one"
                                    : 'Already have an account? Login'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;