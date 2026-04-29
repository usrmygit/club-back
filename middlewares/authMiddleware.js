const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not Authorized, please login");
    }

    const token = authHeader.split(" ")[1];

    const verified = jwt.verify(token, process.env.JWTOKEN);

    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === "suspended") {
      res.status(403);
      throw new Error("Your account is suspended, please contact support");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not Authorized, please login");
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
});

module.exports = {
  protect,
  admin,
};
