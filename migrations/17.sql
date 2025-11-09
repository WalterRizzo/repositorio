-- Tabla para registrar intentos bloqueados por rate limiting (auditoría de seguridad)
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  attempts INTEGER NOT NULL,
  blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT
);

-- Índice para búsquedas rápidas por IP
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_log(ip_address);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_rate_limit_date ON rate_limit_log(blocked_at);
