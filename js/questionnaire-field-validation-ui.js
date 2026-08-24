/**
 * UI CRM — validation champ par champ (copie vendeur vs admin).
 */
(function (global) {
  var V = function () {
    return global.QuestionnaireFieldValidation;
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pendingCount(payload) {
    var lib = V();
    if (!lib) return 0;
    return lib.countPending((payload && payload.fieldValidation) || {});
  }

  function renderPanel(payload) {
    var lib = V();
    if (!lib || !payload) return "";
    var pending = lib.listPendingFields(payload);
    if (!pending.length) return "";

    var rows = pending
      .map(function (entry) {
        var field = entry.field;
        return (
          '<tr class="qfv-row" data-qfv-field="' +
          esc(field) +
          '">' +
          '<td class="qfv-label">' +
          esc(entry.label || field) +
          "</td>" +
          '<td class="qfv-choice">' +
          '<label class="qfv-pick"><input type="radio" name="qfv-' +
          esc(field) +
          '" value="admin" checked /> Admin<br /><span class="qfv-val">' +
          esc(entry.adminValue || "—") +
          "</span></label>" +
          "</td>" +
          '<td class="qfv-choice">' +
          '<label class="qfv-pick"><input type="radio" name="qfv-' +
          esc(field) +
          '" value="vendor" /> Vendeur / prospect<br /><span class="qfv-val qfv-val--vendor">' +
          esc(entry.vendorValue || "—") +
          "</span></label>" +
          "</td>" +
          '<td class="qfv-choice">' +
          '<label class="qfv-pick"><input type="radio" name="qfv-' +
          esc(field) +
          '" value="custom" /> Autre</label>' +
          '<input type="text" class="qfv-custom" data-qfv-custom="' +
          esc(field) +
          '" placeholder="Valeur personnalisée" disabled />' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var submittedAt =
      payload.vendorSubmission && payload.vendorSubmission.submittedAt
        ? new Date(payload.vendorSubmission.submittedAt).toLocaleString("fr-FR")
        : "";

    return (
      '<section class="qfv-panel" data-qfv-panel>' +
      '<div class="qfv-panel__head">' +
      "<div>" +
      "<strong>Validation des différences</strong> " +
      '<span class="qfv-badge">' +
      pending.length +
      " champ(s)</span>" +
      (submittedAt ? '<p class="qfv-meta">Copie vendeur enregistrée le ' + esc(submittedAt) + "</p>" : "") +
      "</div>" +
      '<div class="qfv-actions">' +
      '<button type="button" class="btn btn-soft btn-sm" data-qfv-pick-all="admin">Tout garder admin</button> ' +
      '<button type="button" class="btn btn-soft btn-sm" data-qfv-pick-all="vendor">Tout prendre vendeur</button> ' +
      '<button type="button" class="btn btn-primary btn-sm" data-qfv-apply>Valider la sélection</button>' +
      "</div>" +
      "</div>" +
      '<p class="qfv-hint">Une copie vendeur a été enregistrée. Choisissez, pour chaque champ, la valeur à retenir sur la fiche.</p>' +
      '<div class="qfv-table-wrap"><table class="qfv-table"><thead><tr>' +
      "<th>Champ</th><th>Valeur admin / fiche</th><th>Valeur vendeur / prospect</th><th>Autre</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>" +
      '<p class="qfv-status" data-qfv-status hidden></p>' +
      "</section>"
    );
  }

  function collectChoices(root) {
    var choices = {};
    var customValues = {};
    root.querySelectorAll("[data-qfv-field]").forEach(function (row) {
      var field = row.getAttribute("data-qfv-field");
      var picked = row.querySelector('input[name="qfv-' + field + '"]:checked');
      if (!picked) return;
      choices[field] = picked.value;
      if (picked.value === "custom") {
        var custom = row.querySelector("[data-qfv-custom]");
        customValues[field] = custom ? custom.value : "";
      }
    });
    return { choices: choices, customValues: customValues };
  }

  function bindPanel(root, ctx, opts) {
    opts = opts || {};
    if (!root) return;

    root.querySelectorAll(".qfv-row").forEach(function (row) {
      var field = row.getAttribute("data-qfv-field");
      row.querySelectorAll('input[name="qfv-' + field + '"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
          var custom = row.querySelector("[data-qfv-custom]");
          if (custom) custom.disabled = radio.value !== "custom" || !radio.checked;
        });
      });
    });

    root.querySelectorAll("[data-qfv-pick-all]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pick = btn.getAttribute("data-qfv-pick-all");
        root.querySelectorAll('.qfv-row input[type="radio"][value="' + pick + '"]').forEach(function (r) {
          r.checked = true;
          r.dispatchEvent(new Event("change"));
        });
      });
    });

    var applyBtn = root.querySelector("[data-qfv-apply]");
    var statusEl = root.querySelector("[data-qfv-status]");
    if (!applyBtn) return;

    applyBtn.addEventListener("click", function () {
      var collected = collectChoices(root);
      if (!Object.keys(collected.choices).length) return;
      applyBtn.disabled = true;
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = "Enregistrement…";
        statusEl.className = "qfv-status";
      }

      var headers = Object.assign({ "Content-Type": "application/json" }, (opts.authHeaders && opts.authHeaders()) || opts.authHeaders || {});
      fetch("/api/crm/lead-questionnaire-validate", {
        method: "POST",
        headers: headers,
        credentials: "same-origin",
        body: JSON.stringify({
          leadId: ctx.leadId,
          choices: collected.choices,
          customValues: collected.customValues,
          syncContact: true,
        }),
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (res) {
          applyBtn.disabled = false;
          if (!res.ok || !res.data.ok) {
            if (statusEl) {
              statusEl.textContent = (res.data && res.data.error) || "Erreur lors de la validation";
              statusEl.className = "qfv-status qfv-status--err";
            }
            return;
          }
          if (ctx) ctx.payload = res.data.payload;
          if (typeof opts.onValidated === "function") opts.onValidated(res.data);
          if (statusEl) {
            statusEl.textContent =
              res.data.pendingCount > 0
                ? res.data.pendingCount + " champ(s) restant(s) à valider."
                : "Validation enregistrée — fiche interlocuteur synchronisée.";
            statusEl.className = "qfv-status qfv-status--ok";
          }
          if (res.data.pendingCount === 0 && root.parentNode) {
            var panel = root.querySelector("[data-qfv-panel]") || root;
            if (panel && panel.classList.contains("qfv-panel")) {
              setTimeout(function () {
                panel.remove();
              }, 1800);
            }
          } else {
            root.innerHTML = renderPanel(res.data.payload);
            bindPanel(root, ctx, opts);
          }
        })
        .catch(function (err) {
          applyBtn.disabled = false;
          if (statusEl) {
            statusEl.textContent = err.message || "Erreur réseau";
            statusEl.className = "qfv-status qfv-status--err";
          }
        });
    });
  }

  function mount(container, ctx, opts) {
    if (!container || !ctx || !ctx.payload) return false;
    var lib = V();
    if (!lib) return false;
    if (!pendingCount(ctx.payload)) return false;
    container.innerHTML = renderPanel(ctx.payload);
    bindPanel(container, ctx, opts || {});
    return true;
  }

  global.QuestionnaireFieldValidationUi = {
    mount: mount,
    renderPanel: renderPanel,
    pendingCount: pendingCount,
    bindPanel: bindPanel,
  };
})(typeof window !== "undefined" ? window : global);
