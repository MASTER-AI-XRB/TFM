# Configurar IP estática para desarrollo

## ¿Por qué una IP estática?

Cuando la IP de tu ordenador cambia (por ejemplo, de 192.168.1.130 a 192.168.1.131), el socket puede tener problemas de conexión, sobre todo si tienes la app abierta en el móvil con la IP antigua.

## Solución: configurar IP estática

### Opción 1: IP estática en el router (recomendado)

1. **Accede a tu router** (normalmente http://192.168.1.1 o http://192.168.0.1)
2. **Encuentra la sección DHCP / reserva de IP** (puede estar en "Network", "LAN", "DHCP Server")
3. **Añade una reserva de IP** para tu ordenador:
   - MAC Address (puedes verla con `ipconfig /all` en Windows)
   - IP que quieres reservar (por ejemplo, 192.168.1.130)
4. **Guarda los cambios** y reinicia el router si hace falta

### Opción 2: IP estática en Windows

1. **Abre Configuración de red**:
   - Clic derecho en el icono de red de la barra de tareas
   - "Abrir configuración de red e Internet"
   - "Cambiar opciones del adaptador"

2. **Configura el adaptador**:
   - Clic derecho en tu conexión (Wi-Fi o Ethernet)
   - "Propiedades"
   - Selecciona "Protocolo de Internet versión 4 (TCP/IPv4)"
   - Clic en "Propiedades"

3. **Configura IP estática**:
   - Selecciona "Usar la siguiente dirección IP"
   - **Dirección IP**: 192.168.1.130 (o la que quieras)
   - **Máscara de subred**: 255.255.255.0 (normalmente)
   - **Puerta de enlace predeterminada**: 192.168.1.1 (la IP de tu router)
   - **Servidor DNS preferido**: 192.168.1.1 o 8.8.8.8

4. **Aplica los cambios**

### Cómo encontrar la configuración actual del router

En Windows, ejecuta en PowerShell:
```powershell
ipconfig /all
```

Busca:
- **Default Gateway**: IP de tu router
- **Subnet Mask**: normalmente 255.255.255.0
- **IPv4 Address**: tu IP actual

## ¿Es seguro?

**Sí.** Configurar una IP estática en tu red local solo afecta a tu red doméstica y no expone nada a Internet.

## Alternativa: detección automática

Si no quieres una IP estática, el código ya detecta la IP según `window.location.hostname`. Pero si la IP cambia mientras la app está abierta, tendrás que:

1. Cerrar y volver a abrir la app en el móvil
2. O refrescar la página

La IP estática es la solución más robusta para desarrollo.
