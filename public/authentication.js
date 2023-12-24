const axios = require('axios');

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

module.exports = authentication;