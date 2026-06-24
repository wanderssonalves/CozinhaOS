const { Router } = require('express');
const ctrl = require('../controllers/transacaoController');
const { validateFields } = require('../middleware/validator');

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateFields(['tipo', 'descricao', 'categoria', 'valor', 'data']), ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
