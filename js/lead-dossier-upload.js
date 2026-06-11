/**
 * Depot pieces dossier apres envoi formulaire (VTC, sante, credit immo).
 */
(function () {
  var state = {
    leadId: null,
    email: null,
    vertical: "vtc",
    dossierLabel: "Completer votre dossier",
    slots: [],
    documents: [],
    driveNote: "",
  };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function statusLabel(st) {
    if (st === "approved") return { text: "Valide", cls: "approved" };
    if (st === "rejected") return { text: "Refuse", cls: "rejected" };
    if (st === "pending") return { text: "En attente validation", cls: "pending" };
    return { text: "A deposer", cls: "" };
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function fetchDocuments() {
    if (!state.leadId || !state.email) return Promise.resolve();
    return fetch(
      "/api/lead-documents?leadId=" +
        encodeURIComponent(state.leadId) +
        "&email=" +
        encodeURIComponent(state.email)
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          state.documents = res.documents || [];
          state.slots = res.slots || [];
          state.vertical = res.vertical || state.vertical;
          state.dossierLabel = res.dossierLabel || state.dossierLabel;
          state.driveNote = res.driveLinked
            ? "Vos fichiers sont classes automatiquement dans votre dossier Google Drive courtier."
            : "Les fichiers seront archives dans Google Drive des que la connexion est activee.";
        }
      })
      .catch(function () {});
  }

  function docForType(docType) {
    return state.documents.find(function (d) {
      return d.docType === docType && d.status !== "rejected";
    });
  }

  function uploadSlot(slot, file, displayName) {
    return readFileAsDataUrl(file).then(function (dataUrl) {
      return fetch("/api/lead-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: state.leadId,
          email: state.email,
          vertical: state.vertical,
          docType: slot.type,
          displayName: displayName || slot.defaultName,
          fileName: file.name,
          contentBase64: dataUrl,
        }),
      }).then(function (r) {
        return r.json();
      });
    });
  }

  function renderPanel(container) {
    if (!container) return;
    var slots = state.slots.length ? state.slots : [];
    container.hidden = false;
    container.innerHTML =
      '<div class="lead-dossier-panel">' +
      "<h3>" +
      esc(state.dossierLabel) +
      "</h3>" +
      '<p class="lead-dossier-intro">Deposez vos pieces pour accelerer votre dossier. Noms par defaut pre-remplis — modifiables avant envoi. Chaque document est valide par un conseiller. ' +
      esc(state.driveNote) +
      "</p>" +
      '<div class="lead-dossier-slots" data-dossier-slots></div>' +
      '<p class="lead-dossier-msg" data-dossier-msg hidden></p>' +
      "</div>";

    var slotsRoot = container.querySelector("[data-dossier-slots]");
    if (!slots.length) {
      slotsRoot.innerHTML = "<p>Chargement des emplacements…</p>";
      return;
    }

    slots.forEach(function (slot) {
      var existing = docForType(slot.type);
      var st = existing ? statusLabel(existing.status) : statusLabel("");
      var slotEl = document.createElement("div");
      slotEl.className =
        "lead-dossier-slot" +
        (existing ? " is-uploaded" : "") +
        (existing && existing.status === "rejected" ? " is-rejected" : "");
      slotEl.dataset.docType = slot.type;

      if (existing && existing.status !== "rejected") {
        slotEl.innerHTML =
          '<div class="lead-dossier-slot-head">' +
          '<span class="lead-dossier-slot-type">' +
          esc(existing.displayName) +
          "</span>" +
          '<span class="lead-dossier-status ' +
          st.cls +
          '">' +
          esc(st.text) +
          "</span></div>" +
          '<p style="margin:0;font-size:.85rem;color:#64748b">' +
          esc(existing.fileName) +
          (existing.rejectReason ? " — " + esc(existing.rejectReason) : "") +
          "</p>";
        slotsRoot.appendChild(slotEl);
        return;
      }

      slotEl.innerHTML =
        '<div class="lead-dossier-slot-head">' +
        '<span class="lead-dossier-slot-type">' +
        esc(slot.defaultName) +
        (slot.optional ? ' <span style="font-weight:400;color:#94a3b8">(optionnel)</span>' : "") +
        "</span></div>" +
        '<div class="lead-dossier-fields">' +
        '<div><label>Nom affiche</label><input type="text" data-display-name value="' +
        esc(slot.defaultName) +
        '" /></div>' +
        '<div><label>Nom fichier</label><input type="text" data-file-stem value="' +
        esc(slot.defaultFile) +
        '" /></div></div>' +
        '<div class="lead-dossier-drop" data-drop-zone>Glisser-deposer ou cliquer (PDF, JPG, PNG — max 8 Mo)</div>' +
        '<input type="file" accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf" hidden data-file-input />' +
        '<div class="lead-dossier-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-upload-btn disabled>Envoyer cette piece</button>' +
        "</div>";

      var drop = slotEl.querySelector("[data-drop-zone]");
      var input = slotEl.querySelector("[data-file-input]");
      var btn = slotEl.querySelector("[data-upload-btn]");
      var msg = container.querySelector("[data-dossier-msg]");
      var picked = null;

      function setPicked(file) {
        picked = file;
        btn.disabled = !file;
        drop.textContent = file ? "Fichier : " + file.name : "Glisser-deposer ou cliquer (PDF, JPG, PNG — max 8 Mo)";
      }

      drop.addEventListener("click", function () {
        input.click();
      });
      drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("is-dragover");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        var f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) setPicked(f);
      });
      input.addEventListener("change", function () {
        if (input.files[0]) setPicked(input.files[0]);
      });

      btn.addEventListener("click", function () {
        if (!picked || !state.leadId) return;
        btn.disabled = true;
        btn.textContent = "Envoi…";
        var displayName = slotEl.querySelector("[data-display-name]").value.trim() || slot.defaultName;
        uploadSlot(slot, picked, displayName)
          .then(function (res) {
            if (res.ok) {
              if (msg) {
                var driveHint =
                  res.drive && res.drive.simulated
                    ? " (archivage Drive en attente de configuration)"
                    : res.drive && res.drive.fileId
                      ? " — classe dans votre dossier Drive."
                      : "";
                msg.textContent =
                  "Piece « " + displayName + " » transmise. Validation par le courtier sous 24–48 h." + driveHint;
                msg.className = "lead-dossier-msg ok";
                msg.hidden = false;
              }
              return fetchDocuments().then(function () {
                renderPanel(container);
              });
            }
            throw new Error(res.error || res.message || "Erreur envoi");
          })
          .catch(function (err) {
            if (msg) {
              msg.textContent = err.message || "Envoi impossible";
              msg.className = "lead-dossier-msg err";
              msg.hidden = false;
            }
            btn.disabled = false;
            btn.textContent = "Envoyer cette piece";
          });
      });

      slotsRoot.appendChild(slotEl);
    });
  }

  function mount(leadId, email, vertical) {
    state.leadId = leadId;
    state.email = email;
    state.vertical = vertical || "vtc";
    var host = document.querySelector("[data-lead-dossier]") || document.getElementById("demande");
    if (!host) return;

    var panel = host.querySelector("[data-lead-dossier-panel]");
    if (!panel) {
      panel = document.createElement("div");
      panel.dataset.leadDossierPanel = "1";
      host.appendChild(panel);
    }

    fetchDocuments().then(function () {
      renderPanel(panel);
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  window.LeadDossierUpload = { mount: mount };

  document.addEventListener("lo:lead-sent", function (ev) {
    var detail = (ev && ev.detail) || {};
    var result = detail.result || {};
    var payload = detail.payload || {};
    if (!result.ok || !result.leadId) return;
    var email = payload.email || payload.mail;
    if (!email) return;
    var vertical =
      payload.vertical ||
      payload.need ||
      payload.serviceNeed ||
      (window.location.pathname.indexOf("sante") !== -1
        ? "sante"
        : window.location.pathname.indexOf("credit-immo") !== -1
          ? "credit_immo"
          : "vtc");
    mount(result.leadId, email, vertical);
  });
})();
