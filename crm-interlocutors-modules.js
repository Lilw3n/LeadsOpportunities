(function () {
  var TOKEN_KEY = "lo_token";
  function token() { return localStorage.getItem(TOKEN_KEY); }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }
  if (!token()) { location.href = "./crm.html"; return; }

  var box = document.getElementById("modList");
  var timer;

  function load(q) {
    box.innerHTML = "<p>Chargement…</p>";
    var url = q && q.length >= 2
      ? "/api/crm/universal-search?q=" + encodeURIComponent(q)
      : "/api/crm/contacts?limit=30";
    fetch(url, { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          box.innerHTML = "<p>" + esc(res.error || "Erreur") + "</p>";
          return;
        }
        if (res.results) {
          var rows = [];
          (res.results.contacts || []).forEach(function (c) {
            rows.push(rowContact(c));
          });
          (res.results.contracts || []).forEach(function (ct) {
            rows.push(
              '<div class="result-row"><span>📄 Contrat ' + esc(ct.policy_number || ct.id) +
              '</span><a href="./crm-contact.html?id=' + encodeURIComponent(ct.contact_id) + '">Dossier</a></div>'
            );
          });
          (res.results.vehicles || []).forEach(function (v) {
            rows.push(
              '<div class="result-row"><span>🚗 ' + esc(v.registration || v.id) +
              '</span><a href="./crm-vehicle-detail.html?id=' + encodeURIComponent(v.id) +
              "&contactId=" + encodeURIComponent(v.contact_id) + '">Fiche</a></div>'
            );
          });
          box.innerHTML = rows.length ? rows.join("") : "<p>Aucun résultat</p>";
          return;
        }
        box.innerHTML = (res.contacts || [])
          .map(rowContact)
          .join("") || "<p>Aucun contact</p>";
      });
  }

  function rowContact(c) {
    var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email;
    return (
      '<div class="result-row" style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)">' +
      "<div><strong>" + esc(name) + "</strong><br><span style='font-size:.85rem;color:var(--muted)'>" +
      esc(c.contact_type) + " · " + esc(c.email || "") + "</span></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' + encodeURIComponent(c.id) + '">Fiche</a>' +
      '<a class="btn btn-ghost btn-sm" href="./crm-contact-modules.html?id=' + encodeURIComponent(c.id) + '">Modules</a>' +
      '<a class="btn btn-ghost btn-sm" href="./crm-modules-beta.html?contactId=' + encodeURIComponent(c.id) + '">Arbre beta</a>' +
      "</div></div>"
    );
  }

  load("");
  document.getElementById("modSearch").oninput = function () {
    clearTimeout(timer);
    var q = this.value.trim();
    timer = setTimeout(function () { load(q); }, 350);
  };
})();
