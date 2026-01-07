export async function registrarTransaccionSaldo(
  db: any,
  userId: string,
  currency: string,
  tipo: 'carga' | 'descuento' | 'ajuste',
  monto: number,
  saldoAnterior: number | null,
  saldoNuevo: number | null,
  descripcion: string,
  realizadoPor: string,
  status: 'aprobado' | 'pendiente' = 'aprobado',
  approvedBy: string | null = null,
  approvedAt: string | null = null
) {
  try {
    // Insert with status + approval metadata (columns added in migration 31)
    await db.prepare(`
      INSERT INTO saldo_transacciones 
      (user_id, currency, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, realizado_por, status, approved_by, approved_at, fecha_transaccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, currency, tipo, monto, saldoAnterior, saldoNuevo, descripcion, realizadoPor, status, approvedBy, approvedAt).run();

    console.log(`✅ Transacción registrada: Usuario ${userId} - ${tipo} ${monto} ${currency} por ${realizadoPor} (status=${status})`);
  } catch (error) {
    // Fallback: if DB doesn't yet have the new columns, try to insert without them
    try {
      await db.prepare(`
        INSERT INTO saldo_transacciones 
        (user_id, currency, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, realizado_por, fecha_transaccion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(userId, currency, tipo, monto, saldoAnterior, saldoNuevo, descripcion, realizadoPor).run();
      console.log(`✅ Transacción registrada (fallback insert): Usuario ${userId} - ${tipo} ${monto} ${currency} por ${realizadoPor}`);
    } catch (err2) {
      console.error('❌ Error recording transaction:', err2);
    }
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
