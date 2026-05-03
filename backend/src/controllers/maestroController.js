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

// GET /api/maestro/clases-hoy
async function clasesHoy(req, res) {
  const hoy = new Date();
  const fecha = hoy.toISOString().slice(0, 10);
  const diaSemana = DIAS[hoy.getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, clases: [] });
  }

  const { rows: horarios } = await db.query(
    `SELECT h.id, h.hora_inicio, h.hora_fin, mh.nivel
     FROM maestro_horarios mh
     JOIN horarios h ON h.id = mh.horario_id
     WHERE mh.maestro_id = $1 AND h.dia_semana = $2
     ORDER BY h.hora_inicio`,
    [req.user.id, diaSemana]
  );

  const clases = await Promise.all(
    horarios.map(async (h) => {
      const { rows: alumnos } = await db.query(
        `SELECT u.id, u.nombre, u.numero_alumno, u.nivel
         FROM reservaciones r
         JOIN users u ON u.id = r.alumno_id
         WHERE r.horario_id = $1 AND r.fecha = $2
           AND ($3::nivel_enum IS NULL OR u.nivel = $3::nivel_enum)
         ORDER BY u.nombre`,
        [h.id, fecha, h.nivel]
      );
      return { ...h, alumnos };
    })
  );

  res.json({ fecha, dia_semana: diaSemana, clases });
}

// GET /api/maestro/horario-dia?fecha=YYYY-MM-DD
async function horarioDia(req, res) {
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
  const diaSemana = DIAS[new Date(fecha + 'T00:00:00').getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, maestros: [], horarios: [] });
  }

  const seed = seedDelDia(fecha);

  const [{ rows: maestros }, { rows: slots }] = await Promise.all([
    db.query(
      `SELECT id, nombre FROM users WHERE rol = 'maestro' AND activo = true ORDER BY created_at, id`
    ),
    db.query(
      `SELECT id, hora_inicio, hora_fin FROM horarios WHERE dia_semana = $1 ORDER BY hora_inicio`,
      [diaSemana]
    ),
  ]);

  const horarios = slots.map((h, slotIdx) => ({
    horario_id: h.id,
    hora_inicio: h.hora_inicio,
    hora_fin:    h.hora_fin,
    asignaciones: maestros.map((m, maestroIdx) => ({
      maestro_id: m.id,
      nivel: nivelEnSlot(seed, maestroIdx, slotIdx),
    })),
  }));

  res.json({ fecha, dia_semana: diaSemana, seed, maestros, horarios });
}

module.exports = { clasesHoy, horarioDia };
