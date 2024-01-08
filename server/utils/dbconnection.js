
// DATABASE CREDENTIALS
const mysql = require('mysql2');
require('dotenv').config();

let dbConnection = mysql.createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

dbConnection.getConnection((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ', err);
      return;
    }
    console.log('Connected to MySQL');
  });

// Set up MySQL connection using promises
module.exports = dbConnection.promise();