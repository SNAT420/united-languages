const router = require('express').Router();
const { auth, requireRol } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const isAdmin = [auth, requireRol('admin')];

router.get('/dashboard', ...isAdmin, ctrl.getDashboard);
router.get('/alumnos', ...isAdmin, ctrl.getAlumnos);
router.post('/alumnos', ...isAdmin, ctrl.crearAlumno);
router.get('/maestros', ...isAdmin, ctrl.getMaestros);
router.post('/maestros', ...isAdmin, ctrl.crearMaestro);
router.get('/reservaciones', ...isAdmin, ctrl.getReservaciones);
router.get('/maestros/:id/horarios', ...isAdmin, ctrl.getMaestroHorarios);
router.put('/maestros/:id/horarios/:horario_id', ...isAdmin, ctrl.asignarNivel);

module.exports = router;
