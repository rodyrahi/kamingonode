const express = require("express");
const app = express();
var router = express.Router();
var con = require("../database.js");



router.get("/editprofile", function (req, res) {
    user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
  
    con.query(
      `SELECT *  FROM profiles WHERE id='${user}'`,
  
      function (err, result, fields) {
        if (err) {
        }
  
        console.log(result);
        try {
          con.query(
            `SELECT * FROM skill WHERE id = '${result[0]["id"]}'`,
  
            function (err, skills, fields) {
              if (err) {
                console.log(err);
              }
              con.query(
                `SELECT subcategory FROM service WHERE category = '${result[0]["service"]}'`,
  
                function (err, services, fields) {
                  if (err) {
                    console.log(err);
                  }
  
                  res.render("profiles/editprofile", {
                    isAuthenticated: req.oidc.isAuthenticated(),
                    data: result[0],
                    skills: skills,
                    services: services,
                  });
                }
              );
            }
          );
        } catch (error) {
          res.render("profiles/createprofile", {
            isAuthenticated: req.oidc.isAuthenticated(),
          });
        }
      }
    );
  });
  
router.post("/editprofile", async (req, res) => {
    console.log(" post  ");
    file = null;
    try {
      file = req.files.image;
  
      const filePath = file.path;
  
      console.log(file);
    } catch (error) {}
  
    user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
    const {
      name,
      image,
      service,
      contact,
      address,
      description,
      shopname,
      price,
      skill,
      pincode,
      area,
      city,
    } = req.body;
    console.log(req.body);
  
    if (file) {
      const sharp = require("sharp");
  
      file.mv("public/uploads/profiles/" + "raw-" + file.name, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        const outputFilePath = "public/uploads/profiles/" + file.name;
  
        sharp("public/uploads/profiles/" + "raw-" + file.name)
          .png({ quality: 60 })
          .toFile(outputFilePath)
          .then(() => {
            console.log("Image compressed successfully!");
          })
          .then(() => {
            fs.unlink("public/uploads/profiles/" + "raw-" + file.name, (err) => {
              if (err) console.log(err);
  
              console.log("\nDeleted file: example_file.txt");
            });
          })
          .catch((err) => {
            console.error(err);
            // remove the original file from the server (in case of an error)
          });
      });
  
      const fs = require("fs");
  
      // assuming that the uploaded file is saved as 'file' in your code
  
      // console.log(filePath);
  
      con.query(
        `UPDATE profiles SET name = '${name}', image='${file.name}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}' , pincode=${pincode}  , city='${city}' , area='${area}' where id='${user}'`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
    } else {
      con.query(
        `UPDATE profiles SET name = '${name}', image='${image}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}', pincode=${pincode}  , city='${city}' , area='${area}' where id='${user}'`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
    }
  
    con.query(
      `DELETE FROM skill WHERE id = "${user}";`,
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  
    console.log();
  
    if (Array.isArray(skill)) {
      for (let index = 0; index < skill.length; index++) {
        // const element = array[index];
        con.query(
          `INSERT INTO skill ( id ,service , price , post) VALUES ('${user}','${skill[index]}' ,'${price[index]}' ,'${name}')`,
          function (err, result, fields) {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    } else {
      con.query(
        `INSERT INTO skill ( id ,service , price , post) VALUES ('${user}','${skill}' ,'${price}','${name}')`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  
    res.redirect("/");
  });
  
router.post("/createprofile", async (req, res) => {
    console.log(" post  ");
    file = null;
    try {
      file = req.files.image;
  
      const filePath = file.path;
  
      console.log(file);
    } catch (error) {}
  
    user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
    const {
      name,
      image,
      service,
      contact,
      address,
      description,
      shopname,
      price,
      skill,
    } = req.body;
    console.log(req.body);
  
    if (file) {
      const sharp = require("sharp");
  
      file.mv("public/uploads/profiles/" + "raw-" + file.name, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }
        const outputFilePath = "public/uploads/profiles/" + file.name;
  
        sharp("public/uploads/profiles/" + "raw-" + file.name)
          .png({ quality: 80 })
          .toFile(outputFilePath)
          .then(() => {
            console.log("Image compressed successfully!");
          })
          .then(() => {
            fs.unlink("public/uploads/profiles/" + "raw-" + file.name, (err) => {
              if (err) console.log(err);
  
              console.log("\nDeleted file: example_file.txt");
            });
          })
          .catch((err) => {
            console.error(err);
            // remove the original file from the server (in case of an error)
          });
      });
  
      const fs = require("fs");
  
      // assuming that the uploaded file is saved as 'file' in your code
  
      // console.log(filePath);
  
      con.query(
        `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname) VALUES ('${user}','${name}' ,'${file.name}', '${service}' , '${contact}','${address}','${description}','${shopname}');`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
    } else {
      con.query(
        `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname) VALUES ('${user}','${name}' ,'${"kamingo_favicon.png"}', '${service}' , '${contact}','${address}','${description}','${shopname}');`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
    }
  
    // con.query(
    //   `DELETE FROM skill WHERE id = "${user}";`,
    //   function (err, result, fields) {
    //     if (err) {
    //       console.log(err);
    //     }
    //     console.log(result);
    //   }
    // );
  
    console.log();
  
    if (Array.isArray(skill)) {
      for (let index = 0; index < skill.length; index++) {
        // const element = array[index];
        con.query(
          `INSERT INTO skill ( id ,service , price) VALUES ('${user}','${skill[index]}' ,'${price[index]}' ,'${name}' )`,
          function (err, result, fields) {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    } else {
      con.query(
        `INSERT INTO skill ( id ,service , price , post) VALUES ('${user}','${skill}' ,'${price}','${name}')`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  
    res.redirect("/");
  });
  
router.get("/profiledetail", function (req, res) {
    if (req.oidc.isAuthenticated()) {
      con.query(
        `SELECT * FROM profiles`,
  
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
  
          res.render("profiles/profiledetail", {
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