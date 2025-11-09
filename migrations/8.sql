-- Crear tabla de monedas
CREATE TABLE IF NOT EXISTS currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar monedas por defecto
INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES
('ARS', 'Peso Argentino', '$'),
('USD', 'Dólar Estadounidense', 'US$'),
('EUR', 'Euro', '€'),
('BRL', 'Real Brasileño', 'R$'),
('CLP', 'Peso Chileno', 'CLP$'),
('UYU', 'Peso Uruguayo', 'UY$');