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
  if (res.status === 401) {
    localStorage.removeItem('ul_admin_token');
    localStorage.removeItem('ul_admin_user');
    window.location.href = '/login';
    return;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export const api = {
  login:           (body)  => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  dashboard:       ()      => request('/admin/dashboard'),
  getAlumnos:      ()           => request('/admin/alumnos'),
  crearAlumno:     (body)       => request('/admin/alumnos', { method: 'POST', body: JSON.stringify(body) }),
  editarAlumno:    (id, body)   => request(`/admin/alumnos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarAlumno:  (id)         => request(`/admin/alumnos/${id}`, { method: 'DELETE' }),
  getMaestros:     ()           => request('/admin/maestros'),
  crearMaestro:    (body)       => request('/admin/maestros', { method: 'POST', body: JSON.stringify(body) }),
  editarMaestro:   (id, body)   => request(`/admin/maestros/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarMaestro: (id)         => request(`/admin/maestros/${id}`, { method: 'DELETE' }),
  getReservaciones:    (fecha)                  => request(`/admin/reservaciones?fecha=${fecha}`),
  getAnuncios:         ()                          => request('/admin/anuncios'),
  crearAnuncio:        (body)                      => request('/admin/anuncios', { method: 'POST', body: JSON.stringify(body) }),
  editarAnuncio:       (id, body)                  => request(`/admin/anuncios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarAnuncio:     (id)                        => request(`/admin/anuncios/${id}`, { method: 'DELETE' }),
  getMaestroHorarios:  (id)                        => request(`/admin/maestros/${id}/horarios`),
  asignarNivel:        (maestroId, horarioId, nivel) => request(`/admin/maestros/${maestroId}/horarios/${horarioId}`, { method: 'PUT', body: JSON.stringify({ nivel }) }),
};
