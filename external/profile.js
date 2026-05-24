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

  var email = localStorage.getItem(EMAIL_KEY);
  if (!email) {
    location.href = "./login.html";
    return;
  }

  document.getElementById("btnLogout").onclick = function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("lo_ext_profile");
    location.href = "./login.html";
  };

  function render(data) {
    var p = data.profile;
    var patch = {};
    try {
      patch = JSON.parse(localStorage.getItem("lo_ext_profile_patch") || "{}");
    } catch (e) {}
    if (patch.phone) p.phone = patch.phone;
    if (patch.company) p.company = patch.company;
    if (patch.address) p.address = patch.address;
    var st = data.stats || {};
    var name = ((p.firstName || "") + " " + (p.lastName || "")).trim() || p.email;
    document.getElementById("profTitle").textContent = name;

    var html =
      '<div class="prof-card"><h2>Actions rapides</h2><div class="prof-pills">' +
      '<a class="prof-pill" href="devis-wizard.html">✨ Demander un devis</a>' +
      '<a class="prof-pill" href="claim-declare.html">📣 Déclarer un sinistre</a>' +
      '<a class="prof-pill" href="documents.html">📋 Documents</a>' +
      '<a class="prof-pill" href="mailto:courtier972@gmail.com">💬 Contacter un conseiller</a>' +
      '<a class="prof-pill" href="search.html">🔍 Recherche</a>' +
      "</div></div>" +
      '<div class="prof-card"><h2>Informations personnelles</h2>' +
      "<p><strong>" +
      esc(name) +
      "</strong><br>" +
      esc(p.email) +
      (p.phone ? "<br>Téléphone : " + esc(p.phone) : "") +
      (p.company ? "<br>Entreprise : " + esc(p.company) : "") +
      (p.address ? "<br>Adresse : " + esc(p.address) : "") +
      (p.status ? "<br>Statut : " + esc(p.status) : "") +
      '</p><button type="button" id="btnEditProf" class="btn btn-ghost btn-sm" style="margin-top:8px">Modifier</button>' +
      '<div id="editProfForm" class="hidden" style="margin-top:12px">' +
      '<label style="display:block;margin-bottom:8px">Téléphone<input id="editPhone" value="' + esc(p.phone || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Entreprise<input id="editCompany" value="' + esc(p.company || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Adresse<input id="editAddress" value="' + esc(p.address || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<button type="button" id="btnSaveProf" class="btn btn-primary btn-sm">Enregistrer</button></div>' +
      '<p class="prof-meta">Membre depuis ' +
      new Date(p.memberSince).toLocaleDateString("fr-FR") +
      " · Dernière connexion : " +
      new Date().toLocaleDateString("fr-FR") +
      "</p></div>" +
      '<div class="prof-card"><h2>Statistiques</h2><div class="prof-stats">' +
      statBox(st.contractsActive != null ? st.contractsActive : 0, "Contrats actifs") +
      statBox(st.vehiclesTotal || 0, "Véhicules") +
      statBox(st.claimsTotal || 0, "Sinistres") +
      statBox(st.quotesTotal || 0, "Devis") +
      statBox(st.requestsTotal || 0, "Demandes") +
      "</div></div>";

    html += '<div class="prof-grid2">';
    html += sectionVehicles(data.vehicles);
    html += sectionContracts(data.contracts);
    html += "</div>";
    html += sectionClaims(data.claims);
    html += sectionActivity(data.activities);
    html +=
      '<p style="margin-top:8px;font-size:.9rem"><a href="dashboard.html">Retour mon espace</a> · <a href="devis-wizard.html">Nouvelle demande</a></p>';

    document.getElementById("profContent").innerHTML = html;
    document.getElementById("profContent").classList.remove("hidden");

    document.querySelectorAll(".btn-retry-profile").forEach(function (btn) {
      btn.onclick = function () {
        location.reload();
      };
    });

    var btnEdit = document.getElementById("btnEditProf");
    var editForm = document.getElementById("editProfForm");
    if (btnEdit && editForm) {
      btnEdit.onclick = function () {
        editForm.classList.toggle("hidden");
      };
    }
    var btnSave = document.getElementById("btnSaveProf");
    if (btnSave) {
      btnSave.onclick = function () {
        localStorage.setItem(
          "lo_ext_profile_patch",
          JSON.stringify({
            phone: document.getElementById("editPhone").value,
            company: document.getElementById("editCompany").value,
            address: document.getElementById("editAddress").value,
          })
        );
        render(data);
      };
    }
  }

  function statBox(n, label) {
    return (
      '<div class="prof-stat"><strong>' +
      esc(String(n)) +
      "</strong><span>" +
      esc(label) +
      "</span></div>"
    );
  }

  function sectionVehicles(list) {
    var h =
      '<div class="prof-card"><h2>Mes véhicules</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun véhicule enregistré</li>";
    else {
      list.forEach(function (v) {
        h +=
          "<li><strong>" +
          esc(v.registration || "Sans immat.") +
          "</strong> — " +
          esc([v.brand, v.model, v.year].filter(Boolean).join(" ")) +
          " · " +
          esc(v.status || v.vehicle_type || "") +
          "</li>";
      });
    }
    h +=
      '</ul><p style="margin:12px 0 0"><a href="devis-wizard.html" class="btn" style="display:inline-block;padding:8px 14px;background:#0d9488;color:#fff;border-radius:8px;text-decoration:none;font-size:.85rem">+ Ajouter un véhicule</a> · <a href="upload-document.html">Carte grise</a> · <button type="button" class="btn-retry-profile" style="margin-left:8px;padding:6px 10px;font-size:.8rem">Réessayer chargement</button></p></div>';
    return h;
  }

  function sectionContracts(list) {
    var h =
      '<div class="prof-card"><h2>Mes contrats d\'assurance</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun contrat d'assurance</li>";
    else {
      list.forEach(function (ct) {
        h +=
          "<li><strong>" +
          esc(ct.policy_number || ct.contract_type || "Contrat") +
          "</strong><br>Police N° " +
          esc(ct.policy_number || "—") +
          " · " +
          esc(ct.insurer || "") +
          " · " +
          esc(ct.status) +
          (ct.premium != null ? "<br>Prime : " + Number(ct.premium).toLocaleString("fr-FR") + " €" : "") +
          (ct.start_date ? "<br>Début : " + new Date(ct.start_date).toLocaleDateString("fr-FR") : "") +
          "</li>";
      });
    }
    h += "</ul></div>";
    return h;
  }

  function sectionClaims(list) {
    var h = '<div class="prof-card"><h2>Sinistres</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun sinistre déclaré</li>";
    else {
      list.forEach(function (cl) {
        h +=
          "<li><strong>" +
          esc(cl.claim_type || "Sinistre") +
          "</strong> — " +
          esc(cl.status) +
          (cl.claim_date ? " · " + new Date(cl.claim_date).toLocaleDateString("fr-FR") : "") +
          (cl.amount != null ? " · " + Number(cl.amount).toLocaleString("fr-FR") + " €" : "") +
          "</li>";
      });
    }
    h += '</ul><p style="margin:12px 0 0"><a href="claim-declare.html">Déclarer un sinistre →</a></p></div>';
    return h;
  }

  function sectionActivity(list) {
    var h = '<div class="prof-card"><h2>Activité récente</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucune activité récente</li>";
    else {
      list.forEach(function (a) {
        h +=
          "<li><strong>" +
          esc(a.title || a.activity_type || "Activité") +
          "</strong>" +
          (a.body ? " — " + esc(a.body) : "") +
          " · " +
          new Date(a.created_at).toLocaleDateString("fr-FR") +
          "</li>";
      });
    }
    h += "</div>";
    return h;
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
      document.getElementById("profLoading").classList.add("hidden");
      if (!res.ok) {
        var err = document.getElementById("profError");
        err.textContent = (res.error || "Erreur de chargement") + " ";
        err.innerHTML =
          esc(res.error || "Erreur de chargement") +
          ' <button type="button" id="profRetry" style="margin-left:8px;padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer">Réessayer</button>';
        err.classList.remove("hidden");
        document.getElementById("profRetry").onclick = function () {
          location.reload();
        };
        return;
      }
      localStorage.setItem(EMAIL_KEY, email);
      localStorage.setItem("lo_ext_profile", JSON.stringify(res.profile));
      render(res);
    })
    .catch(function () {
      document.getElementById("profLoading").classList.add("hidden");
      var err = document.getElementById("profError");
      err.textContent = "Erreur réseau — réessayez.";
      err.classList.remove("hidden");
    });
})();
