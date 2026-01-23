const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, email, method, description, status } = req.body;
  if (!amount || !email || !method || !description || !status) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  await Transaction.create({
    amount,
    email,
    method,
    description,
    status,
  });
  res.status(200).json({ message: "created" });
});

const getTransactions = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    const transaction = await Transaction.find().sort("-updatedAt");
    return res.status(200).json(transaction);
  }
  const transactions = await Transaction.find({
    email: req.user.email,
  })
    .sort({ createdAt: -1 })
    .populate("email");

  res.status(200).json(transactions);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  await transaction.deleteOne();
  res.status(200).json({
    message: "Transaction deleted successfully",
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
};
