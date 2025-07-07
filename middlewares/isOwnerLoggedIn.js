const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

module.exports = async function (req, res, next) {
  if (!req.cookies.ownerToken) {
    req.flash("error", "Admin access required");
    return res.redirect("/owner-login");
  }

  try {
    let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
    let owner = await ownerModel
      .findOne({ email: decoded.email })
      .select("-password");
    
    if (!owner) {
      req.flash("error", "Invalid admin credentials");
      return res.redirect("/owner-login");
    }
    
    req.owner = owner;
    next();
  } catch (err) {
    req.flash("error", "Admin authentication failed");
    res.redirect("/owner-login");
  }
};