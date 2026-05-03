const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`;

function getToken() {
  return localStorage.getItem('ul_admin_token');
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
  login:           (body)  => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  dashboard:       ()      => request('/admin/dashboard'),
  getAlumnos:      ()      => request('/admin/alumnos'),
  crearAlumno:     (body)  => request('/admin/alumnos', { method: 'POST', body: JSON.stringify(body) }),
  getMaestros:     ()      => request('/admin/maestros'),
  crearMaestro:    (body)  => request('/admin/maestros', { method: 'POST', body: JSON.stringify(body) }),
  getReservaciones:    (fecha)                  => request(`/admin/reservaciones?fecha=${fecha}`),
  getAnuncios:         ()                          => request('/admin/anuncios'),
  crearAnuncio:        (body)                      => request('/admin/anuncios', { method: 'POST', body: JSON.stringify(body) }),
  editarAnuncio:       (id, body)                  => request(`/admin/anuncios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarAnuncio:     (id)                        => request(`/admin/anuncios/${id}`, { method: 'DELETE' }),
  getMaestroHorarios:  (id)                        => request(`/admin/maestros/${id}/horarios`),
  asignarNivel:        (maestroId, horarioId, nivel) => request(`/admin/maestros/${maestroId}/horarios/${horarioId}`, { method: 'PUT', body: JSON.stringify({ nivel }) }),
};
