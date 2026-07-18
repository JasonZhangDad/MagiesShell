# Registro de cambios

## [0.5.1] - 2026-07-18

### Lanzamiento
- Instaladores y metadatos de auto-actualización de la línea 0.5.x (MgTerminal-releases)

## [0.5.0] - 2026-07-17

### Funciones
- **Panel de diagnóstico Hex/Raw del terminal**: I/O de sesión por bytes (opcional)
- **Fuente de hosts JSON**: inventarios desde JSON local o HTTP(S); solo metadatos; cabeceras de auth HTTP
- **Compartir e importar inventario**: export solo metadatos (YAML Ansible); import desde portapapeles
- **Plantillas de espacio de trabajo con nombre**: enlaces de hosts, splits, cwd/comando de inicio opcionales
- **Marcadores del registro de conexión**: posiciones + notas + búsqueda
- **Vista en vivo de canales de reenvío de puertos**: origen, destino y bytes por conexión
- **Acciones onOutput de scripts**: notificación, sonido, marcar pestaña, iniciar grabación
- **Pegado seguro y difusión precisa**: retraso / espera de prompt / confirmación de comandos peligrosos
- **Canal OpenSSH del sistema**: GSSAPI/Kerberos y post-cuántico (PQ)

### Windows ARM64
- **win-arm64 con mosh / ET**: binarios nativos MoshMagies 0.1.9 y EternalTerminal 6.2.10
- **Canal de auto-actualización dedicado**: `latest-arm64.yml`

## [0.4.10] - 2026-07-17

### Funciones
- **Centro de diagnóstico SSH**: «Probar conexión» + «Ejecutar diagnóstico» — DNS / TCP / jump / clave de host / auth / SFTP
- **Auth SSH Agent de primera clase**: elegir Agent, huellas, identidad preferida
- **Instantánea de salud multihost**: latencia, auth, carga/memoria/disco
- **Fiabilidad SFTP fase 1**: reanudar, reintento auto, cola persistente, SHA-256 opcional
- **Onboarding de producto**: guía de Vault vacío, paleta de comandos, estados vacíos

### Correcciones
- Vaults existentes sin onboarding inicial; cierre correcto del jump si falla auth de health

## [0.4.9] - 2026-07-17

### Mejoras
- **Fuentes de release / auto-actualización a un repo de releases dedicado**: MgTerminal-releases; UX del sitio y de la app sin cambios

## [0.4.8] - 2026-07-16

### Funciones
- **Quick Connect con EternalTerminal**: entrada ET (puerto SSH + puerto ET, 2022 por defecto)
- **Autocomprobación de credenciales**: Ajustes → Sistema → Protección de credenciales
- **Instalador Windows ARM64**: win-arm64 (mosh/et y canal en 0.5.0)
- **Limpieza de restauración de sesión**: diseños > 14 días se descartan al arrancar

### Correcciones
- **UI rusa**: 203 cadenas faltantes; zh-CN +3; pruebas de alineación
- Ruta mosh-server personalizada de Quick Connect se aplica

### Mejoras
- Visibilidad SFTP unificada
- README macOS alineado con distribución sin firmar

## [0.4.7] - 2026-07-15

### Funciones
- **Idiomas de UI ampliados a 10**: alineado con el sitio — se añaden japonés / coreano / alemán / francés / español / portugués (se mantienen en / ru / zh-CN / zh-TW)
- Ajustes → Apariencia → Idioma lista todos los idiomas admitidos; las cadenas sin traducir caen a inglés

## [0.4.6] - 2026-07-15

### Seguridad
- **Desactivar la verificación de claves de host SSH ya no es silencioso**: con `verifyHostKeys` off (sesiones de terminal y conexiones de stats Mosh) se registra una advertencia clara de que se acepta cualquier clave sin preguntar
- **Aviso persistente en ajustes**: desactivar «Verificar claves de host SSH» muestra un aviso de riesgo MITM bajo el interruptor (en / zh-CN / zh-TW). Por defecto sigue activo

## [0.4.5] - 2026-07-15

