import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Plus, Users, Edit2, Trash2, X, Save, UserPlus, CheckCircle } from "lucide-react";
import Header from "@/react-app/components/Header";
import { parseDbTimestampToDate } from '@/react-app/utils/dates';
import Sidebar from "@/react-app/components/Sidebar";
import argentinaFlag from '@/react-app/assets/argentina.svg';

interface UserProfile {
  user_id: string;
  role: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface NewUser {
  user_id: string;
  role: string;
  balance: number;
}

export default function UserManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({ user_id: "", role: "usuario", balance: 0 });
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    // Open Create User modal if URL hash is '#create'
    if (location.hash === '#create') {
      setShowCreateModal(true);
    }
  }, [location.hash]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me");
      const data = await response.json();
      setUserProfile(data.profile || { role: 'admin' });
    } catch (error) {
      console.error("Error cargando perfil:", error);
      setUserProfile({ role: 'admin' });
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        showMessage('error', 'Error cargando usuarios');
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      showMessage('error', 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.user_id.trim()) {
      showMessage('error', 'El ID de usuario es requerido');
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        showMessage('success', 'Usuario creado exitosamente');
        setShowCreateModal(false);
        setNewUser({ user_id: "", role: "usuario", balance: 0 });
        await fetchUsers();
        navigate('/users', { replace: true });
        try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'users.create' } })); } catch(e){}
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Error creando usuario');
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
      showMessage('error', 'Error de conexión al crear usuario');
    }
  };

  const startEdit = (userItem: UserProfile) => {
    setEditingUserId(userItem.user_id);
    setEditingUser({ ...userItem });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditingUser(null);
  };

  const saveEdit = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingUser.role,
          balance: editingUser.balance
        }),
      });

      if (response.ok) {
        showMessage('success', 'Usuario actualizado exitosamente');
        setEditingUserId(null);
        setEditingUser(null);
        await fetchUsers();
        try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'users.update', userId: editingUser?.user_id || null } })); } catch(e){}
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Error actualizando usuario');
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      showMessage('error', 'Error de conexión al actualizar');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Eliminar usuario?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showMessage('success', 'Usuario eliminado exitosamente');
        await fetchUsers();
        try { window.dispatchEvent(new CustomEvent('data:changed', { detail: { source: 'users.delete', userId } })); } catch(e){}
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Error eliminando usuario');
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      showMessage('error', 'Error de conexión al eliminar');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getRoleBadge = (role: string) => {
    // estilos y labels eliminados, ahora se usan directamente los spans

        if (role === "admin") return <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-500 text-white text-xs font-bold shadow-lg border-2 border-red-300 animate-pulse">ADMIN</span>;
        if (role === "supervisor") return <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold shadow-lg border-2 border-yellow-300 animate-pulse">SUPERVISOR</span>;
        return <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs font-bold shadow-lg border-2 border-green-300 animate-pulse">USUARIO</span>;
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 w-full">
        <Header userProfile={userProfile} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
        {/* MENSAJES */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-slideIn ${
            message.type === 'success' 
              ? 'glass-light bg-gradient-success text-white' 
              : 'glass-light bg-gradient-danger text-white'
          }`}>
            <div className="flex items-center text-sm font-semibold">
              {message.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
              {message.type === 'error' && <X className="w-4 h-4 mr-2" />}
              {message.text}
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-6">
          <div className="glass rounded-2xl p-6 border border-white/10 shadow-premium">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                  🧑‍💼 GESTIÓN DE USUARIOS
                </h1>
                <p className="text-xs text-white/60">
                  Sistema ABM completo · {users.length} usuarios activos
                </p>
              </div>
              <button
                onClick={() => { setShowCreateModal(true); window.location.hash = '#create' }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-primary text-white text-sm font-bold rounded-xl shadow-glow hover:scale-105 hover:shadow-glow-lg transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>NUEVO USUARIO</span>
              </button>
            </div>
          </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="glass rounded-2xl border border-white/10 shadow-premium overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 p-4 border-b border-white/10 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-wide">
              <Users className="w-4 h-4 mr-2 text-violet-400" />
              LISTA DE USUARIOS · {users.length}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-white/50">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full glass-light flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Comienza creando tu primer usuario
              </p>
              <button
                onClick={() => { setShowCreateModal(true); window.location.hash = '#create' }}
                className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white text-sm font-bold rounded-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Usuario
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      👤 USUARIO
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      🎯 ROL
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      💰 BALANCE
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      📅 CREACIÓN
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-white/70 uppercase tracking-wider">
                      ⚙️ ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((userItem) => (
                    <tr key={userItem.user_id} className="hover:bg-white/5 transition-all duration-200 group">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {userItem.user_id.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate max-w-[220px] whitespace-nowrap">
                              {userItem.user_id}
                            </div>
                            <div className="text-[10px] text-white/40">
                              ID: {userItem.user_id.substring(0, 12)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingUserId === userItem.user_id ? (
                          <select
                            value={editingUser?.role || ""}
                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                            className="w-full px-3 py-1.5 text-xs bg-white/5 border border-violet-500/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white hover:bg-white/10 transition-colors"
                          >
                            <option value="usuario" className="bg-gray-800">Usuario</option>
                            <option value="supervisor" className="bg-gray-800">Supervisor</option>
                            <option value="admin" className="bg-gray-800">Administrador</option>
                          </select>
                        ) : (
                          getRoleBadge(userItem.role)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingUserId === userItem.user_id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingUser?.balance || 0}
                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, balance: parseFloat(e.target.value) || 0 } : null)}
                            className="w-24 px-3 py-1.5 text-xs bg-white/5 border border-violet-500/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white hover:bg-white/10 transition-colors"
                          />
                        ) : (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 ${userItem.balance < 0 ? 'bg-gradient-to-r from-red-600 to-pink-500 text-white border-red-300 animate-pulse' : 'bg-gradient-to-r from-emerald-500 to-green-400 text-white border-green-300 animate-pulse'}`}> 
                            {formatCurrency(userItem.balance)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-white/70">
                          {(() => {
                            const d = parseDbTimestampToDate(userItem.created_at);
                            return d ? d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : userItem.created_at;
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 animate-fadeIn">
                          {editingUserId === userItem.user_id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all hover:scale-110"
                                title="Guardar"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 text-white/50 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(userItem)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-violet-300"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                              </button>
                              <button
                                onClick={() => deleteUser(userItem.user_id)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-rose-300"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL CREAR USUARIO */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 bg-gray-900/80 backdrop-blur-sm animate-scaleIn">
              {/* HEADER */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 rounded-t-2xl border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">CREAR USUARIO</h3>
                        <img src={argentinaFlag} alt="Bandera Argentina" className="w-5 h-3 object-cover rounded-sm" />
                      </div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wide">
                        Nuevo registro del sistema
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FORMULARIO */}
              <div className="p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wide">
                    👤 ID DE USUARIO *
                  </label>
                    <input
                    type="text"
                    value={newUser.user_id}
                    onChange={(e) => setNewUser(prev => ({ ...prev, user_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-emerald-400/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-white text-sm hover:bg-white/10 transition-all placeholder-white/30"
                    placeholder="Ej: juan.perez, admin123..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wide">
                    🎯 ROL DEL USUARIO
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-emerald-400/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-white text-sm hover:bg-white/10 transition-all"
                  >
                    <option value="usuario" className="bg-gray-800">Usuario</option>
                    <option value="supervisor" className="bg-gray-800">Supervisor</option>
                    <option value="admin" className="bg-gray-800">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wide">
                    💰 BALANCE INICIAL (ARS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newUser.balance}
                    onChange={(e) => setNewUser(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-emerald-400/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-white text-sm hover:bg-white/10 transition-all placeholder-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* ACCIONES */}
                <div className="p-5 bg-white/5 rounded-b-2xl flex items-center justify-end space-x-3 border-t border-gray-700">
                  <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ user_id: "", role: "usuario", balance: 0 });
                    navigate('/users', { replace: true });
                  }}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all hover:scale-105"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.user_id.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-glow hover:scale-105 hover:shadow-glow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  CREAR USUARIO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}



