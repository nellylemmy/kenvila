require('dotenv').config();
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require("express");
const http = require('http');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const socketIO = require('socket.io');
const mysql = require('mysql2');
const crypto = require('crypto');
const fs = require('fs');
const dbConnection = require('./server/utils/dbconnection');

const error404 = require('./server/models/ui_error404');
const workerSignup = require('./server/routes/workerSignup');
const workerLogin = require('./server/routes/workerLogin');
const resetPasswordRequest = require('./server/routes/resetPasswordRequest');
const resetPasswordVerify = require('./server/routes/resetPasswordVerify');
const getMyTransactions = require('./server/routes/getMyTransactions');
const userLoginAttemptLimiter = require('./server/routes/rateLimiterConfig');
const getIpnList = require('./server/routes/getIpnList');
const insertData = require('./server/routes/insertData');
const accountVerification = require('./server/routes/accountVerification');
const registerIpn = require('./server/routes/registerIpn');
const submitOrder = require('./server/routes/submitOrder');
// require('./server/routes/insertData');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set static folder

app.use(compression({ level: 6, threshold: 0 }));
app.use(express.static('client/public'));
app.use(express.static(path.join(__dirname, 'client/public')));
app.use(express.static(path.join(__dirname, 'client/public/pages')));
app.use(express.static(path.join(__dirname, 'client/public/src/js')));
app.use(express.static(path.join(__dirname, 'client/public/src/media')));
app.use(express.static(path.join(__dirname, 'client/public/src/styles')));
app.use(express.static(path.join(__dirname, 'client/public/src/components')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.set('trust proxy', false);

// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ server });

// Serve static files from the public directory
app.use(express.static('public'));

// WebSocket connection handling
// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(message) {
//     // Handle incoming messages from clients
//     console.log('Received message from client:', message);
//     // Broadcast the message to all clients (in this case, the location update)
//     wss.clients.forEach(function each(client) {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });
// });

const PORT = process.env.APP_PORT;
const randomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
console.log(randomString())

// Simple encryption function

// const insertData = async (req, res, io) => {
//   // const { workerFirstName, workerLastName, workerMobile } = req.body;
//   const workerFirstName = 'nelson'
//   const workerLastName = 'lemein'
//   const workerMobile = '0741'
//   if (req.session.worker) {
//     console.log('worker', req.session.worker);
//       }

//   if (!workerFirstName || !workerLastName || !workerMobile) {
//     return res.status(400).json({ error: 'All input values are required' });
//   }

//   try {

//     res.json({ success: true, message: 'Redirect user to the main dashboard' }); 
//       let firstName = workerFirstName
//       let lastName = workerLastName

//       const fullNames = `${firstName} ${lastName}`
//       io.emit('fetchUserData', { workerFirstName, workerLastName, workerMobile });
      

//     // const query = 'INSERT INTO workers (worker_first_name, worker_last_name, worker_mobile_number) VALUES (?,?,?)';
//     // await dbConnection.query(query, [workerFirstName, workerLastName, workerMobile]);

//     // Emit a message to all connected clients with the new data

//     return res.json({
//       success: true,
//       message: 'User data fetched successfully',
//       name: fullNames,
//       phoneNumber: workerMobile
//     });
//   } catch (err) {
//     console.error('Error inserting data into MySQL: ', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

function encrypt(text) {
  // Generate a random 16-byte initialization vector
  const iv = crypto.randomBytes(32);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return both the encrypted text and the initialization vector
  return { encrypted, iv: iv.toString('hex') };
}



const algorithm = 'aes-192-cbc';
const password = process.env.ENCRYPTION_ALGORITHM_PASSWORD;
const encryptionKey = crypto.scryptSync(password, 'GfG', 24)
const iv = Buffer.alloc(16, 3);

function encryptedText(text) {
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  function decryptedText(text) {
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

// Socket.io logic
// io.on('connection', socket => {
//   console.log('User connected');
//   socket.emit('message', buildMsg(ADMIN, "Welcome to Chat App!"))

//   socket.on('login', userId => {
//     socket.join(userId);
//   });

//   socket.on('message', async data => {
//     let user_encryptedText = encryptedText(data.text);
//     let user_dycriptedText = decryptedText(user_encryptedText);

//     console.log(`Encrypted text: ${user_encryptedText}`);
//     console.log(`Dycripted text: ${user_dycriptedText}`);

//     io.to(data.room).emit('message', { userId: data.userId, text: user_dycriptedText, type: 'text' });
//   });
// });

const ADMIN = "Admin";
const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};











const users = {};

app.use(express.static('public'));

// io.on('connection', (socket) => {
//   socket.on('registerUser', ({ name, phoneNumber }) => {
//     users[phoneNumber] = { socketId: socket.id, name };
//     io.to(socket.id).emit('userRegistered', { name, phoneNumber });
//   });

//   socket.on('sendMessage', ({ from, to, message }) => {
//     const recipientSocketId = users[to]?.socketId;
//     if (recipientSocketId) {
//       io.to(recipientSocketId).emit('receiveMessage', { from, message });
//       io.to(socket.id).emit('messageSent', { to, message });
//     } else {
//       io.to(socket.id).emit('userNotValid', { to });
//     }
//   });

//   socket.on('typing', ({ name }) => {
//     io.emit('userTyping', { name });
//   });

//   socket.on('stopTyping', () => {
//     io.emit('userStoppedTyping');
//   });
// });











function buildMsg(name, text) { 
  return {
      name,
      text,
      time: new Intl.DateTimeFormat('default', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
      }).format(new Date())
  }
}

// User functions 
function activateUser(id, name, room) {
  const user = { id, name, room }
  UsersState.setUsers([
      ...UsersState.users.filter(user => user.id !== id),
      user
  ])
  return user
}

function userLeavesApp(id) {
  UsersState.setUsers(
      UsersState.users.filter(user => user.id !== id)
  )
}

function getUser(id) {
  return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room) {
  return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map(user => user.room)))
}

