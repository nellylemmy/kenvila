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

require('dotenv').config();

app.use(compression({level: 6,threshold: 0}));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile('/public/index.html');
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

app.post('/api/data', async (req, res) => {
  const { workerFirstName, workerLastName, workerMobile } = req.body;

  if (!workerFirstName || !workerLastName || !workerMobile) {
    return res.status(400).json({ error: 'All input values are required' });
  }

  try {
    const query = 'INSERT INTO workers (worker_first_name, worker_last_name, worker_mobile_number) VALUES (?,?,?)';
    const [result] = await dbConnection.query(query, [workerFirstName, workerLastName, workerMobile]);

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

