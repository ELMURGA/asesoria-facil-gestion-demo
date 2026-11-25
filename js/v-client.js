/* Área de cliente (sigue el PDF: subir facturas, impuestos, documentos, nóminas, mensajes, plazos, firmas).
   Solo lee y escribe datos del cliente de ejemplo elegido (aislamiento SIMULADO en la interfaz). */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store, toast, badge, fmtDate, fmtTime, fmtSize } = AFG;
  const FILT = { cat: "all", st: "all", lab: "all" };
  const MONTH_ORDER = ["julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const periodSelect = () => `<div class="field" style="min-width:12rem"><label for="per">Trimestre</label>
    <select id="per" data-change="period">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === store.state.period ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>`;

  const byMonth = (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);

  function dropzone() {
    return `<div class="dropzone" id="dz"><b class="dz-d">Arrastra aquí tus facturas del trimestre</b><b class="dz-m">Sube tus facturas del trimestre</b>
      <span class="muted small">o hazles una foto con el móvil · PDF, JPG o Excel</span>
      <div class="acts"><label class="btn" for="dz-cam">${ico("camera")}Hacer foto</label>
        <label class="btn secondary" for="dz-file">${ico("upload")}Elegir archivo</label></div>
      <input id="dz-file" class="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,image/*">
      <input id="dz-cam" class="sr-only" type="file" accept="image/*" capture="environment"></div>`;
  }
  function mountDrop() {
    const dz = document.getElementById("dz"); if (!dz) return;
    const open = (f) => { if (f) AFG.uploadDialog(store.state.clientId, null, f); };
    ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("over"); }));
    dz.addEventListener("drop", (e) => open(e.dataTransfer.files[0]));
    ["dz-file", "dz-cam"].forEach((id) => document.getElementById(id).addEventListener("change", (e) => { open(e.target.files[0]); e.target.value = ""; }));
  }

  function docRow(d) {
    const act = d.status === "pendiente" ? `<button class="btn sm" data-action="upload-for" data-id="${d.id}">${ico("upload")}Aportar</button>`
      : d.status === "revision" ? `<button class="btn sm" data-action="upload-for" data-id="${d.id}">${ico("refresh")}Sustituir</button>` : "";
    return `<div class="rowi"><div class="main"><div class="t">${esc(d.name)}</div><div class="s">${d.file ? esc(d.file.name) + " · " + fmtSize(d.file.kb) : "Sin archivo todavía"}</div></div>
      <div class="acts">${badge(d.status)}<button class="btn sm ghost" data-action="open-doc" data-id="${d.id}" data-side="client">Detalle</button>${act}</div></div>`;
  }
  function pubRow(p) {
    return `<div class="rowi"><div class="main"><div class="t">${esc(p.name)} ${!p.seen ? '<span class="badge nuevo">Nuevo</span>' : ""}</div><div class="s">${esc(AFG.PUB_KINDS[p.kind])} · ${esc(AFG.PERIODS[p.period])} · publicado ${esc(fmtDate(p.at))}</div></div>
      <div class="acts"><button class="btn sm secondary" data-action="dl-pub" data-id="${p.id}">${ico("download")}Descargar</button></div></div>`;
  }

  // ---------- Inicio: la pregunta es «¿qué me falta por entregar?» ----------
  function home() {
    const c = store.me(), per = store.state.period;
    const docs = store.docsOf(c.id, per);
    const pendDocs = docs.filter((d) => d.status === "pendiente" || d.status === "revision").sort(byMonth);
    const tax = store.pubsOf(c.id, AFG.SECTIONS.impuestos)[0];
    const pubs = store.pubsOf(c.id).slice(0, 2);
    const nd = store.nextDeadline();
    const toReply = store.threadsOf(c.id).filter((t) => t.status === "esperando_cliente");
    const signs = store.signsOf(c.id).filter((x) => x.status === "pendiente");
    const r = AFG.remindOf(c.id);
    const n = pendDocs.length;
    const finding = n
      ? `Te ${n === 1 ? "falta" : "faltan"} <b>${n} ${n === 1 ? "documento" : "documentos"}</b> por entregar${nd ? ` antes del <b>${esc(fmtDate(nd.date))}</b> (faltan ${AFG.daysTo(nd.date)} días)` : ""}.`
      : `Estás al día en ${esc(AFG.PERIODS[per])}. Si tienes algo más, súbelo cuando quieras.`;
    const todo = [];
    pendDocs.forEach((d) => todo.push(`<div class="rowi"><div class="main"><div class="t">${esc(d.name)}</div><div class="s">${d.status === "revision" ? "Te lo ha devuelto el despacho: " + esc(d.note.slice(0, 80)) : "Pendiente de aportar"}</div></div><div class="acts">${d.status === "revision" ? badge("revision") : ""}<button class="btn sm ${d.status === "revision" ? "" : "secondary"}" data-action="upload-for" data-id="${d.id}">${d.status === "revision" ? "Sustituir" : "Aportar"}</button></div></div>`));
    toReply.forEach((t) => todo.push(`<a class="rowi" href="#/cliente/mensajes/${t.id}"><div class="main"><div class="t">${esc(t.subject)}</div><div class="s">Mensaje del despacho · te toca responder</div></div>${ico("next", "chev")}</a>`));
    signs.forEach((x) => todo.push(`<a class="rowi" href="#/cliente/firmas"><div class="main"><div class="t">Firmar: ${esc(x.title)}</div><div class="s">Firma pendiente</div></div>${ico("next", "chev")}</a>`));
    return `<div class="stack-lg">
      <div class="page-head"><div><h1><select id="per" data-title data-change="period" aria-label="Trimestre">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === per ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></h1><p class="sub">${finding}</p></div></div>
      ${dropzone()}
      <div class="home-grid">
        <section aria-labelledby="h-todo" style="grid-area:a"><div class="sec"><h2 id="h-todo">Por hacer</h2><span class="muted small fig">${todo.length}</span></div>
          <div class="rows">${todo.length ? todo.join("") : `<div class="rowi"><div class="main"><div class="t">Nada pendiente</div><div class="s">No tienes documentos, mensajes ni firmas por atender.</div></div></div>`}</div></section>
        <section aria-labelledby="h-q" style="grid-area:b"><div class="sec"><h2 id="h-q">Mi trimestre</h2><a href="#/cliente/subir">Ver documentos</a></div>${AFG.qgrid(c.id, per)}</section>
        <section aria-labelledby="h-des" style="grid-area:c"><div class="sec"><h2 id="h-des">Del despacho</h2><a href="#/cliente/impuestos">Mis impuestos</a></div>
          <div class="rows">
            ${pubs.map((p) => `<div class="rowi"><div class="main"><div class="t">${esc(p.name)} ${!p.seen ? '<span class="badge nuevo">Nuevo</span>' : ""}</div><div class="s">${esc(AFG.PUB_KINDS[p.kind])} · publicado ${esc(fmtDate(p.at))}</div></div><div class="acts"><button class="btn sm secondary" data-action="dl-pub" data-id="${p.id}">${ico("download")}Descargar</button></div></div>`).join("")}
            ${nd ? `<a class="rowi" href="#/cliente/plazos"><div class="main"><div class="t">Próximo plazo: ${esc(nd.label)}</div><div class="s">hasta el ${esc(fmtDate(nd.date))} · aviso ${r.days.join(", ")} días antes${r.email || r.whatsapp ? "" : " (desactivado)"}</div></div>${ico("next", "chev")}</a>` : ""}
          </div></section>
      </div></div>`;
  }

  // ---------- Subir facturas ----------
  function upload() {
    const c = store.me(), per = store.state.period;
    let docs = store.docsOf(c.id, per).sort(byMonth);
    const pend = docs.filter((d) => d.status === "pendiente" || d.status === "revision");
    if (FILT.cat !== "all") docs = docs.filter((d) => d.cat === FILT.cat);
    if (FILT.st !== "all") docs = docs.filter((d) => d.status === FILT.st);
    const chip = (grp, k, l) => `<button type="button" class="chip" data-action="filt" data-grp="${grp}" data-k="${k}" aria-pressed="${FILT[grp] === k}">${esc(l)}</button>`;
    return `<div class="stack-lg"><div class="page-head"><div><h1>Subir facturas</h1><p class="sub">Se ordenan solas por trimestre y tipo: emitidas, gastos y bancos.</p></div>${periodSelect()}</div>
      ${dropzone()}
      <section aria-labelledby="h-qq"><div class="sec"><h2 id="h-qq">Mi trimestre</h2></div>${AFG.qgrid(store.me().id, per)}</section>
      ${pend.length ? `<section aria-labelledby="h-falta"><div class="sec"><h2 id="h-falta">Lo que falta</h2></div><div class="rows">${pend.map(docRow).join("")}</div></section>` : `<div class="notice ok">${ico("check")}<div>Estás al día en ${esc(AFG.PERIODS[per])}.</div></div>`}
      <section aria-labelledby="h-ya"><div class="sec"><h2 id="h-ya">Lo que ya has aportado</h2></div>
        <div class="stack"><div class="scrollx" role="group" aria-label="Filtrar por tipo">${chip("cat", "all", "Todos")}${Object.entries(AFG.CATS).map(([k, v]) => chip("cat", k, v)).join("")}</div>
        <div class="scrollx" role="group" aria-label="Filtrar por estado">${chip("st", "all", "Todos los estados")}${Object.entries(AFG.STATUS).map(([k, v]) => chip("st", k, v)).join("")}</div>
        <div class="rows">${docs.length ? docs.map(docRow).join("") : AFG.empty("doc", "Nada con estos filtros", "Quita algún filtro o cambia de trimestre.", `<button class="btn sm secondary" data-action="filt-reset">Quitar filtros</button>`)}</div></div></section></div>`;
  }

  // ---------- Impuestos, documentos y nóminas (descargas publicadas por el asesor) ----------
  function pubPage(title, intro, kinds, emptyTxt, withChips) {
    const c = store.me();
    let list = store.pubsOf(c.id, kinds);
    if (withChips && FILT.lab !== "all") list = list.filter((p) => p.kind === FILT.lab);
    const chip = (k, l) => `<button type="button" class="chip" data-action="filt" data-grp="lab" data-k="${k}" aria-pressed="${FILT.lab === k}">${esc(l)}</button>`;
    const groups = {};
    list.forEach((p) => (groups[p.period] = groups[p.period] || []).push(p));
    return `<div class="stack-lg"><div class="page-head"><div><h1>${esc(title)}</h1><p class="muted">${esc(intro)}</p></div></div>
      ${withChips ? `<div class="scrollx" role="group" aria-label="Filtrar por tipo">${chip("all", "Todo")}${kinds.map((k) => chip(k, AFG.PUB_KINDS[k])).join("")}</div>` : ""}
      ${list.length ? Object.keys(groups).sort().reverse().map((p) => `<section><h2 style="margin-bottom:.6rem">${esc(AFG.PERIODS[p])}</h2><div class="rows">${groups[p].map(pubRow).join("")}</div></section>`).join("") : `<div class="card">${AFG.empty("download", emptyTxt, "Cuando el despacho publique algo, aparecerá aquí.")}</div>`}
      <p class="small muted">En la demo, las descargas son archivos de texto ficticios.</p></div>`;
  }

  // ---------- Mensajes ----------
  function messages(sub) {
    const c = store.me();
    if (sub[0]) {
      const t = store.state.threads.find((x) => x.id === sub[0] && x.clientId === c.id);
      if (!t) return { html: AFG.empty("chat", "Esa conversación no existe o no es tuya", "", '<a class="btn sm" href="#/cliente/mensajes">Volver</a>'), title: "Mensajes" };
      store.markRead(t.id, "client");
      return { html: AFG.threadHtml(t, "client"), title: t.subject };
    }
    const th = store.threadsOf(c.id);
    return { html: `<div class="stack-lg"><div class="page-head"><div><h1>Mensajes</h1><p class="muted">Cada consulta queda ligada a tu asunto o a un documento.</p></div><button class="btn" data-action="new-thread">${ico("plus")}Nueva consulta</button></div>
      ${th.length ? `<div class="rows">${th.map((t) => `<a class="rowi" style="text-decoration:none;color:inherit" href="#/cliente/mensajes/${t.id}"><div class="main"><div class="t">${esc(t.subject)} ${t.unread.client ? '<span class="badge nuevo">Nuevo</span>' : ""}</div><div class="s">${esc(t.msgs[t.msgs.length - 1].text.slice(0, 90))}…</div></div><div class="acts">${AFG.threadBadge(t, "client")}</div></a>`).join("")}</div>` : `<div class="card">${AFG.empty("chat", "Todavía no hay conversaciones", "Escribe a tu asesor cuando tengas una duda.", `<button class="btn" data-action="new-thread">Nueva consulta</button>`)}</div>`}</div>`, title: "Mensajes" };
  }

  // ---------- Plazos y avisos ----------
  function deadlines() {
    const c = store.me(), r = AFG.remindOf(c.id), s = store.state.settings;
    const pend = store.pending(c.id, store.state.period).length;
    const nd = store.nextDeadline() || s.deadlines[0];
    const preview = `Hola, ${c.contact}: te faltan ${pend} documento${pend === 1 ? "" : "s"} por aportar. Plazo: ${nd ? fmtDate(nd.date) : "por definir"}. Súbelos desde el móvil en tu espacio.`;
    const box = s.outbox.filter((o) => o.client === c.id);
    return `<div class="stack-lg"><div class="page-head"><div><h1>Plazos y avisos</h1><p class="muted">Las fechas las introduce tu asesor. La demo no incluye ningún calendario fiscal oficial.</p></div></div>
      <section class="card"><h2>Próximos plazos</h2>
        ${s.deadlines.map((k) => { const d = new Date(k.date + "T00:00:00"); const n = AFG.daysTo(k.date); return `<div class="deadline"><div class="dday"><b>${d.getDate()}</b><span>${d.toLocaleDateString("es-ES", { month: "short" })}</span></div><div class="grow"><div style="font-weight:600">${esc(k.label)}</div><div class="small muted">${n >= 0 ? `faltan ${n} días` : "pasado"}</div></div>${r.email || r.whatsapp ? `<span class="badge revisado">${ico("bell")}Aviso activo</span>` : '<span class="badge neutral">Sin aviso</span>'}</div>`; }).join("") || AFG.empty("calendar", "Sin plazos definidos", "")}</section>
      <div class="notice">${ico("alert")}<div><strong>Demostración.</strong> No se envía ningún WhatsApp ni correo. Los avisos «enviados» solo aparecen aquí abajo.</div></div>
      <form class="card stack" data-form="remind" novalidate><h2>Cómo quieres que te avisemos</h2>
        <fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:.4rem">Avisarme antes del plazo</legend><div class="row">${[10, 5, 2].map((n) => `<label class="check"><input type="checkbox" name="d${n}" ${r.days.includes(n) ? "checked" : ""}> ${n} días antes</label>`).join("")}</div></fieldset>
        <fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:.4rem">Canales</legend><div class="stack">
          <div class="check"><input type="checkbox" id="r-e" name="email" ${r.email ? "checked" : ""}><label for="r-e">Correo electrónico</label></div>
          <div class="check"><input type="checkbox" id="r-w" name="whatsapp" ${r.whatsapp ? "checked" : ""}><label for="r-w">WhatsApp <span class="muted small">(requiere integración y consentimiento; no activo en la demo)</span></label></div></div></fieldset>
        <div><button class="btn" type="submit">Guardar preferencias</button></div></form>
      <section class="card stack"><h2>Vista previa del aviso</h2><div class="msg" style="max-width:none">${esc(preview)}</div>
        <div><button class="btn secondary" data-action="sim-notice" data-text="${esc(preview)}">Simular el envío</button></div></section>
      <section class="card"><h2>Avisos simulados</h2>${box.length ? `<ul class="list">${box.map((o) => `<li><div class="main"><div class="s">${esc(fmtTime(o.at))} · simulado, no enviado</div><div>${esc(o.text)}</div></div></li>`).join("")}</ul>` : AFG.empty("bell", "Aún no hay avisos simulados", "Pulsa «Simular el envío» para ver cómo quedaría.")}</section></div>`;
  }

  // ---------- Firmas ----------
  function signs() {
    const c = store.me(), list = store.signsOf(c.id);
    return `<div class="stack-lg"><div class="page-head"><div><h1>Firmas</h1><p class="muted">Hojas de encargo, autorizaciones y conformidad de declaraciones, firmadas desde el móvil.</p></div></div>
      <div class="notice">${ico("alert")}<div>Firma de <strong>demostración</strong>: se dibuja en pantalla y se guarda en este navegador. No tiene validez legal ni usa ningún proveedor de firma.</div></div>
      ${list.length ? `<div class="rows">${list.map((x) => `<div class="rowi"><div class="main"><div class="t">${esc(x.title)}</div><div class="s">${x.status === "firmado" ? "Firmado " + esc(fmtDate(x.at)) : "Solicitado " + esc(fmtDate(x.at))}</div></div><div class="acts">${x.status === "firmado" ? `<span class="badge revisado">${ico("check")}Firmado</span>` : `<span class="badge pendiente">${ico("clock")}Pendiente</span><button class="btn sm" data-action="sign" data-id="${x.id}">${ico("pen")}Firmar</button>`}</div></div>`).join("")}</div>` : `<div class="card">${AFG.empty("pen", "No tienes nada pendiente de firma", "Cuando tu asesor te pida una firma, aparecerá aquí.")}</div>`}</div>`;
  }

  function signDialog(id) {
    const x = store.state.signs.find((s) => s.id === id);
    AFG.dialog("Firmar: " + x.title, `<form class="stack" novalidate>
      <p class="muted small">Dibuja tu firma en el recuadro (con el dedo o el ratón).</p>
      <canvas class="sign" id="sig" aria-label="Recuadro para dibujar la firma"></canvas>
      <div><button type="button" class="btn ghost sm" id="sig-clear">Borrar y repetir</button></div>
      <div class="check"><input type="checkbox" id="sig-ok" required><label for="sig-ok">Acepto «${esc(x.title)}». Entiendo que esta firma es una demostración sin validez legal.</label></div>
      <div id="sig-msg" aria-live="polite"></div>
      <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Firmar (demo)</button></div></form>`, (dlg, close) => {
      const cv = dlg.querySelector("#sig"); const ratio = window.devicePixelRatio || 1;
      const fit = () => { const w = cv.clientWidth, h = cv.clientHeight; cv.width = w * ratio; cv.height = h * ratio; const g = cv.getContext("2d"); g.scale(ratio, ratio); g.lineWidth = 2.4; g.lineCap = "round"; g.strokeStyle = "#111"; };
      fit(); let draw = false, dirty = false; const g = cv.getContext("2d");
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener("pointerdown", (e) => { draw = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); g.beginPath(); g.moveTo(x, y); });
      cv.addEventListener("pointermove", (e) => { if (!draw) return; const [x, y] = pos(e); g.lineTo(x, y); g.stroke(); dirty = true; });
      ["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => (draw = false)));
      dlg.querySelector("#sig-clear").addEventListener("click", () => { g.clearRect(0, 0, cv.width, cv.height); dirty = false; });
      dlg.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        if (!dirty) { dlg.querySelector("#sig-msg").innerHTML = AFG.err("Dibuja tu firma en el recuadro."); return; }
        if (!dlg.querySelector("#sig-ok").checked) { dlg.querySelector("#sig-msg").innerHTML = AFG.err("Marca la casilla para aceptar."); return; }
        store.sign(id, cv.toDataURL("image/png")); close(); toast("Firma registrada (simulada)."); AFG.render();
      });
    });
  }

  AFG.views.cliente = function (sub) {
    const k = sub[0] || "";
    const m = () => mountDrop();
    if (k === "") return { html: home(), title: "Inicio", mount: m };
    if (k === "subir") return { html: upload(), title: "Subir facturas", mount: m };
    if (k === "impuestos") return { html: pubPage("Mis impuestos", "Tus modelos presentados, siempre a mano. Los presenta y publica tu asesor; el portal no calcula impuestos.", AFG.SECTIONS.impuestos, "Todavía no hay modelos publicados", false), title: "Mis impuestos" };
    if (k === "documentos") return { html: pubPage("Documentos", "Contratos y documentación general que el despacho publica para ti.", AFG.SECTIONS.documentos, "No hay documentos todavía", false), title: "Documentos" };
    if (k === "nominas") return { html: pubPage("Nóminas", "Para clientes con empleados: nóminas, TC, altas y bajas, mes a mes.", AFG.SECTIONS.nominas, "No hay documentos laborales", true), title: "Nóminas" };
    if (k === "mensajes") return messages(sub.slice(1));
    if (k === "plazos") return { html: deadlines(), title: "Plazos y avisos" };
    if (k === "firmas") return { html: signs(), title: "Firmas" };
    if (k === "facturacion") return { html: AFG.billingHtml("client"), title: "Servicio de facturación (simulación)" };
    return { html: AFG.empty("info", "Página no encontrada", "", '<a class="btn sm" href="#/cliente">Ir al inicio</a>') };
  };

  Object.assign(AFG.actions, {
    "upload-for"(el) { AFG.uploadDialog(store.state.clientId, el.dataset.id); },
    "new-thread"() { AFG.newThreadDialog(store.state.clientId, "client", null); },
    filt(el) { FILT[el.dataset.grp] = el.dataset.k; AFG.render(); },
    "filt-reset"() { FILT.cat = "all"; FILT.st = "all"; AFG.render(); },
    sign(el) { signDialog(el.dataset.id); },
    "sim-notice"(el) { store.outbox(el.dataset.text, store.state.clientId); toast("Aviso simulado. No se ha enviado nada."); AFG.render(); },
  });
  AFG.forms.remind = function (f) {
    const s = store.state.settings;
    s.remindBy[store.state.clientId] = { days: [10, 5, 2].filter((n) => f.elements["d" + n].checked), email: f.elements.email.checked, whatsapp: f.elements.whatsapp.checked };
    store.save(); toast("Preferencias guardadas (solo en esta demo)."); AFG.render();
  };
})();
