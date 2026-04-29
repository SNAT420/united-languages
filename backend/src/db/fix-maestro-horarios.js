require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Find maestro M001
  const { rows: maestros } = await client.query(
    `SELECT id, nombre, correo FROM users WHERE rol = 'maestro' ORDER BY correo`
  );
  if (maestros.length === 0) {
    console.log('No se encontraron maestros.');
    await client.end();
    return;
  }

  console.log('Maestros encontrados:');
  maestros.forEach(m => console.log(`  ${m.correo} — ${m.nombre} (${m.id})`));

  // Assign ALL horarios to every maestro
  for (const maestro of maestros) {
    // Delete existing assignments
    const { rowCount: deleted } = await client.query(
      'DELETE FROM maestro_horarios WHERE maestro_id = $1', [maestro.id]
    );
    console.log(`\n${maestro.correo}: borradas ${deleted} asignaciones previas`);

    // Get all horarios
    const { rows: horarios } = await client.query(
      'SELECT id, dia_semana, hora_inicio FROM horarios ORDER BY dia_semana, hora_inicio'
    );

    // Insert all
    for (const h of horarios) {
      await client.query(
        'INSERT INTO maestro_horarios (maestro_id, horario_id) VALUES ($1, $2)',
        [maestro.id, h.id]
      );
    }
    console.log(`${maestro.correo}: asignados ${horarios.length} horarios (todos los días)`);
  }

  // Verify: show today's slots with student counts
  const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const hoy = new Date();
  const diaSemana = DIAS[hoy.getDay()];
  const fecha = hoy.toISOString().slice(0, 10);

  console.log(`\n--- Verificación: ${diaSemana} ${fecha} ---`);

  for (const maestro of maestros) {
    const { rows: slots } = await client.query(
      `SELECT h.hora_inicio, h.hora_fin,
              COUNT(r.id)::int AS alumnos
       FROM maestro_horarios mh
       JOIN horarios h ON h.id = mh.horario_id
       LEFT JOIN reservaciones r ON r.horario_id = h.id AND r.fecha = $1
       WHERE mh.maestro_id = $2 AND h.dia_semana = $3
       GROUP BY h.id, h.hora_inicio, h.hora_fin
       ORDER BY h.hora_inicio`,
      [fecha, maestro.id, diaSemana]
    );

    if (slots.length === 0) {
      console.log(`${maestro.correo}: sin slots para ${diaSemana}`);
    } else {
      console.log(`${maestro.correo}: ${slots.length} slots`);
      slots.forEach(s => {
        console.log(`  ${s.hora_inicio.slice(0,5)}-${s.hora_fin.slice(0,5)}: ${s.alumnos} alumno(s)`);
      });
    }
  }

  await client.end();
  console.log('\nListo.');
}

fix().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
