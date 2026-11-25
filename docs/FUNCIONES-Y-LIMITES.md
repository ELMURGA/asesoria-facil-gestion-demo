# Funciones operativas (en la demo) y límites

## Operativo de verdad (dentro del navegador)
- Cambio de rol y de cliente de ejemplo; reinicio que restaura datos sembrados.
- Cliente (secciones del PDF): inicio con zona de subida y estado de cada documento, subir facturas con archivo o foto, mis impuestos, documentos, nóminas, plazos y avisos, firmas de ejemplo; ver pendientes por periodo, subir archivo (validación de tipo PDF/JPG/PNG/XLSX/XLS/CSV y 10 MB, arrastrar y soltar, estado de carga y de error), sustituir cuando requiere revisión, filtros por tipo y estado, detalle del documento con historial, descargar documentos publicados, conversaciones vinculadas a documento con indicador «te toca / esperando al despacho / resuelta», preferencias de avisos y bandeja de avisos **simulados**.
- Asesor: carga de trabajo del periodo, entregas por cliente, revisar/marcar revisado, pedir aclaración, pedir información que falta, invitar clientes (simulado), archivar/reactivar, filtrar por periodo/estado/cliente, búsqueda global, notas internas (nunca visibles al cliente), publicar documentos de ejemplo, consultas de la web, perfil del despacho y ajustes de avisos, registro de actividad.
- Servicio de facturación: recorrido simulado «datos recibidos → pendiente de revisión del asesor → resuelto en la herramienta de facturación», con aviso de simulación dentro del módulo.

- Inicio del cliente: título = trimestre (selector), frase con lo que falta, zona de subida, «Por hacer», rejilla «Mi trimestre» y «Del despacho». Panel del asesor: indicadores en una tira, «Por hacer hoy», clientes con mini-rejilla y automatizaciones con interruptores.

## Límites (honestos)
- El PDF original nombra modelos y plazos fiscales concretos: en la demo los plazos los introduce el asesor y no hay calendario fiscal oficial; los modelos son documentos ficticios publicados a mano.
- La demo es una web adaptable (PWA/app de tienda = otra partida).
- Nada se envía fuera del navegador. Sin autenticación real: cualquiera cambia de rol con un clic. El aislamiento entre clientes es solo visual y se prueba por interfaz y URL, no es seguridad.
- Los archivos no se guardan; la «vista previa» no existe. Las descargas son .txt ficticios.
- Los avisos no se envían; WhatsApp/SMS requieren integración, consentimiento y coste por mensaje.
- Facturación: no hay herramienta, API, certificados ni AEAT; no calcula impuestos ni emite facturas.
- Sin accesibilidad auditada con lector de pantalla; se probaron teclado, foco, contraste razonado y diálogos nativos. Pendiente revisión con tecnología asistiva real.
- Fuente Inter: el detector de diseño la marca como «muy usada»; se mantiene por legibilidad en interfaz de trabajo y coherencia con Dazenty.
- Probado en Chrome (escritorio y 390 px). Otros navegadores sin probar.
