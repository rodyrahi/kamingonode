var express = require("express");
const bodyParser = require("body-parser");
var app = express();
const { auth, requiresAuth } = require("express-openid-connect");
require("dotenv").config();

var con = require("./database.js");

const fileUpload = require("express-fileupload");
const { log } = require("console");
const { name } = require("ejs");

const homeRouter = require("./routes/home.js");
const profileRouter = require("./routes/profile.js");
const reviewsRouter = require("./routes/reviews.js");



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
app.use("/", homeRouter);
app.use("/", profileRouter);
app.use("/", reviewsRouter);







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



app.listen(3030);
