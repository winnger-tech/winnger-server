const nodemailer = require('nodemailer');
const crypto = require('crypto');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email templates
const templates = {
  paymentReceipt: data => ({
    subject: 'Payment Receipt - PR Launch Registration',
    html: `
      <h2>Payment Receipt</h2>
      <p>Dear ${data.name},</p>
      <p>Thank you for your payment. Here are the details:</p>
      <ul>
        <li>Registration Type: ${data.type}</li>
        <li>Amount Paid: $${data.amount} USD</li>
        <li>Transaction ID: ${data.transactionId}</li>
        <li>Date: ${new Date().toLocaleString()}</li>
      </ul>
      <p>Your registration is now being reviewed by our team. We'll notify you once it's approved.</p>
    `
  }),
  statusUpdate: data => ({
    subject: `Registration ${data.status} - PR Launch`,
    html: `
      <h2>Registration Status Update</h2>
      <p>Dear ${data.name},</p>
      <p>Your registration has been <strong>${data.status}</strong>.</p>
      ${data.status === 'approved' ? '<p>Welcome to PR Launch! You can now access your dashboard.</p>' : '<p>If you have any questions, please contact our support team.</p>'}
    `
  }),
  adminNotification: data => ({
    subject: 'New Registration Submission',
    html: `
      <h2>New ${data.type} Registration</h2>
      <p>A new registration has been submitted:</p>
      <ul>
        <li>Type: ${data.type}</li>
        <li>Name: ${data.name}</li>
        <li>Email: ${data.email}</li>
        <li>Payment Status: ${data.paymentStatus}</li>
      </ul>
      <p>Please review the submission in the admin dashboard.</p>
    `
  }),
  otpVerification: data => ({
    subject: 'OTP Verification - PR Launch',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${data.otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  })
};

// Email sending functions
const sendEmail = async (to, template, data) => {
  try {
    const {
      subject,
      html
    } = templates[template](data);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

// Send payment receipt email
const sendPaymentReceipt = async data => {
  try {
    const {
      subject,
      html
    } = templates.paymentReceipt(data);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.email,
      subject,
      html
    });
    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to send payment receipt:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send payment failed notification
const sendPaymentFailed = async data => {
  try {
    const subject = 'Payment Failed - PR Launch Registration';
    const html = `
      <h2>Payment Failed</h2>
      <p>Dear ${data.name},</p>
      <p>We're sorry, but your payment has failed. Here are the details:</p>
      <ul>
        <li>Registration Type: ${data.type}</li>
        <li>Amount: $${data.amount} USD</li>
        <li>Transaction ID: ${data.transactionId}</li>
        <li>Reason: ${data.reason}</li>
        <li>Date: ${new Date().toLocaleString()}</li>
      </ul>
      <p>Please try again or contact our support team if you continue to experience issues.</p>
      <p>You can retry your payment by visiting your registration dashboard.</p>
    `;
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.email,
      subject,
      html
    });
    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to send payment failed notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
const emailTemplates = {
  verificationEmail: otp => `
    <h2>Email Verification</h2>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `,
  registrationSuccess: type => `
    <h2>Registration Submitted Successfully</h2>
    <p>Thank you for registering as a ${type} partner.</p>
    <p>We will review your application and get back to you soon.</p>
  `,
  paymentReceipt: ({
    amount,
    transactionId,
    date
  }) => `
    <h2>Payment Receipt</h2>
    <p>Amount: $${amount}</p>
    <p>Transaction ID: ${transactionId}</p>
    <p>Date: ${date}</p>
  `,
  statusUpdate: (status, remarks) => `
    <h2>Application Status Update</h2>
    <p>Your application status has been updated to: <strong>${status}</strong></p>
    ${remarks ? `<p>Remarks: ${remarks}</p>` : ''}
  `
};

// Send verification email
const sendVerificationEmail = async email => {
  const otp = generateOTP();
  const html = emailTemplates.verificationEmail(otp);
  try {
    await sendEmail({
      email,
      subject: 'Email Verification',
      html
    });
    return {
      success: true,
      otp,
      expiresIn: 600 // 10 minutes in seconds
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
module.exports = {
  sendEmail,
  sendVerificationEmail,
  emailTemplates,
  sendPaymentReceipt,
  sendPaymentFailed
};