### Correcciones
- **Cifrado anidado que provoca 401 / flujos vacíos**: guardar varias veces sin llavero anidaba el cifrado (`enc:v2(enc:v1(...))`); el bucle de descifrado desenvuelve los blobs dentro del presupuesto
- **Una credencial mala ya no rompe todo el vault**: si falla el descifrado de un campo se conserva el valor (fail-soft)
- **Clave API de búsqueda web**: focus/blur solos ya no borran una clave guardada tras fallo de descifrado; mensajes más claros
- **Detección de cifrado DPAPI en Windows**: el guardia anti-recifrado omitía claves DPAPI (cabecera `AQAAAN`) — corregido
- **Cursor Agent**: un fallo de descifrado no inyecta cifrado como API key en el proceso hijo
- Ajustes Provider / búsqueda web / Cursor: avisos unificados de volver a introducir la clave; cambiar idioma no sobrescribe claves sin guardar

## [0.4.4] - 2026-07-14

### Correcciones
- **IA 401 / flujos vacíos**: si falla el descifrado de la API key o no está sincronizada con el proceso principal, no se usa el marcador `__IPC_SECURED__`; fallo inmediato y aviso de volver a guardar
- Esperar a que los providers se sincronicen con el proceso principal antes de enviar
- Errores de auth claros si la clave local no está disponible

## [0.4.3] - 2026-07-14

### Correcciones
- **Descifrado de API key**: el proceso principal descifra correctamente claves vault locales `enc:v2`; en fallo no envía cifrado al proveedor
- **Marcadores de credenciales**: los límites de conexión / sync en la nube reconocen `enc:v2`
- Errores accionables en flujos de modelo vacíos (`NoOutputGeneratedError`) y 401
- Sonda de instalación del SDK de Cursor con `require.resolve` para menos falsos positivos

## [0.4.2] - 2026-07-14

### Correcciones
- **Fallo de cifrado de API key resuelto**: si el llavero del SO (`safeStorage`) no está disponible, se usa un vault cifrado local (`enc:v2`)
- macOS prefiere el llavero del sistema y cae en silencio; Ajustes → Sistema muestra el backend activo

## [0.4.1] - 2026-07-14

### Mejoras
- Selector de temas: vistas previas en tarjetas, ámbitos Core / Todo, búsqueda y estados vacíos
- Mejor contraste de Snow / Midnight; paletas de terminal `ui-snow` / `ui-midnight` sincronizadas
- Jerarquía de selección unificada en Vault, SFTP, navegación de ajustes, barra lateral de IA y chrome del terminal
- Listas de temas de terminal con búsqueda y muestras más claras
- Estado de sync, toasts, insignias de actualización y resaltados de arrastre en tokens de tema

## [0.4.0] - 2026-07-13

### Funciones
- Entrada «Contacto» que copia el correo de soporte
- Reconexión SSH con backoff exponencial (desde 5 s, tope 60 s); tras 10 fallos, reconexión manual
- Reenvíos de puerto local/dinámico reutilizan la sesión SSH del terminal ya autenticada (sin segundo password/2FA)
- Importar claves FIDO2 (`sk-*`) sugiere autenticación con ssh-agent

### Cambios

## [0.3.0] - 2026-07-13

### Correcciones
- Los fallos de cifrado de API key al guardar un proveedor de IA ya no se silencian; error localizado bajo el campo

## [0.2.9] - 2026-07-13

### Funciones
- Actualización automática en macOS: instalación sustituyendo el bundle tras la descarga (elude límites Squirrel de apps sin firmar; desde 0.2.9 todas las plataformas pueden auto-actualizarse)

### Correcciones
- El icono conserva la placa redondeada oficial en claro/oscuro

## [0.2.8] - 2026-07-13

### Correcciones
- Paquetes Windows que salían en silencio al arrancar: reinsertar hashes de integridad tras reescribir asar, comprobaciones CI
- Progreso y errores de instalación de actualizaciones visibles en todas las plataformas

## [0.2.7] - 2026-07-13

### Correcciones
- Arquitectura de release de Windows: empaquetado seguro del instalador x64

