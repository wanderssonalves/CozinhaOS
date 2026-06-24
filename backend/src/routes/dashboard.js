const { Router } = require('express');
const ctrl = require('../controllers/dashboardController');

const router = Router();

router.get('/stats', ctrl.stats);

module.exports = router;
