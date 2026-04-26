import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const NIVEL_COLOR = {
  inicial:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermedio: 'bg-blue-50 text-blue-700 border border-blue-200',
  avanzado:   'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function Reservaciones() {
  const hoyISO = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoyISO);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function cargar(f) {
    setLoading(true); setError('');
    try { setData(await api.getReservaciones(f)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(fecha); }, [fecha]);

  const totalReservaciones = data?.horarios.reduce((s, h) => s + h.alumnos.length, 0) ?? 0;

  return (
    <Layout>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reservaciones</h1>
          {data && (
            <p className="text-sm text-gray-400 font-medium mt-1 capitalize">
              <span className="font-black text-gray-700">{totalReservaciones}</span> reservación{totalReservaciones !== 1 ? 'es' : ''} · {formatFecha(fecha)}
            </p>
          )}
        </div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition shadow-sm"
        />
      </div>

      {error && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">{error}</p>}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-9 h-9 border-[3px] border-[#C0161A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && (
        <div className="flex flex-col gap-4">
          {data.horarios.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12 font-medium">Sin horarios para este día</p>
          ) : (
            data.horarios.map((h) => (
              <div key={h.horario_id}
                className="bg-white rounded-3xl border-y border-r border-gray-100 shadow-lg shadow-gray-100 overflow-hidden card-accent card-hover">
                {/* Header horario */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    {/* Pill hora */}
                    <div className="px-3 py-2 rounded-2xl shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
                      <p className="text-white text-[13px] font-black leading-none">{h.hora_inicio.slice(0, 5)}</p>
                      <p className="text-red-200 text-[10px] font-medium mt-0.5">{h.hora_fin.slice(0, 5)}</p>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">
                        {h.hora_inicio.slice(0, 5)} – {h.hora_fin.slice(0, 5)}
                      </p>
                      <p className="text-[11px] text-gray-400 font-bold mt-0.5">
                        <span className="text-gray-700 font-black">{h.alumnos.length}</span> / 8 lugares
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${(h.alumnos.length / 8) * 100}%`,
                          background: h.alumnos.length >= 6
                            ? 'linear-gradient(90deg, #C0161A, #E53E3E)'
                            : 'linear-gradient(90deg, #10B981, #34D399)',
                        }} />
                    </div>
                    <span className="text-xs font-black text-gray-400 tabular-nums w-8 text-right">
                      {Math.round((h.alumnos.length / 8) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Alumnos */}
                {h.alumnos.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium px-6 py-4">Sin alumnos inscritos</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {h.alumnos.map((a) => (
                        <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-red-50/20 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-gray-900">{a.nombre}</td>
                          <td className="px-6 py-3.5 text-gray-400 text-xs font-bold tabular-nums">{a.numero_alumno}</td>
                          <td className="px-6 py-3.5">
                            {a.nivel && (
                              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${NIVEL_COLOR[a.nivel]}`}>
                                {a.nivel.charAt(0).toUpperCase() + a.nivel.slice(1)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
}

function formatFecha(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
