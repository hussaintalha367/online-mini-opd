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
// ✅ Block user
router.put("/block/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked ✅", isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Unblock user (separate route — fixes mobile app /admin/unblock/:id call)
router.put("/unblock/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked ✅", isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete user (Admin only)
router.delete("/users/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;