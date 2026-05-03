import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../components/AppHeader';
import AnunciosBanner from '../components/AnunciosBanner';

function manana() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatFecha(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatHora(time) { return time.slice(0, 5); }

export default function Reservar() {
  const { user } = useAuth();
  const fecha = manana();

  const [horarios, setHorarios] = useState([]);
  const [semana, setSemana] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(null);
  const [toast, setToast] = useState(null);

  async function cargar() {
    setLoading(true);
    try {
      const [h, s, a] = await Promise.all([api.disponibilidad(fecha), api.horasSemana(), api.anuncios()]);
      setHorarios(h);
      setSemana(s);
      setAnuncios(a);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function reservar(horario_id) {
    setReservando(horario_id);
    try {
      await api.reservar({ horario_id, fecha });
      showToast('¡Reservación confirmada!');
      await cargar();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReservando(null);
    }
  }

  const horasUsadas = semana?.horas_usadas ?? 0;
  const limite = semana?.limite ?? 6;
  const bloqueado = horasUsadas >= limite;
  const pct = Math.min(100, (horasUsadas / limite) * 100);

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader subtitle="Bienvenido" title={user?.nombre} extra={`No. ${user?.numero_alumno}`} />

      <div className="px-4 -mt-2 pt-4 flex flex-col gap-4">
        {/* Tarjeta horas semana */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/60 border border-gray-100 p-5 card-accent">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Horas esta semana</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-4xl font-black text-gray-900 tabular-nums leading-none">{horasUsadas}</span>
                <span className="text-xl text-gray-300 font-light">/</span>
                <span className="text-2xl font-black text-gray-300">{limite}</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #C0161A, #8B0A0D)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: bloqueado
                  ? 'linear-gradient(90deg, #6B7280, #9CA3AF)'
                  : 'linear-gradient(90deg, #C0161A, #E53E3E)',
              }}
            />
          </div>
          {bloqueado ? (
            <p className="text-xs text-[#C0161A] font-bold mt-2.5 flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Límite alcanzado — reinicia el lunes
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium mt-2">
              {limite - horasUsadas} hora{limite - horasUsadas !== 1 ? 's' : ''} disponible{limite - horasUsadas !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Anuncios */}
        <AnunciosBanner anuncios={anuncios} />

        {/* Sección horarios */}
        <div>
          <div className="flex items-center gap-2.5 px-1 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C0161A, #8B0A0D)' }} />
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.15em] capitalize">
              {formatFecha(fecha)}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-[3px] border-[#C0161A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Cargando horarios…</p>
            </div>
          ) : horarios.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
              <p className="text-gray-400 text-sm">No hay clases disponibles este día</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {horarios.map((h) => {
                const lleno = !h.disponible;
                const yaBloqueado = lleno || bloqueado;
                return (
                  <div
                    key={h.id}
                    className={`bg-white rounded-2xl border-y border-r shadow-md shadow-gray-100/80 px-4 py-3.5 flex items-center gap-3.5 card-hover ${
                      lleno ? 'border-gray-100 opacity-55' : 'border-gray-100 card-accent'
                    }`}
                  >
                    {/* Pill hora */}
                    <div className={`px-3 py-2 rounded-2xl shrink-0 ${lleno ? 'bg-gray-100' : ''}`}
                      style={lleno ? {} : { background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
                      <p className={`text-[13px] font-black leading-none ${lleno ? 'text-gray-400' : 'text-white'}`}>
                        {formatHora(h.hora_inicio)}
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${lleno ? 'text-gray-300' : 'text-red-200'}`}>
                        {formatHora(h.hora_fin)}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900">
                        {formatHora(h.hora_inicio)} – {formatHora(h.hora_fin)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${lleno ? 'bg-gray-300' : 'bg-emerald-400'}`} />
                        <p className="text-[11px] text-gray-400 font-medium">
                          {lleno ? 'Sin lugares' : `${h.cupo_restante} lugar${h.cupo_restante !== 1 ? 'es' : ''} libre${h.cupo_restante !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    {!yaBloqueado ? (
                      <button
                        onClick={() => reservar(h.id)}
                        disabled={reservando === h.id}
                        className="text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-red-200 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
                      >
                        {reservando === h.id ? (
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                        ) : 'Reservar'}
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 shrink-0">
                        {lleno ? 'Lleno' : 'Bloqueado'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-24 left-4 right-4 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-2xl flex items-center gap-2.5 z-50 ${
          toast.type === 'error' ? 'bg-gray-900' : 'bg-emerald-600'
        }`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            {toast.type === 'error'
              ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            }
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
