# Migración de secretos y recomendaciones

Este documento explica cómo mover las claves y secretos desde archivos de configuración al mecanismo de secretos de tu plataforma (Cloud provider / CI secrets). El repositorio ya no asume uso de Wrangler/Cloudflare CLI — trata las instrucciones a continuación como ejemplos genéricos y adapta al gestor de secretos que uses.

1) Verifica que has eliminado todas las claves sensibles del control de versiones (por ejemplo `wrangler.json`, `wrangler.toml`, `wrangler.config.js`). No metas secretos en archivos versionados.

2) Rotar las claves:
   - Si alguna clave estaba expuesta (ej: `JWT_SECRET`, `RESEND_API_KEY`), rotala en los servicios correspondientes (Resend API, Mocha) y genera una nueva.

3) Guardar secretos en el gestor de secretos de tu plataforma (ejemplo genérico):
```powershell
# pega el valor de JWT_SECRET y presiona Enter
# pega el valor de RESEND_API_KEY y presiona Enter
# Autentica con la CLI de tu plataforma y guarda el secreto
mycli secret put JWT_SECRET
# pega el valor de JWT_SECRET y presiona Enter
mycli secret put RESEND_API_KEY
# pega el valor de RESEND_API_KEY y presiona Enter
mycli secret put MOCHA_USERS_SERVICE_API_KEY
### DBA Exec Key

If you keep the DBA endpoint, protect it with an additional secret to avoid accidental exposure via a leaked cookie or compromised admin account. Set it with:

```powershell
mycli secret put DBA_EXEC_KEY
```

Then call the endpoint with an extra header:

curl -H "Authorization: Bearer <token>" -H "x-dba-key: <secret>" -X POST https://.../api/dba/execute -d '{"query": "SELECT ..."}'

```

4) Para desarrollo local, usa `.env` (NO debe agregarse al repo) o la variable `.dev.vars` para wrangler. Mantén `.env.example` con placeholders.

5) Recomendación de seguridad de Tokens y contraseñas:
   - No uses `btoa(payload + '.' + secret)` como token. Implementa JWT firmes con `jose` o `jsonwebtoken`.
   - Usa hashing con `bcrypt` o `argon2` para contraseñas y agrega `salt`.

6) Comandos para limpiar el repo de secretos históricos (opcional/avanzado):
   - Usar `git filter-repo` o `BFG` para eliminar secretos sensibles del historial de commits.

7) Validación:
   - Despliega en un entorno staging y prueba los endpoints que dependen de estas claves (env vars) antes de mover a producción.

   ### Habilitar operaciones de escritura en DBA (opcional y peligroso)

   Si en algún momento necesitas que el endpoint DBA permita INSERT/UPDATE/DELETE o DDL, **hazlo sólo bajo las siguientes condiciones**:

   - Mantén `DBA_EXEC_KEY` secreto y solo disponible para administradores de confianza.
   - Requiere `Authorization: Bearer <token>` con un usuario `admin` autenticado.
   - Habilita el flag `ALLOW_DBA_WRITE` en tu entorno (Cloudflare Secrets) de forma temporal y limitada: 
      - `mycli secret put ALLOW_DBA_WRITE` y escribe `true` como valor.
      - O usa `DBA_ALLOW_MUTATIONS=true` como alternativa si lo prefieres.
   - Auditoría: Todas las operaciones ejecutadas a través del endpoint DBA se registran en la tabla `dba_logs` si existe. Revisa esa tabla periódicamente.

   Si no habilitas `ALLOW_DBA_WRITE`, el endpoint DBA seguirá permitiendo solo SELECT como medida de seguridad por defecto.
