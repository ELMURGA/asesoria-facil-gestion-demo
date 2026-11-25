// Prueba E2E de la demo. Requiere: servidor local en :4195 y playwright-core (npm i playwright-core).
import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BASE = "http://localhost:4195/";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "capturas");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond, extra }); console.log((cond ? "PASS " : "FAIL ") + name + (extra ? " · " + extra : "")); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("dialog", (d) => d.accept());

const wait = (ms = 700) => page.waitForTimeout(ms);
const shot = async (n) => { await wait(); return page.screenshot({ path: `${OUT}/${n}.png`, fullPage: false }); };
const full = async (n) => { await wait(); return page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true }); };
const setRole = (r) => page.evaluate((r) => { window.AFG.store.setRole(r); }, r);
const open = async (hash, role) => { await page.goto(BASE); if (role) await setRole(role); await page.goto(BASE + hash); await page.reload(); await page.waitForSelector("main"); };
const text = async (sel = "main") => (await page.textContent(sel)) || "";
const choose = async (id, value) => { await page.click(`#${id}-btn`); await page.waitForSelector('dialog.pick-sheet[open]'); await page.click(`dialog.pick-sheet .opt[data-v="${value}"]`); await page.waitForSelector('dialog.pick-sheet', { state: 'detached' }); };
const nav = (label) => page.locator(`.rail nav a:has-text("${label}")`).click();

// ---------- 1. Entrada tipo app (sin portada web) ----------
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForSelector("h1");
const t0 = await text("body");
ok("primera pantalla = entrada de app (sin portada web)", (await page.textContent("h1")).includes("Tu asesoría") && !t0.includes("Servicios de asesoría") && !t0.includes("Quiero información"));
ok("opciones claras: cliente y asesor", t0.includes("Soy cliente") && t0.includes("Soy el asesor"));
ok("pie «Desarrollado por Dazenty» enlazado", (await page.locator('a[href="https://dazenty.com/"]:visible').count()) === 1 && t0.includes("Desarrollado por Dazenty"));
ok("DEMO visible", t0.includes("Datos ficticios"));
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
ok("colores base de la agencia (fondo #050505)", bg === "rgb(5, 5, 5)", bg);
const acc = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--acc").trim());
ok("acento coral de la agencia (#d97762)", acc === "#d97762", acc);
await shot("01-escritorio-entrada");
{
  const geo = async () => page.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); const c = r(".entry-card"), b = r(".entry-brand"); return { vw: document.documentElement.clientWidth, cl: c.left, cr: document.documentElement.clientWidth - c.right, bl: b.left, br: b.right, cLeft: c.left, sh: document.documentElement.scrollHeight, ih: window.innerHeight, preview: getComputedStyle(document.querySelector(".entry-preview")).display, dzDesk: getComputedStyle(document.querySelector(".dz-desk")).display, dzSmall: getComputedStyle(document.querySelector(".dz-small")).display }; });
  let g = await geo();
  ok("entrada ordenador: pantalla dividida (marca a la izquierda, acceso a la derecha) con vista previa", g.cLeft > g.br - 1 && g.preview === "block", `tarjeta en x=${Math.round(g.cLeft)}, marca hasta x=${Math.round(g.br)}`);
  ok("entrada ordenador: cabe en la pantalla sin scroll", g.sh <= g.ih + 1, `${g.sh} > ${g.ih}`);
  await page.setViewportSize({ width: 820, height: 1100 }); await wait(200); g = await geo();
  ok("entrada tableta: tarjeta centrada y sin vista previa", Math.abs(g.cl - g.cr) <= 2 && g.preview === "none", `izq ${Math.round(g.cl)} / der ${Math.round(g.cr)}`);
  await shot("01b-tableta-entrada");
  await page.setViewportSize({ width: 517, height: 856 }); await wait(200); g = await geo();
  ok("entrada móvil: tarjeta centrada y firma de Dazenty al final", Math.abs(g.cl - g.cr) <= 2 && g.dzSmall !== "none" && g.dzDesk === "none", `izq ${Math.round(g.cl)} / der ${Math.round(g.cr)}`);
  await shot("01c-movil-entrada");
  await page.setViewportSize({ width: 1280, height: 860 }); await wait(200);
}

