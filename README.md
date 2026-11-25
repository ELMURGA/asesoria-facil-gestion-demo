# Asesoría Fácil Gestión, SL · Demo local del portal

Demo navegable para validar alcance y presupuestar. **No es un sistema fiscal, no está en producción y no equivale a contratar.**
Datos 100 % ficticios. No hay servidor, correo, WhatsApp, SMS, certificados ni conexión con la AEAT.

## Cómo verla (URL local de revisión)

```bash
cd /Users/usuario/Documents/WEBS/BOCETOS/asesoria-facil-gestion
python3 -m http.server 4195
```
Abrir **http://localhost:4195** (también funciona abriendo `index.html` directamente, sin servidor).

## Accesos demo (visibles, sin contraseñas)
- Primera pantalla = **entrada de app** (sin portada web): «Soy cliente» (elige cliente de ejemplo) o «Soy el asesor».
- **Versiones por dispositivo**: `versiones.html` muestra la misma app en móvil, tableta y ordenador. En un móvil real, abrir `index.html` ya da la versión móvil (barra inferior tipo app).
- Colores base provisionales = los de la agencia Dazenty (fondo #050505, coral #d97762); en Ajustes > Tu marca se puede cambiar el color.
- Barra superior plegable: **Entrada / Cliente / Asesor**, selector de **cliente de ejemplo** y botón **Reiniciar datos de la demo**.
- Portada → «Ya soy cliente: acceder» → elegir cliente de ejemplo o entrar como asesor.
- No se piden contraseñas personales a nadie.

## Recorrido obligatorio (verificado, ver docs/VERIFICACION.md)
1. Entrada → «Soy cliente» → «Taller Mecánico Ejemplo» (inicio como el PDF: zona de subida, filas con estado, próximo plazo).
2. Aportar «Extractos bancarios · octubre» con un documento ficticio, con «Elegir archivo» o con «Hacer foto» (solo se guarda nombre y tamaño) → estado **Recibido**.
4. Cambiar a **Asesor** → aparece en «Para revisar ahora» → **Pedir aclaración**.
5. La consulta aparece en la ficha de ese cliente y, vinculada al documento, en el área del cliente.
6. Asesor → ficha → Publicar → un modelo de ejemplo → el cliente lo ve en **Mis impuestos** (o Nóminas / Documentos según el tipo) y lo descarga (archivo de texto ficticio).
7. Extras del PDF: firma dibujada de ejemplo, plazos que fija el asesor, automatizaciones simuladas (recordatorios, aviso al asesor, informe semanal).
8. **Reiniciar** restaura los datos de origen.

## Persistencia
Los cambios viven en **localStorage del navegador** (clave `afg-demo-v1`); si no está disponible, en memoria. Por tanto:
- La autenticación, el aislamiento entre clientes y la sincronización entre dispositivos **no son reales**: el aislamiento solo existe en la interfaz (cada vista filtra por el cliente elegido). Cualquiera con el navegador puede ver todo.
- No se suben archivos: solo se guardan nombre, tipo y tamaño.

## Estructura
`index.html` · `versiones.html` · `css/styles.css` · `js/` (store, ui, app/router, entrada, cliente, asesor, facturación simulada, compartidas) · `fonts/` (Inter y Space Grotesk, autoalojadas) · `img/` · `tests/` · `capturas/` · `docs/` · `pdf/` (**PDF ilustrativo para el cliente**: `pdf/Asesoria-Facil-Gestion-Portal-Demo.pdf`).
Sin dependencias ni build.

## Documentos
- `docs/INVENTARIO.md` reutilizable / nuevo / simulado / pendiente de decidir
- `docs/FUNCIONES-Y-LIMITES.md` qué funciona de verdad y qué no
- `docs/NOTA-TECNICA-VERIFACTU.md` opciones por estudiar (sin elegir)
- `docs/PRODUCCION.md` requisitos para producción (no implementados)
- `docs/ESTIMACION-Y-DECISIONES.md` partidas sin cifras y decisiones necesarias
- `docs/VERIFICACION.md` pruebas y limitaciones
- `PRODUCT.md` supuestos de producto y marca
