-- Agregar campos para control de intentos de login
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN last_failed_login DATETIME DEFAULT NULL;