// ---------- 2. Cliente ----------
await choose("acc-c", "c1");
await page.click('form[data-form="enter-client"] button[type="submit"]');
await page.waitForSelector(".title-pick");
const home = await text();
ok("inicio del cliente: pregunta respondida (qué falta), zona de subida, rejilla del trimestre, lo del despacho y próximo plazo", home.includes("Te faltan 2 documentos") && home.includes("Arrastra aquí tus facturas del trimestre") && home.includes("Por hacer") && home.includes("Mi trimestre") && home.includes("Del despacho") && home.includes("Próximo plazo"));
ok("inicio sin saludo de cabecera ni indicadores en tarjetas", !/Hola,/.test(home) && (await page.locator(".kpi, .stat").count()) === 0);
ok("rejilla del trimestre: 9 casillas (3 tipos × 3 meses)", (await page.locator(".qgrid .qc").count()) === 9);
ok("c1 no ve datos de otros ni notas internas", !home.includes("Frutas y Verduras") && !home.includes("Estudio Gráfico") && !home.includes("NOTA INTERNA"));
ok("menú del PDF presente", await page.locator(".rail nav").evaluate((n) => ["Inicio", "Subir facturas", "Mis impuestos", "Documentos", "Nóminas", "Mensajes"].every((t) => n.textContent.includes(t))));
await full("02-escritorio-cliente-inicio");

fs.writeFileSync("/tmp/factura-test.pdf", "%PDF-1.4 demo");
await page.setInputFiles("#dz-file", "/tmp/factura-test.pdf");
await page.waitForSelector("dialog[open]");
ok("el archivo elegido llega al diálogo", (await text("dialog")).includes("factura-test.pdf"));
await choose("up-cat", "otros");
await choose("up-mon", "diciembre");
await shot("03-escritorio-subir-dialogo");
await page.click('dialog button[type="submit"]');
await page.waitForSelector("dialog", { state: "detached" });
await nav("Subir facturas");
await page.waitForSelector("h1:has-text('Subir facturas')");
ok("documento nuevo recibido", (await text()).includes("Otros documentos · diciembre"));
fs.writeFileSync("/tmp/malo.exe", "x");
await page.setInputFiles("#dz-file", "/tmp/malo.exe");
await page.waitForSelector("dialog[open]");
ok("error por formato no admitido", (await text("dialog")).includes("no se puede subir"));
await page.keyboard.press("Escape");
ok("Esc cierra el diálogo", (await page.locator("dialog[open]").count()) === 0);

await page.click('.rowi:has-text("Extractos bancarios · octubre") button:has-text("Aportar")');
await page.waitForSelector("dialog[open]");
await page.click('dialog button[type="submit"]');
ok("error si no hay archivo", (await text("dialog #up-msg")).includes("Elige un archivo"));
await choose("up-sample", "0");
await page.click('dialog button[type="submit"]');
await page.waitForSelector("dialog", { state: "detached" });
const row = page.locator('.rowi:has-text("Extractos bancarios · octubre")').first();
ok("el extracto pasa a Recibido", (await row.textContent()).includes("Recibido") && (await row.textContent()).includes("factura-ejemplo-ficticia.pdf"));
await shot("04-escritorio-cliente-subir");
await row.locator('button:has-text("Detalle")').click();
await page.waitForSelector("dialog[open]");
await shot("05-escritorio-detalle-documento");
await page.keyboard.press("Escape");
await page.click('button.chip:has-text("Requiere revisión")');
ok("filtro por estado", (await page.locator("main section:last-of-type .rowi").count()) === 1);
await page.click('button.chip:has-text("Todos los estados")');

