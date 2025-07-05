const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require('../utils/generateToken');

module.exports.registerUser = async function (req, res) {
  try {
    const { email, password, fullname } = req.body;

    bcrypt.genSalt(10, async function (err, salt) {
      if (err) return res.status(500).send(err.message);
      let user = await userModel.findOne({email : email});
      if(user){
        return res.status(401).send("You already have account ,please log in ")
      }

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.status(500).send(err.message);

        try {
          let user = await userModel.create({
            email,
            password: hash,
            fullname,
          });

          let token = generateToken(user);
          res.cookie("token", token);

          res.send("user created successfully");
        } catch (err) {
          res.status(500).send(err.message);
        }
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
