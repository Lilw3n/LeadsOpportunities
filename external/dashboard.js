(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }

  var simBanner = localStorage.getItem("lo_ext_simulation") === "1";
  if (simBanner) {
    var b = document.createElement("div");
    b.style.cssText =
      "background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:10px 16px;border-radius:10px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px";
    b.innerHTML =
      "<span><strong>🎭 Mode Test Actif</strong> — Simulation utilisateur externe (inspire dashboard/external multisite)</span>" +
      '<button type="button" id="btnExitSim" style="padding:6px 12px;border:1px solid #f59e0b;border-radius:8px;background:#fff;cursor:pointer;font-weight:600">🚨 Retour Admin</button>';
    document.querySelector(".dash").insertBefore(b, document.querySelector(".dash-header").nextSibling);
    document.getElementById("btnExitSim").onclick = function () {
      localStorage.removeItem("lo_ext_simulation");
      localStorage.setItem("lo_view_mode", "admin");
      location.href = "../crm-test-modes.html";
    };
  }

  document.getElementById("btnLogout").onclick = function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("lo_ext_profile");
    location.href = "./login.html";
  };

  var email = localStorage.getItem(EMAIL_KEY);
  if (!email) {
    location.href = "./login.html";
    return;
  }

  fetch("/api/external/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("dashLoading").classList.add("hidden");
      if (!res.ok) {
        document.getElementById("dashLoading").textContent = res.error || "Erreur";
        document.getElementById("dashLoading").classList.remove("hidden");
        return;
      }

      var p = res.profile;
      document.getElementById("dashTitle").textContent = "Bonjour " + ((p.firstName || "") + " " + (p.lastName || "")).trim();

      var memberLabel = "";
      try {
        if (p.memberSince) memberLabel = new Date(p.memberSince).toLocaleDateString("fr-FR");
      } catch (e) {}

      /* Bloc « Actions rapides » — inspire dashboard/external multisite (recherche, documents, support, accueil). */
      var quickBar =
        '<div class="dash-card">' +
        '<p class="dash-quick-meta">Dossier client depuis ' +
        esc(memberLabel || "—") +
        ' · <a href="profile.html">Fiche personnelle</a></p>' +
        "<h2 style=\"margin:0 0 12px;font-size:1.1rem\">Actions rapides</h2>" +
        '<p style="margin:0 0 12px;font-size:.85rem;color:#64748b">Raccourcis calqués sur le tableau <code>/dashboard/external</code> du multisite.</p>' +
        '<div class="dash-pills">' +
        '<a class="dash-pill" href="search.html">🔍 Recherche</a>' +
        '<a class="dash-pill" href="documents.html">📋 Documents</a>' +
        '<a class="dash-pill" href="claim-declare.html">📣 Sinistre</a>' +
        '<a class="dash-pill" href="mailto:courtier972@gmail.com">💬 Support</a>' +
        '<a class="dash-pill" href="devis-wizard.html">✨ Nouveau devis</a>' +
        '<a class="dash-pill" href="index.html">🏠 Portail</a>' +
        "</div></div>";

      var st = res.stats || {};
      var statsBar =
        '<div class="dash-card"><h2>Statistiques</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px">' +
        statMini(st.contractsActive || 0, "Contrats") +
        statMini(st.vehiclesTotal || 0, "Véhicules") +
        statMini(st.claimsTotal || 0, "Sinistres") +
        statMini(st.quotesTotal || 0, "Devis") +
        "</div></div>";

      function statMini(n, label) {
        return '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:10px"><strong style="display:block;font-size:1.2rem;color:#4338ca">' + n + '</strong><span style="font-size:.75rem;color:#64748b">' + label + "</span></div>";
      }

      var html =
        quickBar +
        statsBar +
        '<div class="dash-card"><h2>Coordonnées</h2><p>' +
        esc(p.email) +
        (p.phone ? " · " + esc(p.phone) : "") +
        (p.company ? "<br>" + esc(p.company) : "") +
        '</p></div><div class="dash-card"><h2>Mes contrats</h2><ul class="dash-list">';

      if (!res.contracts || !res.contracts.length) html += "<li>Aucun contrat enregistré</li>";
      else {
        res.contracts.forEach(function (ct) {
          html +=
            "<li><strong>" +
            esc(ct.policy_number || ct.contract_type || "Contrat") +
            "</strong> — " +
            esc(ct.insurer || "") +
            " · " +
            esc(ct.status) +
            (ct.end_date ? " · fin " + new Date(ct.end_date).toLocaleDateString("fr-FR") : "") +
            "</li>";
        });
      }

      html += '</ul></div><div class="dash-card"><h2>Mes sinistres</h2><ul class="dash-list">';
      if (!res.claims || !res.claims.length) html += "<li>Aucun sinistre</li>";
      else {
        res.claims.forEach(function (cl) {
          html +=
            "<li><strong>" +
            esc(cl.claim_type || "Sinistre") +
            "</strong> — " +
            esc(cl.status) +
            (cl.claim_date ? " · " + new Date(cl.claim_date).toLocaleDateString("fr-FR") : "") +
            "</li>";
        });
      }

      html += '</ul></div><div class="dash-card"><h2>Mes véhicules</h2><ul class="dash-list">';
      if (!res.vehicles || !res.vehicles.length) html += "<li>Aucun véhicule</li>";
      else {
        res.vehicles.slice(0, 5).forEach(function (v) {
          html +=
            "<li><strong>" +
            esc(v.registration || "—") +
            "</strong> — " +
            esc((v.brand || "") + " " + (v.model || "")) +
            "</li>";
        });
      }
      html += '</ul><p style="margin-top:8px;font-size:.85rem"><a href="profile.html">Voir profil complet →</a></p></div>';

      if (res.activities && res.activities.length) {
        html += '<div class="dash-card"><h2>Activité récente</h2><ul class="dash-list">';
        res.activities.slice(0, 4).forEach(function (a) {
          html +=
            "<li><strong>" +
            esc(a.title || "Activité") +
            "</strong> · " +
            new Date(a.created_at).toLocaleDateString("fr-FR") +
            "</li>";
        });
        html += "</ul></div>";
      }

      html += '<div class="dash-card"><h2>Mes demandes</h2><ul class="dash-list">';
      if (!res.requests || !res.requests.length) html += "<li>Aucune demande</li>";
      else {
        res.requests.forEach(function (r) {
          html +=
            "<li><strong>" +
            esc(r.request_type || r.product_type || "Demande") +
            "</strong> — " +
            esc(r.status) +
            " · " +
            new Date(r.created_at).toLocaleDateString("fr-FR") +
            "</li>";
        });
      }

      html += '</ul></div><div class="dash-card"><h2>Mes devis</h2><ul class="dash-list">';
      if (!res.quotes || !res.quotes.length) html += "<li>Aucun devis</li>";
      else {
        res.quotes.forEach(function (q) {
          html +=
            "<li><strong>" +
            esc(q.title || q.product_type) +
            "</strong> — " +
            esc(q.status) +
            (q.premium_estimate ? " · ~" + Number(q.premium_estimate).toLocaleString("fr-FR") + " €/an" : "") +
            "</li>";
        });
      }

      html +=
        '</ul></div><div class="dash-actions">' +
        '<a href="claim-declare.html">Déclarer un sinistre</a>' +
        '<a href="upload-document.html" class="secondary">Déposer un document</a>' +
        '<a href="devis-wizard.html" class="secondary">Nouveau devis</a>' +
        '<a href="search.html" class="secondary">Recherche dossier</a>' +
        '<a href="assurance.html" class="secondary">Catalogue assurance</a>' +
        '<a href="social/hub.html" class="secondary">Social hub</a></div>';

      document.getElementById("dashContent").innerHTML = html;
      document.getElementById("dashContent").classList.remove("hidden");
    });
})();
