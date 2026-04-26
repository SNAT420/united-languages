import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const EMPTY = { nombre: '', correo: '', password: '' };

export default function Maestros() {
  const [maestros, setMaestros] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

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
          className="text-white text-sm font-black px-5 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
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
            className="mt-5 text-white text-sm font-black px-6 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

function Th({ children }) {
  return <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{children}</th>;
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
      />
    </div>
  );
}
