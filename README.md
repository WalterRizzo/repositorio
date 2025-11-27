# 💰 ExpenseFlow - Gestión de Gastos Empresariales

Una aplicación moderna y completa para gestionar gastos empresariales, construida con React 19, Hono, TypeScript y Cloudflare Workers.

## 🌟 Características Principales

- ✅ **Autenticación segura**: Integración con Google OAuth vía Mocha Users Service
- 💳 **Gestión completa de gastos**: Crear, editar, eliminar y categorizar gastos
- 👥 **Roles y permisos**: Sistema de roles (Admin, Supervisor, Employee)
- 💰 **Sistema de saldos**: Gestión de saldo prepagado para empleados
- 📊 **Reportes y analytics**: Gráficos y estadísticas de gastos
- 🔄 **Sistema de aprobaciones**: Flujo de trabajo para supervisores
- 📱 **Responsive design**: Funciona perfectamente en móviles y desktop
- 🌙 **Modo oscuro**: Tema claro y oscuro
- 🏷️ **Categorización**: Organización por categorías personalizables
- 📄 **Comprobantes**: Upload y gestión de archivos adjuntos
- **Reportes y Analytics**: Gráficos y exportación a Excel
- **Subida de Recibos**: Almacenamiento de fotos de facturas en Cloudflare R2
- **Gestión de Usuarios**: Panel administrativo para roles y permisos
- **Tema Oscuro**: Interfaz moderna con soporte para modo oscuro

### 🏗️ Arquitectura Técnica

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Hono (Express-like framework) en Cloudflare Workers
- **Base de Datos**: Cloudflare D1 (SQLite)
- **Autenticación**: Mocha Users Service
- **Almacenamiento**: Cloudflare R2 para archivos
- **Deployment**: Cloudflare Workers + Pages

### 📋 Requisitos Previos

1. **Cuenta de Cloudflare**
2. **Cuenta en getmocha.com** para el servicio de autenticación
3. **Node.js 18+** y npm
4. **Herramienta CLI preferida** (se recomienda usar la que mejor se adapte a tu flujo de trabajo)

### 🔧 Configuración e Instalación

#### 1. Clonar e instalar dependencias
```bash
git clone <tu-repo>
cd expense-tharsis
npm install
```

#### 2. Configurar Cloudflare
```bash
# Autenticar con Cloudflare
Autentícate con la herramienta CLI que prefieras.

# Verificar configuración
Verifica que tus credenciales estén configuradas correctamente.
```

#### 3. Configurar base de datos
La base de datos D1 ya está configurada. Si necesitas crear una nueva:
```bash
Usa tu herramienta CLI para crear la base de datos.
# Actualiza database_id en tu configuración con el ID generado
```

#### 4. Configurar variables de entorno

**Para desarrollo (archivo .dev.vars):**
```bash
MOCHA_USERS_SERVICE_API_URL=https://users-service.getmocha.com/api
MOCHA_USERS_SERVICE_API_KEY=tu-api-key-aqui
```

**Para producción:**
```bash
npx tu_herramienta_cli secret put MOCHA_USERS_SERVICE_API_URL
# Ingresar: https://users-service.getmocha.com/api

npx tu_herramienta_cli secret put MOCHA_USERS_SERVICE_API_KEY
# Ingresar tu API key desde getmocha.com
```

### 3. Ejecutar migraciones de base de datos
```bash
# Ejecutar migraciones en local
npx wrangler d1 execute expense-app-db --local --file=./migrations/1.sql
npx wrangler d1 execute expense-app-db --local --file=./migrations/2.sql
npx wrangler d1 execute expense-app-db --local --file=./migrations/3.sql

# Ejecutar migraciones en producción
npx wrangler d1 execute expense-app-db --remote --file=./migrations/1.sql
npx wrangler d1 execute expense-app-db --remote --file=./migrations/2.sql  
npx wrangler d1 execute expense-app-db --remote --file=./migrations/3.sql

#### Nota importante: `formapago` / `sigla`

La aplicación utiliza una tabla `formapago` y la columna `sigla` en `expenses` (migration 22).
Si no ves la tabla `formapago` en tu instancia, aplica la migración 22:

```bash
npx wrangler d1 execute expense-app-db --local --file=./migrations/22.sql
npx wrangler d1 execute expense-app-db --remote --file=./migrations/22.sql
```

Ejecuta las migraciones usando tu herramienta preferida para D1 / SQLite / tu DB en local o producción.
# desde el cliente (ej. con cookie de sesión):
Ejemplo, si usas una CLI que soporte ejecutar archivos SQL contra la base de datos, úsala contra cada fichero en `./migrations/`.
### 4. Configurar variables de entorno

**Archivo .dev.vars (desarrollo local):**
```bash
MOCHA_USERS_SERVICE_API_URL=https://users-service.getmocha.com/api
MOCHA_USERS_SERVICE_API_KEY=tu-api-key-de-mocha
JWT_SECRET=tu-jwt-secret-key-segura
```

**Variables de producción:**
```bash
npx wrangler secret put MOCHA_USERS_SERVICE_API_URL
npx wrangler secret put MOCHA_USERS_SERVICE_API_KEY
npx wrangler secret put JWT_SECRET
```

### 5. Obtener credenciales de Mocha
1. Ve a [getmocha.com](https://getmocha.com)
2. Crea una cuenta o inicia sesión
3. Obtén tu API key desde el dashboard
4. Configura las variables de entorno con estos valores

### 🚀 Deployment

#### Desarrollo
```bash
npm run dev
Ejecuta ./migrations/22.sql con la herramienta SQL/DB que utilices en local o producción.

