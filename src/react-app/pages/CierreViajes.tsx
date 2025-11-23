import { useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Header from '@/react-app/components/Header';
import Sidebar from '@/react-app/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function CierreViajes() {
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Placeholder setup: page is a protected admin/supervisor area
    // (no async initialization yet)
  }, []);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin"><Loader2 className="w-10 h-10 text-indigo-600"/></div>
      </div>
    );
  }

  if (user.role !== 'admin' && user.role !== 'supervisor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Sidebar />
        <div className="flex-1 p-12">
          <Header userProfile={user} />
          <div className="max-w-3xl mx-auto text-center py-20 border rounded-xl bg-gradient-to-br from-white/5 to-white/2 border-white/5">
            <h2 className="text-2xl font-bold text-white">Acceso denegado</h2>
            <p className="text-sm text-gray-300 mt-3">Esta sección está únicamente disponible para administradores y supervisores.</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin / Supervisor view (placeholder)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <Sidebar />
      <div className="flex-1 w-full">
        <Header userProfile={user} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">Cierre de viajes</h1>
          <p className="text-gray-300 mb-6">Área de cierre de viajes y conciliación. Aquí se gestionarán cierres cerrados en tablas separadas (expenses_cierre, saldo_transacciones_cierre).</p>

          <div className="bg-gradient-to-br from-gray-900/50 to-slate-900/40 p-6 rounded-2xl border border-violet-700/10">
            <p className="text-sm text-gray-400">Estado: Página placeholder creada — siguiente paso: endpoints de backend y páginas CRUD para cierres.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
