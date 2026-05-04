const db = require('../db/client');

const DIAS   = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const NIVELES = ['inicial', 'intermedio', 'avanzado'];

// Seed basado en día del año (0-364) → 0,1,2 — diferente cada día, consistente para todos
function seedDelDia(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00');
  const inicio = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d - inicio) / 86400000) % 3;
}

// Nivel que imparte el maestro j en el slot i del día con semilla seed
function nivelEnSlot(seed, maestroIndex, slotIndex) {
  return NIVELES[(seed + maestroIndex + (slotIndex % 3) + Math.floor(slotIndex / 3)) % 3];
}

const TZ = 'America/Mexico_City';
function hoyMexico() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}
function diaSemanaHoyMexico() {
  return new Intl.DateTimeFormat('es-MX', { timeZone: TZ, weekday: 'long' })
    .format(new Date())
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); // sin tildes
}

// GET /api/maestro/clases-hoy
async function clasesHoy(req, res) {
  const fecha     = hoyMexico();
  const diaSemana = DIAS[new Date(fecha + 'T12:00:00').getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, clases: [] });
  }

  const seed = seedDelDia(fecha);

  // Obtener todos los maestros activos en el mismo orden que usa la rotación
  const [{ rows: maestros }, { rows: slots }] = await Promise.all([
    db.query(
      `SELECT id FROM users WHERE rol = 'maestro' AND activo = true ORDER BY created_at, id`
    ),
    db.query(
      `SELECT id, hora_inicio, hora_fin FROM horarios WHERE dia_semana = $1 ORDER BY hora_inicio`,
      [diaSemana]
    ),
  ]);

  // Índice de este maestro en la lista de rotación
  const miIdx = maestros.findIndex((m) => m.id === req.user.id);
  if (miIdx === -1) {
    // Maestro no encontrado en la lista activa (inactivo o no existe)
    return res.json({ fecha, dia_semana: diaSemana, clases: [] });
  }

  // Para cada slot, calcular el nivel del maestro por rotación y buscar sus alumnos
  const clases = await Promise.all(
    slots.map(async (h, slotIdx) => {
      const nivel = nivelEnSlot(seed, miIdx, slotIdx);
      const { rows: alumnos } = await db.query(
        `SELECT u.id, u.nombre, u.numero_alumno, u.nivel
         FROM reservaciones r
         JOIN users u ON u.id = r.alumno_id
         WHERE r.horario_id = $1 AND r.fecha = $2 AND u.nivel = $3::nivel_enum
         ORDER BY u.nombre`,
        [h.id, fecha, nivel]
      );
      return { id: h.id, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, nivel, alumnos };
    })
  );

  res.json({ fecha, dia_semana: diaSemana, clases });
}

// GET /api/maestro/horario-dia?fecha=YYYY-MM-DD
async function horarioDia(req, res) {
  const fecha = req.query.fecha || hoyMexico();
  const diaSemana = DIAS[new Date(fecha + 'T00:00:00').getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, maestros: [], horarios: [] });
  }

  const seed = seedDelDia(fecha);

  const [{ rows: maestros }, { rows: slots }, { rows: conteos }] = await Promise.all([
    db.query(
      `SELECT id, nombre FROM users WHERE rol = 'maestro' AND activo = true ORDER BY created_at, id`
    ),
    db.query(
      `SELECT id, hora_inicio, hora_fin FROM horarios WHERE dia_semana = $1 ORDER BY hora_inicio`,
      [diaSemana]
    ),
    db.query(
      `SELECT r.horario_id, u.nivel, u.numero_alumno
       FROM reservaciones r
       JOIN users u ON u.id = r.alumno_id
       WHERE r.fecha = $1
       ORDER BY u.numero_alumno`,
      [fecha]
    ),
  ]);

  // Build lookup: horario_id → nivel → numero_alumno[]
  const alumnosMap = {};
  for (const c of conteos) {
    if (!alumnosMap[c.horario_id]) alumnosMap[c.horario_id] = {};
    if (!alumnosMap[c.horario_id][c.nivel]) alumnosMap[c.horario_id][c.nivel] = [];
    alumnosMap[c.horario_id][c.nivel].push(c.numero_alumno);
  }

  const horarios = slots.map((h, slotIdx) => ({
    horario_id: h.id,
    hora_inicio: h.hora_inicio,
    hora_fin:    h.hora_fin,
    asignaciones: maestros.map((m, maestroIdx) => {
      const nivel = nivelEnSlot(seed, maestroIdx, slotIdx);
      const nums = alumnosMap[h.id]?.[nivel] ?? [];
      return {
        maestro_id: m.id,
        nivel,
        alumnos: nums.length,
        numeros: nums,
      };
    }),
  }));

  res.json({ fecha, dia_semana: diaSemana, seed, maestros, horarios });
}

module.exports = { clasesHoy, horarioDia };