## [0.2.6] - 2026-07-12

### Seguridad
- Ventanas de bandeja empaquetadas ignoran `VITE_DEV_SERVER_URL` y bloquean navegación / nuevas ventanas
- Preload ya no confía en el servidor de desarrollo como origen dentro de `app.asar`
- DOMPurify 3.3.2 y undici 6.23.0 contra XSS / DoS por zip-bomb
- afterPack repara hashes de integridad ASAR e Info.plist para evitar el crash inmediato en macOS

### Correcciones
- Pruebas de integración de auto-login Telnet esperan al prompt antes de afirmar la finalización

## [0.2.5] - 2026-07-12

### Correcciones
- «Reiniciar ahora» sin efecto: la salida de instalación de actualización ya no la cancelan las comprobaciones before-quit
- Errores claros si falla «Reiniciar y actualizar»; plataformas sin auto-instalación abren Releases

## [0.2.4] - 2026-07-12

### Seguridad
- Dejar de guardar si el cifrado de credenciales no está disponible — sin fallback en texto plano
- Deep links SSH desactivados por defecto; rechazar URL con contraseña; confirmar antes de conectar
- Portapapeles OSC52 desactivado por defecto
- CSP de Electron más estricto; integridad ASAR y fusibles de seguridad activos
- Eliminar el entitlement macOS disable-library-validation

## [0.2.3] - 2026-07-11

### Correcciones
- Hostnames `app://` empaquetados en minúsculas por Chromium ya no rompen la inyección de preload (terminal, SFTP, ajustes, selectores de archivo, reenvío de puertos)
- Alinear ventanas principal/ajustes y permisos en `app://magiesterminal`

## [0.2.2] - 2026-07-11

### Correcciones
- «Select Color Theme» anidado en ScrollArea bloqueaba clics; un solo scroll + pointerdown
- Diálogos de claves SSH/locales con padre correcto en macOS
- La ventana de ajustes se abre con el protocolo `app://`
- Iconos de barra lateral y paquete con el nuevo set de assets

## [0.2.1] - 2026-07-11

### CI/CD
- Reactivar builds automáticos de macOS y Windows (sin firmar) para más paquetes listos

## [0.2.0] - 2026-07-11

### Funciones
- IPC de auto-actualización a todas las ventanas (principal + ajustes)
- Máquina de estados unificada para comprobación manual y auto-actualización
- «Buscar actualizaciones» muestra el progreso en vivo
- Comprobación automática con electron-updater ~5 s tras el arranque
- Descarga automática si hay versión nueva (`autoDownload=true`)
- Toast persistente al completar («Reiniciar ahora»)
- Toast de error si falla la descarga con fallback a Releases
- Barra de progreso Ajustes → Sistema impulsada por `useUpdateCheck`

### Notas de diseño
- `broadcastToAllWindows` sustituye el IPC de un solo emisor
- `manualCheckStatus` rastrea la UI de comprobación manual; prioridad con `autoDownloadStatus`
- `SettingsSystemTab` es consumidor puro de `useUpdateCheck`
- Listeners IPC globales se registran una vez en `autoUpdateBridge.init()`
- `autoInstallOnAppQuit=false` — el usuario inicia el reinicio

### Interfaz SettingsSystemTabProps
- Eliminado: `autoDownloadStatus`, `downloadPercent`
- Añadido: `updateState`, `checkNow`, `installUpdate`, `openReleasePage`

### Notas
- Aplica a apps empaquetadas (Windows NSIS, macOS dmg/zip, Linux AppImage); en dev: `forceDevUpdateConfig=true` + `dev-app-update.yml`
- El toast legado `hasUpdate` se suprime durante la auto-descarga

### CI / build
- Preferir paquetes Linux gratuitos si no hay firma
- Linux x64 (AlmaLinux 8): Clang preferido, fallback gcc-toolset-13
- Linux arm64 (Debian Bullseye): `clang-14 + lld-14`
- El job Release puede publicar solo con artefactos Linux
- Suavizar comprobaciones deb a avisos si se omite una plataforma
