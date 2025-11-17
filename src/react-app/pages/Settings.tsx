import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, FileText, Key, Save, X, Loader2 } from "lucide-react";
import { useAuth } from "@/react-app/hooks/useAuth";
import Header from "@/react-app/components/Header";
import Sidebar from "@/react-app/components/Sidebar";

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string;
}

interface TipoComprobante {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  activo: boolean;
  descuenta_saldo?: number;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'comprobantes' | 'users'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiposComprobantes, setTiposComprobantes] = useState<TipoComprobante[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showComprobanteForm, setShowComprobanteForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingComprobante, setEditingComprobante] = useState<TipoComprobante | null>(null);
  
  // User management states
  const [usersTab, setUsersTab] = useState<'my-password' | 'user-password' | 'create-user'>('my-password');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userPasswordForm, setUserPasswordForm] = useState({
    userId: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    role: 'usuario' as 'admin' | 'supervisor' | 'usuario',
    password: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#8B5CF6",
    icon: "🏷️"
  });
  const [comprobanteForm, setComprobanteForm] = useState({
  nombre: "",
  descripcion: "",
  codigo: "",
  activo: true,
  descuenta_saldo: 1
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchCategories();
    fetchTiposComprobantes();
    fetchUsers();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTiposComprobantes = async () => {
    try {
      const response = await fetch('/api/tipo-comprobantes');
      if (response.ok) {
        const data = await response.json();
        setTiposComprobantes(data);
      }
    } catch (error) {
      console.error('Error fetching tipos comprobantes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      console.log('📤 Enviando categoría:', { method, url, data: categoryForm });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      console.log('📥 Respuesta:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Categoría guardada:', result);
        fetchCategories();
        resetCategoryForm();
        alert('✅ Categoría guardada exitosamente');
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        alert('❌ Error: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error saving category:', error);
      alert('❌ Error al guardar la categoría: ' + error);
    }
  };

  const handleComprobanteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingComprobante ? `/api/tipo-comprobantes/${editingComprobante.id}` : '/api/tipo-comprobantes';
      const method = editingComprobante ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comprobanteForm)
      });

      if (response.ok) {
        fetchTiposComprobantes();
        resetComprobanteForm();
        alert('Tipo de comprobante guardado exitosamente');
      }
    } catch (error) {
      console.error('Error saving tipo comprobante:', error);
      alert('Error al guardar el tipo de comprobante');
    }
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        alert('✅ Contraseña cambiada exitosamente');
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        alert('❌ ' + (error.error || 'Error al cambiar la contraseña'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('❌ Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userPasswordForm.newPassword !== userPasswordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Removing confirmation prompt per user request - proceed immediately

    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/users/${userPasswordForm.userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: userPasswordForm.newPassword
        })
      });

      if (response.ok) {
        alert('✅ Contraseña del usuario cambiada exitosamente');
        setUserPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert('❌ ' + (error.error || 'Error al cambiar la contraseña'));
      }
    } catch (error) {
      console.error('Error changing user password:', error);
      alert('❌ Error al cambiar la contraseña del usuario');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createUserForm.password !== createUserForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          password: createUserForm.password
        })
      });

      if (response.ok) {
        alert('✅ Usuario creado exitosamente');
        setCreateUserForm({ name: '', email: '', role: 'usuario', password: '', confirmPassword: '' });
        fetchUsers(); // Refresh users list
      } else {
        const error = await response.json();
        alert('❌ ' + (error.error || 'Error al crear el usuario'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('❌ Error al crear el usuario');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon || "🏷️"
    });
    setShowCategoryForm(true);
  };

  const handleEditComprobante = (comprobante: TipoComprobante) => {
    setEditingComprobante(comprobante);
    setComprobanteForm({
      nombre: comprobante.nombre,
      descripcion: comprobante.descripcion || "",
      codigo: comprobante.codigo || "",
      activo: comprobante.activo,
      descuenta_saldo: comprobante.descuenta_saldo ?? 1
    });
    setShowComprobanteForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchCategories();
        alert('Categoría eliminada');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const handleDeleteComprobante = async (id: number) => {
    
    try {
      const response = await fetch(`/api/tipo-comprobantes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTiposComprobantes();
        alert('Tipo de comprobante eliminado');
      }
    } catch (error) {
      console.error('Error deleting tipo comprobante:', error);
      alert('Error al eliminar el tipo de comprobante');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", color: "#8B5CF6", icon: "🏷️" });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetComprobanteForm = () => {
  setComprobanteForm({ nombre: "", descripcion: "", codigo: "", activo: true, descuenta_saldo: 1 });
    setEditingComprobante(null);
    setShowComprobanteForm(false);
  };

  const predefinedIcons = ["🏷️", "🍔", "🚗", "🏥", "💼", "🎓", "🏠", "✈️", "🎮", "🛒", "💰", "📱"];
  const predefinedColors = [
    "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#3B82F6", "#EF4444",
    "#14B8A6", "#F97316", "#6366F1", "#84CC16", "#06B6D4", "#A855F7"
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Acceso Denegado</h1>
          <p className="text-gray-400">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 w-full">
        <Header userProfile={userProfile} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-gray-400">Gestiona las categorías y tipos de comprobantes</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-800 border-2 border-gray-700 rounded-2xl p-2 inline-flex space-x-3 shadow-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('categories')}
              className={`group relative px-6 py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Tag className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'categories' ? 'rotate-12' : 'group-hover:rotate-12'}`} />
                <span>Categorías</span>
              </div>
              {activeTab === 'categories' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-50 blur-xl animate-pulse"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comprobantes')}
              className={`group relative px-6 py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'comprobantes'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'comprobantes' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>Tipos de Comprobantes</span>
              </div>
              {activeTab === 'comprobantes' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 opacity-50 blur-xl animate-pulse"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`group relative px-6 py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Key className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'users' ? '-rotate-12' : 'group-hover:-rotate-12'}`} />
                <span>Gestión de Usuarios</span>
              </div>
              {activeTab === 'users' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 opacity-50 blur-xl animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        {/* CATEGORÍAS */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCategoryForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-indigo-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon || '🏷️'}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {userProfile?.role === 'admin' && (
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                    Creada: {new Date(category.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIPOS DE COMPROBANTES */}
        {activeTab === 'comprobantes' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowComprobanteForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Tipo de Comprobante</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiposComprobantes.map((comprobante) => (
                <div
                  key={comprobante.id}
                  className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-indigo-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-xl text-white">{comprobante.nombre}</h3>
                          {comprobante.codigo && (
                            <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-bold">
                              {comprobante.codigo}
                            </span>
                          )}
                        </div>
                        {comprobante.descripcion && (
                          <p className="text-sm text-gray-400 mt-2">{comprobante.descripcion}</p>
                        )}
                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            comprobante.activo 
                              ? 'bg-green-600/30 text-green-300' 
                              : 'bg-red-600/30 text-red-300'
                          }`}>
                            {comprobante.activo ? '✓ Activo' : '✗ Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {userProfile?.role === 'admin' && (
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditComprobante(comprobante)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComprobante(comprobante.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                    Creado: {new Date(comprobante.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GESTIÓN DE USUARIOS */}
        {activeTab === 'users' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Key className="w-8 h-8 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
              </div>

              {/* Sub-tabs */}
              <div className="flex space-x-3 mb-6 bg-gradient-to-r from-gray-700 via-gray-700 to-gray-700 p-1.5 rounded-xl shadow-inner">
                <button
                  onClick={() => setUsersTab('my-password')}
                  className={`group relative flex-1 px-5 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                    usersTab === 'my-password'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className={`text-xl transition-transform duration-300 ${usersTab === 'my-password' ? 'animate-bounce' : ''}`}>🔐</span>
                    <span>Mi Contraseña</span>
                  </span>
                  {usersTab === 'my-password' && (
                    <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-30 blur-md"></div>
                  )}
                </button>
                {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                  <>
                    <button
                      onClick={() => setUsersTab('user-password')}
                      className={`group relative flex-1 px-5 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                        usersTab === 'user-password'
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span className={`text-xl transition-transform duration-300 ${usersTab === 'user-password' ? 'rotate-12' : ''}`}>👥</span>
                        <span>Cambiar a Usuario</span>
                      </span>
                      {usersTab === 'user-password' && (
                        <div className="absolute inset-0 rounded-lg bg-orange-600 opacity-30 blur-md"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setUsersTab('create-user')}
                      className={`group relative flex-1 px-5 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                        usersTab === 'create-user'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50 scale-105'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span className={`text-xl transition-transform duration-300 ${usersTab === 'create-user' ? 'scale-125' : ''}`}>➕</span>
                        <span>Crear Usuario</span>
                      </span>
                      {usersTab === 'create-user' && (
                        <div className="absolute inset-0 rounded-lg bg-green-600 opacity-30 blur-md"></div>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Mi Contraseña */}
              {usersTab === 'my-password' && (
                <form onSubmit={handleChangeMyPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className={`group relative w-full px-6 py-4 font-bold rounded-xl flex items-center justify-center space-x-3 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        isChangingPassword 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70'
                      } text-white`}
                    >
                      {!isChangingPassword && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      )}
                      {isChangingPassword && <Loader2 className="w-6 h-6 animate-spin" />}
                      <span className="text-lg">{isChangingPassword ? 'Cambiando...' : '🔒 Cambiar Contraseña'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Cambiar Contraseña de Usuario */}
              {usersTab === 'user-password' && (
                <form onSubmit={handleChangeUserPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Seleccionar Usuario
                    </label>
                    <select
                      value={userPasswordForm.userId}
                      onChange={(e) => setUserPasswordForm({...userPasswordForm, userId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                    >
                      <option value="">Selecciona un usuario...</option>
                      {users.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={userPasswordForm.newPassword}
                      onChange={(e) => setUserPasswordForm({...userPasswordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={userPasswordForm.confirmPassword}
                      onChange={(e) => setUserPasswordForm({...userPasswordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                  
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                    <p className="text-sm text-yellow-300">
                      ⚠️ Estás a punto de cambiar la contraseña de otro usuario. Esta acción no se puede deshacer.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className={`group relative w-full px-6 py-4 font-bold rounded-xl flex items-center justify-center space-x-3 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        isChangingPassword 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-700 hover:via-red-700 hover:to-orange-700 shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 animate-pulse hover:animate-none'
                      } text-white`}
                    >
                      {!isChangingPassword && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      )}
                      {isChangingPassword && <Loader2 className="w-6 h-6 animate-spin" />}
                      <span className="text-lg">{isChangingPassword ? 'Cambiando...' : '🔑 Cambiar Contraseña'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Crear Usuario */}
              {usersTab === 'create-user' && (
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={createUserForm.name}
                      onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Rol
                    </label>
                    <select
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value as 'admin' | 'supervisor' | 'usuario'})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                    >
                      <option value="usuario">👤 Usuario</option>
                      <option value="supervisor">👔 Supervisor</option>
                      <option value="admin">👑 Administrador</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={createUserForm.confirmPassword}
                      onChange={(e) => setCreateUserForm({...createUserForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      required
                      minLength={6}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                  
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-300">
                      ✨ El usuario se creará con acceso inmediato al sistema.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className={`group relative w-full px-6 py-4 font-bold rounded-xl flex items-center justify-center space-x-3 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        isChangingPassword 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70'
                      } text-white`}
                    >
                      {!isChangingPassword && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className="absolute inset-0 bg-green-400/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        </>
                      )}
                      {isChangingPassword && <Loader2 className="w-6 h-6 animate-spin" />}
                      <span className="text-lg relative z-10">{isChangingPassword ? 'Creando...' : '➕ Crear Usuario'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal de Categoría */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <button
                  onClick={resetCategoryForm}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3">
                      Icono
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, icon })}
                          className={`p-3 rounded-lg text-2xl transition-all ${
                            categoryForm.icon === icon
                              ? 'bg-indigo-600 scale-110'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3">
                      Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, color })}
                          className={`w-full h-10 rounded-lg ${
                            categoryForm.color === color
                              ? 'ring-2 ring-white scale-110'
                              : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingCategory ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Tipo de Comprobante */}
        {showComprobanteForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingComprobante ? 'Editar Tipo de Comprobante' : 'Nuevo Tipo de Comprobante'}
                </h2>
                <button
                  onClick={resetComprobanteForm}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleComprobanteSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={comprobanteForm.nombre}
                    onChange={(e) => setComprobanteForm({ ...comprobanteForm, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={comprobanteForm.codigo}
                    onChange={(e) => setComprobanteForm({ ...comprobanteForm, codigo: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={comprobanteForm.descripcion}
                    onChange={(e) => setComprobanteForm({ ...comprobanteForm, descripcion: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!comprobanteForm.descuenta_saldo}
                      onChange={e => setComprobanteForm({ ...comprobanteForm, descuenta_saldo: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-400 font-bold">Descuenta saldo</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comprobanteForm.activo}
                      onChange={(e) => setComprobanteForm({ ...comprobanteForm, activo: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-400 font-bold">Activo</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetComprobanteForm}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingComprobante ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
