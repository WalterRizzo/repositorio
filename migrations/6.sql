-- Agregar columna balance a la tabla users
ALTER TABLE users ADD COLUMN balance REAL DEFAULT 0.0;

-- Actualizar saldos iniciales para usuarios existentes
UPDATE users SET balance = 50000.0 WHERE role = 'admin';
UPDATE users SET balance = 30000.0 WHERE role = 'supervisor';  
UPDATE users SET balance = 10000.0 WHERE role = 'employee';