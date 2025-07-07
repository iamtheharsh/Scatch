const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");

// 🛒 Place order
router.get("/order", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate("cart.product");
    const items = user.cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    await orderModel.create({ user: user._id, items });

    user.cart = [];
    await user.save();

    req.flash("success", "Order placed successfully");
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to place order");
    res.redirect("/cart");
  }
});

// 🧾 View orders
router.get("/orders", isLoggedIn, async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user._id }).sort({ date: -1 });
    const formattedOrders = orders.map(order => ({
      date: order.date.toDateString(),
      items: order.items
    }));
    res.render("orders", { orders: formattedOrders });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not fetch orders");
    res.redirect("/");
  }
});

// ❌ Remove item from cart
router.get("/removefromcart/:productid", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productid);
    await user.save();
    req.flash("success", "Item removed from cart");
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to remove item");
    res.redirect("/cart");
  }
});

module.exports = router;
