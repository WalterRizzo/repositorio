-- Crear tabla de tipos de comprobantes
CREATE TABLE IF NOT EXISTS tipo_comprobantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de comprobantes predeterminados
INSERT INTO tipo_comprobantes (nombre, codigo, descripcion) VALUES 
    ('Ticket', 'TICKET', 'Comprobante no fiscal'),
    ('Factura A', 'FACTURA_A', 'Factura tipo A'),
    ('Factura B', 'FACTURA_B', 'Factura tipo B'),
    ('Factura C', 'FACTURA_C', 'Factura tipo C'),
    ('Factura E', 'FACTURA_E', 'Factura tipo E (Exportación)'),
    ('Recibo', 'RECIBO', 'Recibo de pago'),
    ('Nota de Crédito', 'NOTA_CREDITO', 'Nota de crédito'),
    ('Nota de Débito', 'NOTA_DEBITO', 'Nota de débito'),
    ('Remito', 'REMITO', 'Remito de mercadería');

-- Agregar columna tipo_comprobante_id a la tabla expenses
ALTER TABLE expenses ADD COLUMN tipo_comprobante_id INTEGER REFERENCES tipo_comprobantes(id);

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_expenses_tipo_comprobante ON expenses(tipo_comprobante_id);
CREATE INDEX IF NOT EXISTS idx_tipo_comprobantes_activo ON tipo_comprobantes(activo);
