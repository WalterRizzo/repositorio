-- Migration 29: Create cierre tables for 'cierre de viajes'

-- expenses_cierre: replicate main expenses table semantics for trip closing flows
CREATE TABLE IF NOT EXISTS expenses_cierre (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT,
  description TEXT,
  amount REAL NOT NULL DEFAULT 0.0,
  expense_date DATE,
  status TEXT DEFAULT 'pendiente',
  currency TEXT DEFAULT 'ARS',
  use_balance INTEGER DEFAULT 1,
  tipo_comprobante_id INTEGER,
  sigla CHAR(2),
  receipt_photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- saldo_transacciones_cierre: replicate balance transaction auditing for cierre
CREATE TABLE IF NOT EXISTS saldo_transacciones_cierre (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  tipo TEXT NOT NULL,
  monto REAL NOT NULL,
  saldo_anterior REAL,
  saldo_nuevo REAL,
  descripcion TEXT,
  realizado_por TEXT,
  fecha_transaccion DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes to speed lookups
CREATE INDEX IF NOT EXISTS idx_expenses_cierre_user ON expenses_cierre(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_cierre_date ON expenses_cierre(expense_date);
CREATE INDEX IF NOT EXISTS idx_saldo_transacciones_cierre_user_currency ON saldo_transacciones_cierre(user_id, currency);
