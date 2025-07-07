const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
} = require("../contollers/authController");

router.get("/", function (req, res) {
  res.send("hey from users router");
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logout);

module.exports = router;
