-- 1. Actualizar user_id en users
UPDATE users SET id = LOWER(SUBSTR(name, 1, 1) || lastname) WHERE id IS NOT NULL AND lastname IS NOT NULL AND TRIM(lastname) != '';

-- 2. Eliminar registros problemáticos en user_profiles
DELETE FROM user_profiles WHERE user_id IS NULL OR TRIM(user_id) = '';

-- 3. Sincronizar user_id en user_profiles usando el antiguo id
UPDATE user_profiles SET user_id = (SELECT id FROM users WHERE users.rowid = user_profiles.rowid) WHERE EXISTS (SELECT 1 FROM users WHERE users.rowid = user_profiles.rowid);

-- 4. Eliminar registros problemáticos en audit_logs
DELETE FROM audit_logs WHERE user_id IS NULL OR TRIM(user_id) = '';

-- 5. Sincronizar user_id en audit_logs usando el antiguo id
UPDATE audit_logs SET user_id = (SELECT id FROM users WHERE users.rowid = audit_logs.rowid) WHERE EXISTS (SELECT 1 FROM users WHERE users.rowid = audit_logs.rowid);

-- 6. Eliminar registros problemáticos en expenses
DELETE FROM expenses WHERE user_id IS NULL OR TRIM(user_id) = '';

-- 7. Sincronizar user_id en expenses usando el antiguo id
UPDATE expenses SET user_id = (SELECT id FROM users WHERE users.rowid = expenses.rowid) WHERE EXISTS (SELECT 1 FROM users WHERE users.rowid = expenses.rowid);

-- 8. Eliminar registros problemáticos en saldos
DELETE FROM saldos WHERE user_id IS NULL OR TRIM(user_id) = '';

-- 9. Sincronizar user_id en saldos usando el antiguo id
UPDATE saldos SET user_id = (SELECT id FROM users WHERE users.rowid = saldos.rowid) WHERE EXISTS (SELECT 1 FROM users WHERE users.rowid = saldos.rowid);

-- 10. Eliminar registros problemáticos en saldo_transacciones
DELETE FROM saldo_transacciones WHERE user_id IS NULL OR TRIM(user_id) = '';

-- 11. Sincronizar user_id en saldo_transacciones usando el antiguo id
UPDATE saldo_transacciones SET user_id = (SELECT id FROM users WHERE users.rowid = saldo_transacciones.rowid) WHERE EXISTS (SELECT 1 FROM users WHERE users.rowid = saldo_transacciones.rowid);

-- 12. Asignar 'usuariox' como fallback si queda algún user_id nulo
UPDATE users SET id = 'usuariox' WHERE id IS NULL OR TRIM(id) = '';
UPDATE user_profiles SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE audit_logs SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE expenses SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE saldos SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
UPDATE saldo_transacciones SET user_id = 'usuariox' WHERE user_id IS NULL OR TRIM(user_id) = '';
