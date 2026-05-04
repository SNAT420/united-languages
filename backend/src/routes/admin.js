const router = require('express').Router();
const { auth, requireRol } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');
const anuncios = require('../controllers/anunciosController');

const isAdmin = [auth, requireRol('admin')];

router.get('/dashboard', ...isAdmin, ctrl.getDashboard);
router.get('/alumnos',        ...isAdmin, ctrl.getAlumnos);
router.post('/alumnos',       ...isAdmin, ctrl.crearAlumno);
router.put('/alumnos/:id',    ...isAdmin, ctrl.editarAlumno);
router.delete('/alumnos/:id', ...isAdmin, ctrl.eliminarAlumno);
router.get('/maestros',        ...isAdmin, ctrl.getMaestros);
router.post('/maestros',       ...isAdmin, ctrl.crearMaestro);
router.put('/maestros/:id',    ...isAdmin, ctrl.editarMaestro);
router.delete('/maestros/:id', ...isAdmin, ctrl.eliminarMaestro);
router.get('/reservaciones', ...isAdmin, ctrl.getReservaciones);
router.get('/maestros/:id/horarios', ...isAdmin, ctrl.getMaestroHorarios);
router.put('/maestros/:id/horarios/:horario_id', ...isAdmin, ctrl.asignarNivel);

router.get('/anuncios',      ...isAdmin, anuncios.getTodos);
router.post('/anuncios',     ...isAdmin, anuncios.crear);
router.put('/anuncios/:id',  ...isAdmin, anuncios.editar);
router.delete('/anuncios/:id', ...isAdmin, anuncios.eliminar);

module.exports = router;
