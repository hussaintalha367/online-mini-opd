const express = require("express");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
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

    res.json({ message: "Appointment booked ✅" });
  } catch (error) {
    res.status(500).json({ message: "Booking failed" });
  }
});
router.put("/update-status/:id", auth, async (req, res) => {
  const { status } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Only doctor can approve/reject
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied" });
  }

  appointment.status = status;
  await appointment.save();

  res.json({ message: "Status updated ✅" });
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
  await Appointment.findByIdAndUpdate(req.params.id, {
    prescription: req.file.path
  });

  res.json({ message: "Prescription uploaded ✅" });
});

router.post("/chat/:id", auth, async (req, res) => {
  const message = new Message({
    appointment: req.params.id,
    sender: req.user.id,
    text: req.body.text
  });

  await message.save();
  res.json(message);
});

router.get("/chat/:id", auth, async (req, res) => {
  const messages = await Message.find({ appointment: req.params.id });
  res.json(messages);
});

module.exports = router;