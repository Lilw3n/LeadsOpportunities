/**
 * Session Drive après dépôt vendeur — permet d'envoyer des docs sur Drive
 * même après « Déposer mon bien » (ajout tardif de pièces).
 */
(function (global) {
  var KEY = "lo_immo_deposit_drive_session";
  var uploadTimer = null;

  function load() {
    try {
      var raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function hasAuth(session) {
    return !!(session && (session.email || session.phone || session.contactId));
  }

  function canUploadPropertyDocs(session) {
    return !!(session && session.propertyId && hasAuth(session));
  }

  function applyToModules(session) {
    if (!session) return;
    if (global.ImmoSellDocsChecklist && global.ImmoSellDocsChecklist.setSession) {
      global.ImmoSellDocsChecklist.setSession(session);
    }
    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (panel && panel._immoDocs && panel._immoDocs.setSession) {
      panel._immoDocs.setSession(session);
    }
  }

  function save(session) {
    if (!session || !hasAuth(session)) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(session));
    } catch (e) {}
    applyToModules(session);
  }

  function showUploadFeedback(result) {
    var root = document.querySelector("[data-listing-url-capture]");
    if (!root || !result) return;
    var okEl = root.querySelector("[data-url-capture-ok]");
    var errEl = root.querySelector("[data-url-capture-err]");
    var n = (result.uploaded || []).length;
    var errN = (result.errors || []).length;
    if (n && okEl) {
      okEl.hidden = false;
      var prev = okEl.textContent || "";
      var add = n + " document(s) copié(s) sur Google Drive.";
      okEl.textContent = prev.indexOf(add) >= 0 ? prev : (prev ? prev + " " : "") + add;
    }
    if (errN && errEl) {
      errEl.hidden = false;
      errEl.textContent =
        errN +
        " document(s) n'ont pas pu être envoyés sur Drive — vérifiez votre connexion ou réessayez.";
    }
  }

  function uploadAllPending() {
    var session = load();
    if (!hasAuth(session)) {
      return Promise.resolve({ uploaded: [], errors: [] });
    }
    applyToModules(session);

    var acc = { uploaded: [], errors: [] };
    var chain = Promise.resolve(acc);

    if (canUploadPropertyDocs(session)) {
      chain = chain.then(function () {
        var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
        if (!panel || !panel._immoDocs) return acc;
        return panel._immoDocs.uploadAll().then(function (r) {
          acc.uploaded = acc.uploaded.concat(r.uploaded || []);
          acc.errors = acc.errors.concat(r.errors || []);
          return acc;
        });
      });
    }

    return chain.then(function (finalAcc) {
      if (finalAcc.uploaded.length || finalAcc.errors.length) {
        showUploadFeedback(finalAcc);
      }
      return finalAcc;
    });
  }

  function scheduleUpload() {
    if (!load()) return;
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(function () {
      uploadAllPending();
    }, 450);
  }

  function boot() {
    var session = load();
    if (session) applyToModules(session);
  }

  global.ImmoDepositDriveSession = {
    save: save,
    load: load,
    apply: applyToModules,
    hasSession: function () {
      return hasAuth(load());
    },
    uploadAllPending: uploadAllPending,
    scheduleUpload: scheduleUpload,
  };

  document.addEventListener("lo:listing-submitted", function (ev) {
    var detail = (ev && ev.detail) || {};
    if (detail.session) save(detail.session);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
