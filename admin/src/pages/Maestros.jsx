import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const DIAS_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const DIA_LABEL  = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado' };
const NIVEL_OPTS = [
  { value: '',           label: '— Sin asignar —' },
  { value: 'inicial',    label: 'Inicial' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado',   label: 'Avanzado' },
];
const NIVEL_BADGE = {
  inicial:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermedio: 'bg-blue-50 text-blue-700 border border-blue-200',
  avanzado:   'bg-purple-50 text-purple-700 border border-purple-200',
};

const EMPTY = { nombre: '', correo: '', password: '' };

export default function Maestros() {
  const [maestros, setMaestros]       = useState([]);
  const [form, setForm]               = useState(EMPTY);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [modalMaestro, setModalMaestro] = useState(null);
  const [modalEditar, setModalEditar]   = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  async function cargar() {
    setLoading(true);
    try { setMaestros(await api.getMaestros()); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.crearMaestro(form);
      setSuccess('Maestro creado correctamente');
      setForm(EMPTY);
      setShowForm(false);
      await cargar();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maestros</h1>
          <p className="text-sm text-gray-400 mt-1">{maestros.length} registrados</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(''); setSuccess(''); }}
          className="text-white text-sm font-black px-5 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo maestro'}
        </button>
      </div>

      {success && <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4">{success}</p>}
      {error   && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-6 mb-6 card-accent">
          <h2 className="font-black text-gray-900 mb-5">Nuevo maestro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" value={form.nombre} onChange={set('nombre')} required />
            <Field label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} required />
            <Field label="Contraseña" type="password" value={form.password} onChange={set('password')} required />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 text-white text-sm font-black px-6 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
          >
            {saving ? 'Guardando…' : 'Crear maestro'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : maestros.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">Sin maestros registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <Th>Nombre</Th>
                <Th>No. usuario</Th>
                <Th>Correo</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {maestros.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-gray-900">{m.nombre}</td>
                  <td className="px-5 py-3.5 text-gray-500">{m.numero_alumno}</td>
                  <td className="px-5 py-3.5 text-gray-500">{m.correo}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${m.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalMaestro(m)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-xl border-2 border-[#C0161A] text-[#C0161A] hover:bg-red-50 active:scale-95 transition-all"
                      >
                        Configurar
                      </button>
                      <button
                        onClick={() => setModalEditar(m)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setModalEliminar(m)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-xl border-2 border-red-100 text-[#C0161A] hover:bg-red-50 active:scale-95 transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalMaestro && (
        <ModalNiveles maestro={modalMaestro} onClose={() => setModalMaestro(null)} />
      )}

      {modalEditar && (
        <ModalEditarMaestro
          maestro={modalEditar}
          onClose={() => setModalEditar(null)}
          onSaved={async () => { setModalEditar(null); setSuccess('Maestro actualizado correctamente'); await cargar(); }}
        />
      )}

      {modalEliminar && (
        <ModalEliminar
          nombre={modalEliminar.nombre}
          onClose={() => setModalEliminar(null)}
          onConfirm={async () => {
            await api.eliminarMaestro(modalEliminar.id);
            setModalEliminar(null);
            setSuccess('Maestro eliminado');
            await cargar();
          }}
        />
      )}
    </Layout>
  );
}

function Modal({ onClose, title, subtitle, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #C0161A, #E53E3E)' }} />
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <p className="font-black text-gray-900 text-lg">{title}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalEditarMaestro({ maestro, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: maestro.nombre, correo: maestro.correo, password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { nombre: form.nombre, correo: form.correo };
      if (form.password) body.password = form.password;
      await api.editarMaestro(maestro.id, body);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title="Editar maestro" subtitle={maestro.nombre}>
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
          <Field label="Nombre completo" value={form.nombre} onChange={set('nombre')} required />
          <Field label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} required />
          <Field label="Nueva contraseña" type="password" value={form.password} onChange={set('password')} placeholder="Dejar vacío para no cambiar" />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="text-white text-sm font-black px-6 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEliminar({ nombre, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setDeleting(true);
    try { await onConfirm(); }
    catch (err) { setError(err.message); setDeleting(false); }
  }

  return (
    <Modal onClose={onClose} title="Eliminar usuario" subtitle={nombre}>
      <div className="px-6 py-6 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C0161A" strokeWidth={2} className="w-7 h-7">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xl font-black text-gray-900">¿Estás seguro?</p>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Esta acción eliminará permanentemente al usuario y todas sus reservaciones. No se puede deshacer.
        </p>
        {error && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 w-full">{error}</p>}
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose}
          className="text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
          Cancelar
        </button>
        <button onClick={handleConfirm} disabled={deleting}
          className="text-white text-sm font-black px-6 py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
          {deleting ? 'Eliminando…' : 'Eliminar permanentemente'}
        </button>
      </div>
    </Modal>
  );
}

// Modal para configurar nivel por horario
function ModalNiveles({ maestro, onClose }) {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState({}); // horarioId → 'saving' | 'ok' | 'error'
  const [diaActivo, setDiaActivo] = useState('lunes');

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setHorarios(await api.getMaestroHorarios(maestro.id)); }
    finally { setLoading(false); }
  }, [maestro.id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleNivel(horarioId, nivel) {
    setSaving((s) => ({ ...s, [horarioId]: 'saving' }));
    try {
      await api.asignarNivel(maestro.id, horarioId, nivel);
      setHorarios((hs) => hs.map((h) => h.horario_id === horarioId ? { ...h, nivel: nivel || null } : h));
      setSaving((s) => ({ ...s, [horarioId]: 'ok' }));
      setTimeout(() => setSaving((s) => ({ ...s, [horarioId]: null })), 1500);
    } catch {
      setSaving((s) => ({ ...s, [horarioId]: 'error' }));
      setTimeout(() => setSaving((s) => ({ ...s, [horarioId]: null })), 2000);
    }
  }

  const porDia = DIAS_ORDER.reduce((acc, dia) => {
    acc[dia] = horarios.filter((h) => h.dia_semana === dia);
    return acc;
  }, {});

  const diaHorarios = porDia[diaActivo] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-1.5 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #C0161A, #E53E3E)' }} />
        <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0 border-b border-gray-100">
          <div>
            <p className="font-black text-gray-900 text-lg">{maestro.nombre}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Asignar nivel por horario</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs de días */}
        <div className="px-6 pt-3 pb-0 flex gap-1 overflow-x-auto shrink-0">
          {DIAS_ORDER.map((dia) => {
            const asignados = (porDia[dia] ?? []).filter((h) => h.nivel).length;
            const total = (porDia[dia] ?? []).length;
            return (
              <button
                key={dia}
                onClick={() => setDiaActivo(dia)}
                className={`text-xs font-black px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  diaActivo === dia
                    ? 'text-white shadow-md shadow-red-200'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                style={diaActivo === dia ? { background: 'linear-gradient(135deg, #C0161A, #9E1215)' } : {}}
              >
                {DIA_LABEL[dia]}
                {total > 0 && (
                  <span className={`ml-1.5 text-[9px] font-black px-1 py-0.5 rounded-full ${
                    diaActivo === dia ? 'bg-white/20 text-white' : asignados === total ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {asignados}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista de horarios */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-[#C0161A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : diaHorarios.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Sin horarios asignados este día</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {diaHorarios.map((h) => {
                const estado = saving[h.horario_id];
                return (
                  <div key={h.horario_id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                    {/* Pill hora */}
                    <div className="px-2.5 py-2 rounded-xl shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}>
                      <p className="text-white text-[12px] font-black leading-none">{h.hora_inicio.slice(0, 5)}</p>
                      <p className="text-red-200 text-[10px] mt-0.5">{h.hora_fin.slice(0, 5)}</p>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">
                        {h.hora_inicio.slice(0, 5)} – {h.hora_fin.slice(0, 5)}
                      </p>
                      {h.nivel && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${NIVEL_BADGE[h.nivel]}`}>
                          {h.nivel.charAt(0).toUpperCase() + h.nivel.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Select nivel */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={h.nivel ?? ''}
                        onChange={(e) => handleNivel(h.horario_id, e.target.value)}
                        disabled={estado === 'saving'}
                        className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition disabled:opacity-50"
                      >
                        {NIVEL_OPTS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>

                      {/* Indicador de estado */}
                      <div className="w-5 flex items-center justify-center">
                        {estado === 'saving' && (
                          <div className="w-4 h-4 border-2 border-[#C0161A] border-t-transparent rounded-full animate-spin" />
                        )}
                        {estado === 'ok' && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {estado === 'error' && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{children}</th>;
}

function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
      />
    </div>
  );
}