// Define the socket.io 'connection' event handler outside of the route handler
io.on('connection', socket => {
  console.log('User connected:', socket.id);
});
io.on('disconnect', socket => {
  console.log('User Disconnected:', socket.id);
});


app.get('/worker/message-room-data', async (req, res) => {
  if (req.session.worker) {
    const workerMobile = req.session.worker.workerMobile;
    const [rows] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);
    const fullWorkerName = `${rows[0].worker_first_name} ${rows[0].worker_last_name}`;
    const activeWorkerMobileNumber = `${rows[0].worker_mobile_number}`;
    const data = {
      name: fullWorkerName,
      phoneNumber: activeWorkerMobileNumber
    };

    io.to(activeWorkerMobileNumber).emit('worker-data', data);
    
    console.log('Emitted worker data to room:', activeWorkerMobileNumber);

    return res.json(data);
  } else {
    return res.redirect('/worker');
  }
});

app.use((req, res, next) => {
  let ipAddress = req.ip || req.socket.remoteAddress;

  console.log('Received IP address:', ipAddress);

  // If the IP address includes '::1', try to get the client IP from the 'x-forwarded-for' header
  if (ipAddress === '::1' && req.headers['x-forwarded-for']) {
      const forwardedFor = req.headers['x-forwarded-for'].split(',')[0];
      ipAddress = forwardedFor.trim();
  }

  console.log('Adjusted IP address:', ipAddress);

  // If the IP address still includes '::ffff:', remove it
  if (ipAddress && ipAddress.includes('::ffff:')) {
    ipAddress = ipAddress.replace(/^::ffff:/, '');
  }

  console.log('User IP:', ipAddress);

  // Pass the userIP to the next middleware or route
  req.userIP = ipAddress;

  next();
});




const axios = require('axios');

