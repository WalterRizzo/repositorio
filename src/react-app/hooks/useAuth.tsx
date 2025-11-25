import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'usuario';
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un usuario autenticado al inicializar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      // Intentar parsear JSON; si falla, usar texto como fallback para mostrar un mensaje útil
      try {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar sesión');
      } catch (parseErr) {
        const text = await response.text().catch(() => 'Error al iniciar sesión (respuesta no-JSON)');
        throw new Error(text || 'Error al iniciar sesión');
      }
    }

    // Respuesta OK: intentar parsear JSON con fallback
    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      // Si el servidor devolvió OK pero no JSON, informar al usuario
      const text = await response.text().catch(() => null);
      throw new Error(text || 'Respuesta inesperada del servidor');
    }

    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrarse');
      } catch (parseErr) {
        const text = await response.text().catch(() => 'Error al registrarse (respuesta no-JSON)');
        throw new Error(text || 'Error al registrarse');
      }
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      const text = await response.text().catch(() => null);
      throw new Error(text || 'Respuesta inesperada del servidor');
    }

    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}