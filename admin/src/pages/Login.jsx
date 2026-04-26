import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ numero_alumno: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(form);
      if (user.rol !== 'admin') {
        setError('Acceso solo para administradores');
        return;
      }
      login(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl ring-4 ring-gray-100">
            <img src="/logo.png" alt="United Languages" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
          <p className="text-sm text-gray-500">United Languages</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Usuario (número)
            </label>
            <input
              type="text"
              placeholder="Ej. ADMIN01"
              value={form.numero_alumno}
              onChange={(e) => setForm((f) => ({ ...f, numero_alumno: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-[#C0161A] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#C0161A] text-white font-semibold rounded-xl py-3.5 text-sm hover:bg-red-800 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
