import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/maestro/hoy',
    label: 'Hoy',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/perfil',
    label: 'Perfil',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function BottomNavMaestro() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]" />
      <div className="relative flex">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} className="flex-1">
            {({ isActive }) => (
              <div className="flex flex-col items-center justify-center pt-1 pb-2.5 gap-0.5 relative">
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#C0161A] rounded-b-full" />
                )}
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'text-[#C0161A]' : 'text-gray-400'}`}>
                  {t.icon(isActive)}
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-[#C0161A]' : 'text-gray-400'}`}>
                  {t.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
