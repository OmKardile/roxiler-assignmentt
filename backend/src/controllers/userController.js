const db = require("../config/db");

exports.getStores = async (req, res) => {
  const uid = req.user.id;
  let { name, address, sort = "name", order = "asc" } = req.query;
  const sortCol = sort === "address" ? "s.address" : "s.name";
  const dir = order === "desc" ? "DESC" : "ASC";
  let q = `
    SELECT s.id, s.name, s.address,
           ROUND(AVG(r.rating), 2) as overallRating,
           MAX(CASE WHEN r.user_id = ? THEN r.rating END) as userRating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  const p = [uid];
  if (name) {
    q += " AND s.name LIKE ?";
    p.push(`%${name}%`);
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

exports.submitRating = async (req, res) => {
  const { store_id, rating } = req.body;
  try {
    await db.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [req.user.id, store_id, rating],
    );
    res.status(201).json({ message: "Rating submitted" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Already rated this store" });
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRating = async (req, res) => {
  const { rating } = req.body;
  try {
    await db.query(
      "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
      [rating, req.user.id, req.params.storeId],
    );
    res.json({ message: "Rating updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
