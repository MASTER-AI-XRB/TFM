# Tests

## Base de datos de test

Para no tocar la BD de producción, crea un archivo `.env.test` (no versionado) con:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
AUTH_SECRET="change-me-for-tests"
```

Playwright cargará automáticamente `.env.test` y arrancará el servidor con esa BD.

## Cómo ejecutar

1) Instalar navegadores (1 vez):

```
pnpm exec playwright install
```

2) Tests unitarios:

```
pnpm test:unit
```

3) Tests e2e:

**Opción A – Playwright arranca el servidor (recomendado)**  
Asegúrate de que **ningún proceso** está usando los puertos 3005 y 3006. Después:

```
pnpm exec playwright test tests/e2e/favorites.spec.ts
```

**Opción B – Servidor arrancado a mano (por ejemplo para usar `--ui`)**  
En una terminal, arranca la app en el puerto que usa Playwright:

```
pnpm dev:playwright
```

En otra terminal:

```
pnpm exec playwright test tests/e2e/favorites.spec.ts --ui
```

**Si sale "address already in use" (3005 o 3006)**  
Libera los puertos. En PowerShell (como administrador si hace falta):

```powershell
Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | Select-Object OwningProcess
Stop-Process -Id PID -Force
```

O cierra todas las terminales donde tengas `pnpm dev` o Playwright y abre una nueva.

## Probar notificaciones (reserva / favoritos) desde local

Sí, **es correcto** probar desde local y que la notificación llegue a un usuario en producción, si configuras el entorno así:

1. En tu **.env local**, pon la URL del socket de **producción** y el mismo secreto que usa el servidor de producción:
   - `NEXT_PUBLIC_SOCKET_URL=https://tu-servidor.up.railway.app`
   - `AUTH_SECRET` (o `NOTIFY_SECRET`) **igual** que el del servidor Socket en producción (Railway, etc.)

2. Al **reservar** o **desreservar** desde la app en local, tu API local hará un `POST` a `NEXT_PUBLIC_SOCKET_URL/notify`. Si esa URL es la de producción, la notificación se envía al servidor de producción y el usuario que debe recibirla (por ejemplo quien tiene el producto en favoritos) la recibe en producción (in-app si tiene la app abierta, o push si está configurado).

Requisitos: el servidor Socket en producción debe aceptar requests de tu ordenador (no bloquear por IP/firewall) y el **secreto** debe coincidir; si no, `/notify` devolverá 401 Unauthorized.

Si en local tienes `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`, las notificaciones solo irán a tu socket local y **no** llegarán a usuarios en producción.

## Limpieza automática

- Tras ejecutar los e2e, la BD de test se reinicia automáticamente.
- Si lo quieres hacer a mano:

```
pnpm test:db:reset
```
