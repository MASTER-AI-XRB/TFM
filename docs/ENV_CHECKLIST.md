# Checklist de variables de entorno

## Lo que tienes en Vercel (vercel.png)

Variables configuradas en el proyecto Vercel:

| Variable | Entornos |
|----------|----------|
| `AUTH_SECRET` | All Environments |
| `BLOB_READ_WRITE_TOKEN` | All Environments |
| `DATABASE_URL` | Production and Preview |
| `GOOGLE_CLIENT_ID` | All Environments |
| `GOOGLE_CLIENT_SECRET` | All Environments |
| `NEXTAUTH_URL` | All Environments |
| `NEXT_PUBLIC_ALLOWED_ORIGINS` | All Environments |
| `NEXT_PUBLIC_APP_URL` | All Environments |
| `NEXT_PUBLIC_SOCKET_URL` | All Environments |
| `VAPID_PRIVATE_KEY` | All Environments |
| `VAPID_PUBLIC_KEY` | All Environments |

**Vercel está completo** para lo que usa el código: auth, DB, Google, Socket, VAPID, Blob y enlaces.  
*Nota:* `NEXT_PUBLIC_ALLOWED_ORIGINS` la usa el **servidor Socket en Railway** (CORS), no Next.js; tenerla en Vercel no molesta pero allí no se utiliza.

---

## Lo que tienes en Railway (railway.png)

Variables configuradas en el servicio Socket de Railway:

| Variable | Para el servidor Socket |
|----------|-------------------------|
| `AUTH_SECRET` | Sí (tokens de sesión). |
| `DATABASE_URL` | Sí (Prisma, push subscriptions). |
| `NEXT_PUBLIC_ALLOWED_ORIGINS` | Sí (CORS, URL de Vercel). |
| `VAPID_PUBLIC_KEY` | Sí (web-push). |
| `VAPID_PRIVATE_KEY` | Sí (web-push). |

**No las usa el servidor Socket** (puedes dejarlas o quitarlas):  
`EMAIL_PASS` (el envío de email es en Vercel, no en el socket), `NODE_ENV` (Railway a menudo la inyecta).

**Falta añadir en Railway:**  
- **`NEXT_PUBLIC_APP_URL`** = URL de la app (p. ej. `https://xarxanglesola.vercel.app`). Sin ella, el enlace al pulsar una notificación push puede ser incorrecto.

Opcional: `NOTIFY_SECRET` (el mismo que en Vercel), `VAPID_MAILTO`.  
`PORT` Railway a menudo lo inyecta; si no, añádelo.

**Variables que Railway añade automáticamente** (no hace falta configurarlas):  
`RAILWAY_PUBLIC_DOMAIN`, `RAILWAY_PRIVATE_DOMAIN`, `RAILWAY_PROJECT_NAME`, `RAILWAY_ENVIRONMENT_NAME`, `RAILWAY_SERVICE_NAME`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID`.

---

## Lo que tienes en local

**`.env`** (4 variables):
- `NEXT_PUBLIC_SOCKET_URL`
- `DATABASE_URL`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

**`.env.local`** (5 variables):
- `NEXT_PUBLIC_SOCKET_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

En local, Next.js combina `.env` y `.env.local` (`.env.local` tiene prioridad). Tienes lo básico para login, DB, socket y VAPID.

---

## Variables opcionales (si faltan en algún sitio)

| Variable | Dónde | Qué pasa si no está |
|----------|-------|---------------------|
| `NOTIFY_SECRET` | Vercel y Railway | Si no está, el código usa `AUTH_SECRET` para `/notify`. Si la pones, debe ser **la misma** en ambos sitios. |
| `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Vercel | Solo para «olvidé la contraseña»; sin ellas no se envía correo. |
| `VAPID_MAILTO` | Railway | Opcional; para web-push. Por defecto: `mailto:noreply@xarxanglesola.local`. |

---

## Resumen

- **Vercel:** con lo que sale en vercel.png tienes lo necesario (auth, DB, Google, Socket, VAPID, Blob, enlaces).
- **Railway:** tienes `AUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_ALLOWED_ORIGINS`, `VAPID_*`. **Añade** `NEXT_PUBLIC_APP_URL` (URL de Vercel) para que las notificaciones push abran el enlace correcto. `EMAIL_PASS` y `NODE_ENV` no las usa el socket; las 8 variables `RAILWAY_*` las inyecta Railway.
- **Local:** `.env` + `.env.local` bastan para desarrollar.
