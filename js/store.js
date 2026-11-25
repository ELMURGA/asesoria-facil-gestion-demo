/* Estado de la DEMO. Todo vive en el navegador (localStorage) y, si no está disponible, en memoria.
   No hay servidor, ni autenticación real, ni aislamiento real entre clientes: esto es una maqueta. */
(function () {
  const KEY = "afg-demo-v2";
  const AFG = (window.AFG = window.AFG || {});

  const CATS = { emitidas: "Facturas emitidas", gastos: "Facturas de gastos", bancos: "Extractos bancarios", otros: "Otros documentos" };
  const PUB_KINDS = { modelo: "Modelo presentado", nomina: "Nómina", tc: "TC (cotizaciones)", altabaja: "Alta o baja", contrato: "Contrato", general: "Documentación general" };
  const SECTIONS = { impuestos: ["modelo"], nominas: ["nomina", "tc", "altabaja"], documentos: ["contrato", "general"] };
  const PERIODS = { "2026-T4": "4.º trimestre 2026", "2026-T3": "3.º trimestre 2026" };
  const PSHORT = { "2026-T4": "4T 2026", "2026-T3": "3T 2026" };
  const MONTHS = { "2026-T4": ["octubre", "noviembre", "diciembre"], "2026-T3": ["julio", "agosto", "septiembre"] };
  const CURRENT = "2026-T4";
  const STATUS = { pendiente: "Pendiente de aportar", recibido: "Recibido", revision: "Requiere revisión", revisado: "Revisado" };
  const BILL = { datos_recibidos: "Datos recibidos", pendiente_revision: "Pendiente de revisión del asesor", resuelto_herramienta: "Resuelto en la herramienta de facturación" };
  const docName = (cat, month) => `${CATS[cat]} · ${month}`;
  Object.assign(AFG, { CATS, PUB_KINDS, SECTIONS, PERIODS, PSHORT, MONTHS, CURRENT, STATUS, BILL, docName });

  const day = 86400000;
  const ago = (d, h = 0) => new Date(Date.now() - d * day - h * 3600000).toISOString();
  const ahead = (d) => new Date(Date.now() + d * day).toISOString().slice(0, 10);

  function seed() {
    const clients = [
      { id: "c1", name: "Taller Mecánico Ejemplo", contact: "Persona de ejemplo A", type: "Autónomo", email: "a@ejemplo.test", status: "activo", since: ago(60) },
      { id: "c2", name: "Estudio Gráfico Ejemplo", contact: "Persona de ejemplo B", type: "Autónomo", email: "b@ejemplo.test", status: "activo", since: ago(48) },
      { id: "c3", name: "Frutas y Verduras Ejemplo, S.L.", contact: "Persona de ejemplo C", type: "Sociedad", email: "c@ejemplo.test", status: "activo", since: ago(33) },
      { id: "c4", name: "Consulta de Fisioterapia Ejemplo", contact: "Persona de ejemplo D", type: "Autónomo", email: "d@ejemplo.test", status: "activo", since: ago(20) },
      { id: "c5", name: "Reformas Ejemplo (baja)", contact: "Persona de ejemplo E", type: "Particular", email: "e@ejemplo.test", status: "archivado", since: ago(120) },
      { id: "c6", name: "Papelería Ejemplo", contact: "Persona de ejemplo F", type: "Sociedad", email: "f@ejemplo.test", status: "invitado", since: ago(2) },
    ];
    const D = (id, clientId, period, cat, month, status, extra) =>
      Object.assign({ id, clientId, period, cat, month, name: docName(cat, month), status, file: null, note: "", at: ago(5) }, extra || {});
    const F = (n, kind, kb) => ({ name: n, kind, kb });
    const T4 = "2026-T4", T3 = "2026-T3";
    const docs = [
      D("d1", "c1", T4, "emitidas", "octubre", "recibido", { file: F("facturas-emitidas-ejemplo.xlsx", "xlsx", 84), at: ago(1, 3) }),
      D("d2", "c1", T4, "gastos", "noviembre", "revision", { file: F("tickets-gasolina-ejemplo.jpg", "img", 1840), at: ago(3), note: "La foto no se lee bien. ¿Puedes subirla otra vez con más luz, o en PDF?" }),
      D("d3", "c1", T4, "bancos", "octubre", "pendiente", { at: ago(6) }),
      D("d4", "c1", T3, "emitidas", "septiembre", "revisado", { file: F("emitidas-3t-ejemplo.pdf", "pdf", 220), at: ago(75) }),
      D("d5", "c1", T3, "gastos", "septiembre", "revisado", { file: F("gastos-3t-ejemplo.pdf", "pdf", 960), at: ago(74) }),
      D("d6", "c2", T4, "emitidas", "octubre", "revisado", { file: F("emitidas-estudio-ejemplo.pdf", "pdf", 310), at: ago(8) }),
      D("d7", "c2", T4, "gastos", "octubre", "revisado", { file: F("gastos-estudio-ejemplo.pdf", "pdf", 540), at: ago(8) }),
      D("d8", "c2", T4, "bancos", "noviembre", "recibido", { file: F("extracto-estudio-ejemplo.pdf", "pdf", 150), at: ago(0, 6) }),
      D("d9", "c2", T3, "emitidas", "septiembre", "revisado", { file: F("emitidas-3t-estudio.pdf", "pdf", 200), at: ago(80) }),
      D("d10", "c3", T4, "emitidas", "octubre", "pendiente", { at: ago(9) }),
      D("d11", "c3", T4, "gastos", "octubre", "pendiente", { at: ago(9) }),
      D("d12", "c3", T4, "gastos", "noviembre", "pendiente", { at: ago(9) }),
      D("d13", "c3", T3, "emitidas", "septiembre", "revisado", { file: F("emitidas-frutas-3t.xlsx", "xlsx", 130), at: ago(70) }),
      D("d14", "c4", T4, "emitidas", "noviembre", "recibido", { file: F("emitidas-consulta-ejemplo.pdf", "pdf", 175), at: ago(2) }),
      D("d15", "c4", T4, "gastos", "noviembre", "recibido", { file: F("gastos-consulta-ejemplo.pdf", "pdf", 405), at: ago(2) }),
      D("d16", "c4", T4, "bancos", "octubre", "revisado", { file: F("extracto-consulta-ejemplo.pdf", "pdf", 120), at: ago(4) }),
      D("d17", "c4", T3, "bancos", "septiembre", "revisado", { file: F("extracto-3t-consulta.pdf", "pdf", 118), at: ago(71) }),
      D("d18", "c1", T4, "gastos", "octubre", "revisado", { file: F("gastos-octubre-ejemplo.pdf", "pdf", 612), at: ago(20) }),
      D("d19", "c1", T4, "emitidas", "noviembre", "recibido", { file: F("emitidas-noviembre-ejemplo.pdf", "pdf", 140), at: ago(0, 9) }),
      D("d20", "c2", T4, "bancos", "octubre", "revisado", { file: F("extracto-octubre-estudio.pdf", "pdf", 133), at: ago(15) }),
      D("d21", "c2", T4, "emitidas", "noviembre", "recibido", { file: F("emitidas-noviembre-estudio.pdf", "pdf", 170), at: ago(1) }),
      D("d22", "c2", T4, "gastos", "noviembre", "pendiente", { at: ago(4) }),
      D("d23", "c3", T4, "bancos", "octubre", "pendiente", { at: ago(9) }),
      D("d24", "c3", T4, "emitidas", "noviembre", "pendiente", { at: ago(5) }),
      D("d25", "c4", T4, "emitidas", "octubre", "revisado", { file: F("emitidas-octubre-consulta.pdf", "pdf", 160), at: ago(18) }),
      D("d26", "c4", T4, "gastos", "octubre", "revisado", { file: F("gastos-octubre-consulta.pdf", "pdf", 380), at: ago(18) }),
    ];
    const P = (id, clientId, period, kind, name, at, seen, text) => ({ id, clientId, period, kind, name, at, seen, text });
    const EJ = "DOCUMENTO DE EJEMPLO. Contenido ficticio para la demostración; no es un documento oficial.";
    const published = [
      P("p1", "c1", T3, "modelo", "Modelo 303 · 3T 2026 · ejemplo ficticio", ago(40), true, EJ),
      P("p2", "c1", T4, "general", "Guía para fotografiar tickets · ejemplo", ago(3), false, "DOCUMENTO DE EJEMPLO. Cómo preparar fotos legibles de tickets y facturas."),
      P("p3", "c2", T3, "modelo", "Modelo 130 · 3T 2026 · ejemplo ficticio", ago(41), true, EJ),
      P("p4", "c2", T4, "nomina", "Nómina octubre · ejemplo ficticio", ago(25), true, EJ),
      P("p5", "c2", T4, "tc", "TC octubre · ejemplo ficticio", ago(24), true, EJ),
      P("p6", "c3", T4, "nomina", "Nómina octubre · ejemplo ficticio", ago(26), true, EJ),
      P("p7", "c3", T4, "altabaja", "Alta de trabajador · ejemplo ficticio", ago(18), false, EJ),
      P("p8", "c4", T3, "contrato", "Contrato de ejemplo (ficticio)", ago(50), true, EJ),
      P("p9", "c4", T3, "modelo", "Modelo 303 · 3T 2026 · ejemplo ficticio", ago(40), true, EJ),
    ];
    const T = (from, text, at) => ({ from, text, at });
    const threads = [
      { id: "t1", clientId: "c1", subject: "Tickets de gasolina ilegibles", docId: "d2", status: "esperando_cliente", unread: { client: true, advisor: false },
        msgs: [T("advisor", "Hola, la foto de los tickets de gasolina no se lee bien. ¿Puedes subirla otra vez con más luz, o en PDF?", ago(3))] },
      { id: "t2", clientId: "c4", subject: "Duda sobre los pagos con tarjeta", docId: null, status: "esperando_asesor", unread: { client: false, advisor: true },
        msgs: [T("client", "Buenas, ¿los justificantes de los pagos con tarjeta los subo en gastos o en otros documentos?", ago(0, 5))] },
      { id: "t3", clientId: "c2", subject: "Cambio de cuenta bancaria", docId: "d8", status: "esperando_asesor", unread: { client: false, advisor: true },
        msgs: [T("client", "He cambiado de cuenta a mitad de trimestre. En el extracto que he subido salen las dos. ¿Está bien así?", ago(0, 2))] },
      { id: "t4", clientId: "c3", subject: "Recordatorio de documentación", docId: null, status: "esperando_cliente", unread: { client: true, advisor: false },
        msgs: [T("advisor", "Aún no hemos recibido nada de este periodo. ¿Necesitas ayuda para subir los documentos desde el móvil?", ago(2))] },
    ];
    const notes = [
      { id: "n1", clientId: "c3", text: "NOTA INTERNA (ejemplo): suele entregar tarde. Llamar si no hay nada en una semana.", at: ago(10) },
      { id: "n2", clientId: "c1", text: "NOTA INTERNA (ejemplo): pregunta siempre por los tickets de gasolina; preparar guía.", at: ago(12) },
    ];
    const billing = [
      { id: "b1", clientId: "c1", concept: "Reparación de vehículo (ejemplo)", to: "Cliente final ficticio 1", total: "242,00", status: "datos_recibidos", at: ago(1), adv: "" },
      { id: "b2", clientId: "c1", concept: "Cambio de neumáticos (ejemplo)", to: "Cliente final ficticio 2", total: "380,00", status: "pendiente_revision", at: ago(2), adv: "" },
      { id: "b3", clientId: "c2", concept: "Diseño de cartelería (ejemplo)", to: "Cliente final ficticio 3", total: "650,00", status: "resuelto_herramienta", at: ago(6), adv: "Resuelto de forma simulada" },
      { id: "b4", clientId: "c4", concept: "Sesión de fisioterapia (ejemplo)", to: "Paciente ficticio", total: "45,00", status: "datos_recibidos", at: ago(0, 8), adv: "" },
    ];
    const signs = [
      { id: "s1", clientId: "c1", title: "Hoja de encargo", status: "pendiente", at: ago(4), img: "" },
      { id: "s2", clientId: "c2", title: "Autorización de representación", status: "firmado", at: ago(30), img: "" },
      { id: "s3", clientId: "c4", title: "Conformidad de la declaración", status: "pendiente", at: ago(1), img: "" },
    ];
    const activity = [
      { id: "a1", at: ago(0, 2), actor: "cliente", clientId: "c2", text: "Escribió en «Cambio de cuenta bancaria»" },
      { id: "a2", at: ago(0, 5), actor: "cliente", clientId: "c4", text: "Escribió en «Duda sobre los pagos con tarjeta»" },
      { id: "a3", at: ago(1, 3), actor: "cliente", clientId: "c1", text: "Subió «facturas-emitidas-ejemplo.xlsx»" },
      { id: "a4", at: ago(3), actor: "asesor", clientId: "c1", text: "Marcó «Facturas de gastos · noviembre» como «Requiere revisión»" },
      { id: "a5", at: ago(8), actor: "asesor", clientId: "c2", text: "Marcó «Facturas emitidas · octubre» como «Revisado»" },
    ];
    const settings = {
      deadlines: [
        { id: "k1", label: "Entrega de la documentación del 4T al despacho", date: ahead(12), mark: true },
        { id: "k2", label: "Plazo de ejemplo definido por el despacho", date: ahead(41), mark: false },
      ],
      remind: { days: [10, 5, 2], email: true, whatsapp: false },
      auto: { reminders: true, notifyAdvisor: true, weekly: true },
      remindBy: {},
      outbox: [],
      brand: { accent: "#d97762" },
      services: { fiscal: true, laboral: true, tramites: true, facturacion: true },
      profile: { trade: "Asesoría Fácil Gestión", legal: "ASESORÍA FÁCIL GESTIÓN, SL", nif: "", address: "", email: "", phone: "", hours: "" },
    };
    return { v: 2, role: "visitor", clientId: "c1", period: CURRENT, clients, docs, published, threads, notes, billing, signs, activity, settings };
  }

  let mem = null, persistent = true;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 2) return s; } } catch (e) { persistent = false; }
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); persistent = true; } catch (e) { persistent = false; } }
  mem = load();

  const uid = (p) => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  const now = () => new Date().toISOString();

  const S = (AFG.store = {
    KEY,
    get state() { return mem; },
    get persistent() { return persistent; },
    save,
    reset() { mem = seed(); save(); },
    setRole(r) { mem.role = r; save(); },
    setClient(id) { mem.clientId = id; save(); },
    setPeriod(p) { mem.period = p; save(); },
    client(id) { return mem.clients.find((c) => c.id === id); },
    me() { return S.client(mem.clientId); },
    doc(id) { return mem.docs.find((d) => d.id === id); },
    log(actor, clientId, text) { mem.activity.unshift({ id: uid("a"), at: now(), actor, clientId, text }); },

    attach(docId, file, actor) {
      const d = S.doc(docId); d.file = file; d.status = "recibido"; d.note = ""; d.at = now();
      S.log(actor, d.clientId, `Subió «${file.name}» a «${d.name}»`); save(); return d;
    },
    addDoc(clientId, cat, period, month, file, comment, actor) {
      const d = { id: uid("d"), clientId, period, cat, month, name: docName(cat, month), status: "recibido", file, note: "", at: now() };
      mem.docs.unshift(d);
      S.log(actor, clientId, `Subió «${file.name}» (${d.name})`);
      if (comment) S.say(clientId, `Comentario sobre «${file.name}»`, d.id, "client", comment);
      save(); return d;
    },
    setStatus(docId, status, note) {
      const d = S.doc(docId); d.status = status; d.note = note || "";
      S.log("asesor", d.clientId, `Marcó «${d.name}» como «${STATUS[status]}»`); save();
    },
    request(clientId, cat, period, month, text) {
      const d = { id: uid("d"), clientId, period, cat, month, name: docName(cat, month), status: "pendiente", file: null, note: text || "", at: now() };
      mem.docs.unshift(d);
      S.log("asesor", clientId, `Pidió «${d.name}»`);
      S.say(clientId, `Falta información: ${d.name}`, d.id, "advisor", text || "Necesitamos que aportes este documento para poder cerrar el periodo.");
      save(); return d;
    },
    say(clientId, subject, docId, from, text) {
      let t = mem.threads.find((t) => t.clientId === clientId && t.status !== "resuelta" && ((docId && t.docId === docId) || (!docId && t.subject === subject)));
      if (!t) { t = { id: uid("t"), clientId, subject, docId: docId || null, status: "", unread: { client: false, advisor: false }, msgs: [] }; mem.threads.unshift(t); }
      t.msgs.push({ from, text, at: now() });
      t.status = from === "client" ? "esperando_asesor" : "esperando_cliente";
      t.unread = { client: from === "advisor", advisor: from === "client" };
      S.log(from === "client" ? "cliente" : "asesor", clientId, `Escribió en «${t.subject}»`);
      save(); return t;
    },
    reply(threadId, from, text) {
      const t = mem.threads.find((t) => t.id === threadId);
      t.msgs.push({ from, text, at: now() });
      t.status = from === "client" ? "esperando_asesor" : "esperando_cliente";
      t.unread = { client: from === "advisor", advisor: from === "client" };
      S.log(from === "client" ? "cliente" : "asesor", t.clientId, `Escribió en «${t.subject}»`); save();
    },
    resolve(threadId) { const t = mem.threads.find((t) => t.id === threadId); t.status = "resuelta"; t.unread = { client: false, advisor: false }; S.log("asesor", t.clientId, `Resolvió «${t.subject}»`); save(); },
    markRead(threadId, side) { const t = mem.threads.find((t) => t.id === threadId); if (t && t.unread[side]) { t.unread[side] = false; save(); } },

    publish(clientId, kind, name, period, text) {
      const p = { id: uid("p"), clientId, kind, name, period, at: now(), seen: false, text: "DOCUMENTO DE EJEMPLO. " + (text || "Contenido ficticio para la demostración.") };
      mem.published.unshift(p); S.log("asesor", clientId, `Publicó «${name}» (${PUB_KINDS[kind]})`); save(); return p;
    },
    seenPub(id) { const p = mem.published.find((p) => p.id === id); if (p && !p.seen) { p.seen = true; save(); } },

    requestSign(clientId, title) { const s = { id: uid("s"), clientId, title, status: "pendiente", at: now(), img: "" }; mem.signs.unshift(s); S.log("asesor", clientId, `Pidió firma: «${title}»`); save(); return s; },
    sign(id, img) { const s = mem.signs.find((s) => s.id === id); s.status = "firmado"; s.at = now(); s.img = img || ""; S.log("cliente", s.clientId, `Firmó «${s.title}» (firma simulada)`); save(); },

    invite(name, contact, type, email) {
      const c = { id: uid("c"), name, contact, type, email, status: "invitado", since: now() };
      mem.clients.unshift(c); S.log("asesor", c.id, `Invitó a «${name}» (invitación simulada, no se envía nada)`); save(); return c;
    },
    archive(id, on) { const c = S.client(id); c.status = on ? "archivado" : "activo"; S.log("asesor", id, on ? "Archivó el cliente" : "Reactivó el cliente"); save(); },
    addNote(clientId, text) { mem.notes.unshift({ id: uid("n"), clientId, text, at: now() }); S.log("asesor", clientId, "Añadió una nota interna"); save(); },
    delNote(id) { mem.notes = mem.notes.filter((n) => n.id !== id); save(); },

    addDeadline(label, date) { mem.settings.deadlines.push({ id: uid("k"), label, date, mark: false }); mem.settings.deadlines.sort((a, b) => a.date.localeCompare(b.date)); save(); },
    delDeadline(id) { mem.settings.deadlines = mem.settings.deadlines.filter((k) => k.id !== id); save(); },

    addBill(clientId, concept, to, total) {
      const b = { id: uid("b"), clientId, concept, to, total, status: "datos_recibidos", at: now(), adv: "" };
      mem.billing.unshift(b); S.log("cliente", clientId, `Envió datos de factura «${concept}» (simulado)`); save(); return b;
    },
    advanceBill(id) {
      const b = mem.billing.find((b) => b.id === id);
      const next = { datos_recibidos: "pendiente_revision", pendiente_revision: "resuelto_herramienta" }[b.status]; if (!next) return;
      b.status = next; b.adv = next === "resuelto_herramienta" ? "Resuelto de forma simulada" : "";
      S.log("asesor", b.clientId, `Facturación (simulada): «${b.concept}» → ${BILL[next]}`); save();
    },
    outbox(text, clientId) { mem.settings.outbox.unshift({ at: now(), text, client: clientId }); mem.settings.outbox = mem.settings.outbox.slice(0, 30); save(); },

    docsOf(clientId, period) { return mem.docs.filter((d) => d.clientId === clientId && (!period || d.period === period)); },
    pending(clientId, period) { return S.docsOf(clientId, period).filter((d) => d.status === "pendiente" || d.status === "revision"); },
    threadsOf(clientId) { return mem.threads.filter((t) => t.clientId === clientId); },
    activeClients() { return mem.clients.filter((c) => c.status !== "archivado"); },
    pubsOf(clientId, kinds) { return mem.published.filter((p) => p.clientId === clientId && (!kinds || kinds.includes(p.kind))); },
    signsOf(clientId) { return mem.signs.filter((s) => s.clientId === clientId); },
    nextDeadline() { const t = new Date().toISOString().slice(0, 10); return mem.settings.deadlines.find((k) => k.date >= t); },
  });
})();
