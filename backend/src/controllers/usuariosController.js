const db = require('../db/client');

async function perfil(req, res) {
  const { rows } = await db.query(
    'SELECT id, nombre, correo, numero_alumno, nivel, rol FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(rows[0]);
}

module.exports = { perfil };
