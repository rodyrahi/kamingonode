var express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
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
const codeRouter = require("./routes/login.js");




app.use(session({
  secret: 'your-secret-key',
  store: new FileStore({
    path: '/session/store', // Choose a directory to store session files
    ttl: 86400 // Session expiration time in seconds (optional)
  }),
  resave: false,
  saveUninitialized: true
}));


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
app.use("/home", homeRouter);
app.use("/", profileRouter);
app.use("/", reviewsRouter);
app.use("/sendcode", codeRouter);





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

app.get("/", async (req, res) => {

  // req.session.phoneNumber = req.body.phoneNumber

  user = await executeQuery(`SELECT * FROM userprofiles WHERE id='${req.session.phoneNumber}'`)

  if (req.session.phoneNumber && user.length >0) {

    res.redirect('/home')

  } else {
    res.render("whatsapplogin");
  }
});

app.get("/test", async (req, res) => {

  req.session.phoneNumber = "8109204371"


  if (req.session.phoneNumber) {

    res.redirect('/home')

  } else {
    res.render("whatsapplogin");
  }
});


app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});



app.listen(3030);
