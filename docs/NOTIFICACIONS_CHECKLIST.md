# Checklist: notificaciones «producto reservado»

Las notificaciones **«Producto reservado»** (y la actualización de iconos en tiempo real) dependen de la reserva en la API, del servidor Socket en Railway y de la configuración. Este documento resume cómo está el código y qué hay que comprobar.

---

## 1. Quién recibe la notificación

La notificación **«Producto reservado»** solo se envía a usuarios que:

- Tienen el producto **en favoritos**.
- **No** son quien ha hecho la reserva (quien reserva no se notifica a sí mismo).

Para probar que llegan las notificaciones hace falta:

1. **Usuario A**: tiene el producto en favoritos.
2. **Usuario B** (otra cuenta): reserva el producto.
3. La notificación debe llegar a **Usuario A**, no a Usuario B.

Si pruebas con un solo usuario (tú reservas un producto que tú mismo tienes en favoritos), **no recibirás** notificación porque el código excluye explícitamente a quien reserva.

---

## 2. Variables de entorno

### Vercel (API y frontend)

| Variable | Necesaria | Por qué |
|----------|-----------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Sí | URL del servidor Socket (Railway). Sin ella no se llama `/notify` ni `/broadcast-product-state`. |
| `AUTH_SECRET` (o `NOTIFY_SECRET`) | Sí | Token que Vercel envía a Railway en la cabecera `x-notify-token`. Si falta, los logs de Vercel lo indican. |

### Railway (servidor Socket)

| Variable | Necesaria | Por qué |
|----------|-----------|---------|
| `AUTH_SECRET` (o `NOTIFY_SECRET`) | Sí | **Debe ser el mismo valor que en Vercel.** Si no coincide, Railway responde 401 y las notificaciones no se envían. |
| `DATABASE_URL` | Sí | La misma base de datos que Vercel (Neon). El servidor Socket lee usuarios, favoritos, preferencias y suscripciones push. |
| `NEXT_PUBLIC_ALLOWED_ORIGINS` | Sí (producción) | Orígenes CORS permitidos. Incluye la URL de la app (p. ej. `https://xarxanglesola.vercel.app`) para que el navegador pueda conectar al Socket. |
| `NEXT_PUBLIC_APP_URL` | Recomendado | URL de la app para enlaces correctos en notificaciones push. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Opcional | Para notificaciones push con la app cerrada. Sin ellas, solo se reciben in-app (socket) con la app abierta. |

Resumen: **el mismo `AUTH_SECRET` en Vercel y Railway** y **`NEXT_PUBLIC_SOCKET_URL`** en Vercel apuntando a la URL pública del servicio Socket en Railway.

---

## 3. Flujo del código (para depurar)

1. **Vercel** (ruta `PATCH /api/products/[id]/reserve`):
   - Tras actualizar la reserva, busca usuarios con el producto en favoritos (excepto quien reserva).
   - Si hay, envía `POST {NEXT_PUBLIC_SOCKET_URL}/broadcast-product-state` (iconos) y `POST .../notify` por cada usuario (notificación «Producto reservado»).
   - **Logs en Vercel**: si no hay ningún usuario en favoritos, sale: *«Notificacions reserva: cap usuari…»*. Si hay, sale: *«Notificacions reserva: enviant a N usuari(s)…»*. Si faltan `NEXT_PUBLIC_SOCKET_URL` o `AUTH_SECRET`, salen warnings.

2. **Railway** (`socket-server.js`):
   - Recibe `POST /notify` con `x-notify-token` y el cuerpo (targetUserId, title, message, action, etc.).
   - Comprueba el token (`AUTH_SECRET` o `NOTIFY_SECRET`). Si no, responde 401.
   - Consulta preferencias (`shouldSendNotification`). Si las preferencias excluyen este tipo/nickname/producto, no envía (log: *«[notify] Omès per preferències»*).
   - Si el usuario está conectado por Socket: emite `app-notification` (log: *«[notify] Enviat via socket»*).
   - Si no está conectado y tiene suscripción push y VAPID: envía Web Push (log: *«[notify] Web Push enviat»*).

3. **Cliente** (navegador):
   - `AppSocketProvider` tiene un solo socket y escucha `app-notification`. Al recibirlo, muestra el toast (y lo añade a la campana).
   - Las páginas escuchan el evento `product-state` para actualizar iconos de reserva/préstamo.

Para recibir la notificación **in-app**, el usuario que debe recibirla (el que tiene el producto en favoritos) debe tener la app abierta y estar conectado al Socket.

---

