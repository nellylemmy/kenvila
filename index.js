const express = require("express");
const axios = require('axios');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');
const dbConnection = require("./utils/dbconnection");
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const authentication = require('./public/authentication');
require('./public/registerIPNURL');
const error404 = require('./ui_error404');
const rateLimiterMessage = require('./rateLimiterMessage');

require('dotenv').config();

app.use(compression({ level: 6, threshold: 0 }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  name: 'session',
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000000, // Set the maximum age of the session cookie to 1 minute (60,000 milliseconds)
    secure: false, // Ensure that the session cookie is only sent over HTTPS
    // sameSite: 'strict' // Enforce strict same-site policy for the session cookie
  }
}));
let rateLimitMessage = {
  windowMs: 3 * 60 * 1000, // 6 minutes
  max: 100, // Limit each IP to 20 requests per `window` (here, per 6 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: ({ success: false, message: rateLimiterMessage })
};

// Rate limiting middleware
const userLoginAttemptLimiter = rateLimit(rateLimitMessage);
app.use('/login', (userLoginAttemptLimiter))

// generate argent number
let generateRandomNumbers = function (amount, limit) {
  var result = [],
    memo = {};

  while (result.length < amount) {
    var num = Math.floor((Math.random() * limit) + 1);
    if (!memo[num]) { memo[num] = num; result.push(num); };
  }
  return result;
}


app.get('/worker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'worker.html'));
});

app.get('/', (req, res) => {
  if (req.session.worker) {
    // return res.json({ success: true, message: 'redirecting worker to main dashboard...' });
    return res.redirect('/worker/dashboard');
    // return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    // return res.json({ success: false, message: 'Worker Must Log in first...' });
    return res.redirect('/worker');
    // return res.sendFile(path.join(__dirname, 'public', 'home.html'));
  }
});

app.get('/worker/dashboard', (req, res) => {
  // Check if the user is logged in
  if (!req.session.worker) {
    return res.redirect('/worker');
  }
  // Render the dashboard page for authenticated users
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/ipn-register', (req, res) => {
  // Render the dashboard page for authenticated users
  res.sendFile(path.join(__dirname, 'public', 'registerIPN.html'));
});

// Handle POST requests for signup
app.post('/signup', async (req, res, next) => { 
  const { workerFirstName, workerLastName, workerMobile, workerPassword } = await req.body;
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


    const [rows] = await dbConnection.execute(
      "INSERT INTO `workers`(`worker_public_id`,`worker_first_name`,`worker_last_name`,`worker_mobile_number`,`worker_password`) VALUES (?,?,?,?,?)",
      [workerPublicId, workerFirstName, workerLastName, workerMobile, workerHashPassword]
    );


    if (rows.affectedRows !== 1) {
      return res.render("Your registration has failed.")
    }
    console.log('data inserted');
    res.json({ success: true, message: 'Data inserted successfully' });

  } catch (e) {
    next(e);
  }

});


// Handle POST requests for login
app.post('/login', async (req, res, next) => {
  const { workerMobile, workerPassword } = await req.body;
  try {
    const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);

    if (!rows || rows.length === 0) {
      // Worker with the provided mobile number not found
      return res.json({ success: false, message: 'Invalid mobile number or password. Please check your entries and try again' });
    }

    if (rows.length != 1) {
      return res.json({ success: false, message: 'Invalid mobile number or password. Please check your entries and try again' });
    }

    const passwordFromDatabase = rows[0].worker_password;

    if (!passwordFromDatabase) {
      // Database entry for worker does not have a password (handle this case based on your application logic)
      return res.json({ success: false, message: 'Invalid mobile number or password' });
    }


    const checkPass = await bcrypt.compare(workerPassword, passwordFromDatabase);

    if (checkPass === true) {
      req.session.worker = { workerMobile };
      res.json({ success: true, message: 'redirect user to main dashboard' });
    }else{
      return res.json({ success: false, message: 'Invalid mobile number or password' });
    }

  }
  catch (e) {
    next(e);
  }
});

// Handle GET requests to fetch data from the database
// app.get('/api/data', async (req, res) => {
//   try {
//     // Fetch data from the database using async/await
//     const query = 'SELECT worker_first_name, worker_last_name, worker_mobile_number FROM workers';
//     const [result] = await dbConnection.query(query);
//     res.json(result);
//   } catch (err) {
//     console.error('Error fetching data from MySQL: ', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.get('/logout', (req, res) => {
  req.session.destroy((err) => err);
  res.redirect('/');
});

