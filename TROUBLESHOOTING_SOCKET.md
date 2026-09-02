# Solución de problemas de Socket.IO

## Problema: «Conectando...» sin conectar

Si ves el mensaje «Conectando...» en rojo y el chat no conecta, sigue estos pasos:

### 1. Verificar variables de entorno en Vercel

Asegúrate de tener configuradas en Vercel:

- **`NEXT_PUBLIC_SOCKET_URL`**: URL completa del servidor Socket.IO en Railway
  - Formato: `https://tu-servidor.up.railway.app` (sin puerto; Railway lo gestiona)
  - **Importante**: debe empezar por `https://` (no `http://`)

### 2. Verificar variables de entorno en Railway

Asegúrate de tener en Railway:

- **`NEXT_PUBLIC_ALLOWED_ORIGINS`**: debe incluir la URL de Vercel
  - Formato: `https://xarxanglesola.vercel.app`
  - Si hay varios orígenes, sepáralos con comas: `https://xarxanglesola.vercel.app,https://www.xarxanglesola.vercel.app`

### 3. Verificar que el servidor Socket.IO está activo

1. Abre la consola del navegador (F12)
2. Mira los logs al intentar conectar
3. Busca errores que mencionen:
   - `CORS`: problema de permisos de origen
   - `ECONNREFUSED`: el servidor no es accesible
   - `timeout`: el servidor no responde a tiempo

### 4. Probar la conexión a mano

Abre la consola del navegador y ejecuta:

```javascript
// Sustituir por tu URL de Railway
fetch('https://tu-servidor.up.railway.app/socket.io/?EIO=4&transport=polling', {
  method: 'GET',
  mode: 'cors',
})
  .then(response => console.log('Conexión OK:', response.status))
  .catch(error => console.error('Error:', error))
```

Si ves un error CORS, el problema es la configuración de `NEXT_PUBLIC_ALLOWED_ORIGINS` en Railway.

### 5. Verificar el protocolo (HTTPS vs HTTP)

- **Vercel**: siempre usa HTTPS
- **Railway**: siempre usa HTTPS en producción
- **Importante**: `NEXT_PUBLIC_SOCKET_URL` debe empezar por `https://`

### 6. Verificar los logs de Railway

1. Abre el dashboard de Railway
2. Ve a "Deployments" o "Logs"
3. Busca errores relacionados con CORS, conexiones rechazadas o errores de conexión

### 7. Problemas comunes y soluciones

#### Error: "CORS policy"
**Causa**: Railway no permite el origen de Vercel  
**Solución**: añade la URL de Vercel a `NEXT_PUBLIC_ALLOWED_ORIGINS` en Railway

#### Error: "ECONNREFUSED"
**Causa**: el servidor Socket.IO no está activo o la URL es incorrecta  
**Solución**:
- Verifica que el servidor esté desplegado en Railway
- Verifica que `NEXT_PUBLIC_SOCKET_URL` sea correcta

#### Error: "timeout"
**Causa**: el servidor no responde a tiempo  
**Solución**:
- Verifica que el servidor esté activo
- Puede ser un problema de red; inténtalo de nuevo

#### El mensaje «Conectando...» no desaparece
**Causa**: el socket no conecta pero no hay un error claro  
**Solución**:
1. Abre la consola del navegador (F12)
2. Mira los logs
3. Verifica `NEXT_PUBLIC_SOCKET_URL`
4. Verifica que `NEXT_PUBLIC_ALLOWED_ORIGINS` incluya la URL de Vercel

### 8. Verificación rápida

Copia y pega este código en la consola del navegador cuando estés en la página del chat:

```javascript
console.log('URL Socket:', process.env.NEXT_PUBLIC_SOCKET_URL || 'NO CONFIGURADA')
console.log('Origin actual:', window.location.origin)
console.log('Hostname:', window.location.hostname)
```

Eso te dirá:
- Si `NEXT_PUBLIC_SOCKET_URL` está configurada
- Cuál es el origen actual (debe estar en `NEXT_PUBLIC_ALLOWED_ORIGINS` en Railway)

### 9. Reiniciar el servidor

Si nada funciona:
1. Reinicia el servidor Socket.IO en Railway
2. Haz un nuevo deploy en Vercel
3. Limpia la caché del navegador

### 10. Contactar soporte

Si nada funciona, comparte:
- Los logs de la consola del navegador
- Los logs de Railway
- Las variables de entorno configuradas (sin mostrar valores sensibles)
