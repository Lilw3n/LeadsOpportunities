(function () {

  var TOKEN_KEY = "lo_token";



  function token() {

    return localStorage.getItem(TOKEN_KEY);

  }



  function esc(s) {

    var d = document.createElement("div");

    d.textContent = String(s == null ? "" : s);

    return d.innerHTML;

  }



  function contactName(c) {

    return ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || "Contact";

  }



  function section(title, html) {

    if (!html) return "";

    return '<div class="result-section panel"><h3>' + title + "</h3>" + html + "</div>";

  }



  function search() {

    if (!token()) {

      location.href = "./crm.html";

      return;

    }

    var q = document.getElementById("searchQ").value.trim();

    var entity = document.getElementById("searchEntity").value;

    if (q.length < 2) {
      document.getElementById("searchResults").innerHTML =
        '<div class="crm-empty-state"><h3>Commencez par deux caractères</h3><p>Exemples : nom client, téléphone, e-mail, immatriculation, numéro de contrat ou permis.</p></div>';

      return;

    }

    try {
      var list = JSON.parse(localStorage.getItem("lo_search_recent") || "[]");
      list = [q].concat(list.filter(function (x) { return x !== q; })).slice(0, 8);
      localStorage.setItem("lo_search_recent", JSON.stringify(list));
      if (typeof paintRecent === "function") paintRecent();
    } catch (e) {}

    document.getElementById("searchResults").innerHTML = '<div class="panel">Recherche en cours…</div>';

    fetch(

      "/api/crm/universal-search?q=" + encodeURIComponent(q) + "&entity=" + encodeURIComponent(entity),

      { headers: { Authorization: "Bearer " + token() } }

    )

      .then(function (r) {

        return r.json();

      })

      .then(function (res) {

        if (!res.ok) {

          document.getElementById("searchResults").innerHTML =
            '<div class="crm-empty-state"><h3>Recherche indisponible</h3><p>' + esc(res.error || "Erreur") + "</p></div>";

          return;

        }

        if (!res.total) {

          document.getElementById("searchResults").innerHTML =
            '<div class="crm-empty-state"><h3>Aucun résultat pour « ' +
            esc(q) +
            ' »</h3><p>Essayez un ID Slack (UUID), un téléphone sans espaces, une partie du nom, une plaque ou une adresse e-mail.</p>' +
            '<p style="margin:14px 0 0"><a class="btn btn-primary" href="./crm.html#contacts">Créer un contact</a> <a class="btn btn-ghost" href="./dashboard.html?section=leads&amp;search=' +
            encodeURIComponent(q) +
            '">Chercher dans les leads</a></p></div>';

          return;

        }

        var r = res.results;

        var html = "";



        if (r.contacts && r.contacts.length) {

          html += section(

            "Contacts (" + r.contacts.length + ")",

            r.contacts

              .map(function (c) {

                return (

                  '<div class="result-row"><div><a href="./crm-contact.html?id=' +

                  encodeURIComponent(c.id) +

                  '">' +

                  esc(contactName(c)) +

                  '</a><div class="result-meta">' +

                  esc(c.contact_type) +

                  " · " +

                  esc(c.email || "—") +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        if (r.vehicles && r.vehicles.length) {

          html += section(

            "Véhicules (" + r.vehicles.length + ")",

            r.vehicles

              .map(function (v) {

                var cn = contactName({ first_name: v.first_name, last_name: v.last_name, email: v.email });

                return (

                  '<div class="result-row"><div><a href="./crm-vehicle-detail.html?id=' +

                  encodeURIComponent(v.id) +

                  "&contactId=" +

                  encodeURIComponent(v.contact_id) +

                  '">' +

                  esc(v.registration || "—") +

                  " · " +

                  esc((v.brand || "") + " " + (v.model || "")) +

                  '</a><div class="result-meta">' +

                  esc(cn) +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        if (r.contracts && r.contracts.length) {

          html += section(

            "Contrats (" + r.contracts.length + ")",

            r.contracts

              .map(function (ct) {

                var cn = contactName({ first_name: ct.first_name, last_name: ct.last_name });

                return (

                  '<div class="result-row"><div><a href="./crm-contract-detail.html?id=' +

                  encodeURIComponent(ct.id) +

                  "&contactId=" +

                  encodeURIComponent(ct.contact_id) +

                  '">' +

                  esc(ct.policy_number || ct.contract_type || "—") +

                  '</a><div class="result-meta">' +

                  esc(ct.insurer || "") +

                  " · " +

                  esc(cn) +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        if (r.claims && r.claims.length) {

          html += section(

            "Sinistres (" + r.claims.length + ")",

            r.claims

              .map(function (cl) {

                var cn = contactName({ first_name: cl.first_name, last_name: cl.last_name });

                return (

                  '<div class="result-row"><div><a href="./crm-claim-detail.html?id=' +

                  encodeURIComponent(cl.id) +

                  "&contactId=" +

                  encodeURIComponent(cl.contact_id) +

                  '">' +

                  esc(cl.claim_type || "Sinistre") +

                  '</a><div class="result-meta">' +

                  esc(cl.status) +

                  " · " +

                  esc(cn) +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        if (r.drivers && r.drivers.length) {

          html += section(

            "Conducteurs (" + r.drivers.length + ")",

            r.drivers

              .map(function (d) {

                var cn = contactName({ first_name: d.c_first, last_name: d.c_last });

                var dn = ((d.first_name || "") + " " + (d.last_name || "")).trim();

                return (

                  '<div class="result-row"><div><a href="./crm-driver-detail.html?id=' +

                  encodeURIComponent(d.id) +

                  "&contactId=" +

                  encodeURIComponent(d.contact_id) +

                  '">' +

                  esc(dn) +

                  '</a><div class="result-meta">' +

                  esc(d.license_number || d.license_type || "") +

                  " · " +

                  esc(cn) +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        if (r.leads && r.leads.length) {

          html += section(

            "Leads (" + r.leads.length + ")",

            r.leads

              .map(function (l) {

                var label = l.email || l.phone || l.id;

                return (

                  '<div class="result-row"><div><a href="./crm-lead-detail.html?id=' +

                  encodeURIComponent(l.id) +

                  '">' +

                  esc(label) +

                  '</a><div class="result-meta">' +

                  esc(l.vertical || l.source || "lead") +

                  " · score " +

                  esc(l.lead_score != null ? l.lead_score : "—") +

                  " · ID " +

                  esc(l.id) +

                  (l.email || l.phone ? "" : " · sans email/tél") +

                  "</div></div></div>"

                );

              })

              .join("")

          );

        }



        document.getElementById("searchResults").innerHTML = html;

      });

  }



  var RECENT_KEY = "lo_search_recent";

  function saveRecent(q) {
    try {
      var list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      list = [q].concat(list.filter(function (x) { return x !== q; })).slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      paintRecent();
    } catch (e) {}
  }

  function paintRecent() {
    var box = document.getElementById("searchRecent");
    if (!box) return;
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch (e) {}
    if (!list.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML =
      '<p style="font-size:.85rem;color:var(--muted);margin:8px 0">Recherches récentes : ' +
      list
        .map(function (q) {
          return '<button type="button" class="btn btn-ghost btn-sm" data-recent="' + esc(q) + '">' + esc(q) + "</button>";
        })
        .join(" ") +
      "</p>";
    box.querySelectorAll("[data-recent]").forEach(function (btn) {
      btn.onclick = function () {
        document.getElementById("searchQ").value = btn.getAttribute("data-recent");
        search();
      };
    });
  }

  var origSearch = search;
  search = function () {
    var q = document.getElementById("searchQ").value.trim();
    if (q.length >= 2) saveRecent(q);
    origSearch();
  };

  document.getElementById("btnSearch").onclick = search;

  document.getElementById("searchQ").onkeydown = function (e) {

    if (e.key === "Enter") search();

  };

  var hintEl = document.getElementById("searchHint");
  if (hintEl && window.CrmPersonalDataSearch) {
    var labels = { phone: "téléphone", email: "e-mail", registration: "immatriculation", iban: "IBAN", text: "texte libre" };
    document.getElementById("searchQ").addEventListener("input", function () {
      var v = this.value.trim();
      hintEl.textContent = v.length >= 2 ? "Détection champ : " + (labels[window.CrmPersonalDataSearch.detectFieldHint(v)] || "texte") : "";
    });
  }

  paintRecent();

  document.getElementById("searchEntity").onchange = function () {

    if (document.getElementById("searchQ").value.trim().length >= 2) search();

  };

  document.querySelectorAll("[data-sample]").forEach(function (btn) {
    btn.onclick = function () {
      var sample = btn.getAttribute("data-sample");
      document.getElementById("searchQ").value = sample;
      if (sample && sample.indexOf("-") === 8) {
        document.getElementById("searchEntity").value = "leads";
      }
      document.getElementById("searchQ").focus();
      if (sample && sample.length >= 2) search();
    };
  });

  var boot = new URLSearchParams(location.search);
  if (boot.get("entity")) document.getElementById("searchEntity").value = boot.get("entity");
  if (boot.get("q") || boot.get("id") || boot.get("lead")) {
    document.getElementById("searchQ").value = boot.get("q") || boot.get("id") || boot.get("lead");
    search();
  }

})();


