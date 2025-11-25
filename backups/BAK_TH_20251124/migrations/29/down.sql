-- Down migration for 29: Remove cierre tables
DROP INDEX IF EXISTS idx_expenses_cierre_user;
DROP INDEX IF EXISTS idx_expenses_cierre_date;
DROP INDEX IF EXISTS idx_saldo_transacciones_cierre_user_currency;
DROP TABLE IF EXISTS expenses_cierre;
DROP TABLE IF EXISTS saldo_transacciones_cierre;
