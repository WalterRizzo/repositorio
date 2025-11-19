import { getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

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
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Función para generar token simple (base64 encoded)
export async function generateToken(user: User, secret: string): Promise<string> {
  const alg = 'HS256';
  const jwt = await new SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));
  return jwt;
}

// Función para verificar token
export async function verifyToken(token: string, secret: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    const p = payload as any;
    // @ts-ignore
    return { id: p.id, email: p.email, name: p.name, role: p.role } as User;
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

    const user = await verifyToken(token, c.env.JWT_SECRET);
    if (!user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    c.set('user', user);
    await next();
  };
}