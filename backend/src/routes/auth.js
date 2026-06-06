const router = require('express').Router();
const { login, signup, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/signup', signup);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;