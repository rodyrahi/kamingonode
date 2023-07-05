const express = require("express");
const app = express();
var router = express.Router();
const session = require('express-session');

var con = require("../database.js");
var client = require("../whatsapp.js");



function executeQuery(query) {
  return new Promise((resolve, reject) => {
    con.query(query, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

router.post('/', async (req, res) => {
    const { phoneNumber } = req.body;
    req.session.phoneNumber = req.body.phoneNumber

    const number = '+91' + phoneNumber;
  
    const generateRandomCode = () => {
      const codeLength = 5;
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        code += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
      }
      return code;
    };
  
    randomCode = generateRandomCode();
  
    console.log(number);
    client
      .sendMessage(`${+number}@c.us`, randomCode)
      .then(async () =>  res.sendStatus(200))
      .catch((error) => res.sendStatus(500));
  });
router.post('/code', async (req, res) => {
  
  const result = await executeQuery(`SELECT * FROM userprofiles WHERE id='${req.session.phoneNumber}'`);
    console.log(result.length);
    if (result.length < 1) {
      res.render('userprofile')

    }
    else{
      res.redirect('/home')

    }
  });
  module.exports = router