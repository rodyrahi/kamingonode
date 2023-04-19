
var express = require('express')
var app = express()

var con = require("./database.js");

const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('home')
})
app.get('/Create', function (req, res) {
  res.render('createpost')
})
app.get('/EditProfile', function (req, res) {
  res.render('profiles/editprofile')
})
app.post('/EditProfile', function (req, res) {
  const file = req.files.image;
  const {name, contact , address , description , shopname } = req.body
  
  file.mv('uploads/profiles/' + file.name, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    })

    

    con.query(
      `INSERT INTO profiles (name, contact , address , description , shopname) VALUES ('${name}' , '${contact}','${address}','${description}','${shopname}');`,
    
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );


    res.send('File uploaded successfully!');
  
})

app.listen(3030)


