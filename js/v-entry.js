/* Entrada tipo app, con una versión por dispositivo (móvil, tableta, ordenador). Sin contraseñas. */
(function () {
  const AFG = window.AFG;
  const { esc, ico, store } = AFG;

  AFG.views.entry = function () {
    const msg = AFG._entryMsg; AFG._entryMsg = null;
    const clients = store.activeClients();
    const login = `<div class="entry-card">
        <div class="entry-col"><h2>Soy cliente</h2>
          <form class="stack" data-form="enter-client">
            <div class="field"><label for="acc-c">Cliente de ejemplo</label>
              <select id="acc-c" name="client">${clients.map((c) => `<option value="${c.id}" data-sub="${esc(c.type)}" ${c.id === store.state.clientId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
              <span class="hint">En la versión real entrarías con tu correo. En la demo no hay contraseñas.</span></div>
            <button class="btn block" type="submit">Entrar a mi espacio</button>
          </form></div>
        <div class="entry-sep"><span>o</span></div>
        <div class="entry-col"><h2>Soy el asesor</h2>
          <p class="muted small">Panel del despacho con la carga de trabajo de ejemplo.</p>
          <button class="btn secondary block" type="button" data-action="enter-advisor">Entrar al panel del despacho</button></div>
      </div>`;
    return { html: `<main id="main" class="entry" tabindex="-1">
      <section class="entry-brand">
        <div class="wordmark">Asesoría Fácil<small>Gestión, SL</small></div>
        <div class="stack">
          <h1>Tu asesoría, en un solo sitio.</h1>
          <p class="muted lead">Sube tus facturas con una foto, consulta tus impuestos y habla con tu asesor. Desde el móvil, la tableta o el ordenador.</p>
        </div>
        <ul class="entry-points">
          <li>${ico("camera")}<span>Facturas con una foto, ordenadas solas por trimestre y tipo</span></li>
          <li>${ico("receipt")}<span>Tus modelos, nóminas y documentos siempre a mano</span></li>
          <li>${ico("chat")}<span>Mensajes con tu asesor ligados a cada documento</span></li>
        </ul>
        <div class="entry-preview" aria-hidden="true"><img class="pv-desk" src="img/preview-desk.webp" alt="" width="750" height="457"><img class="pv-phone" src="img/preview-phone.webp" alt="" width="230" height="472"></div>
        <a class="dz dz-desk" href="https://dazenty.com/" target="_blank" rel="noopener"><img src="img/dazenty-marca.png" alt="Logotipo de Dazenty" height="40"><span>Desarrollado por Dazenty<small>dazenty.com</small></span></a>
      </section>
      <section class="entry-side" aria-label="Acceso">
        ${msg ? `<div class="notice info" role="status">${ico("info")}<div>${esc(msg)}</div></div>` : ""}
        ${login}
        <p class="small muted">Demostración con datos ficticios. No se envía nada ni se conecta con servicios reales.</p>
        <a class="dz dz-small" href="https://dazenty.com/" target="_blank" rel="noopener"><img src="img/dazenty-marca.png" alt="Logotipo de Dazenty" height="40"><span>Desarrollado por Dazenty<small>dazenty.com</small></span></a>
      </section></main>`, title: "Acceso · Asesoría Fácil Gestión (demo)" };
  };

  AFG.actions["enter-advisor"] = () => { store.setRole("advisor"); location.hash = "#/asesor"; };
  AFG.forms["enter-client"] = (f) => { store.setClient(f.elements.client.value); store.setRole("client"); location.hash = "#/cliente"; };
})();
