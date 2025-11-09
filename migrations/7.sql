-- Migración 7: Soporte para múltiples archivos adjuntos por gasto
-- Agregar tabla para múltiples archivos adjuntos

CREATE TABLE IF NOT EXISTS expense_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE
);

CREATE INDEX idx_expense_attachments_expense_id ON expense_attachments(expense_id);

-- Migrar archivos existentes desde receipt_photo_url a la nueva tabla
INSERT INTO expense_attachments (expense_id, filename, original_name, content_type, file_size)
SELECT 
  id as expense_id,
  receipt_photo_url as filename,
  'recibo.' || CASE 
    WHEN receipt_photo_url LIKE '%.jpg' THEN 'jpg'
    WHEN receipt_photo_url LIKE '%.jpeg' THEN 'jpeg'
    WHEN receipt_photo_url LIKE '%.png' THEN 'png'
    WHEN receipt_photo_url LIKE '%.webp' THEN 'webp'
    ELSE 'jpg'
  END as original_name,
  'image/jpeg' as content_type,
  0 as file_size
FROM expenses 
WHERE receipt_photo_url IS NOT NULL 
  AND receipt_photo_url != '';