const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`;

function getToken() {
  return localStorage.getItem('ul_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  perfil: () => request('/usuarios/perfil'),
  disponibilidad: (fecha) => request(`/reservaciones/disponibilidad?fecha=${fecha}`),
  reservar: (body) => request('/reservaciones', { method: 'POST', body: JSON.stringify(body) }),
  misClases: () => request('/reservaciones/mis-clases'),
  horasSemana: () => request('/reservaciones/horas-semana'),
  cancelarReservacion: (id) => request(`/reservaciones/${id}`, { method: 'DELETE' }),
  anuncios:         ()      => request('/anuncios'),
  horarioDiaAlumno: (fecha) => request(`/alumnos/horario-dia${fecha ? `?fecha=${fecha}` : ''}`),
  horarioDia:       (fecha) => request(`/maestro/horario-dia${fecha ? `?fecha=${fecha}` : ''}`),
  clasesHoy:        ()      => request('/maestro/clases-hoy'),
};
