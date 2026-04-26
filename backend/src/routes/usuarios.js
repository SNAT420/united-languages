const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { perfil } = require('../controllers/usuariosController');

router.get('/perfil', auth, perfil);

module.exports = router;
