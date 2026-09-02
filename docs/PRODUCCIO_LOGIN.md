# Producción: login, OAuth y configuración

Los flujos de login (formulario, Google, desvincular, cambiar cuenta) funcionan igual en producción. Hay que asegurar **variables de entorno**, **Google OAuth** y **base de datos**.

---

## 1. Variables de entorno obligatorias

### Vercel (Next.js + API routes)

| Variable | Obligatoria | Notas |
|----------|-------------|-------|
| `NEXTAUTH_URL` | **Sí** | URL pública de la app **sin** barra final (ej.: `https://xarxanglesola.vercel.app`). En Vercel puedes omitirla si tienes `VERCEL_URL` (el código hace fallback). |
| `AUTH_SECRET` | **Sí** | Necesaria para sesiones y cookies. En producción, sin ella el middleware devuelve 500 en APIs que no sean GET/HEAD/OPTIONS. |
| `GOOGLE_CLIENT_ID` | Sí (si usas Google) | De Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Sí (si usas Google) | De Google Cloud Console. |
| `DATABASE_URL` | **Sí** | PostgreSQL (Neon, Supabase, Railway, etc.). |

### Railway (si despliegas la app Next.js allí)

- **`NEXTAUTH_URL`**: **hay que definirla siempre**. Railway no da `VERCEL_URL`, y el fallback de `lib/nextauth.ts` solo se aplica en Vercel. Pon la URL pública del despliegue en Railway (ej.: `https://xxx.up.railway.app`).
- El resto: `AUTH_SECRET`, `GOOGLE_*`, `DATABASE_URL`, igual que en Vercel.

### Opcionales pero recomendadas

- `NEXT_PUBLIC_APP_URL`: URL de la app (para links, etc.).
- `NEXT_PUBLIC_ALLOWED_ORIGINS`: orígenes permitidos para el middleware (CORS). Si la app está en `https://xarxanglesola.vercel.app`, añade ese valor. Si tienes app + Socket en dominios distintos, inclúyelos todos.

---

## 2. Google OAuth (producción)

En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → tu cliente OAuth 2.0:

**Authorized redirect URIs** debe incluir:

- Producción Vercel:  
  `https://tu-dominio.vercel.app/api/auth/callback/google`
- Producción Railway (si se usa):  
  `https://tu-dominio.up.railway.app/api/auth/callback/google`
- Local:  
  `http://localhost:3000/api/auth/callback/google` (o el puerto que uses).

**Authorized JavaScript origins** (si lo tienes configurado):

- Las mismas bases: `https://...vercel.app`, `https://...railway.app`, `http://localhost:3000`.

Si falta la URI de producción, verás errores tipo `redirect_uri_mismatch` o `OAuthSignin` al pulsar «Continuar con Google».

---

## 3. Base de datos (Prisma)

- **Schema**: `User.lastLoginAt` se ha añadido al schema. En producción la BD debe estar actualizada.
- **Cómo hacerlo**:
  - Con migraciones: `pnpm exec prisma migrate deploy` (después de configurar `DATABASE_URL` de producción).
  - Con `db push`: `pnpm exec prisma db push` (adecuado si no usas migraciones en prod).

Sin esto, las APIs que leen/escriben `lastLoginAt` pueden fallar.

---

## 4. Cookies y dominios

- Las sesiones (NextAuth + `xarxa_session`) se configuran con `secure: true` en producción y `sameSite: 'lax'`.
- No hace falta configurar dominio de cookies si la app se sirve desde el mismo dominio (ej.: todo en `xarxanglesola.vercel.app`).
- Si la app y el Socket están en dominios distintos (ej.: app en Vercel, Socket en Railway), `NEXT_PUBLIC_ALLOWED_ORIGINS` debe incluir ambos y CORS/cookies deben estar bien en los servicios que hagan APIs; los flujos de **login en sí** no cambian.

---

## 5. Resumen por entorno

| Entorno | NEXTAUTH_URL | Otros |
|---------|--------------|-------|
| **Vercel** | Opcional si hay `VERCEL_URL`; recomendado ponerla igual | `AUTH_SECRET`, `GOOGLE_*`, `DATABASE_URL`. Redirect URI de Google = `https://...vercel.app/api/auth/callback/google`. |
| **Railway** | **Obligatoria**: URL pública del deploy | Igual que arriba. Redirect URI = `https://...railway.app/api/auth/callback/google`. |
| **Local** | Opcional (`http://localhost:3000`) | Google redirect URI incluye `http://localhost:3000/...`. |

---

## 6. Comprobar que todo va bien

1. **Formulario**: login / registro con nickname + contraseña.
2. **Google**: «Continuar con Google» → selector de cuentas → entrar a la app.
3. **Configuración**: «Desvincular Google» → logout → volver a entrar con formulario o Google.
4. **Cambiar cuenta**: «Cambiar la cuenta de Google» → logout → selector de Google → elegir otra cuenta y entrar.

Si todo esto funciona en local y en producción tienes las variables, Google y la BD correctos, el comportamiento debe ser el mismo en Vercel y en Railway.
