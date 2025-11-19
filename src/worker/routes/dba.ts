import { authMiddleware } from '../auth';
import { sanitizeSqlForSelectOnly } from '../utils';

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
      if (!sanitizeSqlForSelectOnly(sqlQuery)) return c.json({ error: 'Solo se permiten consultas SELECT a través de este endpoint (por seguridad).' }, 403);
      const result = await c.env.DB.prepare(sqlQuery).all();
      return c.json({ success: true, results: result.results || [], count: result.results?.length || 0, message: `Query ejecutado exitosamente. ${result.results?.length || 0} filas retornadas.` });
    } catch (error: any) {
      console.error('Error ejecutando query DBA:', error);
      return c.json({ error: `Error SQL: ${error.message || 'Error desconocido'}` }, 500);
    }
  });
}

export default registerDbaRoutes;
