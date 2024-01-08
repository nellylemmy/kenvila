const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const dbConnection = require('../utils/dbconnection'); // Import your database connection module
const sendVerificationEmail = require('./sendVerificationEmail'); // Import your email sending module
const generateRandomNumbers = require('./randomNumberGenerator');

const workerSignup = async (req, res, next) => {
    const { workerFirstName, workerLastName, workerMobile, workerEmail, workerPassword } = await req.body;
    try {
        // Validate inputs
        if (workerFirstName.length < 3) {
          return res.json({ success: false, message: 'First name must be at least 3 characters long' });
        }
        if (workerLastName.length < 3) {
          return res.json({ success: false, message: 'Last name must be at least 3 characters long' });
        }
    
        // Check if workerFirstName contains only letters and numbers
        if (!/^[a-zA-Z0-9]+$/.test(workerFirstName)) {
          return res.json({ success: false, message: 'First name must contain only letters and numbers' });
        }
    
        // Check if workerLastName contains only letters and numbers
        if (!/^[a-zA-Z0-9]+$/.test(workerLastName)) {
          return res.json({ success: false, message: 'Last name must contain only letters and numbers' });
        }
    
        if (workerPassword.length < 6) {
          return res.json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        const workerHashPassword = await bcrypt.hash(workerPassword, 12);
        const workerPublicId = generateRandomNumbers(9, 9).join('');
    
        const [row] = await dbConnection.execute(
          "SELECT * FROM `workers` WHERE `worker_mobile_number`=?",
          [workerMobile]
        );
        if (row.length >= 1) {
          console.log('This Phone Number has already been used.');
          return res.json({ success: false, message: 'This Phone Number has already been used.' });
        }
    
        const [row2] = await dbConnection.execute(
          "SELECT * FROM `workers` WHERE `worker_email`=?",
          [workerEmail]
        );
        if (row2.length >= 1) {
          console.log('This Email has already been used.');
          return res.json({ success: false, message: 'This Email has already been used.' });
        }
    
        let verificationCode = randomstring.generate({
          length: 8,
          charset: 'numeric',
        });
    
        const workerVerificationCode = verificationCode;
        const accountVerified = 0;
    
        const [rows] = await dbConnection.execute(
          "INSERT INTO `workers`(`worker_public_id`,`worker_first_name`,`worker_last_name`,`worker_mobile_number`,`worker_email`,`worker_password`, `verification_code`,`account_verified`) VALUES (?,?,?,?,?,?,?,?)",
          [workerPublicId, workerFirstName, workerLastName, workerMobile, workerEmail, workerHashPassword, workerVerificationCode, accountVerified]
        );
        sendVerificationEmail(workerEmail, workerVerificationCode)
    
        const accountSid = 'AC03ae7a028065ef7541ffc3a9e961e842';
        const authToken = '39f32eaaa08a8f1088e394bb5b7afe0a';
        const twilioPhoneNumber = '+14108452540';
        const client = require('twilio')(accountSid, authToken);
        const sendSms = async (to, message) => {
          try {
            const result = await client.messages.create({
              body: message,
              from: twilioPhoneNumber,
              to: to,
            });
            console.log(`SMS sent to ${to}: ${result.sid}`);
            return result.sid;
          } catch (error) {
            console.error('Error sending SMS:', error.message);
            throw error;
          }
        };
    
        // Example usage
        const toPhoneNumber = '+254741642093'; // Replace with the recipient's phone number
        const smsMessage = `Your Verification Code Is ${verificationCode}`;
    
        sendSms(toPhoneNumber, smsMessage)
          .then(() => {
            console.log(`SMS sent successfully`);
          })
          .catch((error) => {
            console.error('Failed to send SMS:', error.message);
          });
    
        console.log(workerEmail)
        console.log(workerVerificationCode)
    
        if (rows.affectedRows !== 1) {
          return res.render("Your registration has failed.")
        }
    
        // check if account_verified is 0 or 1
        const [checkAccountVerifiedRow] = await dbConnection.execute(
          "SELECT * FROM `workers` WHERE `worker_mobile_number`=?",
          [workerMobile]
        );
    
        await dbConnection.execute("UPDATE `workers` SET `verification_code` =? WHERE `worker_email`=?", [workerVerificationCode, workerEmail]);
    
    
        if (checkAccountVerifiedRow[0].account_verified == 0) {
          return res.status(200).json({ success: true, message: 'Account created successfully.Check your email for a one time verification code. Copy and paste in to the inpu after clicking the OK button below' });
        } else {
          res.json({ success: false, message: 'There was an error!' });
        }
    
      } catch (e) {
        next(e);
      }
};

module.exports = workerSignup;
