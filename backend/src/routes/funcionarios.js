const { Router } = require('express');
const ctrl = require('../controllers/funcionarioController');
const { validateFields } = require('../middleware/validator');

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateFields(['nome', 'cargo', 'filial_id', 'salario', 'admissao']), ctrl.create);
router.put('/:id', validateFields(['nome', 'cargo', 'filial_id', 'salario', 'admissao']), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
