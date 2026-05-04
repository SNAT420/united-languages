const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { horarioDiaAlumno } = require('../controllers/alumnosController');

router.get('/horario-dia', auth, horarioDiaAlumno);

module.exports = router;
