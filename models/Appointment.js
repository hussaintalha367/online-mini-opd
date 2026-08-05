const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  time: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  prescription: String,
  notes: { type: String, default: "" },
  reason: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);