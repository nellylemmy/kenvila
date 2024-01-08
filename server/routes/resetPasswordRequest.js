const randomstring = require('randomstring');
const dbConnection = require('../utils/dbconnection'); // Import your database connection module
const sendVerificationEmail = require('./sendVerificationEmail'); // Import your email sending module

const resetPasswordRequest = async (req, res) => {
  const { workerMobile } = req.body;
  const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);

  if (!rows || rows.length === 0) {
    // Worker with the provided mobile number not found
    return res.json({ success: false, message: 'Invalid mobile number. Please check your number and try again' });
  }

  let resetCode = randomstring.generate({
    length: 8,
    charset: 'numeric',
  });

  // Store the reset code in the session (you may want to use a more persistent storage)
  req.session.resetCode = resetCode;
  req.session.resetMobile = workerMobile;
  req.session.resetTimestamp = Date.now();

  // Send the reset code to the worker (you can use an SMS service for a real application)
  console.log(`Reset code for ${workerMobile}: ${resetCode}`);
  sendVerificationEmail(rows[0].worker_email, resetCode);

  res.json({ success: true, message: 'Reset code sent successfully' });
};

module.exports = resetPasswordRequest;
