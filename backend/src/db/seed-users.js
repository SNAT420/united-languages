require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const USUARIOS = [
  {
    nombre:        'Alumno Prueba',
    correo:        'juan@test.com',
    numero_alumno: 'A001',
    password:      'alumno123',
    nivel:         'intermedio',
    rol:           'alumno',
  },
  {
    nombre:        'Prof. García',
    correo:        'garcia@unitedlanguages.com',
    numero_alumno: 'M001',
    password:      'maestro123',
    nivel:         null,
    rol:           'maestro',
  },
  {
    nombre:        'Administrador',
    correo:        'admin@unitedlanguages.com',
    numero_alumno: 'ADMIN01',
    password:      'admin123',
    nivel:         null,
    rol:           'admin',
  },
];

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Conectado a la base de datos.\n');

  for (const u of USUARIOS) {
    const { rows: existe } = await client.query(
      'SELECT id FROM users WHERE correo = $1 OR numero_alumno = $2',
      [u.correo, u.numero_alumno]
    );

    if (existe.length > 0) {
      console.log(`⏭  Ya existe: ${u.correo} (${u.numero_alumno})`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 10);
    await client.query(
      `INSERT INTO users (nombre, correo, numero_alumno, password_hash, nivel, rol)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [u.nombre, u.correo, u.numero_alumno, hash, u.nivel, u.rol]
    );
    console.log(`✓  Creado: ${u.correo} (${u.rol}) — pass: ${u.password}`);
  }

  console.log('\nListo.');
  await client.end();
}

run().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