// Function to get location information
async function getLocation(ip) {
  const access_key = '38a323b8c683dcd7c69febbb9a7318bc';
  const apiUrl = `http://api.ipapi.com/${ip}?access_key=${access_key}`;
  
  try {
    const response = await axios.get(apiUrl);
    const locationData = response.data;
    return {
      country: locationData.country_name,
      city: locationData.location.city,
      callingCode: locationData.location.calling_code,
    };
  } catch (error) {
    console.error('Error fetching location data:', error.message);
    return null;
  }
}

// Function to get workers based on location
async function getWorkersByLocation(req, res) {
  const userIP = req.userIP;
  console.log('User IP:', userIP);

  // Get client location information
  const clientLocation = await getLocation(userIP);

  if (!clientLocation) {
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }

  try {
    // Fetch workers from the database
    const workerData = await dbConnection.execute('SELECT * FROM `workers`');
    const workers = workerData[0].map((worker) => ({
      id: worker.id,
      firstName: worker.worker_first_name,
      lastName: worker.worker_last_name,
      occupation: worker.occupation,
      workerImage: worker.worker_image,
      rating: worker.rating,
      reviews: worker.reviews,
      tendender: worker.tendender,
      // Add location information for each worker
      location: {
        country: worker.country,
        city: worker.city,
        callingCode: worker.calling_code,
      },
    }));

    // Filter workers based on location (e.g., within the same country)
    const filteredWorkers = workers.filter((worker) => {
      return worker.location.country === clientLocation.country;
    });

    // Sort workers based on location proximity (you can implement a more sophisticated sorting logic)
    const sortedWorkers = filteredWorkers.sort((a, b) => {
      // Implement your sorting logic here
      // For example, you can compare calling codes or distances
      return a.location.callingCode - b.location.callingCode;
    });

    res.json(sortedWorkers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Route for getting workers based on location
app.get('/api/workers', getWorkersByLocation);

// You can create a similar function for clients if needed
// ...

// Route for getting clients based on location
// app.get('/api/clients', getClientsByLocation);








app.get('/worker', async (req, res) => {
  if (req.session.worker) {
    return res.redirect('/worker/dashboard');
  }
  res.sendFile(path.join(__dirname, 'client/public/pages', 'worker.html'));
});

app.get('/worker/message-room', async (req, res) => {
  if (!req.session.worker) {
      return res.redirect('/worker');
    }
    // res.sendFile(path.join(__dirname, 'client/public/pages', 'messageRoom.html'));
    return insertData(req, res, io);
  });
  
  app.get('/', (req, res) => {
  if (req.session.worker) {
    return res.redirect('/worker/dashboard');
  } else {
    return res.redirect('/worker');
  }
});

app.get('/worker/dashboard', (req, res) => {
  if (!req.session.worker) {
    return res.redirect('/worker');
  }
  res.sendFile(path.join(__dirname, 'client/public/pages', 'dashboard.html'));
});

app.get('/my_transaction', getMyTransactions);
app.get('/ipn_list', getIpnList);
app.get('/worker', async (req, res) => {
  if (req.session.worker) {
    return res.redirect('/worker/dashboard');
  }
  res.sendFile(path.join(__dirname, 'client/public/pages', 'worker.html'));
});

app.get('/ipn-register', async (req, res) => {
  if (req.session.worker) {
    return res.sendFile(path.join(__dirname, 'client/public/pages', 'registerIPN.html'));
  }
  return res.redirect('/worker');
  // return res.sendFile(path.join(__dirname, 'client/public/pages', 'worker.html'));
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => err);
  res.redirect('/worker');
});

app.post('/signup', workerSignup);
app.post('/login',userLoginAttemptLimiter, workerLogin);
// app.post('/api/data', (req, res) => {
//   insertData(req, res, io);
// });
app.post('/reset-password/request', resetPasswordRequest);
app.post('/reset-password/verify', resetPasswordVerify);
app.post('/account-verification', accountVerification);
app.post('/register-ipn', registerIpn);
app.post('/submit-order', submitOrder);

app.use(async (req, res, next) => {
  try {
    res.status(404).send(error404)
  } catch (e) {
    next(e);
  }
})


server.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));

