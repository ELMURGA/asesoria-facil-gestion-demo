/* Utilidades de interfaz: escape, iconos, insignias, diálogos y avisos. */
(function () {
  const AFG = (window.AFG = window.AFG || {});

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const P = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.3-5.5 7-5.5s6.2 2 7 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c2 .6 3.5 2.3 4 5.2"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    alert: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    archive: '<path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.5M3 12h.5M3 18h.5"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    refresh: '<path d="M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    minus: '<path d="M6 12h12"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  };
  const ico = (n, cls) => `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

  const SI = { pendiente: "clock", recibido: "download", revision: "alert", revisado: "check" };
  const badge = (st) => `<span class="badge ${st}">${ico(SI[st] || "info")}${esc(AFG.STATUS[st] || st)}</span>`;
  const sample = () => "";

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };
  const fmtTime = (iso) => {
    const d = new Date(iso); const diff = (Date.now() - d.getTime()) / 3600000;
    if (diff < 1) return "hace unos minutos";
    if (diff < 24) return `hace ${Math.round(diff)} h`;
    if (diff < 48) return "ayer";
    return fmtDate(iso);
  };
  const daysTo = (d) => Math.round((new Date(d + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400000);
  const fmtSize = (kb) => (kb >= 1024 ? (kb / 1024).toFixed(1).replace(".", ",") + " MB" : kb + " KB");

  function toast(msg) {
    let box = document.querySelector(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite"); document.body.append(box); }
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; box.append(t);
    setTimeout(() => t.remove(), 4200);
  }

  let dlgN = 0;
  // Diálogo modal nativo: Esc, clic fuera, foco gestionado por <dialog>.
  function dialog(title, bodyHtml, onMount) {
    const dlg = document.createElement("dialog");
    const tid = "dlg-title-" + ++dlgN;
    dlg.setAttribute("aria-labelledby", tid);
    dlg.innerHTML = `<div class="dlg"><div class="dlg-head"><h3 id="${tid}">${esc(title)}</h3><button type="button" class="btn ghost sm" data-close aria-label="Cerrar">${ico("x")}</button></div>${bodyHtml}</div>`;
    document.body.append(dlg);
    AFG.enhanceSelects(dlg);
    const close = () => { if (dlg.open) dlg.close(); };
    dlg.addEventListener("close", () => dlg.remove());
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) close(); });
    dlg.showModal();
    if (onMount) onMount(dlg, close);
    return { dlg, close };
  }


  // ---- Selector propio (sustituye al desplegable nativo del sistema) ----
  // El <select> nativo se mantiene oculto como fuente de datos y para los formularios; el usuario ve un botón
  // y una hoja con opciones grandes que sigue el diseño de la app. Funciona igual en móvil, tableta y ordenador.
  let selN = 0;
  const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  AFG.enhanceSelects = function (scope) {
    (scope || document).querySelectorAll("select:not([data-enhanced])").forEach((sel) => {
      sel.dataset.enhanced = "1";
      if (!sel.id) sel.id = "sel-" + ++selN;
      const label = document.querySelector(`label[for="${sel.id}"]`) || (sel.closest("label") || null);
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = sel.hasAttribute("data-title") ? "title-pick" : "pick"; btn.id = sel.id + "-btn";
      btn.setAttribute("aria-haspopup", "dialog");
      if (label) { if (!label.id) label.id = sel.id + "-lbl"; label.setAttribute("for", btn.id); btn.setAttribute("aria-labelledby", label.id + " " + btn.id); }
      else btn.setAttribute("aria-label", sel.getAttribute("aria-label") || "Elegir");
      const paint = () => { const o = sel.options[sel.selectedIndex]; btn.innerHTML = `<span class="pv">${esc(o ? o.text : "—")}</span>${ico("chev")}`; btn.disabled = sel.disabled; };
      Object.defineProperty(sel, "value", { get() { return valueDesc.get.call(this); }, set(v) { valueDesc.set.call(this, v); paint(); }, configurable: true });
      new MutationObserver(paint).observe(sel, { childList: true, subtree: true });
      sel.addEventListener("change", paint);
      sel.classList.add("native-hidden"); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
      sel.insertAdjacentElement("afterend", btn);
      paint();
      btn.addEventListener("click", () => {
        const title = label ? label.textContent.trim() : sel.getAttribute("aria-label") || "Elegir";
        const opts = [...sel.options].filter((o) => !o.disabled);
        const body = `<div class="opts" role="radiogroup" aria-label="${esc(title)}">${opts.map((o) => `<button type="button" class="opt" role="radio" aria-checked="${o.value === sel.value}" data-v="${esc(o.value)}"><span><span class="ot">${esc(o.text)}</span>${o.dataset.sub ? `<span class="os">${esc(o.dataset.sub)}</span>` : ""}</span>${o.value === sel.value ? ico("check") : ""}</button>`).join("")}</div>`;
        const { dlg, close } = AFG.dialog(title, body);
        dlg.classList.add("pick-sheet");
        const cur = dlg.querySelector('.opt[aria-checked="true"]') || dlg.querySelector(".opt");
        if (cur) cur.focus({ preventScroll: false });
        dlg.addEventListener("click", (e) => {
          const b = e.target.closest(".opt"); if (!b) return;
          sel.value = b.dataset.v; sel.dispatchEvent(new Event("change", { bubbles: true })); close();
        });
        dlg.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          const all = [...dlg.querySelectorAll(".opt")], i = all.indexOf(document.activeElement);
          const n = all[(i + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]; if (n) { e.preventDefault(); n.focus(); }
        });
      });
    });
  };


  // ---- Iniciales de personas y rejilla del trimestre ----
  const avatar = (name, size) => {
    const w = String(name).replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, " ").split(/\s+/).filter(Boolean);
    const ini = ((w[0] || "?")[0] + ((w[1] || "")[0] || "")).toUpperCase();
    let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `<span class="av" style="background:hsl(${h} 38% 80%);${size ? `width:${size}px;height:${size}px;` : ""}" aria-hidden="true">${esc(ini)}</span>`;
  };
  const QCATS = ["emitidas", "gastos", "bancos"];
  const QCAT_SHORT = { emitidas: "Emitidas", gastos: "Gastos", bancos: "Bancos" };
  const QLAB = { pendiente: "Falta", recibido: "Recibido", revision: "Revisar", revisado: "Revisado", none: "—" };
  const QICO = { pendiente: "clock", recibido: "download", revision: "alert", revisado: "check", none: "minus" };
  const cellOf = (clientId, per, cat, month) => AFG.store.state.docs.find((d) => d.clientId === clientId && d.period === per && d.cat === cat && d.month === month) || null;
  // Rejilla completa y pulsable (cliente)
  const qgrid = (clientId, per) => {
    const months = AFG.MONTHS[per];
    let h = `<div class="qgrid" role="group" aria-label="Estado de tus documentos por mes y tipo"><span></span>${months.map((m) => `<span class="h">${m}</span>`).join("")}`;
    QCATS.forEach((c) => {
      h += `<span class="rl">${QCAT_SHORT[c]}</span>`;
      months.forEach((m) => {
        const d = cellOf(clientId, per, c, m); const st = d ? d.status : "none";
        if (!d) h += `<span class="qc none" role="img" aria-label="${QCAT_SHORT[c]} de ${m}: todavía no se pide">${ico("minus")}</span>`;
        else h += `<button type="button" class="qc ${st}" data-action="${st === "pendiente" ? "upload-for" : "open-doc"}" data-id="${d.id}" data-side="client" aria-label="${QCAT_SHORT[c]} de ${m}: ${esc(AFG.STATUS[st])}">${ico(QICO[st])}<span>${QLAB[st]}</span></button>`;
      });
    });
    return h + `</div><div class="legend" aria-hidden="true"><span>Falta: pendiente de aportar</span><span>Revisar: el despacho te pide algo</span><span>— todavía no se pide</span></div>`;
  };
  // Mini 3x3 (panel del asesor)
  const mini9 = (clientId, per) => {
    const months = AFG.MONTHS[per]; let got = 0, tot = 0, cells = "";
    QCATS.forEach((c) => months.forEach((m) => { const d = cellOf(clientId, per, c, m); const st = d ? d.status : "none"; if (d) { tot++; if (d.file) got++; } cells += `<i class="${st}"></i>`; }));
    return `<span class="mini9" role="img" aria-label="${got} de ${tot} documentos entregados">${cells}</span>`;
  };

  const empty = (icon, title, text, action) =>
    `<div class="empty">${ico(icon)}<p><strong>${esc(title)}</strong></p>${text ? `<p>${esc(text)}</p>` : ""}${action || ""}</div>`;
  const loading = (t) => `<div class="loading" role="status"><div class="spinner"></div>${esc(t || "Cargando…")}</div>`;
  const err = (t) => `<div class="notice err" role="alert">${ico("alert")}<div>${esc(t)}</div></div>`;

  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Valida un archivo elegido (solo metadatos; el contenido NO se guarda).
  const OK_EXT = ["pdf", "jpg", "jpeg", "png", "xlsx", "xls", "csv"];
  function checkFile(f) {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!OK_EXT.includes(ext)) return { error: `«${f.name}» no se puede subir: formatos admitidos PDF, JPG, PNG, Excel (XLSX/XLS) o CSV.` };
    if (f.size > 10 * 1024 * 1024) return { error: `«${f.name}» pesa más de 10 MB. Prueba a comprimirlo o a dividirlo.` };
    if (f.size === 0) return { error: `«${f.name}» está vacío.` };
    const kind = ["jpg", "jpeg", "png"].includes(ext) ? "img" : ["xlsx", "xls", "csv"].includes(ext) ? "xlsx" : "pdf";
    return { file: { name: f.name, kind, kb: Math.max(1, Math.round(f.size / 1024)) } };
  }
  const SAMPLES = [
    { name: "factura-ejemplo-ficticia.pdf", kind: "pdf", kb: 96 },
    { name: "ticket-ejemplo-ficticio.jpg", kind: "img", kb: 420 },
    { name: "listado-gastos-ejemplo.xlsx", kind: "xlsx", kb: 58 },
  ];

  Object.assign(AFG, { avatar, qgrid, mini9, cellOf, daysTo, esc, ico, badge, sample, fmtDate, fmtTime, fmtSize, toast, dialog, empty, loading, err, download, slug, checkFile, SAMPLES });
})();
