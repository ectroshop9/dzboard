const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

module.exports = router;
