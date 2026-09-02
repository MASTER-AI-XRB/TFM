# Guía de deploy en Vercel - Xarxa Anglesola

Esta guía explica cómo desplegar el proyecto en Vercel de forma rápida.

## Requisitos previos

1. **Cuenta de Vercel** (gratuita): [https://vercel.com/signup](https://vercel.com/signup)
2. **Base de datos PostgreSQL**: necesaria para producción (ver opciones abajo)
3. **Repositorio GitHub**: el proyecto está en `git@github.com:MASTER-AI-XRB/XARXANGLESOLA.git`

## Base de datos PostgreSQL

Vercel no proporciona bases de datos. Hay que configurar una externa. Opciones gratuitas:

### Opción 1: Neon (recomendado) — gratuito
- URL: [https://neon.tech](https://neon.tech)
- PostgreSQL gestionado
- Plan gratuito: 512 MB de espacio

### Opción 2: Supabase — gratuito
- URL: [https://supabase.com](https://supabase.com)
- PostgreSQL + funcionalidades extra

### Opción 3: Railway — gratuito (limitado)
- URL: [https://railway.app](https://railway.app)
- 5 $ de crédito gratis al mes

## Paso 1: Preparar el schema de Prisma

Antes de desplegar, configura Prisma para PostgreSQL:

1. **Actualiza `prisma/schema.prisma`**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Nota**: Después del deploy, puedes mantener SQLite para desarrollo local si quieres.

## Paso 2: Desplegar en Vercel

### Método 1: Dashboard de Vercel (recomendado)

1. **Accede a Vercel**:
   - Ve a [https://vercel.com](https://vercel.com)
   - Inicia sesión con GitHub

2. **Importa el proyecto**:
   - Clic en "Add New..." → "Project"
   - Selecciona el repositorio `MASTER-AI-XRB/XARXANGLESOLA`
   - Vercel detectará Next.js automáticamente

3. **Configuración del proyecto**:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (déjalo vacío)
   - **Build Command**: `pnpm build` (o el valor por defecto)
   - **Output Directory**: `.next` (por defecto)
   - **Install Command**: `pnpm install` (o el valor por defecto)

### Método 2: Vercel CLI

```bash
pnpm add -g vercel
vercel
```

Sigue las instrucciones de la CLI.

## Paso 3: Configurar variables de entorno

En Vercel Dashboard → Project → Settings → Environment Variables, añade:

### Variables obligatorias:

```
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_base_datos?schema=public
NODE_ENV=production
```

### NextAuth y Google OAuth (obligatorias si usas «Continuar con Google»):

```
NEXTAUTH_URL=https://xarxanglesola.vercel.app
AUTH_SECRET=<una cadena larga y aleatoria, p.ej. openssl rand -base64 32>
GOOGLE_CLIENT_ID=<tu Client ID de Google Cloud>
GOOGLE_CLIENT_SECRET=<tu Client Secret de Google Cloud>
```

**Importante**:
- `NEXTAUTH_URL`: debe ser **exactamente** la URL de producción, **sin** barra final (p. ej. `https://xarxanglesola.vercel.app`). Si falta o es incorrecta, verás `error=OAuthSignin` al pulsar «Continuar con Google».
- `AUTH_SECRET`: la misma que usas en local, o genera una nueva para producción.
- **Google Cloud Console**: en [Credentials](https://console.cloud.google.com/apis/credentials) → tu cliente OAuth → "Authorized redirect URIs" debe incluir:
  ```
  https://xarxanglesola.vercel.app/api/auth/callback/google
  ```
  (Añade también `http://localhost:3000/api/auth/callback/google` si tienes dev en local.)

### Variables opcionales (recomendadas):

```
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_ALLOWED_ORIGINS=https://tu-proyecto.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://tu-proyecto.vercel.app
```

**Importante**:
- `DATABASE_URL`: URL de tu base de datos PostgreSQL
- `NEXT_PUBLIC_APP_URL`: se actualiza tras el primer deploy
- Para `NEXT_PUBLIC_SOCKET_URL`, ver la sección Socket.IO más abajo

### Configurar por entornos:

- **Production**: variables de producción
- **Preview**: variables para previews (opcional)
- **Development**: variables para desarrollo local (opcional)

## Paso 4: Ejecutar migraciones de la base de datos

Tras el primer deploy:

```bash
pnpm exec prisma migrate deploy
```

O vía Vercel CLI:

```bash
vercel env pull .env.local
pnpm exec prisma migrate deploy
```

## Paso 5: Configurar imágenes (importante)

Las imágenes se guardan en `public/uploads/`. En Vercel:

1. **Opción 1**: Vercel Blob Storage
2. **Opción 2**: servicio externo (Cloudinary, AWS S3, etc.)
3. **Opción 3**: dejarlo así (las imágenes se perderán en cada redeploy)

**Nota**: `public/uploads/` se regenera en cada deploy. En producción, usa cloud storage (este proyecto usa Vercel Blob).

## Paso 6: Socket.IO

Socket.IO con `server.js` personalizado **no funciona directamente** en Vercel (funciones serverless).

### Soluciones:

1. Deshabilitar Socket.IO temporalmente: el chat no funcionará hasta adaptarlo
2. Adaptar Socket.IO a funciones serverless (requiere cambios de código)
3. **Servidor separado**: ejecutar Socket.IO en Railway, Render, etc. (es lo que usa este proyecto)

Deja `NEXT_PUBLIC_SOCKET_URL` apuntando al servidor de Railway. Ver [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md).

## Paso 7: Verificar el deploy

1. Vercel hará el deploy automáticamente
2. Verás la URL del proyecto (p. ej. `https://xarxanglesola.vercel.app`)
3. Visita la URL y comprueba que funciona

## Troubleshooting

### Error `OAuthSignin` al pulsar «Continuar con Google» en producción
- **`NEXTAUTH_URL`**: debe estar definida en Vercel y ser exactamente `https://xarxanglesola.vercel.app` (sin barra final). Es la causa más habitual.
- **Google Cloud**: en "Authorized redirect URIs" debe estar `https://xarxanglesola.vercel.app/api/auth/callback/google`.
- **Variables en Vercel**: comprueba que `AUTH_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` están definidas para el entorno **Production**.
- Tras cambiar variables, hay que hacer **Redeploy**.

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté bien configurada
- Asegúrate de que la base de datos acepta conexiones exteriores
- Comprueba que el firewall permite conexiones desde IPs de Vercel

### Error: "Prisma Client not generated"
- Vercel ejecuta `postinstall` automáticamente (incluye `prisma generate`)
- Si sigue fallando, verifica `package.json` → `postinstall`

### Las imágenes no se cargan
- Asegúrate de que `public/uploads/` existe (local) o de que Blob está configurado (producción)
- Verifica permisos
- En producción usa cloud storage

### Error de build
- Revisa los logs de build en Vercel Dashboard
- Verifica que todas las dependencias estén en `package.json`

## Notas adicionales

- **Builds automáticos**: cada push a `main` hace un deploy
- **Preview deployments**: cada pull request genera una URL de preview
- **Custom domain**: puedes configurar un dominio en Settings → Domains

## Soporte

Si hay problemas:
1. Revisa los logs en Vercel Dashboard → Deployments
2. Consulta la documentación de Vercel: [https://vercel.com/docs](https://vercel.com/docs)
3. Revisa esta guía

**Siguiente paso**: una vez desplegado, puedes configurar un dominio personalizado y optimizar para producción.
