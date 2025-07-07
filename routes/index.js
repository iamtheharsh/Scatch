const express = require("express");
const productModel = require("../models/product-model");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("index", { error, success, loggedin: false });
});

router.get("/shop", isloggedin, async function (req, res) {
  try {
    let products = await productModel.find();
    let success = req.flash("success");
    res.render("shop", { products, success });
  } catch (err) {
    req.flash("error", "Failed to load products");
    res.redirect("/");
  }
});

router.get("/addtocart/:productid", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    
    // Check if product already exists in cart
    if (user.cart.includes(req.params.productid)) {
      req.flash("error", "Product already in cart");
      return res.redirect("/shop");
    }
    
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success", "Added to Cart");
    res.redirect("/shop");
  } catch (err) {
    req.flash("error", "Failed to add to cart");
    res.redirect("/shop");
  }
});

router.get("/cart", isloggedin, async function (req, res) {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
    
    let totalBill = 0;
    let itemsBill = [];

    user.cart.forEach((item) => {
      const itemBill = Number(item.price) + 20 - Number(item.discount);
      itemsBill.push({ item, itemBill });
      totalBill += itemBill;
    });

    res.render("cart", { user, itemsBill, totalBill });
  } catch (err) {
    req.flash("error", "Failed to load cart");
    res.redirect("/shop");
  }
});

// New route: Remove item from cart
router.get("/removefromcart/:productid", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let index = user.cart.indexOf(req.params.productid);
    
    if (index > -1) {
      user.cart.splice(index, 1);
      await user.save();
      req.flash("success", "Item removed from cart");
    } else {
      req.flash("error", "Item not found in cart");
    }
    
    res.redirect("/cart");
  } catch (err) {
    req.flash("error", "Failed to remove item");
    res.redirect("/cart");
  }
});

// New route: Process order
router.post("/order", isloggedin, async function (req, res) {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
    
    if (user.cart.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }
    
    // Calculate total
    let totalBill = 0;
    let orderItems = [];
    
    user.cart.forEach((item) => {
      const itemBill = Number(item.price) + 20 - Number(item.discount);
      orderItems.push({
        product: item._id,
        name: item.name,
        price: item.price,
        discount: item.discount,
        finalPrice: itemBill
      });
      totalBill += itemBill;
    });
    
    // Create order
    const order = {
      items: orderItems,
      total: totalBill,
      date: new Date(),
      status: "pending"
    };
    
    user.orders.push(order);
    user.cart = []; // Clear cart
    await user.save();
    
    req.flash("success", "Order placed successfully!");
    res.redirect("/orders");
  } catch (err) {
    req.flash("error", "Failed to place order");
    res.redirect("/cart");
  }
});

// New route: View orders
router.get("/orders", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("orders", { orders: user.orders });
  } catch (err) {
    req.flash("error", "Failed to load orders");
    res.redirect("/shop");
  }
});

module.exports = router;