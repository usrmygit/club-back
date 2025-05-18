const mongoose = require("mongoose");
const methodSchema = new mongoose.Schema({
  applepay: {
    type: String,
    required: true,
    default: "Not Available",
  },
  cashApp: {
    type: String,
    required: true,
    default: "Not Available",
  },
  paypal: {
    type: String,
    required: true,
    default: "Not Available",
  },
  zelle: {
    type: String,
    required: true,
    default: "Not Available",
  },
  venmo: {
    type: String,
    required: true,
    default: "Not Available",
  },
});

const Method = mongoose.model("Method", methodSchema);
module.exports = Method;
