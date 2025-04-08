import React from 'react';
import Navbar from '../../components/Navbar'; // Adjust the path as needed
import Footer from '../../components/Footer'; // Adjust the path as needed
import '../../styles/PrivacyPolicy.css'; // Adjust the path as needed

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <Navbar />
      <div className="privacy-policy-header">
        <h1>Moon's Saloon Privacy Policy</h1>
        <p>Learn how we protect your privacy at Moon's Saloon.</p>
      </div>

      <div className="privacy-policy-content">
        {/* Section: Introduction */}
        <div className="privacy-policy-section">
          <h2>Introduction</h2>
          <p>At Moon's Saloon, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.</p>
        </div>

        {/* Section: Information We Collect */}
        <div className="privacy-policy-section">
          <h2>1. Information We Collect</h2>
          <p>We may collect the following information from users when you register, use, or interact with our app:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, phone number, email address, and payment details.</li>
            <li><strong>Usage Data:</strong> Information on how you access and use the app, such as your device’s IP address, browser type, operating system, and pages visited.</li>
            <li><strong>Appointment Data:</strong> Information about the services you book, appointments, and preferences.</li>
          </ul>
        </div>

        {/* Section: How We Use Your Information */}
        <div className="privacy-policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our services, including processing appointments and payments.</li>
            <li>Send promotional content, offers, and reminders related to your services (with your consent).</li>
            <li>Enhance your user experience by personalizing the app's features.</li>
            <li>Communicate with you for customer service and support purposes.</li>
          </ul>
        </div>

        {/* Section: Data Security */}
        <div className="privacy-policy-section">
          <h2>3. Data Security</h2>
          <p>We take the security of your personal data seriously and implement industry-standard measures to protect your information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </div>

        {/* Section: Sharing Your Information */}
        <div className="privacy-policy-section">
          <h2>4. Sharing Your Information</h2>
          <p>We will not share, sell, or rent your personal information to third parties without your consent, except in the following cases:</p>
          <ul>
            <li>To service providers and partners who assist in providing our services.</li>
            <li>To comply with legal obligations or respond to legal requests.</li>
          </ul>
        </div>

        {/* Section: Data Retention */}
        <div className="privacy-policy-section">
          <h2>5. Data Retention</h2>
          <p>We will retain your information for as long as necessary to provide services and comply with legal obligations, resolve disputes, and enforce agreements.</p>
        </div>

        {/* Section: Your Rights */}
        <div className="privacy-policy-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact us at info@moonsaloon.com.</p>
        </div>

        {/* Section: Cookies */}
        <div className="privacy-policy-section">
          <h2>7. Cookies</h2>
          <p>Our app uses cookies to enhance user experience, analyze usage, and offer personalized content. You can manage cookie preferences through your device’s settings.</p>
        </div>

        {/* Section: Children’s Privacy */}
        <div className="privacy-policy-section">
          <h2>8. Children’s Privacy</h2>
          <p>Our services are not intended for individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that a child under 16 has provided us with personal data, we will take steps to remove such data.</p>
        </div>

        {/* Section: Changes to This Privacy Policy */}
        <div className="privacy-policy-section">
          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted in the app with an updated "Effective Date."</p>
        </div>

        {/* Section: Contact Us */}
        <div className="privacy-policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
          <p><strong>Email:</strong> info@moonsaloon.com</p>
          <p><strong>Phone:</strong> 1234567890</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;