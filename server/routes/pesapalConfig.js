require('dotenv').config();
const APP_ENVIRONMENT = 'live'; // sandbox or live

let apiUrl, consumerKey, consumerSecret, ipnRegistrationUrl, SubmitOrderRequest, getIPNList, getTransactionStatus;

if (APP_ENVIRONMENT === 'sandbox') {
  apiUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken'; // Sandbox URL
  ipnRegistrationUrl = 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN';
  SubmitOrderRequest = 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest';
  getIPNList = 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList';
  getTransactionStatus = 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=';
  consumerKey = process.env.SANDBOX_CONSUMER_KEY;
  consumerSecret = process.env.SANDBOX_CONSUMER_SECRET;
} else if (APP_ENVIRONMENT === 'live') {
  apiUrl = 'https://pay.pesapal.com/v3/api/Auth/RequestToken'; // Live URL
  ipnRegistrationUrl = 'https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN';
  SubmitOrderRequest = 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest';
  getIPNList = 'https://pay.pesapal.com/v3/api/URLSetup/GetIpnList';
  getTransactionStatus = 'https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=';
  consumerKey = process.env.LIVE_CONSUMER_KEY;
  consumerSecret = process.env.LIVE_CONSUMER_SECRET;
} else {
  console.log('Invalid APP_ENVIRONMENT');
  process.exit(1);
}

module.exports = {
  apiUrl,
  consumerKey,
  consumerSecret,
  ipnRegistrationUrl,
  SubmitOrderRequest,
  getIPNList,
  getTransactionStatus,
};
