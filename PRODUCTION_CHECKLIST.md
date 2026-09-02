# Checklist de producción - Xarxa Anglesola

Este documento lista las tareas necesarias para preparar la aplicación para uso global en producción.

## Seguridad

### Completado
- [x] Validaciones de inputs implementadas
- [x] Sanitización de datos
- [x] Rate limiting básico
- [x] Headers de seguridad HTTP
- [x] Validación de tipos de archivo
- [x] Límites de tamaño de archivo
- [x] CORS configurado

### Por implementar
- [ ] Autenticación más robusta (JWT)
- [ ] Protección CSRF
- [ ] Rate limiting con Redis a mayor escala
- [ ] Logging de seguridad
- [ ] Detección de actividad sospechosa

## Base de datos

### Completado
- [x] Índices añadidos para mejorar rendimiento
- [x] Schema preparado para PostgreSQL
- [x] Relaciones configuradas correctamente

### Por implementar
- [ ] Migrar de SQLite a PostgreSQL (ya está en PostgreSQL en este repo)
- [ ] Configurar backups automáticos
- [ ] Implementar replicación (si hace falta)
- [ ] Configurar connection pooling

## Infraestructura

### Por configurar
- [ ] Servidor de producción configurado
- [ ] Dominio y DNS configurados
- [ ] Certificado SSL/HTTPS instalado
- [ ] CDN configurado (opcional pero recomendado)
- [ ] Load balancer (si hace falta escalabilidad)
- [ ] Monitoring y alertas configurados

## Imágenes

### Completado
- [x] Validación de tipos de archivo
- [x] Límites de tamaño
- [x] Sanitización de nombres de archivo

### Por implementar
- [ ] Migrar a cloud storage (S3, Cloudinary, etc.) — en producción se usa Vercel Blob
- [ ] Redimensionado de imágenes
- [ ] Compresión de imágenes
- [ ] CDN para imágenes

## Rendimiento

### Completado
- [x] Índices de base de datos
- [x] Límites de consultas (take: 50 para mensajes)

### Por implementar
- [ ] Caching (Redis)
- [ ] Optimizar consultas de base de datos
- [ ] Paginación de productos
- [ ] Lazy loading de imágenes
- [ ] Optimizar bundle size

## Monitoring y logging

### Por implementar
- [ ] Sentry o similar para error tracking
- [ ] Logging estructurado
- [ ] Monitoring de rendimiento (APM)
- [ ] Alertas para errores críticos
- [ ] Dashboard de métricas

## Escalabilidad

### Por considerar
- [ ] Redis para sesiones y rate limiting
- [ ] Múltiples instancias del servidor
- [ ] Sistema de colas para tareas pesadas
- [ ] Optimizar Socket.IO para varios servidores (Redis adapter)

## Documentación

### Completado
- [x] README actualizado
- [x] DEPLOYMENT.md creado
- [x] Instrucciones de producción

## Testing

### Por implementar
- [ ] Tests unitarios (Vitest ya existe)
- [ ] Tests de integración
- [ ] Tests E2E (Playwright ya existe)
- [ ] Tests de carga

## Ley y cumplimiento

### Por considerar
- [ ] Política de privacidad (ya hay página `/privacy`)
- [ ] Términos y condiciones (ya hay página `/terms`)
- [ ] Cumplimiento RGPD (exportar / borrar cuenta)
- [ ] Política de cookies

## Recomendaciones adicionales

1. **Backup**: backups automáticos diarios de la base de datos
2. **Disaster recovery**: plan de recuperación ante fallos
3. **Scaling**: plan para escalar cuando crezca el tráfico
4. **Costes**: monitorizar y optimizar costes de cloud
5. **Documentación**: mantenerla actualizada

## Prioridad alta (antes de lanzar)

1. Migrar a PostgreSQL
2. Configurar HTTPS/SSL
3. Implementar backups
4. Configurar monitoring básico
5. Probar en entorno de staging

## Prioridad media (después del lanzamiento)

1. Migrar imágenes a cloud storage
2. Implementar caching
3. Mejorar rate limiting
4. Añadir monitoring avanzado

## Prioridad baja (mejoras futuras)

1. Autenticación avanzada
2. Tests automatizados
3. Optimizaciones avanzadas de rendimiento
