import { getNumberColorClass } from '@/react-app/utils/numbers';
import { useState, useEffect } from "react";

interface UsersTabProps {
  userProfile: any;
}

export default function UsersTab({ userProfile }: UsersTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(25);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
      fetchTransactions(transactionsPage, transactionsPerPage);
      fetchUsers();
    }
  }, [userProfile?.role]);

  const fetchTransactions = async (page = transactionsPage, perPage = transactionsPerPage) => {
    try {
      setTransactionsLoading(true);
      const offset = (page - 1) * perPage;
      const url = new URL('/api/transacciones-saldo', location.origin);
      url.searchParams.set('limit', String(perPage));
      url.searchParams.set('offset', String(offset));
      if (selectedUserFilter) url.searchParams.set('userId', String(selectedUserFilter));
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transacciones || []);
        setTotalTransactions(data.total || 0);
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

  useEffect(() => {
    // re-fetch when page/perpage/filter changes
    if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
      fetchTransactions(transactionsPage, transactionsPerPage);
    }
  }, [transactionsPage, transactionsPerPage, selectedUserFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const filteredTransactions = transactions.filter(
    (tx: any) => !selectedUserFilter || tx.user_id === parseInt(selectedUserFilter)
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
      
      {/* FILTRO DE USUARIO */}
      <div className="mb-6 bg-gray-700 p-4 rounded">
        <label className="block text-sm font-semibold mb-2">Filtrar por usuario:</label>
          <select
        value={selectedUserFilter}
        onChange={(e) => { setSelectedUserFilter(e.target.value); setTransactionsPage(1); }}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">FECHA</th>
                  <th className="px-4 py-2 text-left">USUARIO</th>
                  <th className="px-4 py-2 text-left">TIPO</th>
                  <th className="px-4 py-2 text-left">MONTO</th>
                  <th className="px-4 py-2 text-left">SALDO ANTERIOR</th>
                  <th className="px-4 py-2 text-left">SALDO NUEVO</th>
                  <th className="px-4 py-2 text-left">DESCRIPCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-black/10 dark:hover:bg-gray-800">
                    <td className="px-4 py-2">{new Date(tx.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{tx.usuario || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tx.tipo === 'carga' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {tx.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-2">{tx.moneda} {Number(tx.monto).toFixed(2)}</td>
                    <td className={`px-4 py-2 font-semibold ${getNumberColorClass(tx.saldo_anterior)}`}>{tx.moneda} {parseFloat(String(tx.saldo_anterior).replace(/[^\d.-]/g, '')).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td className={`px-4 py-2 font-semibold ${getNumberColorClass(tx.saldo_nuevo)}`}>{tx.moneda} {parseFloat(String(tx.saldo_nuevo).replace(/[^\d.-]/g, '')).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td className="px-4 py-2 text-xs">{tx.descripcion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              {/* Pagination controls (mirrored from Expenses grid) */}
              {Math.max(1, Math.ceil(totalTransactions / transactionsPerPage)) > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 sm:px-6 py-2 sm:py-4 bg-black border-t gap-y-2 rounded-xl shadow-lg mb-2">
                  <div className="text-xs sm:text-sm text-white font-semibold">
                    Mostrando {(transactionsPage - 1) * transactionsPerPage + 1} - {Math.min(transactionsPage * transactionsPerPage, totalTransactions)} de {totalTransactions} transacciones
                  </div>
                  <div className="flex items-center gap-x-2">
                    <label className="text-xs text-white mr-2">Mostrar:</label>
                    <select value={transactionsPerPage} onChange={(e) => { setTransactionsPerPage(Number(e.target.value)); setTransactionsPage(1);} } className="px-2 py-1 rounded text-sm font-medium">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <button
                      onClick={() => setTransactionsPage(1)}
                      disabled={transactionsPage === 1}
                      className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                    >
                      « Primera
                    </button>
                    <button
                      onClick={() => setTransactionsPage(Math.max(1, transactionsPage - 1))}
                      disabled={transactionsPage === 1}
                      className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                    >
                      ‹ Anterior
                    </button>
                    <span className="px-3 py-1 bg-black text-white rounded text-sm font-bold">
                      Página {transactionsPage} de {Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))}
                    </span>
                    <button
                      onClick={() => setTransactionsPage(Math.min(Math.max(1, Math.ceil(totalTransactions / transactionsPerPage)), transactionsPage + 1))}
                      disabled={transactionsPage === Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))}
                      className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                    >
                      Siguiente ›
                    </button>
                    <button
                      onClick={() => setTransactionsPage(Math.max(1, Math.ceil(totalTransactions / transactionsPerPage)))}
                      disabled={transactionsPage === Math.max(1, Math.ceil(totalTransactions / transactionsPerPage))}
                      className="px-3 py-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded text-sm font-bold shadow-lg"
                    >
                      Última »
                    </button>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No hay transacciones registradas</div>
        )}
      </div>
    </div>
  );
}
