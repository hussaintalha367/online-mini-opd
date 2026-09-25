const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  // Only display verified/approved, non-blocked doctors to patients
  const doctors = await User.find({
    role: "doctor",
    isBlocked: false,
    $or: [
      { verificationStatus: "approved" },
      { verificationStatus: { $exists: false } },
    ],
  });
  res.json(doctors);
});

module.exports = router;