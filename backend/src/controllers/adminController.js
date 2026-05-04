const bcrypt = require('bcryptjs');
const db = require('../db/client');

const TZ = 'America/Mexico_City';
function hoyMexico() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

async function getAlumnos(req, res) {
  const { rows } = await db.query(
    `SELECT id, nombre, correo, numero_alumno, nivel, activo, created_at
     FROM users WHERE rol = 'alumno' ORDER BY nombre`
  );
  res.json(rows);
}

async function getMaestros(req, res) {
  const { rows } = await db.query(
    `SELECT id, nombre, correo, numero_alumno, activo, created_at
     FROM users WHERE rol = 'maestro' ORDER BY nombre`
  );
  res.json(rows);
}

async function crearAlumno(req, res) {
  const { nombre, correo, nivel, numero_alumno, password } = req.body;
  if (!nombre || !correo || !numero_alumno || !password) {
    return res.status(400).json({ error: 'nombre, correo, numero_alumno y password son requeridos' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await db.query(
      `INSERT INTO users (nombre, correo, numero_alumno, password_hash, nivel, rol)
       VALUES ($1, $2, $3, $4, $5, 'alumno') RETURNING id, nombre, correo, numero_alumno, nivel`,
      [nombre, correo, numero_alumno, hash, nivel || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El correo o número de alumno ya existe' });
    throw err;
  }
}

async function crearMaestro(req, res) {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'nombre, correo y password son requeridos' });
  }
  const hash = await bcrypt.hash(password, 10);

  // numero_alumno único para maestros: prefijo M + timestamp
  const numero_alumno = 'M' + Date.now().toString().slice(-6);

  try {
    const { rows } = await db.query(
      `INSERT INTO users (nombre, correo, numero_alumno, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'maestro') RETURNING id, nombre, correo, numero_alumno`,
      [nombre, correo, numero_alumno, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El correo ya existe' });
    throw err;
  }
}

async function getReservaciones(req, res) {
  const fecha = req.query.fecha || hoyMexico();

  const { rows } = await db.query(
    `SELECT h.id AS horario_id, h.hora_inicio, h.hora_fin,
            u.id AS alumno_id, u.nombre, u.numero_alumno, u.nivel
     FROM horarios h
     LEFT JOIN reservaciones r ON r.horario_id = h.id AND r.fecha = $1
     LEFT JOIN users u ON u.id = r.alumno_id
     WHERE h.dia_semana = (
       SELECT CASE EXTRACT(DOW FROM $1::date)
         WHEN 0 THEN 'domingo'
         WHEN 1 THEN 'lunes'
         WHEN 2 THEN 'martes'
         WHEN 3 THEN 'miercoles'
         WHEN 4 THEN 'jueves'
         WHEN 5 THEN 'viernes'
         WHEN 6 THEN 'sabado'
       END
     )::dia_enum
     ORDER BY h.hora_inicio, u.nombre`,
    [fecha]
  );

  // Agrupar por horario
  const mapa = {};
  for (const row of rows) {
    if (!mapa[row.horario_id]) {
      mapa[row.horario_id] = {
        horario_id: row.horario_id,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        alumnos: [],
      };
    }
    if (row.alumno_id) {
      mapa[row.horario_id].alumnos.push({
        id: row.alumno_id,
        nombre: row.nombre,
        numero_alumno: row.numero_alumno,
        nivel: row.nivel,
      });
    }
  }
  res.json({ fecha, horarios: Object.values(mapa) });
}

async function getDashboard(req, res) {
  const hoy = hoyMexico();
  const [{ rows: r1 }, { rows: r2 }, { rows: r3 }] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS total FROM reservaciones WHERE fecha = $1`, [hoy]),
    db.query(`SELECT COUNT(*)::int AS total FROM users WHERE rol = 'alumno' AND activo = true`),
    db.query(`SELECT COUNT(*)::int AS total FROM users WHERE rol = 'maestro' AND activo = true`),
  ]);
  res.json({
    reservaciones_hoy: r1[0].total,
    total_alumnos: r2[0].total,
    total_maestros: r3[0].total,
  });
}

// GET /api/admin/maestros/:id/horarios
async function getMaestroHorarios(req, res) {
  const { id } = req.params;
  const { rows } = await db.query(
    `SELECT mh.id, mh.nivel, h.id AS horario_id, h.dia_semana, h.hora_inicio, h.hora_fin
     FROM maestro_horarios mh
     JOIN horarios h ON h.id = mh.horario_id
     WHERE mh.maestro_id = $1
     ORDER BY h.dia_semana, h.hora_inicio`,
    [id]
  );
  res.json(rows);
}

// PUT /api/admin/maestros/:id/horarios/:horario_id
async function asignarNivel(req, res) {
  const { id, horario_id } = req.params;
  const { nivel } = req.body;
  const { rows } = await db.query(
    `UPDATE maestro_horarios SET nivel = $1
     WHERE maestro_id = $2 AND horario_id = $3
     RETURNING *`,
    [nivel || null, id, horario_id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Asignación no encontrada' });
  res.json(rows[0]);
}

module.exports = { getAlumnos, getMaestros, crearAlumno, crearMaestro, getReservaciones, getDashboard, getMaestroHorarios, asignarNivel };
