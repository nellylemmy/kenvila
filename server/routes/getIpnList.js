// getIpnList.js

const axios = require('axios');
const pesapalAuthentication = require('./pesapalAuthentication'); // Import your pesapal authentication module
const pesapalConfig = require('./pesapalConfig'); // Import your pesapal configuration module

const getIpnList = async (req, res) => {
  try {
    const authKey = await pesapalAuthentication();
    const token = `Bearer ${authKey.token}`;
    const getIPNconfig = {
      method: 'get',
      url: pesapalConfig.getIPNList,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    const response = await axios(getIPNconfig);
    const ipnData = response.data;

    res.json(ipnData); // Send JSON data as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = getIpnList;
