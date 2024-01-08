// workerLogin.js
const bcrypt = require('bcryptjs');
const dbConnection = require('../utils/dbconnection'); // Import your database connection module
const sendVerificationEmail = require('./sendVerificationEmail'); // Import your email sending module
const randomstring = require('randomstring');
const express = require("express");
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);



const workerLogin = async (req, res, next) => {
  const { workerMobile, workerPassword } = await req.body;

  try {
    const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);

    if (!rows || rows.length === 0) {
      // Worker with the provided mobile number not found
      return res.json({ success: false, message: 'Invalid mobile number or password. Please check your entries and try again' });
    }

    if (rows.length !== 1) {
      return res.json({ success: false, message: 'Invalid mobile number or password. Please check your entries and try again' });
    }

    const passwordFromDatabase = rows[0].worker_password;

    if (!passwordFromDatabase) {
      // Database entry for worker does not have a password (handle this case based on your application logic)
      return res.json({ success: false, message: 'Invalid mobile number or password' });
    }

    const checkPass = await bcrypt.compare(workerPassword, passwordFromDatabase);

    if (checkPass) {
      if (rows[0].account_verified !== 1) {
        let verificationCode = randomstring.generate({
          length: 8,
          charset: 'numeric',
        });

        // Send SMS...
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

        sendVerificationEmail(rows[0].worker_email, verificationCode);

        await dbConnection.execute("UPDATE `workers` SET `verification_code` =? WHERE `worker_email`=?", [verificationCode, rows[0].worker_email]);

        return res.json({ success: false, message: `Your account is not verified. Please check the code we sent to your email ${rows[0].worker_email}`, notVerified: true, email: rows[0].worker_email });
      }

      req.session.worker = { workerMobile };
      res.json({ success: true, message: 'Redirect user to the main dashboard' });
    } else {
      return res.json({ success: false, message: 'Invalid mobile number or password' });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = workerLogin;