## 4. Preferencias de notificación

En **Configuración → Notificaciones** el usuario puede:

- **Recibir todas las notificaciones**: si está activo, recibe todo (por defecto).
- Si lo desactiva, solo recibe según nicknames o palabras clave configurados.

Si un usuario tiene «Recibir todas» desactivado y no coincide ningún filtro, el servidor Socket **omite** el envío. Para probar, asegúrate de que el usuario que debe recibir tiene «Recibir todas» activado o un filtro que coincida.

---

## 5. Cómo probar paso a paso

1. **Dos usuarios**: dos cuentas (dos navegadores o una ventana privada / otro dispositivo).
2. **Usuario A**: inicia sesión, entra al producto, **añádelo a favoritos**, deja la app abierta.
3. **Usuario B**: inicia sesión, entra al mismo producto, **reserva**.
4. En la sesión de **Usuario A** debería aparecer:
   - La notificación «Producto reservado» (toast + campana),
   - Y los iconos del producto actualizados (reservado).

Si no aparece:

- En **Vercel** (logs de la API): comprueba si sale «enviando a 1 usuario(s)» o «ningún usuario con el producto en favoritos».
- En **Railway** (logs del Socket): «[notify] Enviat via socket», «Omès per preferències» o 401 (token incorrecto).
- En el **navegador** (Usuario A): asegúrate de que está conectado (si has cerrado todas las pestañas, no hay socket; solo recibiría push si está configurado).

---

## 6. Resumen rápido

| Qué | Dónde | Acción |
|-----|-------|--------|
| Notificación «Producto reservado» | Solo quien tiene el producto en **favoritos** y **no** es quien reserva | Probar con 2 usuarios; A favoritos, B reserva. |
| Variables | Vercel | `NEXT_PUBLIC_SOCKET_URL`, `AUTH_SECRET` (o `NOTIFY_SECRET`). |
| Variables | Railway | `AUTH_SECRET` (el mismo que Vercel), `DATABASE_URL`, `NEXT_PUBLIC_ALLOWED_ORIGINS`. |
| Token 401 | Vercel ↔ Railway | Revisar que `AUTH_SECRET` (o `NOTIFY_SECRET`) sea **idéntico**. |
| Notificación in-app | Cliente | El usuario que debe recibir debe tener la app abierta (socket conectado). |
| Preferencias | Configuración | Para probar, «Recibir todas» activado o un filtro que coincida. |

Si tras comprobar esto las notificaciones siguen sin llegar, los logs de Vercel y Railway indican dónde se corta la cadena.

---

## 7. Probar en local (antes de producción)

Sí, puedes probar el flujo de notificaciones **en local**; el comportamiento es el mismo que en producción.

**Qué hace falta:**

1. **Un solo terminal**: `pnpm dev`. Arranca Next.js (3000) y el servidor Socket (3001) a la vez. **No hace falta** ejecutar `node socket-server.js` aparte; `socket-server.js` es solo para desplegar en Railway.

2. **Variables de entorno en local** (`.env` o `.env.local`):
   - `DATABASE_URL`: la misma base de datos que usarás (p. ej. Neon); el servidor Socket en local también la necesita.
   - `AUTH_SECRET`: el mismo que usarás en producción (o un valor de prueba; debe coincidir entre Next.js y el socket).

3. **URL del socket en local**: el **navegador** se conecta solo a `http://localhost:3001`. Las **API routes** también llaman al socket **local** (`http://127.0.0.1:3001`) cuando `NODE_ENV === 'development'`, gracias a `getSocketServerUrl()`.

4. **Prueba**: dos usuarios, uno con el producto en favoritos y el otro reservando; la notificación debe aparecer en quien tiene el producto en favoritos.

---

## 8. Tests: ¿son suficientes?

Los tests e2e actuales (auth, favorites, product-status, products, reset-password) cubren login, favoritos, reserva/desreserva y préstamo a nivel de API y UI; **no** comprueban que el servidor Socket reciba `/notify` ni que el cliente reciba `app-notification`.

**¿Son suficientes para desplegar?** Sí, para el flujo principal (reserva, favoritos, producto). Para cubrir las notificaciones se podría añadir:

- **Unit**: mockear `fetch` en la ruta de reserva y comprobar que se llama `POST .../notify` cuando hay usuarios con el producto en favoritos.
- **E2E con Socket real**: un test con dos contextos; es más frágil porque depende del servidor y del timing.

Recomendación: con los tests actuales basta para ir a producción; si quieres más cobertura, un test unitario que mockee `/notify` es el paso útil.
