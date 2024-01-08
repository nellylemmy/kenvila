const axios = require('axios');
const pesapalAuthentication = require('./pesapalAuthentication');
const pesapalConfig = require('./pesapalConfig');
const registerIpn = async (req, res) => {
  try {
    const { ipnInput } = req.body;

    const authKey = await pesapalAuthentication();
    const token = `Bearer ${authKey.token}`;

    const data = JSON.stringify({
      url: ipnInput,
      ipn_notification_type: 'GET',
    });

    const config = {
      method: 'post',
      url: pesapalConfig.ipnRegistrationUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      data: data,
    };

    const response = await axios(config);
    res.json({ success: true, message: `IPN registration successful URL: ${response.data.url}, IPN_ID: ${response.data.ipn_id}` });
  } catch (error) {
    console.error('Error during IPN registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = registerIpn;
