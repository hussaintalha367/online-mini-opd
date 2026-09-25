const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Joi = require("joi");
const auth = require("../middleware/authMiddleware");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* ---------------- CLOUDINARY STORAGE ---------------- */

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mini-opd/profile",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

/* ---------------- REGISTER ---------------- */

router.post("/register", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("patient", "doctor").required(),
    specialization: Joi.string().allow("").optional(),
    experience: Joi.number().min(0).optional(),
    phone: Joi.string().allow("").optional(),
    medicalLicenseNumber: Joi.string().allow("").optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, role, specialization, experience, phone, medicalLicenseNumber } = req.body;

  // ✅ Prevent public admin registration
  if (role === "admin") {
    return res.status(403).json({ message: "Admin cannot register publicly" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const isDoctor = role === "doctor";

  const user = new User({
    name,
    email,
    password: hashed,
    role,
    specialization: specialization || "",
    experience: experience || 0,
    phone: phone || "",
    medicalLicenseNumber: medicalLicenseNumber || "",
    // Doctors require admin approval before they can practice or log in
    isVerified: !isDoctor,
    verificationStatus: isDoctor ? "pending" : "approved",
    verificationNotes: isDoctor ? "Pending administrative license and credential review" : "",
  });
  await user.save();

  res.json({
    message: isDoctor
      ? "Doctor registered successfully! Your profile is pending administrative approval before you can log in."
      : "User registered successfully ✅",
    isPendingApproval: isDoctor,
    role,
  });
});

/* ---------------- LOGIN ---------------- */

router.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // ✅ Prevent blocked user login
  if (user.isBlocked) {
    return res.status(403).json({ message: "Account is blocked by admin" });
  }

  // ✅ Prevent unapproved doctor login
  if (user.role === "doctor") {
    if (user.verificationStatus === "pending") {
      return res.status(403).json({
        message: "Your doctor account is pending administrative approval. You can log in once the admin verifies and approves your credentials.",
        isPendingApproval: true,
        verificationStatus: "pending",
      });
    }
    if (user.verificationStatus === "rejected") {
      return res.status(403).json({
        message: "Your doctor registration was declined by hospital administration. Please contact support.",
        verificationStatus: "rejected",
      });
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id:                   user._id,
      name:                 user.name,
      email:                user.email,
      role:                 user.role,
      phone:                user.phone                || "",
      specialization:       user.specialization       || "",
      experience:           user.experience           || 0,
      profileImage:         user.profileImage         || "",
      medicalLicenseNumber: user.medicalLicenseNumber || "",
      isVerified:           user.isVerified,
      verificationStatus:   user.verificationStatus   || "approved",
    }
  });
});

/* ---------------- UPDATE PROFILE ---------------- */

router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, email, phone, specialization, experience } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name)           user.name           = name;
    if (email)          user.email          = email;
    if (phone !== undefined)          user.phone          = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (experience !== undefined)     user.experience     = experience;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        phone:          user.phone,
        specialization: user.specialization,
        experience:     user.experience,
        role:           user.role,
        profileImage:   user.profileImage,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

/* ---------------- UPLOAD PROFILE IMAGE ---------------- */

router.post("/upload-profile", auth, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profileImage = req.file.path;
    await user.save();

    res.json({
      message: "Profile image updated ✅",
      url: req.file.path
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ---------------- REGISTER PUSH TOKEN ---------------- */

router.post("/push-token", auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await User.findByIdAndUpdate(req.user.id, { pushToken });
    res.json({ message: "Push token saved ✅" });
  } catch (error) {
    console.error("Push token save error:", error);
    res.status(500).json({ message: "Failed to save push token" });
  }
});

module.exports = router;