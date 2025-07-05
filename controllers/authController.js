const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require('../utils/generateToken');

// Register User
module.exports.registerUser = async function (req, res) {
  try {
    const { email, password, fullname } = req.body;

    bcrypt.genSalt(10, async function (err, salt) {
      if (err) return res.status(500).send(err.message);

      let existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(401).send("You already have an account, please log in");
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
          return res.send("User created successfully");
        } catch (err) {
          return res.status(500).send(err.message);
        }
      });
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Login User
module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    let user = await userModel.findOne({ email : email});
    if (!user) {
      return res.status(401).send("Email or password incorrect");
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) return res.status(500).send(err.message);
      if (!result) return res.status(401).send("Email or password incorrect");

      let token = generateToken(user);
      res.cookie("token", token);
      return res.send("Logged in successfully");
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
