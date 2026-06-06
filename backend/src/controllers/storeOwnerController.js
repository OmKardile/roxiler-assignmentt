const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const [stores] = await db.query(
      "SELECT id, name FROM stores WHERE owner_id = ?",
      [req.user.id],
    );
    if (!stores.length)
      return res.json({ avgRating: null, ratings: [], storeName: null });

    const storeId = stores[0].id;
    const storeName = stores[0].name;

    const [[{ avgRating }]] = await db.query(
      "SELECT ROUND(AVG(rating), 2) as avgRating FROM ratings WHERE store_id = ?",
      [storeId],
    );
    const [ratings] = await db.query(
      `SELECT u.name, u.email, r.rating, r.created_at
       FROM ratings r JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ? ORDER BY r.created_at DESC`,
      [storeId],
    );
    res.json({ avgRating, ratings, storeName });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
