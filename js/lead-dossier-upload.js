/**
 * Dépôt de pièces après saisie e-mail (simulations / dossiers prêt).
 */
(function (global) {
  function mountDossier(root) {
    if (!root || root.dataset.ldBound) return;
    root.dataset.ldBound = "1";
    var need = root.getAttribute("data-lead-dossier-need") || "credit-immo";
    var emailInput =
      document.querySelector("#email, [name='email'], [data-lead-dossier-email]") || null;

    root.innerHTML =
      '<section class="lead-dossier-upload" data-lead-dossier-panel hidden>' +
      "<h3>Envoyer vos documents (Drive sécurisé)</h3>" +
      '<p class="lead-dossier-intro">PDF ou photos uniquement — max 12 Mo. Votre e-mail doit être renseigné et le formulaire envoyé une première fois.</p>' +
      '<div data-devis-documents-root class="lead-dossier-drop-wrap">' +
      '<div class="devis-docs-drop" data-docs-drop><strong>Glisser un fichier ou cliquer</strong>' +
      "<p>PDF, JPG, PNG, WEBP</p>" +
      '<input type="file" data-docs-input accept=".pdf,.jpg,.jpeg,.png,.webp" hidden /></div>' +
      '<label class="lead-dossier-type-label">Type de document</label>' +
      '<select data-docs-type data-optional></select>' +
      '<div data-docs-queue class="devis-docs-queue"></div>' +
      '<button type="button" class="btn btn-soft" data-lead-dossier-send>Envoyer les fichiers en attente</button>' +
      '<div data-docs-visual-grid class="devis-docs-grid"></div>' +
      "</div>" +
      '<p class="small lead-dossier-hint" data-lead-dossier-hint>Renseignez votre e-mail puis validez le formulaire pour activer l\'envoi.</p>' +
      "</section>";

    var panel = root.querySelector("[data-lead-dossier-panel]");
    var hint = root.querySelector("[data-lead-dossier-hint]");
    if (!global.DevisDocumentUpload || !global.DEVIS_DOCUMENT_CONFIG) {
      if (hint) hint.textContent = "Module documents indisponible sur cette page.";
      return;
    }

    var cfg = global.DEVIS_DOCUMENT_CONFIG.getConfig(need);
    var sel = root.querySelector("[data-docs-type]");
    if (sel && cfg.items) {
      sel.innerHTML = cfg.items
        .map(function (it) {
          return '<option value="' + it.type + '">' + it.label + "</option>";
        })
        .join("");
    }

    var uploader = new global.DevisDocumentUpload.DevisDocumentUpload(
      root.querySelector("[data-devis-documents-root]"),
      { need: need }
    );
    root._leadDossierUploader = uploader;

    var session = { email: null, contactId: null, leadId: null, uploadToken: null };

    function applySession(next) {
      session = Object.assign(session, next || {});
      uploader.setSession(session);
      if (session.uploadToken && panel) {
        panel.hidden = false;
        if (hint) hint.textContent = "Vous pouvez déposer vos pièces — elles partent sur le Drive courtier sécurisé.";
      }
    }

    function emailFromForm() {
      if (emailInput && emailInput.value) return String(emailInput.value).trim();
      var f = root.closest("form");
      if (f) {
        var el = f.querySelector('[name="email"]');
        if (el && el.value) return String(el.value).trim();
      }
      return "";
    }

    root.querySelector("[data-lead-dossier-send]").addEventListener("click", function () {
      var em = emailFromForm();
      if (!session.uploadToken) {
        if (hint) hint.textContent = "Envoyez d'abord le formulaire avec votre e-mail.";
        return;
      }
      if (em) uploader.setSession({ email: em });
      uploader.uploadQueued().then(function (res) {
        if (res.errors && res.errors.length && hint) {
          hint.textContent = res.errors[0].error || "Erreur envoi";
        } else if (hint) {
          hint.textContent = "Document(s) envoyé(s) sur Drive.";
        }
        uploader.fetchRemoteList();
      });
    });

    global.addEventListener("lo:lead-sent", function (ev) {
      var detail = (ev && ev.detail) || {};
      var payload = detail.payload || {};
      var result = detail.result || {};
      applySession({
        email: payload.email || emailFromForm(),
        contactId: result.contactId || null,
        leadId: result.leadId || null,
        uploadToken: result.uploadToken || null,
      });
      uploader.fetchRemoteList();
    });
  }

  function init() {
    document.querySelectorAll("[data-lead-dossier]").forEach(mountDossier);
  }

  global.LeadDossierUpload = { mount: mountDossier, init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
