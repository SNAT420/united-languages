const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getActivos } = require('../controllers/anunciosController');

router.get('/', auth, getActivos);

module.exports = router;
