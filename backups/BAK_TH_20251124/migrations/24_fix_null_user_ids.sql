-- Listar user_profiles con user_id nulo o vacío
SELECT * FROM user_profiles WHERE user_id IS NULL OR TRIM(user_id) = '';

-- Listar users con id nulo o vacío
SELECT * FROM users WHERE id IS NULL OR TRIM(id) = '';

-- Corregir user_profiles con user_id nulo usando el id de users
UPDATE user_profiles SET user_id = (SELECT id FROM users WHERE users.id = user_profiles.user_id) WHERE user_id IS NULL OR TRIM(user_id) = '';

-- Corregir users con id nulo usando el primer caracter del nombre + lastname
UPDATE users SET id = LOWER(SUBSTR(name, 1, 1) || lastname) WHERE id IS NULL OR TRIM(id) = '' AND lastname IS NOT NULL AND TRIM(lastname) != '';

-- Asignar 'usuariox' si no hay nombre/lastname
UPDATE users SET id = 'usuariox' WHERE (id IS NULL OR TRIM(id) = '') AND (lastname IS NULL OR TRIM(lastname) = '' OR name IS NULL OR TRIM(name) = '');