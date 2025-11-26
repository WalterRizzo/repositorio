import type { Expense } from '@/shared/types';
import { useEffect, useState } from 'react';


export default function ExpensesKPI({ expenses, compact = false }: { expenses: Expense[]; compact?: boolean }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const count = expenses.length;
  const pending = expenses.filter(e => String(e.status || '').toLowerCase() === 'pendiente').length;
  const avg = count ? total / count : 0;


  // slightly reduced padding so KPI metrics sit higher in the card
  const cardPadding = compact ? 'p-3 md:p-3' : 'p-4 md:p-6';
  const titleSize = compact ? 'text-sm' : 'text-3xl md:text-4xl';
  const metricSize = compact ? 'text-lg md:text-xl' : 'text-2xl';
  const countSize = compact ? 'text-2xl' : 'text-3xl md:text-4xl';
  const pendingSize = compact ? 'text-2xl' : 'text-3xl md:text-4xl';
  // removed sparkline data and helpers — KPI is kept compact and minimal

  // -- animated counters for a bit of theatre --
  const [displayCount, setDisplayCount] = useState(0);
  const [displayPending, setDisplayPending] = useState(0);

  useEffect(() => {
    // simple count-up animation for 'Cantidad'
    let raf: number | null = null;
    const duration = 700;
    const start = performance.now();
    const from = displayCount;
    const to = count;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
      const val = Math.round(from + (to - from) * eased);
      setDisplayCount(val);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [count]);

  useEffect(() => {
    // count-up for pending, slightly snappier
    let raf: number | null = null;
    const duration = 500;
    const start = performance.now();
    const from = displayPending;
    const to = pending;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const val = Math.round(from + (to - from) * eased);
      setDisplayPending(val);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [pending]);

  // removed aiInsight and trend — KPI intentionally minimal

  return (
    // keep KPI compact but not overlapping the header
    <section className="w-full max-w-8xl mx-auto mb-3 px-6 mt-2 md:mt-4">
      {/* edge-to-edge floating glass surface */}
      <div className="relative overflow-hidden glass-premium floating-surface edge-to-edge">
        {/* neon edge removed — KPI is minimal and clean */}

        {/* futuristic inner panel */}
        <style>{`
          @keyframes dash { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
          @keyframes floaty { 0% { transform: translateY(0px); } 50%{ transform: translateY(-4px);} 100% { transform: translateY(0px); } }
        `}</style>

          <div className={`relative z-10 ${cardPadding} kpi-compact rounded-3xl overflow-hidden`} style={{ paddingTop: 6 }}>
          <div className="flex items-start justify-between gap-6">
            {/* render title column only when not compact; avoid leaving empty left space when compact */}
            {!compact && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-white">
                  <div className="text-xs uppercase tracking-wide text-white/60">Resumen</div>
                  <div className={`mt-1 ${titleSize} font-extrabold tracking-tight text-white drop-shadow-lg`}>Gastos</div>
                  <div className="mt-2 text-sm text-white/60 max-w-md">Visión futurista — totales en tiempo real, proyecciones y estado de pendientes.</div>
                </div>
              </div>
            )}

            {/* metrics — take full width when compact so they sit higher/left */}
            <div className={`flex items-center gap-6 ${compact ? 'w-full justify-start pl-0' : 'pl-4'}`}>
              <div className="text-center text-white/90">
                <div className="text-xs uppercase text-white/60">TOTAL</div>
                <div className={`mt-1 ${metricSize} font-bold text-white`} style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.4))' }}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)}</div>
              </div>

              <div className="text-center text-white/90">
                <div className="text-xs uppercase text-white/60">CANTIDAD</div>
                <div className={`mt-1 ${countSize} font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-emerald-300`} style={{ animation: 'floaty 2.6s ease-in-out infinite' }}>{displayCount}</div>
              </div>

              <div className="text-center text-white/90">
                <div className="text-xs uppercase text-white/60">PENDIENTES</div>
                <div className={`mt-1 ${pendingSize} font-extrabold tracking-tight ${pending > 0 ? 'text-amber-300' : 'text-white'}`} style={{ textShadow: pending > 0 ? '0 6px 20px rgba(250,180,60,0.12), 0 2px 6px rgba(250,180,60,0.08)' : undefined }}>{displayPending}</div>
              </div>

              <div className="text-center text-white/90">
                <div className="text-xs uppercase text-white/60">PROMEDIO</div>
                <div className="mt-1 text-2xl font-bold text-white">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(avg)}</div>
              </div>
            </div>
          </div>

          {/* trend removed — keep card minimal and metrics higher */}

          {/* footer removed — card intentionally compact */}
        </div>
      </div>
    </section>
  );
}
