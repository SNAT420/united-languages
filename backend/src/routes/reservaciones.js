const router = require('express').Router();
const { auth, requireRol } = require('../middleware/auth');
const { disponibilidad, crear, cancelar, misClases, horasSemanaCurrent } = require('../controllers/reservacionesController');

router.get('/disponibilidad', auth, requireRol('alumno'), disponibilidad);
router.post('/', auth, requireRol('alumno'), crear);
router.delete('/:id', auth, requireRol('alumno'), cancelar);
router.get('/mis-clases', auth, requireRol('alumno'), misClases);
router.get('/horas-semana', auth, requireRol('alumno'), horasSemanaCurrent);

module.exports = router;
