const db = require('../db/client');

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// GET /api/maestro/clases-hoy
async function clasesHoy(req, res) {
  const hoy = new Date();
  const fecha = hoy.toISOString().slice(0, 10);
  const diaSemana = DIAS[hoy.getDay()];

  if (diaSemana === 'domingo') {
    return res.json({ fecha, dia_semana: diaSemana, clases: [] });
  }

  // Horarios asignados al maestro para el día de hoy
  const { rows: horarios } = await db.query(
    `SELECT h.id, h.hora_inicio, h.hora_fin
     FROM maestro_horarios mh
     JOIN horarios h ON h.id = mh.horario_id
     WHERE mh.maestro_id = $1 AND h.dia_semana = $2
     ORDER BY h.hora_inicio`,
    [req.user.id, diaSemana]
  );

  // Para cada horario, obtener alumnos con reservación hoy
  const clases = await Promise.all(
    horarios.map(async (h) => {
      const { rows: alumnos } = await db.query(
        `SELECT u.id, u.nombre, u.numero_alumno, u.nivel
         FROM reservaciones r
         JOIN users u ON u.id = r.alumno_id
         WHERE r.horario_id = $1 AND r.fecha = $2
         ORDER BY u.nombre`,
        [h.id, fecha]
      );
      return { ...h, alumnos };
    })
  );

  res.json({ fecha, dia_semana: diaSemana, clases });
}

module.exports = { clasesHoy };
