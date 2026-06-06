const router = require('express').Router();
const c = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/dashboard',   c.getDashboard);
router.get('/users',       c.getUsers);
router.post('/users',      c.addUser);
router.get('/users/:id',   c.getUserDetail);
router.get('/stores',      c.getStores);
router.post('/stores',     c.addStore);
router.get('/store-owners', c.getStoreOwners);

module.exports = router;