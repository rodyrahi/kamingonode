const express = require("express");
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


router.get("/editprofile", async (req, res) => {
  const user = req.session.phoneNumber;


  const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id='${user}'`);
  const servicedata = await executeQuery(`SELECT category FROM service`);

  const categories = servicedata.map(row => row.category);
  console.log(servicedata);
  if (user) {
    

  const result = await executeQuery(
    `SELECT *  FROM profiles WHERE id='${user}'`
  );

  console.log(result);

  if (result.length>0) {
    


  const skills = await executeQuery(
    `SELECT * FROM skill WHERE id = '${result[0]["id"]}'`
  );
  const services = await executeQuery(
    `SELECT subcategory FROM service WHERE category = '${result[0]["service"]}'`
  );
  

 
    res.render("profiles/editprofile", {
      isAuthenticated: req.oidc.isAuthenticated(),
      data: result[0],
      userdata:userdata[0],
      skills: skills,
      services: services,
      servicedata:categories
    });

  }else{
    res.render("profiles/createprofile", {

      userdata:userdata[0],
      data: 'data',
      skills: [],
      services: [],
      servicedata:categories

    });
  }
  
}
else{
  res.redirect('/home')
}
});
  
router.post("/editprofile", async (req, res) => {
  console.log(" post  ");
  file = null;
  try {
    file = req.files.image;
    const filePath = file.path;
    console.log(file);
  } catch (error) {}

  user = req.session.phoneNumber;


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
        });
    });

    const fs = require("fs");

    await executeQuery(
      `UPDATE profiles SET name = '${name}', image='${file.name}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}' , pincode=${pincode}  , city='${city}' , area='${area}' where id='${user}'`
    );
  } else {
    await executeQuery(
      `UPDATE profiles SET name = '${name}', image='${image}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}', pincode=${pincode}  , city='${city}' , area='${area}' where id='${user}'`
    );
  }
  await executeQuery(`DELETE FROM skill WHERE id = "${user}";`);

  console.log();

  if (Array.isArray(skill)) {
    for (let index = 0; index < skill.length; index++) {
      // const element = array[index];

      await executeQuery(
        `INSERT INTO skill ( id ,service , price , post) VALUES ('${user}','${skill[index]}' ,'${price[index]}' ,'${name}')`
      );
    }
  } else {
    await executeQuery(
      `INSERT INTO skill ( id ,service , price , post) VALUES ('${user}','${skill}' ,'${price}','${name}')`
    );
  }

  res.redirect("/home");
});
  
router.post("/createprofile", async (req, res) => {
  console.log(" post  ");
  file = null;
  try {
    file = req.files.image;

    const filePath = file.path;

    console.log(file);
  } catch (error) {}

  user = req.session.phoneNumber;
  const {
    name,
    image,
    service,
    contact,
    address,
    description,
    shopname,
    skill,
    price,
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
        .png({ quality: 50 })
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
        });
    });

    const fs = require("fs");

    con.query(
      `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname,pincode,area,city) VALUES 
        ('${user}','${name}' ,'${file.name}', '${service}' , '${contact}','${address}','${description}','${shopname}','${pincode}','${area}' ,'${city}');`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  } else {
    con.query(
      `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname ,pincode,area,city) VALUES 
        ('${user}','${name}' ,'${"kamingo_favicon.png"}', '${service}' , '${contact}','${address}','${description}','${shopname}','${pincode}','${area}' ,'${city}');`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  }

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

  res.redirect("/home");
});

router.get("/createprofile", async (req, res) => {
  user = req.session.phoneNumber;


  const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id='${user}'`);
  const servicedata = await executeQuery(`SELECT * FROM profiles`);
  console.log(servicedata , 'this');

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
                console.log(services);

                res.render("profiles/editprofile", {
                  isAuthenticated: req.oidc.isAuthenticated(),
                  data: result[0],
                  userdata: userdata[0],
                  skills: skills,
                  services: services,
                  servicedata:servicedata[0]
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




router.post("/createuserprofile", async (req, res) => {

  file = null;
  try {
    file = req.files.image;

    const filePath = file.path;

    console.log(file);
  } catch (error) {}

  user = req.session.phoneNumber;
  const {name, pincode ,city , area} = req.body;
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
        .png({ quality: 50 })
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
        });
    });

    const fs = require("fs");

    con.query(
      `INSERT INTO userprofiles ( id ,name, image ,fav,pincode , city , area) VALUES 
        ('${user}','${name}' ,'${file.name}','','${pincode}','${city}','${area}');`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  } else {
    con.query(
      `INSERT INTO userprofiles ( id ,name, image,pincode , city , area ) VALUES 
        ('${user}','${name}' ,'${"kamingo_favicon.png"}','${pincode}','${city}','${area}');`,

      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
  }


  res.redirect("/home");
});

router.post("/addfav", async (req, res) => {
  console.log(req.body);
  const result = await executeQuery(`SELECT fav FROM userprofiles WHERE fav LIKE '%${req.body.phoneNumber},%' AND id='${req.session.phoneNumber}';`)
  console.log(result);
 
  if (result.length <1) {
  
    executeQuery(`UPDATE userprofiles SET fav = CONCAT(fav, '${req.body.phoneNumber},') WHERE id= '${req.session.phoneNumber}'`);

  }
  res.sendStatus(200)
});

router.post("/removefav", async (req, res) => {
  executeQuery(`  
  UPDATE userprofiles
  SET fav = REPLACE(fav, '${req.body.phoneNumber},', '')
  WHERE fav LIKE '%${req.body.phoneNumber},%' AND id= '${req.session.phoneNumber}';`)

  res.sendStatus(200)
});


router.get("/favourite", async (req, res) => {


    const fav = await executeQuery(`SELECT * FROM userprofiles WHERE id= '${req.session.phoneNumber}'`)
    let result
    if (fav.length > 0) {
      result = await executeQuery(`SELECT * FROM profiles WHERE contact IN (${fav[0].fav}'null');`)

    }

    const userfav = await executeQuery(
      `SELECT * FROM userprofiles  WHERE id='${req.session.phoneNumber}'`
    );
    
    console.log(userfav[0].fav);
    
    let favarray = [];
    if (userfav[0].fav) {
      const favString = userfav[0].fav.toString();
      favarray = favString.split(",");
    }
  
    const comments = await executeQuery(`SELECT * FROM profiles`)
    
    res.render("profiles/favourite", {
      data: result ? result:[] ,
      userfav: favarray ? favarray:[], 
      rating: comments,


     })

  });





module.exports = router