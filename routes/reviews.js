const express = require("express");
const app = express();
var router = express.Router();
var con = require("../database.js");
const { post } = require("./home.js");


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

  router.post("/postcomment",  async (req, res) => {
    user = req.session.phoneNumber;
    // nickname = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(
    //   /"/g,
    //   ""
    // );

    const result = await executeQuery(`SELECT * FROM userprofiles WHERE id='${user}'`)

    nickname = result[0].name
    photo = result[0].image;
    const { name, comment, rating } = req.body;
  
    console.log(req.body);
  
    con.query(
      `SELECT * FROM comments WHERE post='${name}' AND id='${user}'`,
      function (err, com, fields) {
        if (err) {
          console.log(err);
        }
        console.log(com);

          if (com.length !== 0) {
            //  console.log('this');
            con.query(
              `UPDATE comments SET id='${user}',name='${nickname}',post='${name}',comment='${comment}',photo='${photo}',rating=${rating} WHERE post='${name}' AND id='${user}' `,
              // `INSERT INTO comments (id ,name , post, comment , photo , rating ) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' , ${rating}  ) ON DUPLICATE KEY UPDATE rating=${rating}`,

              function (err, result, fields) {
                if (err) {
                  console.log(err);
                }
                console.log(result);
              }
            );
          } else {
            con.query(
              `INSERT INTO comments (id ,name , post, comment , photo , rating ) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' , ${rating}  )`,
              function (err, result, fields) {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
        

        res.redirect("home/services/" + name);
      }
    );
  });
  
  router.get("/delete/:comment", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM comments WHERE sno ="${req.params.comment}"`,
  
        function (err, comments, fields) {
          if (err) {
            console.log(err);
          }
          console.log("comments");
          console.log(comments);
  
          con.query(
            `DELETE FROM comments WHERE sno = "${req.params.comment}";`,
  
            function (err, result, fields) {
              if (err) {
                console.log(err);
              }
              // console.log(result[0]);
  
              res.redirect("/services/" + comments[0]["post"]);
            }
          );
        }
      );
    } else {
      res.redirect("/login");
    }
  });
  
  router.get("/delete/skill/:skill", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM skill WHERE sno ="${req.params.skill}"`,
  
        function (err, skills, fields) {
          if (err) {
            console.log(err);
          }
  
          con.query(
            `DELETE FROM skill WHERE sno = "${req.params.skill}";`,
  
            function (err, result, fields) {
              if (err) {
                console.log(err);
              }
              // console.log(result[0]);
  
              res.redirect("/editprofile");
            }
          );
        }
      );
    } else {
      res.redirect("/login");
    }
  });


module.exports = router