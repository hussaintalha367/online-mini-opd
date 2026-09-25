const express = require("express");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const { sendPushNotification } = require("../utils/pushNotifications");
const router = express.Router();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mini-opd",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});
const upload = multer({ storage });

const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mini-opd/chat",
    resource_type: "auto",
  },
});
const uploadChat = multer({ storage: chatStorage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/book", auth, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
      status: "pending",
    });

    await appointment.save();

    // Send push notification to the doctor
    try {
      const doctor = await User.findById(doctorId);
      const patient = await User.findById(req.user.id);
      if (doctor?.pushToken) {
        await sendPushNotification(
          doctor.pushToken,
          "New Appointment Request 📋",
          `${patient?.name || "A patient"} has requested an appointment on ${date} at ${time}.`,
          { screen: "Appointments", appointmentId: appointment._id.toString() }
        );
      }
    } catch (notifErr) {
      console.log("Push notification error (non-critical):", notifErr.message);
    }

    res.json({ message: "Appointment booked ✅" });
  } catch (error) {
    res.status(500).json({ message: "Booking failed" });
  }
});
router.put("/update-status/:id", auth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ["approved", "rejected", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctor can approve/reject/complete
    if (["approved", "rejected", "completed"].includes(status) && req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can perform this action" });
    }

    appointment.status = status;
    if (reason) appointment.reason = reason;
    await appointment.save();

    // Send push notification to the patient about status change
    try {
      const patient = await User.findById(appointment.patient);
      const doctor = await User.findById(req.user.id);
      const statusMessages = {
        approved: `Dr. ${doctor?.name || "Your doctor"} has approved your appointment! ✅`,
        rejected: `Dr. ${doctor?.name || "Your doctor"} has declined your appointment request.`,
        completed: `Your appointment with Dr. ${doctor?.name || "your doctor"} has been marked as completed.`,
      };
      if (patient?.pushToken && statusMessages[status]) {
        await sendPushNotification(
          patient.pushToken,
          `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          statusMessages[status],
          { screen: "Appointments", appointmentId: appointment._id.toString() }
        );
      }
    } catch (notifErr) {
      console.log("Push notification error (non-critical):", notifErr.message);
    }

    res.json({ message: "Status updated ✅", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", auth, async (req, res) => {
  const appointments = await Appointment.find({
    $or: [{ patient: req.user.id }, { doctor: req.user.id }]
  }).populate("patient doctor");

  res.json(appointments);
});

router.put("/cancel/:id", auth, async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: "cancelled" });
  res.json({ message: "Cancelled ✅" });
});

router.post("/upload/:id", auth, upload.single("file"), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    appointment.prescription = req.file.path;
    await appointment.save();

    res.json({
      message: "Prescription uploaded ✅",
      url: req.file.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});
// ✅ Get appointment stats for current user (for dashboard)
router.get("/stats", auth, async (req, res) => {
  try {
    const query = req.user.role === "doctor"
      ? { doctor: req.user.id }
      : { patient: req.user.id };

    const all = await Appointment.find(query);

    const stats = {
      total:     all.length,
      pending:   all.filter(a => a.status === "pending").length,
      approved:  all.filter(a => a.status === "approved").length,
      completed: all.filter(a => a.status === "completed").length,
      rejected:  all.filter(a => a.status === "rejected").length,
      cancelled: all.filter(a => a.status === "cancelled").length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/chat/upload/:id", auth, uploadChat.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    const isImage = req.file.mimetype ? req.file.mimetype.startsWith("image/") : false;
    res.json({
      url: req.file.path,
      fileName: req.file.originalname || (isImage ? "image.jpg" : "document"),
      fileType: req.file.mimetype || "",
      isImage,
    });
  } catch (error) {
    console.error("Chat file upload error:", error);
    res.status(500).json({ message: "Failed to upload file to chat" });
  }
});

router.post("/chat/:id", auth, async (req, res) => {
  try {
    const message = new Message({
      appointment: req.params.id,
      sender: req.user.id,
      text: req.body.text || "",
      image: req.body.image || "",
      fileUrl: req.body.fileUrl || "",
      fileName: req.body.fileName || "",
    });

    await message.save();
    const populated = await message.populate("sender", "name role profileImage");
    res.json(populated);
  } catch (err) {
    console.error("Chat message save error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
});

router.get("/chat/:id", auth, async (req, res) => {
  const messages = await Message.find({ appointment: req.params.id })
    .populate("sender", "name role profileImage")
    .sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;