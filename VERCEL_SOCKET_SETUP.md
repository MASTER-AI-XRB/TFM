# Configurar Socket.IO para Vercel

Esta guía te explica cómo tener el chat activo en Vercel desplegando el servidor Socket.IO en un servicio externo.

## 🎯 ¿Por qué hace falta un servidor externo?

Vercel utiliza Serverless Functions que no soportan conexiones WebSocket persistentes. Por tanto, necesitamos desplegar el servidor Socket.IO (`server.js`) en un servicio que soporte WebSockets.

## 🚀 Opción 1: Railway (Recomendado - Fácil y Gratis)

Railway es perfecto para desplegar el servidor Socket.IO con un plan gratuito generoso.

### Paso 1: Preparar el servidor Socket.IO

Crea un archivo `socket-server.js` en la raíz del proyecto (versión simplificada del servidor):

```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')

const prisma = new PrismaClient()
const port = process.env.PORT || 3001

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
})

const userSockets = new Map()
const socketUsers = new Map()
const userInfo = new Map()

io.on('connection', (socket) => {
  const { userId, nickname } = socket.handshake.query
  
  if (userSockets.has(userId)) {
    const existingSocketId = userSockets.get(userId)
    const existingSocket = io.sockets.sockets.get(existingSocketId)
    if (existingSocket) {
      existingSocket.emit('session-terminated', { 
        message: 'Se ha abierto una nueva sesión desde otro dispositivo' 
      })
      existingSocket.disconnect(true)
    }
    socketUsers.delete(existingSocketId)
  }

  userSockets.set(userId, socket.id)
  socketUsers.set(socket.id, { userId, nickname })
  userInfo.set(userId, { nickname })

  updateOnlineUsers()

  socket.on('join-general', async () => {
    socket.join('general')
    const messages = await prisma.message.findMany({
      where: { roomId: 'general', isPrivate: false },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })
    socket.emit('load-messages', messages.map((m) => ({
      ...m,
      userNickname: m.user.nickname,
    })))
  })

  socket.on('general-message', async (data) => {
    const user = socketUsers.get(socket.id)
    if (!user) return
    if (!data.content || typeof data.content !== 'string') return
    const content = data.content.trim()
    if (content.length === 0 || content.length > 1000) return

    const message = await prisma.message.create({
      data: {
        content: content,
        userId: user.userId,
        roomId: 'general',
        isPrivate: false,
      },
      include: { user: { select: { nickname: true } } },
    })

    io.to('general').emit('general-message', {
      ...message,
      userNickname: message.user.nickname,
    })
  })

  socket.on('join-private', async (targetIdentifier) => {
    const user = socketUsers.get(socket.id)
    if (!user) return

    let targetUserId = targetIdentifier
    if (!targetIdentifier.includes('-')) {
      const targetUser = await prisma.user.findUnique({
        where: { nickname: targetIdentifier },
        select: { id: true },
      })
      if (targetUser) {
        targetUserId = targetUser.id
      } else {
        return
      }
    }

    const roomId = [user.userId, targetUserId].sort().join('-')
    socket.join(roomId)
  })

  socket.on('load-private-messages', async (targetIdentifier) => {
    const user = socketUsers.get(socket.id)
    if (!user) return

    let targetUserId = targetIdentifier
    if (!targetIdentifier.includes('-')) {
      const targetUser = await prisma.user.findUnique({
        where: { nickname: targetIdentifier },
        select: { id: true },
      })
      if (targetUser) {
        targetUserId = targetUser.id
      } else {
        return
      }
    }

    const roomId = [user.userId, targetUserId].sort().join('-')
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { roomId: roomId, userId: user.userId },
          { roomId: roomId, userId: targetUserId },
        ],
        isPrivate: true,
      },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: 'asc' },
    })

    socket.emit('load-private-messages', {
      userId: targetUserId,
      messages: messages.map((m) => ({
        ...m,
        userNickname: m.user.nickname,
      })),
    })
  })

  socket.on('private-message', async (data) => {
    const user = socketUsers.get(socket.id)
    if (!user) return

    if (!data.content || typeof data.content !== 'string') return
    const content = data.content.trim()
    if (content.length === 0 || content.length > 1000) return

    let targetUserId = data.targetUserId || data.targetNickname
    if (data.targetNickname && !targetUserId.includes('-')) {
      const targetUser = await prisma.user.findUnique({
        where: { nickname: data.targetNickname },
        select: { id: true },
      })
      if (targetUser) {
        targetUserId = targetUser.id
      } else {
        return
      }
    }

    const roomId = [user.userId, targetUserId].sort().join('-')
    const targetSocketId = userSockets.get(targetUserId)

    const message = await prisma.message.create({
      data: {
        content: content,
        userId: user.userId,
        roomId: roomId,
        isPrivate: true,
      },
      include: { user: { select: { nickname: true } } },
    })

    const messageData = {
      ...message,
      userNickname: message.user.nickname,
    }

    socket.emit('private-message', messageData)
    if (targetSocketId) {
      io.to(targetSocketId).emit('private-message', messageData)
    }
  })

  socket.on('disconnect', () => {
    if (userSockets.get(userId) === socket.id) {
      userSockets.delete(userId)
      userInfo.delete(userId)
    }
    socketUsers.delete(socket.id)
    updateOnlineUsers()
  })

  function updateOnlineUsers() {
    const onlineUsers = Array.from(userInfo.values()).map((u) => u.nickname)
    io.emit('online-users', onlineUsers)
  }
})

httpServer.listen(port, () => {
  console.log(`Socket.IO servidor ejecutándose en el puerto ${port}`)
})
```

