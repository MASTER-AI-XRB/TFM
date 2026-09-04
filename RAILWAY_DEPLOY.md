# Guía de despliegue en Railway - Servidor Socket.IO

Esta guía explica paso a paso cómo desplegar el servidor Socket.IO en Railway.

## Requisitos previos

1. **Cuenta de Railway**: [https://railway.app](https://railway.app) (gratuita)
2. **Repositorio GitHub**: el proyecto debe estar en GitHub
3. **Base de datos PostgreSQL**: la misma que usas en Vercel

## Paso 1: Crear proyecto en Railway

1. Accede a [Railway.app](https://railway.app) e inicia sesión con GitHub
2. Clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Selecciona el repositorio `XARXANGLESOLA`

## Paso 2: Configurar el servicio

### Opción A: Configuración manual (recomendado)

1. Railway detectará el proyecto automáticamente
2. En la configuración del servicio:
   - **Root Directory**: déjalo vacío (o `/` si lo pide)
   - **Build Command**: déjalo vacío (Railway lo detectará)
   - **Start Command**: `node socket-server.js`

### Opción B: Usando railway.json

Si Railway no detecta la configuración, asegúrate de que `railway.json` esté en el repositorio.

## Paso 3: Configurar variables de entorno

En Railway Dashboard → Servicio → Variables, añade:

### Variables obligatorias:

```
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_base_datos?schema=public
NODE_ENV=production
PORT=3001
AUTH_SECRET=<el mismo que en Vercel>
NOTIFY_SECRET=<el mismo que AUTH_SECRET o un secreto para /notify>
```

### Variables opcionales (recomendadas):

```
NEXT_PUBLIC_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.vercel.app
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

Para **notificaciones con la app cerrada** (Web Push), añade también:

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

**Importante**:
- `DATABASE_URL`: debe ser la **misma** que usas en Vercel
- `PORT`: Railway asignará un puerto; puedes especificar 3001
- `NEXT_PUBLIC_ALLOWED_ORIGINS`: incluye la URL de tu aplicación Vercel

## Paso 4: Configurar build y deploy

Railway detectará automáticamente:
- **Node.js** como runtime
- instalación de dependencias con **pnpm**
- **pnpm exec prisma generate** (también vía script `postinstall`)

Si hay problemas, configura manualmente:

### Build Command:
```bash
pnpm install && pnpm exec prisma generate
```

### Start Command:
```bash
node socket-server.js
```

## Paso 5: Obtener la URL del servidor

1. Una vez desplegado, Railway te dará una URL como:
   - `https://tu-servidor.up.railway.app`
   - o una URL personalizada si has configurado un dominio

2. **Copia esa URL**: la necesitarás en Vercel

## Paso 6: Verificar el despliegue

1. Abre la URL del servidor en un navegador
2. Deberías ver un error 404 o similar (es normal: no es una página web)
3. Revisa los logs en Railway:
   ```
   Socket.IO servidor corriendo en el puerto XXXX
   Orígenes permitidos: [...]
   ```

## Paso 7: Configurar Vercel

Conecta Vercel al servidor Railway:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Añade:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://tu-servidor.up.railway.app
   ```
3. Haz un redeploy en Vercel

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

Asegúrate de que el build incluye `prisma generate`:
```bash
pnpm install && pnpm exec prisma generate
```

O verifica que `package.json` tenga:
```json
"postinstall": "prisma generate"
```

### Error: "Database connection failed"

- Verifica que `DATABASE_URL` esté bien configurada
- Asegúrate de que la base de datos acepta conexiones externas
- Comprueba que el firewall permite conexiones desde Railway

### Error: "Port already in use"

Railway asigna el puerto automáticamente. El código debe usar `process.env.PORT`:
```javascript
const port = process.env.PORT || 3001
```

### Error: "Build failed"

Posibles causas:
1. **Dependencias faltantes**: verifica `package.json`
2. **Prisma no genera**: `prisma/schema.prisma` debe existir y estar bien configurado
3. **Versión de Node**: puedes especificarla en `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### El servidor no arranca

Revisa los logs:
1. Railway Dashboard → Servicio → Logs
2. Busca errores de conexión a la base de datos
3. Verifica que todas las variables de entorno estén configuradas

### Errores CORS

Asegúrate de que `NEXT_PUBLIC_ALLOWED_ORIGINS` incluye la URL de Vercel:
```
NEXT_PUBLIC_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.vercel.app
```

## Notas importantes

- **Base de datos compartida**: el servidor Socket.IO y Vercel deben compartir la **misma** base de datos PostgreSQL
- **HTTPS**: Railway lo proporciona automáticamente
- **Puerto**: Railway lo asigna; no hace falta fijarlo a mano
- **Logs**: en tiempo real en Railway Dashboard
- **Redeploy**: cada push al repositorio hace un redeploy automático

## Actualizar el despliegue

1. Haz push de los cambios a GitHub
2. Railway hará un redeploy automático
3. O pulsa "Redeploy" en Railway Dashboard

## Costes

Railway ofrece:
- **Plan gratuito**: 5 $ de crédito al mes
- **Hobby**: 5 $/mes con más recursos
- El servidor Socket.IO es ligero y debería caber en el plan gratuito

## Soporte

Si hay problemas:
1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Comprueba que la base de datos sea accesible
4. Documentación de Railway: [https://docs.railway.app](https://docs.railway.app)
