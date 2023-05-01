const express = require("express");
const app = express();
var router = express.Router();
var con = require("../database.js");



router.get("/services/:name", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM profiles  WHERE name ="${req.params.name}"`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result[0]);
  
          con.query(
            `SELECT * FROM skill  WHERE id ="${result[0]["id"]}"`,
            function (err, skills, fields) {
              if (err) {
                console.log(err);
              }
              con.query(
                `SELECT * FROM comments  WHERE post='${req.params.name}'`,
                function (err, comments, fields) {
                  if (err) {
                    console.log(err);
                  }
  
                  // console.log('here');
  
                  let rating = 0;
  
                  comments.forEach((element) => {
                    rating += element["rating"];
                  });
  
                  console.log(rating);
                  totalrating = rating / comments.length;
  
                  console.log(totalrating);
  
                  res.render("profiles/profiledetail", {
                    isAuthenticated: req.oidc.isAuthenticated(),
                    data: result[0],
                    comments: comments,
                    user: req.oidc.user["sub"],
                    skills: skills,
                    rating: totalrating,
                    userrating: rating,
                  });
                }
              );
            }
          );
  
          // con.query(
          //   `SELECT * FROM comments  WHERE id ="${result[0]["id"]}"`,
  
          //   function (err, comments, fields) {
          //     if (err) {
          //       console.log(err);
          //     }
          //     con.query(
          //       `SELECT * FROM skill  WHERE id ="${result[0]["id"]}"`,
  
          //       function (err, skills, fields) {
          //         if (err) {
          //           console.log(err);
          //         }
          //         res.render('profiles/profiledetail' , {isAuthenticated : req.oidc.isAuthenticated(),data: result[0] , comments: comments , user:req.oidc.user["sub"],skills:skills} )
  
          //       });
          //   });
        }
      );
    } else {
      res.redirect("/login");
    }
  });
  
  router.post("/postcomment", function (req, res) {
    user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
    nickname = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(
      /"/g,
      ""
    );
    photo = JSON.stringify(req.oidc.user["picture"], null, 2).replace(/"/g, "");
    const { name, comment, rating } = req.body;
  
    console.log(req.body);
  
    con.query(
      `UPDATE comments SET id='${user}',name='${nickname}',post='${name}',comment='${comment}',photo='${photo}',rating=${rating} WHERE id='${user}' `,
      // `INSERT INTO comments (id ,name , post, comment , photo , rating ) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' , ${rating}  ) ON DUPLICATE KEY UPDATE rating=${rating}`,
  
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
  
        if (result["changedRows"] === 0) {
          con.query(
            `INSERT INTO comments (id ,name , post, comment , photo , rating ) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' , ${rating}  )`,
            function (err, result, fields) {
              if (err) {
                console.log(err);
              }
            }
          );
        }
  
        res.redirect("/services/" + name);
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