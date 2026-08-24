/**
 * Procédure TRACFIN — pièces obligatoires si mandat de vente souhaité.
 * Les documents peuvent être en « En attente » : engagement + relance après dépôt.
 */
(function (global) {
  var MAX_BYTES = 12 * 1024 * 1024;
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";

  var TRACFIN_DOCS = [
    {
      type: "tracfin_identite",
      uploadType: "identite",
      groupId: "identite",
      label: "Pièce d'identité (en cours de validité)",
    },
    {
      type: "tracfin_domicile",
      uploadType: "domicile",
      groupId: "identite",
      label: "Justificatif de domicile (moins de 3 mois)",
    },
    {
      type: "tracfin_activite",
      uploadType: "attestation_employeur",
      groupId: "identite",
      label: "Justificatif d'activités professionnelles",
    },
    {
      type: "tracfin_propriete",
      uploadType: "titre_propriete",
      groupId: "titre",
      label: "Justificatif de propriété / titularité",
    },
  ];

  var queue = [];
  var session = { email: null, phone: null, contactId: null, leadId: null };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function mandateChecked(root) {
    var chk = qs("[data-sell-wants-mandate]", root || document);
    return !!(chk && chk.checked);
  }

  function panelRoot(root) {
    return qs("[data-tracfin-mandate-panel]", root || document);
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function mimeForFile(file) {
    if (file.type) return file.type;
    if (/\.pdf$/i.test(file.name)) return "application/pdf";
    if (/\.png$/i.test(file.name)) return "image/png";
    return "image/jpeg";
  }

  function isAllowedFile(file) {
    var mime = mimeForFile(file);
    if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png") return true;
    return /\.(pdf|jpe?g|png)$/i.test(file.name || "");
  }

  function renderRow(doc) {
    return (
      '<tr class="immo-tracfin-row" data-tracfin-row="' +
      esc(doc.type) +
      '">' +
      "<td>" +
      esc(doc.label) +
      "</td>" +
      '<td><span class="immo-tracfin-status" data-tracfin-status>En attente</span></td>' +
      "<td>" +
      '<label class="immo-tracfin-add">' +
      '<input type="file" accept="' +
      ACCEPT +
      '" hidden data-tracfin-input data-doc-type="' +
      esc(doc.uploadType) +
      '" data-tracfin-type="' +
      esc(doc.type) +
      '" />' +
      "+ Ajouter des fichiers</label>" +
      '<span class="immo-tracfin-file" data-tracfin-file hidden></span>' +
      "</td></tr>"
    );
  }

  function renderPanelHtml() {
    return (
      '<section class="immo-tracfin" data-tracfin-mandate-panel hidden>' +
      '<h4 class="immo-tracfin-title">Procédure TRACFIN</h4>' +
      '<div class="immo-tracfin-alert" role="alert">' +
      "<strong>Attention — Dossier incomplet = publication impossible</strong>" +
      "<p>À compter du <strong>15 septembre 2026</strong>, aucune publication ne sera autorisée sans dossier conforme. Même si vous n'avez pas toutes les pièces sous la main, indiquez-les ci-dessous : nous vous les demanderons et vous pourrez les envoyer ensuite.</p>" +
      "</div>" +
      '<label class="field-check full immo-tracfin-attest">' +
      '<input type="checkbox" name="tracfinAttestation" value="1" data-tracfin-attestation />' +
      "<span>J'atteste m'engager à transmettre les pièces suivantes concernant le(s) propriétaire(s) — dès que possible si elles ne sont pas jointes aujourd'hui.</span>" +
      "</label>" +
      '<div class="immo-tracfin-table-wrap">' +
      '<table class="immo-tracfin-table">' +
      "<thead><tr><th>Document</th><th>Statut</th><th>Fichier</th></tr></thead>" +
      "<tbody>" +
      TRACFIN_DOCS.map(renderRow).join("") +
      "</tbody></table></div>" +
      '<fieldset class="immo-tracfin-risk">' +
      "<legend>Au vu de ces éléments, le niveau de risque est considéré comme :</legend>" +
      '<label class="immo-tracfin-risk-opt"><input type="radio" name="tracfinRiskLevel" value="faible" checked data-tracfin-risk /> faible</label>' +
      '<label class="immo-tracfin-risk-opt"><input type="radio" name="tracfinRiskLevel" value="moyen" data-tracfin-risk /> moyen <small>(alerte référent TRACFIN)</small></label>' +
      '<label class="immo-tracfin-risk-opt"><input type="radio" name="tracfinRiskLevel" value="fort" data-tracfin-risk /> fort <small>(signalement si nécessaire)</small></label>' +
      "</fieldset></section>"
    );
  }

  function mountPanel(container) {
    if (!container || container.querySelector("[data-tracfin-mandate-panel]")) return;
    container.insertAdjacentHTML("beforeend", renderPanelHtml());
    bindPanel(container);
  }

  function setRowState(row, state, fileName) {
    if (!row) return;
    row.classList.remove("is-queued", "is-done", "is-error");
    if (state) row.classList.add(state);
    var status = row.querySelector("[data-tracfin-status]");
    var fileEl = row.querySelector("[data-tracfin-file]");
    var addBtn = row.querySelector(".immo-tracfin-add");
    if (status) {
      status.textContent = state === "is-done" ? "Reçu" : state === "is-error" ? "Erreur" : "En attente";
      status.classList.toggle("is-done", state === "is-done");
      status.classList.toggle("is-pending", state !== "is-done");
    }
    if (fileName && fileEl) {
      fileEl.hidden = false;
      fileEl.textContent = fileName;
    }
    if (addBtn && state === "is-done") addBtn.textContent = "Fichier déposé";
  }

  function addFile(file, tracfinType, uploadType, groupId, panel) {
    if (!isAllowedFile(file)) {
      alert("Format refusé — déposez uniquement PDF, JPG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }
    queue = queue.filter(function (q) {
      return q.tracfinType !== tracfinType;
    });
    queue.push({
      file: file,
      fileName: file.name,
      tracfinType: tracfinType,
      documentType: uploadType,
      groupId: groupId,
      mimeType: mimeForFile(file),
      status: "queued",
    });
    var row = panel.querySelector('[data-tracfin-row="' + tracfinType + '"]');
    setRowState(row, "is-queued", file.name);
  }

  function bindPanel(container) {
    var panel = panelRoot(container);
    if (!panel || panel.dataset.tracfinBound) return;
    panel.dataset.tracfinBound = "1";
    panel.addEventListener("change", function (e) {
      var input = e.target.closest("[data-tracfin-input]");
      if (!input || !panel.contains(input) || !input.files || !input.files[0]) return;
      addFile(
        input.files[0],
        input.getAttribute("data-tracfin-type") || "",
        input.getAttribute("data-doc-type") || "autre_doc",
        TRACFIN_DOCS.find(function (d) {
          return d.type === input.getAttribute("data-tracfin-type");
        })
          ? TRACFIN_DOCS.find(function (d) {
              return d.type === input.getAttribute("data-tracfin-type");
            }).groupId
          : "identite",
        panel
      );
      input.value = "";
    });
  }

  function syncVisibility(root) {
    root = root || document;
    var mandatePanel = qs("[data-client-mandate-panel]", root);
    if (!mandatePanel) return;
    mountPanel(mandatePanel.querySelector("[data-sell-mandate-fields]") || mandatePanel);
    var panel = panelRoot(root);
    if (!panel) return;
    var open = mandateChecked(root);
    panel.hidden = !open;
    panel.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.disabled = !open;
    });
  }

  function collectStatuses(panel) {
    panel = panel || panelRoot();
    if (!panel) return [];
    return TRACFIN_DOCS.map(function (doc) {
      var row = panel.querySelector('[data-tracfin-row="' + doc.type + '"]');
      var queued = queue.some(function (q) {
        return q.tracfinType === doc.type && (q.status === "queued" || q.status === "uploading");
      });
      var done = queue.some(function (q) {
        return q.tracfinType === doc.type && q.status === "done";
      });
      var fileEl = row && row.querySelector("[data-tracfin-file]");
      return {
        type: doc.type,
        uploadType: doc.uploadType,
        label: doc.label,
        status: done ? "received" : queued ? "queued" : "pending",
        fileName: fileEl && !fileEl.hidden ? fileEl.textContent : "",
      };
    });
  }

  function validate(root) {
    root = root || document;
    if (!mandateChecked(root)) {
      return { ok: true, blocking: [], recommended: [], docs: [] };
    }
    var panel = panelRoot(root);
    var blocking = [];
    var recommended = [];
    var attest = qs("[data-tracfin-attestation]", root);
    var risk = root.querySelector("[name='tracfinRiskLevel']:checked");

    if (!attest || !attest.checked) {
      recommended.push({
        id: "tracfinAttestation",
        label: "Engagement TRACFIN — cocher l'attestation (obligatoire pour publication, pas pour envoyer le dossier)",
        el: attest || panel,
        section: "Mandat / TRACFIN",
      });
    }
    if (!risk) {
      recommended.push({
        id: "tracfinRisk",
        label: "Niveau de risque TRACFIN (faible, moyen ou fort)",
        el: panel && panel.querySelector("[data-tracfin-risk]"),
        section: "Mandat / TRACFIN",
      });
    }

    var docs = collectStatuses(panel);
    docs.forEach(function (doc) {
      if (doc.status === "pending") {
        recommended.push({
          id: "tracfin_" + doc.type,
          label: doc.label + " — à transmettre (obligatoire pour publication)",
          el: panel && panel.querySelector('[data-tracfin-row="' + doc.type + '"]'),
          section: "TRACFIN",
        });
      }
    });

    return {
      ok: blocking.length === 0,
      blocking: blocking,
      recommended: recommended,
      docs: docs,
      requiresFollowUp: docs.some(function (d) {
        return d.status !== "received";
      }),
    };
  }

  function setSession(next) {
    Object.assign(session, next || {});
  }

  function uploadAll() {
    var pending = queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!session.email && !session.phone && !session.contactId) {
      return Promise.resolve({
        uploaded: [],
        errors: [{ error: "Coordonnées requises pour upload TRACFIN" }],
      });
    }

    return pending.reduce(
      function (chain, item) {
        return chain.then(function (acc) {
          item.status = "uploading";
          return readFileAsBase64(item.file)
            .then(function (dataUrl) {
              return fetch("/api/external/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                  email: session.email,
                  phone: session.phone,
                  contactId: session.contactId,
                  leadId: session.leadId,
                  fileName: item.fileName,
                  documentType: item.documentType,
                  documentGroup: item.groupId,
                  mimeType: item.mimeType,
                  fileBase64: dataUrl,
                  vertical: "vendeur-immo",
                  need: "vendeur-immo",
                  source: "immo_tracfin_mandate",
                  perTypeFolder: true,
                  description: "TRACFIN mandat — " + item.tracfinType,
                }),
              });
            })
            .then(function (r) {
              return r.json().then(function (data) {
                return { ok: r.ok, data: data };
              });
            })
            .then(function (res) {
              if (!res.ok || !res.data || !res.data.ok) {
                throw new Error((res.data && res.data.error) || "Upload impossible");
              }
              item.status = "done";
              var row = document.querySelector('[data-tracfin-row="' + item.tracfinType + '"]');
              setRowState(row, "is-done", item.fileName);
              acc.uploaded.push(item);
              return acc;
            })
            .catch(function (err) {
              item.status = "error";
              item.error = err.message || "Erreur";
              var row = document.querySelector('[data-tracfin-row="' + item.tracfinType + '"]');
              setRowState(row, "is-error", item.fileName);
              acc.errors.push({ item: item, error: item.error });
              return acc;
            });
        });
      },
      Promise.resolve({ uploaded: [], errors: [] })
    ).then(function (result) {
      queue = queue.filter(function (q) {
        return q.status !== "done";
      });
      return result;
    });
  }

  function boot() {
    document.querySelectorAll("[data-client-mandate-panel]").forEach(function (panel) {
      mountPanel(panel.querySelector("[data-sell-mandate-fields]") || panel);
    });
    syncVisibility();
    document.addEventListener("change", function (e) {
      if (e.target && e.target.matches("[data-sell-wants-mandate]")) {
        syncVisibility();
      }
    });
  }

  global.ImmoTracfinMandate = {
    TRACFIN_DOCS: TRACFIN_DOCS,
    mountPanel: mountPanel,
    syncVisibility: syncVisibility,
    mandateChecked: mandateChecked,
    validate: validate,
    collectStatuses: collectStatuses,
    setSession: setSession,
    uploadAll: uploadAll,
    getQueue: function () {
      return queue.slice();
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
