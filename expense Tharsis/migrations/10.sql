-- Crear tabla de transacciones de saldo para control y auditoria
CREATE TABLE IF NOT EXISTS saldo_transacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('carga', 'descuento', 'ajuste')), 
    monto REAL NOT NULL,
    saldo_anterior REAL NOT NULL,
    saldo_nuevo REAL NOT NULL,
    descripcion TEXT,
    realizado_por TEXT NOT NULL, -- quien hizo el cambio
    fecha_transaccion DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_saldo_transacciones_user_currency ON saldo_transacciones(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_saldo_transacciones_fecha ON saldo_transacciones(fecha_transaccion);
CREATE INDEX IF NOT EXISTS idx_saldo_transacciones_tipo ON saldo_transacciones(tipo);
CREATE INDEX IF NOT EXISTS idx_saldo_transacciones_realizado_por ON saldo_transacciones(realizado_por);