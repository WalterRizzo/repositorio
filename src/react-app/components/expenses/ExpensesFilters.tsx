// ExpensesFilters: unobtrusive, small UI helpers for page filters
import { useState } from 'react';

interface Props {
  filterState?: string;
  onStateChange?: (s: string) => void;
  currency?: string;
  onCurrencyChange?: (c: string) => void;
  user?: string;
  onUserChange?: (u: string) => void;
  query?: string;
  setQuery?: (q: string) => void;
}

export default function ExpensesFilters({ query='', setQuery, onStateChange, onCurrencyChange, onUserChange }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center w-full md:w-[640px]">
        <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-1 w-full">
          <input value={query} onChange={(e) => setQuery?.(e.target.value)} placeholder="Buscar gastos, descripción, id..." className="bg-transparent outline-none text-sm text-slate-700 w-full" />
          <div className="h-6 w-6 rounded-md flex items-center justify-center text-xs text-slate-500">⌕</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setShowDetails(!showDetails)} className="px-3 py-1 rounded-md bg-transparent text-sm text-slate-700 font-medium border border-slate-200 hover:bg-slate-50">Mostrar filtros</button>
        <button onClick={() => { setQuery?.(''); onStateChange?.('all'); onCurrencyChange?.('all'); onUserChange?.('all'); }} className="px-3 py-1 rounded-md bg-transparent border border-slate-200 text-sm text-slate-700 font-medium hover:bg-slate-50">Limpiar</button>
      </div>

      {showDetails && (
        <div className="w-full mt-3 md:mt-2 md:col-span-2">
          <div className="bg-slate-50 border border-slate-100 text-sm text-slate-700 rounded-md p-3">(Filtros avanzados ocultos — activados solo cuando quieras)</div>
        </div>
      )}
    </div>
  );
}
