import { Hono } from 'hono';
import { authMiddleware, User } from '../auth';

export const usersApi = new Hono<{ Bindings: Env; Variables: { user: User } }>();

// Get current user with profile
usersApi.get("/users/me", authMiddleware(), async (c: any) => {
  const user = c.get("user")! as User;
  
  // Get user from main users table
  const { results: userResults } = await c.env.DB.prepare(
    'SELECT id as user_id, name, email, role, created_at, updated_at FROM users WHERE id = ?'
  ).bind(user.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const userData = userResults[0] as any;
  
  // Get balances from saldos table (multimoneda). Keep default ARS balance for compatibility.
  const { results: allSaldos } = await c.env.DB.prepare(
    'SELECT currency, balance FROM saldos WHERE user_id = ? ORDER BY currency'
  ).bind(user.id).all();

  const balances = Array.isArray(allSaldos) ? allSaldos.map((r:any) => ({ currency: r.currency, balance: Number(r.balance) || 0 })) : [];
  // Choose the ARS balance as the legacy `balance` field for backwards compatibility
  const arsBalanceObj = balances.find(b => String(b.currency).toUpperCase() === 'ARS');
  const balance = arsBalanceObj ? arsBalanceObj.balance : (balances.length > 0 ? balances[0].balance : 0);
  
  // Flattened structure + profile nesting for compatibility
  return c.json({
    user_id: userData.user_id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    balance: balance || 0,
    balances, // Multi-currency balances for the UI (role 'usuario' can inspect their balances)
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    profile: {
        role: userData.role,
        name: userData.name,
        email: userData.email,
        id: userData.user_id
    }
  });
});

usersApi.get('/users/me/balances', authMiddleware(), async (c: any) => {
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

// List users (Admin/Supervisor)
usersApi.get('/users', authMiddleware(), async (c: any) => {
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT id, name, email, role FROM users ORDER BY name'
        ).all();
        // Return array directly as per some hooks expectations, OR object. 
        // Admin user list usually expects array.
        return c.json(results);
    } catch(e) {
        return c.json({ error: String(e) }, 500);
    }
});