#### Producción
Use the repository-root Wrangler configuration to guarantee you deploy the intended worker (we've updated the repo so the recommended command always uses the root `wrangler.json`):

```bash
# Opción 1: Script automatizado (Windows)
npx tu_herramienta_cli secret put MOCHA_USERS_SERVICE_API_URL
npx tu_herramienta_cli secret put MOCHA_USERS_SERVICE_API_KEY
npx tu_herramienta_cli secret put JWT_SECRET
npm run build
npx wrangler deploy --config ./wrangler.json

# OR use the npm helper script
npm run deploy:prod
```

Note: the internal `.wrangler/deploy/config.json` now points at the repository's `wrangler.json` so `npx wrangler deploy` executed from CI or developer machines will use the root config by default.

### 📊 Estructura del Proyecto

Este repositorio ya no contiene despliegues automáticos con Wrangler. Para desplegar en producción sigue uno de estos caminos (elige el que prefieras):
src/
Usar servicios estáticos como Netlify / Vercel (sube `dist/client` o configura el builder)
│   ├── pages/          # Páginas de la aplicación
Crear una nueva pipeline CI/CD que tome `npm run build` y publique los assets a tu host elegido

He incluido un script de ayuda `scripts/prepare-static-deploy.js` que valida que `dist/client` exista tras `npm run build` y te deja listo para subir los archivos.
│   └── index.ts        # API endpoints
└── shared/             # Tipos compartidos
    └── types.ts        # Definiciones TypeScript

migrations/             # Migraciones de base de datos
├── 1.sql              # Tabla expenses
├── 2.sql              # Sistema de roles y aprobaciones
└── 3.sql              # Columna para recibos
```

### 🔐 Roles y Permisos

- **Employee (Usuario)**: Crear y gestionar sus propios gastos
- **Supervisor**: Aprobar/rechazar gastos + funciones de usuario  
- **Admin**: Gestión completa de usuarios, gastos y configuración del sistema

### ⚙️ Configuración Inicial

**Primer inicio del sistema:**
1. El primer usuario que se registre via Google OAuth obtendrá automáticamente rol de **Admin**
2. Los siguientes usuarios tendrán rol **Employee** por defecto
3. Los admins pueden cambiar roles desde el panel de **Gestión de Usuarios**
4. Se recomienda configurar al menos un **Supervisor** para aprobar gastos

### 🎯 Funcionalidades Clave

#### Gestión de Gastos
- Crear gastos con categorías predefinidas
- Subir fotos de recibos/facturas
- Usar saldo prepagado o solicitar reembolso
- Estados: Pendiente, Aprobado, Rechazado

#### Panel Administrativo
- Ver todos los gastos pendientes de aprobación
- Gestionar roles de usuarios
- Cargar saldo a empleados
- Estadísticas en tiempo real

#### Reportes
- Gráficos por categoría (pie chart)
- Tendencias mensuales (bar chart)
- Exportación a Excel con múltiples hojas
- Filtros por fechas y usuarios

#### Gestión de Saldo
- Sistema de saldo prepagado por empleado
- Historial de transacciones
- Reembolsos automáticos en caso de rechazo
- Validación de saldo suficiente

### 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Construir para producción  
npm run lint         # Linter de código
npm run cf-typegen   # Generar tipos de Cloudflare
npm run check        # Verificar build + dry-run deploy
```

### 🐛 Solución de Problemas

#### Error de autenticación Google OAuth
- Verifica que las variables `MOCHA_USERS_SERVICE_API_*` estén configuradas correctamente
- Confirma que tu API key de getmocha.com sea válida y tenga permisos
- Revisa que el JWT_SECRET esté configurado en producción

#### Error de base de datos
- Ejecuta las migraciones en orden: `npx wrangler d1 execute expense-app-db --remote --file=./migrations/1.sql`
- Verifica que el database_id en wrangler.json coincida con tu base de datos D1
- Confirma que la base de datos esté creada en Cloudflare Dashboard

#### No puedo acceder como administrador
- El primer usuario registrado obtiene automáticamente permisos de admin
- Si necesitas resetear roles, usa: `npx wrangler d1 execute expense-app-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'tu-email@dominio.com';"`

#### Error de deployment
- Confirma autenticación: `npx wrangler whoami`
- Verifica todas las variables: `npx wrangler secret list`
- Revisa logs en tiempo real: `npx wrangler tail`

### 📞 Soporte

- **Comunidad**: [Discord de Mocha](https://discord.gg/shDEGBSe2d)
- **Documentación**: [getmocha.com](https://getmocha.com)
- **Issues**: Crea un issue en este repositorio

## 🌐 Demo

**Aplicación desplegada**: https://expense-tharsis-app.tharsis-gastos-app.workers.dev

### Acceso:
- **Autenticación**: Utiliza Google OAuth para registro e inicio de sesión seguro
- **Roles**: El primer usuario registrado obtiene permisos de administrador automáticamente
- **Gestión de usuarios**: Los administradores pueden asignar roles desde el panel de administración

## 🤝 Contribuir

1. Fork del proyecto
2. Crear una feature branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push a la branch: `git push origin feature/nueva-funcionalidad`
5. Crear un Pull Request

## 📄 Licencia

Este proyecto fue creado usando [getmocha.com](https://getmocha.com) - MIT License.
