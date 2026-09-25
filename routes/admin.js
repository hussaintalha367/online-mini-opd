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
// ✅ Block/toggle user
router.put("/block/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If explicit boolean passed, use it, otherwise toggle the current status
    if (typeof req.body.isBlocked === "boolean") {
      user.isBlocked = req.body.isBlocked;
    } else {
      user.isBlocked = !user.isBlocked;
    }
    await user.save();

    res.json({
      message: user.isBlocked ? "User blocked ✅" : "User unblocked ✅",
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Unblock user (explicit route)
router.put("/unblock/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked ✅", isBlocked: false });
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

// ✅ Update Doctor Verification Status (Admin only)
router.put("/verify-doctor/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.verificationStatus = status;
    doctor.isVerified = status === "approved";
    if (notes !== undefined) doctor.verificationNotes = notes;
    doctor.verificationDate = new Date();

    await doctor.save();
    res.json({
      message: `Doctor status updated to ${status} ✅`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        verificationStatus: doctor.verificationStatus,
        isVerified: doctor.isVerified,
        verificationNotes: doctor.verificationNotes,
        verificationDate: doctor.verificationDate,
      },
    });
  } catch (err) {
    console.error("verify-doctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Doctor Clinical Credentials & Licensing (Admin only)
router.put("/doctor-credentials/:id", auth, roleMiddleware("admin"), async (req, res) => {
  try {
    const {
      medicalLicenseNumber,
      qualification,
      specialization,
      experience,
      consultationFee,
      verificationNotes,
      verificationStatus,
    } = req.body;

    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (medicalLicenseNumber !== undefined) doctor.medicalLicenseNumber = medicalLicenseNumber;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (verificationNotes !== undefined) doctor.verificationNotes = verificationNotes;
    if (verificationStatus && ["approved", "rejected", "pending"].includes(verificationStatus)) {
      doctor.verificationStatus = verificationStatus;
      doctor.isVerified = verificationStatus === "approved";
      doctor.verificationDate = new Date();
    }

    await doctor.save();
    res.json({ message: "Doctor credentials updated ✅", doctor });
  } catch (err) {
    console.error("doctor-credentials error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;