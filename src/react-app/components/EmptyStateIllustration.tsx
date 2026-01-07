// Minimal, modern empty state illustration component

export default function EmptyStateIllustration({ title = 'No hay gastos registrados', subtitle = 'Comienza agregando tu primer gasto. Mantén todo ordenado y auditado en un solo lugar.' }: { title?: string; subtitle?: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20">
      <div className="w-[360px] h-[160px] rounded-3xl bg-gradient-to-br from-white/3 via-white/2 to-transparent border border-white/5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="18" width="156" height="64" rx="10" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="rgba(255,255,255,0.01)" />
          <path d="M30 44h40" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M30 56h90" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="148" cy="50" r="8" fill="rgba(99,102,241,0.95)" />
          <path d="M148 46v8M150 48h-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="mt-6 text-center">
        <div className="text-xl md:text-2xl font-extrabold text-white mb-2">{title}</div>
        <div className="text-sm text-gray-300 max-w-xl mx-auto">{subtitle}</div>
        <div className="mt-6 flex justify-center">
          <button className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 font-semibold text-black shadow-lg">+ Agregar Gasto</button>
        </div>
      </div>
    </div>
  );
}
