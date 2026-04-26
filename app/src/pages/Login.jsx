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
      login(token, user);
      navigate('/reservar', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#C0161A] flex flex-col">
      {/* Top — logo centrado */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20">
            <img src="/logo.png" alt="United Languages" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold tracking-tight">United Languages</h1>
            <p className="text-red-200 text-sm mt-1">Sistema de reservaciones</p>
          </div>
        </div>
      </div>

      {/* Bottom — card blanca */}
      <div className="bg-[#F8F8F8] rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <p className="text-gray-900 text-lg font-bold mb-1">Iniciar sesión</p>
        <p className="text-gray-400 text-sm mb-6">Ingresa tus datos para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Número de alumno
            </label>
            <input
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              placeholder="Ej. A001"
              value={form.numero_alumno}
              onChange={(e) => setForm((f) => ({ ...f, numero_alumno: e.target.value }))}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C0161A] focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-[#C0161A] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#C0161A] text-white font-semibold rounded-2xl py-4 text-sm shadow-lg shadow-red-200 hover:bg-red-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Iniciando sesión…
              </span>
            ) : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
