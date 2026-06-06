const router = require("express").Router();
const c = require("../controllers/userController");
const { verifyToken, isUser } = require("../middleware/auth");

router.use(verifyToken, isUser);

router.get("/stores", c.getStores);
router.post("/ratings", c.submitRating);
router.put("/ratings/:storeId", c.updateRating);

module.exports = router;
