# Solución de problemas: conexión desde el teléfono

## Problemas comunes y soluciones

### 1. Verificar que el teléfono y el ordenador estén en la misma red Wi-Fi
- Asegúrate de que ambos dispositivos estén en la misma red Wi-Fi
- No uses datos móviles en el teléfono

### 2. Verificar el firewall de Windows
El firewall puede estar bloqueando los puertos 3000 y 3001.

**Solución:**
1. Abre "Windows Defender Firewall" o "Firewall de Windows"
2. Clic en "Configuración avanzada"
3. Clic en "Reglas de entrada" → "Nueva regla"
4. Selecciona "Puerto" → "TCP"
5. Puertos específicos: `3000, 3001`
6. Permite la conexión
7. Repite para "Reglas de salida"

**O desde PowerShell (como administrador):**
```powershell
New-NetFirewallRule -DisplayName "Xarxa Anglesola - Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Xarxa Anglesola - Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### 3. Verificar la IP local
Ejecuta en la terminal:
```bash
ipconfig | findstr /i "IPv4"
```

Asegúrate de que la IP que obtienes es la correcta (normalmente empieza por **192.168.x.x** o **10.x.x.x**).

**Nota:** Si el servidor muestra una IP tipo **172.18.x.x** o **172.16–31.x.x** (Docker, WSL, etc.), el teléfono en la Wi-Fi **no puede acceder**. En esos casos, busca la IP de tu red Wi-Fi en la salida de `ipconfig` (normalmente «Adaptador de red Wi-Fi» → IPv4 **192.168.x.x**) y úsala a mano: `http://192.168.x.x:3000`.

### 4. Probar la conexión
Desde el teléfono, prueba a acceder directamente:
- `http://[TU_IP]:3000` (ejemplo: http://192.168.1.130:3000)

Si no carga, el problema es el firewall o la red.

### 5. Verificar que el servidor esté escuchando
Al iniciar el servidor con `pnpm dev`, deberías ver:
```
> Ready on http://localhost:3000
> Acceso desde el teléfono: http://[TU_IP]:3000
> Socket.io servidor en http://localhost:3001
> Socket.io acceso desde el teléfono: http://[TU_IP]:3001
```

### 6. Problemas con Socket.IO
Si la página web carga pero el chat no funciona:
- Abre la consola del navegador del teléfono (Chrome: chrome://inspect)
- Busca errores de CORS o de conexión
- Verifica que la URL de Socket.IO sea correcta

### 7. Probar desde otro dispositivo
Si tienes otro ordenador en la misma red, prueba a acceder desde allí para verificar que el problema no es específico del teléfono.

## Comprobación rápida

1. Teléfono y ordenador en la misma Wi-Fi
2. Firewall permite puertos 3000 y 3001
3. IP local correcta (`ipconfig`)
4. El servidor muestra la IP en la consola
5. Accedes con `http://[IP]:3000` (no localhost)

## Si nada funciona

1. Reinicia el router Wi-Fi
2. Reinicia el ordenador
3. Prueba desde otro dispositivo
4. Verifica que no haya un antivirus bloqueando las conexiones
