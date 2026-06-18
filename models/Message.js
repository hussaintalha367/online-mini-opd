const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);