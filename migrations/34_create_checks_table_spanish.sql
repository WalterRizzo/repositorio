-- Create checks table with Spanish column names
CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT CHECK(tipo IN ('propio', 'tercero')) NOT NULL,
    numero_cheque TEXT NOT NULL,
    banco TEXT NOT NULL,
    emisor_beneficiario TEXT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    importe REAL NOT NULL,
    moneda TEXT NOT NULL,
    estado TEXT CHECK(estado IN ('en cartera', 'depositado', 'endosado', 'pagado', 'rechazado', 'anulado')) NOT NULL,
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_checks_unique_check ON checks (numero_cheque, banco);

-- Create trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_checks_updated_at
AFTER UPDATE ON checks
FOR EACH ROW
BEGIN
    UPDATE checks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
