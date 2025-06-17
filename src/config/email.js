const nodemailer = require('nodemailer');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  registrationSuccess: (type) => `
    <h1>Registration Successful</h1>
    <p>Thank you for registering as a ${type} on our platform.</p>
    <p>Your application is currently under review. We will notify you once it has been processed.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `,
  
  applicationStatus: (type, status) => `
    <h1>Application Status Update</h1>
    <p>Your ${type} application status has been updated to: <strong>${status}</strong></p>
    ${status === 'approved' 
      ? '<p>Congratulations! You can now proceed with the payment to complete your registration.</p>'
      : status === 'rejected'
        ? '<p>We regret to inform you that your application has been rejected. If you believe this is a mistake, please contact our support team.</p>'
        : ''
    }
  `,
  
  paymentReceipt: ({ amount, transactionId, date }) => `
    <h1>Payment Receipt</h1>
    <p>Thank you for your payment. Here are your transaction details:</p>
    <ul>
      <li>Amount: ${amount}</li>
      <li>Transaction ID: ${transactionId}</li>
      <li>Date: ${date}</li>
    </ul>
    <p>You can now access all features of our platform.</p>
  `
};

module.exports = {
  transporter,
  emailTemplates
};
