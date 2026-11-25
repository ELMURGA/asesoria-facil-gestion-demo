/* Piezas compartidas entre cliente y asesor: detalle de documento, subida, hilos, avisos. */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store, toast, badge, fmtDate, fmtTime, fmtSize } = AFG;

  AFG.threadBadge = (t, side) => {
    if (t.status === "resuelta") return `<span class="badge revisado">${ico("check")}Resuelta</span>`;
    const mine = (side === "client" && t.status === "esperando_cliente") || (side === "advisor" && t.status === "esperando_asesor");
    if (mine) return `<span class="badge pendiente">${ico("clock")}${side === "client" ? "Te toca responder" : "Pendiente de tu respuesta"}</span>`;
    return `<span class="badge recibido">${ico("chat")}${side === "client" ? "Esperando al despacho" : "Esperando al cliente"}</span>`;
  };

  AFG.remindOf = (clientId) => {
    const s = store.state.settings;
    s.remindBy = s.remindBy || {};
    return s.remindBy[clientId] || { days: s.remind.days.slice(), email: s.remind.email, whatsapp: s.remind.whatsapp };
  };

  const fileIcon = (k) => (k === "img" ? "eye" : k === "xlsx" ? "list" : "doc");

  // ---- Detalle de documento (diálogo) ----
  AFG.openDoc = function (id, side) {
    const d = store.doc(id);
    if (!d) return;
    const c = store.client(d.clientId);
    const hist = store.state.activity.filter((a) => a.clientId === d.clientId && a.text.includes(d.name)).slice(0, 6);
    const th = store.state.threads.filter((t) => t.docId === d.id);
    const body = `
      <div class="stack">
        <div class="row">${badge(d.status)} <span class="muted">${esc(AFG.CATS[d.cat])} · ${esc(AFG.PERIODS[d.period])}</span></div>
        ${side === "advisor" ? `<p class="small muted">Cliente: <a href="#/asesor/clientes/${c.id}" data-close>${esc(c.name)}</a></p>` : ""}
        ${d.file
          ? `<div class="card flat" style="background:var(--card2)"><div class="row">${ico(fileIcon(d.file.kind))}<div class="grow"><div style="font-weight:600;overflow-wrap:anywhere">${esc(d.file.name)}</div><div class="small muted">${fmtSize(d.file.kb)} · subido ${esc(fmtTime(d.at))}</div></div></div>
             <p class="small muted" style="margin-top:.6rem">Vista previa no disponible en la demo: solo se guardan el nombre y el tamaño del archivo, nunca su contenido.</p></div>`
          : `<div class="notice">${ico("clock")}<div>Todavía no se ha aportado ningún archivo para este documento.</div></div>`}
        ${d.note ? `<div class="notice ${d.status === "revision" ? "err" : "info"}">${ico(d.status === "revision" ? "alert" : "info")}<div><strong>${d.status === "revision" ? "Mensaje del despacho" : "Nota"}</strong><br>${esc(d.note)}</div></div>` : ""}
        ${th.length ? `<div><h4>Consultas sobre este documento</h4><ul class="list">${th.map((t) => `<li><div class="main"><div class="t">${esc(t.subject)}</div></div>${AFG.threadBadge(t, side)}<a class="btn sm secondary" data-close href="#/${side === "advisor" ? "asesor" : "cliente"}/mensajes/${t.id}">Abrir</a></li>`).join("")}</ul></div>` : ""}
        ${hist.length ? `<div><h4>Historial</h4><ul class="list">${hist.map((a) => `<li><div class="main"><div class="s">${esc(fmtDate(a.at))} · ${esc(a.actor)}</div><div>${esc(a.text)}</div></div></li>`).join("")}</ul></div>` : ""}
      </div>
      <div class="dlg-foot" id="doc-actions"></div>`;
    AFG.dialog(d.name, body, (dlg, close) => {
      const foot = dlg.querySelector("#doc-actions");
      const btn = (label, action, cls) => `<button type="button" class="btn sm ${cls || ""}" data-doc-act="${action}">${label}</button>`;
      if (side === "client") {
        foot.innerHTML = (d.status === "pendiente" ? btn("Aportar archivo", "upload") : d.status === "revision" ? btn("Sustituir archivo", "upload") : "") + btn("Preguntar al despacho sobre este documento", "ask", "secondary");
      } else {
        foot.innerHTML = btn("Pedir aclaración", "clarify", "secondary") + (d.file && d.status !== "revisado" ? btn("Marcar como revisado", "ok") : "");
      }
      dlg.addEventListener("click", (e) => {
        const b = e.target.closest("[data-doc-act]"); if (!b) return;
        const act = b.dataset.docAct; close();
        if (act === "upload") AFG.uploadDialog(d.clientId, d.id);
        if (act === "ask") AFG.newThreadDialog(d.clientId, "client", d.id);
        if (act === "clarify") AFG.clarifyDialog(d.id);
        if (act === "ok") { store.setStatus(d.id, "revisado"); toast("Marcado como revisado."); AFG.render(); }
      });
    });
  };

  // ---- Subida (diálogo; en móvil se ve como hoja inferior) ----
  AFG.uploadDialog = function (clientId, docId, firstFile) {
    const d = docId ? store.doc(docId) : null;
    const per = d ? d.period : store.state.period;
    const monthsOf = (p) => AFG.MONTHS[p].map((m) => `<option value="${m}">${m}</option>`).join("");
    const body = `<form class="stack" novalidate>
      ${d ? `<p class="muted">${esc(d.name)}</p>` : `<div class="form-grid">
        <div class="field"><label for="up-cat">Tipo de documento</label><select id="up-cat" name="cat">${Object.entries(AFG.CATS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select></div>
        <div class="field"><label for="up-per">Trimestre</label><select id="up-per" name="period">${Object.entries(AFG.PERIODS).map(([k, v]) => `<option value="${k}" ${k === per ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>
        <div class="field"><label for="up-mon">Mes</label><select id="up-mon" name="month">${monthsOf(per)}</select></div></div>`}
      <div class="field"><span class="lbl" id="up-lbl">Archivo</span>
        <div id="up-chosen" class="rowi" hidden></div>
        <input id="up-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,image/*" aria-labelledby="up-lbl" aria-describedby="up-hint">
        <span class="hint" id="up-hint">PDF, foto (JPG/PNG), Excel o CSV. Máximo 10 MB. En la demo no se guarda el contenido, solo el nombre y el tamaño.</span></div>
      <div class="field"><label for="up-sample">…o usa un documento ficticio</label><select id="up-sample" name="sample"><option value="">— ninguno —</option>${AFG.SAMPLES.map((x, i) => `<option value="${i}">${esc(x.name)}</option>`).join("")}</select></div>
      ${d ? "" : `<div class="field"><label for="up-com">Comentario (opcional)</label><input id="up-com" name="comment" type="text" maxlength="200"></div>`}
      <div id="up-msg" aria-live="polite"></div>
      <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button type="submit" class="btn">${d && d.status === "revision" ? "Sustituir archivo" : "Subir documento"}</button></div>
    </form>`;
    AFG.dialog(d ? (d.status === "revision" ? "Sustituir archivo" : "Aportar archivo") : "Subir documento", body, (dlg, close) => {
      const form = dlg.querySelector("form"), msg = dlg.querySelector("#up-msg"), input = dlg.querySelector("#up-file"), chosenBox = dlg.querySelector("#up-chosen");
      let chosen = null;
      const show = () => { chosenBox.hidden = !chosen; if (chosen) chosenBox.innerHTML = `<div class="main"><div class="t">${esc(chosen.name)}</div><div class="s">${fmtSize(chosen.kb)}</div></div>${ico("check")}`; };
      const take = (f) => { const r = AFG.checkFile(f); if (r.error) { chosen = null; msg.innerHTML = AFG.err(r.error); } else { chosen = r.file; msg.innerHTML = ""; form.elements.sample.value = ""; } show(); };
      if (firstFile) take(firstFile);
      input.addEventListener("change", () => { if (input.files[0]) take(input.files[0]); });
      form.elements.sample.addEventListener("change", () => { if (form.elements.sample.value !== "") { chosen = null; show(); input.value = ""; msg.innerHTML = ""; } });
      if (form.elements.period) form.elements.period.addEventListener("change", () => { form.elements.month.innerHTML = monthsOf(form.elements.period.value); });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let file = chosen; const sIdx = form.elements.sample.value;
        if (!file && sIdx !== "") file = AFG.SAMPLES[+sIdx];
        if (!file) { if (!msg.querySelector(".err")) msg.innerHTML = AFG.err("Elige un archivo o un documento ficticio antes de subir."); return; }
        form.querySelector('button[type="submit"]').disabled = true;
        msg.innerHTML = AFG.loading("Subiendo…");
        setTimeout(() => {
          if (d) store.attach(d.id, file, "cliente");
          else store.addDoc(clientId, form.elements.cat.value, form.elements.period.value, form.elements.month.value, file, form.elements.comment.value.trim(), "cliente");
          close(); toast(`«${file.name}» recibido. Estado: Recibido. Se avisaría al asesor (simulado).`); AFG.render();
        }, 650);
      });
    });
  };

  // ---- Nueva consulta ----
  AFG.newThreadDialog = function (clientId, from, docId) {
    const docs = store.docsOf(clientId);
    const body = `<form class="stack" novalidate>
      <div class="field"><label for="nt-s">Asunto</label><input id="nt-s" name="subject" type="text" required maxlength="90" value="${docId ? esc("Duda sobre «" + store.doc(docId).name + "»") : ""}"><span class="err">Escribe un asunto.</span></div>
      <div class="field"><label for="nt-d">Vincular a un documento (opcional)</label><select id="nt-d" name="doc"><option value="">— ninguno —</option>${docs.map((x) => `<option value="${x.id}" ${x.id === docId ? "selected" : ""}>${esc(x.name)}${x.file ? " · " + esc(x.file.name) : ""}</option>`).join("")}</select></div>
      <div class="field"><label for="nt-m">Mensaje</label><textarea id="nt-m" name="text" required></textarea><span class="err">Escribe tu mensaje.</span></div>
      <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Enviar a ${from === "client" ? "tu asesor" : "el cliente"} (demo)</button></div></form>`;
    AFG.dialog("Nueva consulta", body, (dlg, close) => {
      dlg.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault(); const f = e.target;
        if (!f.checkValidity()) { f.reportValidity(); return; }
        const t = store.say(clientId, f.elements.subject.value.trim(), f.elements.doc.value || null, from, f.elements.text.value.trim());
        close(); toast("Consulta registrada en la demo (no se ha enviado nada)."); location.hash = `#/${from === "client" ? "cliente" : "asesor"}/mensajes/${t.id}`;
      });
    });
  };

  // ---- Pedir aclaración sobre un documento (asesor) ----
  AFG.clarifyDialog = function (docId) {
    const d = store.doc(docId);
    const body = `<form class="stack" novalidate>
      <p class="muted">${esc(d.name)}</p>
      <div class="field"><label for="cl-m">¿Qué necesitas que aclare o corrija?</label><textarea id="cl-m" name="text" required>${esc(d.note || "")}</textarea><span class="err">Explica qué hace falta.</span></div>
      <div class="notice info">${ico("info")}<div>El documento pasará a «Requiere revisión» y se abrirá una consulta visible para el cliente.</div></div>
      <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Pedir aclaración</button></div></form>`;
    AFG.dialog("Pedir aclaración", body, (dlg, close) => {
      dlg.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault(); const f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
        const text = f.elements.text.value.trim();
        store.setStatus(d.id, "revision", text);
        store.say(d.clientId, "Aclaración sobre " + d.name, d.id, "advisor", text);
        close(); toast("Aclaración registrada. El cliente la verá en su área."); AFG.render();
      });
    });
  };

  // ---- Hilo (compartido) ----
  AFG.threadHtml = function (t, side) {
    const c = store.client(t.clientId);
    const doc = t.docId ? store.doc(t.docId) : null;
    const meSide = side === "client" ? "client" : "advisor";
    return `<div class="stack-lg">
      <div class="page-head"><div><a href="#/${side === "client" ? "cliente" : "asesor"}/mensajes" class="small">← Todas las conversaciones</a><h1 style="margin-top:.4rem">${esc(t.subject)}</h1>
        <p class="muted" style="margin-top:.4rem">${side === "advisor" ? esc(c.name) + " · " : ""}${AFG.threadBadge(t, side)}</p></div>
        ${side === "advisor" && t.status !== "resuelta" ? `<button type="button" class="btn secondary" data-action="resolve-thread" data-id="${t.id}">Marcar como resuelta</button>` : ""}</div>
      ${doc ? `<div class="linked">${ico("doc")}<span>Vinculada a <button type="button" class="btn ghost sm" data-action="open-doc" data-id="${doc.id}" data-side="${side}">${esc(doc.name)}</button></span></div>` : ""}
      <div class="thread" aria-label="Mensajes">${t.msgs.map((m) => `<div class="msg ${m.from === meSide ? "me" : ""}"><span class="who">${m.from === "client" ? esc(side === "advisor" ? c.contact : "Tú") : (side === "advisor" ? "Tú (asesor)" : "Tu asesor")}</span>${esc(m.text)}<span class="when">${esc(fmtTime(m.at))}</span></div>`).join("")}</div>
      ${t.status === "resuelta" ? `<div class="notice ok">${ico("check")}<div>Conversación resuelta.</div></div>` : ""}
      <form class="stack card" data-form="reply" data-id="${t.id}" data-side="${side}" novalidate>
        <div class="field"><label for="rp">Responder</label><textarea id="rp" name="text" required></textarea><span class="err">Escribe una respuesta.</span></div>
        <div><button class="btn" type="submit">Enviar respuesta (demo)</button></div></form>
    </div>`;
  };

  Object.assign(AFG.actions, {
    "open-doc"(el) { AFG.openDoc(el.dataset.id, el.dataset.side); },
    "resolve-thread"(el) { store.resolve(el.dataset.id); toast("Conversación resuelta."); AFG.render(); },
    "dl-pub"(el) {
      const p = store.state.published.find((x) => x.id === el.dataset.id);
      AFG.download(AFG.slug(p.name) + ".txt", `${p.name}\n${"=".repeat(Math.min(60, p.name.length))}\n\n${p.text}\n\nEste archivo es una pieza ficticia generada por la demo de Asesoría Fácil Gestión.\nNo es un modelo fiscal ni un documento oficial.\n`);
      store.seenPub(p.id); toast("Descarga de ejemplo generada."); AFG.render();
    },
  });
  AFG.forms.reply = function (f) {
    if (!f.checkValidity()) { f.reportValidity(); return; }
    store.reply(f.dataset.id, f.dataset.side === "client" ? "client" : "advisor", f.elements.text.value.trim());
    toast("Respuesta registrada en la demo."); AFG.render();
  };
})();
