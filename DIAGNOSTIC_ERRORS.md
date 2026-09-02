# Guía de diagnóstico de errores 500

Este documento ayuda a diagnosticar y resolver errores 500 en Vercel.

## Paso 1: Identificar el error

El error 500 significa que ha habido un problema en el servidor. Para saber qué ha pasado:

### Opción A: Logs de Vercel (recomendado)

1. **Accede a Vercel Dashboard**:
   - Ve a [https://vercel.com](https://vercel.com)
   - Selecciona el proyecto "XARXANGLESOLA"

2. **Abre los logs**:
   - Ve a **"Deployments"**
   - Clic en el último deploy
   - Ve a la pestaña **"Functions"** o **"Logs"**
   - O directo: `https://vercel.com/[tu-org]/xarxanglesola/[deployment-id]/logs`

3. **Busca errores**:
   - Filtra por nivel **"Error"**
   - Busca mensajes que empiecen por:
     - `Error creant producte:`
     - `Error pujant imatge a Blob:`
     - `Error carregant productes:`
     - `Blob error name:` / `Blob error message:`

### Opción B: Consola del navegador

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **"Network"**
3. Busca la petición que ha dado error 500 (normalmente en rojo)
4. Clic sobre ella y ve a **"Response"** o **"Preview"** para ver el mensaje

## Errores comunes y soluciones

### Error 1: "Error al pujar imatges. Configura Vercel Blob Storage per producció."

**Causa**: `BLOB_READ_WRITE_TOKEN` no está configurado o no es válido.

**Solución**:
1. Ve a **Settings** → **Environment Variables**
2. Verifica que existe `BLOB_READ_WRITE_TOKEN`
3. Si no existe, sigue la guía `VERCEL_BLOB_SETUP.md`
4. Si existe pero el error persiste:
   - Elimina la variable y añádela de nuevo
   - Asegúrate de que el token empieza por `vercel_blob_rw_...`
   - Verifica que está marcado para **Production**

### Error 2: "Error d'autenticació amb Vercel Blob. Verifica BLOB_READ_WRITE_TOKEN."

**Causa**: el token no es válido o no tiene los permisos correctos.

**Solución**:
1. Ve a **Storage** → selecciona tu Blob Store
2. Crea un nuevo token o verifica que existe
3. Copia el token completo (sin espacios)
4. Ve a **Environment Variables** → actualiza `BLOB_READ_WRITE_TOKEN`
5. Haz **Redeploy**

### Error 3: "Error creant producte" (sin más detalles)

**Causa**: puede ser problemas con la base de datos (Prisma), validación de datos u otros errores del servidor.

**Solución**:
1. Mira los **logs de Vercel** para el detalle completo
2. Verifica que `DATABASE_URL` está bien configurado
3. Comprueba que la base de datos es accesible

### Error 4: "Error carregant productes"

**Causa**: problema de conexión con la base de datos o formato incorrecto de las imágenes.

**Solución**:
1. Verifica `DATABASE_URL` en **Environment Variables**
2. Comprueba que la base de datos (Neon) está activa
3. Mira los logs por si hay problemas con `JSON.parse(product.images)`

## Checklist de verificación

Antes de buscar más errores, verifica:

- [ ] `DATABASE_URL` está configurado en Vercel y es correcto (formato `postgresql://...`)
- [ ] `BLOB_READ_WRITE_TOKEN` está configurado (si intentas subir imágenes)
- [ ] Todas las variables de entorno tienen el entorno **Production** marcado
- [ ] Has hecho **Redeploy** después de cambiar variables
- [ ] La base de datos Neon está activa y accesible

## Cómo hacer Redeploy

Si has cambiado variables de entorno:

1. **Opción A**: Redeploy manual — Deployments → último deploy → `...` → **"Redeploy"**
2. **Opción B**: commit y push — cualquier cambio pequeño; Vercel hará deploy automático

### Error: "Error in PostgreSQL connection: Error { kind: Closed, cause: None }" (en local con `pnpm dev`)

**Causa**: la conexión con la base de datos (PostgreSQL, p. ej. Neon) se ha cerrado (inactividad, reinicio del servidor, o demasiados clientes abiertos).

**Qué hacer**:

1. **Un solo cliente Prisma**: el proyecto debe usar el cliente compartido de `lib/prisma.ts` en las API routes, no crear `new PrismaClient()` en cada petición. Si alguna ruta crea un cliente propio y hace `$disconnect()`, puede provocar problemas.
2. **Neon**: usa la **connection string con pooler** (en la consola de Neon sale “Pooled connection” o similar). Reduce errores de conexión cerrada.
3. **En local**: reinicia `pnpm dev`; a veces el Hot Reload deja conexiones antiguas.

Si el error sale de vez en cuando y la app responde bien, puede ser solo un log de Prisma cuando la BD cierra una conexión idle; no hace falta hacer nada más si todo funciona.

## Cuándo pedir ayuda

Si sigues con problemas, prepara esta información:

1. **Qué estabas haciendo** cuando apareció el error (subir producto, cargar página, etc.)
2. **Mensaje de error exacto** de los logs de Vercel
3. **Captura de pantalla** de Environment Variables (sin mostrar valores sensibles)
4. **Fecha y hora** aproximada del error

**Nota**: el código incluye logging detallado. Revisa siempre los logs de Vercel para ver los detalles completos.
