-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description, color) VALUES
  ('Comida', 'Gastos en alimentación', '#10B981'),
  ('Transporte', 'Gastos de movilidad', '#3B82F6'),
  ('Entretenimiento', 'Ocio y diversión', '#8B5CF6'),
  ('Salud', 'Gastos médicos', '#EF4444'),
  ('Capacitación', 'Formación y cursos', '#F59E0B'),
  ('Oficina', 'Materiales y suministros', '#6B7280');