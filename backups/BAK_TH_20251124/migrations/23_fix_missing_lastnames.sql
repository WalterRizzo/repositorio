-- Asigna un apellido temporal 'sinapellido' a los usuarios que no tengan apellido
UPDATE users SET lastname = 'sinapellido' WHERE lastname IS NULL OR TRIM(lastname) = '';

-- Ahora puedes volver a correr el script de actualización de user_id.