const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  applepay: {
    type: Boolean,
    required: true,
    default: true,
  },
  cashapp: {
    type: Boolean,
    required: true,
    default: true,
  },
  paypal: {
    type: Boolean,
    required: true,
    default: true,
  },
  zelle: {
    type: Boolean,
    required: true,
    default: true,
  },
  venmo: {
    type: Boolean,
    required: true,
    default: true,
  },
  giftcard: {
    type: Boolean,
    required: true,
    default: true,
  },
  crypto: {
    type: Boolean,
    required: true,
    default: true,
  },
  card: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
