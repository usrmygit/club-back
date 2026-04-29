const express = require("express");
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  signIn,
  logoutUser,
  getUser,
  getUsers,
  loginStatus,
  upgradeUser,
  forgotPassword,
  resetPassword,
  contactUs,
  authorized,
  fetcher,
  provefetcher,
  getEmails,
  deleteAuth,
  changeCurrent,
  changeAvailable,
  deleteUser,
  registerMember,
} = require("../controllers/userController");
const router = express.Router();

router.post("/auth", protect, admin, authorized);
router.get("/all-emails", protect, admin, getEmails);
router.delete("/:id", protect, admin, deleteAuth);
router.post("/change-current", express.json(), protect, admin, changeCurrent);
router.post(
  "/change-available",
  express.json(),
  protect,
  admin,
  changeAvailable
);
router.delete("/delete/:id", protect, admin, deleteUser);

router.post("/sign-in", signIn);
router.post("/sign-out", logoutUser);

router.get("/getUser", protect, getUser);
router.get("/getUsers", protect, admin, getUsers);
router.get("/loginStatus", loginStatus);
router.post("/upgradeUser", protect, admin, upgradeUser);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);

router.post("/contact-us", contactUs);
router.post("/fetcher", fetcher);
router.post("/prove-fetcher", provefetcher);

router.post("/register-member",protect,registerMember);

module.exports = router;
