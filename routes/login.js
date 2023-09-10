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


async function sendmessage(number, message) {
  try {
    const apiUrl = "https://wapi.kamingo.in/send-message"; // Replace with the actual API URL

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number: number, message: message }),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("API Response:", responseData);
    } else {
      console.error("API Error:", response.status);
      // Send a JSON response with status 'error'
    }
  } catch (error) {
    console.error("Error:", error);
  }
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
  
    const message =
    "Your Kamingo Authentication Code is : " + "*" + randomCode + "*";


  sendmessage(number, message)
    .then(() => {
      console.log("Message sent successfully");
      const result = executeQuery(
        `SELECT * FROM chats WHERE number='${phonenumber}'`
      );

      if (result.length < 1) {
        executeQuery(`INSERT INTO chats (number) VALUES ('${phonenumber}')`);
      }

      res.render("logins/typecode", { number: phonenumber});
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.sendStatus(500); // Send an error response to the client
    });
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