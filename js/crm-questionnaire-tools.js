/**
 * CRM — retour questionnaire, édition admin, dépôt pièces depuis la fiche / messagerie.
 */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function normalizeVertical(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");
  }

  function isImmoVertical(vertical) {
    var v = normalizeVertical(vertical);
    return v.indexOf("immo") >= 0 || v.indexOf("vendeur") >= 0 || v.indexOf("acheteur") >= 0;
  }

  function isVendeurImmo(vertical) {
    var v = normalizeVertical(vertical);
    return v.indexOf("vendeur") >= 0 && v.indexOf("immo") >= 0;
  }

  function defaultAuthHeaders() {
    try {
      var t = localStorage.getItem("lo_token");
      if (t) return { Authorization: "Bearer " + t };
    } catch (e) {}
    return {};
  }

  function buildResumeUrl(ctx) {
    ctx = ctx || {};
    var payload = ctx.payload || {};
    var vertical = ctx.vertical || payload.vertical || payload.need || "";
    var params = new URLSearchParams();
    if (ctx.leadId) params.set("leadId", ctx.leadId);
    if (ctx.contactId) params.set("contactId", ctx.contactId);
    if (ctx.email) params.set("email", ctx.email);
    if (ctx.phone) params.set("phone", ctx.phone);
    params.set("source", "crm_resume");
    params.set("reprise", "1");
    if (canEdit()) params.set("mode", "conseiller");

    var v = normalizeVertical(vertical);
    if (v.indexOf("vendeur") >= 0 && v.indexOf("acheteur") >= 0) {
      params.set("hat", "les_deux");
      return "./landings/acheteur-immo.html?" + params.toString() + "#deposer-bien";
    }
    if (isVendeurImmo(vertical) || v === "vendeur-immo") {
      params.set("hat", "vendeur");
      return "./landings/acheteur-immo.html?" + params.toString() + "#deposer-bien";
    }
    if (v.indexOf("acheteur") >= 0 || v.indexOf("recherche") >= 0) {
      params.set("hat", "acheteur");
      return "./landings/acheteur-immo.html?" + params.toString() + "#recherche";
    }
    var need = v || "questionnaire";
    params.set("need", need.replace(/^-+|-+$/g, "") || "questionnaire");
    return "./landings/questionnaire.html?" + params.toString();
  }

  function buildMailboxUrl(leadId) {
    var u = "./dashboard.html?section=mailbox&view=questionnaires";
    if (leadId) u += "&lead=" + encodeURIComponent(leadId);
    return u;
  }

  function canEdit() {
    var E = global.InterlocuteurDossierEdit;
    return !!(E && E.canEditQuestionnaire && E.canEditQuestionnaire());
  }

  function openUrl(url) {
    if (!url) return false;
    var win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) return true;
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  function authFetch(url, opts, authHeadersFn) {
    opts = opts || {};
    var headers = Object.assign({}, defaultAuthHeaders(), opts.headers || {});
    if (typeof authHeadersFn === "function") {
      headers = Object.assign(headers, authHeadersFn() || {});
    } else if (authHeadersFn && typeof authHeadersFn === "object") {
      headers = Object.assign(headers, authHeadersFn);
    }
    return fetch(url, Object.assign({}, opts, { headers: headers, credentials: "same-origin" })).then(function (r) {
      return r.json().then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    });
  }

  /**
   * Assure une fiche interlocuteur (contactId) pour Drive / dépôt de pièces.
   * opts.silent = true → crée sans confirmation (ex. envoi documents).
   */
  function ensureContactId(ctx, opts) {
    opts = opts || {};
    ctx = ctx || {};
    if (ctx.contactId) return Promise.resolve(ctx.contactId);
    if (!ctx.leadId) {
      return Promise.reject(new Error("Créez d’abord la fiche interlocuteur."));
    }
    if (!opts.silent) {
      var ok = window.confirm(
        "Aucune fiche interlocuteur pour ce lead.\n\nCréer la fiche maintenant ?"
      );
      if (!ok) return Promise.reject(new Error("cancelled"));
    }
    return authFetch(
      "/api/crm/lead-lifecycle",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote", leadId: ctx.leadId }),
      },
      opts.authHeaders
    ).then(function (res) {
      var data = res.data || {};
      if (!data.ok || !data.contactId) {
        throw new Error(data.error || "Impossible de créer la fiche interlocuteur");
      }
      ctx.contactId = data.contactId;
      if (typeof opts.onContactCreated === "function") opts.onContactCreated(data.contactId, data);
      return data.contactId;
    });
  }

  /**
   * Ouvre (ou crée) le dossier Google Drive du contact.
   * Sans fiche interlocuteur : propose la création via promote, puis ouvre Drive.
   */
  function openContactDrive(ctx, opts) {
    opts = opts || {};
    ctx = ctx || {};
    var btn = opts.button || null;
    var prev = btn ? btn.textContent : "";
    var authHeaders = opts.authHeaders;
    var propertyId = ctx.propertyId || null;

    function setBusy(label) {
      if (!btn) return;
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      if (label) btn.textContent = label;
    }
    function clearBusy() {
      if (!btn) return;
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      btn.textContent = prev || "Ouvrir Drive";
    }

    function fetchDrive(contactId) {
      var apiPath = "/api/crm/drive-folder?contactId=" + encodeURIComponent(contactId);
      if (propertyId) apiPath += "&propertyId=" + encodeURIComponent(propertyId);
      setBusy("Ouverture Drive…");
      return authFetch(apiPath, { method: "GET" }, authHeaders).then(function (res) {
        var data = res.data || {};
        var url = data.webViewLink || null;
        if (url) {
          openUrl(url);
          if (typeof opts.onOpened === "function") opts.onOpened(data);
          return data;
        }
        var msg =
          data.error ||
          "Impossible d'ouvrir le dossier Drive. Vérifiez la configuration Google Drive.";
        if (data.setupUrl && window.confirm(msg + "\n\nOuvrir la page de configuration Drive ?")) {
          openUrl(data.setupUrl);
        } else {
          window.alert(msg);
        }
        return data;
      });
    }

    setBusy(ctx.contactId ? "Ouverture Drive…" : "Création fiche…");
    return ensureContactId(ctx, {
      authHeaders: authHeaders,
      silent: false,
      onContactCreated: opts.onContactCreated,
    })
      .then(fetchDrive)
      .catch(function (err) {
        if (err && (err.message === "cancelled" || err.message === "no_contact")) return null;
        window.alert((err && err.message) || "Erreur réseau — Drive indisponible.");
        return null;
      })
      .finally(clearBusy);
  }

  function requestClientResumeLink(ctx, sendEmail) {
    ctx = ctx || {};
    return authFetch(
      "/api/crm/quest-resume-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: ctx.leadId || null,
          contactId: ctx.contactId || null,
          email: ctx.email || null,
          sendEmail: !!sendEmail,
        }),
      }
    ).then(function (res) {
      var data = res.data || {};
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Impossible de créer le lien client");
      }
      return data;
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  function renderToolbar(ctx, opts) {
    opts = opts || {};
    ctx = ctx || {};
    var resumeUrl = buildResumeUrl(ctx);
    var html =
      '<div class="crm-q-toolbar" data-crm-q-toolbar>' +
      '<div class="crm-q-toolbar__inner">' +
      "<strong>Questionnaire</strong>";
    if (opts.showEdit !== false && canEdit() && ctx.leadId) {
      html +=
        '<button type="button" class="btn btn-primary btn-sm" data-crm-q-toggle-edit>' +
        (opts.editing ? "Voir les réponses" : "Modifier les réponses") +
        "</button>";
    }
    html +=
      '<a class="btn btn-ghost btn-sm" href="' +
      esc(resumeUrl) +
      '" target="_blank" rel="noopener">' +
      (canEdit() ? "Reprendre le questionnaire prérempli" : "Ouvrir le parcours questionnaire") +
      "</a>";
    if (ctx.leadId || ctx.contactId) {
      html +=
        '<button type="button" class="btn btn-ghost btn-sm" data-crm-q-copy-link title="Lien personnel : le client confirme e-mail ou téléphone">Copier le lien client</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-crm-q-send-link title="Envoie le lien par e-mail au client">Envoyer le lien au client</button>';
    }
    if (opts.mailboxUrl) {
      html +=
        '<a class="btn btn-ghost btn-sm" href="' +
        esc(opts.mailboxUrl) +
        '">← Messagerie questionnaires</a>';
    }
    if (opts.showDrive !== false && (ctx.contactId || ctx.leadId)) {
      html +=
        '<button type="button" class="btn btn-primary btn-sm" data-crm-q-open-drive title="Ouvrir ou créer le dossier Google Drive">' +
        (ctx.contactId ? "Ouvrir Drive" : "Créer fiche + Drive") +
        "</button>";
    }
    if (opts.showUpload !== false) {
      html +=
        '<button type="button" class="btn btn-ghost btn-sm" data-crm-q-scroll-docs>Déposer des pièces</button>';
    }
    html += "</div></div>";
    return html;
  }

  function bindToolbar(container, handlers) {
    if (!container) return;
    handlers = handlers || {};
    var toggle = container.querySelector("[data-crm-q-toggle-edit]");
    if (toggle && handlers.onToggleEdit) {
      toggle.addEventListener("click", handlers.onToggleEdit);
    }
    var scrollDocs = container.querySelector("[data-crm-q-scroll-docs]");
    if (scrollDocs && handlers.onScrollDocs) {
      scrollDocs.addEventListener("click", handlers.onScrollDocs);
    }
    var driveBtn = container.querySelector("[data-crm-q-open-drive]");
    if (driveBtn && handlers.onOpenDrive) {
      driveBtn.addEventListener("click", handlers.onOpenDrive);
    }
    var copyBtn = container.querySelector("[data-crm-q-copy-link]");
    if (copyBtn && handlers.onCopyClientLink) {
      copyBtn.addEventListener("click", handlers.onCopyClientLink);
    }
    var sendBtn = container.querySelector("[data-crm-q-send-link]");
    if (sendBtn && handlers.onSendClientLink) {
      sendBtn.addEventListener("click", handlers.onSendClientLink);
    }
  }

  function scrollToDocs(root) {
    var el =
      (root && root.querySelector("[data-crm-doc-upload-wrap]")) ||
      document.getElementById("contactDocumentsPanel") ||
      document.querySelector("[data-crm-doc-upload-wrap]");
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function mountGenericUpload(panel, ctx) {
    panel.innerHTML =
      '<div class="crm-doc-generic">' +
      '<label class="crm-doc-generic__type">Type de pièce<select data-crm-doc-type>' +
      '<option value="generic">Document générique</option>' +
      '<option value="identity">Pièce d\'identité</option>' +
      '<option value="proof_address">Justificatif domicile</option>' +
      '<option value="tax_notice">Avis d\'imposition</option>' +
      '<option value="payslip">Bulletin de salaire</option>' +
      '<option value="bank_statement">Relevé bancaire</option>' +
      '<option value="other">Autre</option>' +
      "</select></label>" +
      '<label class="crm-doc-generic__file btn btn-ghost btn-sm">' +
      "Choisir un fichier (PDF, JPG, PNG — max 12 Mo)" +
      '<input type="file" data-crm-doc-file accept=".pdf,.jpg,.jpeg,.png" hidden /></label>' +
      '<p class="small" data-crm-doc-file-name style="margin:8px 0 0;color:var(--muted)"></p>' +
      "</div>";
    var fileInput = panel.querySelector("[data-crm-doc-file]");
    var fileNameEl = panel.querySelector("[data-crm-doc-file-name]");
    var pendingFile = null;
    fileInput.addEventListener("change", function () {
      pendingFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      if (fileNameEl) fileNameEl.textContent = pendingFile ? pendingFile.name : "";
    });
    return {
      uploadAll: function () {
        if (!pendingFile) return Promise.resolve({ uploaded: [], errors: [{ error: "Aucun fichier sélectionné" }] });
        if (pendingFile.size > 12 * 1024 * 1024) {
          return Promise.resolve({ uploaded: [], errors: [{ error: "Fichier trop volumineux (max 12 Mo)" }] });
        }
        var docType = panel.querySelector("[data-crm-doc-type]");
        var vertical = ctx.vertical || "questionnaire";
        return readFileAsBase64(pendingFile).then(function (dataUrl) {
          return fetch("/api/external/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              contactId: ctx.contactId,
              email: ctx.email,
              phone: ctx.phone,
              leadId: ctx.leadId,
              fileName: pendingFile.name,
              documentType: docType ? docType.value : "generic",
              mimeType: pendingFile.type || "application/octet-stream",
              fileBase64: dataUrl,
              vertical: vertical,
              need: vertical,
              source: "crm_staff_upload",
              description: "Dépôt conseiller depuis le CRM",
            }),
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
              pendingFile = null;
              if (fileInput) fileInput.value = "";
              if (fileNameEl) fileNameEl.textContent = "Fichier envoyé.";
              return { uploaded: [res.data], errors: [] };
            })
            .catch(function (err) {
              return { uploaded: [], errors: [{ error: err.message || "Erreur upload" }] };
            });
        });
      },
    };
  }

  function mountDocUpload(mount, ctx, opts) {
    opts = opts || {};
    if (!mount) return null;
    ctx = ctx || {};
    var vertical = ctx.vertical || "";
    var wrap = document.createElement("div");
    wrap.className = "crm-doc-upload-wrap panel";
    wrap.setAttribute("data-crm-doc-upload-wrap", "1");
    wrap.innerHTML =
      '<div class="panel-head" style="margin-bottom:10px"><h3 style="margin:0;font-size:1rem">Déposer des pièces</h3></div>' +
      '<p class="small" style="margin:0 0 10px;color:var(--muted)">1) Cliquez <strong>Déposer</strong> sur chaque pièce · 2) Cliquez <strong>Enregistrer les pièces</strong> pour envoyer vers Drive.</p>' +
      '<div data-crm-doc-upload-panel></div>' +
      '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      '<button type="button" class="btn btn-primary btn-sm" data-crm-doc-upload-btn>Enregistrer les pièces</button>' +
      '<span class="small" data-crm-doc-upload-status style="color:var(--muted)"></span>' +
      "</div>";
    mount.insertBefore(wrap, mount.firstChild || null);

    var panel = wrap.querySelector("[data-crm-doc-upload-panel]");
    var statusEl = wrap.querySelector("[data-crm-doc-upload-status]");
    var btn = wrap.querySelector("[data-crm-doc-upload-btn]");
    var inst = null;

    if (isImmoVertical(vertical) && global.ImmoCategoryDocuments && global.ImmoCategoryDocuments.mount) {
      var mode = isVendeurImmo(vertical) ? "vendeur" : "acheteur";
      inst = global.ImmoCategoryDocuments.mount(panel, mode);
      if (inst && inst.setSession) {
        inst.setSession({
          email: ctx.email,
          phone: ctx.phone,
          contactId: ctx.contactId,
          leadId: ctx.leadId,
          propertyId: ctx.propertyId || null,
        });
      }
      if (inst && typeof inst.setCrmMode === "function") inst.setCrmMode(true);
    } else {
      inst = mountGenericUpload(panel, ctx);
    }

    if (!btn || !inst) return wrap;

    function markItemDone(item, res) {
      if (!item) return;
      var att = (res && res.data && res.data.attachment) || {};
      var drive = (res && res.data && res.data.drive) || {};
      var hasDrive = !!(drive.fileId || drive.id || drive.webViewLink || att.driveFileId || att.webViewLink);
      item.status = hasDrive ? "received" : "transmitted";
      item.driveFileId = drive.fileId || att.driveFileId || null;
      item.webViewLink = drive.webViewLink || att.webViewLink || null;
      if (inst.uploaded) {
        inst.uploaded.push({
          id: item.id,
          fileName: item.fileName,
          documentType: item.documentType,
          status: item.status,
          driveFileId: item.driveFileId,
          webViewLink: item.webViewLink,
        });
      }
      if (typeof inst._refreshLine === "function") {
        inst._refreshLine(item.documentType);
        return;
      }
      if (!inst.root) return;
      var line = inst.root.querySelector('[data-immo-doc-line="' + item.documentType + '"]');
      if (!line) return;
      line.classList.remove("is-queued", "is-error");
      line.classList.add("is-done", "is-received");
      var span = line.querySelector(".immo-doc-line-btn span");
      if (span) span.textContent = "Ajouter +";
      var badge = line.querySelector("[data-immo-doc-status-badge]");
      if (badge) {
        badge.hidden = false;
        badge.textContent = hasDrive ? "Reçu" : "Transmis";
        badge.className = "immo-doc-status-badge " + (hasDrive ? "is-received" : "is-transmitted");
      }
    }

    function uploadViaExternal(items, session) {
      return items.reduce(
        function (chain, item) {
          return chain.then(function (acc) {
            var file = item.file;
            if (!file) return acc;
            item.status = "uploading";
            return readFileAsBase64(file).then(function (dataUrl) {
              return fetch("/api/external/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                  contactId: session.contactId,
                  email: session.email,
                  phone: session.phone,
                  leadId: session.leadId,
                  fileName: item.fileName || file.name,
                  documentType: item.documentType || "generic",
                  mimeType: item.mimeType || file.type || "application/octet-stream",
                  fileBase64: dataUrl,
                  vertical: isVendeurImmo(vertical) ? "vendeur-immo" : vertical || "questionnaire",
                  need: vertical || "questionnaire",
                  perTypeFolder: isImmoVertical(vertical),
                  source: "crm_staff_upload",
                  description: "Dépôt conseiller — " + (item.documentType || "document"),
                }),
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
                  if (res.data.contactId) session.contactId = res.data.contactId;
                  markItemDone(item, res);
                  acc.uploaded.push(res.data);
                  return acc;
                })
                .catch(function (err) {
                  item.status = "error";
                  item.error = err.message || "Erreur";
                  if (typeof inst._refreshLine === "function") inst._refreshLine(item.documentType);
                  acc.errors.push({ error: item.error, item: item });
                  return acc;
                });
            });
          });
        },
        Promise.resolve({ uploaded: [], errors: [] })
      ).then(function (result) {
        if (inst.queue) {
          inst.queue = inst.queue.filter(function (q) {
            return q.status !== "received" && q.status !== "transmitted" && q.status !== "done";
          });
        }
        if (typeof inst._renderQueues === "function") inst._renderQueues();
        return result;
      });
    }

    btn.addEventListener("click", function () {
      var pending =
        inst.queue &&
        inst.queue.filter(function (q) {
          return q.status === "queued" || q.status === "error";
        });
      var hasPending = !!(pending && pending.length);
      var hasGenericFile = !!(inst.uploadAll && !inst.queue);

      if (!hasPending && !hasGenericFile) {
        if (statusEl) {
          statusEl.textContent = "Aucun fichier — cliquez d’abord « Déposer » sur une pièce.";
        }
        return;
      }

      btn.disabled = true;
      if (statusEl) {
        statusEl.textContent = ctx.contactId
          ? "Envoi en cours…"
          : "Création de la fiche interlocuteur puis envoi…";
      }

      ensureContactId(ctx, {
        authHeaders: opts.authHeaders,
        silent: true,
        onContactCreated: function (contactId) {
          if (typeof opts.onContactCreated === "function") opts.onContactCreated(contactId);
        },
      })
        .then(function (contactId) {
          ctx.contactId = contactId;
          var session = {
            email: ctx.email,
            phone: ctx.phone,
            contactId: contactId,
            leadId: ctx.leadId,
            propertyId: ctx.propertyId || null,
          };
          if (inst.setSession) inst.setSession(session);

          if (hasPending) {
            return uploadViaExternal(pending, session);
          }
          if (inst.uploadAll) return inst.uploadAll();
          return { uploaded: [], errors: [{ error: "Aucun fichier à envoyer" }] };
        })
        .then(function (result) {
          var n = (result && result.uploaded && result.uploaded.length) || 0;
          var err = result && result.errors && result.errors[0];
          if (statusEl) {
            if (n) {
              statusEl.style.color = "var(--green, #15803d)";
              statusEl.textContent =
                n + " document(s) enregistré(s)" + (err ? " — " + (result.errors.length) + " erreur(s)." : ".");
            } else {
              statusEl.style.color = "var(--red, #b91c1c)";
              statusEl.textContent =
                (err && (err.error || err.message)) ||
                "Échec de l’enregistrement — vérifiez la fiche interlocuteur et Drive.";
            }
          }
          if (n && typeof opts.onUploaded === "function") opts.onUploaded(result);
        })
        .catch(function (err) {
          if (statusEl) {
            statusEl.style.color = "var(--red, #b91c1c)";
            statusEl.textContent = (err && err.message) || "Erreur réseau";
          }
        })
        .finally(function () {
          btn.disabled = false;
        });
    });

    return wrap;
  }

  function leadContextFromData(lead, contact) {
    lead = lead || {};
    contact = contact || {};
    var payload = parsePayload(lead.payload || lead.payload_obj);
    return {
      leadId: lead.id,
      contactId: lead.contact_id || contact.id || null,
      email: lead.email || contact.email || payload.email || null,
      phone: lead.phone || contact.phone || payload.phone || null,
      vertical: lead.vertical || payload.vertical || payload.need || "",
      payload: payload,
      propertyId:
        (Array.isArray(payload.propertyIds) && payload.propertyIds[0]) ||
        lead.propertyId ||
        null,
    };
  }

  function mountEditablePanel(container, ctx, opts) {
    opts = opts || {};
    if (!container || !global.InterlocuteurDossier || !global.InterlocuteurDossierEdit) return false;
    var lead = Object.assign({}, ctx.payload || {}, {
      id: ctx.leadId,
      email: ctx.email,
      phone: ctx.phone,
      vertical: ctx.vertical,
      payload: ctx.payload,
      payload_obj: ctx.payload,
    });
    var dossier = global.InterlocuteurDossier.buildDossier(lead);
    global.InterlocuteurDossierEdit.mountEditable(container, dossier, {
      leadId: ctx.leadId,
      contactId: ctx.contactId,
      api: opts.api || "crm",
      authHeaders: opts.authHeaders,
      payload: ctx.payload,
      onSaved: opts.onSaved,
    });
    return true;
  }

  function mountQuestionnaireWorkspace(root, ctx, opts) {
    opts = opts || {};
    if (!root) return;
    ctx = ctx || {};
    var state = { editing: !!opts.startEditing };

    function mountSellerQuickEditIfNeeded(answersEl) {
      if (!answersEl || state.editing || !canEdit()) return;
      if (!isImmoVertical(ctx.vertical)) return;
      var E = global.InterlocuteurDossierEdit;
      var D = global.InterlocuteurDossier;
      if (!E || !D || !E.mountSellerQuickEdit) return;
      var dossierMount = answersEl.querySelector(".int-dossier");
      if (!dossierMount || dossierMount.querySelector("[data-int-seller-quick-edit]")) return;
      var dossier = D.buildDossier(
        Object.assign({}, ctx, { payload: ctx.payload, payload_obj: ctx.payload })
      );
      E.mountSellerQuickEdit(dossierMount, dossier, {
        leadId: ctx.leadId,
        contactId: ctx.contactId,
        api: opts.api || "crm",
        authHeaders: opts.authHeaders,
        payload: ctx.payload,
        onSaved: function (res) {
          if (res && res.payload) ctx.payload = res.payload;
          if (typeof opts.onSaved === "function") opts.onSaved(res);
          renderAnswersView();
        },
      });
    }

    function renderAnswersView() {
      var answersEl = root.querySelector("[data-crm-q-answers]");
      if (!answersEl) return;
      if (state.editing && canEdit()) {
        mountEditablePanel(answersEl, ctx, {
          api: opts.api,
          authHeaders: opts.authHeaders,
          onSaved: function (res) {
            if (res && res.payload) ctx.payload = res.payload;
            state.editing = false;
            updateToggleLabel();
            if (typeof opts.onSaved === "function") opts.onSaved(res);
          },
        });
        return;
      }
      if (global.CrmLeadPayloadView && global.CrmLeadPayloadView.renderQuestionnairePanel) {
        var merged = Object.assign({}, ctx.payload, {
          id: ctx.leadId,
          email: ctx.email,
          phone: ctx.phone,
          vertical: ctx.vertical,
          payload: ctx.payload,
          payload_obj: ctx.payload,
        });
        answersEl.innerHTML = global.CrmLeadPayloadView.renderQuestionnairePanel(merged, esc, {
          hideSellerInProjet: canEdit() && isImmoVertical(ctx.vertical),
        });
        mountSellerQuickEditIfNeeded(answersEl);
      } else if (global.InterlocuteurDossier) {
        var dossier = global.InterlocuteurDossier.buildDossier(
          Object.assign({}, ctx, { payload: ctx.payload, payload_obj: ctx.payload })
        );
        answersEl.innerHTML = global.InterlocuteurDossier.renderSections(dossier, {
          hideSellerInProjet: canEdit() && isImmoVertical(ctx.vertical),
        });
        mountSellerQuickEditIfNeeded(answersEl);
      }
    }

    function updateToggleLabel() {
      var btn = root.querySelector("[data-crm-q-toggle-edit]");
      if (btn) btn.textContent = state.editing ? "Voir les réponses" : "Modifier les réponses";
    }

    root.innerHTML =
      renderToolbar(ctx, {
        showEdit: opts.showEdit,
        showUpload: opts.showUpload,
        mailboxUrl: opts.mailboxUrl,
        editing: state.editing,
      }) +
      '<div data-crm-q-answers class="crm-q-answers"></div>' +
      '<div data-crm-q-docs-mount></div>';

    bindToolbar(root, {
      onToggleEdit: function () {
        if (!canEdit()) return;
        state.editing = !state.editing;
        updateToggleLabel();
        renderAnswersView();
      },
      onScrollDocs: function () {
        scrollToDocs(root);
      },
      onOpenDrive: function (ev) {
        var btn = ev && ev.currentTarget ? ev.currentTarget : root.querySelector("[data-crm-q-open-drive]");
        openContactDrive(ctx, {
          button: btn,
          authHeaders: opts.authHeaders,
          onContactCreated: function (contactId) {
            ctx.contactId = contactId;
            if (btn) btn.textContent = "Ouvrir Drive";
            if (typeof opts.onContactCreated === "function") opts.onContactCreated(contactId);
          },
          onOpened: opts.onDriveOpened,
        });
      },
      onCopyClientLink: function (ev) {
        var btn = ev && ev.currentTarget;
        var prev = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Création…";
        }
        requestClientResumeLink(ctx, false)
          .then(function (data) {
            return copyText(data.url).then(function () {
              return data;
            });
          })
          .then(function () {
            if (btn) btn.textContent = "Lien copié";
            window.setTimeout(function () {
              if (btn) {
                btn.disabled = false;
                btn.textContent = prev || "Copier le lien client";
              }
            }, 1600);
          })
          .catch(function (err) {
            window.alert((err && err.message) || "Impossible de copier le lien.");
            if (btn) {
              btn.disabled = false;
              btn.textContent = prev || "Copier le lien client";
            }
          });
      },
      onSendClientLink: function (ev) {
        if (!ctx.email) {
          window.alert("Ajoutez un e-mail sur la fiche pour envoyer le lien au client.");
          return;
        }
        var btn = ev && ev.currentTarget;
        var prev = btn ? btn.textContent : "";
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Envoi…";
        }
        requestClientResumeLink(ctx, true)
          .then(function (data) {
            if (!data.emailed) {
              throw new Error(
                data.emailReason === "no_email"
                  ? "Pas d’e-mail sur ce dossier."
                  : "E-mail non envoyé (vérifiez Resend / LEAD_FROM_EMAIL)."
              );
            }
            if (btn) btn.textContent = "Envoyé";
            window.alert("Lien envoyé à " + ctx.email + ".\nLe client confirmera son e-mail ou son téléphone pour ouvrir le bon dossier.");
            window.setTimeout(function () {
              if (btn) {
                btn.disabled = false;
                btn.textContent = prev || "Envoyer le lien au client";
              }
            }, 1600);
          })
          .catch(function (err) {
            window.alert((err && err.message) || "Envoi impossible.");
            if (btn) {
              btn.disabled = false;
              btn.textContent = prev || "Envoyer le lien au client";
            }
          });
      },
    });

    renderAnswersView();

    var docsMount = root.querySelector("[data-crm-q-docs-mount]");
    if (docsMount && opts.showUpload !== false) {
      mountDocUpload(docsMount, ctx, {
        authHeaders: opts.authHeaders,
        onUploaded: opts.onUploaded,
        onContactCreated: function (contactId) {
          ctx.contactId = contactId;
          var driveBtn = root.querySelector("[data-crm-q-open-drive]");
          if (driveBtn) driveBtn.textContent = "Ouvrir Drive";
          if (typeof opts.onContactCreated === "function") opts.onContactCreated(contactId);
        },
      });
    }
  }

  global.CrmQuestionnaireTools = {
    esc: esc,
    parsePayload: parsePayload,
    buildResumeUrl: buildResumeUrl,
    buildMailboxUrl: buildMailboxUrl,
    canEdit: canEdit,
    ensureContactId: ensureContactId,
    openContactDrive: openContactDrive,
    renderToolbar: renderToolbar,
    bindToolbar: bindToolbar,
    scrollToDocs: scrollToDocs,
    mountDocUpload: mountDocUpload,
    leadContextFromData: leadContextFromData,
    mountEditablePanel: mountEditablePanel,
    mountQuestionnaireWorkspace: mountQuestionnaireWorkspace,
    requestClientResumeLink: requestClientResumeLink,
    isImmoVertical: isImmoVertical,
    isVendeurImmo: isVendeurImmo,
  };
})(typeof window !== "undefined" ? window : global);
