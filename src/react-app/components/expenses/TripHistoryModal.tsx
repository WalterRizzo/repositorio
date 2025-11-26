import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatBalance, isSpuriousPendingReembolso } from '@/react-app/utils/format';
import { parseDbTimestampToDate } from '@/react-app/utils/dates';

type PreviewExpense = { id:number; amount?: number; expense_date?: string; description?: string; currency?: string };
type PreviewMovement = { id:number; monto?: number; tipo?: string; fecha_transaccion?: string; saldo_anterior?: number; saldo_nuevo?: number; descripcion?: string };

interface Props {
  userId: string;
  onClose: () => void;
}

export default function TripHistoryModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<PreviewExpense[]>([]);
  const [movements, setMovements] = useState<PreviewMovement[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/trips/history?userId=${encodeURIComponent(userId)}`, { credentials: 'include' });
        const data = await resp.json();
        if (!resp.ok) {
          setError(data?.error || 'Error cargando histórico');
          return;
        }
        setExpenses(Array.isArray(data.closedExpenses) ? data.closedExpenses : []);
        const mv = Array.isArray(data.closedMovements) ? data.closedMovements : [];
        setMovements(mv.filter((m: any) => !isSpuriousPendingReembolso((m as any).descripcion || (m as any).description)));
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-7xl bg-black/80 rounded-2xl border border-white/5 shadow-2xl p-6 overflow-auto max-h-[85vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Histórico de Cierres — usuario: {userId}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-full hover:bg-white/5 transition"><X className="w-5 h-5 text-white/70" /></button>
        </div>

        {loading && <div className="text-sm text-gray-300">Cargando histórico...</div>}
        {error && <div className="text-sm text-rose-300">{error}</div>}

        <div className="mt-4 space-y-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Gastos archivados</div>
              <div className="overflow-x-auto bg-black/50 rounded-lg p-3 border border-white/5">
              <table className="w-full text-sm text-left text-gray-300 table-auto table-condensed">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="py-1">Fecha</th>
                    <th className="py-1">Descripción</th>
                    <th className="py-1">Monto</th>
                    <th className="py-1">Moneda</th>
                    <th className="py-1">ID Ori.</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-2 py-1 text-gray-200">{e.expense_date}</td>
                      <td className="px-2 py-1 text-white">{e.description}</td>
                      <td className="px-2 py-1 text-white font-semibold">{formatBalance(e.amount, e.currency)}</td>
                      <td className="px-2 py-1 text-violet-200">{e.currency}</td>
                      <td className="px-2 py-1 text-gray-300">{e.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">Movimientos archivados</div>
              <div className="overflow-x-auto bg-black/50 rounded-lg p-3 border border-white/5">
              <table className="w-full text-sm text-left text-gray-300 table-auto table-condensed">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="py-1">Fecha</th>
                    <th className="py-1">Tipo</th>
                    <th className="py-1">Monto</th>
                    <th className="py-1">Saldo Antes</th>
                    <th className="py-1">Saldo Nuevo</th>
                    <th className="py-1">ID Ori.</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(m => (
                    <tr key={m.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-2 py-1 text-gray-200">{m.fecha_transaccion ? (parseDbTimestampToDate(m.fecha_transaccion) || new Date()).toLocaleString() : '-'}</td>
                      <td className="px-2 py-1 text-gray-200">{m.tipo}</td>
                      <td className={`px-2 py-1 ${m.tipo === 'carga' ? 'text-emerald-300' : 'text-rose-300'} font-semibold`}>{formatBalance(m.monto, (m as any).currency)}</td>
                      <td className="px-2 py-1 text-gray-200">{formatBalance(m.saldo_anterior, (m as any).currency)}</td>
                      <td className="px-2 py-1 text-gray-200">{formatBalance(m.saldo_nuevo, (m as any).currency)}</td>
                      <td className="px-2 py-1 text-gray-300">{m.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
