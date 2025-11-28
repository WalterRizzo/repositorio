// Utilidad para obtener la clase de color según el valor
function getColorClass(value: any) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
  if (num < 0) return 'text-red-600';
  if (num > 0) return 'text-green-600';
  return 'text-gray-300';
}
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router';
// removed unused import
import { formatBalance, isSpuriousPendingReembolso } from '@/react-app/utils/format';
import { parseDbTimestampToDate } from '@/react-app/utils/dates';

interface UsersTabProps {
  userProfile: any;
}

export default function UsersTab({ userProfile }: UsersTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const [selectedUserFilter, setSelectedUserFilter] = useState('');

  useEffect(() => {
    if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
      fetchTransactions();
      fetchUsers();
    }
  }, [userProfile?.role]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await fetch("/api/transacciones-saldo");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transacciones || []);
      } else {
        console.error("Error al cargar transacciones");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const filteredTransactions = transactions
    .filter((tx: any) => !selectedUserFilter || tx.user_id === parseInt(selectedUserFilter))
    .filter((tx: any) => !isSpuriousPendingReembolso(tx.descripcion || tx.description));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>

      {/* FILTRO DE USUARIO */}
      <div className="mb-6 bg-gray-700 p-4 rounded">
        <label className="block text-sm font-semibold mb-2">Filtrar por usuario:</label>
        <select
          value={selectedUserFilter}
          onChange={(e) => setSelectedUserFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
        >
          <option value="">Todos los usuarios</option>
          {users.map((u: any) => (
            <option key={u.user_id || u.id} value={u.user_id || u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      {/* GRILLA DE MOVIMIENTOS DE SALDO */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Historial de Movimientos</h3>
        <p className="text-sm text-gray-400 mb-4">Registro completo de todas las operaciones de saldo</p>

        {transactionsLoading ? (
          <div className="text-center py-4">Cargando transacciones...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto app-table-container">
            <table className="w-full text-sm table-condensed app-table">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">FECHA</th>
                  <th className="px-2 py-1 text-left">USUARIO</th>
                  <th className="px-2 py-1 text-left">TIPO</th>
                  <th className="px-2 py-1 text-left">MONTO</th>
                  <th className="px-2 py-1 text-left">SALDO ANTERIOR</th>
                  <th className="px-2 py-1 text-left">SALDO NUEVO</th>
                  <th className="px-2 py-1 text-left">DESCRIPCIÓN</th>
                  <th className="px-2 py-1 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 app-table-row-hover">
                    <td className="px-2 py-1">{(parseDbTimestampToDate(tx.fecha) || new Date()).toLocaleDateString()}</td>
                    <td className="px-2 py-1 max-w-[160px] truncate">{tx.usuario || 'N/A'}</td>
                    <td className="px-2 py-1">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-700 text-white border border-gray-500">{tx.tipo}</span>
                    </td>
                    <td className="px-2 py-1">{tx.moneda} {formatBalance(tx.monto, tx.moneda, 'en-US')}</td>
                    <td className={`px-2 py-1 font-semibold ${getColorClass(tx.saldo_anterior)}`}>{tx.moneda} {formatBalance(tx.saldo_anterior, tx.moneda, 'en-US')}</td>
                    <td className={`px-2 py-1 font-semibold ${getColorClass(tx.saldo_nuevo)}`}>{tx.moneda} {formatBalance(tx.saldo_nuevo, tx.moneda, 'en-US')}</td>
                    <td className="px-2 py-1 text-xs truncate max-w-[220px]">{tx.descripcion || '-'}</td>
                    <td className="px-2 py-1 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            try {
                              const id = tx.user_id ?? tx.usuario_id ?? tx.user ?? tx.usuario;
                              if (id) navigate(`/settings?tab=users&user=${encodeURIComponent(String(id))}`);
                              else navigate('/settings?tab=users');
                            } catch (e) {
                              navigate('/settings?tab=users');
                            }
                          }}
                          className="px-2 py-0.5 text-xs rounded bg-gray-700 text-white hover:bg-gray-600"
                          title="Gestionar usuario"
                        >
                          Gestionar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No hay transacciones registradas</div>
        )}
      </div>
    </div>
  );

}
