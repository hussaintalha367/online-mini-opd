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
userSchema.add({ pushToken: { type: String, default: "" } });
userSchema.add({
  isVerified: { type: Boolean, default: true },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  medicalLicenseNumber: { type: String, default: "" },
  qualification: { type: String, default: "MBBS" },
  consultationFee: { type: Number, default: 1500 },
  verificationNotes: { type: String, default: "" },
  verificationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);