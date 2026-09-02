# Guía de configuración de Vercel Blob Storage

Esta guía explica cómo configurar Vercel Blob Storage para subir imágenes de productos en producción.

## Requisitos

- Cuenta de Vercel con el proyecto desplegado
- Acceso al Dashboard de Vercel

## Paso 1: Crear Blob Store

1. **Accede a Vercel Dashboard**:
   - Ve a [https://vercel.com](https://vercel.com)
   - Inicia sesión si hace falta

2. **Accede a tu proyecto**:
   - Clic en el proyecto "XARXANGLESOLA"

3. **Abre la sección Storage**:
   - En el menú lateral, ve a **"Storage"**
   - O directo: `https://vercel.com/[tu-org]/xarxanglesola/storage`

4. **Crea un nuevo Blob Store**:
   - Clic en **"Create Store"** o **"Create Blob Store"**
   - Nombre del store: `images` (o el que quieras)
   - Region: la más cercana (normalmente `iad1` - US East)
   - Clic en **"Create"**

## Paso 2: Verificar el token automático

Tras crear el Blob Store:

1. Vercel genera automáticamente un token: `BLOB_READ_WRITE_TOKEN`
2. Ese token debería añadirse solo a las **Environment Variables** del proyecto

## Paso 3: Verificar que el token está configurado

1. **Ve a Environment Variables**:
   - Proyecto → **Settings** → **Environment Variables**
   - O directo: `https://vercel.com/[tu-org]/xarxanglesola/settings/environment-variables`

2. **Comprueba que existe `BLOB_READ_WRITE_TOKEN`**:
   - Debería aparecer en la lista
   - Value: un token largo (normalmente empieza por `vercel_blob_rw_...`)
   - Environments: marcado para **Production** (y Preview si quieres)

3. **Si NO existe**:
   - Ve a **Storage** → selecciona tu store
   - Busca **"Tokens"** o **"Settings"**
   - Copia el token `BLOB_READ_WRITE_TOKEN`
   - Ve a **Settings** → **Environment Variables**
   - Añade a mano:
     - **Key**: `BLOB_READ_WRITE_TOKEN`
     - **Value**: el token copiado
     - **Environments**: marca **Production** (y **Preview** si quieres)
     - Clic en **"Save"**

## Paso 4: Redeploy

Tras configurar el token:

1. **Opción A: Redeploy manual**:
   - Ve a **Deployments**
   - Busca el último deploy
   - Clic en los tres puntos `...` → **"Redeploy"**

2. **Opción B: Redeploy automático**:
   - Haz un pequeño cambio al proyecto (cualquier commit)
   - Vercel hará deploy automático con la nueva variable

## Paso 5: Probar

Tras el redeploy:

1. Abre la app desplegada en Vercel
2. Inicia sesión
3. Ve a **"Nuevo producto"**
4. Sube una imagen
5. Publica el producto
6. Verifica que la imagen se muestra correctamente

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN no configurado"

- **Causa**: el token no está configurado en Vercel
- **Solución**: sigue el paso 3 para verificar/añadir el token

### Error: "Error al subir imágenes a Vercel Blob"

- **Causa**: token inválido o permisos incorrectos
- **Solución**:
  - Verifica que el token esté bien copiado (sin espacios extra)
  - Asegúrate de que el token sea `BLOB_READ_WRITE_TOKEN` (no `BLOB_READ_TOKEN`)

### Las imágenes no se muestran

- **Causa**: puede faltar configurar `next.config.js` para permitir imágenes de Blob
- **Solución**: el código ya está adaptado; verifica que `next.config.js` tenga `remotePatterns` para `*.public.blob.vercel-storage.com`

## Notas

- **Plan gratuito**: incluye 1 GB de almacenamiento y 10 GB de transferencia/mes
- **Las imágenes son públicas**: se usa `access: 'public'` para que se muestren
- **Fallback**: si el token no está configurado, el código intentará el sistema de archivos local (solo funciona en local, no en Vercel)

## Verificación final

Una vez configurado, deberías poder:

- Subir imágenes al crear un producto
- Ver las imágenes en los productos públicos
- Las imágenes se guardan de forma permanente (no se pierden en cada deploy)

**Siguiente paso**: una vez configurado Blob Storage, las imágenes funcionarán. El chat en producción usa el servidor Socket.IO en Railway.
