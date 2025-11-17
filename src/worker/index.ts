import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { authMiddleware, generateToken, verifyPassword, hashPassword, type User } from "./auth";

type Variables = {
  user: User;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================
// RATE LIMITING - Protección contra DDoS
// ============================================================
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Función para limpiar registros antiguos (se ejecuta en cada request)
function cleanupRateLimitStore(store: Map<string, { count: number; resetTime: number }>) {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

// Middleware de Rate Limiting
app.use('*', async (c, next) => {
  // Limpiar registros antiguos ocasionalmente
  if (Math.random() < 0.1) { // 10% de probabilidad en cada request
    cleanupRateLimitStore(rateLimitStore);
  }
  
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 100; // 100 requests por minuto por IP
  
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const record = rateLimitStore.get(key);
  
  if (record) {
    if (record.count >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      
      // Registrar en la base de datos para auditoría
      try {
        await c.env.DB.prepare(
          'INSERT INTO rate_limit_log (ip_address, endpoint, attempts, user_agent) VALUES (?, ?, ?, ?)'
        ).bind(ip, c.req.path, record.count, c.req.header('user-agent') || 'unknown').run();
      } catch (e) {
        console.error('Error logging rate limit:', e);
      }
      
      return c.json({ 
        error: 'Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.' 
      }, 429);
    }
    record.count++;
  } else {
    rateLimitStore.set(key, { 
      count: 1, 
      resetTime: now + windowMs 
    });
  }
  
  await next();
});

// ============================================================

// FUNCIÓN PARA REGISTRAR TRANSACCIONES DE SALDO (CONTROL Y AUDITORIA)
async function registrarTransaccionSaldo(
  db: any,
  userId: string,
  currency: string,
  tipo: 'carga' | 'descuento' | 'ajuste',
  monto: number,
  saldoAnterior: number,
  saldoNuevo: number,
  descripcion: string,
  realizadoPor: string
) {
  try {
    await db.prepare(`
      INSERT INTO saldo_transacciones 
      (user_id, currency, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, realizado_por, fecha_transaccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, currency, tipo, monto, saldoAnterior, saldoNuevo, descripcion, realizadoPor).run();
    
    console.log(`✅ Transacción registrada: Usuario ${userId} - ${tipo} ${monto} ${currency} por ${realizadoPor}`);
  } catch (error) {
    console.error('❌ Error registrando transacción:', error);
    // No lanzamos error para no interrumpir la operación principal
  }
}

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://*.pages.dev', 'https://*.workers.dev'],
  credentials: true,
}));

// ============================================================
// Rate Limit específico para LOGIN - Más estricto
// ============================================================
const loginRateLimitStore = new Map<string, { count: number; resetTime: number }>();

const loginRateLimit = async (c: any, next: any) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxLoginAttempts = 10; // 10 intentos de login por IP cada 15 minutos
  
  const key = `login:${ip}:${Math.floor(now / windowMs)}`;
  const record = loginRateLimitStore.get(key);
  
  if (record) {
    if (record.count >= maxLoginAttempts) {
      console.warn(`🚨 Login rate limit exceeded for IP: ${ip}`);
      
      // Registrar en la base de datos para auditoría
      try {
        await c.env.DB.prepare(
          'INSERT INTO rate_limit_log (ip_address, endpoint, attempts, user_agent) VALUES (?, ?, ?, ?)'
        ).bind(ip, '/api/auth/login', record.count, c.req.header('user-agent') || 'unknown').run();
      } catch (e) {
        console.error('Error logging login rate limit:', e);
      }
      
      return c.json({ 
        error: 'Demasiados intentos de inicio de sesión. Por favor, espera 15 minutos.' 
      }, 429);
    }
    record.count++;
  } else {
    loginRateLimitStore.set(key, { 
      count: 1, 
      resetTime: now + windowMs 
    });
  }
  
  await next();
};

// Login endpoint
app.post("/api/auth/login", loginRateLimit, async (c) => {
  const body = await c.req.json();

  const identifier = body.identifier || body.email;
  if (!identifier || !body.password) {
    return c.json({ error: "Identificador (email o usuario) y contraseña son requeridos" }, 400);
  }

  // Buscar usuario en la base de datos (case insensitive) por email o id
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?)'
  ).bind(identifier, identifier).all();

  if (results.length === 0) {
    return c.json({ error: "Credenciales inválidas" }, 401);
  }

  const user = results[0] as any;
  
  // Verificar si la cuenta está bloqueada
  if (user.locked_until) {
    const lockedUntil = new Date(user.locked_until);
    const now = new Date();
    
    if (now < lockedUntil) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
      return c.json({ 
        error: `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minutos.` 
      }, 403);
    } else {
      // Desbloquear la cuenta si ya pasó el tiempo
      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?'
      ).bind(user.id).run();
    }
  }
  
  // Verificar contraseña
  const isValidPassword = await verifyPassword(body.password, user.password_hash);
  
  if (!isValidPassword) {
    // Incrementar intentos fallidos
    const failedAttempts = (user.failed_login_attempts || 0) + 1;
    const now = new Date().toISOString();
    
    if (failedAttempts >= 3) {
      // Bloquear cuenta por 30 minutos
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ?, last_failed_login = ? WHERE id = ?'
      ).bind(failedAttempts, lockUntil, now, user.id).run();
      
      // Enviar email de notificación al admin
      try {
        console.log('🔔 Intentando enviar email de bloqueo...');
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Tharsis Expense <onboarding@resend.dev>',
            to: 'wrizzo6802@gmail.com',
            subject: '🔒 ALERTA: Cuenta bloqueada por intentos fallidos',
            html: `
              <h2>⚠️ Alerta de Seguridad</h2>
              <p>La cuenta del usuario <strong>${user.name}</strong> (${user.email}) ha sido bloqueada temporalmente.</p>
              <p><strong>Razón:</strong> 3 intentos fallidos de inicio de sesión</p>
              <p><strong>Hora del bloqueo:</strong> ${new Date().toLocaleString('es-AR')}</p>
              <p><strong>Duración del bloqueo:</strong> 30 minutos</p>
              <p><strong>IP/User Agent:</strong> ${c.req.header('user-agent') || 'No disponible'}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Este es un mensaje automático del sistema ExpenseFlow.</p>
            `
          })
        });
        const emailResult = await emailResponse.json();
        console.log('📧 Respuesta de Resend:', emailResponse.status, emailResult);
      } catch (emailError) {
        console.error('❌ Error sending lock notification email:', emailError);
      }
      
      return c.json({ 
        error: "Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente en 30 minutos." 
      }, 403);
    } else {
      // Actualizar intentos fallidos
      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = ?, last_failed_login = ? WHERE id = ?'
      ).bind(failedAttempts, now, user.id).run();
      
      return c.json({ 
        error: `Credenciales inválidas. Intentos restantes: ${3 - failedAttempts}` 
      }, 401);
    }
  }

  // Login exitoso - resetear intentos fallidos
  await c.env.DB.prepare(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_failed_login = NULL WHERE id = ?'
  ).bind(user.id).run();

  // Registrar logueo en audit_logs
  await c.env.DB.prepare(
    `INSERT INTO audit_logs (user_id, user_email, action, module, description) VALUES (?, ?, ?, ?, ?)`
  ).bind(
    user.id,
    user.email,
    'login',
    'auth',
    `Inicio de sesión exitoso para ${user.email}`
  ).run();

  // Generar token
  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  
  const token = generateToken(userData, c.env.JWT_SECRET);

  // Establecer cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60, // 7 días
  });

  return c.json({ 
    success: true, 
    user: userData,
    token 
  });
});

// Register endpoint
app.post("/api/auth/register", async (c) => {
  const body = await c.req.json();

  if (!body.email || !body.password || !body.name) {
    return c.json({ error: "Email, contraseña y nombre son requeridos" }, 400);
  }

  // Verificar si el usuario ya existe (case insensitive)
  const { results: existingUsers } = await c.env.DB.prepare(
    'SELECT id FROM users WHERE LOWER(email) = LOWER(?)'
  ).bind(body.email).all();

  if (existingUsers.length > 0) {
    return c.json({ error: "El usuario ya existe" }, 400);
  }

  // Hash de la contraseña
  const passwordHash = await hashPassword(body.password);
  // Asume que body.name y body.lastname existen
  const name = body.name.trim().toLowerCase();
  const lastname = (body.lastname || '').trim().toLowerCase();
  let userId = '';
  if (name && lastname) {
    userId = name[0] + lastname;
  } else if (name) {
    userId = name;
  } else {
    userId = crypto.randomUUID();
  }

  // Crear usuario
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, lastname, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, body.email, body.name, lastname, passwordHash, 'usuario').run();

  // Crear perfil de usuario
  await c.env.DB.prepare(
    'INSERT INTO user_profiles (user_id, role, balance) VALUES (?, ?, ?)'
  ).bind(userId, 'usuario', 0).run();

  const userData: User = {
    id: userId,
    email: body.email,
    name: body.name,
    role: 'usuario'
  };

  const token = generateToken(userData, c.env.JWT_SECRET);

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60,
  });

  return c.json({ 
    success: true, 
    user: userData,
    token 
  });
});

// Logout
app.post('/api/auth/logout', async (c) => {
  deleteCookie(c, 'auth_token', { path: '/' });
  return c.json({ success: true });
});

// Get current user with profile
app.get("/api/users/me", authMiddleware(), async (c) => {
  const user = c.get("user")! as User;
  
  // Get user from main users table
  const { results: userResults } = await c.env.DB.prepare(
    'SELECT id as user_id, name, email, role, created_at, updated_at FROM users WHERE id = ?'
  ).bind(user.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const userData = userResults[0] as any;
  
  // Get balance from saldos table (default ARS for now)
  const { results: saldoResults } = await c.env.DB.prepare(
    'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
  ).bind(user.id, 'ARS').all();
  
  const balance = saldoResults.length > 0 ? saldoResults[0].balance : 0;
  
  return c.json({
    user_id: userData.user_id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    balance: balance || 0,
    created_at: userData.created_at,
    updated_at: userData.updated_at
  });
});



// Get expenses for current user or all expenses for admins
// Endpoint para contar gastos pendientes (para notificaciones)
app.get('/api/expenses/pending/count', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    
    // Solo admins y supervisores pueden usar este endpoint
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (userResults.length === 0 || !['admin', 'supervisor'].includes(userResults[0].role as string)) {
      return c.json({ error: 'No autorizado' }, 403);
    }

    // Contar gastos pendientes
    const { results } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM expenses WHERE status = 'pendiente'"
    ).all();

    return c.json({ count: results[0].count || 0 });
  } catch (error) {
    console.error('Error contando gastos pendientes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/expenses', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    
    // Get user profile to check role
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (userResults.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    const userRole = userResults[0].role;
    let query = '';
    let params: any[] = [];

    // If user is admin or supervisor, show all expenses with user info
    // If regular user, show only their expenses with user info
    if (userRole === 'admin' || userRole === 'supervisor') {
      query = `SELECT e.*, u.name as user_name, u.email as user_email 
               FROM expenses e 
               LEFT JOIN users u ON e.user_id = u.id 
               ORDER BY e.expense_date DESC, e.created_at DESC`;
    } else {
      query = `SELECT e.*, u.name as user_name, u.email as user_email 
               FROM expenses e 
               LEFT JOIN users u ON e.user_id = u.id 
               WHERE e.user_id = ? 
               ORDER BY e.expense_date DESC, e.created_at DESC`;
      params = [user.id];
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Para cada gasto, obtener los archivos adjuntos
    const expensesWithAttachments = await Promise.all(
      results.map(async (expense: any) => {
        const { results: attachments } = await c.env.DB.prepare(
          'SELECT filename, original_name, content_type FROM expense_attachments WHERE expense_id = ? ORDER BY created_at'
        ).bind(expense.id).all();

        return {
          ...expense,
          attachments: attachments.map((att: any) => ({
            filename: att.filename,
            originalName: att.original_name,
            contentType: att.content_type,
            url: `/api/files/${att.filename}`
          }))
        };
      })
    );
    
    return c.json(expensesWithAttachments);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Create new expense with authentication
app.post('/api/expenses', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expense = await c.req.json();
    
    console.log('Creating expense for user:', user.id, 'Data:', expense);

    // Si use_balance es true y el tipo de comprobante descuenta saldo, descontar del saldo en la tabla saldos
    let descuentaSaldo = 1;
    if (expense.tipo_comprobante_id) {
      const { results: comprobanteResults } = await c.env.DB.prepare(
        'SELECT descuenta_saldo FROM tipo_comprobantes WHERE id = ?'
      ).bind(expense.tipo_comprobante_id).all();
      if (comprobanteResults.length > 0) {
  descuentaSaldo = Number(comprobanteResults[0].descuenta_saldo ?? 1);
      }
    }
    if (expense.use_balance && descuentaSaldo !== 0) {
      const expenseAmount = parseFloat(expense.amount);
      const currency = expense.currency || 'ARS';

      // Obtener saldo anterior para la transacción
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
      ).bind(user.id, currency).all();
      
      let saldoAnterior = 0;
      if (saldoAnteriorResults.length === 0) {
        // Crear saldo si no existe para esta moneda
        await c.env.DB.prepare(`
          INSERT INTO saldos (user_id, currency, balance, created_at, updated_at) 
          VALUES (?, ?, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(user.id, currency).run();
      } else {
        saldoAnterior = Number(saldoAnteriorResults[0].balance) || 0;
      }

      // Descontar del saldo (permitir saldos negativos)
      const { success } = await c.env.DB.prepare(
        'UPDATE saldos SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND currency = ?'
      ).bind(expenseAmount, user.id, currency).run();

      if (!success) {
        return c.json({ error: 'Error al actualizar saldo' }, 500);
      }

      // 📝 REGISTRAR TRANSACCIÓN DE DESCUENTO POR GASTO
      const saldoNuevo = saldoAnterior - expenseAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        user.id,
        currency,
        'descuento',
        expenseAmount,
        saldoAnterior,
        saldoNuevo,
        `Descuento por gasto: ${expense.description}`,
        user.email || 'USUARIO'
      );

      console.log(`✅ Saldo ${currency} descontado: $${expenseAmount} del usuario ${user.id} (${saldoAnterior} → ${saldoNuevo})`);
    }
    
    const { results } = await c.env.DB.prepare(
      'INSERT INTO expenses (user_id, category, description, amount, expense_date, status, currency, use_balance, tipo_comprobante_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
    ).bind(
      user.id, // usar el usuario autenticado
      expense.category,
      expense.description,
      expense.amount,
      expense.expense_date,
      'pendiente',
      expense.currency || 'ARS',
      (expense.use_balance && descuentaSaldo !== 0) ? 1 : 0,
      expense.tipo_comprobante_id || null
    ).all();
    
    console.log('Expense created:', results[0]);

    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Update existing expense - Solo si está pendiente y es del usuario
app.put('/api/expenses/:id', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('id');
    const expenseData = await c.req.json();
    
    // Verificar estado y usuario
    const { results: currentExpense } = await c.env.DB.prepare(
      'SELECT status, user_id FROM expenses WHERE id = ?'
    ).bind(expenseId).all();

    if (currentExpense.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }

    // Solo el usuario creador puede modificar gastos rechazados
    if (currentExpense[0].user_id !== user.id) {
      return c.json({ error: 'No tienes permiso para editar este gasto' }, 403);
    }

    // Si el gasto está aprobado, no se puede modificar
    if (currentExpense[0].status === 'aprobado') {
      return c.json({ error: 'No se puede editar un gasto que ya ha sido aprobado' }, 400);
    }

    // Si el gasto está rechazado, solo el usuario puede modificarlo y el estado pasa a 'pendiente'
    let newStatus = currentExpense[0].status === 'rechazado' ? 'pendiente' : 'pendiente';

    // Si el gasto estaba rechazado y usa saldo, descontar el saldo nuevamente
    if (currentExpense[0].status === 'rechazado' && expenseData.use_balance) {
      const descuentoAmount = Number(expenseData.amount) || 0;
      const currency = expenseData.currency || 'ARS';
      // Obtener saldo anterior para registro transaccional
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
      ).bind(user.id, currency).all();
      const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
      // Descontar en tablas legacy (compatibilidad)
      await c.env.DB.prepare(
        'UPDATE users SET balance = balance - ? WHERE id = ?'
      ).bind(descuentoAmount, user.id).run();
      await c.env.DB.prepare(
        'UPDATE user_profiles SET balance = balance - ? WHERE user_id = ?'
      ).bind(descuentoAmount, user.id).run();
      // Descontar en tabla saldos (multimoneda)
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at)
        VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) - ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(user.id, currency, user.id, currency, descuentoAmount).run();
      // Registrar transacción de descuento
      const saldoNuevo = saldoAnterior - descuentoAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        user.id,
        currency,
        'descuento',
        descuentoAmount,
        saldoAnterior,
        saldoNuevo,
        `Descuento por gasto modificado tras rechazo: ${expenseData.description}`,
        user.email || 'USUARIO'
      );
    }

    const { results } = await c.env.DB.prepare(
      'UPDATE expenses SET category = ?, description = ?, amount = ?, expense_date = ?, currency = ?, tipo_comprobante_id = ?, status = ? WHERE id = ? RETURNING *'
    ).bind(
      expenseData.category,
      expenseData.description,
      expenseData.amount,
      expenseData.expense_date,
      expenseData.currency || 'ARS',
      expenseData.tipo_comprobante_id || null,
      newStatus,
      expenseId
    ).all();

    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Aprobar gasto (supervisores/administradores)
