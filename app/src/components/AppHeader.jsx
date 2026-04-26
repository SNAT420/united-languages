export default function AppHeader({ subtitle, title, extra }) {
  return (
    <div
      className="px-5 pt-12 pb-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #6B0A0D 0%, #9E1215 45%, #C0161A 100%)' }}
    >
      {/* Círculos decorativos */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-14 right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-6 -left-6 w-20 h-20 rounded-full bg-black/10 pointer-events-none" />

      <div className="flex items-center justify-between relative gap-3">
        <div className="flex-1 min-w-0">
          {subtitle && (
            <p className="text-red-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="text-white text-[22px] font-black leading-tight tracking-tight truncate">
            {title}
          </h2>
          {extra && (
            <p className="text-red-200/80 text-[13px] font-medium mt-1 capitalize">{extra}</p>
          )}
        </div>

        <img
          src="/logo.png"
          alt="United Languages"
          className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-white/20 shrink-0"
        />
      </div>
    </div>
  );
}
