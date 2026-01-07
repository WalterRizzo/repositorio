-- 1. Actualizar user_id en users primero
UPDATE users SET id = LOWER(SUBSTR(name, 1, 1) || lastname) WHERE id IS NOT NULL AND lastname IS NOT NULL AND TRIM(lastname) != '';

-- 2. Sincronizar user_id en user_profiles
UPDATE user_profiles SET user_id = (SELECT id FROM users WHERE users.rowid = user_profiles.rowid) WHERE user_id IS NOT NULL;

-- 3. Sincronizar user_id en audit_logs
UPDATE audit_logs SET user_id = (SELECT id FROM users WHERE users.rowid = audit_logs.rowid) WHERE user_id IS NOT NULL;

-- 4. Sincronizar user_id en expenses
UPDATE expenses SET user_id = (SELECT id FROM users WHERE users.rowid = expenses.rowid) WHERE user_id IS NOT NULL;

-- 5. Sincronizar user_id en saldos
UPDATE saldos SET user_id = (SELECT id FROM users WHERE users.rowid = saldos.rowid) WHERE user_id IS NOT NULL;

-- 6. Sincronizar user_id en saldo_transacciones
UPDATE saldo_transacciones SET user_id = (SELECT id FROM users WHERE users.rowid = saldo_transacciones.rowid) WHERE user_id IS NOT NULL;

-- NOTA: Si hay user_id nulos, asigna 'usuariox' como fallback
UPDATE users SET id = 'usuariox' WHERE id IS NULL OR TRIM(id) = '';
UPDATE user_profiles SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE audit_logs SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE expenses SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE saldos SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE saldo_transacciones SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
