const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.use(authMiddleware, requireRole("admin"));

// Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query(
      "SELECT COUNT(*) as totalUsers FROM users",
    );
    const [[{ totalStores }]] = await db.query(
      "SELECT COUNT(*) as totalStores FROM stores",
    );
    const [[{ totalRatings }]] = await db.query(
      "SELECT COUNT(*) as totalRatings FROM ratings",
    );
    res.json({ totalUsers, totalStores, totalRatings });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Add any user (admin, user, store_owner)
router.post("/users", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, address, role || "user"],
    );
    res.json({ message: "User added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// List all users with optional filters + sorting
router.get("/users", async (req, res) => {
  const {
    name,
    email,
    address,
    role,
    sortBy = "name",
    order = "asc",
  } = req.query;
  const allowed = ["name", "email", "address", "role"];
  const col = allowed.includes(sortBy) ? sortBy : "name";
  const dir = order === "desc" ? "DESC" : "ASC";

  let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
  const params = [];
  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (email) {
    query += " AND email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    query += " AND address LIKE ?";
    params.push(`%${address}%`);
  }
  if (role) {
    query += " AND role = ?";
    params.push(role);
  }
  query += ` ORDER BY ${col} ${dir}`;

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user detail
router.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });
    const user = rows[0];
    if (user.role === "store_owner") {
      const [stores] = await db.query(
        `SELECT s.name, ROUND(AVG(r.rating), 1) as avg_rating
         FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ? GROUP BY s.id`,
        [user.id],
      );
      user.stores = stores;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Add store
router.post("/stores", async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  try {
    await db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id || null],
    );
    res.json({ message: "Store added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Store email already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// List stores with filters + sorting
router.get("/stores", async (req, res) => {
  const { name, email, address, sortBy = "name", order = "asc" } = req.query;
  const allowed = ["name", "email", "address"];
  const col = allowed.includes(sortBy) ? `s.${sortBy}` : "s.name";
  const dir = order === "desc" ? "DESC" : "ASC";

  let query = `
    SELECT s.id, s.name, s.email, s.address,
           ROUND(AVG(r.rating), 1) as avg_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (name) {
    query += " AND s.name LIKE ?";
    params.push(`%${name}%`);
  }
  if (email) {
    query += " AND s.email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    query += " AND s.address LIKE ?";
    params.push(`%${address}%`);
  }
  query += ` GROUP BY s.id ORDER BY ${col} ${dir}`;

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
