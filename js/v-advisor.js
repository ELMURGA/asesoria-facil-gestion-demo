/* Panel del asesor (despacho de una sola persona). Datos ficticios. Sigue el panel del PDF. */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store, toast, badge, fmtDate, fmtTime, fmtSize } = AFG;
  const A = "#/asesor";
  const F = { cstatus: "activo", dstatus: "all", dclient: "all", q: "", tmode: "mine", actClient: "all" };
  const SWATCHES = [["#d97762", "Coral Dazenty (provisional)"], ["#5fb58a", "Verde"], ["#7db4ff", "Azul"], ["#e0b04f", "Ámbar"], ["#c792ea", "Violeta"]];

  const periodSelect = () => `<div class="field" style="min-width:12rem"><label for="per">Trimestre</label>
    <select id="per" data-change="period">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === store.state.period ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>`;

  function delivery(c, per) {
    const docs = store.docsOf(c.id, per);
    return { total: docs.length, got: docs.filter((d) => d.file).length, pend: docs.filter((d) => d.status === "pendiente").length, rev: docs.filter((d) => d.status === "revision").length, nuevo: docs.filter((d) => d.status === "recibido").length, docs };
  }
  const lastMove = (c) => { const a = store.state.activity.find((x) => x.clientId === c.id); return a ? a.at : c.since; };
  const cstat = (c) => c.status === "archivado" ? '<span class="badge neutral">Archivado</span>' : c.status === "invitado" ? '<span class="badge recibido">Invitación simulada</span>' : '<span class="badge revisado">Activo</span>';
  const bar = (a, b) => `<div class="progress" role="img" aria-label="${a} de ${b} entregados"><span style="width:${b ? Math.round((a / b) * 100) : 0}%"></span></div>`;

  function docState(d) {
    if (d.pend) return { txt: `Faltan ${d.pend} documento${d.pend > 1 ? "s" : ""}`, tag: store.state.settings.auto.reminders ? '<span class="badge pendiente">Aviso programado</span>' : '<span class="badge pendiente">Pendiente</span>' };
    if (d.rev) return { txt: `${d.rev} con incidencia`, tag: '<span class="badge revision">Esperando cliente</span>' };
    if (d.nuevo) return { txt: `${d.nuevo} por revisar`, tag: '<span class="badge recibido">Revisar</span>' };
    return { txt: "Completa", tag: '<span class="badge revisado">Listo</span>' };
  }

  // ---------- Panel: ¿a quién me falta por recibir y qué tengo que revisar hoy? ----------
  function home() {
    const s = store.state, per = s.period;
    const act = s.clients.filter((c) => c.status === "activo");
    const rows = act.map((c) => ({ c, d: delivery(c, per) }));
    const complete = rows.filter((r) => r.d.total && !r.d.pend && !r.d.rev).length;
    const missing = rows.filter((r) => r.d.pend > 0).length;
    const queue = s.docs.filter((d) => d.period === per && (d.status === "recibido" || d.status === "revision") && store.client(d.clientId).status === "activo");
    const msgs = s.threads.filter((t) => t.status === "esperando_asesor");
    const au = s.settings.auto;
    const todo = [];
    queue.slice(0, 5).forEach((d) => todo.push(`<div class="rowi"><div class="main"><div class="t">${esc(d.name)}</div><div class="s">${esc(store.client(d.clientId).name)}${d.file ? " · " + esc(d.file.name) : ""}</div></div><div class="acts">${badge(d.status)}<button class="btn sm secondary" data-action="open-doc" data-id="${d.id}" data-side="advisor">Revisar</button></div></div>`));
    msgs.slice(0, 3).forEach((t) => todo.push(`<a class="rowi" href="${A}/mensajes/${t.id}"><div class="main"><div class="t">${esc(t.subject)}</div><div class="s">${esc(store.client(t.clientId).name)} · espera tu respuesta</div></div>${ico("next", "chev")}</a>`));
    const finding = `<b>${queue.length}</b> ${queue.length === 1 ? "documento" : "documentos"} por revisar, <b>${msgs.length}</b> ${msgs.length === 1 ? "mensaje" : "mensajes"} sin responder y <b>${missing}</b> ${missing === 1 ? "cliente" : "clientes"} con documentación pendiente.`;
    const sw = (k, label) => `<label class="sw"><input type="checkbox" role="switch" data-change="auto-toggle" data-k="${k}" ${au[k] ? "checked" : ""} aria-label="${esc(label)}"><span></span></label>`;
    return `<div class="stack-lg">
      <div class="page-head"><div><h1>Panel</h1><p class="sub">${finding}</p></div>${periodSelect()}</div>
      <div class="strip">
        <a class="strip-i" href="${A}/clientes"><small>Clientes activos</small><b>${act.length}</b></a>
        <div><small>Documentación completa</small><b>${act.length ? Math.round((complete / act.length) * 100) : 0}<span class="u">%</span></b><i>${complete} de ${act.length} clientes</i></div>
        <a class="strip-i ${missing ? "alert" : ""}" href="${A}/clientes"><small>Pendientes de entregar</small><b>${missing}</b><i>${au.reminders ? "con aviso programado" : "sin aviso"}</i></a>
        <a class="strip-i ${msgs.length ? "alert" : ""}" href="${A}/mensajes"><small>Consultas abiertas</small><b>${msgs.length}</b></a>
      </div>
      <section aria-labelledby="h-hoy"><div class="sec"><h2 id="h-hoy">Por hacer hoy</h2><a href="${A}/documentos">Ver documentos</a></div>
        <div class="rows">${todo.length ? todo.join("") : `<div class="rowi"><div class="main"><div class="t">Nada por hacer</div><div class="s">No hay documentos por revisar ni mensajes sin responder.</div></div></div>`}</div></section>
      <section class="card" aria-labelledby="h-ent" style="padding:8px 8px 4px"><div class="sec" style="margin:12px 12px 4px"><h2 id="h-ent">Clientes · ${esc(AFG.PERIODS[per])}</h2><a href="${A}/clientes">Ver todos</a></div>
        <div class="table-wrap"><table class="stack-sm"><thead><tr><th scope="col">Cliente</th><th scope="col">Trimestre</th><th scope="col" class="num">Faltan</th><th scope="col" class="hide-md">Último movimiento</th><th scope="col">Estado</th><th scope="col"><span class="sr-only">Acción</span></th></tr></thead><tbody>
        ${rows.map(({ c, d }) => { const st = docState(d); return `<tr><td class="first" data-label="Cliente"><div class="nm2">${AFG.avatar(c.name)}<div><a class="t" href="${A}/clientes/${c.id}">${esc(c.name)}</a><div class="s">${esc(c.type)}</div></div></div></td><td data-label="Trimestre">${AFG.mini9(c.id, per)}</td><td class="num" data-label="Faltan">${d.pend}</td><td class="hide-md" data-label="Último movimiento">${esc(fmtTime(lastMove(c)))}</td><td data-label="Estado">${st.tag}</td><td data-label=""><a class="btn sm secondary" href="${A}/clientes/${c.id}">Abrir</a></td></tr>`; }).join("")}
        </tbody></table></div></section>
      <section aria-labelledby="h-auto"><div class="sec"><h2 id="h-auto">Automatizaciones</h2><span class="muted small">Simuladas: no envían nada</span></div>
        <div class="rows">
          <div class="rowi"><div class="main"><div class="t">Recordatorios por plazo</div><div class="s">Correo y WhatsApp a quien no ha entregado, ${s.settings.remind.days.join(", ")} días antes del plazo.</div></div><div class="acts"><button class="btn sm ghost" data-action="prev-reminders">Ver ejemplo</button>${sw("reminders", "Recordatorios por plazo")}</div></div>
          <div class="rowi"><div class="main"><div class="t">Aviso al asesor</div><div class="s">Cuando un cliente sube documentación, te enteras al momento.</div></div><div class="acts"><button class="btn sm ghost" data-action="prev-notify">Ver ejemplo</button>${sw("notifyAdvisor", "Aviso al asesor")}</div></div>
          <div class="rowi"><div class="main"><div class="t">Informe semanal</div><div class="s">Un resumen cada lunes con lo pendiente y lo que vence.</div></div><div class="acts"><button class="btn sm ghost" data-action="prev-weekly">Ver ejemplo</button>${sw("weekly", "Informe semanal")}</div></div>
        </div></section></div>`;
  }
  function actList(items) {
    if (!items.length) return AFG.empty("list", "Sin actividad", "");
    return `<ul class="list">${items.map((a) => { const c = store.client(a.clientId); return `<li><div class="main"><div class="s">${esc(fmtTime(a.at))} · ${esc(a.actor === "asesor" ? "Asesor" : a.actor === "cliente" ? "Cliente" : "Sistema")}${c ? " · " + esc(c.name) : ""}</div><div>${esc(a.text)}</div></div></li>`; }).join("")}</ul>`;
  }

  // ---------- Clientes ----------
  function clients() {
    const s = store.state, per = s.period, q = F.q.trim().toLowerCase();
    let list = s.clients.filter((c) => F.cstatus === "all" || c.status === F.cstatus);
    if (q) list = list.filter((c) => (c.name + c.contact + c.email).toLowerCase().includes(q));
    const chip = (k, l) => `<button type="button" class="chip" data-action="adv-filt" data-grp="cstatus" data-k="${k}" aria-pressed="${F.cstatus === k}">${l}</button>`;
    return `<div class="stack-lg"><div class="page-head"><div><h1>Clientes</h1><p class="muted">Alta gradual: invita a cada cliente cuando quieras. Todo ficticio.</p></div><button class="btn" data-action="invite">${ico("plus")}Invitar cliente</button></div>
      <div class="filters"><div class="field"><label for="cq">Buscar cliente</label><input id="cq" type="search" value="${esc(F.q)}" data-change="adv-q" placeholder="Nombre o contacto"></div>${periodSelect()}</div>
      <div class="scrollx" role="group" aria-label="Filtrar por estado">${chip("activo", "Activos")}${chip("invitado", "Invitados")}${chip("archivado", "Archivados")}${chip("all", "Todos")}</div>
      <section class="card"><div class="table-wrap">${list.length ? `<table class="stack-sm"><caption class="sr-only">Clientes</caption><thead><tr><th scope="col">Cliente</th><th scope="col">Estado</th><th scope="col">${esc(AFG.PSHORT[per])}</th><th scope="col" class="num">Faltan</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead><tbody>
        ${list.map((c) => { const d = delivery(c, per); return `<tr><td class="first" data-label="Cliente"><div class="nm2">${AFG.avatar(c.name)}<div><a href="${A}/clientes/${c.id}" class="t">${esc(c.name)}</a><div class="s">${esc(c.type)} · ${esc(c.contact)}</div></div></div></td><td data-label="Estado">${cstat(c)}</td><td data-label="${esc(AFG.PSHORT[per])}">${c.status === "invitado" ? '<span class="muted">—</span>' : AFG.mini9(c.id, per)}</td><td class="num" data-label="Faltan">${c.status === "invitado" ? "—" : d.pend}</td><td data-label=""><a class="btn sm secondary" href="${A}/clientes/${c.id}">Abrir ficha</a></td></tr>`; }).join("")}</tbody></table>` : AFG.empty("users", "Ningún cliente con estos filtros", "Cambia el filtro o invita a un cliente nuevo.")}</div></section></div>`;
  }

  // ---------- Ficha ----------
  function ficha(id, tab) {
    const c = store.client(id);
    if (!c) return { html: AFG.empty("users", "Cliente no encontrado", "", `<a class="btn sm" href="${A}/clientes">Volver a clientes</a>`) };
    const per = store.state.period;
    const tabs = [["", "Documentación", "doc"], ["mensajes", "Mensajes", "chat"], ["publicar", "Publicar", "download"], ["firmas", "Firmas", "pen"], ["notas", "Notas internas", "lock"], ["facturacion", "Facturación", "list"]];
    let body = "";
    if (tab === "") {
      const docs = store.docsOf(c.id, per);
      body = `<section class="card"><div class="panel-title"><h2>Documentación · ${esc(AFG.PERIODS[per])}</h2><button class="btn sm" data-action="request" data-id="${c.id}">${ico("plus")}Pedir información que falta</button></div>
        <div class="filters">${periodSelect()}</div>
        ${docs.length ? `<ul class="list">${docs.map((d) => `<li><div class="main"><div class="t">${esc(d.name)}</div><div class="s">${d.file ? esc(d.file.name) + " · " + fmtSize(d.file.kb) : "Sin archivo"}</div></div>${badge(d.status)}<button class="btn sm secondary" data-action="open-doc" data-id="${d.id}" data-side="advisor">${d.file ? "Revisar" : "Ver"}</button></li>`).join("")}</ul>` : AFG.empty("doc", "Sin documentación en este trimestre", "Pide al cliente lo que necesites.")}</section>`;
    } else if (tab === "mensajes") {
      const th = store.threadsOf(c.id);
      body = `<section class="card"><div class="panel-title"><h2>Conversaciones</h2><button class="btn sm" data-action="adv-new-thread" data-id="${c.id}">${ico("plus")}Nueva consulta</button></div>
        ${th.length ? `<ul class="list">${th.map((t) => `<li><div class="main"><div class="t">${esc(t.subject)}</div><div class="s">${esc(fmtTime(t.msgs[t.msgs.length - 1].at))}</div></div>${AFG.threadBadge(t, "advisor")}<a class="btn sm secondary" href="${A}/mensajes/${t.id}">Abrir</a></li>`).join("")}</ul>` : AFG.empty("chat", "Sin conversaciones", "")}</section>`;
    } else if (tab === "publicar") {
      const pubs = store.pubsOf(c.id);
      body = `<div class="stack-lg"><section class="card"><h2>Publicado para el cliente</h2>
        ${pubs.length ? `<ul class="list">${pubs.map((p) => `<li><div class="main"><div class="t">${esc(p.name)}</div><div class="s">${esc(AFG.PUB_KINDS[p.kind])} · ${esc(AFG.PERIODS[p.period])} · ${esc(fmtDate(p.at))}</div></div>${p.seen ? '<span class="badge neutral">Visto</span>' : '<span class="badge nuevo">Sin ver</span>'}<button class="btn sm ghost" data-action="dl-pub" data-id="${p.id}">${ico("download")}Descargar</button></li>`).join("")}</ul>` : AFG.empty("download", "Aún no has publicado nada para este cliente", "")}</section>
        <form class="card stack" data-form="publish" data-id="${c.id}" novalidate><h2>Publicar un documento de ejemplo</h2>
          <p class="muted small">En la demo no se sube un archivo real: se genera una pieza ficticia con el nombre que elijas. El cliente la verá en «Mis impuestos», «Nóminas» o «Documentos» según el tipo. No se calcula nada.</p>
          <div class="form-grid"><div class="field"><label for="pb-k">Tipo</label><select id="pb-k" name="kind">${Object.entries(AFG.PUB_KINDS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select></div>
            <div class="field"><label for="pb-p">Trimestre</label><select id="pb-p" name="period">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === per ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>
            <div class="field full"><label for="pb-n">Nombre del documento</label><input id="pb-n" name="name" type="text" required maxlength="90" value="Documento de ejemplo (ficticio)"><span class="err">Escribe un nombre.</span></div>
            <div class="field full"><label for="pb-t">Contenido ficticio (opcional)</label><textarea id="pb-t" name="text" maxlength="500"></textarea></div></div>
          <div><button class="btn" type="submit">Publicar para ${esc(c.name)}</button></div></form></div>`;
    } else if (tab === "firmas") {
      const ss = store.signsOf(c.id);
      body = `<section class="card"><div class="panel-title"><h2>Firmas</h2><button class="btn sm" data-action="req-sign" data-id="${c.id}">${ico("plus")}Pedir una firma</button></div>
        <p class="small muted" style="margin-bottom:.6rem">Firma de demostración sin validez legal.</p>
        ${ss.length ? `<ul class="list">${ss.map((x) => `<li><div class="main"><div class="t">${esc(x.title)}</div><div class="s">${esc(fmtDate(x.at))}</div></div>${x.status === "firmado" ? `<span class="badge revisado">${ico("check")}Firmado</span>` : `<span class="badge pendiente">${ico("clock")}Pendiente</span>`}</li>`).join("")}</ul>` : AFG.empty("pen", "Sin firmas solicitadas", "")}</section>`;
    } else if (tab === "notas") {
      const notes = store.state.notes.filter((n) => n.clientId === c.id);
      body = `<section class="internal stack"><h2>Notas internas ${ico("lock")}</h2><p class="small">Solo las ve el despacho. El cliente nunca las recibe: ni en mensajes, ni en descargas, ni en su historial.</p>
        <form class="stack" data-form="note" data-id="${c.id}" novalidate><div class="field"><label for="nt">Nueva nota interna</label><textarea id="nt" name="text" required></textarea><span class="err">Escribe la nota.</span></div><div><button class="btn secondary" type="submit">Guardar nota</button></div></form>
        ${notes.length ? `<ul class="list">${notes.map((n) => `<li><div class="main"><div class="s">${esc(fmtDate(n.at))}</div><div>${esc(n.text)}</div></div><button class="btn sm danger" data-action="del-note" data-id="${n.id}">Borrar</button></li>`).join("")}</ul>` : AFG.empty("lock", "Sin notas internas", "")}</section>`;
    } else if (tab === "facturacion") {
      const items = store.state.billing.filter((b) => b.clientId === c.id);
      body = `<section class="card"><div class="sim-banner" style="margin-bottom:1rem">SIMULACIÓN con datos ficticios. Más detalle en <a href="${A}/facturacion">Facturación</a>.</div>${items.length ? `<ul class="list">${items.map((b) => `<li><div class="main"><div class="t">${esc(b.concept)}</div><div class="s">${esc(b.to)} · ${esc(b.total)} €</div></div><span class="badge neutral">${esc(AFG.BILL[b.status])}</span></li>`).join("")}</ul>` : AFG.empty("list", "Sin envíos de ejemplo", "")}</section>`;
    }
    const html = `<div class="stack-lg"><div class="page-head"><div><a class="small t2" href="${A}/clientes">← Clientes</a><div class="row" style="gap:14px;margin-top:8px;flex-wrap:nowrap">${AFG.avatar(c.name, 44)}<div><h1>${esc(c.name)}</h1><p class="sub" style="margin-top:4px">${cstat(c)} · ${esc(c.type)} · ${esc(c.contact)} · ${esc(c.email)}</p></div></div></div>
      ${c.status === "archivado" ? `<button class="btn secondary" data-action="archive" data-id="${c.id}" data-on="0">Reactivar</button>` : `<button class="btn danger" data-action="archive" data-id="${c.id}" data-on="1">${ico("archive")}Archivar cliente</button>`}</div>
      <nav class="tabs" aria-label="Secciones de la ficha">${tabs.map(([k, l, i]) => `<a href="${A}/clientes/${c.id}${k ? "/" + k : ""}" ${tab === k ? 'aria-current="page"' : ""}>${ico(i)}${l}</a>`).join("")}</nav>${body}</div>`;
    return { html, title: c.name };
  }

  // ---------- Documentos ----------
  function documents() {
    const s = store.state, per = s.period, q = F.q.trim().toLowerCase();
    let docs = s.docs.filter((d) => d.period === per && store.client(d.clientId).status !== "archivado");
    if (F.dstatus !== "all") docs = docs.filter((d) => d.status === F.dstatus);
    if (F.dclient !== "all") docs = docs.filter((d) => d.clientId === F.dclient);
    if (q) docs = docs.filter((d) => (d.name + (d.file ? d.file.name : "") + store.client(d.clientId).name).toLowerCase().includes(q));
    const chip = (k, l) => `<button type="button" class="chip" data-action="adv-filt" data-grp="dstatus" data-k="${k}" aria-pressed="${F.dstatus === k}">${esc(l)}</button>`;
    return `<div class="stack-lg"><div class="page-head"><div><h1>Documentos</h1><p class="muted">Todo lo aportado en ${esc(AFG.PERIODS[per])}, de todos los clientes.</p></div>${periodSelect()}</div>
      <div class="filters"><div class="field"><label for="dq">Buscar documento</label><input id="dq" type="search" value="${esc(F.q)}" data-change="adv-q" placeholder="Documento, archivo o cliente"></div>
        <div class="field"><label for="dc">Cliente</label><select id="dc" data-change="adv-dclient"><option value="all">Todos</option>${store.activeClients().map((c) => `<option value="${c.id}" ${F.dclient === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div></div>
      <div class="scrollx" role="group" aria-label="Filtrar por estado">${chip("all", "Todos")}${Object.entries(AFG.STATUS).map(([k, v]) => chip(k, v)).join("")}</div>
      <section class="card"><div class="table-wrap">${docs.length ? `<table class="stack-sm"><caption class="sr-only">Documentos del trimestre</caption><thead><tr><th scope="col">Documento</th><th scope="col">Cliente</th><th scope="col">Estado</th><th scope="col"><span class="sr-only">Acción</span></th></tr></thead><tbody>
        ${docs.map((d) => `<tr><td data-label="Documento"><span class="t">${esc(d.name)}</span><div class="small muted">${d.file ? esc(d.file.name) : "Sin archivo"}</div></td><td data-label="Cliente">${esc(store.client(d.clientId).name)}</td><td data-label="Estado">${badge(d.status)}</td><td data-label=""><button class="btn sm secondary" data-action="open-doc" data-id="${d.id}" data-side="advisor">${d.status === "recibido" || d.status === "revision" ? "Revisar" : "Ver"}</button></td></tr>`).join("")}</tbody></table>` : AFG.empty("doc", "Ningún documento con estos filtros", "Quita algún filtro o cambia de trimestre.", `<button class="btn sm secondary" data-action="adv-reset">Quitar filtros</button>`)}</div></section></div>`;
  }

  // ---------- Mensajes ----------
  function messages(sub) {
    if (sub[0]) {
      const t = store.state.threads.find((x) => x.id === sub[0]);
      if (!t) return { html: AFG.empty("chat", "Conversación no encontrada", "", `<a class="btn sm" href="${A}/mensajes">Volver</a>`), title: "Mensajes" };
      store.markRead(t.id, "advisor");
      return { html: AFG.threadHtml(t, "advisor"), title: t.subject };
    }
    const all = store.state.threads;
    const list = F.tmode === "mine" ? all.filter((t) => t.status === "esperando_asesor") : all;
    const chip = (k, l) => `<button type="button" class="chip" data-action="adv-filt" data-grp="tmode" data-k="${k}" aria-pressed="${F.tmode === k}">${l}</button>`;
    return { html: `<div class="stack-lg"><div class="page-head"><h1>Mensajes</h1></div><div class="scrollx" role="group" aria-label="Filtrar conversaciones">${chip("mine", "Pendientes de mi respuesta")}${chip("all", "Todas")}</div>
      ${list.length ? `<div class="rows">${list.map((t) => `<a class="rowi" style="text-decoration:none;color:inherit" href="${A}/mensajes/${t.id}"><div class="main"><div class="t">${esc(t.subject)} ${t.unread.advisor ? '<span class="badge nuevo">Nuevo</span>' : ""}</div><div class="s">${esc(store.client(t.clientId).name)} · ${esc(fmtTime(t.msgs[t.msgs.length - 1].at))}</div></div><div class="acts">${AFG.threadBadge(t, "advisor")}</div></a>`).join("")}</div>` : `<div class="card">${AFG.empty("check", "No tienes mensajes pendientes", "Cuando un cliente escriba, aparecerá aquí.")}</div>`}</div>`, title: "Mensajes" };
  }

  // ---------- Ajustes ----------
  function settings() {
    const s = store.state.settings, p = s.profile, acc = s.brand.accent;
    const f = (id, label, val, hint, ph) => `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text" value="${esc(val)}" placeholder="${esc(ph || "Pendiente de confirmar")}" ${hint ? `aria-describedby="${id}-h"` : ""}>${hint ? `<span class="hint" id="${id}-h">${esc(hint)}</span>` : ""}</div>`;
    return { html: `<div class="stack-lg"><div class="page-head"><div><h1>Ajustes del despacho</h1><p class="muted">Pensado para una sola persona: sin módulos de equipo.</p></div></div>
      <section class="card stack"><h2>Tu marca</h2>
        <p class="muted small">Colores provisionales: los de la agencia Dazenty hasta definir la identidad con el cliente. Cambia el color y verás toda la app con él.</p>
        <div class="swatches" role="group" aria-label="Color de acento">${SWATCHES.map(([c, n]) => `<button type="button" class="swatch" style="background:${c}" data-action="accent" data-c="${c}" aria-pressed="${acc === c}" aria-label="${esc(n)}" title="${esc(n)}"></button>`).join("")}</div>
        <div class="form-grid"><div class="field"><span class="lbl">Logo</span><span class="muted small">Pendiente: aún no hay logo. Se muestra el nombre en texto.</span></div><div class="field"><span class="lbl">Dominio</span><span class="muted small">Pendiente de decidir (por ejemplo, clientes.tudominio.es).</span></div></div></section>
      <form class="card stack" data-form="profile" novalidate><h2>Perfil del despacho</h2>
        <div class="notice">${ico("info")}<div>Datos legales sin confirmar: no se publican mientras estén incompletos.</div></div>
        <div class="form-grid">${f("trade", "Nombre comercial", p.trade, "Identificador provisional.")}${f("legal", "Denominación social", p.legal, "Asignada y comunicada por el despacho; sin comprobar su inscripción.")}${f("nif", "NIF", p.nif)}${f("phone", "Teléfono", p.phone)}${f("email", "Correo de contacto", p.email)}${f("address", "Domicilio", p.address)}${f("hours", "Horario de atención", p.hours, "", "Por definir")}</div>
        <div><button class="btn" type="submit">Guardar perfil</button></div></form>
      <section class="card stack"><h2>Plazos que ven tus clientes</h2>
        <p class="muted small">Los introduces tú. La demo no trae ningún calendario fiscal oficial.</p>
        ${s.deadlines.length ? `<ul class="list">${s.deadlines.map((k) => `<li><div class="main"><div class="t">${esc(k.label)}</div><div class="s">${esc(fmtDate(k.date))}</div></div><button class="btn sm danger" data-action="del-deadline" data-id="${k.id}">Quitar</button></li>`).join("")}</ul>` : AFG.empty("calendar", "Sin plazos", "")}
        <form class="form-grid" data-form="deadline" novalidate><div class="field"><label for="dl-l">Descripción</label><input id="dl-l" name="label" type="text" required maxlength="80"><span class="err">Escribe una descripción.</span></div><div class="field"><label for="dl-d">Fecha</label><input id="dl-d" name="date" type="date" required><span class="err">Elige una fecha.</span></div><div class="full"><button class="btn secondary" type="submit">Añadir plazo</button></div></form></section>
      <form class="card stack" data-form="adv-remind" novalidate><h2>Avisos por defecto</h2>
        <div class="notice">${ico("alert")}<div>Demostración: no se activa WhatsApp ni correo reales.</div></div>
        <fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:.4rem">Avisar al cliente antes del plazo</legend><div class="row">${[10, 5, 2].map((n) => `<label class="check"><input type="checkbox" name="d${n}" ${s.remind.days.includes(n) ? "checked" : ""}> ${n} días antes</label>`).join("")}</div></fieldset>
        <div class="check"><input type="checkbox" id="a-e" name="email" ${s.remind.email ? "checked" : ""}><label for="a-e">Correo electrónico</label></div>
        <div class="check"><input type="checkbox" id="a-w" name="whatsapp" ${s.remind.whatsapp ? "checked" : ""}><label for="a-w">WhatsApp (requeriría integración y consentimiento)</label></div>
        <div><button class="btn" type="submit">Guardar avisos</button></div></form></div>`, title: "Ajustes" };
  }

  function activity() {
    const items = store.state.activity.filter((a) => F.actClient === "all" || a.clientId === F.actClient);
    return { html: `<div class="stack-lg"><div class="page-head"><div><h1>Registro de actividad</h1><p class="muted">Trazabilidad de las acciones dentro de la demo. En producción sería un registro protegido y con fecha fiable.</p></div>
      <div class="field" style="min-width:14rem"><label for="ac">Cliente</label><select id="ac" data-change="adv-actclient"><option value="all">Todos</option>${store.state.clients.map((c) => `<option value="${c.id}" ${F.actClient === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div></div>
      <section class="card">${actList(items.slice(0, 60))}</section></div>`, title: "Actividad" };
  }

  function search(q) {
    const t = (q || "").trim().toLowerCase(), s = store.state;
    if (!t) return { html: `<div class="stack-lg"><div class="page-head"><h1>Búsqueda</h1></div>${AFG.empty("search", "Escribe algo para buscar", "Busca por cliente, documento o nombre de archivo.")}</div>`, title: "Búsqueda" };
    const cl = s.clients.filter((c) => (c.name + c.contact).toLowerCase().includes(t));
    const dc = s.docs.filter((d) => (d.name + (d.file ? d.file.name : "")).toLowerCase().includes(t));
    const th = s.threads.filter((x) => x.subject.toLowerCase().includes(t));
    return { html: `<div class="stack-lg"><div class="page-head"><div><h1>Resultados de «${esc(q)}»</h1><p class="muted">${cl.length + dc.length + th.length} resultados</p></div></div>
      <section class="card"><h2>Clientes (${cl.length})</h2>${cl.length ? `<ul class="list">${cl.map((c) => `<li><div class="main"><div class="t">${esc(c.name)}</div></div>${cstat(c)}<a class="btn sm secondary" href="${A}/clientes/${c.id}">Abrir ficha</a></li>`).join("")}</ul>` : '<p class="muted">Ninguno.</p>'}</section>
      <section class="card"><h2>Documentos (${dc.length})</h2>${dc.length ? `<ul class="list">${dc.map((d) => `<li><div class="main"><div class="t">${esc(d.name)}</div><div class="s">${esc(store.client(d.clientId).name)} · ${esc(AFG.PERIODS[d.period])}${d.file ? " · " + esc(d.file.name) : ""}</div></div>${badge(d.status)}<button class="btn sm secondary" data-action="open-doc" data-id="${d.id}" data-side="advisor">Abrir</button></li>`).join("")}</ul>` : '<p class="muted">Ninguno.</p>'}</section>
      <section class="card"><h2>Conversaciones (${th.length})</h2>${th.length ? `<ul class="list">${th.map((x) => `<li><div class="main"><div class="t">${esc(x.subject)}</div><div class="s">${esc(store.client(x.clientId).name)}</div></div><a class="btn sm secondary" href="${A}/mensajes/${x.id}">Abrir</a></li>`).join("")}</ul>` : '<p class="muted">Ninguna.</p>'}</section></div>`, title: "Búsqueda" };
  }

  AFG.views.asesor = function (sub, q) {
    const k = sub[0] || "";
    if (k === "") return { html: home(), title: "Panel" };
    if (k === "clientes") return sub[1] ? ficha(sub[1], sub[2] || "") : { html: clients(), title: "Clientes" };
    if (k === "documentos") return { html: documents(), title: "Documentos" };
    if (k === "mensajes") return messages(sub.slice(1));
    if (k === "facturacion") return { html: AFG.billingHtml("advisor"), title: "Servicio de facturación (simulación)" };
    if (k === "ajustes") return settings();
    if (k === "actividad") return activity();
    if (k === "buscar") return search(q.get("q"));
    return { html: AFG.empty("info", "Página no encontrada", "", `<a class="btn sm" href="${A}">Ir al panel</a>`) };
  };

  // ---------- Ejemplos de automatizaciones (simulados) ----------
  function prevReminders() {
    const per = store.state.period, s = store.state.settings, nd = s.deadlines[0];
    const rows = store.activeClients().filter((c) => c.status === "activo").map((c) => ({ c, n: store.pending(c.id, per).length })).filter((r) => r.n);
    AFG.dialog("Recordatorios por plazo (simulado)", `<div class="stack">
      <div class="sim-banner">SIMULACIÓN: no se envía ningún mensaje.</div>
      <p class="small muted">Se avisaría a quien tenga documentación pendiente ${s.remind.days.join(", ")} días antes de «${esc(nd ? nd.label : "plazo")}» ${nd ? "(" + esc(fmtDate(nd.date)) + ")" : ""}, por ${[s.remind.email && "correo", s.remind.whatsapp && "WhatsApp"].filter(Boolean).join(" y ") || "ningún canal activo"}.</p>
      ${rows.length ? `<ul class="list">${rows.map((r) => `<li><div class="main"><div class="t">${esc(r.c.name)}</div><div class="s">«Hola, ${esc(r.c.contact)}: te faltan ${r.n} documento${r.n > 1 ? "s" : ""} por aportar…»</div></div></li>`).join("")}</ul>` : AFG.empty("check", "Nadie tiene documentación pendiente", "")}
      <div class="dlg-foot"><button class="btn" data-close>Cerrar</button></div></div>`);
  }
  function prevNotify() {
    const a = store.state.activity.find((x) => x.actor === "cliente" && x.text.startsWith("Subió"));
    const c = a && store.client(a.clientId);
    AFG.dialog("Aviso al asesor (simulado)", `<div class="stack"><div class="sim-banner">SIMULACIÓN: no se envía ningún correo.</div>
      <div class="msg" style="max-width:none">${a ? `<span class="who">Asunto: Nueva documentación de ${esc(c.name)}</span>${esc(a.text)} · ${esc(fmtTime(a.at))}.` : "Cuando un cliente suba algo, el aviso saldría así."}</div>
      <div class="dlg-foot"><button class="btn" data-close>Cerrar</button></div></div>`);
  }
  function prevWeekly() {
    const per = store.state.period, s = store.state;
    const lines = store.activeClients().filter((c) => c.status === "activo").map((c) => { const d = delivery(c, per); return `<li><div class="main"><div class="t">${esc(c.name)}</div><div class="s">${d.pend ? "Faltan " + d.pend : "Sin faltas"} · ${d.nuevo + d.rev} por revisar</div></div></li>`; });
    AFG.dialog("Informe semanal (simulado)", `<div class="stack"><div class="sim-banner">SIMULACIÓN: se generaría cada lunes. No se envía.</div>
      <p class="small muted">Mensajes sin responder: ${s.threads.filter((t) => t.status === "esperando_asesor").length} · Próximo plazo: ${s.settings.deadlines[0] ? esc(s.settings.deadlines[0].label) : "—"}</p>
      <ul class="list">${lines.join("")}</ul><div class="dlg-foot"><button class="btn" data-close>Cerrar</button></div></div>`);
  }

  // ---------- Acciones ----------
  const inviteDlg = () => AFG.dialog("Invitar cliente", `<form class="stack" novalidate>
      <div class="notice">${ico("alert")}<div>Invitación simulada: no se envía ningún correo. Usa datos inventados.</div></div>
      <div class="field"><label for="iv-n">Nombre del cliente o empresa</label><input id="iv-n" name="name" type="text" required maxlength="80" placeholder="Cliente de ejemplo"><span class="err">Escribe un nombre.</span></div>
      <div class="form-grid"><div class="field"><label for="iv-c">Persona de contacto</label><input id="iv-c" name="contact" type="text" required maxlength="60"><span class="err">Escribe una persona de contacto.</span></div>
      <div class="field"><label for="iv-t">Tipo</label><select id="iv-t" name="type"><option>Autónomo</option><option>Sociedad</option><option>Particular</option></select></div></div>
      <div class="field"><label for="iv-e">Correo (ficticio)</label><input id="iv-e" name="email" type="email" required placeholder="persona@ejemplo.test"><span class="err">Escribe un correo con formato válido.</span></div>
      <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Crear invitación simulada</button></div></form>`, (dlg, close) => {
    dlg.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
      const c = store.invite(f.elements.name.value.trim(), f.elements.contact.value.trim(), f.elements.type.value, f.elements.email.value.trim());
      close(); toast("Cliente creado con invitación simulada."); location.hash = `${A}/clientes/${c.id}`;
    });
  });

  Object.assign(AFG.actions, {
    invite() { inviteDlg(); },
    "adv-filt"(el) { F[el.dataset.grp] = el.dataset.k; AFG.render(); },
    "adv-reset"() { F.dstatus = "all"; F.dclient = "all"; F.q = ""; AFG.render(); },
    "adv-q"(el) { F.q = el.value; AFG.render(); const i = document.querySelector('main input[type="search"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } },
    "adv-dclient"(el) { F.dclient = el.value; AFG.render(); },
    "adv-actclient"(el) { F.actClient = el.value; AFG.render(); },
    "auto-toggle"(el) { store.state.settings.auto[el.dataset.k] = el.checked; store.save(); AFG.render(); },
    "prev-reminders"() { prevReminders(); }, "prev-notify"() { prevNotify(); }, "prev-weekly"() { prevWeekly(); },
    archive(el) { store.archive(el.dataset.id, el.dataset.on === "1"); toast(el.dataset.on === "1" ? "Cliente archivado." : "Cliente reactivado."); AFG.render(); },
    "del-note"(el) { store.delNote(el.dataset.id); AFG.render(); },
    "del-deadline"(el) { store.delDeadline(el.dataset.id); AFG.render(); },
    accent(el) { store.state.settings.brand.accent = el.dataset.c; store.save(); AFG.render(); toast("Color cambiado en toda la demo."); },
    "adv-new-thread"(el) { AFG.newThreadDialog(el.dataset.id, "advisor", null); },
    "req-sign"(el) {
      const id = el.dataset.id;
      AFG.dialog("Pedir una firma", `<form class="stack" novalidate><div class="field"><label for="rs-t">¿Qué debe firmar?</label><select id="rs-t" name="title"><option>Hoja de encargo</option><option>Autorización de representación</option><option>Conformidad de la declaración</option></select></div>
        <div class="notice info">${ico("info")}<div>Firma de demostración sin validez legal.</div></div>
        <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Pedir firma</button></div></form>`, (dlg, close) => {
        dlg.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); store.requestSign(id, e.target.elements.title.value); close(); toast("Firma solicitada: el cliente la verá en «Firmas»."); AFG.render(); });
      });
    },
    request(el) {
      const id = el.dataset.id;
      AFG.dialog("Pedir información que falta", `<form class="stack" novalidate>
        <div class="form-grid"><div class="field"><label for="rq-c">Tipo</label><select id="rq-c" name="cat">${Object.entries(AFG.CATS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select></div>
        <div class="field"><label for="rq-p">Trimestre</label><select id="rq-p" name="period">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === store.state.period ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>
        <div class="field"><label for="rq-m">Mes</label><select id="rq-m" name="month">${AFG.MONTHS[store.state.period].map((m) => `<option>${m}</option>`).join("")}</select></div></div>
        <div class="field"><label for="rq-t">Mensaje para el cliente</label><textarea id="rq-t" name="text" required>Necesitamos que aportes este documento para poder cerrar el periodo.</textarea><span class="err">Escribe el mensaje.</span></div>
        <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Crear solicitud</button></div></form>`, (dlg, close) => {
        const f = dlg.querySelector("form");
        f.elements.period.addEventListener("change", () => { f.elements.month.innerHTML = AFG.MONTHS[f.elements.period.value].map((m) => `<option>${m}</option>`).join(""); });
        f.addEventListener("submit", (e) => {
          e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; }
          store.request(id, f.elements.cat.value, f.elements.period.value, f.elements.month.value, f.elements.text.value.trim());
          close(); toast("Solicitud creada: el cliente la verá como «Pendiente de aportar»."); AFG.render();
        });
      });
    },
  });

  Object.assign(AFG.forms, {
    publish(f) { if (!f.checkValidity()) { f.reportValidity(); return; }
      store.publish(f.dataset.id, f.elements.kind.value, f.elements.name.value.trim(), f.elements.period.value, f.elements.text.value.trim());
      toast("Documento publicado. El cliente lo verá en su sección."); AFG.render(); },
    note(f) { if (!f.checkValidity()) { f.reportValidity(); return; } store.addNote(f.dataset.id, f.elements.text.value.trim()); toast("Nota interna guardada."); AFG.render(); },
    deadline(f) { if (!f.checkValidity()) { f.reportValidity(); return; } store.addDeadline(f.elements.label.value.trim(), f.elements.date.value); toast("Plazo añadido."); AFG.render(); },
    profile(f) {
      const p = store.state.settings.profile;
      ["trade", "legal", "nif", "phone", "email", "address", "hours"].forEach((k) => (p[k] = f.elements[k].value.trim()));
      store.save(); toast("Perfil guardado en la demo."); AFG.render();
    },
    "adv-remind"(f) {
      const s = store.state.settings;
      s.remind = { days: [10, 5, 2].filter((n) => f.elements["d" + n].checked), email: f.elements.email.checked, whatsapp: f.elements.whatsapp.checked };
      store.save(); toast("Avisos guardados (simulados)."); AFG.render();
    },
  });
})();