// ---------- 3. Asesor ----------
await page.click('.demobar [data-role="advisor"]');
await page.waitForSelector("h1:has-text('Panel')");
const ph = await text();
ok("panel como el PDF (indicadores, clientes con rejilla, automatizaciones)", ph.includes("Clientes activos") && ph.includes("Documentación completa") && ph.includes("Pendientes de entregar") && ph.includes("Consultas abiertas") && ph.includes("Recordatorios por plazo") && ph.includes("Aviso al asesor") && ph.includes("Informe semanal"));
await full("06-escritorio-asesor-panel");
await page.click('button:has-text("Ver ejemplo") >> nth=0');
ok("ejemplo de recordatorios marcado como simulación", (await text("dialog")).includes("SIMULACIÓN"));
await shot("07-escritorio-automatizacion");
await page.keyboard.press("Escape");
const rev = page.locator('section:has-text("Por hacer hoy") .rowi:has-text("Extractos bancarios · octubre"):has-text("Taller")');
ok("el documento aparece en «Por hacer hoy»", (await rev.count()) === 1);
await rev.locator("button").click();
await page.waitForSelector("dialog[open]");
await page.click('dialog button:has-text("Pedir aclaración")');
await page.waitForSelector("dialog[open] textarea");
await page.fill("dialog textarea", "¿Este extracto incluye la cuenta de la tienda? Falta octubre.");
await page.click('dialog button[type="submit"]');
await wait(200);
ok("aclaración deja el documento en Requiere revisión", (await text()).includes("Requiere revisión"));

await open("#/asesor/clientes/c1", "advisor");
await page.waitForSelector("h1:has-text('Taller Mecánico Ejemplo')");
await full("08-escritorio-asesor-ficha");
await page.click('.tabs a:has-text("Notas internas")');
await page.fill("#nt", "NOTA INTERNA (ejemplo): separación visible/no visible.");
await page.click('form[data-form="note"] button');
ok("nota interna guardada", (await text()).includes("separación visible"));
await page.click('.tabs a:has-text("Publicar")');
await choose("pb-k", "modelo");
await page.fill("#pb-n", "Modelo 130 · 4T 2026 · publicado en la demo");
await page.click('form[data-form="publish"] button[type="submit"]');
ok("modelo publicado", (await text()).includes("publicado en la demo"));
await shot("09-escritorio-asesor-publicar");
await page.click('.tabs a:has-text("Firmas")');
await page.click('button:has-text("Pedir una firma")');
await choose("rs-t", "Conformidad de la declaración");
await page.click('dialog button[type="submit"]');
ok("firma solicitada", (await text()).includes("Conformidad de la declaración"));

// ---------- 4. De vuelta al cliente ----------
await open("#/cliente/mensajes", "client");
ok("el cliente ve la aclaración vinculada", (await text()).includes("Aclaración sobre Extractos"));
await page.click('.rowi:has-text("Aclaración sobre Extractos")');
await page.waitForSelector(".linked");
ok("hilo vinculado a documento", (await text()).includes("Vinculada a"));
await shot("10-escritorio-cliente-hilo");
await open("#/cliente/impuestos", "client");
ok("«Mis impuestos» muestra el modelo nuevo con etiqueta Nuevo", (await text()).includes("publicado en la demo") && (await text()).includes("Nuevo"));
const [dl] = await Promise.all([page.waitForEvent("download"), page.click('.rowi:has-text("publicado en la demo") button:has-text("Descargar")')]);
const dtxt = fs.readFileSync(await dl.path(), "utf8");
ok("descarga ficticia identificada como ejemplo", dl.suggestedFilename().endsWith(".txt") && dtxt.includes("EJEMPLO"));
await shot("11-escritorio-cliente-impuestos");
ok("cliente no ve la nota interna", !(await page.content()).includes("separación visible"));
await open("#/cliente/nominas", "client"); await page.waitForSelector("h1:has-text('Nóminas')");
await open("#/cliente/documentos", "client"); await page.waitForSelector("h1:has-text('Documentos')");

