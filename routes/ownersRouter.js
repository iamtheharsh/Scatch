const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owners-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

router.get("/", function (req, res) {
  res.send("hey from owners router");
});

// Create owner (only if no owner exists)
router.post("/create", async function (req, res) {
  try {
    let owners = await ownerModel.find();
    
    if (owners.length > 0) {
      return res
        .status(503)
        .send("You don't have permissions to create a new owner");
    }
    
    let { fullname, email, password } = req.body;
    
    if (!fullname || !email || !password) {
      return res.status(400).send("All fields are required");
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let createdOwner = await ownerModel.create({
      fullname,
      email,
      password: hashedPassword,
    });
    
    // Don't send password in response
    const { password: _, ...ownerData } = createdOwner.toObject();
    return res.status(201).json(ownerData);
  } catch (err) {
    return res.status(500).send("Error creating owner: " + err.message);
  }
});

// Owner login page
router.get("/login", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("owner-login", { error, success });
});

// Owner login
router.post("/login", async function (req, res) {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/owners/login");
    }
    
    let owner = await ownerModel.findOne({ email: email });
    if (!owner) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/owners/login");
    }
    
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/owners/login");
    }
    
    // Generate token for owner
    let token = jwt.sign(
      { email: owner.email, id: owner._id, role: "owner" },
      process.env.JWT_KEY
    );
    
    res.cookie("ownerToken", token);
    req.flash("success", "Login successful");
    res.redirect("/owners/admin");
  } catch (err) {
    req.flash("error", "Login failed");
    res.redirect("/owners/login");
  }
});

// Owner logout
router.post("/logout", function (req, res) {
  res.cookie("ownerToken", "");
  req.flash("success", "Logged out successfully");
  res.redirect("/owners/login");
});

// Admin panel (protected)
router.get("/admin", isOwnerLoggedIn, function (req, res) {
  let success = req.flash("success");
  let error = req.flash("error");
  res.render("createproducts", { success, error });
});

module.exports = router;