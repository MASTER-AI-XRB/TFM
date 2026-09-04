## Diagrama general

```mermaid
flowchart TD
  U["Usuario"] --> UI["Frontend Next.js (Vercel)"]
  UI -->|HTTP| API["API Routes Next.js"]
  UI -->|Socket.IO| WS["Servidor Socket.IO (server.js)"]
  API --> DB[(PostgreSQL)]
  WS --> DB
  API --> BLOB["Vercel Blob"]
  WS --> NOTIF["Notificaciones en el navegador"]

  subgraph Frontend
    UI --> P1["Página Login / Registro"]
    UI --> P2["Productos"]
    UI --> P3["Favoritos"]
    UI --> P4["Mis productos"]
    UI --> P5["Detalle de producto"]
    UI --> P6["Chat"]
    UI --> P7["Preferencias de notificaciones"]
  end

  subgraph Backend
    API --> A1["/api/auth/*"]
    API --> A2["/api/products"]
    API --> A3["/api/favorites"]
    API --> A4["/api/notification-preferences"]
    WS --> S1["Eventos Socket.IO"]
    WS --> S2["/notify"]
  end
```

## Conexiones entre componentes

```mermaid
flowchart LR
  UI[Frontend Next.js] -->|fetch| API[API Routes]
  UI -->|socket.io-client| WS[Socket.IO server]
  API -->|Prisma| DB[(PostgreSQL)]
  WS -->|Prisma| DB
  API -->|put| BLOB[Vercel Blob]
```

## Flujo: autenticación y entrada a la app

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Frontend
  participant API as /api/auth/login
  participant DB as PostgreSQL

  U->>UI: Introduce nickname + contraseña
  UI->>API: POST /api/auth/login
  API->>DB: Verifica usuario (bcrypt)
  DB-->>API: Usuario válido
  API-->>UI: Cookie HMAC HttpOnly (SameSite=lax)
  UI-->>U: Navega a /app
```

## Flujo: publicar producto

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Frontend
  participant API as /api/products
  participant BLOB as Vercel Blob
  participant DB as PostgreSQL

  U->>UI: Rellena formulario + sube imágenes
  UI->>API: POST /api/products (multipart)
  API->>BLOB: Upload imágenes
  BLOB-->>API: URL imágenes
  API->>DB: Crear producto
  DB-->>API: Producto creado
  API-->>UI: Producto creado
  UI-->>U: Redirige a /app
```

## Flujo: añadir a favoritos + notificación

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Frontend
  participant API as /api/favorites
  participant DB as PostgreSQL
  participant WS as Socket.IO server

  U->>UI: Clic en "Favorito"
  UI->>API: POST /api/favorites
  API->>DB: Crear Favorite
  DB-->>API: OK
  API->>WS: POST /notify (tipo "favorite")
  WS->>DB: Leer preferencias del receptor
  WS-->>WS: Filtrar si hace falta
  WS-->>UI: app-notification (si procede)
```

## Flujo: chat en tiempo real

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant API as /api/auth/socket-token
  participant WS as Socket.IO server
  participant DB as PostgreSQL

  UI->>API: POST /api/auth/socket-token
  API-->>UI: token de corta duración
  UI->>WS: connect (auth token)
  WS->>DB: Carga últimos mensajes
  WS-->>UI: load-messages
  UI->>WS: general-message
  WS->>DB: Guarda mensaje
  WS-->>UI: general-message (broadcast)
```

## Flujo: preferencias de notificaciones

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Frontend
  participant API as /api/notification-preferences
  participant DB as PostgreSQL

  U->>UI: Abre modal de preferencias
  UI->>API: GET /api/notification-preferences
  API->>DB: Lee preferencias
  DB-->>API: Datos de preferencias
  API-->>UI: Muestra valores
  U->>UI: Guarda cambios
  UI->>API: PUT /api/notification-preferences
  API->>DB: Upsert preferencias
  DB-->>API: OK
  API-->>UI: Confirmación
```

## Notas rápidas
- El frontend y las API conviven en Next.js 15.5 (React 19); gestor **pnpm**.
- La sesión va en cookie HMAC HttpOnly; el chat pide token con **POST** `/api/auth/socket-token`.
- Socket.IO corre en `server.js` (local) o `socket-server.js` (Railway) y comparte BD con la API.
- Las notificaciones push del navegador se gestionan en el cliente (VAPID).
- Las preferencias se aplican antes de emitir notificaciones vía `/notify`.
