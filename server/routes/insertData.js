// insertData.js

const dbConnection = require('../utils/dbconnection'); // Import your database connection module
const path = require('path');
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, 'client/public/pages')));
app.use(express.static(path.join(__dirname, './../../../client/public/pages')));

const insertData = async (req, res, io) => {
try {
  if (req.session.worker) {
    return res.sendFile(path.join(__dirname, './../../client/public/pages', 'messageRoom.html'));
  }else{
    return res.redirect('/worker');
  }
} catch (err) {
  console.error('Error inserting data into MySQL: ', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

module.exports = insertData;
