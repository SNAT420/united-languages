const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/client');

async function login(req, res) {
  const { numero_alumno, password } = req.body;
  if (!numero_alumno || !password) {
    return res.status(400).json({ error: 'Campos requeridos' });
  }

  const { rows } = await db.query(
    'SELECT * FROM users WHERE numero_alumno = $1 AND activo = true',
    [numero_alumno]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      numero_alumno: user.numero_alumno,
      nivel: user.nivel,
      rol: user.rol,
    },
  });
}

module.exports = { login };
