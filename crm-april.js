/**
 * CRM — page connexion API APRIL.
 */
(function () {
  function token() {
    return localStorage.getItem("lo_token") || "";
  }

  async function api(method, body) {
    var opts = {
      method: method,
      headers: {
        Authorization: "Bearer " + token(),
        "Content-Type": "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch("/api/crm/april" + (method === "GET" ? "?op=status" : ""), opts);
    var data = await res.json().catch(function () {
      return {};
    });
    return { status: res.status, data: data };
  }

  function el(id) {
    return document.getElementById(id);
  }

  function renderStatus(april) {
    var grid = el("aprilStatusGrid");
    if (!grid || !april) return;
    var rows = [
      ["Configuration", april.configured ? "OK" : "Manquante", april.configured],
      ["Client ID", april.hasClientId ? april.clientIdHint || "présent" : "absent", april.hasClientId],
      ["Client secret", april.hasClientSecret ? "présent" : "absent", april.hasClientSecret],
      ["Gateway", april.gateway || "—", true],
      ["Environnement", april.env || "preprod", true],
      ["Jeton en cache", april.tokenCached ? "oui" : "non", true],
    ];
    grid.innerHTML = rows
      .map(function (r) {
        var cls = r[2] ? "april-ok" : "april-ko";
        if (r[0] === "Gateway" || r[0] === "Environnement" || r[0] === "Jeton en cache") cls = "";
        return (
          '<div class="april-card"><strong>' +
          r[0] +
          '</strong><span class="' +
          cls +
          '">' +
          r[1] +
          "</span></div>"
        );
      })
      .join("");
  }

  function setLog(label, payload) {
    var lab = el("aprilResultLabel");
    var log = el("aprilLog");
    if (lab) lab.textContent = label;
    if (log) log.textContent = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  }

  async function refresh() {
    try {
      var out = await api("GET");
      if (out.data && out.data.april) renderStatus(out.data.april);
      else setLog("Erreur statut", out.data);
    } catch (e) {
      setLog("Erreur réseau", e.message || String(e));
    }
  }

  async function run(action, label) {
    setLog(label + "…", "En cours");
    try {
      var out = await api("POST", { action: action });
      if (out.data && out.data.april) renderStatus(out.data.april);
      setLog(
        out.data && out.data.ok ? label + " — OK" : label + " — échec (HTTP " + out.status + ")",
        out.data
      );
    } catch (e) {
      setLog(label + " — erreur", e.message || String(e));
    }
  }

  function boot() {
    var bRefresh = el("btnAprilRefresh");
    var bToken = el("btnAprilToken");
    var bTest = el("btnAprilTest");
    if (bRefresh) bRefresh.onclick = refresh;
    if (bToken) bToken.onclick = function () {
      run("token", "Test jeton OAuth2");
    };
    if (bTest) bTest.onclick = function () {
      run("test", "Test complet APRIL");
    };
    refresh();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
