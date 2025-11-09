-- Crear tabla de auditoría de movimientos de saldo
-- Esta tabla registra TODAS las operaciones de carga de saldo por admin/supervisor

CREATE TABLE IF NOT EXISTS balance_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'ARS',
  type TEXT NOT NULL, -- 'carga', 'ajuste', 'descuento', etc.
  balance_before REAL NOT NULL,
  balance_after REAL NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL, -- ID o email del admin/supervisor que hizo la operación
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_balance_audit_user ON balance_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_audit_created ON balance_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_balance_audit_type ON balance_audit(type);
