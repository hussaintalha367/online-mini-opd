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
userSchema.add({ isBlocked: { type: Boolean, default: false } });
userSchema.add({ profileImage: { type: String, default: "" } });

module.exports = mongoose.model("User", userSchema);