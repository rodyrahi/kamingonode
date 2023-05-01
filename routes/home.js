const express = require("express");
const app = express();
var router = express.Router();
var con = require("../database.js");



router.get("/", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM profiles`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log("here");
          console.log(result);
  
          res.render("home", {
            isAuthenticated: req.oidc.isAuthenticated(),
            data: result,
          });
        }
      );
    } else {
      res.redirect("/login");
    }
  });


router.get("/filter", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM profiles`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log("here");
          console.log(result);
  
          res.render("home", {
            isAuthenticated: req.oidc.isAuthenticated(),
            data: result,
          });
        }
      );
    } else {
      res.redirect("/login");
    }
  });


module.exports = router