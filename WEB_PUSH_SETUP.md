# Configuración Web Push (notificaciones con la app cerrada)

Para recibir notificaciones cuando la app está cerrada hay que configurar las claves VAPID y las variables de entorno.

## 1. Generar claves VAPID

En la raíz del proyecto:

```bash
pnpm generate-vapid
```

Sale algo como:

```
=======================================
Public Key:
BPx...xxx

Private Key:
yyy...zzz
=======================================
```

## 2. Variables de entorno

Añade a tu `.env` (y a los env de producción: Vercel, Railway, etc.):

```
VAPID_PUBLIC_KEY=<la Public Key del paso 1>
VAPID_PRIVATE_KEY=<la Private Key del paso 1>
```

Opcional:

```
VAPID_MAILTO=mailto:tu@email.com
```

Si no pones `VAPID_MAILTO`, se usa `mailto:noreply@xarxanglesola.local`.

## 3. Base de datos

Tras generar las claves y configurar el env:

```bash
pnpm exec prisma generate
pnpm exec prisma db push
```

(o `pnpm exec prisma migrate dev` si usas migraciones).

**Nota:** Cierra el servidor de desarrollo antes de ejecutar `prisma generate` si sale error `EPERM` (archivo bloqueado).

## 4. Producción

- Configura `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en los env de tu hosting.
- Asegúrate de que la app corre en **HTTPS** (Web Push lo exige; localhost es válido en dev).
- `NEXT_PUBLIC_APP_URL` debe estar definido si quieres enlaces absolutos en las notificaciones (p. ej. `https://tu-dominio.com`).

## Resumen

| Qué | Dónde |
|-----|-------|
| Generar VAPID | `pnpm generate-vapid` |
| Añadir env | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| DB | `prisma generate` + `prisma db push` (o migrate) |
| HTTPS | Obligatorio en producción |

Si no configuras VAPID, las notificaciones solo se recibirán con la app abierta (vía Socket), como antes.

## 5. Servidor Socket (Railway)

El servidor Socket.IO (Railway) es quien recibe las peticiones `/notify` desde Vercel y envía tanto la notificación in-app (socket) como la push (navegador). En **Railway** debes tener:

| Variable | Descripción |
|----------|-------------|
| `AUTH_SECRET` o `NOTIFY_SECRET` | **El mismo valor** que en Vercel. Si no coincide, Vercel recibirá 401 al llamar `/notify`. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Las mismas claves que en Vercel. Sin esto no se envían notificaciones push con la app cerrada. |
| `DATABASE_URL` | La misma BD que Vercel (Neon), para leer preferencias y suscripciones push. |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (p. ej. `https://xarxanglesola.vercel.app`) para enlaces en las notificaciones. |

En **Vercel** hace falta:

- `NEXT_PUBLIC_SOCKET_URL`: URL del servidor Socket en Railway (p. ej. `https://xarxanglesola-production.up.railway.app`).
- `AUTH_SECRET` (o `NOTIFY_SECRET`): el mismo valor que en Railway.

## 6. Depuración

- **Vercel (Build & Logs)**: Si sale `Notify reserva-preferits fallit` con `status: 401`, el token no coincide: comprueba que `AUTH_SECRET` (o `NOTIFY_SECRET`) sea idéntico en Vercel y Railway.
- **Railway (Logs)**: Busca `[notify]`:
  - `Enviat via socket: <userId>` → notificación enviada por Socket (usuario con la app abierta).
  - `Web Push enviat: <userId>` → notificación enviada como push (navegador).
  - `VAPID no configurat` → añade las claves VAPID en Railway.
  - `Cap subscripció push` → el usuario no ha activado notificaciones en el navegador o no se ha guardado la suscripción (debe entrar en Configuración y activarlas).
- **App abierta**: Si el socket no conecta (401 en `socket-token`), el usuario no recibirá notificaciones in-app; el login y el token de Socket.IO deben ser correctos.
