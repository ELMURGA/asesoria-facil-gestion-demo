/* Módulo «Servicio de facturación»: RECORRIDO SIMULADO con datos ficticios.
   No emite facturas, no calcula impuestos y no remite nada a ninguna administración. */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store, toast, fmtDate, fmtTime } = AFG;
  const CLS = { datos_recibidos: "recibido", pendiente_revision: "pendiente", resuelto_herramienta: "revisado" };
  const IC = { datos_recibidos: "download", pendiente_revision: "clock", resuelto_herramienta: "check" };
  const bbadge = (s) => `<span class="badge ${CLS[s]}">${ico(IC[s])}${esc(AFG.BILL[s])}</span>`;

  AFG.billingHtml = function (side) {
    const s = store.state;
    const items = side === "client" ? s.billing.filter((b) => b.clientId === s.clientId) : s.billing;
    const count = (k) => items.filter((b) => b.status === k).length;
    const row = (b) => {
      const c = store.client(b.clientId);
      const next = { datos_recibidos: "Pasar a revisión del asesor", pendiente_revision: "Marcar como resuelto en la herramienta (simulado)" }[b.status];
      return `<li><div class="main"><div class="t">${esc(b.concept)} ${AFG.sample()}</div><div class="s">${side === "advisor" ? esc(c.name) + " · " : ""}Destinatario: ${esc(b.to)} · Importe indicado: ${esc(b.total)} € · ${esc(fmtTime(b.at))}</div></div>${bbadge(b.status)}
        ${side === "advisor" && next ? `<button class="btn sm secondary" data-action="bill-next" data-id="${b.id}">${esc(next)}</button>` : ""}</li>`;
    };
    return `<div class="stack-lg">
      <div class="page-head"><div><h1>Servicio de facturación</h1><p class="muted" style="margin-top:.4rem">Propuesta por definir con el despacho. Esta pantalla enseña el recorrido que se plantea, no un servicio activo.</p></div></div>
      <div class="sim-banner" role="note">SIMULACIÓN · Todo lo de esta pantalla es una maqueta con datos ficticios. No hay conexión con ninguna herramienta de facturación ni con la Agencia Tributaria. Los estados los cambia una persona a mano para ilustrar el recorrido.</div>

      <section class="card" aria-labelledby="h-pipe"><h2 id="h-pipe" style="margin-bottom:1rem">Recorrido propuesto</h2>
        <div class="pipeline">
          <div><div class="n">${count("datos_recibidos")}</div><h4>Datos recibidos</h4><p class="small muted">El cliente indica los datos de lo que quiere facturar.</p></div>
          <div><div class="n">${count("pendiente_revision")}</div><h4>Pendiente de revisión del asesor</h4><p class="small muted">Una persona del despacho comprueba que los datos son suficientes.</p></div>
          <div><div class="n">${count("resuelto_herramienta")}</div><h4>Resuelto en la herramienta de facturación</h4><p class="small muted">El paso real ocurriría en la herramienta que se elija. Aquí solo se marca a mano.</p></div>
        </div></section>

      <section class="card" aria-labelledby="h-list"><div class="panel-title"><h2 id="h-list">${side === "client" ? "Tus envíos de ejemplo" : "Envíos de ejemplo de los clientes"}</h2>
        ${side === "client" ? `<button class="btn sm" data-action="bill-new">${ico("plus")}Enviar datos de una factura (simulado)</button>` : ""}</div>
        ${items.length ? `<ul class="list">${items.map(row).join("")}</ul>` : AFG.empty("receipt", "Todavía no hay envíos", "Pulsa «Enviar datos de una factura» para ver cómo se vería el primer paso.")}</section>

      <section class="card stack" aria-labelledby="h-4"><h2 id="h-4">Cuatro procesos que no hay que confundir</h2>
        <details class="fold" open><summary>Recibir un documento que ya existe</summary><p>Un PDF, una foto o un Excel que el cliente aporta. Es lo que hace hoy el portal base: lo guarda, lo clasifica y lo muestra al despacho. No lo convierte ni lo valida fiscalmente.</p></details>
        <details class="fold"><summary>Emitir una factura</summary><p>Crear la factura con una herramienta de facturación. Hay que decidir quién la emite (el cliente o el despacho) y con qué programa.</p></details>
        <details class="fold"><summary>Calcular impuestos</summary><p>Trabajo del despacho. El portal base no calcula impuestos ni nóminas, y no está previsto hacerlo salvo que se acuerde y presupueste aparte.</p></details>
        <details class="fold"><summary>Remitir registros de facturación</summary><p>Enviar los registros que correspondan a la administración. Exige un sistema informático de facturación con requisitos propios, que habría que estudiar con su documentación oficial antes de prometer nada. No se ha comprobado ni conectado nada en esta demo.</p></details>
      </section>

      <section class="card stack" aria-labelledby="h-falta"><h2 id="h-falta">Qué faltaría para que fuese real</h2>
        <ul class="checklist">
          ${["Saber quién emite las facturas hoy y con qué programa o método.", "Saber qué datos se reciben de cada cliente y en qué formato.", "Decidir quién valida cada paso y con qué responsabilidades.", "Comprobar si la herramienta actual del despacho tiene API y documentación.", "Elegir entre mantener su herramienta, incorporar un proveedor o desarrollar algo específico (ver nota técnica).", "Revisar la documentación oficial vigente antes de diseñar nada."].map((t) => `<li>${ico("clock")}<span>${esc(t)}</span></li>`).join("")}
        </ul>
        <p class="small muted">Referencia oficial a consultar al iniciar esa fase (no se ha usado para construir esta demo): <a href="https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html" target="_blank" rel="noopener">Sede electrónica de la AEAT · sistemas informáticos de facturación</a>.</p>
      </section></div>`;
  };

  Object.assign(AFG.actions, {
    "bill-next"(el) { store.advanceBill(el.dataset.id); toast("Estado cambiado (simulado)."); AFG.render(); },
    "bill-new"() {
      AFG.dialog("Enviar datos de una factura (simulado)", `<form class="stack" novalidate>
        <div class="sim-banner">SIMULACIÓN: no se emite ninguna factura. Solo se guardan estos datos ficticios en la demo.</div>
        <div class="field"><label for="bn-c">Concepto</label><input id="bn-c" name="concept" type="text" required maxlength="80" placeholder="Servicio de ejemplo"><span class="err">Indica el concepto.</span></div>
        <div class="field"><label for="bn-t">Destinatario (ficticio)</label><input id="bn-t" name="to" type="text" required maxlength="60" placeholder="Cliente final ficticio"><span class="err">Indica un destinatario.</span></div>
        <div class="field"><label for="bn-a">Importe total indicado (€)</label><input id="bn-a" name="total" type="text" inputmode="decimal" required pattern="[0-9]+([,.][0-9]{1,2})?" placeholder="100,00" aria-describedby="bn-h"><span class="hint" id="bn-h">Es un dato que escribe el cliente; el portal no calcula impuestos.</span><span class="err">Escribe un importe como 100 o 100,50.</span></div>
        <div class="dlg-foot"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn" type="submit">Enviar (simulado)</button></div></form>`, (dlg, close) => {
        dlg.querySelector("form").addEventListener("submit", (e) => {
          e.preventDefault(); const f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
          store.addBill(store.state.clientId, f.elements.concept.value.trim(), f.elements.to.value.trim(), f.elements.total.value.trim().replace(".", ","));
          close(); toast("Datos recibidos (simulado). Estado: Datos recibidos."); AFG.render();
        });
      });
    },
  });
})();
