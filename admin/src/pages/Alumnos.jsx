import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const NIVELES = ['inicial', 'intermedio', 'avanzado'];
const NIVEL_COLOR = {
  inicial:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermedio: 'bg-blue-50 text-blue-700 border border-blue-200',
  avanzado:   'bg-purple-50 text-purple-700 border border-purple-200',
};

const EMPTY = { nombre: '', correo: '', numero_alumno: '', nivel: 'inicial', password: '' };

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  async function cargar() {
    setLoading(true);
    try { setAlumnos(await api.getAlumnos()); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.crearAlumno(form);
      setSuccess('Alumno creado correctamente');
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
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-sm text-gray-400 mt-1">{alumnos.length} registrados</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(''); setSuccess(''); }}
          className="text-white text-sm font-black px-5 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo alumno'}
        </button>
      </div>

      {success && <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4">{success}</p>}
      {error   && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 p-6 mb-6 card-accent">
          <h2 className="font-black text-gray-900 mb-5">Nuevo alumno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" value={form.nombre} onChange={set('nombre')} required />
            <Field label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} required />
            <Field label="Número de alumno" value={form.numero_alumno} onChange={set('numero_alumno')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Nivel</label>
              <select
                value={form.nivel}
                onChange={set('nivel')}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent"
              >
                {NIVELES.map((n) => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
              </select>
            </div>
            <Field label="Contraseña" type="password" value={form.password} onChange={set('password')} required />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 text-white text-sm font-black px-6 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
          >
            {saving ? 'Guardando…' : 'Crear alumno'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alumnos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">Sin alumnos registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAFA' }} className="border-b border-gray-100">
                <Th>Nombre</Th>
                <Th>No. alumno</Th>
                <Th>Correo</Th>
                <Th>Nivel</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900">{a.nombre}</td>
                  <td className="px-5 py-4 text-gray-500 font-medium tabular-nums">{a.numero_alumno}</td>
                  <td className="px-5 py-4 text-gray-400 font-medium">{a.correo}</td>
                  <td className="px-5 py-4">
                    {a.nivel ? (
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${NIVEL_COLOR[a.nivel]}`}>
                        {a.nivel.charAt(0).toUpperCase() + a.nivel.slice(1)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${a.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                      {a.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalEditar(a)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setModalEliminar(a)}
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

      {modalEditar && (
        <ModalEditarAlumno
          alumno={modalEditar}
          onClose={() => setModalEditar(null)}
          onSaved={async () => { setModalEditar(null); setSuccess('Alumno actualizado correctamente'); await cargar(); }}
        />
      )}

      {modalEliminar && (
        <ModalEliminar
          nombre={modalEliminar.nombre}
          onClose={() => setModalEliminar(null)}
          onConfirm={async () => {
            await api.eliminarAlumno(modalEliminar.id);
            setModalEliminar(null);
            setSuccess('Alumno eliminado');
            await cargar();
          }}
        />
      )}
    </Layout>
  );
}

function ModalEditarAlumno({ alumno, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: alumno.nombre,
    correo: alumno.correo,
    numero_alumno: alumno.numero_alumno,
    nivel: alumno.nivel || 'inicial',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { nombre: form.nombre, correo: form.correo, numero_alumno: form.numero_alumno, nivel: form.nivel };
      if (form.password) body.password = form.password;
      await api.editarAlumno(alumno.id, body);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title="Editar alumno" subtitle={alumno.nombre}>
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" value={form.nombre} onChange={set('nombre')} required />
            <Field label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} required />
            <Field label="Número de alumno" value={form.numero_alumno} onChange={set('numero_alumno')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Nivel</label>
              <select
                value={form.nivel}
                onChange={set('nivel')}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent"
              >
                {NIVELES.map((n) => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
              </select>
            </div>
            <Field label="Nueva contraseña" type="password" value={form.password} onChange={set('password')} placeholder="Dejar vacío para no cambiar" />
          </div>
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
