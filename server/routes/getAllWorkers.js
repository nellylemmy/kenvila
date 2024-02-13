const axios = require('axios');
const dbConnection = require('../utils/dbconnection');
const pesapalAuthentication = require('./pesapalAuthentication');
const pesapalConfig = require('./pesapalConfig'); 

const getAllWorkers = async (req, res) => {
    try {
      let [allWorkers] = await dbConnection.execute(
        "SELECT * FROM `workers`"
      );
      const allWorkersDataList = [];

      // for (const transaction of workersTransaction) {
      //   const authKey = await pesapalAuthentication();
      //   const token = `Bearer ${authKey.token}`;
      //   const getStatusConfig = {
      //     method: 'get',
      //     url: `${pesapalConfig.getTransactionStatus}${transaction.order_tracking_id}`,
      //     headers: {
      //       Accept: 'application/json',
      //       'Content-Type': 'application/json',
      //       Authorization: token,
      //     },
      //   };

      //   try {
      //     const response = await axios(getStatusConfig);
      //     const transactionData = response.data;
      //     console.log(JSON.stringify(transactionData));
      //     allWorkersDataList.push(transactionData);
      //   } catch (error) {
      //     console.log(error);
      //   }
      // }
      console.log(allWorkersDataList)
      res.json(allWorkersDataList);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

};

module.exports = getAllWorkers;
