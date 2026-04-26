require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/reservaciones', require('./routes/reservaciones'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/maestro', require('./routes/maestro'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