app.post('/api/data', async (req, res) => {
  const { workerFirstName, workerLastName, workerMobile } = req.body;

  if (!workerFirstName || !workerLastName || !workerMobile) {
    return res.status(400).json({ error: 'All input values are required' });
  }

  try {
    const query = 'INSERT INTO workers (worker_first_name, worker_last_name, worker_mobile_number) VALUES (?,?,?)';
    await dbConnection.query(query, [workerFirstName, workerLastName, workerMobile]);

    // Emit a message to all connected clients with the new data
    io.emit('newData', { workerFirstName, workerLastName, workerMobile });

    res.json({ success: true, message: 'Data inserted successfully' });
  } catch (err) {
    console.error('Error inserting data into MySQL: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const expirationTimeInMinutes = 1; // Set the expiration time for the reset code

// Route to request a password reset
app.post('/reset-password/request', async(req, res) => {
  const { workerMobile } = req.body;
  const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);

  if (!rows || rows.length === 0) {
    // Worker with the provided mobile number not found
    return res.json({ success: false, message: 'Invalid mobile number. Please check your number and try again' });
  }

  // Generate a random reset code (you can customize the length as needed)
  const resetCode = randomstring.generate({
    length: 6,
    charset: 'numeric',
  });

  // Store the reset code in the session (you may want to use a more persistent storage)
  req.session.resetCode = resetCode;
  req.session.resetMobile = workerMobile;
  req.session.resetTimestamp = Date.now();

  // Send the reset code to the worker (you can use a SMS service for a real application)
  console.log(`Reset code for ${workerMobile}: ${resetCode}`);

  res.json({ success: true, message: 'Reset code sent successfully' });
});


// Route to verify the reset code and update the password
app.post('/reset-password/verify', async (req, res) => {
  const { resetCode, newPassword } = req.body;

  // Check if the reset code matches the one stored in the session
  if (resetCode !== req.session.resetCode) {
    return res.json({ success: false, message: 'Invalid reset code. Reset code usually expires. Please request anew one' });
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
  // const worker = workersDatabase.find(w => w.workerMobile === req.session.resetMobile);
  if (!req.session.resetMobile) {
    return res.json({ success: false, message: 'Worker not found' });
  }

  if (newPassword.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update the worker's password in the database (you may want to use a more secure storage)
  const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [req.session.resetMobile]);

  const passwordFromSession = rows[0].worker_password;

    if (!passwordFromSession) {
      // Database entry for worker does not have a password (handle this case based on your application logic)
      return res.json({ success: false, message: 'Invalid mobile number' });
    }
    dbConnection.execute("UPDATE `workers` SET `worker_password` =? WHERE `worker_mobile_number`=?", [hashedPassword, req.session.resetMobile]);

  // worker.workerPassword = hashedPassword;

  // Clear the reset code, mobile, and timestamp from the session
  delete req.session.resetCode;
  delete req.session.resetMobile;
  delete req.session.resetTimestamp;

  console.log('Password reset successful')
  res.json({ success: true, message: 'Password reset successful. Log in with your number and the new password' });
});


//==========================================================================
        //  PESAPAL API START
//==========================================================================



// authentication()
//   .then(authKey => {
//     console.log(`Bearer ${authKey.token}`);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

async function submitOrder(req,res) {
await axios.post(apiUrl, data, { headers })
    .then(response => {
        const token = response.data.token;
        // Use the token as needed
        console.log('Token:', token);
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      };
      
      const merchantReference = Math.floor(Math.random() * 1000000000000000000);
      const phone = 792471415;
      const countryCode = '254';
      const amount = 15.30;
      const callbackUrl = 'https://afe2-41-81-145-186.ngrok-free.app/';
      const branch = 'KENCODERS KE';
      const firstName = 'Nelson';
      const middleName = 'Lemein';
      const lastName = 'Kilelo';
      const emailAddress = 'nelson.lemein@yahoo.com';

      var data = JSON.stringify({
        "id": merchantReference,
        "currency": "KES",
        "amount": amount,
        "description": "Payment By NELSON",
        "callback_url": callbackUrl,
        "notification_id": "4d4de977-b3e6-4597-b128-ddd3fce22016",
        "branch": branch,
        "billing_address": {
          "email_address": emailAddress,
          "phone_number": phone,
          "country_code": countryCode,
          "first_name": firstName,
          "middle_name": middleName,
          "last_name": lastName,
          "line_1": "",
          "line_2": "",
          "city": "",
          "state": "",
          "postal_code": null,
          "zip_code": null
        }
      });

    })
    .catch(error => {
        console.error('Error:', error.message);
    });

  }
  // submitOrder()
//==========================================================================
        //  PESAPAL API STOP
//==========================================================================


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('This client is connected to socket.io');
});

app.use(async (req, res, next) => {
  try {
    res.status(404).send(error404)
  } catch (e) {
    next(e);
  }
})

const PORT = 3000;
server.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));

