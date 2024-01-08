const axios = require('axios');
const pesapalConfig = require('./pesapalConfig');

const pesapalAuthentication = async () => {
  try {
    const data = {
      consumer_key: pesapalConfig.consumerKey,
      consumer_secret: pesapalConfig.consumerSecret,
    };

    const response = await axios.post(pesapalConfig.apiUrl, data, {
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

module.exports = pesapalAuthentication;
