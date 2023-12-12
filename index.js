const express = require("express");
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

require('dotenv').config();

app.use(compression({ level: 6, threshold: 0 }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const rateLimiterMessage = `<style>
section{
    max-width:30rem;
    margin:5rem auto;
}
.card {
    display: flex;
    flex-direction: column;
    border: 1px red solid;
}
.header {
    height: 30%;
    background: red;
    color: white;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 600;
}
.container {
    padding: 2px 16px;
}
</style>

<section>
<div class="card">
<div class="header">
    <p>Too Many Request! Please Wait for 15 minutes</p>
</div>
    <div class="container">
    <p>We apologize for the inconvenience, but it seems that there has been unusual activity detected from your device. To ensure the security of your account, we have temporarily restricted access for the next 15 minutes. This precautionary measure helps us protect your account from potential unauthorized access.
    </p>

    <p>
    If you have forgotten your account information or need assistance, please don't hesitate to contact our support team. We'll be happy to assist you in recovering your account.
    </p>
    
    <p>Thank you for your understanding and cooperation in maintaining the security of your account.</p>
</div>
</div>
</section>`;

const noAccountWithThatPhoneNumberMessage = `<style>
section{
    max-width:30rem;
    margin:5rem auto;
}
.card {
    display: flex;
    flex-direction: column;
    border: 1px red solid;
}
.header {
    height: 30%;
    background: red;
    color: white;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 600;
}
.container {
    padding: 2px 16px;
}
</style>

<section>
<div class="card">
<div class="header">
    <p>Phone Number Not Registered!</p>
</div>
    <div class="container">
    <p>Hello there, The phone number provided is not in our system. Please SignUp or LogIn with another phone number.
    </p>

    <p>
    If you have forgotten your account information or need assistance, please contact our support team. We'll be happy to assist you in recovering your account.
    </p>
    
    <p><a href="/login.html">Login</a></p>
    <p><a href="/signup.html">Signup</a></p>
</div>
</div>
</section>`;


app.use((req, res, next) => {
  res.status(404).send(`<style>body {
      background-color: #2F3242;
    }
    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -250px;
      margin-left: -400px;
    }
    .message-box {
      height: 200px;
      width: 380px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -100px;
      margin-left: 50px;
      color: #FFF;
      font-family: Roboto;
      font-weight: 300;
    }
    .message-box h1 {
      font-size: 60px;
      line-height: 46px;
      margin-bottom: 40px;
    }
    .buttons-con .action-link-wrap {
      margin-top: 40px;
    }
    .buttons-con .action-link-wrap a {
      background: #68c950;
      padding: 8px 25px;
      border-radius: 4px;
      color: #FFF;
      font-weight: bold;
      font-size: 14px;
      transition: all 0.3s linear;
      cursor: pointer;
      text-decoration: none;
      margin-right: 10px
    }
    .buttons-con .action-link-wrap a:hover {
      background: #5A5C6C;
      color: #fff;
    }
    
    #Polygon-1 , #Polygon-2 , #Polygon-3 , #Polygon-4 , #Polygon-4, #Polygon-5 {
      animation: float 1s infinite ease-in-out alternate;
    }
    #Polygon-2 {
      animation-delay: .2s; 
    }
    #Polygon-3 {
      animation-delay: .4s; 
    }
    #Polygon-4 {
      animation-delay: .6s; 
    }
    #Polygon-5 {
      animation-delay: .8s; 
    }
    
    @keyframes float {
        100% {
        transform: translateY(20px);
      }
    }
    @media (max-width: 450px) {
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -250px;
        margin-left: -190px;
      }
      .message-box {
        top: 50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -190px;
        text-align: center;
      }
    }</style><svg width="380px" height="500px" viewBox="0 0 837 1045" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
      <path d="M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z" id="Polygon-1" stroke="#007FB2" stroke-width="6" sketch:type="MSShapeGroup"></path>
      <path d="M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z" id="Polygon-2" stroke="#EF4A5B" stroke-width="6" sketch:type="MSShapeGroup"></path>
      <path d="M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z" id="Polygon-3" stroke="#795D9C" stroke-width="6" sketch:type="MSShapeGroup"></path>
      <path d="M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z" id="Polygon-4" stroke="#F2773F" stroke-width="6" sketch:type="MSShapeGroup"></path>
      <path d="M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z" id="Polygon-5" stroke="#36B455" stroke-width="6" sketch:type="MSShapeGroup"></path>
  </g>
</svg>
<div class="message-box">
<h1>404</h1>
<p>Page not found</p>
<div class="buttons-con">
  <div class="action-link-wrap">
    <a onclick="history.back(-1)" class="link-button link-back-button">Go Back</a>
  </div>
</div>
</div>`)
})


let rateLimitMessage = {
  windowMs: 3 * 60 * 1000, // 6 minutes
  max: 100, // Limit each IP to 20 requests per `window` (here, per 6 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: ({ success: false, message: rateLimiterMessage })
};
// Error 429 (Too Many Requests) We detected that you sent wrong account information and we intentionally decide to freeze your system for a short period. please try again later. 
const userLoginAttemptLimiter = rateLimit(rateLimitMessage);



// // Middleware for session handling
// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
// }));

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

// // Rate limiting middleware
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 2, // limit each IP to 50 requests per windowMs
//   message: 'Too many requests from this IP, please try again after some time.',
// });
// app.use('/login', limiter);
app.use('/login', (userLoginAttemptLimiter))

// Set up a simple HTML form for login
app.get('/worker/login', (req, res) => {
  // Check if the worker is already logged in
  if (req.session.worker) {
    return res.redirect('/worker/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Set up a simple HTML form for signup
app.get('/worker/signup', (req, res) => {
  if (req.session.worker) {
    return res.redirect('/worker/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/worker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'worker.html'));
});



app.get('/', (req, res) => {
  if (req.session.worker) {
    // return res.json({ success: true, message: 'redirecting worker to main dashboard...' });
    return res.redirect('/worker/dashboard');
    // return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  }else{
    // return res.json({ success: false, message: 'Worker Must Log in first...' });
    return res.redirect('/worker');
    // return res.sendFile(path.join(__dirname, 'public', 'home.html'));
  }
});
// res.sendFile(path.join(__dirname, 'public', 'index.html'));

app.get('/worker/dashboard', (req, res) => {
  // Check if the user is logged in
  if (!req.session.worker) {
    return res.redirect('/worker');
  }

  // Render the dashboard page for authenticated users
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Handle POST requests for signup
app.post('/signup', async (req, res, next) => {
  const { workerFirstName, workerLastName, workerMobile } = req.body;
    
try {
        
const [row] = await dbConnection.execute(
  "SELECT * FROM `workers` WHERE `worker_mobile_number`=?",
  [workerMobile]
  );
            
if (row.length >= 1) {
  console.log('This Phone Number has already been used.');
  return res.json({ success: false, message: 'This Phone Number has already been used.' });
}
        
// const [rowEmail] = await dbConnection.execute(
//   "SELECT * FROM `users` WHERE `email`=?",
//   [body.email]
// );
            
// if (rowEmail.length >= 1) {
// return res.render('user/register', {
//   error: 'This Email has already been used.'
// });
// }
        
// const hashPass = await bcrypt.hash(body.password, 12);
// const pid = generateRandomNumbers(9,9).join('');

const [rows] = await dbConnection.execute(
  "INSERT INTO `workers`(`worker_first_name`,`worker_last_name`,`worker_mobile_number`) VALUES (?,?,?)",
  [workerFirstName, workerLastName, workerMobile]
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
app.post('/login', async (req, res) => {
  const { workerFirstName, workerLastName, workerMobile } = req.body;
      
  try {
          
  const [row] = await dbConnection.execute('SELECT * FROM `workers` WHERE `worker_mobile_number`=?', [workerMobile]);
  
  if (row.length != 1) {
    return res.json({ success: false, message: noAccountWithThatPhoneNumberMessage});
  }
  
  // const checkPass = await bcrypt.compare(body.password, row[0].password);
  
  // if (checkPass === true) {
  //   req.session.userID = row[0].id;
  //   return res.redirect('/');
  // }
  // Store worker information in the session
  req.session.worker = { workerMobile };
  res.json({ success: true, message: 'redirect user to main dashboard' });
  // res.render('user/login', {
  //   error: 'Credentials ERROR.'
  // });
  }
  catch (e) {
    next(e);
  }  
});

// Handle GET requests to fetch data from the database
app.get('/api/data', async (req, res) => {
  try {
    // Fetch data from the database using async/await
    const query = 'SELECT worker_first_name, worker_last_name, worker_mobile_number FROM workers';
    const [result] = await dbConnection.query(query);
    res.json(result);
  } catch (err) {
    console.error('Error fetching data from MySQL: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
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
// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('This client is connected to socket.io');
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));

