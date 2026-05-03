import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    to: '/alumnos', label: 'Alumnos',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="9" cy="7" r="4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M19 8v6M16 11h6"/></svg>,
  },
  {
    to: '/maestros', label: 'Maestros',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
  {
    to: '/reservaciones', label: 'Reservaciones',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  },
  {
    to: '/anuncios', label: 'Anuncios',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 flex flex-col min-h-screen"
      style={{ background: 'linear-gradient(180deg, #fff 0%, #FAFAFA 100%)', borderRight: '1px solid #F0F0F0' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="United Languages" className="w-11 h-11 rounded-2xl object-cover shadow-md ring-2 ring-gray-100" />
          <div>
            <p className="font-black text-gray-900 text-sm leading-tight">United Languages</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Panel admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-2">Menú</p>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-[#C0161A] text-white shadow-md shadow-red-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-2xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #C0161A, #8B0A0D)' }}>
            <span className="text-white text-sm font-black">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 truncate">{user?.nombre}</p>
            <p className="text-[10px] text-gray-400 font-medium truncate">{user?.correo}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login', { replace: true }); }}
            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-[#C0161A] hover:bg-red-50 transition-colors shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
