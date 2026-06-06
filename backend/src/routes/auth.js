const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || !address)
    return res.status(400).json({ message: "All fields required" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, address, "user"],
    );
    res.json({ message: "Registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// Login — all roles
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows.length)
      return res.status(400).json({ message: "Invalid credentials" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ token, role: user.role, name: user.name });
  } catch {
    res.status(500).json({ message: "Server error" });
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
});

// Change password — logged-in user
router.put("/password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    const match = await bcrypt.compare(oldPassword, rows[0].password);
    if (!match)
      return res.status(400).json({ message: "Old password incorrect" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);
    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
