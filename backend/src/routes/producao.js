const { Router } = require('express');
const ctrl = require('../controllers/producaoController');
const { validateFields } = require('../middleware/validator');

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateFields(['data', 'prato', 'porcoes', 'filial_id']), ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
