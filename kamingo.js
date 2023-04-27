
var express = require('express')
var app = express()
const { auth, requiresAuth } = require("express-openid-connect");
require("dotenv").config();

var con = require("./database.js");

const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


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
  user = JSON.stringify(req.oidc.user["sid"], null, 2).replace(/"/g, "")
  // console.log(req.baseUrl);
  // user  = req.baseUrl.replace("/dashboard/" , "")
  console.log(user);
  next();
  }
  else{
    next();
  }
  
});



app.get('/', function (req, res) {
  
  if (req.oidc.isAuthenticated()) {
    

  con.query(
    `SELECT * FROM profiles`,
    
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result);

    
      res.render('home' , {isAuthenticated : req.oidc.isAuthenticated(),data: result} )
    }
  );
  }
  else{
    res.redirect('/login')
  }

})



app.get('/Create', function (req, res) {
  res.render('createpost')
})



app.get('/editprofile', function (req, res) {

  user = JSON.stringify(req.oidc.user["sid"], null, 2).replace(/"/g, "")


  con.query(
    `SELECT id ,name, image, service , contact , address , description , shopname  FROM profiles`,
  
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      result.forEach(element => {

        if (element["id"] === user) {
          console.log("matched");
           res.render('profiles/editprofile' , {isAuthenticated : req.oidc.isAuthenticated() , data:element} )
        }
        else{
          
        }
        console.log(result[0]["id"]);
      });
      res.render('profiles/createprofile' , {isAuthenticated : req.oidc.isAuthenticated()})
    }
  );


})
app.post('/editprofile', function (req, res) {
  const file = req.files.image;
  user = JSON.stringify(req.oidc.user["sid"], null, 2).replace(/"/g, "")
  const {name, service ,  contact , address , description , shopname } = req.body
  console.log(req.body);
  
  file.mv('public/uploads/profiles/' + file.name, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    })

    if (file) {
      con.query(
        `UPDATE profiles SET name = '${name}', image='${file.name}', service='${service}' , contact='${contact}' , address='${address}' , description='${description}' , shopname='${shopname}' where id='${user}'`,
      
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
    }




    res.redirect("/")
  
})

app.get('/profiledetail', function (req, res) {
  
  if (req.oidc.isAuthenticated()) {
    

  con.query(
    `SELECT * FROM profiles`,
    
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result);

    
      res.render('profiles/profiledetail' , {isAuthenticated : req.oidc.isAuthenticated(),data: result} )
    }
  );
  }
  else{
    res.redirect('/login')
  }

})

app.post('/createprofile', function (req, res) {
  const file = req.files.image;
  user = JSON.stringify(req.oidc.user["sid"], null, 2).replace(/"/g, "")
  const {name, service ,  contact , address , description , shopname } = req.body
  console.log(req.body);
  
  file.mv('public/uploads/profiles/' + file.name, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    })

    

    con.query(
      `INSERT INTO profiles ( id ,name, image, service , contact , address , description , shopname) VALUES ('${user}','${name}' ,'${file.name}', '${service}' , '${contact}','${address}','${description}','${shopname}');`,
    
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );


    res.redirect("/")
  
})

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get('/:name', function (req, res) {
  
  if (req.oidc.isAuthenticated()) {
    

  con.query(
    `SELECT * FROM profiles  WHERE name ="${req.params.name}"`,
    
    function (err, result, fields) {
      if (err) {
        console.log(err);
      }
      console.log(result[0]);

      con.query(
        `SELECT * FROM comments  WHERE post ="${req.params.name}"`,
        
        function (err, comments, fields) {
          if (err) {
            console.log(err);
          }
          console.log(comments);
    
        
          res.render('profiles/profiledetail' , {isAuthenticated : req.oidc.isAuthenticated(),data: result[0] , comments: comments} )
        }
      );
    }
  );
  }
  else{
    res.redirect('/login')
  }

})

app.post('/postcomment', function (req, res) {

  user = JSON.stringify(req.oidc.user["sid"], null, 2).replace(/"/g, "")
  nickname = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(/"/g, "")
  photo = JSON.stringify(req.oidc.user["picture"], null, 2).replace(/"/g, "")
  const {name,comment} = req.body


  console.log(req.body);
  

      con.query(
        `INSERT INTO comments (id ,name , post, comment , photo) VALUES ('${user}','${nickname}','${name}', '${comment}' , '${photo}' )`,
      
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          console.log(result);
          res.redirect("/"+name)
        }
      );





  
  
})




app.listen(3030)


