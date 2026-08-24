/**
 * Édition admin du questionnaire — sync fiche interlocuteur.
 */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function allRows(dossier) {
    var rows = [];
    if (!dossier) return rows;
    ["perso", "pro", "projet"].forEach(function (section) {
      (dossier[section] || []).forEach(function (r) {
        rows.push({ section: section, key: r.key, label: r.label, value: r.value });
      });
    });
    var b = dossier.biens || {};
    ["vehicules", "immobilier", "autres"].forEach(function (sub) {
      (b[sub] || []).forEach(function (r) {
        rows.push({ section: "biens." + sub, key: r.key, label: r.label, value: r.value });
      });
    });
    return rows;
  }

  function sellerQuickKeys() {
    var D = global.InterlocuteurDossier;
    return (D && D.SELLER_QUICK_EDIT_KEYS) || ["sellerName", "sellerPhone", "sellerEmail", "sellerAgency"];
  }

  function sellerLabel(key) {
    var D = global.InterlocuteurDossier;
    if (D && D.LABELS && D.LABELS[key]) return D.LABELS[key];
    if (D && typeof D.labelOf === "function") return D.labelOf(key);
    return key;
  }

  function renderSellerQuickEdit(dossier, opts) {
    opts = opts || {};
    var p = (dossier && dossier.raw) || opts.payload || {};
    var html =
      '<section class="int-card int-card-seller int-seller-quick-edit" data-int-seller-quick-edit>' +
      "<h3>Annonce / vendeur</h3>" +
      '<p class="int-seller-quick-lead">Corrigez le nom, le téléphone et les coordonnées visibles sur l’annonce.</p>' +
      '<div class="int-seller-quick-fields">';
    sellerQuickKeys().forEach(function (key) {
      var val = p[key] != null ? String(p[key]) : "";
      html +=
        '<label class="int-edit-label">' +
        esc(sellerLabel(key)) +
        '<input type="text" data-int-field="' +
        esc(key) +
        '" value="' +
        esc(val) +
        '" /></label>';
    });
    html +=
      "</div>" +
      '<div class="int-edit-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" data-int-save-seller>Enregistrer vendeur</button>' +
      '<span class="int-edit-status" data-int-seller-status hidden role="status"></span>' +
      "</div></section>";
    return html;
  }

  function bindSellerQuickEdit(mount, opts) {
    if (!mount || mount.dataset.sellerBound) return;
    mount.dataset.sellerBound = "1";
    var btn = mount.querySelector("[data-int-save-seller]");
    var statusEl = mount.querySelector("[data-int-seller-status]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      btn.disabled = true;
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Enregistrement…";
      }
      save(opts, collectFromMount(mount))
        .then(function (res) {
          if (statusEl) {
            statusEl.textContent = res.syncedInterlocuteur
              ? "Enregistré — fiche interlocuteur à jour"
              : "Enregistré";
          }
          if (typeof opts.onSaved === "function") opts.onSaved(res);
        })
        .catch(function (err) {
          if (statusEl) statusEl.textContent = err.message || "Erreur";
          alert(err.message || "Erreur");
        })
        .then(function () {
          btn.disabled = false;
        });
    });
  }

  function mountSellerQuickEdit(container, dossier, opts) {
    if (!container) return null;
    container.insertAdjacentHTML("afterbegin", renderSellerQuickEdit(dossier, opts));
    var block = container.querySelector("[data-int-seller-quick-edit]");
    if (block) bindSellerQuickEdit(block, opts);
    return block;
  }

  function renderEditable(dossier, opts) {
    opts = opts || {};
    var payload = opts.payload || (dossier && dossier.raw) || {};
    var fieldComments = payload.adminFieldComments || {};
    var adminNotes = payload.adminQuestionnaireNotes || "";
    var rows = allRows(dossier);
    var sections = {
      perso: "Info perso",
      pro: "Info pro",
      projet: "Projet / financement",
      "biens.vehicules": "Véhicule / mobilier",
      "biens.immobilier": "Maison, appartement, immeuble",
      "biens.autres": "Autres éléments utiles",
    };
    var html =
      '<div class="int-dossier-edit" data-int-dossier-edit>' +
      '<p class="int-dossier-lead"><strong>Admin</strong> — modifiez les réponses du questionnaire. Les changements sont recopiés sur la <strong>fiche interlocuteur</strong>.</p>' +
      '<label class="int-edit-global-note">Commentaire général sur le questionnaire<textarea rows="2" data-int-admin-notes placeholder="Ex. corrections au téléphone, précisions conseiller…">' +
      esc(adminNotes) +
      "</textarea></label>";

    var order = ["perso", "pro", "biens.vehicules", "biens.immobilier", "biens.autres", "projet"];
    order.forEach(function (sectionKey) {
      var sectionRows = rows.filter(function (r) {
        return r.section === sectionKey;
      });
      if (!sectionRows.length) return;
      html += '<section class="int-card int-edit-section"><h3>' + esc(sections[sectionKey] || sectionKey) + '</h3><div class="int-edit-rows">';
      sectionRows.forEach(function (r) {
        var comment = fieldComments[r.key] || "";
        html +=
          '<div class="int-edit-row">' +
          '<label class="int-edit-label">' +
          esc(r.label) +
          '<input type="text" data-int-field="' +
          esc(r.key) +
          '" value="' +
          esc(r.value) +
          '" /></label>' +
          '<input type="text" class="int-field-comment" data-int-comment="' +
          esc(r.key) +
          '" placeholder="Commentaire admin (optionnel)" value="' +
          esc(comment) +
          '" /></div>';
      });
      html += "</div></section>";
    });

    html +=
      '<div class="int-edit-actions">' +
      '<button type="button" class="btn btn-primary" data-int-save-questionnaire>Enregistrer et sync fiche interlocuteur</button>' +
      '<span class="int-edit-status" data-int-edit-status hidden role="status"></span>' +
      "</div></div>";
    return html;
  }

  function collectFromMount(mount) {
    var payloadPatch = {};
    var fieldComments = {};
    mount.querySelectorAll("[data-int-field]").forEach(function (el) {
      var key = el.getAttribute("data-int-field");
      if (!key) return;
      payloadPatch[key] = el.value;
    });
    mount.querySelectorAll("[data-int-comment]").forEach(function (el) {
      var key = el.getAttribute("data-int-comment");
      if (!key || !String(el.value || "").trim()) return;
      fieldComments[key] = String(el.value).trim();
    });
    var notesEl = mount.querySelector("[data-int-admin-notes]");
    return {
      payloadPatch: payloadPatch,
      fieldComments: fieldComments,
      adminQuestionnaireNotes: notesEl ? notesEl.value : "",
    };
  }

  function save(opts, data) {
    opts = opts || {};
    var apiMode = opts.api || "crm";
    var headers = { "Content-Type": "application/json" };
    if (apiMode === "crm") {
      var token = localStorage.getItem("lo_token");
      if (!token) return Promise.reject(new Error("Session CRM requise"));
      headers.Authorization = "Bearer " + token;
    } else if (opts.authHeaders) {
      Object.assign(headers, opts.authHeaders());
    }
    var body = Object.assign(
      {
        leadId: opts.leadId,
        contactId: opts.contactId || null,
        syncContact: true,
      },
      data
    );
    var url =
      apiMode === "dashboard"
        ? "/api/dashboard/lead-update"
        : "/api/crm/lead-questionnaire?leadId=" + encodeURIComponent(opts.leadId || "");
    var method = apiMode === "dashboard" ? "POST" : "PATCH";
    if (apiMode === "dashboard") {
      body.leadId = opts.leadId;
    }
    return fetch(url, { method: method, headers: headers, body: JSON.stringify(body) }).then(function (r) {
      return r.json().then(function (json) {
        if (!r.ok || json.error) throw new Error(json.error || "Enregistrement impossible");
        return json;
      });
    });
  }

  function bindEditable(mount, opts) {
    if (!mount || mount.dataset.intEditBound) return;
    mount.dataset.intEditBound = "1";
    var saveBtn = mount.querySelector("[data-int-save-questionnaire]");
    var statusEl = mount.querySelector("[data-int-edit-status]");
    if (!saveBtn) return;
    saveBtn.addEventListener("click", function () {
      saveBtn.disabled = true;
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Enregistrement…";
      }
      save(opts, collectFromMount(mount))
        .then(function (res) {
          if (statusEl) statusEl.textContent = res.syncedInterlocuteur ? "Enregistré — fiche interlocuteur à jour" : "Enregistré";
          if (typeof opts.onSaved === "function") opts.onSaved(res);
        })
        .catch(function (err) {
          if (statusEl) statusEl.textContent = err.message || "Erreur";
          alert(err.message || "Erreur");
        })
        .then(function () {
          saveBtn.disabled = false;
        });
    });
  }

  function mountEditable(container, dossier, opts) {
    if (!container) return;
    container.innerHTML = renderEditable(dossier, opts);
    bindEditable(container.querySelector("[data-int-dossier-edit]") || container, opts);
  }

  function canEditQuestionnaire() {
    var g = global.CrmAdminGuard;
    if (g && typeof g.isSiteAdmin === "function" && g.isSiteAdmin()) return true;
    try {
      var u = JSON.parse(localStorage.getItem("lo_user") || "{}");
      if (u.role === "admin") return true;
      return (u.crmRole || u.crm_role) === "admin";
    } catch (e) {
      return false;
    }
  }

  global.InterlocuteurDossierEdit = {
    renderEditable: renderEditable,
    renderSellerQuickEdit: renderSellerQuickEdit,
    bindSellerQuickEdit: bindSellerQuickEdit,
    mountSellerQuickEdit: mountSellerQuickEdit,
    bindEditable: bindEditable,
    mountEditable: mountEditable,
    collectFromMount: collectFromMount,
    allRows: allRows,
    canEditQuestionnaire: canEditQuestionnaire,
  };
})(typeof window !== "undefined" ? window : global);
