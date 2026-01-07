import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { useAuth } from "@/react-app/hooks/useAuth";
import Header from "@/react-app/components/Header";

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchUserProfile();
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
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json() as any;
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCategories();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Eliminar categoría?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok && !response.headers.get('content-type')) {
          try { await fetch(`/api/categories/${id}`, { method: 'DELETE', credentials: 'include' }); } catch(e){}
        }
        if (response.ok) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#3B82F6" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const defaultCategories = [
    { id: 1, name: "Comida", description: "Gastos en alimentación", color: "#10B981", created_at: new Date().toISOString() },
    { id: 2, name: "Transporte", description: "Gastos de movilidad", color: "#3B82F6", created_at: new Date().toISOString() },
    { id: 3, name: "Entretenimiento", description: "Ocio y diversión", color: "#8B5CF6", created_at: new Date().toISOString() },
    { id: 4, name: "Salud", description: "Gastos médicos", color: "#EF4444", created_at: new Date().toISOString() },
    { id: 5, name: "Capacitación", description: "Formación y cursos", color: "#F59E0B", created_at: new Date().toISOString() },
    { id: 6, name: "Oficina", description: "Materiales y suministros", color: "#6B7280", created_at: new Date().toISOString() }
  ];

  const categoriesToShow = categories.length > 0 ? categories : defaultCategories;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <Header userProfile={userProfile} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Categorías</h1>
            <p className="text-lg text-gray-300">Gestiona las categorías de gastos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoriesToShow.map((category) => (
            <div key={category.id} className="relative rounded-2xl p-7 shadow-xl backdrop-blur-lg bg-white/10 border border-white/20 transition-transform hover:-translate-y-2 hover:shadow-2xl group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
                  <>
                    <button onClick={() => handleEdit(category)} className="p-2 rounded-full bg-white/20 hover:bg-indigo-500 text-indigo-300 hover:text-white shadow">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 rounded-full bg-white/20 hover:bg-red-500 text-red-300 hover:text-white shadow">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: category.color, boxShadow: `0 0 0 4px ${category.color}55` }}>
                  <Tag className="w-8 h-8 text-white drop-shadow" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{category.name}</h3>
                  {category.description && (
                    <p className="text-base text-gray-200 font-medium max-w-[220px]">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-2">Creada: {new Date(category.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {(userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-lg font-bold rounded-full shadow-2xl hover:scale-105 hover:shadow-pink-500/40 transition-all"
            style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
            <Plus className="w-7 h-7" />
            Nueva Categoría
          </button>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
              <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white text-center">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
                    rows={3}
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-12 border border-gray-300 dark:border-gray-600 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-lg font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl text-lg font-bold shadow-lg hover:scale-105 transition-all"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}