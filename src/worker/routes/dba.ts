import { authMiddleware } from '../auth';
import { logDbaAction } from '../utils';

export function registerDbaRoutes(app: any) {
  app.post('/api/dba/execute', authMiddleware(), async (c: any) => {
    const user = c.get('user');
    if (user.role !== 'admin') return c.json({ error: 'Acceso denegado. Solo administradores.' }, 403);
    const dbaKey = c.req.header('x-dba-key') || c.req.header('X-DBA-Key');
    if (!dbaKey || dbaKey !== c.env.DBA_EXEC_KEY) return c.json({ error: 'DBA key is required' }, 403);
    try {
      const body = await c.req.json();
      const { query } = body;
      if (!query || typeof query !== 'string') return c.json({ error: 'Query SQL es requerido' }, 400);
      const sqlQuery = query.trim();
      // Check if query is a SELECT
      const isSelect = /^\s*SELECT\s+/i.test(sqlQuery);
      const allowMutations = String(c.env.ALLOW_DBA_WRITE || c.env.DBA_ALLOW_MUTATIONS || '').toLowerCase() === 'true' || String(c.env.ALLOW_DBA_WRITE || c.env.DBA_ALLOW_MUTATIONS || '') === '1';
      // If it's a non-select query, require explicit env var to allow mutations (safety)
      if (!isSelect && !allowMutations) {
        return c.json({ error: 'Escrituras a la base de datos (INSERT/UPDATE/DELETE/DDL) están deshabilitadas. Configure ALLOW_DBA_WRITE=true si necesita activarlas.' }, 403);
      }

      // Execute SELECT (read) or comment/other statements
      if (isSelect) {
        const result = await c.env.DB.prepare(sqlQuery).all();
        // log action
        try { await logDbaAction(c.env.DB, user.id || user.email || 'admin', sqlQuery, c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown', (result?.results?.length || 0)); } catch(e) {/* ignore */}
        return c.json({ success: true, results: result.results || [], count: result.results?.length || 0, message: `Query ejecutado exitosamente. ${result.results?.length || 0} filas retornadas.` });
      } else {
        // Mutating queries
        const res = await c.env.DB.prepare(sqlQuery).run();
        const changes = (res && (res.changes || (res.success ? 1 : 0))) || 0;
        try { await logDbaAction(c.env.DB, user.id || user.email || 'admin', sqlQuery, c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown', changes); } catch(e) {/* ignore */}
        return c.json({ success: true, message: `Query ejecutado - cambios: ${changes}`, changes });
      }
    } catch (error: any) {
      console.error('Error ejecutando query DBA:', error);
      return c.json({ error: `Error SQL: ${error.message || 'Error desconocido'}` }, 500);
    }
  });
}

export default registerDbaRoutes;
