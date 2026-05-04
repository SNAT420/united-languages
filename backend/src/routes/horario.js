const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { horarioDia } = require('../controllers/maestroController');

// Cualquier usuario autenticado puede consultar la rotación del día
router.get('/dia', auth, horarioDia);

module.exports = router;
