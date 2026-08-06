const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/', ctrl.create);
router.get('/', verifyAdmin, ctrl.getAll);
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);
router.get('/track/:tracking', ctrl.trackOrder);

module.exports = router;
