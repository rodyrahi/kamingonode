var express = require("express");
const bodyParser = require("body-parser");
var app = express();
const { auth, requiresAuth } = require("express-openid-connect");
require("dotenv").config();

var con = require("./database.js");

const fileUpload = require("express-fileupload");
const { log } = require("console");

app.use(fileUpload());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const config = {
  authRequired: false,
  auth0Logout: true,
  issuerBaseURL: process.env.ISSUER,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  secret: process.env.SECRET,
  idpLogout: true,
};

app.use(auth(config));

app.use((req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
    // console.log(req.baseUrl);
    // user  = req.baseUrl.replace("/dashboard/" , "")
    console.log(user);
    next();
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  if (req.oidc.isAuthenticated()) {
    con.query(
      `SELECT * FROM profiles`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
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

app.get("/editprofile", function (req, res) {
  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");

  con.query(
    `SELECT id ,name, image, service , contact , address , description , shopname  FROM profiles WHERE id='${user}'`,

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
                  services: services
                });

              });

            


          });
      } catch (error) {
        res.render("profiles/createprofile", {
          isAuthenticated: req.oidc.isAuthenticated(),
        });
      }
    }
  );
});

app.post("/editprofile", async (req, res) => {
  console.log(" post  ");
  file = null;
  try {
    file = req.files.image;

    const filePath = file.path;

    console.log(file);
  } catch (error) {}

  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
  const {name,image,service,contact,address,description,shopname,price,skill,} = req.body;
  console.log(req.body);

  if (file) {
    const sharp = require("sharp");


    file.mv("public/uploads/profiles/"+"raw-" + file.name, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      const outputFilePath = "public/uploads/profiles/" + file.name;

      sharp("public/uploads/profiles/"+"raw-"+ file.name)
        .png({ quality: 80 })
        .toFile(outputFilePath)
        .then(() => {
          console.log("Image compressed successfully!");

        }).then(() => {
          
          fs.unlink("public/uploads/profiles/"+"raw-"+ file.name, (err => {
            if (err) console.log(err);
            
              console.log("\nDeleted file: example_file.txt");
            
          
          }));
          
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
      `UPDATE profiles SET name = '${name}', image='${file.name}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}' where id='${user}'`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  } else {
    con.query(
      `UPDATE profiles SET name = '${name}', image='${image}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}' where id='${user}'`,

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

app.post("/createprofile", async (req, res) => {
  console.log(" post  ");
  file = null;
  try {
    file = req.files.image;

    const filePath = file.path;

    console.log(file);
  } catch (error) {}

  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
  const {name,image,service,contact,address,description,shopname,price,skill,} = req.body;
  console.log(req.body);

  if (file) {
    const sharp = require("sharp");


    file.mv("public/uploads/profiles/"+"raw-" + file.name, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      const outputFilePath = "public/uploads/profiles/" + file.name;

      sharp("public/uploads/profiles/"+"raw-"+ file.name)
        .png({ quality: 80 })
        .toFile(outputFilePath)
        .then(() => {
          console.log("Image compressed successfully!");

        }).then(() => {
          
          fs.unlink("public/uploads/profiles/"+"raw-"+ file.name, (err => {
            if (err) console.log(err);
            
              console.log("\nDeleted file: example_file.txt");
            
          
          }));
          
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


app.get("/profiledetail", function (req, res) {
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

// app.post('/createprofile', function (req, res) {

//   console.log('creating profile');

//   const file = req.files.image;
//   user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "")
//   const {name, service ,  contact , address , description , shopname } = req.body
//   console.log(req.body);

//   file.mv('public/uploads/profiles/' + file.name, (err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send(err);
//     }
//     })

//     con.query(
//       `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname) VALUES ('${user}','${name}' ,'${file.name}', '${service}' , '${contact}','${address}','${description}','${shopname}');`,

//       function (err, result, fields) {
//         if (err) {
//           console.log(err);
//         }
//         console.log(result);
//       }
//     );

//     for (let index = 0; index < skill.length; index++) {
//       // const element = array[index];

//     con.query(
//       `INSERT INTO skill ( id ,service , price) VALUES ('${user}','${skill[index]}' ,${price[index]});`,

//       function (err, result, fields) {
//         if (err) {
//           console.log(err);
//         }
//         console.log(result);
//       }
//     );
//     }

//     res.redirect("/")

// })

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get("/services/:name", function (req, res) {
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
              `SELECT * FROM comments  WHERE id ="${result["id"]}"`,
              function (err, comments, fields) {
                if (err) {
                  console.log(err);
                }
                res.render("profiles/profiledetail", {
                  isAuthenticated: req.oidc.isAuthenticated(),
                  data: result[0],
                  comments: comments,
                  user: req.oidc.user["sub"],
                  skills: skills,
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

app.post("/postcomment", function (req, res) {
  user = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
  nickname = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(
    /"/g,
    ""
  );
  photo = JSON.stringify(req.oidc.user["picture"], null, 2).replace(/"/g, "");
  const { name, comment , rating } = req.body;

  console.log(req.body);

  con.query(
    `INSERT INTO comments (id ,name , post, comment , photo , ratings) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' , '${rating}' )`,

    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.redirect("/" + name);
    }
  );
});

app.get("/delete/:comment", function (req, res) {
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

app.get("/delete/skill/:skill", function (req, res) {
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






app.listen(3030);
