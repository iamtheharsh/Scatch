const express = require('express');
const router = express.Router();
const {registerUser} = require("../controllers/authController")


router.get("/",function(req,res){
  res.send("hey it's working");
});
//here joy use krna tha but I am unable to do that
// 2types of problem 
// 1 fronted pr fullname provide nahi kiya ,fir bhi acc ban jayega
// 2 error aayga and app crash ho jayega


router.post("/register", registerUser);

module.exports = router;