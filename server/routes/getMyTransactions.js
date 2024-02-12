const axios = require('axios');
const dbConnection = require('../utils/dbconnection');
const pesapalAuthentication = require('./pesapalAuthentication');
const pesapalConfig = require('./pesapalConfig'); 

const getMyTransactions = async (req, res) => {
  if (req.session.worker) {
    try {
      let [workersTransaction] = await dbConnection.execute(
        "SELECT * FROM `worker_transaction_list` WHERE `workers_transactions`=?",
        [req.session.worker.workerMobile]
      );
      const transactionDataList = [];

      for (const transaction of workersTransaction) {
        const authKey = await pesapalAuthentication();
        const token = `Bearer ${authKey.token}`;
        const getStatusConfig = {
          method: 'get',
          url: `${pesapalConfig.getTransactionStatus}${transaction.order_tracking_id}`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token,
          },
        };

        try {
          const response = await axios(getStatusConfig);
          const transactionData = response.data;
          console.log(JSON.stringify(transactionData));
          transactionDataList.push(transactionData);
        } catch (error) {
          console.log(error);
        }
      }
      console.log(transactionDataList)
      res.json(transactionDataList);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // return res.redirect('/');
    return res.send(`You are not logged in. Login to proceed`);
  }
};

module.exports = getMyTransactions;
