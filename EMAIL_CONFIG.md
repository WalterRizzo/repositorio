# Configuración de Email para Alertas de Seguridad

## Servicio Recomendado: Resend (https://resend.com)

### Pasos para configurar:

1. Crear cuenta en https://resend.com (gratis hasta 3,000 emails/mes)
2. Verificar dominio o usar el dominio de prueba
3. Generar API Key
4. Agregar la API key como secreto en el gestor de secretos de tu plataforma (Cloudflare, Netlify, Vercel, AWS Secrets Manager, etc.).

Ejemplo genérico con la CLI de tu plataforma:

```bash
mycli secret put RESEND_API_KEY
```

5. Actualizar el código en `src/worker/index.ts` línea ~85:
   - Reemplazar `'Bearer re_123456789'` 
   - Por: `\`Bearer ${c.env.RESEND_API_KEY}\``

6. Agregar el binding / variable secreta en la configuración de tu plataforma (ej.: variables de entorno, bindings, etc.).

```json
{
  "vars": {
    "RESEND_API_KEY": "..."
  }
}
```

## Email de Notificación

Cuando un usuario es bloqueado por 3 intentos fallidos:
- Se envía email a: wrizzo6802@gmail.com
- Contenido: 
  - Nombre y email del usuario bloqueado
  - Hora del bloqueo
  - Duración (30 minutos)
  - User Agent del navegador

## Seguridad Implementada

✅ Máximo 3 intentos fallidos
✅ Bloqueo automático por 30 minutos
✅ Notificación por email al admin
✅ Contador de intentos restantes
✅ Auto-desbloqueo después del tiempo
✅ Reset de intentos en login exitoso
