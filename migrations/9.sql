-- Crear tabla de saldos por usuario y moneda para soporte multimoneda
CREATE TABLE IF NOT EXISTS saldos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ARS',
    balance REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, currency)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_saldos_user_currency ON saldos(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_saldos_currency ON saldos(currency);

-- Migrar saldos existentes de la tabla users a la nueva tabla saldos
INSERT OR IGNORE INTO saldos (user_id, currency, balance, created_at, updated_at)
SELECT 
    id as user_id,
    'ARS' as currency,
    COALESCE(balance, 0.0) as balance,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM users 
WHERE id IS NOT NULL;

-- También migrar desde user_profiles si existe
INSERT OR IGNORE INTO saldos (user_id, currency, balance, created_at, updated_at)
SELECT 
    user_id,
    'ARS' as currency,
    COALESCE(balance, 0.0) as balance,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM user_profiles 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT user_id FROM saldos WHERE currency = 'ARS');