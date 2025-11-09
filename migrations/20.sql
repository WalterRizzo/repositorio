-- Agregar campo descuenta_saldo a tipo_comprobantes
-- Por defecto TRUE (1), excepto para tarjetas de crédito/débito que será FALSE (0)

ALTER TABLE tipo_comprobantes ADD COLUMN descuenta_saldo INTEGER DEFAULT 1;

-- Actualizar los tipos existentes de tarjetas para que NO descuenten saldo
UPDATE tipo_comprobantes 
SET descuenta_saldo = 0 
WHERE codigo LIKE '%TC%' OR codigo LIKE '%TD%' OR nombre LIKE '%Tarjeta%' OR nombre LIKE '%tarjeta%';
