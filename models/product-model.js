const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name :  String,
  image : String,
  password : String,
  price : Number,
  discount : {
    type : Number,
    default : 0
  },
  bgcolor : String,
  panelcolor : String,
  textcolor
});

module.exports = mongoose.model("product", productSchema);