import React, { useState } from 'react';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import '../../styles/Home.css'; 

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="home">
            <Navbar openModal={() => setIsModalOpen(true)} />
            <Header />
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
                                src="https://img.freepik.com/premium-photo/manicure-pedicure_199352-47.jpg?w=1800"
                                alt="Manicure & Pedicure"
                            />
                            <h3>Manicure & Pedicure</h3>
                            <p>Keep your nails healthy and beautiful.</p>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
            <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Home;