await open("#/cliente/firmas", "client");
ok("firma pendiente visible con aviso de demo", (await text()).includes("Conformidad de la declaración") && (await text()).includes("validez legal"));
await page.click('.rowi:has-text("Conformidad de la declaración") button:has-text("Firmar")');
await page.waitForSelector("dialog canvas");
await page.click('dialog button[type="submit"]');
ok("no firma sin dibujar", (await text("dialog")).includes("Dibuja tu firma"));
const cv = await page.locator("dialog canvas").boundingBox();
await page.mouse.move(cv.x + 30, cv.y + 60); await page.mouse.down(); await page.mouse.move(cv.x + 120, cv.y + 30, { steps: 6 }); await page.mouse.move(cv.x + 200, cv.y + 80, { steps: 6 }); await page.mouse.up();
await shot("12-escritorio-firma");
await page.check("#sig-ok");
await page.click('dialog button[type="submit"]');
await page.waitForSelector("dialog", { state: "detached" });
ok("firma registrada", (await page.locator('.rowi:has-text("Conformidad de la declaración") .badge.revisado').count()) >= 1);

await open("#/cliente/plazos", "client");
ok("plazos definidos por el despacho, sin calendario fiscal", (await text()).includes("Plazo de ejemplo definido por el despacho") && (await text()).includes("no incluye ningún calendario fiscal"));
await shot("13-escritorio-cliente-plazos");

await open("#/cliente/subir", "client");
await choose("demo-client", "c3");
const t3 = await text();
ok("c3 solo ve lo suyo", !t3.includes("tickets-gasolina") && !t3.includes("factura-ejemplo-ficticia") && t3.includes("Pendiente de aportar"));
await page.goto(BASE + "#/cliente/mensajes/t1"); await wait(300);
ok("c3 no abre el hilo de c1 por URL", (await text()).includes("no existe o no es tuya"));
await choose("demo-client", "c1");

await open("#/cliente/facturacion", "client");
const bt = await text();
ok("facturación marca SIMULACIÓN", bt.includes("SIMULACIÓN"));
ok("sin «aceptada por AEAT», QR ni homologación", !/aceptad[ao] por la? ?AEAT|homologad|QR/i.test(bt));
await full("14-escritorio-facturacion");
await page.click('button:has-text("Enviar datos de una factura")');
await page.fill("#bn-c", "Concepto ficticio"); await page.fill("#bn-t", "Destinatario ficticio"); await page.fill("#bn-a", "abc");
await page.click('dialog button[type="submit"]');
ok("importe no válido bloquea el envío", (await page.locator("dialog[open]").count()) === 1);
await page.fill("#bn-a", "120,50"); await page.click('dialog button[type="submit"]');
ok("datos de factura recibidos (simulado)", (await text()).includes("Concepto ficticio"));
await open("#/asesor/facturacion", "advisor");
await page.click('li:has-text("Concepto ficticio") button');
ok("avanza a revisión del asesor", (await text("li:has-text('Concepto ficticio')")).includes("Pendiente de revisión"));

await open("#/asesor/clientes", "advisor");
await page.click('button:has-text("Invitar cliente")');
await page.fill("#iv-n", "Cliente Nuevo Ejemplo"); await page.fill("#iv-c", "Persona Nueva"); await page.fill("#iv-e", "nueva@ejemplo.test");
await page.click('dialog button[type="submit"]');
await page.waitForSelector("h1:has-text('Cliente Nuevo Ejemplo')");
await page.click('button:has-text("Archivar cliente")');
ok("cliente invitado y archivado", (await text()).includes("Archivado"));
await open("#/asesor/buscar?q=gasolina", "advisor");
ok("búsqueda por documento", (await text()).includes("tickets-gasolina"));
await open("#/asesor/ajustes", "advisor");
await page.click('.swatch[aria-label="Azul"]');
const acc2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--acc").trim());
ok("«Tu marca»: cambiar el color cambia toda la app", acc2 === "#7db4ff", acc2);
await shot("15-escritorio-asesor-ajustes-marca");
await page.click('.swatch[aria-label^="Coral"]');
await page.fill("#dl-l", "Plazo nuevo de prueba"); await page.fill("#dl-d", "2027-01-20");
await page.click('form[data-form="deadline"] button');
ok("el asesor añade un plazo", (await text()).includes("Plazo nuevo de prueba"));
await open("#/asesor/actividad", "advisor");
ok("trazabilidad registrada", (await text()).includes("Pidió") || (await text()).includes("Marcó") || (await text()).includes("Publicó"));
await open("#/asesor/clientes", "advisor"); await shot("16-escritorio-asesor-clientes");
await open("#/asesor/mensajes", "advisor"); await shot("17-escritorio-asesor-mensajes");

