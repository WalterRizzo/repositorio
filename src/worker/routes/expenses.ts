import { authMiddleware } from '../auth';
import { registrarTransaccionSaldo } from '../utils';

export function registerExpenseRoutes(app: any) {
  // GET /api/expenses with pagination and filters
  app.get('/api/expenses', authMiddleware(), async (c: any) => {
    try {
      const user = c.get('user');
      const url = new URL(c.req.url);
      const paramsQs = url.searchParams;
      const from = paramsQs.get('from');
      const to = paramsQs.get('to');
      const qUserId = paramsQs.get('userId');
      const category = paramsQs.get('category');
      const currency = paramsQs.get('currency');
      const status = paramsQs.get('status');
      const minAmount = paramsQs.get('minAmount');
      const maxAmount = paramsQs.get('maxAmount');
      const hasReceipt = paramsQs.get('hasReceipt');

      const whereClauses: string[] = [];
      const bindParams: any[] = [];
      if (user.role !== 'admin' && user.role !== 'supervisor') {
        whereClauses.push('e.user_id = ?');
        bindParams.push(user.id);
      } else if (qUserId) {
        whereClauses.push('e.user_id = ?');
        bindParams.push(qUserId);
      }
      if (from) { whereClauses.push('e.expense_date >= ?'); bindParams.push(from); }
      if (to) { whereClauses.push('e.expense_date <= ?'); bindParams.push(to); }
      if (category) { whereClauses.push('e.category = ?'); bindParams.push(category); }
      if (currency) { whereClauses.push('UPPER(e.currency) = UPPER(?)'); bindParams.push(currency); }
      if (status) { whereClauses.push('e.status = ?'); bindParams.push(status); }
      if (minAmount) { whereClauses.push('e.amount >= ?'); bindParams.push(Number(minAmount)); }
      if (maxAmount) { whereClauses.push('e.amount <= ?'); bindParams.push(Number(maxAmount)); }
      if (hasReceipt === 'true') { whereClauses.push('EXISTS (SELECT 1 FROM expense_attachments a WHERE a.expense_id = e.id)'); }
      else if (hasReceipt === 'false') { whereClauses.push('NOT EXISTS (SELECT 1 FROM expense_attachments a WHERE a.expense_id = e.id)'); }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const limitParam = Number(paramsQs.get('limit') || paramsQs.get('per_page') || 50);
      const pageParam = Number(paramsQs.get('page') || 0);
      const offsetParam = Number(paramsQs.get('offset') || (pageParam > 0 ? (pageParam - 1) * limitParam : 0));
      const limit = Math.min(Math.max(limitParam, 1), 500);
      const offset = Math.max(offsetParam, 0);

      const query = `SELECT e.*, u.name as user_name, u.email as user_email FROM expenses e LEFT JOIN users u ON e.user_id = u.id ${whereSql} ORDER BY e.expense_date DESC, e.created_at DESC LIMIT ? OFFSET ?`;
      const params = [...bindParams, limit, offset];

      // Debug: log query and params when EXPORT debugging enabled
      try { console.log('Query /api/expenses', { query, params }); } catch (e) { /* No-op */ }
      const { results } = await c.env.DB.prepare(query).bind(...params).all();

      const expensesWithAttachments = await Promise.all(results.map(async (expense: any) => {
        const { results: attachments } = await c.env.DB.prepare('SELECT filename, original_name, content_type FROM expense_attachments WHERE expense_id = ? ORDER BY created_at').bind(expense.id).all();
        return { ...expense, attachments: attachments.map((att: any) => ({ filename: att.filename, originalName: att.original_name, contentType: att.content_type, url: `/api/files/${att.filename}`})) };
      }));

      const countQuery = `SELECT COUNT(1) as total FROM expenses e ${whereSql}`;
      const { results: countRes } = await c.env.DB.prepare(countQuery).bind(...bindParams).all();
      const total = countRes?.[0]?.total ?? (expensesWithAttachments?.length || 0);
      return c.json({ data: expensesWithAttachments, total, limit, offset });
    } catch (error) {
      return c.json({ error: String(error) }, 500);
    }
  });

  // Export endpoint - returns all matching expenses without pagination (for Excel export)
  app.get('/api/expenses/export', authMiddleware(), async (c: any) => {
    try {
      const user = c.get('user');
      const url = new URL(c.req.url);
      const paramsQs = url.searchParams;
      const from = paramsQs.get('from');
      const to = paramsQs.get('to');
      const qUserId = paramsQs.get('userId');
      const category = paramsQs.get('category');
      const currency = paramsQs.get('currency');

      const whereClauses: string[] = [];
      const bindParams: any[] = [];
      if (user.role !== 'admin' && user.role !== 'supervisor') {
        whereClauses.push('e.user_id = ?');
        bindParams.push(user.id);
      } else if (qUserId) {
        whereClauses.push('e.user_id = ?');
        bindParams.push(qUserId);
      }
      if (from) { whereClauses.push('e.expense_date >= ?'); bindParams.push(from); }
      if (to) { whereClauses.push('e.expense_date <= ?'); bindParams.push(to); }
      if (category) { whereClauses.push('e.category = ?'); bindParams.push(category); }
      if (currency) { whereClauses.push('UPPER(e.currency) = UPPER(?)'); bindParams.push(currency); }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Log for debugging exported query and parameters
      console.log('/api/expenses/export query', { whereSql, bindParams, qUserId, currency });

      const query = `SELECT e.*, u.name as user_name, u.email as user_email FROM expenses e LEFT JOIN users u ON e.user_id = u.id ${whereSql} ORDER BY e.expense_date DESC, e.created_at DESC`;
      const { results } = await c.env.DB.prepare(query).bind(...bindParams).all();

      const expensesWithAttachments = await Promise.all(results.map(async (expense: any) => {
        const { results: attachments } = await c.env.DB.prepare('SELECT filename, original_name, content_type FROM expense_attachments WHERE expense_id = ? ORDER BY created_at').bind(expense.id).all();
        return { ...expense, attachments: attachments.map((att: any) => ({ filename: att.filename, originalName: att.original_name, contentType: att.content_type, url: `/api/files/${att.filename}`})) };
      }));

      // If debug requested, also return the whereSql & params to help debug export filtering
      if (paramsQs.get('debug') === 'true') {
        return c.json({ data: expensesWithAttachments, total: results.length, debug: { whereSql, bindParams } });
      }
      return c.json({ data: expensesWithAttachments, total: results.length });
    } catch (error) {
      return c.json({ error: String(error) }, 500);
    }
  });

  // POST /api/expenses - create new expense
  app.post('/api/expenses', authMiddleware(), async (c: any) => {
    try {
      const user = c.get('user');
      const expense = await c.req.json();

      // Enforce payment method present
      if (!expense.sigla || String(expense.sigla).trim() === '') {
        return c.json({ error: 'La forma de pago es obligatoria' }, 400);
      }
      // Determine whether this expense should deduct from balance.
      // We no longer consult tipo_comprobantes.descuenta_saldo to avoid runtime schema mismatches.
      // Instead, use the formapago.sigla -> afectaSaldo flag when provided; default to 1.
      let descuentaSaldo = 1;
      if (expense.sigla) {
        const { results: fp } = await c.env.DB.prepare('SELECT afectaSaldo FROM formapago WHERE sigla = ?').bind(expense.sigla).all();
        if (fp.length > 0) descuentaSaldo = Number(fp[0].afectaSaldo ?? 1);
      }
      // Insert the expense first so we can tag any generated saldo_transacciones with the expense id
      const { results: insertRes } = await c.env.DB.prepare('INSERT INTO expenses (user_id, category, description, amount, expense_date, status, currency, use_balance, tipo_comprobante_id, sigla) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *').bind(user.id, expense.category, expense.description, expense.amount, expense.expense_date, 'pendiente', expense.currency || 'ARS', (expense.use_balance && descuentaSaldo !== 0) ? 1 : 0, expense.tipo_comprobante_id || null, expense.sigla || null).all();
      const createdExpense = insertRes?.[0] ?? null;

      if (!createdExpense) return c.json({ error: 'Error creating expense' }, 500);

      if (expense.use_balance && descuentaSaldo !== 0) {
        const expenseAmount = parseFloat(expense.amount);
        const currency = expense.currency || 'ARS';
        const { results: saldoAnteriorResults } = await c.env.DB.prepare('SELECT balance FROM saldos WHERE user_id = ? AND currency = ?').bind(user.id, currency).all();
        let saldoAnterior = 0;
        if (saldoAnteriorResults.length === 0) {
          await c.env.DB.prepare(`INSERT INTO saldos (user_id, currency, balance, created_at, updated_at) VALUES (?, ?, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).bind(user.id, currency).run();
        } else {
          saldoAnterior = Number(saldoAnteriorResults[0].balance) || 0;
        }
        // Only apply the deduction immediately if the actor is admin
        // Supervisors should create pending transactions that require approval.
        const actorIsAdmin = user && (user.role === 'admin');
        if (actorIsAdmin) {
          const { success } = await c.env.DB.prepare('UPDATE saldos SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND currency = ?').bind(expenseAmount, user.id, currency).run();
          if (!success) return c.json({ error: 'Error al actualizar saldo' }, 500);
          const saldoNuevo = saldoAnterior - expenseAmount;
          await registrarTransaccionSaldo(c.env.DB, user.id, currency, 'descuento', expenseAmount, saldoAnterior, saldoNuevo, `Descuento por gasto: ${expense.description} | expense_id:${createdExpense.id}`, user.email || 'USUARIO', 'aprobado', user.email || null, null);
        } else {
          // create a pending descuento transaction and do not update saldos
          const expectedNew = saldoAnterior - expenseAmount;
          await registrarTransaccionSaldo(c.env.DB, user.id, currency, 'descuento', expenseAmount, saldoAnterior, expectedNew, `Descuento (pendiente) por gasto: ${expense.description} | expense_id:${createdExpense.id}`, user.email || 'USUARIO', 'pendiente', null, null);
        }
      }
      return c.json(createdExpense);
    } catch (error) {
      return c.json({ error: String(error) }, 500);
    }
  });
}

export default registerExpenseRoutes;
