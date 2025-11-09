-- Agregar columna para razón de rechazo de gastos
ALTER TABLE expenses ADD COLUMN rejection_reason TEXT;

-- Agregar columna para quién rechazó el gasto
ALTER TABLE expenses ADD COLUMN rejected_by TEXT;

-- Agregar columna para fecha de rechazo
ALTER TABLE expenses ADD COLUMN rejected_at DATETIME;
