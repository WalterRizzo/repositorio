-- Rollback currency changes

-- Drop exchange_rates table and its trigger
DROP TABLE IF EXISTS exchange_rates;
DROP TRIGGER IF EXISTS exchange_rates_updated_at;

-- Remove currency columns
BEGIN TRANSACTION;

CREATE TABLE expenses_backup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  expense_date TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente',
  approved_by TEXT,
  approved_at TIMESTAMP,
  use_balance BOOLEAN DEFAULT 0,
  receipt_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO expenses_backup 
SELECT id, user_id, description, amount, category, expense_date, 
       status, approved_by, approved_at, use_balance, receipt_photo_url, 
       created_at, updated_at
FROM expenses;

DROP TABLE expenses;
ALTER TABLE expenses_backup RENAME TO expenses;

-- Restore balance_transactions
CREATE TABLE balance_transactions_backup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO balance_transactions_backup
SELECT id, user_id, amount, type, description, created_by, created_at, updated_at
FROM balance_transactions;

DROP TABLE balance_transactions;
ALTER TABLE balance_transactions_backup RENAME TO balance_transactions;

-- Restore user_profiles
CREATE TABLE user_profiles_backup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'usuario',
  balance REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_profiles_backup
SELECT id, user_id, role, balance, created_at, updated_at
FROM user_profiles;

DROP TABLE user_profiles;
ALTER TABLE user_profiles_backup RENAME TO user_profiles;

COMMIT;