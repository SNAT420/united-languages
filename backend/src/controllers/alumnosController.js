const db = require('../db/client');

const DIAS   = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const NIVELES = ['inicial', 'intermedio', 'avanzado'];

function seedDelDia(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00');
  const inicio = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d - inicio) / 86400000) % 3;
}

function nivelEnSlot(seed, maestroIndex, slotIndex) {
  return NIVELES[(seed + maestroIndex + (slotIndex % 3) + Math.floor(slotIndex / 3)) % 3];
}

// GET /api/alumnos/horario-dia?fecha=YYYY-MM-DD
// Returns teacher name per nivel per slot — no student data
async function horarioDiaAlumno(req, res) {
  const TZ = 'America/Mexico_City';
  const fecha = req.query.fecha ||
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

  const diaSemana = DIAS[new Date(fecha + 'T00:00:00').getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, horarios: [] });
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

  const maestroById = Object.fromEntries(maestros.map((m) => [m.id, m.nombre]));

  const horarios = slots.map((h, slotIdx) => {
    const maestroPorNivel = {};
    maestros.forEach((m, maestroIdx) => {
      const nivel = nivelEnSlot(seed, maestroIdx, slotIdx);
      maestroPorNivel[nivel] = maestroById[m.id];
    });
    return {
      horario_id: h.id,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      maestros_por_nivel: maestroPorNivel,
    };
  });

  res.json({ fecha, dia_semana: diaSemana, horarios });
}

module.exports = { horarioDiaAlumno };
