/* Shell de la app, router por hash y delegación de eventos. */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store, toast } = AFG;
  AFG.views = {};
  AFG.actions = {};
  AFG.forms = {};
  const root = () => document.getElementById("root");

  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, qs] = raw.split("?");
    return { parts: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
  }
  AFG.go = (h) => { if (location.hash === h) render(); else location.hash = h; };

  function counts() {
    const s = store.state;
    return {
      advisorMsgs: s.threads.filter((t) => t.status === "esperando_asesor").length,
      clientMsgs: s.threads.filter((t) => t.clientId === s.clientId && t.unread.client).length,
      clientSigns: s.signs.filter((x) => x.clientId === s.clientId && x.status === "pendiente").length,
    };
  }

  // Acento de marca (provisional = coral de Dazenty). Texto sobre el acento: oscuro o blanco según luminancia.
  function applyBrand() {
    const acc = (store.state.settings.brand || {}).accent || "#d97762";
    const h = acc.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const st = document.documentElement.style;
    st.setProperty("--acc", acc);
    st.setProperty("--acc2", `color-mix(in srgb, ${acc} 72%, #fff)`);
    st.setProperty("--acc-ink", L > 0.28 ? "#120a07" : "#ffffff");
  }

  function demobar() {
    const s = store.state;
    const clients = store.activeClients();
    const open = AFG._demoOpen === undefined ? window.innerWidth >= 1100 : AFG._demoOpen;
    return `<details class="demobar" ${open ? "open" : ""} id="demobar"><summary><span class="tag">DEMO</span><span class="ds">Datos ficticios · no se envía nada</span><span class="chev" aria-hidden="true">Controles ▾</span></summary>
      <div class="panel">
        <span class="seg" role="group" aria-label="Cambiar de rol en la demo">
          <button type="button" data-action="role" data-role="visitor" aria-pressed="${s.role === "visitor"}">Entrada</button>
          <button type="button" data-action="role" data-role="client" aria-pressed="${s.role === "client"}">Cliente</button>
          <button type="button" data-action="role" data-role="advisor" aria-pressed="${s.role === "advisor"}">Asesor</button>
        </span>
        ${s.role === "client" ? `<label>Cliente de ejemplo <select id="demo-client" data-change="pick-client" aria-label="Cliente de ejemplo">${clients.map((c) => `<option value="${c.id}" data-sub="${esc(c.type)}" ${c.id === s.clientId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>` : ""}
        <button type="button" data-action="reset">Reiniciar datos de la demo</button>
        <span class="note">Los cambios se guardan solo en este navegador. Sin contraseñas, sin envíos reales.</span>
      </div></details>`;
  }

  const CNAV = [
    ["", "Inicio", "home"], ["subir", "Subir facturas", "upload"], ["impuestos", "Mis impuestos", "receipt"], ["documentos", "Documentos", "folder"],
    ["nominas", "Nóminas", "users"], ["mensajes", "Mensajes", "chat", "clientMsgs"], ["plazos", "Plazos y avisos", "calendar"],
    ["firmas", "Firmas", "pen", "clientSigns"], ["facturacion", "Facturación", "list"],
  ];
  const ANAV = [
    ["", "Panel", "home"], ["clientes", "Clientes", "users"], ["documentos", "Documentos", "doc"], ["mensajes", "Mensajes", "chat", "advisorMsgs"],
    ["facturacion", "Facturación", "list"], ["ajustes", "Ajustes", "settings"], ["actividad", "Actividad", "clock"],
  ];
  const TAB_CLIENT = ["", "subir", "impuestos", "mensajes"];
  const TAB_ADV = ["", "clientes", "documentos", "mensajes"];

  function appShell(role, sub, inner, title) {
    const c = counts();
    const base = role === "advisor" ? "#/asesor" : "#/cliente";
    const nav = role === "advisor" ? ANAV : CNAV;
    const cur = sub[0] || "";
    const link = ([k, label, icon, cnt], extra) => {
      const n = cnt ? c[cnt] : 0;
      return `<a href="${base}${k ? "/" + k : ""}" ${cur === k ? 'aria-current="page"' : ""} ${extra || ""}>${ico(icon)}<span>${label}</span>${n ? `<span class="count" aria-label="${n} pendientes">${n}</span>` : ""}</a>`;
    };
    const tabKeys = role === "advisor" ? TAB_ADV : TAB_CLIENT;
    const SHORT = { subir: "Subir", impuestos: "Impuestos", documentos: "Documentos", clientes: "Clientes" };
    const tabs = tabKeys.map((k) => nav.find((n) => n[0] === k)).map((n) => link([n[0], SHORT[n[0]] || n[1], n[2], n[3]], n[0] === "subir" ? 'class="main-act"' : ""));
    const moreItems = nav.filter((n) => !tabKeys.includes(n[0]));
    const me = store.me();
    const name = role === "advisor" ? "Asesor/a del despacho" : me.name;
    const sub2 = role === "advisor" ? "Panel del despacho" : me.type + " · acceso simulado";
    const search = role === "advisor" ? `<form role="search" data-form="search" class="gs"><label for="gs" class="sr-only">Buscar cliente o documento</label><input id="gs" name="q" type="search" placeholder="Buscar…"></form>` : "";
    return `<div class="shell">
      <aside class="rail"><div class="wordmark">Asesoría Fácil<small>Gestión, SL</small></div>${search}
        <nav aria-label="Secciones">${nav.map((n) => link(n)).join("")}</nav>
        <div class="who">${AFG.avatar(name, 34)}<div class="nm"><b>${esc(name)}</b><span>${esc(sub2)}</span></div><button type="button" data-action="role" data-role="visitor">Salir</button></div></aside>
      <div class="col">
        <header class="appbar"><span class="mini-brand">Asesoría Fácil</span><span class="sp"></span>
          <button type="button" class="acct" data-action="account" aria-label="Cuenta: ${esc(name)}" data-name="${esc(name)}" data-sub="${esc(sub2)}">${AFG.avatar(name, 34)}</button></header>
        <main id="main" class="view" tabindex="-1">${inner}</main>
      </div></div>
      <nav class="tabbar" aria-label="Secciones">${tabs.join("")}<button type="button" data-action="more" data-items='${esc(JSON.stringify(moreItems.map((n) => [n[0], n[1], n[2], n[3] ? c[n[3]] : 0])))}' data-base="${base}">${ico("grid")}<span>Más</span></button></nav>`;
  }

  function render() {
    applyBrand();
    const r = route();
    const s = store.state;
    const top = r.parts[0] || "";
    let html = "", afterMount = null, title = "Asesoría Fácil Gestión · demo";
    const want = top === "cliente" ? "client" : top === "asesor" ? "advisor" : null;

    if (want && s.role === want) {
      const out = AFG.views[top](r.parts.slice(1), r.q);
      html = appShell(want, r.parts.slice(1), out.html, out.title);
      afterMount = out.mount;
      if (out.title) title = out.title + " · Asesoría Fácil Gestión";
    } else {
      if (want && s.role !== want) AFG._entryMsg = `Para entrar en ${want === "client" ? "el área de cliente" : "el panel del asesor"}, elige cómo acceder.`;
      const out = AFG.views.entry();
      html = out.html; afterMount = out.mount;
    }
    document.title = title;
    root().innerHTML = demobar() + html;
    const main = document.getElementById("main");
    if (AFG._lastHash !== location.hash) {
      AFG._lastHash = location.hash;
      window.scrollTo(0, 0);
      if (main) main.focus({ preventScroll: true });
    }
    AFG.enhanceSelects(document);
    if (afterMount) afterMount(document);
  }
  AFG.render = render;
  AFG.emit = render;

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const fn = AFG.actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("form[data-form]");
    if (!f) return;
    e.preventDefault();
    const fn = AFG.forms[f.dataset.form];
    if (fn) fn(f, e);
  });
  document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-change]");
    if (!el) return;
    const fn = AFG.actions[el.dataset.change];
    if (fn) fn(el, e);
  });
  document.addEventListener("toggle", (e) => { if (e.target.id === "demobar") AFG._demoOpen = e.target.open; }, true);
  window.addEventListener("hashchange", render);

  Object.assign(AFG.actions, {
    role(el) {
      const r = el.dataset.role;
      store.setRole(r);
      const target = r === "client" ? "#/cliente" : r === "advisor" ? "#/asesor" : "#/";
      if (location.hash === target) render(); else location.hash = target;
    },
    "pick-client"(el) { store.setClient(el.value); render(); },
    reset() {
      if (!confirm("¿Reiniciar la demo? Se borrarán los cambios y volverán los datos de ejemplo.")) return;
      store.reset(); render(); toast("Datos de demostración restaurados.");
    },
    period(el) { store.setPeriod(el.value); render(); },
    account(el) {
      AFG.dialog("Cuenta", `<div class="row" style="gap:14px">${AFG.avatar(el.dataset.name, 44)}<div><b>${esc(el.dataset.name)}</b><div class="muted small">${esc(el.dataset.sub)}</div></div></div><div class="dlg-foot"><button type="button" class="btn secondary block" data-action="role" data-role="visitor" data-close>Salir</button></div>`);
    },
    more(el) {
      const items = JSON.parse(el.dataset.items), base = el.dataset.base;
      AFG.dialog("Más secciones", `<ul class="list">${items.map(([k, l, i, n]) => `<li><a class="btn secondary block" data-close href="${base}${k ? "/" + k : ""}" style="justify-content:flex-start">${ico(i)} ${esc(l)}${n ? ` <span class="badge nuevo">${n}</span>` : ""}</a></li>`).join("")}</ul>`);
    },
  });
  AFG.forms.search = function (f) { location.hash = `#/asesor/buscar?q=${encodeURIComponent(f.elements.q.value)}`; };

  // Si otra ventana de la demo (mismo navegador) cambia datos, recargar el estado.
  window.addEventListener("storage", (e) => { if (e.key === store.KEY) location.reload(); });

  window.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#/";
    render();
  });
})();
