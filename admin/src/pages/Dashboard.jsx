import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

const STATS = [
  {
    key: 'reservaciones_hoy',
    label: 'Reservaciones hoy',
    gradient: 'linear-gradient(135deg, #C0161A, #8B0A0D)',
    shadow: 'shadow-red-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    key: 'total_alumnos',
    label: 'Total alumnos',
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    shadow: 'shadow-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
        <circle cx="9" cy="7" r="4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M19 8v6M16 11h6"/>
      </svg>
    ),
  },
  {
    key: 'total_maestros',
    label: 'Total maestros',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    shadow: 'shadow-emerald-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-7 h-7">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.dashboard().then(setStats).catch((e) => setError(e.message)); }, []);

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 font-medium mt-1 capitalize">{hoy}</p>
      </div>

      {error && <p className="text-sm text-[#C0161A] bg-red-50 rounded-2xl px-4 py-3 mb-6">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {STATS.map((s) => (
          <div key={s.key}
            className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden card-hover">
            <div className="px-6 py-5 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${s.shadow}`}
                style={{ background: s.gradient }}>
                {s.icon}
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none tabular-nums">
                  {stats?.[s.key] ?? '—'}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            </div>
            <div className="h-1" style={{ background: s.gradient }} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
