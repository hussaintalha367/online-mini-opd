const express = require("express");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/users", auth, role(["admin"]), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/appointments", auth, role(["admin"]), async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient doctor");
  res.json(appointments);
});

module.exports = router;