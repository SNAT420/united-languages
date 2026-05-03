const router = require('express').Router();
const { auth, requireRol } = require('../middleware/auth');
const { clasesHoy, horarioDia } = require('../controllers/maestroController');

router.get('/clases-hoy',   auth, requireRol('maestro'), clasesHoy);
router.get('/horario-dia',  auth, requireRol('maestro'), horarioDia);

module.exports = router;
