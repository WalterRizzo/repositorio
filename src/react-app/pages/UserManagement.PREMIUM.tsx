import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/react-app/hooks/useAuth";
import { Loader2, Plus, Users, Edit2, Trash2, X, Save, UserPlus, CheckCircle, FileSpreadsheet, Key } from "lucide-react";
import * as XLSX from 'xlsx';
import Header from "@/react-app/components/Header";
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
  // Footer filter states (visual only / export helper)
  const [footerUserFilter, setFooterUserFilter] = useState<string>('all');
  const [footerTypeFilter, setFooterTypeFilter] = useState<string>('cargas');
  const [footerCurrency, setFooterCurrency] = useState<string>('all');
  const [footerFrom, setFooterFrom] = useState('');
  const [footerTo, setFooterTo] = useState('');
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
    const styles = {
      admin: 'bg-gradient-danger shadow-glow',
      supervisor: 'bg-gradient-warning shadow-glow',
      usuario: 'bg-gradient-success shadow-glow'
    };
    
    const labels = {
      admin: 'ADMIN',
      supervisor: 'SUPERVISOR',
      usuario: 'USUARIO'
    };

    return (
      <span className={`inline-flex px-3 py-1 text-[11px] font-semibold rounded-full text-white uppercase tracking-wide ${styles[role as keyof typeof styles] || styles.usuario} shadow-glow-sm ring-1 ring-white/5`}>
        {labels[role as keyof typeof labels] || 'USUARIO'}
      </span>
    );
  };

  const exportUsersToExcel = () => {
    if (!users || users.length === 0) return;
    const rows = users.map(u => ({
      Usuario: u.user_id,
      Rol: u.role,
      Balance: Number(u.balance || 0),
      Creacion: u.created_at
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    const filename = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header userProfile={userProfile} />
      
      <div className="max-w-7xl mx-auto px-6 py-8 animate-fadeIn">
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
                    <tr key={userItem.user_id} className="group transition-all duration-200">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-2xl transform-gpu">
                            {userItem.user_id.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate max-w-[260px]">
                              {userItem.user_id}
                            </div>
                            <div className="text-xs text-white/40 truncate max-w-[260px]">{userItem.user_id}@{userItem.user_id.includes('@') ? '' : 'example.com'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
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
                      <td className="px-4 py-3 align-middle">
                        {editingUserId === userItem.user_id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingUser?.balance || 0}
                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, balance: parseFloat(e.target.value) || 0 } : null)}
                            className="w-24 px-3 py-1.5 text-xs bg-white/5 border border-violet-500/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white hover:bg-white/10 transition-colors"
                          />
                        ) : (
                          <div className="text-xs font-bold text-emerald-400">
                            {formatCurrency(userItem.balance)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-white/70">
                          {new Date(userItem.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
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
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-800/50 hover:bg-violet-700/60 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                                {/* Gestión de Usuario (abrir settings usuarios con el userId) */}
                                <button
                                  onClick={() => navigate(`/settings?tab=users&userId=${encodeURIComponent(userItem.user_id)}`)}
                                  title="Gestionar usuario"
                                  className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600/70 hover:bg-emerald-600 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                              <button
                                onClick={() => deleteUser(userItem.user_id)}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-600/60 hover:bg-rose-600 text-white shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
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

        {/* FOOTER CONTROLS - modern, compact */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-r from-transparent via-white/1 to-transparent flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={footerUserFilter} onChange={(e) => setFooterUserFilter(e.target.value)} className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm border border-white/6 focus:ring-2 focus:ring-violet-400">
              <option value="all">Todos los usuarios</option>
              <option value="admins">Admins</option>
              <option value="supervisors">Supervisores</option>
              <option value="users">Usuarios</option>
            </select>

            <button onClick={() => setFooterTypeFilter(prev => prev === 'cargas' ? 'todas' : 'cargas')} className={`px-3 py-1 rounded-full text-sm font-semibold ${footerTypeFilter === 'cargas' ? 'bg-white/5 text-white' : 'bg-white/6 text-white/70'}`}>
              CARGAS
            </button>

            <select value={footerCurrency} onChange={(e) => setFooterCurrency(e.target.value)} className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm border border-white/6">
              <option value="all">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                <label className="text-[11px]">Fecha desde</label>
                <input type="date" value={footerFrom} onChange={(e) => setFooterFrom(e.target.value)} className="text-xs bg-transparent border-none outline-none text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                <label className="text-[11px]">Fecha hasta</label>
                <input type="date" value={footerTo} onChange={(e) => setFooterTo(e.target.value)} className="text-xs bg-transparent border-none outline-none text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-white/60 hidden sm:block">Página 1 de 1</div>
            <button onClick={exportUsersToExcel} className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2 rounded-full text-sm text-white font-bold shadow-2xl hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* MODAL CREAR USUARIO */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass-light rounded-2xl shadow-2xl w-full max-w-md border border-white/20 animate-scaleIn">
              {/* HEADER */}
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 rounded-t-2xl border-b border-white/10">
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
                  <label className="block text-xs font-bold text-violet-400 mb-2 uppercase tracking-wide">
                    👤 ID DE USUARIO *
                  </label>
                  <input
                    type="text"
                    value={newUser.user_id}
                    onChange={(e) => setNewUser(prev => ({ ...prev, user_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white text-sm hover:bg-white/10 transition-all placeholder-white/30"
                    placeholder="Ej: juan.perez, admin123..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-violet-400 mb-2 uppercase tracking-wide">
                    🎯 ROL DEL USUARIO
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white text-sm hover:bg-white/10 transition-all"
                  >
                    <option value="usuario" className="bg-gray-800">Usuario</option>
                    <option value="supervisor" className="bg-gray-800">Supervisor</option>
                    <option value="admin" className="bg-gray-800">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-violet-400 mb-2 uppercase tracking-wide">
                    💰 BALANCE INICIAL (ARS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newUser.balance}
                    onChange={(e) => setNewUser(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-violet-500/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white text-sm hover:bg-white/10 transition-all placeholder-white/30"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* ACCIONES */}
              <div className="p-5 bg-white/5 rounded-b-2xl flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ user_id: "", role: "usuario", balance: 0 });
                    navigate('/users', { replace: true });
                  }}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all hover:scale-105"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.user_id.trim()}
                  className="px-6 py-2 bg-gradient-primary text-white text-sm font-bold rounded-xl shadow-glow hover:scale-105 hover:shadow-glow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  CREAR USUARIO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
