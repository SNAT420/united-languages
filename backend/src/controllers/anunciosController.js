const db = require('../db/client');

// GET /api/anuncios — anuncios activos vigentes hoy (cualquier rol autenticado)
async function getActivos(req, res) {
  const { rows } = await db.query(
    `SELECT id, titulo, contenido, fecha_inicio, fecha_fin
     FROM anuncios
     WHERE activo = true
       AND fecha_inicio <= CURRENT_DATE
       AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
     ORDER BY created_at DESC`
  );
  res.json(rows);
}

// GET /api/admin/anuncios — todos (incluye inactivos y vencidos)
async function getTodos(req, res) {
  const { rows } = await db.query(
    `SELECT a.id, a.titulo, a.contenido, a.activo, a.fecha_inicio, a.fecha_fin,
            a.created_at, u.nombre AS creado_por_nombre
     FROM anuncios a
     JOIN users u ON u.id = a.creado_por
     ORDER BY a.created_at DESC`
  );
  res.json(rows);
}

// POST /api/admin/anuncios
async function crear(req, res) {
  const { titulo, contenido, fecha_inicio, fecha_fin } = req.body;
  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'titulo y contenido son requeridos' });
  }
  const { rows } = await db.query(
    `INSERT INTO anuncios (titulo, contenido, fecha_inicio, fecha_fin, creado_por)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [titulo, contenido, fecha_inicio || null, fecha_fin || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

// PUT /api/admin/anuncios/:id
async function editar(req, res) {
  const { id } = req.params;
  const { titulo, contenido, activo, fecha_inicio, fecha_fin } = req.body;
  const { rows } = await db.query(
    `UPDATE anuncios
     SET titulo       = COALESCE($1, titulo),
         contenido    = COALESCE($2, contenido),
         activo       = COALESCE($3, activo),
         fecha_inicio = COALESCE($4, fecha_inicio),
         fecha_fin    = $5
     WHERE id = $6
     RETURNING *`,
    [titulo || null, contenido || null, activo ?? null, fecha_inicio || null, fecha_fin || null, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Anuncio no encontrado' });
  res.json(rows[0]);
}

// DELETE /api/admin/anuncios/:id
async function eliminar(req, res) {
  const { rows } = await db.query(
    'DELETE FROM anuncios WHERE id = $1 RETURNING id',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Anuncio no encontrado' });
  res.json({ ok: true });
}

module.exports = { getActivos, getTodos, crear, editar, eliminar };
