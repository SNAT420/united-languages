const router = require('express').Router();
const { auth, requireRol } = require('../middleware/auth');
const { clasesHoy } = require('../controllers/maestroController');

router.get('/clases-hoy', auth, requireRol('maestro'), clasesHoy);

module.exports = router;
