-- Migración 7 Down: Revertir tabla de archivos adjuntos
-- Esta migración eliminará la tabla expense_attachments y restaurará el campo receipt_photo_url

-- Restaurar receipt_photo_url desde el primer attachment de cada gasto
UPDATE expenses 
SET receipt_photo_url = (
  SELECT filename 
  FROM expense_attachments 
  WHERE expense_attachments.expense_id = expenses.id 
  LIMIT 1
)
WHERE id IN (SELECT DISTINCT expense_id FROM expense_attachments);

-- Eliminar la tabla de archivos adjuntos
DROP TABLE IF EXISTS expense_attachments;