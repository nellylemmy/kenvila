// accountVerification.js

const dbConnection = require('../utils/dbconnection'); // Import your database connection module

const accountVerification = async (req, res) => {
  try {
    const { workerAccountVerification } = req.body;
    if (workerAccountVerification === undefined) {
      return res.json({ success: false, message: 'Please fill the Verification code' });
    }

    const [checkRows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `verification_code`=?', [workerAccountVerification]);

    if (!checkRows || checkRows.length === 0) {
      return res.json({ success: false, message: 'Invalid verification code. Code usually expires. Please request a new one.' });
    }

    console.log(checkRows[0].verification_code);
    const accountVerified = 1;

    if (!checkRows[0].verification_code) {
      return res.json({ success: false, message: 'Invalid Code' });
    }

    await dbConnection.execute("UPDATE `workers` SET `account_verified` =? WHERE `verification_code`=?", [accountVerified, checkRows[0].verification_code]);

    console.log('Verified successfully');
    res.json({ success: true, message: 'Account Verified successfully.' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Caught Error.' });
  }
};

module.exports = accountVerification;
