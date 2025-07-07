const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owners-model");

router.get("/", function (req, res) {
  res.send("hey from owners router");
});

console.log("development");
router.post("/create", async function (req, res) {
  let owners = await ownerModel.find();
  // console.log(owners);
  if (owners.length > 0) {
    return res
      .status(503)
      .send("You don't have permissions to create a new owner");
  } else {
    let { fullname, email, password } = req.body;

    let createdOwner = await ownerModel.create({
      fullname,
      email,
      password,
    });
    return res.status(201).send(createdOwner);
  }
});

router.get("/admin", function (req, res) {
  let success = req.flash("success");
  res.render("createproducts", { success });
});

module.exports = router;
