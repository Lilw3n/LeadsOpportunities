(function () {
  var TOKEN_KEY = "lo_ext_token";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function authHeaders() {
    return {
      Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      "Content-Type": "application/json",
    };
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }

  document.getElementById("btnLogout").onclick = function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("lo_client_email");
    localStorage.removeItem("lo_ext_profile");
    location.href = "./login.html";
  };

  function statBox(n, label) {
    return '<div class="prof-stat"><strong>' + esc(String(n)) + "</strong><span>" + esc(label) + "</span></div>";
  }

  function sectionVehicles(list) {
    var h = '<div class="prof-card"><h2>Mes véhicules</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun véhicule enregistré</li>";
    else {
      list.forEach(function (v) {
        h += "<li><strong>" + esc(v.registration || "Sans immat.") + "</strong> — " + esc([v.brand, v.model, v.year].filter(Boolean).join(" ")) + " · " + esc(v.status || v.vehicle_type || "") + "</li>";
      });
    }
    h += '</ul><p style="margin:12px 0 0"><a href="devis-wizard.html" class="btn" style="display:inline-block;padding:8px 14px;background:#0d9488;color:#fff;border-radius:8px;text-decoration:none;font-size:.85rem">+ Ajouter un véhicule</a> · <a href="upload-document.html">Carte grise</a></p></div>';
    return h;
  }

  function sectionContracts(list) {
    var h = '<div class="prof-card"><h2>Mes contrats</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun contrat</li>";
    else {
      list.forEach(function (ct) {
        h += "<li><strong>" + esc(ct.policy_number || ct.contract_type || "Contrat") + "</strong><br>Police N° " + esc(ct.policy_number || "—") + " · " + esc(ct.insurer || "") + " · " + esc(ct.status) + (ct.premium != null ? "<br>Prime : " + Number(ct.premium).toLocaleString("fr-FR") + " €" : "") + (ct.start_date ? "<br>Début : " + new Date(ct.start_date).toLocaleDateString("fr-FR") : "") + "</li>";
      });
    }
    h += "</ul></div>";
    return h;
  }

  function sectionVisits(list) {
    var h = '<div class="prof-card"><h2>Mes visites notées</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucune visite notée</li>";
    else {
      list.forEach(function (v) {
        h += "<li><strong>" + esc(v.title || "Visite") + "</strong> — " + esc(String(v.rating || "—")) + "/5" + (v.eventDate ? " · " + new Date(v.eventDate).toLocaleDateString("fr-FR") : "") + (v.propertyRef ? "<br>Réf. : " + esc(v.propertyRef) : "") + (v.comments ? "<br>" + esc(v.comments) : "") + "</li>";
      });
    }
    h += '</ul><p style="margin:12px 0 0"><a href="visits.html">Ouvrir l’espace visites →</a></p></div>';
    return h;
  }

  function sectionClaims(list) {
    var h = '<div class="prof-card"><h2>Sinistres</h2><ul class="prof-list">';
    if (!list || !list.length) h += "<li>Aucun sinistre déclaré</li>";
    else {
      list.forEach(function (cl) {
        h += "<li><strong>" + esc(cl.claim_type || "Sinistre") + "</strong> — " + esc(cl.status) + (cl.claim_date ? " · " + new Date(cl.claim_date).toLocaleDateString("fr-FR") : "") + (cl.amount != null ? " · " + Number(cl.amount).toLocaleString("fr-FR") + " €" : "") + "</li>";
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
        h += "<li><strong>" + esc(a.title || a.activity_type || "Activité") + "</strong>" + (a.body ? " — " + esc(a.body) : "") + " · " + new Date(a.created_at).toLocaleDateString("fr-FR") + "</li>";
      });
    }
    h += "</ul></div>";
    return h;
  }

  function saveProfile() {
    fetch("/api/external/profile", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        firstName: document.getElementById("editFirstName").value,
        lastName: document.getElementById("editLastName").value,
        fullName: (document.getElementById("editFirstName").value + " " + document.getElementById("editLastName").value).trim(),
        phone: document.getElementById("editPhone").value,
        company: document.getElementById("editCompany").value,
        preferredCity: document.getElementById("editPreferredCity").value,
        budget: document.getElementById("editBudget").value,
        acquisitionStage: document.getElementById("editStage").value,
        portalNotes: document.getElementById("editPortalNotes").value,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        location.reload();
      })
      .catch(function (err) {
        alert(String(err.message || err));
      });
  }

  function render(data) {
    var p = data.profile || {};
    var portal = p.portal || {};
    var st = data.stats || {};
    var name = ((p.firstName || "") + " " + (p.lastName || "")).trim() || p.email;
    document.getElementById("profTitle").textContent = name;

    var html =
      '<div class="prof-card"><h2>Actions rapides</h2><div class="prof-pills">' +
      '<a class="prof-pill" href="devis-wizard.html">✨ Demander un devis</a>' +
      '<a class="prof-pill" href="visits.html">🏡 Mes visites</a>' +
      '<a class="prof-pill" href="claim-declare.html">📣 Déclarer un sinistre</a>' +
      '<a class="prof-pill" href="documents.html">📋 Documents</a>' +
      '<a class="prof-pill" href="mailto:courtier972@gmail.com">💬 Contacter un conseiller</a>' +
      '<a class="prof-pill" href="search.html">🔍 Recherche</a>' +
      "</div></div>" +
      '<div class="prof-card"><h2>Informations personnelles</h2>' +
      "<p><strong>" + esc(name) + "</strong><br>" + esc(p.email) +
      (p.phone ? "<br>Téléphone : " + esc(p.phone) : "") +
      (p.company ? "<br>Entreprise : " + esc(p.company) : "") +
      (p.portalRole ? "<br>Rôle portail : " + esc(p.portalRole) : "") +
      (portal.preferredCity ? "<br>Secteur : " + esc(portal.preferredCity) : "") +
      (portal.budget ? "<br>Budget : " + esc(portal.budget) : "") +
      (portal.acquisitionStage ? "<br>Étape : " + esc(portal.acquisitionStage) : "") +
      (p.status ? "<br>Statut : " + esc(p.status) : "") +
      '</p><button type="button" id="btnEditProf" class="btn btn-ghost btn-sm" style="margin-top:8px">Modifier</button>' +
      '<div id="editProfForm" class="hidden" style="margin-top:12px">' +
      '<label style="display:block;margin-bottom:8px">Prénom<input id="editFirstName" value="' + esc(p.firstName || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Nom<input id="editLastName" value="' + esc(p.lastName || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Téléphone<input id="editPhone" value="' + esc(p.phone || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Entreprise<input id="editCompany" value="' + esc(p.company || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Ville / secteur<input id="editPreferredCity" value="' + esc(portal.preferredCity || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Budget<input id="editBudget" value="' + esc(portal.budget || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Étape du projet<input id="editStage" value="' + esc(portal.acquisitionStage || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<label style="display:block;margin-bottom:8px">Notes portail<input id="editPortalNotes" value="' + esc(portal.notes || "") + '" style="width:100%;padding:8px;margin-top:4px;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<button type="button" id="btnSaveProf" class="btn btn-primary btn-sm">Enregistrer</button></div>' +
      '<p class="prof-meta">Membre depuis ' + new Date(p.memberSince).toLocaleDateString("fr-FR") + "</p></div>" +
      '<div class="prof-card"><h2>Statistiques</h2><div class="prof-stats">' +
      statBox(st.contractsActive != null ? st.contractsActive : 0, "Contrats actifs") +
      statBox(st.vehiclesTotal || 0, "Véhicules") +
      statBox(st.claimsTotal || 0, "Sinistres") +
      statBox(st.quotesTotal || 0, "Devis") +
      statBox(st.requestsTotal || 0, "Demandes") +
      statBox(st.visitsTotal || 0, "Visites") +
      "</div></div>";

    html += '<div class="prof-grid2">' + sectionVehicles(data.vehicles) + sectionContracts(data.contracts) + "</div>";
    html += sectionVisits(data.visits);
    html += sectionClaims(data.claims);
    html += sectionActivity(data.activities);
    html += '<p style="margin-top:8px;font-size:.9rem"><a href="dashboard.html">Retour mon espace</a> · <a href="visits.html">Mes visites</a></p>';

    document.getElementById("profContent").innerHTML = html;
    document.getElementById("profContent").classList.remove("hidden");

    var btnEdit = document.getElementById("btnEditProf");
    var editForm = document.getElementById("editProfForm");
    if (btnEdit && editForm) {
      btnEdit.onclick = function () {
        editForm.classList.toggle("hidden");
      };
    }
    var btnSave = document.getElementById("btnSaveProf");
    if (btnSave) btnSave.onclick = saveProfile;
  }

  fetch("/api/external/profile", {
    method: "GET",
    headers: authHeaders(),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("profLoading").classList.add("hidden");
      if (!res.ok) throw new Error(res.error || "Erreur de chargement");
      localStorage.setItem("lo_client_email", res.profile.email || "");
      localStorage.setItem("lo_ext_profile", JSON.stringify(res.profile));
      render(res);
    })
    .catch(function (err) {
      document.getElementById("profLoading").classList.add("hidden");
      var box = document.getElementById("profError");
      box.textContent = String(err.message || err);
      box.classList.remove("hidden");
    });
})();
