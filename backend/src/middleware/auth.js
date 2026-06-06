const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
}

function isUser(req, res, next) {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Users only" });
  next();
}

function isStoreOwner(req, res, next) {
  if (req.user.role !== "store_owner")
    return res.status(403).json({ message: "Store owners only" });
  next();
}

module.exports = { verifyToken, isAdmin, isUser, isStoreOwner };
