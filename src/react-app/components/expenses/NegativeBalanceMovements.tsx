import { useEffect, useState } from "react";
import { parseDbTimestampToDate } from '@/react-app/utils/dates';
import { isSpuriousPendingReembolso } from '@/react-app/utils/format';

interface BalanceMovement {
  id: number;
  type: string; // carga, descuento, ajuste
  amount: number;
  currency: string;
  description: string;
  created_at: string;
  user_name?: string;
}

interface NegativeBalanceMovementsProps {
  currency: string;
  show: boolean;
  onClose: () => void;
}

export default function NegativeBalanceMovements({ currency, show, onClose }: NegativeBalanceMovementsProps) {
  const [movements, setMovements] = useState<BalanceMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    fetch(`/api/users/me/balance-movements?currency=${currency}`)
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data.movements) ? data.movements : [];
        // filter out spurious pending 'Reembolso (pendiente) por eliminación' rows from user view
        const filtered = all.filter((m: any) => {
          const desc = (m.description || m.descripcion || '');
          return !isSpuriousPendingReembolso(desc);
        });
        setMovements(filtered);
      })
      .finally(() => setLoading(false));
  }, [currency, show]);

  if (!show) return null;

  return (
    <div className="mt-6">
      <div className="mb-2 text-rose-400 font-bold text-lg">Movimientos que generaron el saldo negativo:</div>
      <div className="overflow-x-auto">
        <table className="w-full rounded-xl border-2 border-rose-500">
          <thead className="bg-rose-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-black text-rose-600 uppercase">Fecha</th>
              <th className="px-2 py-2 text-left text-xs font-black text-rose-600 uppercase">Tipo</th>
              <th className="px-2 py-2 text-left text-xs font-black text-rose-600 uppercase">Descripción</th>
              <th className="px-2 py-2 text-left text-xs font-black text-rose-600 uppercase">Monto</th>
              <th className="px-2 py-2 text-left text-xs font-black text-rose-600 uppercase">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6 text-rose-400">Cargando...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-rose-400">No hay movimientos registrados</td></tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id}>
                  <td className="px-2 py-2 text-xs text-rose-700">{(() => { const d = parseDbTimestampToDate(m.created_at); return d ? d.toLocaleString() : m.created_at; })()}</td>
                  <td className="px-2 py-2 text-xs font-bold text-rose-600">{m.type}</td>
                  <td className="px-2 py-2 text-xs text-rose-700">{m.description}</td>
                  <td className="px-2 py-2 text-xs font-bold text-rose-600">{m.amount.toLocaleString('es-AR', { style: 'currency', currency: m.currency })}</td>
                  <td className="px-2 py-2 text-xs text-rose-700">{m.user_name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl">Cerrar</button>
    </div>
  );
}
