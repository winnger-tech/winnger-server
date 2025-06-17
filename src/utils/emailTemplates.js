const emailTemplates = {
  registrationSuccess: (type) => `
    <h1>Registration Submitted Successfully</h1>
    <p>Thank you for registering your ${type} with Winnger. Your application is currently under review.</p>
    <p>We will notify you once our team has reviewed your application.</p>
    <p>If you have any questions, please contact our support team.</p>
  `,

  applicationStatus: (type, status) => `
    <h1>${type} Application Status Update</h1>
    <p>Your application has been ${status}.</p>
    ${status === 'approved' 
      ? '<p>You can now log in to your account and start using our services.</p>' 
      : status === 'rejected' 
        ? '<p>If you believe this is a mistake, please contact our support team.</p>'
        : ''
    }
  `,

  adminNotification: ({ type, businessName, businessEmail, registrationDate }) => `
    <h1>New ${type} Registration</h1>
    <div style="margin: 20px 0;">
      <p><strong>Business Name:</strong> ${businessName}</p>
      <p><strong>Business Email:</strong> ${businessEmail}</p>
      <p><strong>Registration Date:</strong> ${new Date(registrationDate).toLocaleString()}</p>
    </div>
    <p>Please review the application in the admin dashboard.</p>
    <a href="${process.env.ADMIN_DASHBOARD_URL}/registrations" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    ">Review Application</a>
  `
};

module.exports = emailTemplates; 