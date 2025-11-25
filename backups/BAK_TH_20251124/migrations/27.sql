-- Create backups table to store JSON backups if R2 is not configured
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
