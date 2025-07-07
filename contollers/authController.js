const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;

    // Validate input
    if (!email || !password || !fullname) {
      req.flash("error", "All fields are required");
      return res.redirect("/");
    }

    let user = await userModel.findOne({ email: email });
    if (user) {
      req.flash("error", "User already has an account, please login");
      return res.redirect("/");
    }

    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        req.flash("error", "Registration failed");
        return res.redirect("/");
      }
      
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) {
          req.flash("error", "Registration failed");
          return res.redirect("/");
        }
        
        try {
          let user = await userModel.create({
            email,
            password: hash,
            fullname,
          });

          let token = generateToken(user);
          res.cookie("token", token);
          req.flash("success", "User created successfully");
          res.redirect("/shop");
        } catch (error) {
          req.flash("error", "Registration failed");
          res.redirect("/");
        }
      });
    });
  } catch (err) {
    req.flash("error", "Registration failed");
    res.redirect("/");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/");
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      req.flash("error", "Email or Password Incorrect");
      return res.redirect("/");
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        req.flash("error", "Login failed");
        return res.redirect("/");
      }
      
      if (result) {
        let token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "Login successful");
        res.redirect("/shop");
      } else {
        req.flash("error", "Email or Password Incorrect");
        res.redirect("/");
      }
    });
  } catch (err) {
    req.flash("error", "Login failed");
    res.redirect("/");
  }
};

module.exports.logout = async function (req, res) {
  res.cookie("token", "");
  req.flash("success", "Logged out successfully");
  res.redirect("/");
};