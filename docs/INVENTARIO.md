# Inventario

## Comprobación de la base disponible (24-25/11/2026)
- No hay AGENTS.md aplicable a este trabajo (el único encontrado, `WEBS/R&A/R&A/AGENTS.md`, es de otro proyecto).
- `Dazenty-Portal/pdf/portal-asesorias.html` + PDF: pantallas **ilustrativas** para un folleto; sin backend. No es implementación.
- `WEBS/Dazenty/portal.html`: portal de clientes de **Dazenty** (otro producto, noindex, con Supabase); no se ha reutilizado ni tocado.
- Búsqueda por archivos de proyecto (package.json/pyproject) con «portal/asesor»: sin resultados reutilizables.
- Conclusión: **no existe implementación reutilizable del portal de asesorías**. Demo nueva y aislada; no se sobrescribió nada (la carpeta no existía).

## Reutilizable (copiado, no modificado el original)
- `img/logodazenty.webp` (logo oficial, blanco: solo legible sobre fondo oscuro, por eso va en el pie oscuro).
- `fonts/` Inter y Space Grotesk, logos de Dazenty y colores (#050505 / #d97762) de Dazenty-Portal/pdf. Contenido y secciones tomados del PDF original (`portal-asesorias.html`).
- Referencia de contenido: textos del PDF/MENSAJES.md (portal base: documentación y comunicación; sin cálculos).

## Nuevo (construido aquí)
Entrada tipo app, área de cliente (inicio, subir facturas, mis impuestos, documentos, nóminas, mensajes, plazos y avisos, firmas, facturación simulada), panel del asesor (panel con KPIs y automatizaciones, clientes, ficha, documentos, mensajes, facturación simulada, ajustes con marca y plazos, actividad, búsqueda), versiones móvil/tableta/ordenador, estado en localStorage, pruebas E2E y PDF ilustrativo. Se eliminó la portada web a petición de Alejandro (25/11).

## Simulado (no existe de verdad)
Autenticación/roles, aislamiento entre clientes, subida de archivos (solo metadatos), invitaciones, avisos por correo/WhatsApp/SMS, descargas (texto ficticio), formulario de consulta, servicio de facturación (estados cambiados a mano), registro de actividad.

## Pendiente de decidir
Identidad (logo, colores, dominio), datos legales, servicios incluidos, herramienta de facturación y quién emite, costes y reparto, hosting/backend, canal de avisos, política de datos. Ver ESTIMACION-Y-DECISIONES.md.
