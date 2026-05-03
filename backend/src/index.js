require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Orígenes permitidos: variable de entorno ALLOWED_ORIGINS (coma-separados) + localhost dev
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
];

app.use(cors({
  origin(origin, cb) {
    // Permitir peticiones sin origen (curl, Postman, Railway health checks)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Permitir cualquier subdominio de vercel.app en preview deployments
    if (/\.vercel\.app$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origen no permitido — ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/reservaciones', require('./routes/reservaciones'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/maestro', require('./routes/maestro'));
app.use('/api/anuncios', require('./routes/anuncios'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
