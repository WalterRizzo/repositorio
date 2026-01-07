-- Auditoría de acciones y cambios en el sistema
CREATE TABLE IF NOT EXISTS audit_logs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id TEXT,
	user_email TEXT,
	action TEXT NOT NULL,
	module TEXT,
	description TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
