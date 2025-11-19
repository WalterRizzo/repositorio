import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Users, Receipt, Plus, Edit, Trash2 } from "lucide-react";
import type { Expense, UserProfile } from "@/shared/types";
import Header from "@/react-app/components/Header";
import ExpensesTable from "@/react-app/components/ExpensesTable";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'users'>('expenses');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'supervisor' | 'admin',
    monthly_salary: '',
    balance: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchExpenses();
      fetchUsers();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
      const data = await response.json();
      setUserProfile(data.profile);
      
      if (!data.profile || !['admin', 'supervisor'].includes(data.profile.role)) {
        navigate("/expenses");
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  const fetchExpenses = async (page = 1, perPage = 100) => {
    try {
      const offset = (page - 1) * perPage;
      const response = await fetch(`/api/expenses?limit=${perPage}&offset=${offset}`);
      const json = await response.json();
      const data = (json && (json.data || json)) || [];
      setExpenses(data);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setIsLoading(false);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form data:", userForm);
    
    // Validación en frontend
    if (!userForm.name.trim() || !userForm.email.trim()) {
      console.warn("Nombre y email son requeridos en frontend");
      return;
    }
    
    const userData = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      monthly_salary: parseFloat(userForm.monthly_salary) || 50000,
      balance: parseFloat(userForm.balance) || 0
    };
    
    console.log("Sending user data:", userData);
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        await fetchUsers();
        setShowUserModal(false);
        resetUserForm();
        console.log("Usuario creado exitosamente");
      } else {
        const errorData = await response.json();
        console.log(`Error al crear usuario: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
      console.log("Error al crear usuario");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Validación en frontend
    if (!userForm.name.trim() || !userForm.email.trim()) {
      console.log("Nombre y email son requeridos");
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${editingUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          monthly_salary: parseFloat(userForm.monthly_salary) || 50000,
          balance: parseFloat(userForm.balance) || 0
        }),
      });
      
      if (response.ok) {
        await fetchUsers();
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
        console.log("Usuario actualizado exitosamente");
      } else {
        const errorData = await response.json();
        console.log(`Error al actualizar usuario: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      console.log("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchUsers();
        console.log("Usuario eliminado exitosamente");
      } else {
        console.log("Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      console.log("Error al eliminar usuario");
    }
  };

  const openUserModal = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role as 'employee' | 'supervisor' | 'admin',
        monthly_salary: user.monthly_salary.toString(),
        balance: user.balance.toString()
      });
    } else {
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'employee',
      monthly_salary: '',
      balance: ''
    });
    setEditingUser(null);
  };

  const handleApprove = async (id: number) => {

    try {
      await fetch(`/api/expenses/${id}/approve`, {
        method: "PUT",
      });
      await fetchExpenses();
      console.log("Gasto aprobado exitosamente");
    } catch (error) {
      console.error("Error aprobando gasto:", error);
      console.log("Error al aprobar el gasto");
    }
  };

  const handleReject = async (id: number) => {

    try {
      await fetch(`/api/expenses/${id}/reject`, {
        method: "PUT",
      });
      await fetchExpenses();
      console.log("Gasto rechazado exitosamente");
    } catch (error) {
      console.error("Error rechazando gasto:", error);
      console.log("Error al rechazar el gasto");
    }
  };

  if (authLoading || !user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin">
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </div>
      </div>
    );
  }

  const pendingExpenses = expenses.filter(e => e.status === 'pendiente');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header userProfile={userProfile} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestionar gastos y usuarios</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Receipt className="w-4 h-4 inline mr-2" />
                Gastos
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Usuarios
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'expenses' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-sm border border-blue-700">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {pendingExpenses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Gastos Pendientes</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-sm border border-emerald-700">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {expenses.filter(e => e.status === 'aprobado').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Gastos Aprobados</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 shadow-sm border border-orange-700">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {expenses.filter(e => e.status === 'rechazado').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Gastos Rechazados</div>
              </div>
            </div>

            <ExpensesTable
              expenses={expenses}
              isLoading={isLoading}
              onAdd={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onApprove={handleApprove}
              onReject={handleReject}
              userRole={userProfile.role}
            />
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header con botón Agregar */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Crear, editar y eliminar usuarios</p>
              </div>
              <button
                onClick={() => openUserModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Usuario
              </button>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.user_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                            user.role === 'supervisor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${user.monthly_salary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${user.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openUserModal(user)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Usuario */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
              </h3>
              
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as 'employee' | 'supervisor' | 'admin'})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="employee">Empleado</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salario Mensual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={userForm.monthly_salary}
                    onChange={(e) => setUserForm({...userForm, monthly_salary: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={userForm.balance}
                    onChange={(e) => setUserForm({...userForm, balance: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                      resetUserForm();
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
