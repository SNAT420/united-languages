import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import AppHeader from '../../components/AppHeader';

const NIVEL_BADGE = {
  inicial:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermedio: 'bg-blue-50 text-blue-700 border border-blue-200',
  avanzado:   'bg-purple-50 text-purple-700 border border-purple-200',
};
const NIVEL_LABEL = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const NIVEL_SHORT = { inicial: 'Ini', intermedio: 'Int', avanzado: 'Avz' };

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

export default function Horario() {
  const { user } = useAuth();
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

  // Nivel del maestro logueado en la primera hora del día
  const miNivelResumen = (() => {
    if (!data || !user) return null;
    const miIdx = data.maestros.findIndex((m) => m.id === user.id);
    if (miIdx === -1 || data.horarios.length === 0) return null;
    return data.horarios[0].asignaciones[miIdx]?.nivel ?? null;
  })();

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader subtitle="Maestro" title="Horario" />

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
          <div className="text-center flex-1">
            <p className="text-sm font-black text-gray-900 capitalize">{formatFechaLarga(fecha)}</p>
          </div>
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

      <div className="px-4 pt-1 flex flex-col gap-3">
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
          <>
            {/* Tarjeta resumen del maestro */}
            {miNivelResumen && (
              <div className="rounded-2xl overflow-hidden shadow-md card-accent"
                style={{ background: 'linear-gradient(135deg, #fff 60%, #FFF5F5)' }}>
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #C0161A, #8B0A0D)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Tu primera clase hoy</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">
                      Empiezas con{' '}
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${NIVEL_BADGE[miNivelResumen]}`}>
                        {NIVEL_LABEL[miNivelResumen]}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de rotación */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/80 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] w-14">Hora</th>
                    {data.maestros.map((m) => {
                      const esMio = m.id === user?.id;
                      return (
                        <th key={m.id} className="px-1 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[9px] font-black uppercase tracking-[0.1em] truncate max-w-[64px] ${esMio ? 'text-[#C0161A]' : 'text-gray-400'}`}>
                              {m.nombre.split(' ')[0]}
                            </span>
                            {esMio && <div className="w-5 h-[2.5px] rounded-full bg-[#C0161A]" />}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {buildRows(data.horarios, user?.id)}
                </tbody>
              </table>

              {/* Leyenda */}
              <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-3 flex-wrap">
                {Object.entries(NIVEL_LABEL).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${NIVEL_BADGE[k]}`}>{NIVEL_SHORT[k]}</span>
                    <span className="text-[10px] text-gray-400">{v}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="w-3 h-3 rounded bg-red-50 border border-[#C0161A]/20" />
                  <span className="text-[10px] text-gray-400">Tú</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function buildRows(horarios, miId) {
  const rows = [];
  let separatorInserted = false;

  horarios.forEach((h, idx) => {
    const hora = parseInt(h.hora_inicio.slice(0, 2));
    const esTarde = hora >= 16;

    if (esTarde && !separatorInserted) {
      separatorInserted = true;
      rows.push(
        <tr key="sep-tarde">
          <td colSpan={h.asignaciones.length + 1} className="px-3 py-1 bg-gray-50/80 border-t border-gray-100">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Tarde</span>
          </td>
        </tr>
      );
    }

    rows.push(
      <tr key={h.horario_id} className={`border-b border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
        <td className="px-3 py-3 font-black text-gray-700 text-[11px]">{h.hora_inicio.slice(0, 5)}</td>
        {h.asignaciones.map((a) => {
          const esMio = a.maestro_id === miId;
          return (
            <td key={a.maestro_id} className={`px-1 py-2.5 text-center ${esMio ? 'bg-red-50/50' : ''}`}>
              <span className={`inline-block text-[10px] font-black px-1.5 py-1 rounded-lg ${NIVEL_BADGE[a.nivel]} ${esMio ? 'ring-1 ring-[#C0161A]/25 shadow-sm' : ''}`}>
                {NIVEL_SHORT[a.nivel]}
              </span>
            </td>
          );
        })}
      </tr>
    );
  });

  return rows;
}
