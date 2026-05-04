import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppHeader from '../components/AppHeader';

const NIVELES = ['inicial', 'intermedio', 'avanzado'];
const NIVEL_LABEL = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const NIVEL_TH = {
  inicial:    'text-emerald-700 bg-emerald-50',
  intermedio: 'text-blue-700 bg-blue-50',
  avanzado:   'text-purple-700 bg-purple-50',
};
const NIVEL_CELL = {
  inicial:    'text-emerald-800',
  intermedio: 'text-blue-800',
  avanzado:   'text-purple-800',
};

function fechaLocalStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function moverDia(fecha, delta) {
  const d = new Date(fecha + 'T00:00:00');
  do { d.setDate(d.getDate() + delta); } while (d.getDay() === 0);
  return fechaLocalStr(d);
}

function formatFechaLarga(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function HorarioAlumno() {
  const [fecha, setFecha] = useState(fechaLocalStr(new Date()));
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.horarioDia(fecha)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fecha]);

  const esDomingo = data?.dia_semana === 'domingo';
  const maestrosPorId = Object.fromEntries((data?.maestros ?? []).map((m) => [m.id, m.nombre]));

  // Para cada slot y nivel, devuelve el nombre del maestro asignado
  function maestroEnNivel(asignaciones, nivel) {
    const asig = asignaciones.find((a) => a.nivel === nivel);
    if (!asig) return '—';
    const nombre = maestrosPorId[asig.maestro_id] ?? '—';
    return nombre.split(' ')[0]; // solo primer nombre para que quepa
  }

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader subtitle="Alumno" title="Horario" />

      {/* Navegador de fecha */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 px-2 py-2.5 flex items-center justify-between card-accent">
          <button
            onClick={() => setFecha((f) => moverDia(f, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-gray-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <p className="text-sm font-black text-gray-900 capitalize">{formatFechaLarga(fecha)}</p>
          <button
            onClick={() => setFecha((f) => moverDia(f, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-gray-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pt-1">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-9 h-9 border-[3px] border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-[#C0161A] bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

        {!loading && !error && esDomingo && (
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-medium">No hay clases los domingos</p>
          </div>
        )}

        {!loading && !error && !esDomingo && data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] w-14">Hora</th>
                  {NIVELES.map((n) => (
                    <th key={n} className={`px-2 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] ${NIVEL_TH[n]}`}>
                      {NIVEL_LABEL[n]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildRows(data.horarios, maestroEnNivel, NIVEL_CELL)}
              </tbody>
            </table>

            {/* Leyenda */}
            <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-4 flex-wrap">
              {NIVELES.map((n) => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    n === 'inicial' ? 'bg-emerald-400' : n === 'intermedio' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                  <span className="text-[10px] text-gray-400">{NIVEL_LABEL[n]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildRows(horarios, maestroEnNivel, NIVEL_CELL) {
  const rows = [];
  let separatorInserted = false;

  horarios.forEach((h, idx) => {
    const hora = parseInt(h.hora_inicio.slice(0, 2));

    if (hora >= 16 && !separatorInserted) {
      separatorInserted = true;
      rows.push(
        <tr key="sep-tarde">
          <td colSpan={4} className="px-3 py-1 bg-gray-50/80 border-t border-gray-100">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Tarde</span>
          </td>
        </tr>
      );
    }

    rows.push(
      <tr key={h.horario_id} className={`border-b border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
        <td className="px-3 py-3 font-black text-gray-700 text-[11px]">{h.hora_inicio.slice(0, 5)}</td>
        {NIVELES.map((n) => (
          <td key={n} className="px-2 py-3 text-center">
            <span className={`text-[11px] font-bold ${NIVEL_CELL[n]}`}>
              {maestroEnNivel(h.asignaciones, n)}
            </span>
          </td>
        ))}
      </tr>
    );
  });

  return rows;
}
