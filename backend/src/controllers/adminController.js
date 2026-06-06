const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const [[{ userCount }]] = await db.query(
      "SELECT COUNT(*) as userCount FROM users",
    );
    const [[{ storeCount }]] = await db.query(
      "SELECT COUNT(*) as storeCount FROM stores",
    );
    const [[{ ratingCount }]] = await db.query(
      "SELECT COUNT(*) as ratingCount FROM ratings",
    );
    res.json({ userCount, storeCount, ratingCount });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  let { name, email, address, role, sort = "name", order = "asc" } = req.query;
  const allowed = ["name", "email", "address", "role"];
  sort = allowed.includes(sort) ? sort : "name";
  const dir = order === "desc" ? "DESC" : "ASC";
  let q = "SELECT id, name, email, address, role FROM users WHERE 1=1";
  const p = [];
  if (name) {
    q += " AND name LIKE ?";
    p.push(`%${name}%`);
  }
  if (email) {
    q += " AND email LIKE ?";
    p.push(`%${email}%`);
  }
  if (address) {
    q += " AND address LIKE ?";
    p.push(`%${address}%`);
  }
  if (role) {
    q += " AND role = ?";
    p.push(role);
  }
  q += ` ORDER BY ${sort} ${dir}`;
  try {
    const [rows] = await db.query(q, p);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    const user = rows[0];
    if (user.role === "store_owner") {
      const [[stat]] = await db.query(
        `SELECT ROUND(AVG(r.rating), 2) as avgRating
         FROM stores s LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?`,
        [user.id],
      );
      user.avgRating = stat.avgRating;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, address, role],
    );
    res.status(201).json({ message: "User added" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStores = async (req, res) => {
  let { name, email, address, sort = "name", order = "asc" } = req.query;
  const sortMap = {
    name: "s.name",
    email: "s.email",
    address: "s.address",
    rating: "rating",
  };
  const sortCol = sortMap[sort] || "s.name";
  const dir = order === "desc" ? "DESC" : "ASC";
  let q = `SELECT s.id, s.name, s.email, s.address, ROUND(AVG(r.rating), 2) as rating
           FROM stores s LEFT JOIN ratings r ON s.id = r.store_id WHERE 1=1`;
  const p = [];
  if (name) {
    q += " AND s.name LIKE ?";
    p.push(`%${name}%`);
  }
  if (email) {
    q += " AND s.email LIKE ?";
    p.push(`%${email}%`);
  }
  if (address) {
    q += " AND s.address LIKE ?";
    p.push(`%${address}%`);
  }
  q += ` GROUP BY s.id ORDER BY ${sortCol} ${dir}`;
  try {
    const [rows] = await db.query(q, p);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  try {
    await db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id || null],
    );
    res.status(201).json({ message: "Store added" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Store email already exists" });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStoreOwners = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name FROM users WHERE role = "store_owner"',
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
