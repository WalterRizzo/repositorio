-- Actualiza el user_id de todos los usuarios existentes a primer caracter del nombre + apellido
-- y actualiza las referencias en audit_logs, expenses, saldos, saldo_transacciones, user_profiles

-- Ejemplo para usuario 'Walter Rizzo'
-- user_id = 'wrizzo'

-- Actualizar user_id en users
UPDATE users SET id = LOWER(SUBSTR(name, 1, 1) || lastname) WHERE id IS NOT NULL;

-- Actualizar user_id en user_profiles
UPDATE user_profiles SET user_id = (SELECT LOWER(SUBSTR(name, 1, 1) || lastname) FROM users WHERE users.id = user_profiles.user_id);

-- Actualizar user_id en audit_logs
UPDATE audit_logs SET user_id = (SELECT LOWER(SUBSTR(name, 1, 1) || lastname) FROM users WHERE users.id = audit_logs.user_id);

-- Actualizar user_id en expenses
UPDATE expenses SET user_id = (SELECT LOWER(SUBSTR(name, 1, 1) || lastname) FROM users WHERE users.id = expenses.user_id);

-- Actualizar user_id en saldos
UPDATE saldos SET user_id = (SELECT LOWER(SUBSTR(name, 1, 1) || lastname) FROM users WHERE users.id = saldos.user_id);

-- Actualizar user_id en saldo_transacciones
UPDATE saldo_transacciones SET user_id = (SELECT LOWER(SUBSTR(name, 1, 1) || lastname) FROM users WHERE users.id = saldo_transacciones.user_id);

-- NOTA: Asegúrate que la tabla users tenga la columna 'lastname'. Si no existe, agrega primero:
-- ALTER TABLE users ADD COLUMN lastname TEXT;

-- Si el nombre completo está en una sola columna, deberás separar nombre y apellido antes de ejecutar este script.