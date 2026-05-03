import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const EMPTY = { titulo: '', contenido: '', fecha_inicio: '', fecha_fin: '' };

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function hoyISO() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}

export default function Anuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [form, setForm]         = useState({ ...EMPTY, fecha_inicio: hoyISO() });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState({}); // id → true
  const [deleting, setDeleting] = useState({}); // id → true

  async function cargar() {
    setLoading(true);
    try { setAnuncios(await api.getAnuncios()); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.crearAnuncio(form);
      setSuccess('Anuncio creado');
      setForm({ ...EMPTY, fecha_inicio: hoyISO() });
      setShowForm(false);
      await cargar();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function toggleActivo(a) {
    setToggling((t) => ({ ...t, [a.id]: true }));
    try {
      await api.editarAnuncio(a.id, { activo: !a.activo });
      await cargar();
    } catch (e) { setError(e.message); }
    finally { setToggling((t) => ({ ...t, [a.id]: false })); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este anuncio?')) return;
    setDeleting((d) => ({ ...d, [id]: true }));
    try {
      await api.eliminarAnuncio(id);
      setAnuncios((prev) => prev.filter((a) => a.id !== id));
    } catch (e) { setError(e.message); }
    finally { setDeleting((d) => ({ ...d, [id]: false })); }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const vigentes  = anuncios.filter((a) => a.activo);
  const inactivos = anuncios.filter((a) => !a.activo);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anuncios</h1>
          <p className="text-sm text-gray-400 mt-1">{vigentes.length} activo{vigentes.length !== 1 ? 's' : ''} · {anuncios.length} total</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(''); setSuccess(''); }}
          className="text-white text-sm font-black px-5 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo anuncio'}
        </button>
      </div>

      {success && <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4">{success}</p>}
      {error   && <p className="text-sm font-bold text-[#C0161A] bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 mb-6 card-accent">
          <h2 className="font-black text-gray-900 mb-5">Nuevo anuncio</h2>
          <div className="flex flex-col gap-4">
            <Field label="Título" value={form.titulo} onChange={set('titulo')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contenido</label>
              <textarea
                value={form.contenido}
                onChange={set('contenido')}
                required
                rows={3}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} required />
              <Field label="Fecha fin (opcional)" type="date" value={form.fecha_fin} onChange={set('fecha_fin')} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 text-white text-sm font-black px-6 py-2.5 rounded-xl shadow-md shadow-red-200 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C0161A, #9E1215)' }}
          >
            {saving ? 'Guardando…' : 'Publicar anuncio'}
          </button>
        </form>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C0161A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-6 h-6">
                <path d="M3 11l19-9-9 19-2-8-8-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Sin anuncios publicados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <Th>Título</Th>
                <Th>Contenido</Th>
                <Th>Inicio</Th>
                <Th>Fin</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {anuncios.map((a) => (
                <tr key={a.id} className={`border-b border-gray-50 transition-colors ${a.activo ? 'hover:bg-amber-50/30' : 'opacity-50 hover:bg-gray-50'}`}>
                  <td className="px-5 py-3.5 font-bold text-gray-900 max-w-[180px]">
                    <p className="truncate">{a.titulo}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-[260px]">
                    <p className="truncate text-xs">{a.contenido}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{formatFecha(a.fecha_inicio)}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{formatFecha(a.fecha_fin)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                      a.activo
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {a.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActivo(a)}
                        disabled={toggling[a.id]}
                        title={a.activo ? 'Desactivar' : 'Activar'}
                        className="text-[11px] font-black px-2.5 py-1.5 rounded-lg border-2 border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {toggling[a.id] ? '…' : a.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminar(a.id)}
                        disabled={deleting[a.id]}
                        title="Eliminar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border-2 border-gray-200 text-gray-400 hover:border-red-200 hover:text-[#C0161A] hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {deleting[a.id] ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                        )}
                      </button>
                    </div>
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
