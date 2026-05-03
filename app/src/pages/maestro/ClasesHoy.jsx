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

function formatFecha(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
function formatHora(t) { return t.slice(0, 5); }

export default function ClasesHoy() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    api.clasesHoy()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalAlumnos = data?.clases.reduce((s, c) => s + c.alumnos.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader
        subtitle="Maestro"
        title={user?.nombre}
        extra={data?.fecha ? formatFecha(data.fecha) : ''}
      />

      {/* Tarjeta resumen */}
      {data && !loading && (
        <div className="px-4 pt-4 pb-1">
          <div className="rounded-3xl overflow-hidden shadow-xl shadow-gray-200/70 card-accent"
            style={{ background: 'linear-gradient(135deg, #fff 60%, #FFF5F5 100%)' }}>
            <div className="px-5 py-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #C0161A, #8B0A0D)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-8 h-8">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-0.5">Resumen de hoy</p>
                <div className="flex items-baseline gap-3">
                  <div>
                    <span className="text-4xl font-black text-gray-900 leading-none">{data.clases.length}</span>
                    <span className="text-xs font-bold text-gray-400 ml-1">clases</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100" />
                  <div>
                    <span className="text-4xl font-black text-[#C0161A] leading-none">{totalAlumnos}</span>
                    <span className="text-xs font-bold text-gray-400 ml-1">alumnos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 flex flex-col gap-2.5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-[3px] border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-[#C0161A] bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

        {!loading && !error && data?.clases.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-medium">No tienes clases asignadas hoy</p>
          </div>
        )}

        {!loading && !error && data?.clases.map((clase) => {
          const isOpen = abierto === clase.id;
          const ocupacion = clase.alumnos.length;

          return (
            <div key={clase.id}
              className="bg-white rounded-2xl border-y border-r border-gray-100 shadow-md shadow-gray-100/80 overflow-hidden card-accent card-hover">
              <button
                className="w-full flex items-center px-4 py-4 gap-3.5 text-left"
                onClick={() => setAbierto(isOpen ? null : clase.id)}
              >
                {/* Pill hora */}
                <div className="px-3 py-2.5 rounded-2xl shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
                  <p className="text-white text-[13px] font-black leading-none">{formatHora(clase.hora_inicio)}</p>
                  <p className="text-red-200 text-[10px] font-medium mt-0.5">{formatHora(clase.hora_fin)}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-900 text-sm">
                      {formatHora(clase.hora_inicio)} – {formatHora(clase.hora_fin)}
                    </p>
                    {clase.nivel && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${NIVEL_BADGE[clase.nivel]}`}>
                        {NIVEL_LABEL[clase.nivel]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Avatares apilados */}
                    {ocupacion > 0 && (
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(ocupacion, 5) }).map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-white shrink-0"
                            style={{ background: `hsl(${(i * 47) % 360}, 60%, 55%)` }} />
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400 font-medium">
                      {ocupacion === 0 ? 'Sin alumnos' : `${ocupacion} alumno${ocupacion !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-black text-gray-700">{ocupacion}/8</span>
                  <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(ocupacion / 8) * 100}%`,
                        background: ocupacion >= 6
                          ? 'linear-gradient(90deg, #C0161A, #E53E3E)'
                          : 'linear-gradient(90deg, #10B981, #34D399)',
                      }} />
                  </div>
                </div>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className={`w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-gray-50 bg-gray-50/50 px-4 pb-3 pt-2 flex flex-col gap-0.5">
                  {clase.alumnos.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center font-medium">
                      Ningún alumno reservó este horario
                    </p>
                  ) : (
                    clase.alumnos.map((a, idx) => (
                      <div key={a.id}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white transition-colors">
                        <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shrink-0 shadow-sm"
                          style={{ background: `hsl(${(idx * 47) % 360}, 60%, 55%)` }}>
                          <span className="text-white text-xs font-black">{a.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{a.nombre}</p>
                          <p className="text-[11px] text-gray-400 font-medium">No. {a.numero_alumno}</p>
                        </div>
                        {a.nivel && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${NIVEL_BADGE[a.nivel]}`}>
                            {NIVEL_LABEL[a.nivel]}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
