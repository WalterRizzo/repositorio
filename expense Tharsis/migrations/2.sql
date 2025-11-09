
-- Add user roles and balance management
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'usuario',
  balance REAL NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add expense approval system
ALTER TABLE expenses ADD COLUMN status TEXT DEFAULT 'pendiente';
ALTER TABLE expenses ADD COLUMN approved_by TEXT NULL;
ALTER TABLE expenses ADD COLUMN approved_at DATETIME NULL;
ALTER TABLE expenses ADD COLUMN use_balance BOOLEAN DEFAULT 0;

-- Add balance transactions table
CREATE TABLE balance_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_balance_transactions_user_id ON balance_transactions(user_id);
