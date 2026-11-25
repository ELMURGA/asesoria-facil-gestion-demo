# Producción · requisitos (NINGUNO está implementado en la demo)

| Área | Requisito | Estado |
|---|---|---|
| Autenticación | Inicio de sesión real (enlace por correo o contraseña + segundo factor para el asesor), recuperación de acceso | No implementado |
| Permisos por cliente | Autorización en servidor por cliente (nunca solo en la interfaz); pruebas de acceso cruzado | No implementado (la demo solo filtra en pantalla) |
| Almacenamiento privado | Archivos en almacenamiento privado con URLs firmadas y caducadas, cifrado en reposo, límites y antivirus | No implementado |
| Acceso del asesor | Cuenta única con 2FA, sesión controlada | No implementado |
| Copias y recuperación | Copias automáticas verificadas y prueba de restauración; plazos de retención | No implementado |
| Registro de actividad | Registro inmutable con fecha fiable y actor real | Simulado en la demo |
| Avisos | Proveedor de correo; WhatsApp/SMS solo con consentimiento y coste por mensaje | No implementado |
| Privacidad | Contrato de encargo de tratamiento, política, registro de actividades, aviso legal con datos reales de la sociedad | Pendiente (faltan datos legales) |
| SEO | Solo la portada pública; áreas privadas `noindex` y bloqueadas; la demo ya es `noindex` | Parcial |
| Dominio/hosting | Registro y DNS solo con nombres preferidos y autorización | No hecho |
