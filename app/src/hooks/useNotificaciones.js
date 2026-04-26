import { useEffect, useRef } from 'react';
import { api } from '../api/client';

// Devuelve la fecha local del usuario como 'YYYY-MM-DD'
function fechaLocalHoy() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

// Convierte el campo fecha de la API (puede traer timezone) a 'YYYY-MM-DD' local
function isoAFechaLocal(isoStr) {
  const d = new Date(isoStr);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function useNotificaciones(user) {
  const timeoutsRef = useRef([]);

  useEffect(() => {
    if (!user || user.rol !== 'alumno') return;
    if (!('Notification' in window)) return;

    let cancelado = false;

    async function programar() {
      // Pedir permiso solo si no se ha respondido aún
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (cancelado || Notification.permission !== 'granted') return;

      let clases;
      try {
        clases = await api.misClases();
      } catch {
        return;
      }
      if (cancelado) return;

      const hoy = fechaLocalHoy();
      const clasesHoy = clases.filter((c) => isoAFechaLocal(c.fecha) === hoy);

      // Cancelar timeouts anteriores de esta sesión
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      for (const clase of clasesHoy) {
        const horaStr = clase.hora_inicio.slice(0, 5); // "HH:MM"
        const inicioClase = new Date(`${hoy}T${horaStr}:00`);
        const msParaNotif = inicioClase.getTime() - 60 * 60 * 1000 - Date.now();

        if (msParaNotif > 0) {
          const id = setTimeout(() => {
            new Notification('United Languages 📚', {
              body: `¡Tu clase de inglés es en 1 hora! Clase de ${horaStr} en United Languages`,
              icon: '/logo.png',
              badge: '/icons/icon-192.svg',
              tag: `clase-${hoy}-${horaStr}`,   // evita notificaciones duplicadas
              renotify: false,
            });
          }, msParaNotif);

          timeoutsRef.current.push(id);
        }
      }
    }

    programar();

    return () => {
      cancelado = true;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [user?.id]); // re-ejecuta solo si cambia el usuario
}
