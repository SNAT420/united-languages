import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import AppHeader from '../components/AppHeader';

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatHora(time) { return time.slice(0, 5); }

function esProxima(fechaIso) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f = new Date(fechaIso); f.setHours(0, 0, 0, 0);
  return f >= hoy;
}

// Devuelve minutos que faltan para el inicio de la clase (negativo si ya pasó)
function minutosParaClase(fechaIso, horaInicio) {
  const fecha = new Date(fechaIso).toISOString().slice(0, 10);
  const inicio = new Date(`${fecha}T${horaInicio.slice(0, 5)}:00`);
  return (inicio.getTime() - Date.now()) / 60000;
}

// Modal de confirmación
function ModalConfirmar({ clase, onConfirmar, onCancelar, cargando }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancelar} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Franja roja superior */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #C0161A, #E53E3E)' }} />

        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C0161A" strokeWidth={2} className="w-6 h-6">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-gray-900 text-base leading-tight">¿Cancelar esta clase?</p>
              <p className="text-sm text-gray-500 font-medium mt-1">Esta acción no se puede deshacer</p>
            </div>
          </div>

          {/* Detalle de la clase */}
          <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <div className="px-2.5 py-2 rounded-xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
              <p className="text-white text-xs font-black leading-none">{formatHora(clase.hora_inicio)}</p>
              <p className="text-red-200 text-[10px] mt-0.5">{formatHora(clase.hora_fin)}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {formatHora(clase.hora_inicio)} – {formatHora(clase.hora_fin)}
              </p>
              <p className="text-xs text-gray-400 font-medium capitalize">
                {formatFecha(clase.fecha)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl py-3 text-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={onConfirmar}
              disabled={cargando}
              className="flex-1 text-white font-black rounded-2xl py-3 text-sm shadow-md shadow-red-200 active:scale-95 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Cancelando…
                </span>
              ) : 'Sí, cancelar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MisClases() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [modalClase, setModalClase] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  // re-render cada minuto para actualizar el estado cancelable
  const [, setTick] = useState(0);

  const cargar = useCallback(async () => {
    try {
      setClases(await api.misClases());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function confirmarCancelacion() {
    if (!modalClase) return;
    setCancelando(true);
    try {
      await api.cancelarReservacion(modalClase.id);
      setModalClase(null);
      showToast('Clase cancelada — hora devuelta a tu semana');
      await cargar();
    } catch (e) {
      setModalClase(null);
      showToast(e.message, 'error');
    } finally {
      setCancelando(false);
    }
  }

  const proximas  = clases.filter((c) => esProxima(c.fecha));
  const historial = clases.filter((c) => !esProxima(c.fecha));

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader subtitle="Agenda" title="Mis clases" />

      <div className="px-4 pt-5 flex flex-col gap-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-[3px] border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-[#C0161A] bg-red-50 rounded-2xl px-4 py-3">{error}</p>}
        {!loading && !error && (
          <>
            <Section
              titulo="Próximas"
              clases={proximas}
              vacia="No tienes clases próximas"
              mostrarCancelar
              onCancelar={setModalClase}
            />
            <Section
              titulo="Historial"
              clases={historial}
              vacia="Sin historial aún"
            />
          </>
        )}
      </div>

      {/* Modal */}
      {modalClase && (
        <ModalConfirmar
          clase={modalClase}
          onConfirmar={confirmarCancelacion}
          onCancelar={() => !cancelando && setModalClase(null)}
          cargando={cancelando}
        />
      )}

      {/* Toast */}
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

function Section({ titulo, clases, vacia, mostrarCancelar, onCancelar }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 px-1 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C0161A, #8B0A0D)' }} />
        <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.15em]">{titulo}</p>
        {clases.length > 0 && (
          <span className="text-[10px] font-black bg-[#C0161A] text-white px-1.5 py-0.5 rounded-full leading-none">
            {clases.length}
          </span>
        )}
      </div>

      {clases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center shadow-sm">
          <p className="text-sm text-gray-400 font-medium">{vacia}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {clases.map((c) => {
            const minutos = minutosParaClase(c.fecha, c.hora_inicio);
            const cancelable = minutos > 60;
            const yaEmpezada = minutos <= 0;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border-y border-r border-gray-100 shadow-md shadow-gray-100/80 px-4 py-3.5 flex items-center gap-3.5 card-accent card-hover"
              >
                {/* Fecha visual */}
                <div className="shrink-0 flex flex-col items-center justify-center px-2.5 py-2.5 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
                  <span className="text-white text-base font-black leading-none">
                    {new Date(c.fecha).toLocaleDateString('es-MX', { day: 'numeric' })}
                  </span>
                  <span className="text-red-200 text-[9px] uppercase font-bold mt-0.5">
                    {new Date(c.fecha).toLocaleDateString('es-MX', { month: 'short' })}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">
                    {formatHora(c.hora_inicio)} – {formatHora(c.hora_fin)}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 capitalize truncate">
                    {formatFecha(c.fecha)}
                  </p>
                </div>

                {/* Estado / botón cancelar */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {mostrarCancelar && !yaEmpezada ? (
                    cancelable ? (
                      <button
                        onClick={() => onCancelar(c)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-xl border-2 border-[#C0161A] text-[#C0161A] hover:bg-red-50 active:scale-95 transition-all"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <span
                        title="Menos de 60 minutos para la clase"
                        className="text-[10px] font-black px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
                      >
                        No cancelable
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600">
                      Confirmada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
