const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.use(authMiddleware, requireRole("store_owner"));

router.get("/dashboard", async (req, res) => {
  try {
    const [storeRows] = await db.query(
      "SELECT * FROM stores WHERE owner_id = ?",
      [req.user.id],
    );
    if (!storeRows.length)
      return res
        .status(404)
        .json({ message: "No store found for your account" });

    const storeId = storeRows[0].id;

    const [ratings] = await db.query(
      `SELECT u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId],
    );

    const [[{ avg_rating }]] = await db.query(
      "SELECT ROUND(AVG(rating), 1) as avg_rating FROM ratings WHERE store_id = ?",
      [storeId],
    );

    res.json({ store: storeRows[0], ratings, avg_rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
