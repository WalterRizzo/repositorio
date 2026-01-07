import { Hono } from 'hono';
import { authMiddleware, type User } from '../auth';
// import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env; Variables: { user: User } }>();

// Middleware de autenticación para todas las rutas de cheques
app.use('/*', authMiddleware());

// Middleware para verificar que el usuario es admin o supervisor
app.use('/*', async (c, next) => {
    const user = c.get('user');
    if (user.role !== 'admin' && user.role !== 'supervisor') {
        return c.json({ error: 'No autorizado' }, 403);
    }
    await next();
});

// GET /checks - Listar todos los cheques
app.get('/checks', async (c) => {
    const db = c.env.DB;
    const { banco, estado, fechaDesde, fechaHasta, importeDesde, importeHasta } = c.req.query();

    let query = 'SELECT * FROM checks';
    const conditions = [];
    const bindings = [];

    if (banco) {
      conditions.push('banco LIKE ?');
      bindings.push(`%${banco}%`);
    }
    if (estado) {
      conditions.push('estado = ?');
      bindings.push(estado);
    }
    if (fechaDesde) {
      conditions.push('fecha_vencimiento >= ?');
      bindings.push(fechaDesde);
    }
    if (fechaHasta) {
      conditions.push('fecha_vencimiento <= ?');
      bindings.push(fechaHasta);
    }
    if (importeDesde) {
      conditions.push('importe >= ?');
      bindings.push(parseFloat(importeDesde));
    }
    if (importeHasta) {
      conditions.push('importe <= ?');
      bindings.push(parseFloat(importeHasta));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY fecha_vencimiento ASC';

    try {
      const { results } = await db.prepare(query).bind(...bindings).all();
      return c.json({ ok: true, data: results });
    } catch (e: any) {
      return c.json({ ok: false, message: e.message }, 500);
    }
  });

// POST /checks - Registrar un nuevo cheque
app.post('/checks', async (c) => {
    try {
        const body = await c.req.json();
        const {
            tipo,
            numero_cheque,
            banco,
            emisor_beneficiario,
            fecha_emision,
            fecha_vencimiento,
            importe,
            moneda,
            estado,
            observaciones
        } = body;

        if (!tipo || !numero_cheque || !banco || !emisor_beneficiario || !fecha_emision || !fecha_vencimiento || !importe || !moneda || !estado) {
            return c.json({ error: 'Todos los campos obligatorios deben ser proporcionados' }, 400);
        }

        // Verificar duplicados
        const { results: existing } = await c.env.DB.prepare(
            'SELECT id FROM checks WHERE numero_cheque = ? AND banco = ?'
        ).bind(numero_cheque, banco).all();

        if (existing.length > 0) {
            return c.json({ error: 'Ya existe un cheque con el mismo número y banco' }, 409);
        }

        const { results } = await c.env.DB.prepare(
            'INSERT INTO checks (tipo, numero_cheque, banco, emisor_beneficiario, fecha_emision, fecha_vencimiento, importe, moneda, estado, observaciones, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *'
        ).bind(tipo, numero_cheque, banco, emisor_beneficiario, fecha_emision, fecha_vencimiento, importe, moneda, estado, observaciones || null).all();

        if (!results || results.length === 0) {
            return c.json({ error: 'Error al crear el cheque' }, 500);
        }

        return c.json({ ok: true, data: results[0] }, 201);
    } catch (error: any) {
        console.error('Error creating check:', error);
        
        // Handle specific SQLite constraint errors
        const errorMsg = String(error);
        if (errorMsg.includes('UNIQUE constraint failed')) {
            return c.json({ ok: false, error: 'Ya existe un cheque con este número y banco' }, 409);
        }
        
        return c.json({ ok: false, error: 'Error al crear el cheque. Por favor, intenta de nuevo.' }, 500);
    }
});

// PATCH /checks/:id/status - Actualizar estado de cheque
app.patch('/checks/:id/status', async (c) => {
    try {
        const id = c.req.param('id');
        const { status } = await c.req.json();

        if (!status) {
            return c.json({ error: 'El campo "status" es requerido' }, 400);
        }

        const { results } = await c.env.DB.prepare(
            'UPDATE checks SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
        ).bind(status, id).all();

        if (!results || results.length === 0) {
            return c.json({ error: 'Cheque no encontrado' }, 404);
        }

        return c.json({ ok: true, data: results[0] });
    } catch (error) {
        console.error('Error updating check status:', error);
        return c.json({ ok: false, error: 'Error al actualizar el cheque' }, 500);
    }
});

app.get('/checks/summary', authMiddleware, async (c) => {
  const db = c.env.DB;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Cheques vencidos (con nombres en español)
    const { results: overdue } = await db.prepare(
        "SELECT * FROM checks WHERE fecha_vencimiento < ? AND estado NOT IN ('pagado', 'anulado')"
    ).bind(today).all();

    // Cheques próximos a vencer (7, 15, 30 días)
    const { results: upcoming7 } = await db.prepare(
        "SELECT COUNT(*) as count, SUM(importe) as total FROM checks WHERE fecha_vencimiento BETWEEN ? AND date(?, '+7 days') AND estado = 'en cartera'"
    ).bind(today, today).all();
    
    const { results: upcoming15 } = await db.prepare(
        "SELECT COUNT(*) as count, SUM(importe) as total FROM checks WHERE fecha_vencimiento BETWEEN date(?, '+8 days') AND date(?, '+15 days') AND estado = 'en cartera'"
    ).bind(today, today).all();

    const { results: upcoming30 } = await db.prepare(
        "SELECT COUNT(*) as count, SUM(importe) as total FROM checks WHERE fecha_vencimiento BETWEEN date(?, '+16 days') AND date(?, '+30 days') AND estado = 'en cartera'"
    ).bind(today, today).all();

    // Totales por estado
    const { results: byStatus } = await db.prepare(
        "SELECT estado as status, COUNT(*) as count, SUM(importe) as total FROM checks GROUP BY estado"
    ).all();

    // Totales por banco
    const { results: byBank } = await db.prepare(
        "SELECT banco as bank, COUNT(*) as count, SUM(importe) as total FROM checks WHERE estado = 'en cartera' GROUP BY banco"
    ).all();

    return c.json({
        ok: true,
        alerts: {
            overdue: overdue || [],
            overdueCount: overdue?.length || 0,
        },
        upcoming: {
            '7_days': upcoming7[0],
            '15_days': upcoming15[0],
            '30_days': upcoming30[0],
        },
        totals: {
            byStatus,
            byBank,
        }
    });

  } catch (error) {
      console.error('Error fetching checks summary:', error);
      return c.json({ error: 'Error al obtener el resumen de cheques' }, 500);
  }
});


export default app;