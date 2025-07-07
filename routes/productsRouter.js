const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

router.get("/", function (req, res) {
  res.send("on products");
});

// Create product (protected route)
router.post("/create", isOwnerLoggedIn, upload.single("image"), async function (req, res) {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      req.flash("error", "Name and price are required");
      return res.redirect("/owners/admin");
    }
    
    // Validate file upload
    if (!req.file) {
      req.flash("error", "Product image is required");
      return res.redirect("/owners/admin");
    }
    
    // Validate price and discount
    if (isNaN(price) || price <= 0) {
      req.flash("error", "Price must be a positive number");
      return res.redirect("/owners/admin");
    }
    
    if (discount && (isNaN(discount) || discount < 0)) {
      req.flash("error", "Discount must be a non-negative number");
      return res.redirect("/owners/admin");
    }
    
    let product = await productModel.create({
      image: req.file.buffer,
      name: name.trim(),
      price: Number(price),
      discount: Number(discount) || 0,
      bgcolor: bgcolor || "#ffffff",
      panelcolor: panelcolor || "#000000",
      textcolor: textcolor || "#000000",
    });

    req.flash("success", "Product created successfully");
    res.redirect("/owners/admin");
  } catch (err) {
    console.error("Error creating product:", err);
    req.flash("error", "Failed to create product");
    res.redirect("/owners/admin");
  }
});

// Get all products (for API)
router.get("/all", async function (req, res) {
  try {
    let products = await productModel.find().select("-image"); // Exclude image buffer
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/:id", async function (req, res) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Convert image buffer to base64 for display
    const imageBase64 = product.image.toString('base64');
    const productData = {
      ...product.toObject(),
      imageUrl: `data:image/jpeg;base64,${imageBase64}`
    };
    
    res.json(productData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Delete product (protected route)
router.delete("/:id", isOwnerLoggedIn, async function (req, res) {
  try {
    let product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;