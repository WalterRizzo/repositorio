import { getCookie } from 'hono/cookie';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'usuario';
}

export interface AuthRequest {
  user?: User;
}

// Función para hashear contraseñas usando Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// Función para generar token simple (base64 encoded)
export function generateToken(user: User, secret: string): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
  };
  const tokenData = JSON.stringify(payload);
  return btoa(tokenData + '.' + secret);
}

// Función para verificar token
export function verifyToken(token: string, secret: string): User | null {
  try {
    const decoded = atob(token);
    const [payloadStr, tokenSecret] = decoded.split('.' + secret);
    
    if (tokenSecret !== '') return null;
    
    const payload = JSON.parse(payloadStr);
    
    // Verificar expiración
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    return null;
  }
}

// Middleware de autenticación
export function authMiddleware() {
  return async (c: any, next: any) => {
    // Primero intentamos obtener el token del header Authorization
    let token = c.req.header('Authorization');
    if (token?.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      // Si no hay header, intentamos obtener de las cookies
      token = getCookie(c, 'auth_token');
    }
    
    if (!token) {
      return c.json({ error: 'Token de autenticación requerido' }, 401);
    }

    const user = verifyToken(token, c.env.JWT_SECRET);
    if (!user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    c.set('user', user);
    await next();
  };
}