-- Migration 30: Add trip_closures and archived tables for closed expenses and closed saldo_transacciones

-- Table to record each trip closure event
CREATE TABLE IF NOT EXISTS trip_closures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  total_expenses REAL NOT NULL,
  total_movements REAL NOT NULL,
  delta REAL NOT NULL,
  force_close INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Archive table for expenses moved during a trip closure
CREATE TABLE IF NOT EXISTS closed_expenses (
  id INTEGER PRIMARY KEY,
  original_expense_id INTEGER NOT NULL,
  trip_closure_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  category TEXT,
  expense_date DATE,
  status TEXT,
  use_balance BOOLEAN,
  receipt_photo_url TEXT,
  currency TEXT,
  tipo_comprobante_id INTEGER,
  sigla CHAR(2),
  created_at DATETIME,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Archive table for saldo_transacciones moved during a trip closure
CREATE TABLE IF NOT EXISTS closed_saldo_transacciones (
  id INTEGER PRIMARY KEY,
  original_movement_id INTEGER NOT NULL,
  trip_closure_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  currency TEXT,
  tipo TEXT,
  monto REAL NOT NULL,
  saldo_anterior REAL,
  saldo_nuevo REAL,
  descripcion TEXT,
  realizado_por TEXT,
  fecha_transaccion DATETIME,
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
