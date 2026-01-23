const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rToken: {
      type: String,
      default: "",
    },
    lToken: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
