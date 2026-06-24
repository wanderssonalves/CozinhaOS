const { Router } = require('express');
const ctrl = require('../controllers/filialController');
const { validateFields } = require('../middleware/validator');

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateFields(['nome', 'cidade']), ctrl.create);
router.put('/:id', validateFields(['nome', 'cidade']), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
