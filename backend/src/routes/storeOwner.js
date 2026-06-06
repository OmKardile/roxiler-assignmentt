const router = require("express").Router();
const { getDashboard } = require("../controllers/storeOwnerController");
const { verifyToken, isStoreOwner } = require("../middleware/auth");

router.use(verifyToken, isStoreOwner);
router.get("/dashboard", getDashboard);

module.exports = router;
