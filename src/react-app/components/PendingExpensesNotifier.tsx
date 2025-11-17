import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import { useAuth } from '@/react-app/hooks/useAuth';

export default function PendingExpensesNotifier() {
  const { user } = useAuth();
  const { permission, requestPermission, showNotification, isSupported, schedulePeriodicCheck } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // Solo mostrar para admins y supervisores
  const canReceiveNotifications = user && ['admin', 'supervisor'].includes(user.role);

  useEffect(() => {
    if (!canReceiveNotifications) return;

    // Verificar si el usuario ya activó las notificaciones
    const savedPreference = localStorage.getItem('notifications-enabled');
    if (savedPreference === 'true' && permission === 'granted') {
      setIsEnabled(true);
      startNotificationChecks();
    } else if (savedPreference === null && permission === 'default') {
      // Mostrar banner solo si nunca respondió
      setTimeout(() => setShowBanner(true), 3000);
    }
  }, [canReceiveNotifications, permission]);

  const checkPendingExpenses = async () => {
    try {
      const response = await fetch('/api/expenses/pending/count');
      const data = await response.json();
      
      if (data.count > 0) {
        showNotification(
          `🔔 ${data.count} ${data.count === 1 ? 'Gasto Pendiente' : 'Gastos Pendientes'}`,
          {
            body: `${data.count === 1 ? 'Hay un gasto pendiente' : `Hay ${data.count} gastos pendientes`} de aprobación.`,
            tag: 'pending-expenses',
            data: { url: '/expenses', count: data.count }
          }
        );
      }
    } catch (error) {
      console.error('Error checking pending expenses:', error);
    }
  };

  const startNotificationChecks = () => {
    // Revisar cada 15 minutos
    return schedulePeriodicCheck(checkPendingExpenses, 15);
  };

  const handleEnable = async () => {
    const result = await requestPermission();
    
    if (result === 'granted') {
      setIsEnabled(true);
      setShowBanner(false);
      localStorage.setItem('notifications-enabled', 'true');
      startNotificationChecks();
      
      // Mostrar notificación de bienvenida
      showNotification(
        '✅ Notificaciones Activadas',
        {
          body: 'Recibirás alertas de gastos pendientes cada 15 minutos',
          tag: 'welcome'
        }
      );
    } else {
      console.warn('❌ Permiso de notificaciones denegado');
    }
  };

  const handleDisable = () => {
    setIsEnabled(false);
    localStorage.setItem('notifications-enabled', 'false');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notifications-enabled', 'dismissed');
  };

  if (!canReceiveNotifications || !isSupported) {
    return null;
  }

  return (
    <>
      {/* Banner de invitación */}
      {showBanner && (
        <div className="fixed bottom-8 right-8 z-50 max-w-md animate-bounce-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-indigo-400">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bell className="w-8 h-8 animate-bell-ring" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  🔔 Activa las Notificaciones
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Recibe alertas automáticas cuando haya gastos pendientes de aprobación.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEnable}
                    className="flex-1 px-4 py-2 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Activar
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
                  >
                    Ahora No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador en el header (opcional) */}
      {isEnabled && (
        <div className="fixed bottom-8 left-8 z-40">
          <div className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
            <Bell className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-semibold">Notificaciones Activas</span>
            <button
              onClick={handleDisable}
              className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              title="Desactivar notificaciones"
            >
              <BellOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
