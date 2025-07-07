const express = require("express");
const productModel = require("../models/product-model");
const router = express.Router();
const isloggedin = require("../middleware/isLoggedIn");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/shop", isloggedin, async function (req, res) {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success: success });
});

router.get("/addtocart/:productid", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.productid);
  await user.save();
  req.flash("success", "Added to Cart");
  res.redirect("/shop");
});

router.get("/cart", isloggedin, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");
  let totalBill = 0;
  let itemsBill = [];

  user.cart.forEach((item) => {
    const itemBill = Number(item.price) + 20 - Number(item.discount);
    itemsBill.push({ item, itemBill });
    console.log(itemsBill);
    totalBill += itemBill;
  });

  res.render("cart", { user, itemsBill, totalBill });
});

module.exports = router;
