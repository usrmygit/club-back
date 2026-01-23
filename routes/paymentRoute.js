const express = require("express");
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  payDues,
  visibility,
  getVisibility,
  paymentTags,
  getTags,
} = require("../controllers/payController");

const router = express.Router();

router.post("/pay", protect, payDues);
router.post("/update-visibility", protect, admin, visibility);
router.get("/get-visibility", protect, getVisibility);
router.post("/update-tags", protect, admin, paymentTags);
router.get("/get-tags", protect, getTags);

module.exports = router;
