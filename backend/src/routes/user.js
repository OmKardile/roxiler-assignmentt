const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.use(authMiddleware, requireRole("user"));

// All stores with avg rating + this user's rating
router.get("/stores", async (req, res) => {
  const { name, address } = req.query;
  let query = `
    SELECT s.id, s.name, s.address,
      ROUND(AVG(r.rating), 1) as avg_rating,
      MAX(CASE WHEN r.user_id = ? THEN r.rating ELSE NULL END) as my_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [req.user.id];
  if (name) {
    query += " AND s.name LIKE ?";
    params.push(`%${name}%`);
  }
  if (address) {
    query += " AND s.address LIKE ?";
    params.push(`%${address}%`);
  }
  query += " GROUP BY s.id, s.name, s.address";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit rating
router.post("/ratings", async (req, res) => {
  const { store_id, rating } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  try {
    await db.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [req.user.id, store_id, rating],
    );
    res.json({ message: "Rating submitted" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "You already rated this store" });
    res.status(500).json({ message: "Server error" });
  }
});

// Update existing rating
router.put("/ratings/:store_id", async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  try {
    await db.query(
      "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
      [rating, req.user.id, req.params.store_id],
    );
    res.json({ message: "Rating updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
