import type { D1Database } from '@cloudflare/workers-types';

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
