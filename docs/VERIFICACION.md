# Verificación (25/11/2026)

Prueba automatizada `tests/e2e.mjs` (Playwright + Chrome; ordenador 1280, tableta 820 y móvil 390): **68/68 comprobaciones superadas** (docs/resultado-e2e.json). Cubre: entrada de app sin portada web, colores de la agencia, recorrido obligatorio completo, subida con archivo propio y con ficticio, validaciones, filtros, firma dibujada, plazos, avisos simulados, marca configurable, aislamiento por interfaz y URL, notas internas no visibles al cliente, reinicio, facturación simulada sin «aceptada por AEAT/QR», versiones por dispositivo (móvil: barra inferior y sin controles táctiles diminutos; tableta: carril de iconos; ordenador: barra lateral), **sin desbordamiento horizontal en 26 rutas × 3 tamaños** y cero errores de consola.

Revisión visual: capturas en `capturas/` (escritorio y móvil). Detector de diseño: solo avisa del uso de Inter.

## No verificado
Lector de pantalla real, Safari/Firefox, dispositivos físicos, rendimiento con muchos datos, y todo lo que dependa de servidor (no existe).
Ejecutar: `cd tests && npm i playwright-core && node e2e.mjs` con el servidor local activo (ajustar ruta de Chrome).

## Ronda de alineación (25/11/2026)
Revisión de descuadres tras el aviso de Alejandro: comprobación automática de elementos fuera de pantalla, texto cortado, tablas con scroll horizontal y botones partidos en 22 pantallas × 7 tamaños (320, 360, 390, 768, 820, 1024, 1280 px). Corregido: tabla del panel en tableta (columnas secundarias ocultas), pestañas de la ficha del cliente (ahora se ajustan en varias líneas), etiquetas de la barra inferior móvil (cortas y alineadas), insignias en 320 px, botones de `versiones.html` y wordmark del carril de tableta. Resultado final: 0 avisos y 68/68 pruebas E2E.

## Entrada por dispositivo (25/11/2026)
Tras ver Alejandro que la entrada en ordenador se veía igual que en móvil, se rehízo con una versión por dispositivo: ordenador = pantalla dividida (marca, puntos clave y vista previa a la izquierda; acceso a la derecha, sin scroll); tableta = tarjeta ancha centrada con las dos entradas lado a lado; móvil = columna de app con la firma de Dazenty al final. Logo de Dazenty recortado para alinearlo con el texto. Pruebas E2E: 68/68.

## Selector propio (25/11/2026)
El desplegable nativo del sistema (que en móvil salía pequeño, flotando sobre el texto y con otro estilo) se sustituye en toda la app por un selector propio: botón con el diseño de la app y hoja inferior con opciones grandes (mín. 54 px), subtítulo por opción, marca de la elegida, foco inicial, flechas + Enter y Esc. El `<select>` real queda oculto como fuente de datos para los formularios. Pruebas: ningún desplegable nativo visible, la hoja cabe en pantalla móvil, teclado y Esc. Las fechas siguen usando el selector de fecha del sistema (adecuado para fechas) y los archivos, el del sistema.

## Rediseño de apps (25/11/2026)
A petición de Alejandro («más app, se nota mucha IA»), la interfaz se rehízo siguiendo la guía de pantallas de aplicación de la habilidad de diseño (estudio de 23 pantallas reales): negro neutro plano, el color de la agencia solo en datos y en la acción principal (no en la estructura), sin saludo de cabecera, sin tarjetas de indicadores con icono (tira de texto con divisores), sin etiquetas en píldora (punto de color + palabra), listas agrupadas tipo app nativa, tablas con reglas y números alineados a la derecha, iniciales de personas y un elemento propio del producto: la rejilla «Mi trimestre» (3 tipos × 3 meses, casillas pulsables) y su versión mini 3×3 en el panel. El título de la pantalla es una frase corta (noun) y debajo va el hallazgo («Te faltan 2 documentos…»). Móvil con barra inferior y botón central para subir; tableta con carril; ordenador con barra lateral y dos columnas. 68/68 pruebas E2E y 0 avisos de recortes en 22 pantallas × 7 tamaños.
