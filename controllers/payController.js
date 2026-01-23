const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const Payment = require("../models/paymentModel");
const Method = require("../models/methodModel");

const payDues = asyncHandler(async (req, res) => {
  const { balance, dues, email } = req.body;
  if (!balance || !dues || !email) {
    res.status(400);
    throw new Error("Sang! Please try again later");
  }
  const user = await User.findOne({ email });
  if (user.dues === 0) {
    res.status(400);
    throw new Error("You current have no dues");
  }
  if (user && user.balance < user.dues) {
    res.status(400);
    throw new Error("Insufficient balance");
  }

  await Transaction.create({
    amount: user.dues,
    email: user.email,
    description: "Debit",
    status: "successful",
    method: "wallet",
  });

  await User.findOneAndUpdate(
    { email },
    {
      $inc: { balance: -user.dues },
    }
  );

  res.status(200).json({ message: "Payment Successful" });
});

const visibility = asyncHandler(async (req, res) => {
  const {
    applepay,
    cashapp,
    paypal,
    zelle,
    venmo,
    giftcards,
    card,
    crypto,
    ach,
    chime,
  } = req.body;
  if (
    applepay === undefined ||
    cashapp === undefined ||
    paypal === undefined ||
    zelle === undefined ||
    venmo === undefined ||
    chime === undefined ||
    giftcards === undefined ||
    card === undefined ||
    crypto === undefined ||
    ach === undefined
  ) {
    res.status(400);
    throw new Error("Please select all required fields");
  }
  // Update the payment visibility settings
  const updatedPayment = await Payment.findOneAndUpdate(
    {}, // Use an empty object to update the first document found
    {
      $set: {
        applepay,
        cashapp,
        paypal,
        zelle,
        venmo,
        chime,
        giftcard: giftcards,
        card,
        crypto,
        ach,
      },
    },
    { new: true, upsert: true } // Return the updated document and create if it doesn't exist
  );
  res.status(200).json({
    message: "Payment visibility updated successfully",
    data: updatedPayment,
  });
});

const getVisibility = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort("-updatedAt");

  if (!payments || payments.length === 0) {
    return res.status(404).json({ message: "No payment settings found" });
  }

  return res.status(200).json(payments);
});

const paymentTags = asyncHandler(async (req, res) => {
  const { applepay, cashApp, paypal, zelle, venmo, chime } = req.body;
  if (!applepay || !cashApp || !paypal || !zelle || !venmo || !chime) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const updatedMethod = await Method.findOneAndUpdate(
    {},
    {
      $set: {
        applepay,
        cashApp,
        paypal,
        zelle,
        venmo,
        chime,
      },
    },
    { new: true, upsert: true }
  );
  res.status(200).json({
    message: "Payment visibility updated successfully",
    data: updatedMethod,
  });
});

const getTags = asyncHandler(async (req, res) => {
  const methods = await Method.find().sort("-updatedAt");

  if (!methods || methods.length === 0) {
    return res.status(404).json({ message: "No Method found" });
  }

  return res.status(200).json(methods);
});

module.exports = {
  payDues,
  visibility,
  getVisibility,
  paymentTags,
  getTags,
};
