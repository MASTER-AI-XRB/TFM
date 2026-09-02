# Xarxa Anglesola

Plataforma vecinal para **prestar y pedir productos**, con catálogo, reservas y chat en tiempo real. El barrio comparte lo que ya tiene, sin tienda ni pagos: herramientas, libros, bicis o lo que pueda circular entre vecinos.

Este repositorio es el **Trabajo de Fin de Máster** (máster agnóstico en tecnología). El criterio no es la idea en abstracto, sino una aplicación real, desplegada y documentada.

| Recurso | URL |
|--------|-----|
| **App en funcionamiento** | [https://xarxanglesola.vercel.app](https://xarxanglesola.vercel.app) |
| **Código (GitHub)** | [https://github.com/MASTER-AI-XRB/XARXANGLESOLA](https://github.com/MASTER-AI-XRB/XARXANGLESOLA) |
| **Presentación (slides)** | [docs/presentacio.html](docs/presentacio.html) — abre el archivo en el navegador |

Si el repositorio es privado, hay que conceder acceso a `mouredev@gmail.com`.

---

## Descripción general

Xarxa Anglesola resuelve un problema cotidiano: muchas cosas se usan poco y se pueden prestar al vecindario, pero coordinarlo por WhatsApp o de palabra no escala. La app ofrece:

1. Un **catálogo** de productos con fotos y estado (disponible, reservado, en préstamo).
2. Un **ciclo de préstamo** (publicar → reservar → contactar en el chat → marcar préstamo).
3. **Comunicación** en chat general y en conversaciones privadas ligadas a un producto.
4. **Cuenta** con nickname + contraseña o Google, preferencias y derechos RGPD (exportar / borrar datos).

El frontend y la API viven en **Next.js** (Vercel). El chat y las notificaciones push pasan por un servidor **Socket.IO** (`server.js` / `socket-server.js`) pensado para **Railway**. Las imágenes de producto se guardan en **Vercel Blob** en producción. La persistencia es **PostgreSQL** vía Prisma.

Idiomas de la interfaz: **catalán**, castellano e inglés. Tema claro / oscuro. PWA (manifest) para instalarla en el móvil.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Estilos | Tailwind CSS (tema `primary` sky, `darkMode: class`) |
| Auth | Sesión propia (cookie HMAC) + NextAuth (Google OAuth) |
| API | Route Handlers en `app/api/` |
| Tiempo real | Socket.IO (`server.js` en local; `socket-server.js` en Railway) |
| Base de datos | PostgreSQL + Prisma 5 |
| Archivos | Vercel Blob (producción); `public/uploads/` en desarrollo |
| Notificaciones | Web Push (VAPID) + toasts in-app |
| i18n | `next-intl` + proveedor propio (`lib/i18n.tsx`), mensajes en `messages/` |
| Correo | Nodemailer (recuperación de contraseña) |
| Tests | Vitest (unitario) + Playwright (e2e) |
| Despliegue | Vercel (web/API) + Railway (Socket.IO) + Neon/PostgreSQL |

Node 18+ (`package.json` declara `engines.node >= 18`). Gestor de paquetes: **pnpm**.

---

## Instalación y ejecución

### Requisitos

- Node.js 18 o superior
- pnpm
- PostgreSQL (local o alojado: Neon, Supabase, Railway, …)

### Camino rápido

1. Clona el repositorio e instala dependencias:

```bash
pnpm install
```

2. Copia el ejemplo de entorno y rellena como mínimo `DATABASE_URL` y `AUTH_SECRET`:

```bash
cp .env.example .env
```

3. Genera el cliente Prisma y aplica el esquema:

```bash
pnpm db:generate
pnpm exec prisma db push
```

4. Arranca web + Socket.IO:

```bash
pnpm dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Socket.IO: [http://localhost:3001](http://localhost:3001) (`SOCKET_PORT`)

5. Entra con un nickname (≥ 3 caracteres) y contraseña, o con Google si has rellenado `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

`pnpm install` ejecuta `prisma generate` (`postinstall`).

### Scripts útiles

| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Desarrollo (`server.js`: Next + Socket) |
| `pnpm build` | Build de Next.js |
| `pnpm start` | Producción local (`NODE_ENV=production node server.js`) |
| `pnpm test:unit` | Tests Vitest |
| `pnpm test:e2e` | Tests Playwright |
| `pnpm lint` | ESLint |
| `pnpm generate-vapid` | Claves Web Push |
| `pnpm db:studio` | Prisma Studio |

Detalle de tests: [docs/TESTING.md](docs/TESTING.md). Checklist de variables: [docs/ENV_CHECKLIST.md](docs/ENV_CHECKLIST.md).

---

## Estructura del proyecto

```
├── app/                      # App Router (páginas + API)
│   ├── page.tsx              # Login / registro
│   ├── layout.tsx            # Providers (i18n, tema, auth, cookies)
│   ├── privacy/ · terms/     # Legal
│   ├── reset-password/       # Recuperación de contraseña
│   ├── app/                  # Zona autenticada
│   │   ├── page.tsx          # Catálogo de productos
│   │   ├── favorites/        # Favoritos
│   │   ├── my-products/      # Productos del usuario
│   │   ├── products/         # Alta, detalle, edición
│   │   ├── chat/             # Chat general y privado
│   │   ├── configuracio/     # Cuenta, Google, RGPD
│   │   └── complete-profile/ # Nickname después de OAuth
│   ├── api/                  # Route Handlers
│   │   ├── auth/             # Login, logout, Google, reset, socket-token
│   │   ├── products/         # CRUD, reserva, préstamo
│   │   ├── favorites/
│   │   ├── notifications/    # VAPID + suscripción push
│   │   ├── gdpr/             # Exportar / borrar datos
│   │   └── users/
│   └── manifest.ts           # PWA
├── components/               # UI compartida (nav, toasts, tema, onboarding)
├── lib/                      # Auth, Prisma, validación, i18n, socket, tema
├── prisma/schema.prisma      # Modelos: User, Product, Message, Favorite, …
├── messages/                 # Traducciones ca / es / en
├── tests/                    # Vitest + Playwright
├── server.js                 # Next + Socket.IO (local / proceso único)
├── socket-server.js          # Solo Socket.IO (Railway)
├── docs/                     # Diagramas, testing, presentación TFM
│   └── presentacio.html      # Slides de entrega
├── VERCEL_DEPLOY.md          # Despliegue web
├── RAILWAY_DEPLOY.md         # Despliegue Socket.IO
└── DOC-TFM.pdf               # Enunciado del TFM
```

Diagramas de flujo (Mermaid): [docs/DIAGRAMA_APP.md](docs/DIAGRAMA_APP.md).

---

## Funcionalidades principales

| Área | Qué puede hacer el usuario |
|------|----------------------------|
| **Autenticación** | Registro / login con nickname + email + contraseña; «Continuar con Google»; completar nickname después de OAuth; recuperar contraseña por correo; vincular / desvincular Google |
| **Catálogo** | Listar productos (cuadrícula o lista), filtros por nombre / usuario / fechas, vistas móvil y escritorio |
| **Publicación** | Crear producto (nombre, descripción opcional, 1–4 fotos); editar y borrar los propios |
| **Préstamo** | Reservar (o cancelar reserva); el propietario marca «en préstamo»; estado visible en el catálogo |
| **Favoritos** | Añadir / quitar; lista dedicada; el propietario puede recibir aviso |
| **Chat** | Sala general; DM con otro usuario ligado a un producto; persistencia en PostgreSQL |
| **Notificaciones** | Campana in-app; Web Push; preferencias (tipos, palabras clave, nicknames) |
| **Cuenta** | Configuración, exportación RGPD, eliminación de cuenta, cookie banner, términos y privacidad |
| **UX** | Onboarding guiado, i18n (ca/es/en) y botón para traducir textos, tema claro/oscuro, PWA |

El ciclo previsto: alguien **publica** → un vecino **reserva** y abre el **chat privado** → coordinan la entrega → el propietario marca **préstamo** hasta que vuelve el objeto.

---

## Despliegue

La app de producción está en **[https://xarxanglesola.vercel.app](https://xarxanglesola.vercel.app)**.

Arquitectura de producción:

```
Navegador  →  Next.js (Vercel)  →  PostgreSQL
                 │
                 └── Socket.IO (Railway)  →  PostgreSQL
                       └── Web Push
Imágenes    →  Vercel Blob
```

1. **Vercel** — frontend y API routes. Variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_*`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`, `VAPID_*`. Guía: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md).
2. **Railway** — `socket-server.js`. Variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_ALLOWED_ORIGINS`, `VAPID_*`, `NEXT_PUBLIC_APP_URL`. Guía: [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md).
3. **PostgreSQL** — Neon (o equivalente). `pnpm db:migrate` / `prisma db push` según el entorno.
4. **Google Cloud** — URI de callback: `https://xarxanglesola.vercel.app/api/auth/callback/google`.

Checklist de producción: [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md). Login y OAuth: [docs/PRODUCCIO_LOGIN.md](docs/PRODUCCIO_LOGIN.md).

---

## Presentación

Las **slides** del TFM son un HTML autocontenido:

- Archivo: [docs/presentacio.html](docs/presentacio.html)
- Uso: ábrelo con el navegador (doble clic o «Open with Live Server»). Flechas o espacio para avanzar. `F` para pantalla completa. Imprimir / guardar como PDF desde el navegador si hay que adjuntar un documento.

---

## Entrega TFM (requisitos)

Correspondencia con [DOC-TFM.pdf](DOC-TFM.pdf):

| Requisito | Dónde está |
|-----------|------------|
| 1. Documentación (descripción, stack, instalación, estructura, funcionalidades) | Este `README.md` |
| 2. Código | Repositorio GitHub (opción preferida del enunciado) |
| 3. Despliegue | https://xarxanglesola.vercel.app — también documentado aquí |
| 4. Slides | `docs/presentacio.html` dentro del directorio del código |

---

## Licencia

ISC (`package.json`). Uso vecinal / académico; los intercambios entre usuarios son responsabilidad de los usuarios (véase [Términos](https://xarxanglesola.vercel.app/terms)).