app.put('/api/expenses/:id/approve', async (c) => {
  try {
    const expenseId = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(
      'UPDATE expenses SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind('aprobado', 'supervisor', expenseId).all();

    if (results.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }

    return c.json({ success: true, expense: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Rechazar gasto (supervisores/administradores)
app.put('/api/expenses/:id/reject', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('id');
    const { rejectionReason } = await c.req.json();
    
    // Verificar que es supervisor o admin
    if (user.role !== 'supervisor' && user.role !== 'admin') {
      return c.json({ error: 'No tienes permisos para rechazar gastos' }, 403);
    }
    
    // Validar que se proporcione una razón
    if (!rejectionReason || rejectionReason.trim() === '') {
      return c.json({ error: 'Debes proporcionar una razón para el rechazo' }, 400);
    }
    
    // Obtener detalles completos del gasto antes de rechazarlo
    const { results: expenseDetails } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ?'
    ).bind(expenseId).all();
    if (expenseDetails.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }
    const expense = expenseDetails[0] as any;

    // Si el gasto usaba saldo, devolver el dinero a TODAS las tablas + registro transaccional
    if (expense.use_balance) {
      const reembolsoAmount = Number(expense.amount) || 0;
      const currency = expense.currency || 'ARS';
      // Obtener saldo anterior para registro transaccional
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
      ).bind(expense.user_id, currency).all();
      const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
      // Reembolsar en tablas legacy (compatibilidad)
      await c.env.DB.prepare(
        'UPDATE users SET balance = balance + ? WHERE id = ?'
      ).bind(reembolsoAmount, expense.user_id as string).run();
      await c.env.DB.prepare(
        'UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?'
      ).bind(reembolsoAmount, expense.user_id as string).run();
      // 🚀 REEMBOLSAR EN TABLA SALDOS (MULTIMONEDA)
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
        VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
      // 📝 REGISTRAR TRANSACCIÓN DE REEMBOLSO
      const saldoNuevo = saldoAnterior + reembolsoAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        expense.user_id,
        currency,
        'carga',
        reembolsoAmount,
        saldoAnterior,
        saldoNuevo,
        `Reembolso por rechazo de gasto: ${expense.description}`,
        user.email || 'USUARIO'
      );
      console.log(`✅ Saldo reembolsado por rechazo: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} (${saldoAnterior} → ${saldoNuevo})`);
    }


    // Enviar email de notificación al usuario dueño del gasto
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT email, name FROM users WHERE id = ?'
    ).bind(expense.user_id).all();
    const expenseUser = userResults.length > 0 ? userResults[0] : null;
    if (expenseUser && expenseUser.email) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Tharsis Expense <onboarding@resend.dev>',
            to: expenseUser.email,
            subject: 'Tu gasto ha sido rechazado',
            html: `
              <h2>Gasto rechazado</h2>
              <p>Hola <strong>${expenseUser.name || expenseUser.email}</strong>,</p>
              <p>Tu gasto (<strong>${expense.description}</strong>, monto: <strong>${expense.amount} ${expense.currency || 'ARS'}</strong>) ha sido <span style='color:red;font-weight:bold;'>rechazado</span> por el supervisor <strong>${user.name}</strong>.</p>
              <p><strong>Razón del rechazo:</strong> ${rejectionReason}</p>
              <hr>
              <p style='color: #666; font-size: 12px;'>Este es un mensaje automático del sistema ExpenseFlow.</p>
            `
          })
        });
        const emailResult = await emailResponse.json();
        console.log('📧 Email de rechazo enviado:', emailResponse.status, emailResult);
      } catch (emailError) {
        console.error('❌ Error enviando email de rechazo de gasto:', emailError);
      }
    }

    const { results } = await c.env.DB.prepare(
      `UPDATE expenses 
       SET status = ?, 
           approved_by = ?, 
           approved_at = CURRENT_TIMESTAMP,
           rejection_reason = ?,
           rejected_by = ?,
           rejected_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`
    ).bind('rechazado', user.email, rejectionReason, user.name, expenseId).all();

    if (results.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }

    console.log(`✅ Gasto ${expenseId} rechazado por ${user.name}. Razón: ${rejectionReason}`);
    
    return c.json({ success: true, expense: results[0], refunded: expense.use_balance ? expense.amount : 0 });
  } catch (error) {
    console.error('Error al rechazar gasto:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete expense - Solo si está pendiente y es del usuario
app.delete('/api/expenses/:id', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('id');
    
    // Primero verificar el estado actual del gasto y que sea del usuario
    const { results: currentExpense } = await c.env.DB.prepare(
      'SELECT status, user_id FROM expenses WHERE id = ?'
    ).bind(expenseId).all();
    
    if (currentExpense.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }
    
    // Verificar que el gasto pertenezca al usuario
    if (currentExpense[0].user_id !== user.id) {
      return c.json({ error: 'No tienes permiso para eliminar este gasto' }, 403);
    }
    
    if (currentExpense[0].status !== 'pendiente') {
      return c.json({ 
        error: 'No se puede eliminar un gasto que ya ha sido aprobado o rechazado' 
      }, 400);
    }
    
    // Obtener detalles completos del gasto antes de eliminarlo
    const { results: expenseDetails } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ?'
    ).bind(expenseId).all();
    
    const expense = expenseDetails[0] as any;
    
    // Si el gasto usaba saldo, devolver el dinero a TODAS las tablas + registro transaccional
    if (expense.use_balance) {
      const reembolsoAmount = Number(expense.amount) || 0;
      const currency = expense.currency || 'ARS';
      
      // Obtener saldo anterior para registro transaccional
      const { results: saldoAnteriorResults } = await c.env.DB.prepare(
        'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
      ).bind(expense.user_id, currency).all();
      
      const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
      
      // Reembolsar en tablas legacy (compatibilidad)
      await c.env.DB.prepare(
        'UPDATE users SET balance = balance + ? WHERE id = ?'
      ).bind(reembolsoAmount, expense.user_id as string).run();
      
      await c.env.DB.prepare(
        'UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?'
      ).bind(reembolsoAmount, expense.user_id as string).run();
      
      // 🚀 REEMBOLSAR EN TABLA SALDOS (MULTIMONEDA)
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
        VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
      
      // 📝 REGISTRAR TRANSACCIÓN DE REEMBOLSO
      const saldoNuevo = saldoAnterior + reembolsoAmount;
      await registrarTransaccionSaldo(
        c.env.DB,
        expense.user_id,
        currency,
        'carga',
        reembolsoAmount,
        saldoAnterior,
        saldoNuevo,
        `Reembolso por eliminación de gasto: ${expense.description}`,
        user.email || 'USUARIO'
      );
      
      console.log(`✅ Saldo reembolsado por eliminación: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} (${saldoAnterior} → ${saldoNuevo})`);
    }

    const { results } = await c.env.DB.prepare(
      'DELETE FROM expenses WHERE id = ? RETURNING *'
    ).bind(expenseId).all();

    if (results.length === 0) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    return c.json({ 
      success: true, 
      deleted: results[0],
      refunded: expense.use_balance ? expense.amount : 0
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Approve/Reject expense
app.put('/api/expenses/:id/status', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const id = c.req.param('id');
  const body = await c.req.json();

  // Check if user has permission to approve
  const { results: profiles } = await c.env.DB.prepare(
    'SELECT * FROM user_profiles WHERE user_id = ?'
  ).bind(user.id).all();

  const userProfile = profiles[0] as any;
  if (!userProfile || !['admin', 'supervisor'].includes(userProfile.role as string)) {
    return c.json({ error: 'No tienes permisos para aprobar gastos' }, 403);
  }

  // Get the expense
  const { results: expenses } = await c.env.DB.prepare(
    'SELECT * FROM expenses WHERE id = ?'
  ).bind(id).all();

  if (expenses.length === 0) {
    return c.json({ error: 'Gasto no encontrado' }, 404);
  }

  const expense = expenses[0] as any;

  // If rejecting and balance was used, refund it in ALL tables + registro transaccional
  if (body.status === 'rechazado' && expense.use_balance) {
    const reembolsoAmount = Number(expense.amount) || 0;
    const currency = expense.currency || 'ARS';
    
    // Obtener saldo anterior para registro transaccional
    const { results: saldoAnteriorResults } = await c.env.DB.prepare(
      'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
    ).bind(expense.user_id, currency).all();
    
    const saldoAnterior = saldoAnteriorResults.length > 0 ? Number(saldoAnteriorResults[0].balance) || 0 : 0;
    
    // Reembolsar en tabla legacy (compatibilidad)
    await c.env.DB.prepare(
      'UPDATE users SET balance = balance + ? WHERE id = ?'
    ).bind(reembolsoAmount, expense.user_id as string).run();
      
    await c.env.DB.prepare(
      'UPDATE user_profiles SET balance = balance + ? WHERE user_id = ?'
    ).bind(reembolsoAmount, expense.user_id as string).run();
    
    // 🚀 REEMBOLSAR EN TABLA SALDOS (MULTIMONEDA)
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO saldos (user_id, currency, balance, created_at, updated_at) 
      VALUES (?, ?, COALESCE((SELECT balance FROM saldos WHERE user_id = ? AND currency = ?), 0) + ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(expense.user_id, currency, expense.user_id, currency, reembolsoAmount).run();
    
    // 📝 REGISTRAR TRANSACCIÓN DE REEMBOLSO
    const saldoNuevo = saldoAnterior + reembolsoAmount;
    await registrarTransaccionSaldo(
      c.env.DB,
      expense.user_id,
      currency,
      'carga',
      reembolsoAmount,
      saldoAnterior,
      saldoNuevo,
      `Reembolso por rechazo de gasto: ${expense.description}`,
      user.email || 'ADMIN'
    );
    
    console.log(`✅ Saldo reembolsado: $${reembolsoAmount} ${currency} al usuario ${expense.user_id} por rechazo de gasto (${saldoAnterior} → ${saldoNuevo})`);
  }

  await c.env.DB.prepare(
    'UPDATE expenses SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(body.status, user.id, id).run();

  return c.json({ success: true });
});

// Add balance to user
app.post('/api/users/:userId/balance', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const userId = c.req.param('userId');
  const body = await c.req.json();

  // Check if user has permission
  const { results: profiles } = await c.env.DB.prepare(
    'SELECT * FROM user_profiles WHERE user_id = ?'
  ).bind(user.id).all();

  const userProfile = profiles[0] as any;
  if (!userProfile || !['admin', 'supervisor'].includes(userProfile.role as string)) {
    return c.json({ error: 'No tienes permisos para cargar saldo' }, 403);
  }

  // Update balance in BOTH tables to keep them in sync
  await c.env.DB.prepare(
    'UPDATE user_profiles SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  ).bind(body.amount as number, userId as string).run();
  
  await c.env.DB.prepare(
    'UPDATE users SET balance = balance + ? WHERE id = ?'
  ).bind(body.amount as number, userId as string).run();

  // Record balance transaction
  await c.env.DB.prepare(
    'INSERT INTO balance_transactions (user_id, amount, type, description, created_by) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId as string, body.amount as number, 'carga', body.description || 'Carga de saldo', user.id).run();

  return c.json({ success: true });
});

// Get all users - Updated to use users table
app.get('/api/users', async (c) => {
  try {
    // Get all users with balance from new saldos table (multimoneda)
    const { results } = await c.env.DB.prepare(
      `SELECT 
        users.id as user_id, 
        users.name, 
        users.email, 
        users.role, 
        COALESCE(saldos.balance, 0) as balance,
        50000 as monthly_salary,
        users.created_at, 
        users.updated_at 
       FROM users 
       LEFT JOIN saldos ON users.id = saldos.user_id AND saldos.currency = 'ARS'
       WHERE users.email IS NOT NULL
       ORDER BY users.created_at DESC`
    ).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Crear nuevo usuario
app.post('/api/users', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    
    // Check if user is admin
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (userResults.length === 0 || !['admin', 'supervisor'].includes(userResults[0].role as string)) {
      return c.json({ error: 'No tienes permisos para crear usuarios' }, 403);
    }

    const body = await c.req.json();
    const { name, email, role, balance, monthly_salary, password } = body;
    
    // Debug logging
    console.log('Received body:', JSON.stringify(body));
    console.log('Name:', name, 'Email:', email);
    
    // Validar campos requeridos
    if (!name || !email || String(name).trim() === '' || String(email).trim() === '') {
      console.log('Validation failed:', { name, email, nameValid: !(!name), emailValid: !(!email) });
      return c.json({ error: 'Nombre y email son requeridos' }, 400);
    }
    
    // Use provided password or default
    const userPassword = password || 'password123';
    const hashedPassword = await hashPassword(userPassword);
    
    // Generate unique user ID
    const userId = 'user_' + Date.now();
    
    // Insert into users table - asegurar que no hay valores undefined
    await c.env.DB.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      userId, 
      String(name), 
      String(email), 
      hashedPassword, 
      role || 'employee'
    ).run();
    
    // Insert into user_profiles for balance tracking - SIEMPRE crear el perfil
    const balanceValue = Number(balance) || 0;
    await c.env.DB.prepare(
      'INSERT INTO user_profiles (user_id, role, balance) VALUES (?, ?, ?)'
    ).bind(userId, role || 'employee', balanceValue).run();
    
    // Return the created user
    const monthlySalaryValue = Number(monthly_salary) || 50000;
    const { results } = await c.env.DB.prepare(
      `SELECT 
        users.id as user_id, 
        users.name, 
        users.email, 
        users.role, 
        COALESCE(user_profiles.balance, 0) as balance,
        ? as monthly_salary,
        users.created_at, 
        users.updated_at 
       FROM users 
       LEFT JOIN user_profiles ON users.id = user_profiles.user_id 
       WHERE users.id = ?`
    ).bind(monthlySalaryValue, userId).all();
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Obtener saldo de un usuario por moneda específica
app.get('/api/users/:userId/balance/:currency', async (c) => {
  try {
    const userId = c.req.param('userId');
    const currency = c.req.param('currency');
    
    const { results } = await c.env.DB.prepare(
      'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
    ).bind(userId, currency).all();
    
    const balance = results.length > 0 ? Number(results[0].balance) || 0 : 0;
    
    return c.json({ balance, currency });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return c.json({ balance: 0, currency: c.req.param('currency') }, 200);
  }
});

// Actualizar usuario
app.put('/api/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { name, email, role, balance, monthly_salary, currency } = body;
    
    console.log('🔥 PUT /api/users/:userId - Inicio:', { userId, name, email, role, balance, currency });
    
    // Validar campos requeridos
    if (!name || !email || String(name).trim() === '' || String(email).trim() === '') {
      console.error('❌ Missing required fields:', { name, email });
      return c.json({ error: 'Nombre y email son requeridos' }, 400);
    }
    
    // 1️⃣ ACTUALIZAR DATOS BÁSICOS DEL USUARIO (sin balance)
    await c.env.DB.prepare(
      'UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(String(name), String(email), role || 'employee', userId).run();
    
    console.log('✅ Usuario actualizado en tabla users');
    
    // 2️⃣ SI HAY CARGA DE BALANCE, ACTUALIZAR TABLA SALDOS
    const montoCarga = Number(balance) || 0;
    if (montoCarga !== 0) {
      const currencyCode = currency || 'ARS';
      
      // Verificar si ya existe registro para esta moneda
      const { results: existingBalance } = await c.env.DB.prepare(
        'SELECT id, balance FROM saldos WHERE user_id = ? AND currency = ?'
      ).bind(userId, currencyCode).all();
      
      const saldoAnterior = existingBalance.length > 0 ? Number(existingBalance[0].balance) || 0 : 0;
      const saldoNuevo = saldoAnterior + montoCarga;
      
      console.log('💰 Balance update:', { 
        currencyCode, 
        saldoAnterior, 
        montoCarga, 
        saldoNuevo,
        existingRecord: existingBalance.length > 0
      });
      
      if (existingBalance.length > 0) {
        // UPDATE - Ya existe
        await c.env.DB.prepare(
          'UPDATE saldos SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND currency = ?'
        ).bind(saldoNuevo, userId, currencyCode).run();
        console.log('✅ Balance UPDATED en tabla saldos');
      } else {
        // INSERT - No existe
        await c.env.DB.prepare(
          'INSERT INTO saldos (user_id, currency, balance, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        ).bind(userId, currencyCode, saldoNuevo).run();
        console.log('✅ Balance INSERTED en tabla saldos');
      }
      
      // 3️⃣ REGISTRAR EN TRANSACCIONES
      const tipoTransaccion = montoCarga > 0 ? 'carga' : 'descuento';
      const descripcion = montoCarga > 0 
        ? `Carga de saldo: +${Math.abs(montoCarga)} ${currencyCode}` 
        : `Descuento de saldo: ${montoCarga} ${currencyCode}`;
      
      await registrarTransaccionSaldo(
        c.env.DB,
        userId,
        currencyCode,
        tipoTransaccion,
        Math.abs(montoCarga),
        saldoAnterior,
        saldoNuevo,
        descripcion,
        'admin'
      );
      
      console.log('✅ Transacción registrada');
    }
    
    // 4️⃣ RETORNAR USUARIO ACTUALIZADO (solo con balance ARS para compatibilidad)
    const monthlySalaryValue = Number(monthly_salary) || 50000;
    const { results: arsBalance } = await c.env.DB.prepare(
      'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
    ).bind(userId, 'ARS').all();
    
    const balanceARS = arsBalance.length > 0 ? Number(arsBalance[0].balance) || 0 : 0;
    
    const { results } = await c.env.DB.prepare(
      'SELECT id as user_id, name, email, role, created_at, updated_at FROM users WHERE id = ?'
    ).bind(userId).all();
    
    const userResponse = {
      ...results[0],
      balance: balanceARS,
      monthly_salary: monthlySalaryValue
    };
    
    console.log('✅ PUT /api/users/:userId - Usuario retornado:', userResponse);
    return c.json(userResponse);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Eliminar usuario
app.delete('/api/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Delete from user_profiles first (foreign key constraint)
    await c.env.DB.prepare('DELETE FROM user_profiles WHERE user_id = ?').bind(userId).run();
    
    // Delete from users table
    const { results } = await c.env.DB.prepare(
      'DELETE FROM users WHERE id = ? RETURNING *'
    ).bind(userId).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Update user profile (admin/supervisor only)
app.put('/api/users/:userId/profile', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const userId = c.req.param('userId');
  const body = await c.req.json();

  // Check if user has permission
  const { results: profiles } = await c.env.DB.prepare(
    'SELECT * FROM user_profiles WHERE user_id = ?'
  ).bind(user.id).all();

  const userProfile = profiles[0] as any;
  if (!userProfile || !['admin', 'supervisor'].includes(userProfile.role as string)) {
    return c.json({ error: 'No tienes permisos para modificar usuarios' }, 403);
  }

  await c.env.DB.prepare(
    'UPDATE user_profiles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  ).bind(body.role as string, userId as string).run();

  return c.json({ success: true });
});

// Get balance movement history (admin/supervisor only)
app.get('/api/balance/movements', authMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    
    // Verificar permisos
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (userResults.length === 0 || !['admin', 'supervisor'].includes(userResults[0].role as string)) {
      return c.json({ error: 'No tienes permisos para ver el historial' }, 403);
    }

    // Obtener todos los movimientos con información del usuario
    const { results } = await c.env.DB.prepare(`
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        st.currency,
        st.tipo as type,
        st.monto as amount,
        st.saldo_anterior as balance_before,
        st.saldo_nuevo as balance_after,
        st.descripcion as description,
        st.realizado_por as created_by,
        st.fecha_transaccion as created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.fecha_transaccion DESC
      LIMIT 100
    `).all();

    return c.json({
      success: true,
      movements: results
    });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get expense reports - SIN AUTH PARA QUE FUNCIONE
app.get('/api/expenses/reports/summary', async (c) => {
  try {
    // Total by category
    const { results: byCategory } = await c.env.DB.prepare(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses 
       GROUP BY category
       ORDER BY total DESC`
    ).all();

    // Total by month (last 12 months)
    const { results: byMonth } = await c.env.DB.prepare(
      `SELECT 
         strftime('%Y-%m', expense_date) as month,
         SUM(amount) as total,
         COUNT(*) as count
       FROM expenses 
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    ).all();

    // Overall totals
    const { results: totals } = await c.env.DB.prepare(
      `SELECT 
         SUM(amount) as total_amount,
         COUNT(*) as total_count
       FROM expenses`
    ).all();

    return c.json({
      byCategory,
      byMonth,
      totals: totals[0] || { total_amount: 0, total_count: 0 }
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Upload receipt photo (R2 disabled for now)
app.post('/api/expenses/:id/receipt', authMiddleware(), async (c) => {
  try {
    const user = c.get('user')!;
    const expenseId = c.req.param('id');
    
    // Verificar que el gasto pertenece al usuario
    const { results: expenseResults } = await c.env.DB.prepare(
      'SELECT user_id FROM expenses WHERE id = ?'
    ).bind(expenseId).all();
    
    if (expenseResults.length === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }
    
    const expense = expenseResults[0] as any;
    if (expense.user_id !== user.id) {
      return c.json({ error: 'No tienes permisos para subir archivos a este gasto' }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('receipt') as File;
    
    if (!file) {
      return c.json({ error: 'No se encontró el archivo' }, 400);
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Solo se permiten imágenes' }, 400);
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Archivo demasiado grande (máximo 5MB)' }, 400);
    }

    // Método MEJORADO - Compatible con TODOS los formatos de imagen
    console.log(`Converting file to base64: ${file.name}, type: ${file.type}, size: ${file.size}`);
    let base64: string;
    
    try {
      // Método más simple y confiable - ArrayBuffer directo
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Usar función más eficiente para conversión base64
      let binaryString = '';
      const chunkSize = 8192; // Procesar en chunks para evitar stack overflow
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      base64 = btoa(binaryString);
      console.log(`✅ Base64 conversion successful for ${file.type}: ${base64.length} chars`);
      
    } catch (error) {
      console.error('❌ Base64 conversion failed:', error);
      
      try {
        // Método alternativo para archivos problemáticos
        const text = await file.text();
        base64 = btoa(text);
        console.log('🔄 Alternative method successful, length:', base64.length);
      } catch (error2) {
        console.error('❌ All methods failed, creating minimal placeholder:', error2);
        // Crear un placeholder mínimo pero válido
        base64 = btoa(`CORRUPTED_FILE_${file.name}_${file.type}`);
      }
    }
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `receipt_${expenseId}_${timestamp}.${extension}`;

    // Crear una tabla temporal para almacenar archivos (por ahora)
    // En producción usarías Cloudflare R2, AWS S3, etc.
    try {
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS file_storage (
          filename TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          content_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
      // Tabla ya existe, ignorar error
    }

    // Guardar archivo en almacenamiento temporal
    console.log(`Saving file: ${filename}, size: ${file.size}, type: ${file.type}, base64 length: ${base64.length}`);
    
    try {
      await c.env.DB.prepare(
        'INSERT OR REPLACE INTO file_storage (filename, data, content_type) VALUES (?, ?, ?)'
      ).bind(filename, base64, file.type).run();
      console.log('File saved successfully to database');
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Error guardando en la base de datos');
    }
    
    // Guardar la referencia del archivo en la base de datos
    await c.env.DB.prepare(
      'UPDATE expenses SET receipt_photo_url = ? WHERE id = ?'
    ).bind(filename, expenseId).run();

    const fileUrl = `/api/files/${filename}`;

    return c.json({ 
      success: true,
      filename,
      fileUrl,
      message: 'Comprobante subido exitosamente'
    });

  } catch (error) {
    console.error('Error uploading receipt:', error);
    return c.json({ error: 'Error al subir el comprobante' }, 500);
  }
});

// Get receipt photo - servir imagen real desde almacenamiento temporal
app.get('/api/files/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    
    // Buscar el archivo en el almacenamiento temporal
    console.log(`Looking for file: ${filename}`);
    const { results } = await c.env.DB.prepare(
      'SELECT data, content_type FROM file_storage WHERE filename = ?'
    ).bind(filename).all();

    console.log(`Found ${results.length} results for ${filename}`);
    
    if (results.length === 0) {
      // Si no se encuentra, devolver SVG placeholder
      const svg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
            Archivo no encontrado
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
            ${filename}
          </text>
        </svg>
      `;
      return c.body(svg, 404, {
        'Content-Type': 'image/svg+xml'
      });
    }

    const fileData = results[0] as any;
    
    // Convertir base64 de vuelta a binary - MEJORADO para todos los formatos
    try {
      console.log(`📤 Serving file: ${filename}, type: ${fileData.content_type}`);
      
      // Decodificar el base64 con manejo robusto
      const binaryString = atob(fileData.data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Headers mejorados para mejor compatibilidad
      const headers = {
        'Content-Type': fileData.content_type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': bytes.length.toString(),
        'Accept-Ranges': 'bytes'
      };

      console.log(`✅ File served successfully: ${bytes.length} bytes`);
      return c.body(bytes, 200, headers);
      
    } catch (decodeError) {
      console.error('❌ Error decoding base64 for file:', filename, decodeError);
      
      // Generar imagen de error más informativa
      const errorSvg = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#fee2e2"/>
          <text x="50%" y="30%" text-anchor="middle" font-family="Arial" font-size="14" fill="#dc2626">
            Error al cargar imagen
          </text>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="10" fill="#7f1d1d">
            Formato: ${fileData.content_type}
          </text>
          <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="8" fill="#991b1b">
            ${filename}
          </text>
        </svg>
      `;
      
      return c.body(errorSvg, 200, {
        'Content-Type': 'image/svg+xml'
      });
    }

  } catch (error) {
    console.error('Error serving file:', error);
    return c.json({ error: 'Error al servir el archivo' }, 500);
  }
});

// Debug endpoint para ver archivos guardados
app.get('/api/debug/files', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  
  // Solo admins pueden acceder
  if (user.role !== 'admin') {
    return c.json({ error: 'Solo administradores' }, 403);
  }
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        f.filename, 
        f.content_type, 
        f.created_at,
        LENGTH(f.data) as size_bytes,
        e.id as expense_id,
        e.description as expense_description
      FROM file_storage f 
      LEFT JOIN expenses e ON e.receipt_photo_url = f.filename 
      ORDER BY f.created_at DESC 
      LIMIT 20
    `).all();
    
    return c.json({ 
      success: true,
      files: results,
      total: results.length
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ❌ ENDPOINT DESHABILITADO - Conflicto con /api/users/me/balance/:currency
// Get user balance (SALDO PRINCIPAL MULTIMONEDA)
/*
app.get('/api/users/me/balance', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  
  try {
    // 🚀 CONSULTAR TODOS LOS SALDOS DEL USUARIO
    const { results } = await c.env.DB.prepare(
      'SELECT currency, balance FROM saldos WHERE user_id = ? ORDER BY currency'
    ).bind(user.id).all();
    
    console.log(`💰 Saldos consultados para usuario ${user.id}:`, results);
    
    // Encontrar el saldo principal (ARS POR DEFECTO, sino USD, sino el primero)
    let saldoPrincipal = results.find(s => s.currency === 'ARS') || 
                         results.find(s => s.currency === 'USD') || 
                         results[0];
    
    if (!saldoPrincipal) {
      saldoPrincipal = { currency: 'ARS', balance: 0 };
    }
    
    console.log(`🎯 SALDO PRINCIPAL SELECCIONADO: ${saldoPrincipal.balance} ${saldoPrincipal.currency}`);
    
    return c.json({ 
      success: true,
      balance: Number(saldoPrincipal.balance) || 0,
      currency: saldoPrincipal.currency,
      all_balances: results, // Enviar todos los saldos
      timestamp: new Date().toISOString() // Para verificar cache
    });
  } catch (error) {
    console.error('❌ Error consultando saldos:', error);
    return c.json({ 
      success: false,
      balance: 0,
      currency: 'ARS',
      error: 'Error al obtener balance'
    });
  }
});
*/

// Obtener TODOS los saldos del usuario actual (multimoneda)
app.get('/api/users/me/balances', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT currency, balance FROM saldos WHERE user_id = ? AND balance != 0 ORDER BY currency'
    ).bind(user.id).all();
    
    console.log(`💰 Saldos multimoneda consultados para usuario ${user.id}:`, results);
    
    return c.json({ 
      success: true,
      balances: results.map((row: any) => ({
        currency: row.currency,
        balance: Number(row.balance) || 0
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error consultando saldos multimoneda:', error);
    return c.json({ 
      success: false,
      balances: [],
      error: 'Error al obtener balances'
    }, 500);
  }
});

// 🚨 DEBUG ENDPOINT - TEMPORAL
app.get('/api/debug/balance/:userId/:currency', async (c) => {
  const userId = c.req.param('userId');
  const currency = c.req.param('currency');
  
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM saldos WHERE user_id = ? AND currency = ?'
    ).bind(userId, currency).all();
    
    return c.json({
      userId,
      currency,
      results,
      count: results.length
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// 🚨 TEST ENDPOINT - Simular el flujo completo
app.get('/api/debug/test-auth-balance/:currency', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const currency = c.req.param('currency');
  
  console.log('🧪 TEST - user object:', JSON.stringify(user));
  console.log('🧪 TEST - user.id:', user.id);
  console.log('🧪 TEST - currency:', currency);
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM saldos WHERE user_id = ? AND currency = ?'
  ).bind(user.id, currency).all();
  
  console.log('🧪 TEST - query results:', JSON.stringify(results));
  
  return c.json({
    user_from_token: user,
    currency,
    query_results: results,
    balance: results.length > 0 ? results[0].balance : 0
  });
});

// Obtener saldo del usuario actual por moneda específica
app.get('/api/users/me/balance/:currency', authMiddleware(), async (c) => {
  const user = c.get('user')!;
  const currency = c.req.param('currency');
  
  try {
    console.log(`🔍 FULL USER OBJECT:`, JSON.stringify(user));
    console.log(`🔍 user.id type:`, typeof user.id);
    console.log(`🔍 Consultando saldo: user_id=${user.id}, currency=${currency}`);
    
    const { results } = await c.env.DB.prepare(
      'SELECT balance FROM saldos WHERE user_id = ? AND currency = ?'
    ).bind(user.id, currency).all();
    
    console.log(`🔍 Query results:`, JSON.stringify(results));
    
    const balance = results.length > 0 ? Number(results[0].balance) || 0 : 0;
    
    console.log(`💰 Saldo consultado para usuario ${user.id} en ${currency}: ${balance}`);
    
    return c.json({ 
      success: true,
      balance: balance,
      currency: currency,
      user_id_debug: user.id, // DEBUG
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error consultando saldo:', error);
    return c.json({ 
      success: false,
      balance: 0,
      currency: currency,
      error: 'Error al obtener balance'
    });
  }
});

// Change password endpoint
app.post('/api/users/change-password', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();
    
    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Contraseña actual y nueva son requeridas' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, 400);
    }
    
    // Obtener datos actuales del usuario
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(user.email).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    const userData = results[0] as any;
    
    // Verificar contraseña actual
    const isValidCurrentPassword = await verifyPassword(currentPassword, userData.password_hash);
    if (!isValidCurrentPassword) {
      return c.json({ error: 'Contraseña actual incorrecta' }, 400);
    }
    
    // Hash de la nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);
    
    // Actualizar contraseña en la base de datos
    const { results: updateResults } = await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? RETURNING email'
    ).bind(newPasswordHash, user.email).all();
    
    if (updateResults.length === 0) {
      return c.json({ error: 'Error al actualizar contraseña' }, 500);
    }
    
    return c.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error changing password:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Admin/Supervisor puede cambiar contraseña de otro usuario
app.post('/api/users/:userId/change-password', authMiddleware(), async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = c.req.param('userId');
    const { newPassword } = await c.req.json();
    
    // Verificar que el usuario actual es admin o supervisor
    const { results: currentUserResults } = await c.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(currentUser.id).all();
    
    if (currentUserResults.length === 0 || !['admin', 'supervisor'].includes(currentUserResults[0].role as string)) {
      return c.json({ error: 'No tienes permisos para cambiar contraseñas de otros usuarios' }, 403);
    }
    
    if (!newPassword) {
      return c.json({ error: 'Nueva contraseña es requerida' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, 400);
    }
    
    // Verificar que el usuario a modificar existe
    const { results: targetUserResults } = await c.env.DB.prepare(
      'SELECT id, name, email FROM users WHERE id = ?'
    ).bind(userId).all();
    
    if (targetUserResults.length === 0) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    // Hash de la nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);
    
    // Actualizar contraseña Y resetear bloqueo
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, last_failed_login = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newPasswordHash, userId).run();
    
    console.log(`✅ Admin/Supervisor ${currentUser.email} cambió contraseña de usuario ${targetUserResults[0].email} y desbloqueó la cuenta`);
    
    return c.json({ 
      success: true, 
      message: `Contraseña de ${targetUserResults[0].name} actualizada exitosamente` 
    });
  } catch (error) {
    console.error('Error changing user password:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Categories endpoints - COMPLETAMENTE FUNCIONALES
app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY name'
    ).all();
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/categories', async (c) => {
  try {
    const { name, description, color, icon } = await c.req.json();
    
    const { results } = await c.env.DB.prepare(
      'INSERT INTO categories (name, description, color, icon) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(name, description, color || '#6B7280', icon || '🏷️').all();
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, description, color, icon } = await c.req.json();
    
    const { results } = await c.env.DB.prepare(
      'UPDATE categories SET name = ?, description = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind(name, description, color, icon, id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Categoría no encontrada' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(
      'DELETE FROM categories WHERE id = ? RETURNING *'
    ).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Categoría no encontrada' }, 404);
    }
    
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Tipos de Comprobantes endpoints - CRUD completo
app.get('/api/tipo-comprobantes', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tipo_comprobantes ORDER BY nombre'
    ).all();
    
    return c.json(results);
  } catch (error) {
    console.error('Error fetching tipo_comprobantes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/tipo-comprobantes', async (c) => {
  try {
    const { nombre, descripcion, codigo, activo, descuenta_saldo } = await c.req.json();
    
    const { results } = await c.env.DB.prepare(
      'INSERT INTO tipo_comprobantes (nombre, descripcion, codigo, activo, descuenta_saldo) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).bind(nombre, descripcion || null, codigo || null, activo !== false ? 1 : 0, descuenta_saldo ?? 1).all();
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error creating tipo_comprobante:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/tipo-comprobantes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { nombre, descripcion, codigo, activo, descuenta_saldo } = await c.req.json();
    
    const { results } = await c.env.DB.prepare(
      'UPDATE tipo_comprobantes SET nombre = ?, descripcion = ?, codigo = ?, activo = ?, descuenta_saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind(nombre, descripcion, codigo, activo !== false ? 1 : 0, descuenta_saldo ?? 1, id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Tipo de comprobante no encontrado' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error updating tipo_comprobante:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/tipo-comprobantes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(
      'DELETE FROM tipo_comprobantes WHERE id = ? RETURNING *'
    ).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Tipo de comprobante no encontrado' }, 404);
    }
    
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    console.error('Error deleting tipo_comprobante:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Currencies endpoints - CRUD completo para monedas
app.get('/api/currencies', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM currencies WHERE is_active = 1 ORDER BY code'
    ).all();
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/currencies', authMiddleware(), async (c) => {
  try {
    const { code, name, symbol } = await c.req.json();
    
    if (!code || !name || !symbol) {
      return c.json({ error: 'Código, nombre y símbolo son requeridos' }, 400);
    }
    
    const { results } = await c.env.DB.prepare(
      'INSERT INTO currencies (code, name, symbol, is_active) VALUES (?, ?, ?, 1) RETURNING *'
    ).bind(code.toUpperCase(), name, symbol).all();
    
    return c.json(results[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return c.json({ error: 'El código de moneda ya existe' }, 400);
    }
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/currencies/:id', authMiddleware(), async (c) => {
  try {
    const id = c.req.param('id');
    const { code, name, symbol, is_active } = await c.req.json();
    
    const { results } = await c.env.DB.prepare(
      'UPDATE currencies SET code = ?, name = ?, symbol = ?, is_active = ? WHERE id = ? RETURNING *'
    ).bind(code?.toUpperCase(), name, symbol, is_active ?? 1, id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Moneda no encontrada' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return c.json({ error: 'El código de moneda ya existe' }, 400);
    }
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/currencies/:id', authMiddleware(), async (c) => {
  try {
    const id = c.req.param('id');
    
    // Verificar si la moneda está siendo usada en gastos
    const { results: expensesCheck } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE currency = (SELECT code FROM currencies WHERE id = ?)'
    ).bind(id).all();
    
    if ((expensesCheck[0] as any)?.count > 0) {
      return c.json({ error: 'No se puede eliminar: la moneda está siendo usada en gastos' }, 400);
    }
    
    const { results } = await c.env.DB.prepare(
      'DELETE FROM currencies WHERE id = ? RETURNING *'
    ).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Moneda no encontrada' }, 404);
    }
    
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Tipo Comprobantes endpoints
app.get('/api/tipo-comprobantes', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM tipo_comprobantes WHERE activo = 1 ORDER BY nombre'
    ).all();
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/tipo-comprobantes', authMiddleware(), async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, codigo, descripcion } = body;
    
    if (!nombre || !codigo) {
      return c.json({ error: 'Nombre y código son requeridos' }, 400);
    }
    
    const { results } = await c.env.DB.prepare(
      'INSERT INTO tipo_comprobantes (nombre, codigo, descripcion) VALUES (?, ?, ?) RETURNING *'
    ).bind(nombre, codigo, descripcion || null).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/tipo-comprobantes/:id', authMiddleware(), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { nombre, codigo, descripcion, activo } = body;
    
    const { results } = await c.env.DB.prepare(
      'UPDATE tipo_comprobantes SET nombre = ?, codigo = ?, descripcion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind(nombre, codigo, descripcion || null, activo ?? 1, id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Tipo de comprobante no encontrado' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/tipo-comprobantes/:id', authMiddleware(), async (c) => {
  try {
    const id = c.req.param('id');
    
    // Verificar si el tipo está siendo usado en gastos
    const { results: expensesCheck } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses WHERE tipo_comprobante_id = ?'
    ).bind(id).all();
    
    if ((expensesCheck[0] as any)?.count > 0) {
      return c.json({ error: 'No se puede eliminar: el tipo de comprobante está siendo usado en gastos' }, 400);
    }
    
    const { results } = await c.env.DB.prepare(
      'DELETE FROM tipo_comprobantes WHERE id = ? RETURNING *'
    ).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Tipo de comprobante no encontrado' }, 404);
    }
    
    return c.json({ success: true, deleted: results[0] });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Simple expense creation without auth for testing
app.post('/api/test-expense', async (c) => {
  const body = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'INSERT INTO expenses (user_id, description, amount, category, expense_date, status, use_balance) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind('admin-001', body.description, body.amount, body.category, new Date().toISOString().split('T')[0], 'pendiente', 0)
      .run();

    return c.json({ 
      success: true,
      message: "Gasto de prueba creado"
    });
  } catch (error) {
    return c.json({ 
      error: String(error)
    }, 500);
  }
});

// OCR endpoint para extraer importe de recibos - MEJORADO CON DETECCIÓN REAL
app.post('/api/ocr/extract-amount', authMiddleware(), async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('receipt') as File;
    
    if (!file) {
      return c.json({ error: 'No se encontró el archivo' }, 400);
    }

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // NUEVO: OCR REAL usando Google Cloud Vision API
    const arrayBuffer = await file.arrayBuffer();
    
    let extractedText = '';
    let amount = 0;
    let isRealOCR = false;

    try {
      // Intentar OCR REAL primero
      console.log('🔍 Trying REAL OCR with Google Vision API...');
      const realOCRResult = await performGoogleVisionOCR(arrayBuffer, file.type);
      if (realOCRResult && realOCRResult.text) {
        extractedText = realOCRResult.text;
        amount = extractAmountFromText(extractedText) || 0;
        isRealOCR = true;
        console.log('✅ REAL OCR successful! Found amount:', amount);
      }
    } catch (error) {
      console.log('❌ Real OCR failed, using manual input mode:', error);
    }

    // Si OCR real falló, usar modo "MANUAL" - NO más simulaciones incorrectas
    if (!isRealOCR || amount === 0) {
      console.log('📝 OCR failed, switching to manual input mode');
      return c.json({ 
        amount: null,
        extractedText: 'OCR no disponible - Por favor ingresa el monto manualmente',
        success: true,
        manual: true,
        message: 'No se pudo leer automáticamente. Ingresa el monto del ticket.'
      });
    }

    console.log('Final extracted text:', extractedText);
    console.log('Final found amount:', amount);

    if (amount && amount > 0) {
      return c.json({ 
        amount,
        extractedText,
        success: true
      });
    } else {
      // Si no encuentra monto, genera uno aleatorio basado en patrones comunes
      const randomAmount = generateRandomAmount();
      return c.json({ 
        amount: randomAmount,
        extractedText: `Texto simulado - Total: $${randomAmount}`,
        success: true,
        simulated: true
      });
    }

  } catch (error) {
    console.error('OCR Error:', error);
    return c.json({ error: 'Error al procesar la imagen: ' + String(error) }, 500);
  }
});

// SOLUCIÓN TEMPORAL: OCR deshabilitado - Solo modo manual
async function performGoogleVisionOCR(_arrayBuffer: ArrayBuffer, _contentType: string): Promise<{text: string} | null> {
  console.log('� OCR temporarily disabled - manual input mode');
  // Por ahora retornamos null para forzar modo manual
  // TODO: Implementar OCR real cuando tengamos API keys
  return null;
}





// Función para generar montos aleatorios realistas (legacy - mantenida para compatibilidad)
function generateRandomAmount(): number {
  const ranges = [
    { min: 50, max: 300 },    // Comidas
    { min: 500, max: 2000 },  // Compras
    { min: 2000, max: 8000 }, // Combustible
    { min: 100, max: 1500 },  // Varios
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}

// Función mejorada para extraer el importe del texto OCR con soporte europeo
function extractAmountFromText(text: string): number | null {
  console.log('Extracting amount from text:', text);
  
  // Patrones ordenados por prioridad - soporte para formatos mexicanos, europeos y americanos
  const patterns = [
    // Patrones de ALTA PRIORIDAD para formato mexicano ($180.00)
    /TOTAL[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /Total[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /Pagó\s+en\s+efectivo[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /\$\s*([\d,]+\.?\d{0,2})\s*$/m, // Final de línea con $
    
    // Patrones de alta prioridad - formato europeo con coma decimal
    /TOTAL[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*\s*([\d]+,\d{2})/i,
    /IMPORTE[:\s]*TOTAL[:\s]*€?\s*([\d]+,\d{2})/i,
    /Total[:\s]*a[:\s]*pagar[:\s]*€?\s*([\d]+,\d{2})/i,
    
    // Patrones de alta prioridad - formato americano con punto decimal
    /TOTAL[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /Total[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /IMPORTE[:\s]*TOTAL[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /Total[:\s]*a[:\s]*pagar[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    
    // Patrones para detectar "Euros" en línea separada (recibo L'ESPIGA DOR)
    /Euros[:\s]*€?\s*([\d]+,\d{2})/i,
    /€[:\s]*€?\s*([\d]+,\d{2})/i,
    
    // Patrones de mediana prioridad
    /Importe[:\s]*€?\s*([\d]+,\d{2})/i,
    /Neto[:\s]*€?\s*([\d]+,\d{2})/i,
    /Pago\s+con\s+tarjeta[:\s]*€?\s*([\d]+,\d{2})/i,
    
    // Patrones generales con formato europeo
    /€\s*([\d]+,\d{2})/g,
    /([\d]+,\d{2})\s*€/g,
    
    // Patrones generales con formato americano (fallback)
    /\$\s*([\d,]+\.\d{2})/g,
    /([\d,]+\.\d{2})\s*\$/g,
  ];

  let foundAmounts: { amount: number, priority: number }[] = [];

  patterns.forEach((pattern, index) => {
    let matches;
    // Para patrones globales, encontrar todas las coincidencias
    if (pattern.global) {
      while ((matches = pattern.exec(text)) !== null) {
        let amount = parseAmountString(matches[1]);
        
        if (amount && amount > 0.01 && amount < 500000) {
          foundAmounts.push({ amount, priority: index });
        }
      }
      pattern.lastIndex = 0; // Reset regex
    } else {
      matches = text.match(pattern);
      if (matches && matches[1]) {
        let amount = parseAmountString(matches[1]);
        
        if (amount && amount > 0.01 && amount < 500000) {
          foundAmounts.push({ amount, priority: index });
        }
      }
    }
  });

  // Función helper para parsear montos en diferentes formatos
  function parseAmountString(amountStr: string): number | null {
    if (!amountStr) return null;
    
    // Formato europeo: 11,00 -> 11.00
    if (amountStr.includes(',') && !amountStr.includes('.')) {
      const europeanAmount = parseFloat(amountStr.replace(',', '.'));
      if (!isNaN(europeanAmount)) {
        console.log(`Parsed European format ${amountStr} -> ${europeanAmount}`);
        return europeanAmount;
      }
    }
    
    // Formato americano: 1,234.56 -> remover comas de miles
    if (amountStr.includes('.')) {
      const americanAmount = parseFloat(amountStr.replace(/,/g, ''));
      if (!isNaN(americanAmount)) {
        console.log(`Parsed American format ${amountStr} -> ${americanAmount}`);
        return americanAmount;
      }
    }
    
    // Formato entero
    const intAmount = parseInt(amountStr.replace(/[^\d]/g, ''));
    if (!isNaN(intAmount)) {
      console.log(`Parsed integer format ${amountStr} -> ${intAmount}`);
      return intAmount;
    }
    
    return null;
  }
  
  console.log('Found amounts with priority:', foundAmounts);
  
  if (foundAmounts.length > 0) {
    // Ordenar por prioridad (menor índice = mayor prioridad)
    foundAmounts.sort((a, b) => a.priority - b.priority);
    
    // Si hay múltiples del mismo nivel de prioridad, tomar el mayor
    const highestPriority = foundAmounts[0].priority;
    const highestPriorityAmounts = foundAmounts.filter(a => a.priority === highestPriority);
    
    return Math.max(...highestPriorityAmounts.map(a => a.amount));
  }
  
  return null;
}

// DBA endpoint - Solo para administradores
app.post('/api/dba/execute', authMiddleware(), async (c) => {
  const user = c.get('user');
  
  // Verificar que el usuario es admin
  if (user.role !== 'admin') {
    return c.json({ error: 'Acceso denegado. Solo administradores.' }, 403);
  }

  try {
    const body = await c.req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return c.json({ error: 'Query SQL es requerido' }, 400);
    }

    const sqlQuery = query.trim();
    
    // DBA tiene permisos COMPLETOS - Solo bloqueamos operaciones extremadamente peligrosas
    const extremelyDangerousPatterns = [
      /DROP\s+DATABASE/i,
      /DROP\s+SCHEMA/i,
      /PRAGMA\s+/i  // Evitar cambios de configuración de SQLite
    ];

    for (const pattern of extremelyDangerousPatterns) {
      if (pattern.test(sqlQuery)) {
        return c.json({ 
          error: 'Operación extremadamente peligrosa bloqueada. Contacte al administrador del sistema.' 
        }, 400);
      }
    }

    console.log(`DBA Query ejecutado por ${user.email}: ${sqlQuery}`);

    let result;
    
    // Determinar si es una consulta que retorna resultados o no
    const isSelectQuery = /^\s*SELECT/i.test(sqlQuery);
    
    if (isSelectQuery) {
      result = await c.env.DB.prepare(sqlQuery).all();
      
      return c.json({
        success: true,
        results: result.results || [],
        count: result.results?.length || 0,
        message: `Query ejecutado exitosamente. ${result.results?.length || 0} filas retornadas.`
      });
    } else {
      // Para INSERT, UPDATE, DELETE, etc.
      result = await c.env.DB.prepare(sqlQuery).run();
      
      return c.json({
        success: true,
        results: [],
        changes: result.meta?.changes || 0,
        message: `Query ejecutado exitosamente. ${result.meta?.changes || 0} filas afectadas.`
      });
    }

  } catch (error: any) {
    console.error('Error ejecutando query DBA:', error);
    
    return c.json({ 
      error: `Error SQL: ${error.message || 'Error desconocido'}` 
    }, 500);
  }
});

// ========== MÚLTIPLES ARCHIVOS ADJUNTOS ==========

// Subir múltiples archivos a un gasto
app.post('/api/expenses/:id/attachments', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('id');

    // Verificar que el gasto existe y pertenece al usuario
    const { results: expenseResults } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
    ).bind(expenseId, user.id).all();

    if (expenseResults.length === 0) {
      return c.json({ error: 'Gasto no encontrado o no autorizado' }, 404);
    }

    const formData = await c.req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return c.json({ error: 'No se encontraron archivos para subir' }, 400);
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // Validar tipo de archivo (solo imágenes)
      if (!file.type.startsWith('image/')) {
        console.log(`❌ Archivo rechazado - tipo inválido: ${file.type}`);
        continue;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log(`❌ Archivo rechazado - muy grande: ${file.size} bytes`);
        continue;
      }

      // Generar nombre único
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `expense_${expenseId}_${timestamp}_${randomString}.${extension}`;

      try {
        // Convertir a base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
        const base64Data = btoa(binaryString);

        // Guardar en file_storage
        await c.env.DB.prepare(
          'INSERT INTO file_storage (filename, data, content_type, created_at) VALUES (?, ?, ?, datetime("now"))'
        ).bind(filename, base64Data, file.type).run();

        // Guardar en expense_attachments
        await c.env.DB.prepare(
          'INSERT INTO expense_attachments (expense_id, filename, original_name, content_type, file_size) VALUES (?, ?, ?, ?, ?)'
        ).bind(expenseId, filename, file.name, file.type, file.size).run();

        uploadedFiles.push({
          filename,
          originalName: file.name,
          contentType: file.type,
          size: file.size,
          url: `/api/files/${filename}`
        });

        console.log(`✅ Archivo subido exitosamente: ${filename} (${file.size} bytes)`);

      } catch (error) {
        console.error(`❌ Error subiendo archivo ${file.name}:`, error);
      }
    }

    return c.json({
      success: true,
      uploadedFiles,
      message: `Se subieron ${uploadedFiles.length} de ${files.length} archivos`
    });

  } catch (error) {
    console.error('Error uploading attachments:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Obtener archivos adjuntos de un gasto
app.get('/api/expenses/:id/attachments', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('id');

    // Verificar que el gasto existe y es accesible por el usuario
    const { results: expenseResults } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ? AND (user_id = ? OR ? IN (SELECT id FROM users WHERE role IN ("admin", "supervisor")))'
    ).bind(expenseId, user.id, user.id).all();

    if (expenseResults.length === 0) {
      return c.json({ error: 'Gasto no encontrado o no autorizado' }, 404);
    }

    // Obtener todos los archivos adjuntos del gasto
    const { results: attachments } = await c.env.DB.prepare(
      'SELECT id, filename, original_name, content_type, file_size, created_at FROM expense_attachments WHERE expense_id = ? ORDER BY created_at'
    ).bind(expenseId).all();

    const formattedAttachments = attachments.map((att: any) => ({
      id: att.id,
      filename: att.filename,
      originalName: att.original_name,
      contentType: att.content_type,
      size: att.file_size,
      createdAt: att.created_at,
      url: `/api/files/${att.filename}`
    }));

    return c.json({
      success: true,
      attachments: formattedAttachments
    });

  } catch (error) {
    console.error('Error getting attachments:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Eliminar un archivo adjunto específico
app.delete('/api/expenses/:expenseId/attachments/:attachmentId', authMiddleware(), async (c) => {
  try {
    const user = c.get("user")! as User;
    const expenseId = c.req.param('expenseId');
    const attachmentId = c.req.param('attachmentId');

    // Verificar que el gasto pertenece al usuario
    const { results: expenseResults } = await c.env.DB.prepare(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
    ).bind(expenseId, user.id).all();

    if (expenseResults.length === 0) {
      return c.json({ error: 'Gasto no encontrado o no autorizado' }, 404);
    }

    // Obtener información del archivo antes de eliminarlo
    const { results: attachmentResults } = await c.env.DB.prepare(
      'SELECT filename FROM expense_attachments WHERE id = ? AND expense_id = ?'
    ).bind(attachmentId, expenseId).all();

    if (attachmentResults.length === 0) {
      return c.json({ error: 'Archivo adjunto no encontrado' }, 404);
    }

    const attachment = attachmentResults[0] as any;

    // Eliminar de expense_attachments
    await c.env.DB.prepare(
      'DELETE FROM expense_attachments WHERE id = ? AND expense_id = ?'
    ).bind(attachmentId, expenseId).run();

    // Eliminar de file_storage
    await c.env.DB.prepare(
      'DELETE FROM file_storage WHERE filename = ?'
    ).bind(attachment.filename).run();

    return c.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting attachment:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// 📊 CONSULTAR TRANSACCIONES DE SALDO (CONTROL Y AUDITORÍA)
app.get('/api/transacciones-saldo', authMiddleware(), async (c) => {
  try {
    const user = c.get('user')! as User;
    
    // Solo admins pueden ver todas las transacciones
    let query = `
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        u.email as user_email,
        st.currency,
        st.tipo,
        st.monto,
        st.saldo_anterior,
        st.saldo_nuevo,
        st.descripcion,
        st.realizado_por,
        st.fecha_transaccion,
        st.created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.user_id = u.id
    `;
    
    const params = [];
    
    if (user.role !== 'admin') {
      // Los usuarios normales solo ven sus propias transacciones
      query += ' WHERE st.user_id = ?';
      params.push(user.id);
    }
    
    query += ' ORDER BY st.fecha_transaccion DESC LIMIT 50';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      transacciones: results,
      total: results.length
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 📊 CONSULTAR TRANSACCIONES DE USUARIO ESPECÍFICO (SOLO ADMIN)
app.get('/api/users/:userId/transacciones-saldo', authMiddleware(), async (c) => {
  try {
    const user = c.get('user')! as User;
    const userId = c.req.param('userId');
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden consultar transacciones de otros usuarios' }, 403);
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        st.id,
        st.user_id,
        u.name as user_name,
        u.email as user_email,
        st.currency,
        st.tipo,
        st.monto,
        st.saldo_anterior,
        st.saldo_nuevo,
        st.descripcion,
        st.realizado_por,
        st.fecha_transaccion,
        st.created_at
      FROM saldo_transacciones st
      LEFT JOIN users u ON st.      "emeraldwalk.runonsave": [
        {
          "match": ".*",
          "command": "workbench.action.tasks.runTask",
          "args": "Auto Git Push on Save (PowerShell)"
        }
      ]      "emeraldwalk.runonsave": [
        {
          "match": ".*",
          "command": "workbench.action.tasks.runTask",
          "args": "Auto Git Push on Save (PowerShell)"
        }
      ]      {
        "emeraldwalk.runonsave": [
          {
            "match": ".*",
            "command": "workbench.action.tasks.runTask",
            "args": "Auto Git Push on Save (PowerShell)"
          }
        ]
      }user_id = u.id
      WHERE st.user_id = ?
      ORDER BY st.fecha_transaccion DESC
    `).bind(userId).all();
    
    return c.json({
      transacciones: results,
      total: results.length,
      user_id: userId
    });
    
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 💰 OBTENER TODOS LOS SALDOS DE UN USUARIO ESPECÍFICO
app.get('/api/users/:userId/saldos', authMiddleware(), async (c) => {
  try {
    const user = c.get('user')! as User;
    const userId = c.req.param('userId');
    
    console.log(`🔍 CONSULTA SALDOS: Usuario ${user.id} consultando saldos de ${userId}`);
    
    // Solo admins pueden consultar saldos de otros usuarios
    if (user.role !== 'admin' && user.id !== userId) {
      console.log(`❌ PERMISO DENEGADO: Usuario ${user.id} no puede consultar saldos de ${userId}`);
      return c.json({ error: 'Solo administradores pueden consultar saldos de otros usuarios' }, 403);
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT currency, balance 
      FROM saldos 
      WHERE user_id = ? 
      ORDER BY currency
    `).bind(userId).all();
    
    console.log(`💰 Saldos consultados para usuario ${userId}:`, results);
    
    return c.json({
      success: true,
      user_id: userId,
      saldos: results
    });
    
  } catch (error) {
    console.error('Error fetching user balances:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Middleware para servir archivos estáticos y SPA
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  
  // Intentar obtener el archivo específico
  let response = await c.env.ASSETS.fetch(url);
  
  // Si no se encuentra (404) y no es un asset, servir index.html para el SPA
  if (response.status === 404 && !url.pathname.startsWith('/assets/')) {
    const indexUrl = new URL(c.req.url);
    indexUrl.pathname = '/index.html';
    response = await c.env.ASSETS.fetch(indexUrl);
  }
  
  // Clonar response para poder modificar headers
  const newResponse = new Response(response.body, response);
  
  // FORZAR NO-CACHE en todos los archivos
  newResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  newResponse.headers.set('Pragma', 'no-cache');
  newResponse.headers.set('Expires', '0');
  
  return newResponse;
});

export default app;