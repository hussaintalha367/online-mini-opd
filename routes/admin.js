const express = require("express");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Get all users (Admin only)
router.get("/users", auth, roleMiddleware("admin"), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ Get all appointments (Admin only)
router.get("/appointments", auth, roleMiddleware("admin"), async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient doctor");
  res.json(appointments);
});
// ✅ Block / Unblock user
router.put("/block/:id", auth, roleMiddleware("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ message: "User status updated ✅" });
});

module.exports = router;