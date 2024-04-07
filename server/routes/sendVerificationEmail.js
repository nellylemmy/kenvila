// emailSender.js

const nodemailer = require('nodemailer');

/**
 * Configures Nodemailer transporter to send emails using Gmail account.
 * Creates transporter using nodemailer.createTransport and passes gmail service, 
 * auth credentials and TLS config. Auth contains username and password.
 * TLS config disables certificate validation.
*/
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nelsonlemmy61@gmail.com', // Your email address
    pass: 'aqas bxsl ylww lcev'   // Your email password
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Sends a verification email to the provided email address 
 * with the given verification code in the email body.
 * 
 * @param {string} email - The email address to send the verification email to
 * @param {string} verificationCode - The verification code to include in the email body
 */
const sendVerificationEmail = (email, verificationCode) => {
  // Define the email content
  const mailOptions = {
    from: 'nelsonlemmy61@gmail.com',        // Sender address
    to: email,                           // Receiver address
    subject: 'Verification Code',        // Email subject
    text: `Your verification code is: ${verificationCode}`, // Email body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = sendVerificationEmail;
