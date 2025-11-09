-- Rollback para migración 13
-- Eliminar columna tipo_comprobante_id de expenses
-- Nota: SQLite no soporta DROP COLUMN directamente, 
-- se requiere recrear la tabla sin la columna

-- Eliminar tabla tipo_comprobantes
DROP TABLE IF EXISTS tipo_comprobantes;

-- Eliminar índices
DROP INDEX IF EXISTS idx_expenses_tipo_comprobante;
DROP INDEX IF EXISTS idx_tipo_comprobantes_activo;