### Paso 2: Crear package.json para el servidor Socket.IO

Crea `socket-server-package.json`:

```json
{
  "name": "xarxanglesola-socket-server",
  "version": "1.0.0",
  "main": "socket-server.js",
  "scripts": {
    "start": "node socket-server.js"
  },
  "dependencies": {
    "socket.io": "^4.8.1",
    "@prisma/client": "^5.7.1"
  }
}
```

### Paso 3: Desplegar en Railway

1. **Crea una cuenta en Railway**: [https://railway.app](https://railway.app)

2. **Crea un nuevo proyecto**:
   - Clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Configura el servicio**:
   - **Root Directory**: Déjalo vacío (o crea una carpeta `socket-server`)
   - **Build Command**: `pnpm install && pnpm exec prisma generate`
   - **Start Command**: `node socket-server.js`
   - **Port**: Railway lo asignará automáticamente (usa `process.env.PORT`)

4. **Variables de entorno en Railway**:
   ```
   DATABASE_URL=postgresql://... (la misma que Vercel)
   PORT=3001
   NEXT_PUBLIC_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.vercel.app
   ```

5. **Obtener la URL del servidor**:
   - Railway te dará una URL como: `https://tu-servidor.up.railway.app`
   - Copia esta URL

### Paso 4: Configurar Vercel

En Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SOCKET_URL=https://tu-servidor.up.railway.app
NEXT_PUBLIC_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.vercel.app
```

### Paso 5: Actualizar el cliente

El cliente ya está configurado para usar `NEXT_PUBLIC_SOCKET_URL`. Solo hay que asegurarse de que no esté desactivado en producción.

## 🚀 Opción 2: Render (Alternativa)

Render también ofrece un plan gratuito con soporte para WebSockets.

1. **Crea una cuenta**: [https://render.com](https://render.com)

2. **Crea un Web Service**:
   - Conecta tu repositorio GitHub
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm exec prisma generate`
   - **Start Command**: `node socket-server.js`

3. **Variables de entorno** (igual que Railway)

4. **Obtener URL**: Render te dará una URL como `https://tu-servidor.onrender.com`

## 🚀 Opción 3: Fly.io (Alternativa)

Fly.io también soporta WebSockets y tiene un plan gratuito.

1. **Instala Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Crea app**: `fly launch`

3. **Configura**: Sigue las instrucciones de Fly.io

## ✅ Verificación

Después de configurar todo:

1. **Despliega el servidor Socket.IO** en Railway/Render/Fly.io
2. **Configura `NEXT_PUBLIC_SOCKET_URL`** en Vercel con la URL del servidor
3. **Actualiza el cliente** para no desactivar Socket.IO en producción
4. **Prueba el chat** en tu aplicación Vercel

## 🔧 Actualizar el cliente para producción

Necesitamos actualizar `app/app/chat/page.tsx` para permitir Socket.IO en producción cuando hay `NEXT_PUBLIC_SOCKET_URL` configurada.

## 📝 Notas importantes

- **Base de datos compartida**: El servidor Socket.IO y Vercel deben compartir la misma base de datos PostgreSQL
- **CORS**: Asegúrate de que `NEXT_PUBLIC_ALLOWED_ORIGINS` incluya la URL de Vercel
- **Costes**: Railway y Render tienen planes gratuitos generosos, pero revisa los límites
- **Monitoring**: Considera añadir monitoring para el servidor Socket.IO

## 🆘 Troubleshooting

### El chat no se conecta
- Verifica que `NEXT_PUBLIC_SOCKET_URL` esté bien configurada en Vercel
- Comprueba que el servidor Socket.IO esté en ejecución
- Revisa los logs del servidor Socket.IO
- Verifica CORS en la configuración del servidor

### Errores de base de datos
- Asegúrate de que el servidor Socket.IO tenga acceso a la base de datos
- Verifica que `DATABASE_URL` esté bien configurada
- Comprueba que Prisma Client esté generado (`pnpm exec prisma generate`)
