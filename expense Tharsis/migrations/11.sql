-- Migración 11: Tabla de auditoría de movimientos de saldo
-- Esta tabla registra todas las cargas de saldo realizadas por admins/supervisores

CREATE TABLE IF NOT EXISTS saldo_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  amount REAL NOT NULL,
  balance_before REAL NOT NULL,
  balance_after REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('carga', 'ajuste', 'descuento')),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_saldo_movements_user_id ON saldo_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_saldo_movements_admin_id ON saldo_movements(admin_id);
CREATE INDEX IF NOT EXISTS idx_saldo_movements_created_at ON saldo_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saldo_movements_currency ON saldo_movements(currency);