await page.click(".demobar button:has-text('Reiniciar')");
await wait(200);
await open("#/cliente/subir", "client");
ok("el reinicio restaura los datos", (await page.locator('.rowi:has-text("Extractos bancarios · octubre")').first().textContent()).includes("Pendiente de aportar"));
ok("el reinicio borra notas, plazos y clientes nuevos", await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("afg-demo-v2")); return !s.notes.some((n) => n.text.includes("separación visible")) && !s.clients.some((c) => c.name.includes("Nuevo Ejemplo")) && !s.settings.deadlines.some((d) => d.label.includes("nuevo de prueba")) && s.settings.brand.accent === "#d97762"; }));

await page.goto(BASE + "#/");
await page.evaluate(() => document.querySelector(".skip").focus());
ok("enlace de salto visible con foco", await page.evaluate(() => document.activeElement.classList.contains("skip") && document.activeElement.getBoundingClientRect().left >= 0));
await page.keyboard.press("Tab");
ok("Tab llega a un control con foco visible", await page.evaluate(() => { const el = document.activeElement; return el && el !== document.body && getComputedStyle(el).outlineStyle !== "none"; }));

// ---------- 4b. Selector propio (sin desplegable nativo) ----------
await open("#/cliente/subir", "client");
const nat = await page.evaluate(() => [...document.querySelectorAll("select")].filter((s) => { const r = s.getBoundingClientRect(); return r.width > 2 && r.height > 2; }).length);
ok("ningún desplegable nativo visible (todos usan el selector propio)", nat === 0, `${nat} visibles`);
await page.setViewportSize({ width: 390, height: 844 });
await open("#/", "visitor");
await page.click("#acc-c-btn"); await page.waitForSelector("dialog.pick-sheet[open]"); await wait(300);
const sheet = await page.evaluate(() => { const d = document.querySelector("dialog.pick-sheet").getBoundingClientRect(); const o = [...document.querySelectorAll(".opt")].map((e) => e.getBoundingClientRect()); return { within: d.left >= 0 && d.right <= window.innerWidth + 1 && d.bottom <= window.innerHeight + 1 && d.top >= 0, minH: Math.min(...o.map((r) => r.height)), n: o.length, focus: document.activeElement.classList.contains("opt") }; });
ok("móvil: la hoja del selector cabe en pantalla, opciones grandes y con foco", sheet.within && sheet.minH >= 44 && sheet.focus, JSON.stringify(sheet));
await shot("v-movil-selector");
await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await wait(250);
ok("teclado: flechas y Enter eligen opción", (await page.textContent("#acc-c-btn")).includes("Estudio Gráfico"));
await page.click("#acc-c-btn"); await page.keyboard.press("Escape"); await wait(200);
ok("Esc cierra el selector sin cambiar nada", (await page.locator("dialog[open]").count()) === 0 && (await page.textContent("#acc-c-btn")).includes("Estudio Gráfico"));
await page.setViewportSize({ width: 1280, height: 860 });

