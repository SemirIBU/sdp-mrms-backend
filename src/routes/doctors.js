const express = require('express');
const ctrl = require('../controllers/doctorController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const router = express.Router();
router.post('/', auth, role(['admin']), ctrl.create);
router.get('/', auth, role(['admin','doctor','patient']), ctrl.list);
router.get('/:id', auth, role(['admin','doctor']), ctrl.get);
module.exports = router;
