-- Revertir migración 14: Eliminar tabla tipo_comprobantes y columna relacionada
DROP INDEX IF EXISTS idx_expenses_tipo_comprobante;
ALTER TABLE expenses DROP COLUMN tipo_comprobante_id;
DROP TABLE IF NOT EXISTS tipo_comprobantes;
