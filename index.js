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

const PORT = 3000;
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
const password = '793553d5229621cbf9e241c529125c1b7c3723bff47eea888062007add5aa7';
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

io.on('connection', (socket) => {
  socket.on('registerUser', ({ name, phoneNumber }) => {
    users[phoneNumber] = { socketId: socket.id, name };
    io.to(socket.id).emit('userRegistered', { name, phoneNumber });
  });

  socket.on('sendMessage', ({ from, to, message }) => {
    const recipientSocketId = users[to]?.socketId;
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', { from, message });
      io.to(socket.id).emit('messageSent', { to, message });
    } else {
      io.to(socket.id).emit('userNotValid', { to });
    }
  });

  socket.on('typing', ({ name }) => {
    io.emit('userTyping', { name });
  });

  socket.on('stopTyping', () => {
    io.emit('userStoppedTyping');
  });
});











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
    
    
    io.on('connection', socket => {
      // Emit a socket event to the user
      console.log('Emitted worker data to room:', activeWorkerMobileNumber);
      console.log('User connected:', socket.id);
    });
    io.on('disconnect', socket => {
      console.log('User Disconnected:', socket.id);
    });
    

    return res.json(data);
  } else {
    return res.redirect('/worker');
  }
});



app.get('/api/workers', async (req, res) => {
  try {
    const workerData = await dbConnection.execute('SELECT * FROM `workers`');

    // Map each worker to their full name and join the results
    const workerNames = workerData[0].map((worker) => `${worker.worker_first_name} ${worker.worker_last_name}`).join(', ');

    console.log(workerNames);

    res.json({ workerNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



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
  res.sendFile(path.join(__dirname, 'client/public/pages', 'registerIPN.html'));
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

