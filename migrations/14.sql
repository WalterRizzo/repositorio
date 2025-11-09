-- Crear tabla de tipos de comprobantes
CREATE TABLE IF NOT EXISTS tipo_comprobantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de comprobantes por defecto
INSERT OR IGNORE INTO tipo_comprobantes (nombre, descripcion) VALUES
  ('FACTURA A', 'Factura A - Responsable Inscripto'),
  ('FACTURA B', 'Factura B - Monotributo/Consumidor Final'),
  ('FACTURA C', 'Factura C - IVA Exento'),
  ('FACTURA E', 'Factura E - Exportación'),
  ('RECIBO', 'Recibo sin Factura'),
  ('TICKET', 'Ticket de compra'),
  ('NOTA DE CRÉDITO', 'Nota de Crédito'),
  ('REMITO', 'Remito'),
  ('OTRO', 'Otro tipo de comprobante');

-- Agregar columna tipo_comprobante_id a la tabla expenses
ALTER TABLE expenses ADD COLUMN tipo_comprobante_id INTEGER;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_expenses_tipo_comprobante ON expenses(tipo_comprobante_id);
