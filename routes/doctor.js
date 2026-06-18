const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const doctors = await User.find({ role: "doctor" });
  res.json(doctors);
});

module.exports = router;