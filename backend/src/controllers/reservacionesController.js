const db = require('../db/client');

const MAX_CUPO = 8;
const MAX_HORAS_SEMANA = 6;
const MIN_MINUTOS_CANCELAR = 60;

const TZ = 'America/Mexico_City';

// Devuelve 'YYYY-MM-DD' de hoy en hora de México, independientemente del TZ del servidor
function hoyMexico() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

// Devuelve 'YYYY-MM-DD' de mañana en hora de México
function mananaMexico() {
  const [y, m, d] = hoyMexico().split('-').map(Number);
  const t = new Date(y, m - 1, d + 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// GET /api/reservaciones/disponibilidad?fecha=YYYY-MM-DD
async function disponibilidad(req, res) {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'Parámetro fecha requerido' });

  // Obtener nivel del alumno para mostrar disponibilidad de su nivel específico
  const { rows: alumnoRows } = await db.query(
    'SELECT nivel FROM users WHERE id = $1', [req.user.id]
  );
  const nivelAlumno = alumnoRows[0]?.nivel ?? null;

  const fechaDate = new Date(fecha + 'T00:00:00');
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = diasSemana[fechaDate.getDay()];

  if (diaSemana === 'domingo') return res.json([]);

  // Contar reservados solo del nivel del alumno (o total si no tiene nivel)
  const { rows } = await db.query(
    `SELECT h.id, h.hora_inicio, h.hora_fin,
            COUNT(r.id) FILTER (
              WHERE $3::nivel_enum IS NULL OR u.nivel = $3::nivel_enum
            )::int AS reservados
     FROM horarios h
     LEFT JOIN reservaciones r ON r.horario_id = h.id AND r.fecha = $1
     LEFT JOIN users u ON u.id = r.alumno_id
     WHERE h.dia_semana = $2
     GROUP BY h.id
     ORDER BY h.hora_inicio`,
    [fecha, diaSemana, nivelAlumno]
  );

  res.json(rows.map((h) => ({
    ...h,
    nivel_alumno: nivelAlumno,
    disponible: h.reservados < MAX_CUPO,
    cupo_restante: Math.max(0, MAX_CUPO - h.reservados),
  })));
}

// POST /api/reservaciones  body: { horario_id, fecha }
async function crear(req, res) {
  const { horario_id, fecha } = req.body;
  const alumno_id = req.user.id;

  if (!horario_id || !fecha) {
    return res.status(400).json({ error: 'horario_id y fecha son requeridos' });
  }

  if (fecha !== mananaMexico()) {
    return res.status(400).json({ error: 'Solo puedes reservar para el día de mañana' });
  }

  // Obtener nivel del alumno — requerido para validar cupo por nivel
  const { rows: alumnoRows } = await db.query(
    'SELECT nivel FROM users WHERE id = $1', [alumno_id]
  );
  const nivelAlumno = alumnoRows[0]?.nivel;
  if (!nivelAlumno) {
    return res.status(400).json({ error: 'Tu perfil no tiene un nivel asignado. Contacta al administrador.' });
  }

  const horasUsadas = await horasSemana(alumno_id, fecha);
  if (horasUsadas >= MAX_HORAS_SEMANA) {
    return res.status(400).json({ error: 'Alcanzaste el límite de 6 horas esta semana' });
  }

  // Validar cupo POR NIVEL: máximo 8 alumnos del mismo nivel por horario
  const { rows: cupo } = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM reservaciones r
     JOIN users u ON u.id = r.alumno_id
     WHERE r.horario_id = $1 AND r.fecha = $2 AND u.nivel = $3::nivel_enum`,
    [horario_id, fecha, nivelAlumno]
  );
  if (cupo[0].total >= MAX_CUPO) {
    return res.status(400).json({ error: 'No hay lugares disponibles para tu nivel en este horario' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO reservaciones (alumno_id, horario_id, fecha) VALUES ($1, $2, $3) RETURNING *',
      [alumno_id, horario_id, fecha]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Ya tienes una reservación en ese horario' });
    throw err;
  }
}

// DELETE /api/reservaciones/:id
async function cancelar(req, res) {
  const { id } = req.params;
  const alumno_id = req.user.id;

  const { rows } = await db.query(
    `SELECT r.id, r.fecha, h.hora_inicio
     FROM reservaciones r
     JOIN horarios h ON h.id = r.horario_id
     WHERE r.id = $1 AND r.alumno_id = $2`,
    [id, alumno_id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Reservación no encontrada' });
  }

  const reservacion = rows[0];

  // Construir datetime de inicio de la clase en hora local del servidor
  const horaStr = reservacion.hora_inicio.slice(0, 5); // "HH:MM"
  const inicioClase = new Date(`${reservacion.fecha.toISOString().slice(0, 10)}T${horaStr}:00`);
  const ahoraMs = Date.now();
  const minutosRestantes = (inicioClase.getTime() - ahoraMs) / 60000;

  if (minutosRestantes < MIN_MINUTOS_CANCELAR) {
    return res.status(400).json({
      error: `No puedes cancelar con menos de ${MIN_MINUTOS_CANCELAR} minutos de anticipación`,
    });
  }

  await db.query('DELETE FROM reservaciones WHERE id = $1', [id]);
  res.json({ ok: true });
}

// GET /api/reservaciones/mis-clases
async function misClases(req, res) {
  const { rows } = await db.query(
    `SELECT r.id, r.fecha, h.dia_semana, h.hora_inicio, h.hora_fin
     FROM reservaciones r
     JOIN horarios h ON h.id = r.horario_id
     WHERE r.alumno_id = $1
     ORDER BY r.fecha DESC, h.hora_inicio`,
    [req.user.id]
  );
  res.json(rows);
}

// GET /api/reservaciones/horas-semana
async function horasSemanaCurrent(req, res) {
  // Usa CURRENT_DATE de PostgreSQL para evitar desfases UTC vs hora local
  const usadas = await horasSemanaActual(req.user.id);
  res.json({ horas_usadas: usadas, limite: MAX_HORAS_SEMANA });
}

// Cuenta horas en la semana actual (lunes–domingo) usando CURRENT_DATE del servidor DB
async function horasSemanaActual(alumno_id) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM reservaciones
     WHERE alumno_id = $1
       AND fecha >= date_trunc('week', CURRENT_DATE)::date
       AND fecha <= (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date`,
    [alumno_id]
  );
  return rows[0].total;
}

// Cuenta horas en la semana que contiene `fecha` (usado al crear reservaciones)
async function horasSemana(alumno_id, fecha) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM reservaciones
     WHERE alumno_id = $1
       AND fecha >= date_trunc('week', $2::date)::date
       AND fecha <= (date_trunc('week', $2::date) + INTERVAL '6 days')::date`,
    [alumno_id, fecha]
  );
  return rows[0].total;
}

module.exports = { disponibilidad, crear, cancelar, misClases, horasSemanaCurrent, horasSemana };
