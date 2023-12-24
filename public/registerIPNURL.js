const express = require("express");
const axios = require('axios');
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');

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
// const authentication = require('./public/authentication');
// const registerIPNURL = require('./public/registerIPNURL');


require('dotenv').config();

app.use(compression({ level: 6, threshold: 0 }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const APP_ENVIRONMENT = 'live'; // sandbox or live

let apiUrl, consumerKey, consumerSecret,ipnRegistrationUrl,SubmitOrderRequest,getIPNList;

if (APP_ENVIRONMENT === 'sandbox') {
    apiUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken'; // Sandbox URL
    ipnRegistrationUrl = 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN';
    SubmitOrderRequest = 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest';
    getIPNList = 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList';
    consumerKey = 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW';
    consumerSecret = 'osGQ364R49cXKeOYSpaOnT++rHs=';
} else if (APP_ENVIRONMENT === 'live') {
    apiUrl = 'https://pay.pesapal.com/v3/api/Auth/RequestToken'; // Live URL
    ipnRegistrationUrl = 'https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN';
    SubmitOrderRequest = 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest';
    getIPNList = 'https://pay.pesapal.com/v3/api/URLSetup/GetIpnList';
    consumerKey = 'oO1BAVZ9v4v0F9yJ95EEznpommeeFLKW';
    consumerSecret = 'ldp+6/Np3eWI1mc0RMxdw5co6LU=';
} else {
    console.log('Invalid APP_ENVIRONMENT');
    process.exit(1);
}


const authentication = async () => {
  try {
    const data = {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    };

    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.data; // Assuming the authentication key is in the response data
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error; // Propagate the error up the call stack
  }
};

console.log(authentication())

const registerIPNURL = async () => {
  // Handle POST requests for login
app.post('/register-ipn', async (req, res, next) => {
const { ipnInput } = await req.body;
console.log(ipnInput)
authentication()
.then(authKey => {
  let token = `Bearer ${authKey.token}`;
  var data = JSON.stringify({
    "url": ipnInput,
    "ipn_notification_type": "GET"
  });

  var config = {
    method: 'post',
  maxBodyLength: Infinity,
    url: ipnRegistrationUrl,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
    data : data
  };

  axios(config)
  console.log(axios(config))
  res.json({ success: true, message: axios(config) });
   
})
.catch(error => {
  console.error('Error:', error);
});


});
    try {

      
// .then(function (response) {
//   console.log(JSON.stringify(response.data));
// })
// .catch(function (error) {
//   console.log(error);
// });
  
  
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error; // Propagate the error up the call stack
    }
  };
  
  module.exports = registerIPNURL;