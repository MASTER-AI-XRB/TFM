# Cambios para producción - Xarxa Anglesola

Este documento describe las mejoras implementadas para preparar la aplicación para uso global.

## 2026 — Stack, auth y supply-chain

- Next.js **15.5.24**, React **19**, NextAuth **4.24.15**, Nodemailer **9**, PostCSS **8.5.26**
- Token de Socket.IO: **POST** `/api/auth/socket-token` (ya no GET); sesión HMAC o NextAuth
- Uploads sin **multer**; Vercel Blob en producción
- Gestor **pnpm**; `engines.node` ≥ 18.18; `pnpm.overrides` (`postcss`, `nodemailer`, `minimatch`, `sharp`, `uuid`)
- Calidad: React Doctor (código UI/Next) y `pnpm audit` (CVE) son criterios distintos
- Snapshot académico del código: `MASTER-AI-XRB/TFM`; repo de trabajo: `MASTER-AI-XRB/XARXANGLESOLA`

## Seguridad

### Validaciones y sanitización
- Validación de nicknames (longitud, caracteres permitidos)
- Validación de nombres de productos
- Validación de descripciones
- Validación de mensajes
- Validación de archivos de imagen (tipo, tamaño)
- Sanitización de strings de entrada
- Sanitización de nombres de archivo

### Protecciones
- Rate limiting básico (100 peticiones por 15 minutos)
- Headers de seguridad HTTP configurados
- CORS configurado con soporte para varios dominios
- Validación de contenido de mensajes
- Límites de tamaño de archivo (5 MB)

## Base de datos

### Optimizaciones
- Índices en Product (userId, createdAt)
- Índices en Message (userId, createdAt)
- Índices en Favorite (productId)
- Schema preparado para PostgreSQL
- Scripts de migración añadidos

## Configuración

### Variables de entorno
- Soporte para variables de entorno
- Configuración flexible de puertos
- CORS dinámico
- URL de Socket.IO configurable

### Servidor
- Configuración de producción
- Timeouts configurados para Socket.IO
- Transports configurados (websocket, polling)

## Documentación

- README actualizado con instrucciones de producción
- DEPLOYMENT.md con guía completa
- PRODUCTION_CHECKLIST.md
- Schema de producción (PostgreSQL)

## Gestión de errores

- Clase AppError para errores personalizados
- Función handleError centralizada
- En producción los errores no revelan detalles sensibles

## Funcionalidades de producción

### Scripts
- `pnpm db:migrate` — ejecutar migraciones
- `pnpm db:generate` — generar cliente Prisma
- `postinstall` — generar Prisma automáticamente

### Rendimiento
- Índices de base de datos para consultas rápidas
- Límites de consultas (take: 50 para mensajes)
- Validaciones en el cliente para reducir peticiones innecesarias

## Próximos pasos recomendados

1. **Backups** automáticos de PostgreSQL
2. **Monitoring**: Sentry o similar
3. **Redis**: rate limiting a mayor escala (y adaptador Socket.IO si hay varias instancias)

## Notas importantes

- PostgreSQL, HTTPS (Vercel) y Blob ya están en el despliegue actual
- En local las imágenes pueden guardarse en disco; en producción se usa Vercel Blob
- El rate limiting es básico; a mayor escala, usa Redis
- Revisa `PRODUCTION_CHECKLIST.md` para las tareas pendientes
