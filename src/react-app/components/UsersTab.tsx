// Utilidad para obtener la clase de color según el valor
function getColorClass(value: any) {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
  if (num < 0) return 'text-red-600';
  if (num > 0) return 'text-green-600';
  return 'text-gray-300';
}
import { useState, useEffect } from "react";
import { formatBalance, isSpuriousPendingReembolso } from '@/react-app/utils/format';
import { parseDbTimestampToDate } from '@/react-app/utils/dates';

interface UsersTabProps {
  userProfile: any;
}

export default function UsersTab({ userProfile }: UsersTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
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
            <div className="overflow-x-auto app-table-container rounded-2xl shadow-lg border-2 border-gray-800 dark:border-gray-900 bg-gray-900">
              <table className="w-full text-xs app-table">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-2 py-2 text-left text-[11px] font-black text-white uppercase tracking-wider">Fecha</th>
                    <th className="px-2 py-2 text-left text-[11px] font-black text-white uppercase tracking-wider">Usuario</th>
                    <th className="px-2 py-2 text-left text-[11px] font-black text-white uppercase tracking-wider">Tipo</th>
                    <th className="px-2 py-2 text-right text-[11px] font-black text-white uppercase tracking-wider">Monto</th>
                    <th className="px-2 py-2 text-center text-[11px] font-black text-white uppercase tracking-wider">Moneda</th>
                    <th className="px-2 py-2 text-right text-[11px] font-black text-white uppercase tracking-wider">Saldo Anterior</th>
                    <th className="px-2 py-2 text-right text-[11px] font-black text-white uppercase tracking-wider">Saldo Nuevo</th>
                    <th className="px-2 py-2 text-left text-[11px] font-black text-white uppercase tracking-wider">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-900 dark:divide-violet-700">
                  {filteredTransactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-800 transition-all">
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-left text-white">{(parseDbTimestampToDate(tx.fecha) || new Date()).toLocaleDateString('es-AR')}</td>
                      <td className="px-2 py-2 max-w-[160px] truncate text-[11px] text-left text-white">{tx.usuario || 'N/A'}</td>
                      <td className="px-2 py-2 text-[11px] text-left">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tx.tipo === 'carga' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{tx.tipo}</span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-right font-bold text-white">{tx.moneda} {formatBalance(tx.monto, tx.moneda, 'es-AR')}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-[11px] text-center text-white">{tx.moneda}</td>
                      <td className={`px-2 py-2 font-semibold text-[11px] text-right ${getColorClass(tx.saldo_anterior)} text-white`}>{tx.moneda} {formatBalance(tx.saldo_anterior, tx.moneda, 'es-AR')}</td>
                      <td className={`px-2 py-2 font-semibold text-[11px] text-right ${getColorClass(tx.saldo_nuevo)} text-white`}>{tx.moneda} {formatBalance(tx.saldo_nuevo, tx.moneda, 'es-AR')}</td>
                      <td className="px-2 py-2 text-[10px] max-w-[220px] truncate text-left text-white">{tx.descripcion || '-'}</td>
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
