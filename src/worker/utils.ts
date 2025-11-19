export async function registrarTransaccionSaldo(
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

    console.log(`Transaction recorded: ${userId} ${tipo} ${monto} ${currency} by ${realizadoPor}`);
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
}

export function sanitizeSqlForSelectOnly(sqlQuery: string): boolean {
  // returns true if SQL is SELECT-only
  const trimmed = sqlQuery.trim().toUpperCase();
  return /^SELECT\s+/i.test(trimmed);
}

export async function logDbaAction(db: any, userId: string, sqlQuery: string, ip?: string, changes?: number | null) {
  try {
    // Create table if not exists for logging (best-effort)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS dba_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        sql TEXT,
        ip TEXT,
        changes INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (e) {
    // non-fatal; permissions may vary
  }

  try {
    await db.prepare(`INSERT INTO dba_logs (user_id, sql, ip, changes) VALUES (?, ?, ?, ?)`)
      .bind(userId || 'unknown', sqlQuery, ip || 'unknown', changes || 0)
      .run();
  } catch (err) {
    console.error('Error logging DBA action:', err);
  }
}
