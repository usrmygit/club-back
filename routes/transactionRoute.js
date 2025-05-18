const express = require("express");
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  createTransaction,
  getTransactions,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/create-transaction", protect, admin, createTransaction);
router.post("/get-transactions", express.json(), protect, getTransactions);
router.delete(
  "/delete-transaction/:id",
  express.json(),
  protect,
  admin,
  deleteTransaction
);
module.exports = router;
