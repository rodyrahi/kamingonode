const express = require("express");
const session = require('express-session');

const app = express();
var router = express.Router();
var con = require("../database.js");

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


router.get("/", async (req, res) => {

    // req.session.phoneNumber = req.body.phoneNumber




    if (req.session.phoneNumber) {

      const result = await executeQuery(`SELECT * FROM profiles`)
      const comments = await executeQuery(`SELECT * FROM profiles`)
      
      res.render("home", {
        isAuthenticated: req.oidc.isAuthenticated(),
        data: result,
        rating: comments,
       })

    } else {
      res.render("login/whatsapplogin");
    }
  });


router.post("/filter", async (req, res) => {
    const{search , city , area , service , highest } = req.body
    filters = [search , city , area , service , highest]
    console.log(req.body);
    if (req.oidc.isAuthenticated()) {
        
      let result = await executeQuery(`SELECT * FROM profiles`)

      if (result) {
      await Promise.all(filters.map(async (element) => {
        if (element && element !== search && element !== highest ) {
          result = result.filter(
            (item) =>
              item.city === element ||
              item.area === element ||
              item.service === element
          );
        }
        if (element && element === search) {
          console.log(element);
         result= result.filter(
            (item) =>
              item.name.toLowerCase().includes(element.toLowerCase()) ||
              item.service.toLowerCase().includes(element.toLowerCase()) ||
              item.city.toLowerCase().includes(element.toLowerCase()) ||
              item.area.toLowerCase().includes(element.toLowerCase())
          );
        }
        if (element && element === highest) {
          const newresult = await executeQuery(`SELECT * FROM profiles ORDER BY rating DESC`)

          result= newresult
        }


      
        }))
        res.render("home", {
          isAuthenticated: req.oidc.isAuthenticated(),
          data: result,
        });
      }

    } else {
      res.redirect("/login");
    }
  });

router.get("/services/:name", async (req, res) => {
  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");

    if (req.oidc.isAuthenticated()) {
      const result = await executeQuery(
        `SELECT * FROM profiles  WHERE name ="${req.params.name}"`
      );
      const skills = await executeQuery(
        `SELECT * FROM skill  WHERE id ="${result[0]["id"]}"`
      );
      const comments = await executeQuery(
        `SELECT * FROM comments  WHERE post='${req.params.name}'`
      );

      let rating = 0;
      let userrating = 0;
      if (comments) {
        comments.forEach((element) => {
          rating += element["rating"];
          if (element.id === user) {
            userrating = element["rating"];
          }
        });

        console.log(rating);
        totalrating = rating / comments.length;
        totalrating = Math.round(totalrating * 10) / 10;

        await executeQuery(
          `UPDATE profiles SET rating='${totalrating}' WHERE name ="${req.params.name}"`
        );

        console.log(totalrating);

        res.render("profiles/profiledetail", {
          isAuthenticated: req.oidc.isAuthenticated(),
          data: result[0],
          comments: comments,
          user: req.oidc.user["sub"],
          skills: skills,
          rating: totalrating,
          userrating: userrating,
          ratingno: comments.length,
        });
      }
    } else {
      res.redirect("/login");
    }
  });
  

module.exports = router