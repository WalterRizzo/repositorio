-- Migration: Add Formapago table and link to expenses
CREATE TABLE IF NOT EXISTS formapago (
    sigla CHAR(2) PRIMARY KEY,
    descripcion CHAR(55) NOT NULL,
    afectaSaldo BIT NOT NULL
);

ALTER TABLE expenses ADD COLUMN sigla CHAR(2);
-- Optionally, add a foreign key constraint if supported:
-- ALTER TABLE expenses ADD CONSTRAINT fk_formapago_sigla FOREIGN KEY (sigla) REFERENCES formapago(sigla);

-- Seed common payment methods
INSERT OR IGNORE INTO formapago (sigla, descripcion, afectaSaldo) VALUES ('EF', 'EFECTIVO BILLETE', 1);
INSERT OR IGNORE INTO formapago (sigla, descripcion, afectaSaldo) VALUES ('TR', 'TRANSFERENCIA', 0);
INSERT OR IGNORE INTO formapago (sigla, descripcion, afectaSaldo) VALUES ('TC', 'TARJETA DE CREDITO', 0);
INSERT OR IGNORE INTO formapago (sigla, descripcion, afectaSaldo) VALUES ('TD', 'TARJETA DE DEBITO', 0);
