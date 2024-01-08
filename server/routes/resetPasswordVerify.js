// resetPasswordVerify.js

const bcrypt = require('bcryptjs');
const dbConnection = require('../utils/dbconnection'); // Import your database connection module

const resetPasswordVerify = async (req, res) => {
  const { resetCode, newPassword } = req.body;
  const expirationTimeInMinutes = 15; // Adjust this as needed

  // Check if the reset code matches the one stored in the session
  if (resetCode !== req.session.resetCode) {
    return res.json({ success: false, message: 'Invalid reset code. Reset code usually expires. Please request a new one' });
  }

  // Check if the reset code has expired
  const currentTime = Date.now();
  const resetTimestamp = req.session.resetTimestamp || 0;
  const elapsedTime = (currentTime - resetTimestamp) / (1000 * 60); // Convert milliseconds to minutes

  if (elapsedTime > expirationTimeInMinutes) {
    // Reset code has expired
    delete req.session.resetCode;
    delete req.session.resetMobile;
    delete req.session.resetTimestamp;
    return res.json({ success: false, message: 'Reset code has expired' });
  }

  // Find the worker based on the mobile number stored in the session
  const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [req.session.resetMobile]);

  if (!req.session.resetMobile || rows.length === 0) {
    return res.json({ success: false, message: 'Worker not found' });
  }

  if (newPassword.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update the worker's password in the database (you may want to use a more secure storage)
  dbConnection.execute("UPDATE `workers` SET `worker_password` =? WHERE `worker_mobile_number`=?", [hashedPassword, req.session.resetMobile]);

  // Clear the reset code, mobile, and timestamp from the session
  delete req.session.resetCode;
  delete req.session.resetMobile;
  delete req.session.resetTimestamp;

  console.log('Password reset successful')
  res.json({ success: true, message: 'Password reset successful. Log in with your number and the new password' });
};

module.exports = resetPasswordVerify;
