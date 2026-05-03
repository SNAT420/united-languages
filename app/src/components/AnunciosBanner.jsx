export default function AnunciosBanner({ anuncios }) {
  if (!anuncios || anuncios.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {anuncios.map((a) => (
        <div
          key={a.id}
          className="rounded-2xl border border-amber-200 shadow-md shadow-amber-100/60 px-4 py-3.5 flex gap-3 items-start"
          style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}
        >
          {/* Icono megáfono */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4.5 h-4.5 w-[18px] h-[18px]">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-900 leading-tight">{a.titulo}</p>
            <p className="text-[12px] text-amber-800 font-medium mt-1 leading-relaxed">{a.contenido}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
