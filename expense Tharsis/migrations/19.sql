-- Consolidar tablas de transacciones de saldo
-- Migrar datos de balance_transactions a saldo_transacciones si existen

-- Primero, migrar datos de balance_transactions a saldo_transacciones
INSERT OR IGNORE INTO saldo_transacciones (user_id, currency, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, realizado_por, fecha_transaccion, created_at)
SELECT 
    user_id,
    'ARS' as currency, -- Asumimos ARS por defecto para registros viejos
    type as tipo,
    amount as monto,
    0 as saldo_anterior, -- No tenemos este dato en la tabla vieja
    0 as saldo_nuevo, -- No tenemos este dato en la tabla vieja
    description as descripcion,
    created_by as realizado_por,
    created_at as fecha_transaccion,
    created_at
FROM balance_transactions
WHERE id NOT IN (SELECT id FROM saldo_transacciones WHERE id IN (SELECT id FROM balance_transactions));

-- Eliminar tabla vieja balance_transactions ya que ahora usamos saldo_transacciones
DROP TABLE IF EXISTS balance_transactions;
