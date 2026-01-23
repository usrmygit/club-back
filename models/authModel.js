const mongoose = require("mongoose");
const authSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please add a code"],
      unique: true,
      trim: true,
      // match: [
      //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      //   "Please enter a valid email",
      // ],
    },
    referral: {
      type: String,
      required: [true, "Please add a referral"],
      trim: true,
      default: "N/A",
    },
  },
  { timestamps: true, minimize: true }
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
