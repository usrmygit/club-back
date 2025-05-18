const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "subbie",
      enum: ["subbie", "admin", "suspended"],
    },
    title: {
      type: String,
      required: true,
      default: "Membership registration fee",
    },
    dues: {
      type: Number,
      required: true,
      default: 1000,
    },
    description: {
      type: String,
      required: true,
      default:
        "By becoming a member, you gain exclusive access to a range of exciting benefits designed for those passionate about the BDSM lifestyle. Membership includes an official BDSM license, free access to our private dungeon, and complimentary entry to all dungeon parties. You'll also receive a free pass to club-hosted seminars, perfect for learning and connecting with others in the community. Each month, a selected 'Couple of the Month' will enjoy a special club-sponsored vacation. As part of this vibrant and welcoming community, you will have the opportunity to socialize with like-minded individuals in a safe and supportive environment. Plus, to welcome you, we will gift you three premium BDSM devices at no extra cost",
    },
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
