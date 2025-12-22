const express = require('express');
const ctrl = require('../controllers/userController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const router = express.Router();

router.get('/', auth, role(['admin']), ctrl.list);
router.get('/:id', auth, role(['admin']), ctrl.get);
router.put('/:id', auth, role(['admin']), ctrl.update);
router.patch('/:id/toggle-active', auth, role(['admin']), ctrl.toggleActive);

module.exports = router;