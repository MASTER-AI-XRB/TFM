# Checklist de producción - Xarxa Anglesola

Estado alineado con el stack actual (Next.js 15.5, React 19, PostgreSQL, Vercel + Railway).

## Seguridad

### Completado
- [x] Validaciones de inputs y sanitización
- [x] Rate limiting básico
- [x] Headers de seguridad HTTP (CSP, HSTS en producción)
- [x] Validación de tipos y tamaño de archivo (sin multer)
- [x] CORS configurado (`NEXT_PUBLIC_ALLOWED_ORIGINS` en el socket)
- [x] Sesión HMAC (cookie HttpOnly, SameSite=lax) + NextAuth (Google)
- [x] Mutaciones de API por POST (p. ej. `POST /api/auth/socket-token`)
- [x] Contraseñas con bcrypt; token de socket de corta duración

### Por implementar (escala / hardening extra)
- [ ] Rate limiting con Redis a mayor escala
- [ ] Logging de seguridad estructurado
- [ ] Detección de actividad sospechosa

## Base de datos

### Completado
- [x] PostgreSQL (Prisma) en local y en producción (Neon)
- [x] Índices en Product, Message, Favorite
- [x] Relaciones configuradas

### Por implementar
- [ ] Backups automáticos (Neon / proveedor)
- [ ] Replicación (si hace falta)
- [ ] Connection pooling explícito (PgBouncer) si el tráfico lo exige

## Infraestructura

### Completado
- [x] App en Vercel: [https://xarxanglesola.vercel.app](https://xarxanglesola.vercel.app)
- [x] Socket.IO en Railway
- [x] HTTPS (Vercel / Railway)
- [x] Gestor de paquetes **pnpm**; Node **≥ 18.18**

### Por configurar
- [ ] Dominio propio y DNS (opcional)
- [ ] Monitoring y alertas (Sentry o similar)
- [ ] Load balancer / varias instancias (si hace falta)

## Imágenes

### Completado
- [x] Validación de tipos y tamaño
- [x] Vercel Blob en producción; `public/uploads/` en desarrollo

### Por implementar
- [ ] Redimensionado y compresión de imágenes
- [ ] CDN dedicado (Blob ya sirve por HTTPS)

## Rendimiento

### Completado
- [x] Índices de base de datos
- [x] Límites de consultas (p. ej. mensajes)

### Por implementar
- [ ] Caching (Redis)
- [ ] Paginación de productos
- [ ] Optimizar bundle size de forma continua

## Monitoring y logging

### Por implementar
- [ ] Sentry o similar para error tracking
- [ ] Logging estructurado
- [ ] APM y alertas críticas

## Escalabilidad

### Por considerar
- [ ] Redis para rate limiting (y, si aplica, adaptador Socket.IO)
- [ ] Varias instancias del servidor Socket
- [ ] Colas para tareas pesadas

## Documentación

### Completado
- [x] README (stack, instalación, entrega TFM)
- [x] DEPLOYMENT.md, VERCEL_DEPLOY.md, RAILWAY_DEPLOY.md
- [x] Tests: [docs/TESTING.md](docs/TESTING.md) (Vitest, Playwright, React Doctor vs `pnpm audit`)

## Testing

### Completado
- [x] Tests unitarios (Vitest)
- [x] Tests E2E (Playwright)
- [x] Tests de rutas de auth (p. ej. socket-token)

### Por implementar
- [ ] Tests de carga

## Ley y cumplimiento

### Completado
- [x] Política de privacidad (`/privacy`)
- [x] Términos (`/terms`)
- [x] Exportar / borrar cuenta (RGPD)
- [x] Banner de cookies

## Prioridad alta (operación continua)
1. Backups automáticos de PostgreSQL
2. Monitoring básico (errores 5xx, Socket caído)
3. Revisar `pnpm audit` tras cambios de dependencias (independiente de React Doctor)

## Prioridad media
1. Caching y rate limiting con Redis
2. Redimensionado de imágenes
3. Tests de carga

## Prioridad baja
1. Dominio propio
2. Optimizaciones avanzadas de rendimiento
