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
          console.log(result.name);
          con.query(
            `SELECT * FROM comments `,
            function (err, comments, fields) {
              if (err) {
                console.log(err);
              }

              // console.log('here');

              let rating = 0;

              // comments.forEach((element) => {
              //   rating += element["rating"];
              // });

              // console.log(rating);
              // totalrating = rating / comments.length;

              // console.log(totalrating);
              res.render("home", {
                isAuthenticated: req.oidc.isAuthenticated(),
                data: result,
                rating: comments
              });

              
            }
          );
       
  
          
        }
      );
    } else {
      res.redirect("/login");
    }
  });


router.post("/filter", function (req, res) {
    const{search , city , area , service , highest } = req.body
    filters = [search , city , area , service , highest]
    console.log(req.body);
    if (req.oidc.isAuthenticated()) {
        
        
            
        
      con.query(
        `SELECT * FROM profiles`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
        //   if (city && area && highest && search && service) {
        //     console.log('yes');
        //     result = result.filter(item => item.city === city && item.area === area && item.highest === highest && item.key.includes(search) && item.service === service );
        //     console.log(result);
        //   }
        //   else if (city && area && highest && search){

        //   }

        filters.forEach(element => {
            if (element && element !== search) {
              
            result = result.filter(item  => 
              // console.log(element + "this");
              item.city === element || item.area === element || item.service === element
             );
            // console.log();
            }
           if (element && element === search) {
                console.log(element);
                result = result.filter(item => item.name.toLowerCase().includes(element.toLowerCase()) || item.service.toLowerCase().includes(element.toLowerCase()) || item.city.toLowerCase().includes(element.toLowerCase()) || item.area.toLowerCase().includes(element.toLowerCase())  );
                }
            
        });

          res.render("home", {isAuthenticated: req.oidc.isAuthenticated(),data: result,});
        }
      );
        
    } else {
      res.redirect("/login");
    }
  });




router.get("/services/:name", function (req, res) {
  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");

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
                  let userrating = 0;

  
                  comments.forEach((element) => {
                    rating += element["rating"];
                    if (element.id === user) {
                      userrating = element["rating"];

                    }
                  });
  
                  console.log(rating);
                  totalrating = rating / comments.length;
                  con.query(
                    `UPDATE profiles SET rating='${totalrating}' WHERE name ="${req.params.name}"`,
                    function (err, comments, fields) {
                      if (err) {
                        console.log(err);
                      }
                    
                  });
  
                  console.log(totalrating);
  
                  res.render("profiles/profiledetail", {
                    isAuthenticated: req.oidc.isAuthenticated(),
                    data: result[0],
                    comments: comments,
                    user: req.oidc.user["sub"],
                    skills: skills,
                    rating: totalrating,
                    userrating: userrating,
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
  

module.exports = router