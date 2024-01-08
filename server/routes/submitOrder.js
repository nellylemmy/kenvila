const axios = require('axios');
const pesapalAuthentication = require('./pesapalAuthentication');
const pesapalConfig = require('./pesapalConfig');
const dbConnection = require('../utils/dbconnection');

const submitOrder = async (req, res) => {
  try {
    if (req.session.worker) {
      const { amountInput } = req.body;

      const authKey = await pesapalAuthentication();
      const token = `Bearer ${authKey.token}`;

      function removeLeadingZeros(numberString) {
        const result = parseInt(numberString, 10);
        return result.toString();
      }

      const phoneNumber = req.session.worker.workerMobile;
      const formattedPhoneNumber = removeLeadingZeros(phoneNumber);

      const merchantReference = Math.floor(Math.random() * 1000000000000000);
      const phone = formattedPhoneNumber;
      const countryCode = '254';
      const callbackUrl = 'http://localhost:3000/';
      const notificationId = 'ce3407d6-1f5f-441e-8b06-ddc86428ac98';
      const branch = 'KENCODERS KE';
      const firstName = 'Nelson';
      const middleName = 'Lemein';
      const lastName = 'Kilelo';
      const emailAddress = 'nelson.lemein@yahoo.com';

      const data = JSON.stringify({
        "id": merchantReference,
        "currency": "KES",
        "amount": amountInput,
        "description": "Payment By NELSON",
        "callback_url": callbackUrl,
        "notification_id": notificationId,
        "branch": branch,
        "billing_address": {
          "email_address": emailAddress,
          "phone_number": phone,
          "country_code": countryCode,
          "first_name": firstName,
          "middle_name": middleName,
          "last_name": lastName,
          "line_1": "",
          "line_2": "",
          "city": "",
          "state": "",
          "postal_code": null,
          "zip_code": null
        }
      });

      const config = {
        method: 'post',
        url: pesapalConfig.SubmitOrderRequest,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
        },
        data: data,
      };

      const response = await axios(config);
      const [rows] = await dbConnection.execute(
        "INSERT INTO `worker_transaction_list`(`workers_transactions`,`order_tracking_id`) VALUES (?,?)", [`${req.session.worker.workerMobile}`, response.data.order_tracking_id]
      );

      if (rows.affectedRows !== 1) {
        return res.render("Your order tracking failed.")
      }

      res.json({ success: true, message: `Order Sent Successfully: Status-${response.data.status}`, paymentURL: response.data.redirect_url });
    } else {
      res.json({ success: false, message: 'Please LogIn To make payments' });
    }
  } catch (error) {
    console.error('Error on Placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = submitOrder;
