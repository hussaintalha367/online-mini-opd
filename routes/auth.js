const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Joi = require("joi");
const router = express.Router();
const schema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("patient", "doctor").required()
});

const { error } = schema.validate(req.body);

if (error) {
  return res.status(400).json({ message: error.details[0].message });
}
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed, role });
  await user.save();

  res.json({ message: "User registered ✅" });
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // ✅ Prevent blocked user login
  if (user.isBlocked) {
    return res.status(403).json({ message: "Account is blocked by admin" });
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
      id: user._id,
      name: user.name,
      role: user.role
    }
  });
});
//profile update route
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ message: "Profile updated ✅", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});
//profile image upload route
router.post("/upload-profile", auth, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.profileImage = req.file.path;
    await user.save();

    res.json({ message: "Profile image updated ✅", url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});
module.exports = router;