// ---------- 5. Versiones por dispositivo ----------
const routes = ["#/", "#/cliente", "#/cliente/subir", "#/cliente/impuestos", "#/cliente/documentos", "#/cliente/nominas", "#/cliente/mensajes", "#/cliente/mensajes/t1", "#/cliente/plazos", "#/cliente/firmas", "#/cliente/facturacion", "#/asesor", "#/asesor/clientes", "#/asesor/clientes/c1", "#/asesor/clientes/c1/mensajes", "#/asesor/clientes/c1/publicar", "#/asesor/clientes/c1/firmas", "#/asesor/clientes/c1/notas", "#/asesor/clientes/c1/facturacion", "#/asesor/documentos", "#/asesor/mensajes", "#/asesor/mensajes/t2", "#/asesor/facturacion", "#/asesor/ajustes", "#/asesor/actividad", "#/asesor/buscar?q=taller"];
const devs = [[1280, 860, "ordenador"], [820, 1100, "tableta"], [390, 844, "movil"]];
for (const [w, h, tag] of devs) {
  await page.setViewportSize({ width: w, height: h });
  const bad = [];
  for (const r of routes) {
    await page.goto(BASE);
    await page.evaluate((r) => window.AFG.store.setRole(r.startsWith("#/cliente") ? "client" : r.startsWith("#/asesor") ? "advisor" : "visitor"), r);
    await page.goto(BASE + r); await page.reload(); await page.waitForTimeout(100);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (o.sw > o.iw + 1) bad.push(`${r} (${o.sw}>${o.iw})`);
  }
  ok(`sin desbordamiento horizontal · ${tag} · ${routes.length} rutas`, bad.length === 0, bad.join(", "));
  await open("#/cliente", "client");
  const lay = await page.evaluate(() => ({ rail: getComputedStyle(document.querySelector(".rail")).display, tab: getComputedStyle(document.querySelector(".tabbar")).display, railW: document.querySelector(".rail").getBoundingClientRect().width }));
  if (tag === "movil") ok("versión móvil: barra inferior y sin carril", lay.tab !== "none" && lay.rail === "none");
  if (tag === "tableta") ok("versión tableta: carril de iconos y sin barra inferior", lay.tab === "none" && lay.rail !== "none" && lay.railW < 120, `${lay.railW}px`);
  if (tag === "ordenador") ok("versión ordenador: barra lateral con nombres", lay.tab === "none" && lay.railW > 200, `${lay.railW}px`);
  if (tag === "movil") {
    const small = await page.evaluate(() => [...document.querySelectorAll("main a, main button, .tabbar a, .tabbar button")].filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect()).filter((r) => r.height < 36 && r.width < 44).length);
    ok("móvil: sin controles táctiles diminutos", small === 0, `${small} pequeños`);
  }
  const n = { ordenador: "escritorio", tableta: "tableta", movil: "movil" }[tag];
  await full(`v-${n}-cliente-inicio`);
  await open("#/asesor", "advisor"); await full(`v-${n}-asesor-panel`);
  await open("#/cliente/subir", "client"); await full(`v-${n}-cliente-subir`);
  await open("#/cliente/impuestos", "client"); await full(`v-${n}-cliente-impuestos`);
  if (tag === "movil") { await open("#/", "visitor"); await full("v-movil-entrada"); await open("#/cliente/mensajes/t1", "client"); await full("v-movil-hilo"); await open("#/cliente/firmas", "client"); await full("v-movil-firmas"); await open("#/cliente/facturacion", "client"); await full("v-movil-facturacion"); await open("#/asesor/clientes/c1", "advisor"); await full("v-movil-asesor-ficha"); }
  if (tag === "ordenador") { await open("#/", "visitor"); await full("v-escritorio-entrada"); }
}
await open("#/cliente", "client");
await page.click('.tabbar button:has-text("Más")');
await page.waitForSelector("dialog[open]");
ok("móvil: «Más» abre una hoja con el resto de secciones", (await text("dialog")).includes("Nóminas") && (await text("dialog")).includes("Firmas"));
await shot("v-movil-mas");
await page.keyboard.press("Escape");

await page.setViewportSize({ width: 1400, height: 900 });
await page.goto(BASE + "versiones.html");
await page.waitForTimeout(500);
ok("página de versiones con móvil/tableta/ordenador", (await page.locator("[data-d]").count()) === 3 && (await page.locator("#fr").count()) === 1);
for (const d of ["phone", "tablet", "desktop"]) { await page.click(`[data-d="${d}"]`); await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/versiones-${d}.png` }); }

ok("sin errores de consola", errors.length === 0, errors.slice(0, 3).join(" | "));
fs.writeFileSync(path.join(HERE, "..", "docs", "resultado-e2e.json"), JSON.stringify({ fecha: new Date().toISOString(), resultados: results }, null, 2));
const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length}/${results.length} comprobaciones superadas`);
await browser.close();
process.exit(fails.length ? 1 : 0);
