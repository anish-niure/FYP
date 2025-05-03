require('dotenv').config();
const nodemailer = require('nodemailer');

// Create email transporter with better debugging
const createTransporter = () => {
  console.log('Email credentials check:', {
    username: process.env.EMAIL_USERNAME ? 'Found' : 'Missing',
    password: process.env.EMAIL_PASSWORD ? 'Found' : 'Missing'
  });

  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error('Email credentials missing. Check .env file for EMAIL_USERNAME and EMAIL_PASSWORD');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Create HTML templates for different email types
const createBookingConfirmationHTML = (details, recipientType) => {
  const { serviceNames, dateTime, locationType, userName, stylistName } = details;
  const date = new Date(dateTime).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
  });
  
  const time = new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let subject, greeting, message;

  switch (recipientType) {
    case 'user':
      subject = "Your Booking Confirmation - The Moon Salon";
      greeting = `Hello ${userName},`;
      message = `
        <p>Your booking has been confirmed successfully.</p>
        <p>We're looking forward to seeing you!</p>
      `;
      break;
    case 'stylist':
      subject = "New Booking Notification - The Moon Salon";
      greeting = `Hello ${stylistName},`;
      message = `
        <p>You have a new booking scheduled.</p>
        <p>Please prepare for this appointment.</p>
      `;
      break;
    case 'admin':
      subject = "New Booking Alert - The Moon Salon";
      greeting = `Hello Admin,`;
      message = `
        <p>A new booking has been made on your system.</p>
        <p>Please review the details in your admin dashboard.</p>
      `;
      break;
  }

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d4af37; margin-bottom: 5px;">The Moon Salon</h1>
          <p style="color: #666;">Your beauty sanctuary</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">${greeting}</p>
        ${message}
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d4af37; margin-top: 0;">Booking Details:</h3>
          <p><strong>Services:</strong> ${serviceNames}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${locationType}</p>
          <p><strong>Stylist:</strong> ${stylistName}</p>
          <p><strong>Client:</strong> ${userName}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          If you have any questions, please contact us at info@moonsalon.com or call us at 9812345678.
        </p>
      </div>
    `
  };
};

// Create HTML template for order confirmation emails
const createOrderConfirmationHTML = (details, recipientType) => {
  // details: { productName, quantity, pricePerUnit, totalPrice, purchaseDate }
  const purchaseDate = new Date(details.purchaseDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  let subject, greeting, message;
  
  switch (recipientType) {
    case 'user':
      subject = "Your Order Confirmation - The Moon Salon";
      greeting = `Hello,`;
      message = `
        <p>Thank you for your purchase!</p>
        <p>You ordered <strong>${details.productName}</strong> (x${details.quantity}) at $${details.pricePerUnit} each, totaling $${details.totalPrice}.</p>
        <p>Your order was placed on ${purchaseDate}.</p>
      `;
      break;
    case 'admin':
      subject = "New Product Order Received - The Moon Salon";
      greeting = `Hello Admin,`;
      message = `
        <p>A new product order has been placed.</p>
        <p><strong>Product:</strong> ${details.productName}</p>
        <p><strong>Quantity:</strong> ${details.quantity}</p>
        <p><strong>Total Price:</strong> $${details.totalPrice}</p>
        <p>Order Date: ${purchaseDate}</p>
      `;
      break;
  }
  
  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d4af37; margin-bottom: 5px;">The Moon Salon</h1>
          <p style="color: #666;">Your beauty sanctuary</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">${greeting}</p>
        ${message}
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          For any questions, please contact us at info@moonsalon.com.
        </p>
      </div>
    `
  };
};

// Send email function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.error('Failed to create email transporter');
      return false;
    }

    const info = await transporter.sendMail({
      from: `"The Moon Salon" <${process.env.EMAIL_USERNAME}>`,
      to: to,
      subject: subject,
      html: htmlContent
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  createBookingConfirmationHTML,
  createOrderConfirmationHTML
};