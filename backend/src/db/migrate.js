require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const dbName = dbUrl.pathname.slice(1);

  // Conectar a postgres (sin especificar la base) para crearla si no existe
  const adminUrl = process.env.DATABASE_URL.replace(`/${dbName}`, '/postgres');
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  const exists = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
  );
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log(`Base de datos "${dbName}" creada.`);
  }
  await admin.end();

  // Conectar a la base de datos del proyecto
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query(schema);
  console.log('Tablas creadas.');

  // Solo insertar seed si horarios está vacío
  const { rowCount } = await client.query('SELECT 1 FROM horarios LIMIT 1');
  if (rowCount === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await client.query(seed);
    console.log('Seed de horarios insertado.');
  } else {
    console.log('Seed ya existía, omitido.');
  }

  await client.end();
  console.log('Migración completa.');
}

migrate().catch((err) => {
  console.error('Error en migración:', err.message);
  process.exit(1);
});
