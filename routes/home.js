const express = require("express");
const session = require('express-session');

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


router.get("/", async(req, res) => {

  if (req.session.phoneNumber) {

    const result = await executeQuery(`SELECT * FROM profiles`)
    const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id = '${req.session.phoneNumber}'`)
    console.log(userdata);
    const comments = await executeQuery(`SELECT * FROM profiles`)
    
    res.render("home", {
      isAuthenticated: req.oidc.isAuthenticated(),
      data: result,
      filterdata: result,
      userdata: userdata ? userdata[0]:[],
      rating: comments,
     })

  } else {
    res.render("whatsapplogin");
  }

});


router.get("/filter/:service/:pincode", async (req, res) => {

      const service = req.params.service
      const pincode = req.params.pincode

  
    // const{search , city , area , service , highest } = req.body
    // filters = [search , city , area , service , highest]
    // console.log(req.body);
    // if (req.oidc.isAuthenticated()) {
        
    //   let result = await executeQuery(`SELECT * FROM profiles`)

    //   if (result) {
    //   await Promise.all(filters.map(async (element) => {
    //     if (element && element !== search && element !== highest ) {
    //       result = result.filter(
    //         (item) =>
    //           item.city === element ||
    //           item.area === element ||
    //           item.service === element
    //       );
    //     }
    //     if (element && element === search) {
    //       console.log(element);
    //      result= result.filter(
    //         (item) =>
    //           item.name.toLowerCase().includes(element.toLowerCase()) ||
    //           item.service.toLowerCase().includes(element.toLowerCase()) ||
    //           item.city.toLowerCase().includes(element.toLowerCase()) ||
    //           item.area.toLowerCase().includes(element.toLowerCase())
    //       );
    //     }
    //     if (element && element === highest) {
    //       const newresult = await executeQuery(`SELECT * FROM profiles ORDER BY rating DESC`)

    //       result= newresult
    //     }


      
    //     }))
    //     res.render("home", {
    //       isAuthenticated: req.oidc.isAuthenticated(),
    //       data: result,
    //     });
    //   }

    // } else {
    //   res.redirect("/login");
    // }

    const filterservice = await executeQuery(`SELECT * FROM profiles WHERE service='${service.toLowerCase()}' AND pincode='${pincode}' `)
    const filterdata = await executeQuery(`SELECT * FROM profiles`)

    const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id = '${req.session.phoneNumber}'`)

    console.log(filterdata);

    res.render("home", {
            isAuthenticated: req.oidc.isAuthenticated(),
            data: filterservice,
            filterdata:filterdata,
            userdata: userdata ? userdata[0]:[],


          });




  });


router.post("/", async (req, res) => {

    const{service , pincode} = req.body

    console.log(req.body);

  // // const{search , city , area , service , highest } = req.body
  // // filters = [search , city , area , service , highest]
  // // console.log(req.body);
  // // if (req.oidc.isAuthenticated()) {
      
  // //   let result = await executeQuery(`SELECT * FROM profiles`)

  // //   if (result) {
  // //   await Promise.all(filters.map(async (element) => {
  // //     if (element && element !== search && element !== highest ) {
  // //       result = result.filter(
  // //         (item) =>
  // //           item.city === element ||
  // //           item.area === element ||
  // //           item.service === element
  // //       );
  // //     }
  // //     if (element && element === search) {
  // //       console.log(element);
  // //      result= result.filter(
  // //         (item) =>
  // //           item.name.toLowerCase().includes(element.toLowerCase()) ||
  // //           item.service.toLowerCase().includes(element.toLowerCase()) ||
  // //           item.city.toLowerCase().includes(element.toLowerCase()) ||
  // //           item.area.toLowerCase().includes(element.toLowerCase())
  // //       );
  // //     }
  // //     if (element && element === highest) {
  // //       const newresult = await executeQuery(`SELECT * FROM profiles ORDER BY rating DESC`)

  // //       result= newresult
  // //     }


    
  // //     }))
  // //     res.render("home", {
  // //       isAuthenticated: req.oidc.isAuthenticated(),
  // //       data: result,
  // //     });
  // //   }

  // // } else {
  // //   res.redirect("/login");
  // // }

  // const result = await executeQuery(`SELECT * FROM profiles WHERE service='${service.toLowerCase()}' AND pincode='${pincode}' `)
  // const filterdata = await executeQuery(`SELECT * FROM profiles`)

  // const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id = '${req.session.phoneNumber}'`)

  // console.log(result);

  // res.render("home", {
  //         isAuthenticated: req.oidc.isAuthenticated(),
  //         data: result,
  //         filterdata:filterdata,
  //         userdata: userdata ? userdata[0]:[],


  //       });



  let filterservice = await executeQuery(`SELECT * FROM profiles WHERE service='${service.toLowerCase()}' AND pincode='${pincode}' `)
  
  if (service === 'all') {
    filterservice = await executeQuery(`SELECT * FROM profiles WHERE pincode='${pincode}'`)
  }
  
  
  const filterdata = await executeQuery(`SELECT * FROM profiles`)

  const userdata = await executeQuery(`SELECT * FROM userprofiles WHERE id = '${req.session.phoneNumber}'`)

  console.log(filterdata);

  res.render("home", {
          isAuthenticated: req.oidc.isAuthenticated(),
          data: filterservice,
          filterdata:filterdata,
          userdata: userdata ? userdata[0]:[],


        });

});

router.get("/services/:name", async (req, res) => {
  user = req.session.phoneNumber

    if (user) {
      const result = await executeQuery(
        `SELECT * FROM profiles  WHERE name ="${req.params.name}"`
      );
      const skills = await executeQuery(
        `SELECT * FROM skill  WHERE id ="${result[0]["id"]}"`
      );
      const comments = await executeQuery(
        `SELECT * FROM comments  WHERE post='${req.params.name}'`
      );


      const userfav = await executeQuery(
        `SELECT * FROM userprofiles  WHERE id='${user}'`
      );
      
      console.log(userfav[0].fav);
      
      let favarray = [];
      if (userfav[0].fav) {
        const favString = userfav[0].fav.toString();
        favarray = favString.split(",");
      }
      
      console.log(userfav , req.session.phoneNumber);
 

      let rating = 0;
      let userrating = 0;
      if (comments) {
        comments.forEach((element) => {
          rating += element["rating"];
          if (element.id === user) {
            userrating = element["rating"];
          }
        });

        console.log(rating);
        totalrating = rating / comments.length;
        totalrating = Math.round(totalrating * 10) / 10;

        await executeQuery(
          `UPDATE profiles SET rating='${totalrating}' WHERE name ="${req.params.name}"`
        );
          


        console.log(totalrating);

        res.render("profiles/profiledetail", {
          isAuthenticated: req.oidc.isAuthenticated(),
          data: result[0],
          comments: comments,
          user: user,
          skills: skills,
          rating: totalrating,
          userfav: favarray ? favarray:[], 
          userrating: userrating,
          ratingno: comments.length,
        });
      }
    } else {
      res.redirect("/whatsapplogin");
    }
  });


  router.get("/whatsapplogin", async (req, res) => {


        res.render("whatsapplogin");

    });
  



module.exports = router