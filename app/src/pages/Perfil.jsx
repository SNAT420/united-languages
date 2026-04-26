import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../components/AppHeader';

const NIVEL_BADGE = {
  inicial:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  intermedio: 'bg-blue-50 text-blue-700 border border-blue-200',
  avanzado:   'bg-purple-50 text-purple-700 border border-purple-200',
};
const NIVEL_LABEL = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' };

function DataRow({ label, value, last }) {
  return (
    <div className={`flex items-center justify-between py-4 ${!last ? 'border-b border-gray-50' : ''}`}>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value || '—'}</p>
    </div>
  );
}

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-app pb-24">
      <AppHeader subtitle="Cuenta" title="Mi perfil" />

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Avatar card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/60 px-5 py-5 flex items-center gap-4 card-accent">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #C0161A, #8B0A0D)' }}>
            <span className="text-white text-2xl font-black">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-[17px] leading-tight truncate">{user?.nombre}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {user?.rol === 'alumno' ? 'Alumno' : user?.rol === 'maestro' ? 'Maestro' : 'Admin'}
              </span>
              {user?.nivel && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${NIVEL_BADGE[user.nivel]}`}>
                  {NIVEL_LABEL[user.nivel]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-1">
          <DataRow label="Número de alumno" value={user?.numero_alumno} />
          <DataRow label="Correo electrónico" value={user?.correo} />
          <DataRow label="Nivel" value={NIVEL_LABEL[user?.nivel]} last />
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-1 border-2 border-[#C0161A] text-[#C0161A] font-black rounded-2xl py-4 text-sm active:scale-[0.98] transition-all hover:bg-red-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
