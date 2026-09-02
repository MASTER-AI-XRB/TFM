# Guía de despliegue - Xarxa Anglesola

Esta guía te ayuda a desplegar la aplicación para uso global en producción.

## Requisitos previos

- Node.js 18+ instalado
- Base de datos PostgreSQL (recomendado) o MySQL
- Dominio configurado con SSL/HTTPS
- Servidor con suficiente memoria y CPU

## Paso 1: Preparar el código

### 1.1 Actualizar el schema de base de datos

Para producción, cambia `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Cambia de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Configurar variables de entorno

Crea un archivo `.env` con:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_base_datos?schema=public"
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
NEXT_PUBLIC_APP_URL=https://tudominio.com
NEXT_PUBLIC_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

## Paso 2: Configurar la base de datos

### 2.1 Crear la base de datos PostgreSQL

```sql
CREATE DATABASE xarxanglesola;
CREATE USER xarxanglesola_user WITH PASSWORD 'contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE xarxanglesola TO xarxanglesola_user;
```

### 2.2 Ejecutar migraciones

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

## Paso 3: Construir la aplicación

```bash
pnpm install
pnpm build
```

## Paso 4: Configurar el servidor

### Opción A: Usando PM2 (recomendado)

```bash
pnpm add -g pm2
pm2 start server.js --name xarxanglesola
pm2 save
pm2 startup
```

### Opción B: Usando systemd

Crea `/etc/systemd/system/xarxanglesola.service`:

```ini
[Unit]
Description=Xarxa Anglesola App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/ruta/al/proyecto
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable xarxanglesola
sudo systemctl start xarxanglesola
```

## Paso 5: Configurar Nginx (recomendado)

Crea `/etc/nginx/sites-available/xarxanglesola`:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /ruta/al/certificado.crt;
    ssl_certificate_key /ruta/al/clave.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Paso 6: Configurar backups

### Backup de base de datos

Crea un script de backup (`backup-db.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U usuario nombre_base_datos > /ruta/backups/backup_$DATE.sql
# Mantener solo los últimos 7 días
find /ruta/backups -name "backup_*.sql" -mtime +7 -delete
```

Añade a crontab:
```bash
0 2 * * * /ruta/al/backup-db.sh
```

## Paso 7: Monitoring

### Opciones recomendadas

- **Sentry**: seguimiento de errores
- **Uptime Robot**: disponibilidad
- **New Relic / Datadog**: rendimiento

## Paso 8: Optimizaciones

### 8.1 Imágenes

Considera migrar a un servicio de cloud storage:
- AWS S3
- Cloudinary
- ImageKit

### 8.2 CDN

Configura un CDN para servir assets estáticos:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

### 8.3 Rate limiting avanzado

Para mayor escala, implementa rate limiting con Redis:
```bash
pnpm add ioredis
```

## Checklist de producción

- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] HTTPS/SSL configurado
- [ ] Backups automáticos configurados
- [ ] Monitoring configurado
- [ ] Rate limiting activado
- [ ] Logs configurados
- [ ] Firewall configurado
- [ ] Dominio configurado correctamente
- [ ] Tests realizados en entorno de staging

## Soporte

Para problemas o preguntas, consulta la documentación o abre un issue en el repositorio.
