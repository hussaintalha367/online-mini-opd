const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["patient", "doctor", "admin"] },
  phone: String,
  specialization: String,
  experience: Number
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);