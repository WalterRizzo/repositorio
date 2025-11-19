import { useState, useEffect } from "react";

interface UsersTabProps {
  userProfile: any;
}

export default function UsersTab({ userProfile }: UsersTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [selectedUserFilter, setSelectedUserFilter] = useState('');

  useEffect(() => {
    if (userProfile?.role === 'admin' || userProfile?.role === 'supervisor') {
      fetchTransactions(transactionsPage);
      fetchUsers();
    }
  }, [userProfile?.role]);

  const fetchTransactions = async (page = transactionsPage) => {
    try {
      setTransactionsLoading(true);
      const offset = (page - 1) * 25; // Default perPage value
      const url = new URL('/api/transacciones-saldo', location.origin);
      url.searchParams.set('limit', '25');
      url.searchParams.set('offset', String(offset));
      if (selectedUserFilter) url.searchParams.set('userId', String(selectedUserFilter));
      const response = await fetch(url.toString());
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

  useEffect(() => {
    fetchTransactions(transactionsPage);
  }, [transactionsPage, selectedUserFilter]);

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
            <table className="w-full rounded-xl border-2 border-indigo-500 shadow-lg">
              <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Saldo</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{user.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{user.role}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{user.balance}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Acciones</td>
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
