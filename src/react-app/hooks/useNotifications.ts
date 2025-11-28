import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<string>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Registrar Service Worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Safety-guard: ensure the SW file exists and is served as JS. Some hosts return index.html with text/html
      // which would break registration (SecurityError). Do a HEAD request first.
      const swPath = '/sw.js';
      try {
        const head = await fetch(swPath, { method: 'HEAD' });
        const contentType = head.headers?.get('content-type') || '';
        if (!head.ok || !contentType.includes('javascript')) {
          console.warn('Skipping Service Worker registration - file missing or not JS:', swPath, head.status, contentType);
          return;
        }
      } catch (e) {
        // HEAD failed - just skip registration to avoid SecurityError
        console.warn('Service worker availability check failed, skipping register:', e);
        return;
      }

      const reg = await navigator.serviceWorker.register(swPath);
      console.log('✅ Service Worker registrado:', reg);
      setRegistration(reg);
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  };

  const requestPermission = async (): Promise<string> => {
    if (!isSupported) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error solicitando permiso de notificaciones:', error);
      return 'denied';
    }
  };

  const showNotification = async (title: string, options?: any) => {
    if (permission !== 'granted') {
      console.warn('No hay permiso para mostrar notificaciones');
      return;
    }

    if (registration) {
      // Usar Service Worker para notificaciones
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        requireInteraction: true,
        ...options,
      });
    } else {
      // Fallback a notificaciones simples
      new Notification(title, options);
    }
  };

  const schedulePeriodicCheck = (callback: () => void, intervalMinutes: number = 15) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const checkInterval = setInterval(() => {
      if (permission === 'granted') {
        callback();
      }
    }, intervalMs);

    // Ejecutar inmediatamente
    if (permission === 'granted') {
      callback();
    }

    return () => clearInterval(checkInterval);
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported,
    registration,
    schedulePeriodicCheck,
  };
}
