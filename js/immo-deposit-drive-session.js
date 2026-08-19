/**
 * Session Drive dépôt vendeur — upload immédiat (staging) puis rattachement au bien après validation.
 * Chaque session de formulaire a un depositSessionId unique (même personne = nouvelle session si nouvelle demande).
 */
(function (global) {
  var KEY = "lo_immo_deposit_drive_session";
  var DRAFT_SESSION_KEY = "lo_immo_draft_active_id";
  var uploadTimer = null;

  function load() {
    try {
      var raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function readFormAuth() {
    var form = document.querySelector("[data-url-capture-form]");
    if (!form) return { email: "", phone: "" };
    function v(name) {
      var el = form.querySelector("[name='" + name + "']");
      return el ? String(el.value || "").trim() : "";
    }
    return {
      email: v("email").toLowerCase(),
      phone: v("phone"),
    };
  }

  function getDepositSessionId() {
    try {
      var existing = sessionStorage.getItem(DRAFT_SESSION_KEY);
      if (existing) return existing;
    } catch (e) {}
    var id = "dep_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    try {
      sessionStorage.setItem(DRAFT_SESSION_KEY, id);
    } catch (e2) {}
    return id;
  }

  function mergeSession(partial) {
    var base = load() || {};
    var auth = readFormAuth();
    return Object.assign(
      {
        depositSessionId: getDepositSessionId(),
        email: auth.email || base.email || "",
        phone: auth.phone || base.phone || "",
        contactId: base.contactId || null,
        leadId: base.leadId || null,
        propertyId: base.propertyId || null,
      },
      partial || {}
    );
  }

  function hasAuth(session) {
    session = session || mergeSession();
    return !!(session.depositSessionId || session.email || session.phone || session.contactId);
  }

  function canUploadPropertyDocs(session) {
    session = session || mergeSession();
    return !!(session.propertyId && (session.email || session.phone || session.contactId));
  }

  function canUploadStaging(session) {
    session = session || mergeSession();
    return !!session.depositSessionId;
  }

  function applyToModules(session) {
    if (!session) session = mergeSession();
    if (global.ImmoSellDocsChecklist && global.ImmoSellDocsChecklist.setSession) {
      global.ImmoSellDocsChecklist.setSession(session);
    }
    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (panel && panel._immoDocs && panel._immoDocs.setSession) {
      panel._immoDocs.setSession(session);
    }
  }

  function save(session) {
    session = mergeSession(session);
    if (!session.depositSessionId && !session.email && !session.phone && !session.contactId) return;
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
      var add = n + " document(s) sauvegardé(s) sur Google Drive.";
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
    var session = mergeSession(load());
    save(session);
    applyToModules(session);

    var acc = { uploaded: [], errors: [] };
    var chain = Promise.resolve(acc);

    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (panel && panel._immoDocs) {
      chain = chain.then(function () {
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
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(function () {
      save(mergeSession(load()));
      uploadAllPending();
    }, 450);
  }

  function boot() {
    var session = mergeSession(load());
    save(session);
  }

  function collectUploadContext() {
    var form = document.querySelector("[data-url-capture-form]");
    var owners = null;
    var mount = document.querySelector("[data-owners-mount]");
    if (mount && global.AcheteurImmoOwners && global.AcheteurImmoOwners.collect) {
      owners = global.AcheteurImmoOwners.collect(mount, form);
    }
    function v(name) {
      if (!form) return "";
      var el = form.querySelector("[name='" + name + "']");
      return el ? String(el.value || "").trim() : "";
    }
    var sellCity = document.querySelector("#sellCity");
    var sellPostal = document.querySelector("#sellPostalCode");
    var urlCity = document.querySelector("#urlCity");
    var urlPostal = document.querySelector("#urlPostal");
    return {
      owners: owners,
      depositor: {
        firstName: v("firstName"),
        lastName: v("lastName"),
      },
      city:
        (sellCity && String(sellCity.value || "").trim()) ||
        (urlCity && String(urlCity.value || "").trim()) ||
        v("city"),
      postal_code:
        (sellPostal && String(sellPostal.value || "").trim()) ||
        (urlPostal && String(urlPostal.value || "").trim()) ||
        v("postal_code"),
      email: v("email").toLowerCase(),
      phone: v("phone"),
    };
  }

  function resolveOwnerIndex(documentType, existingCount, owners) {
    owners = owners || [];
    var t = String(documentType || "").toLowerCase();
    if (t === "kbis_sci") {
      for (var i = 0; i < owners.length; i++) {
        var o = owners[i] || {};
        if (o.role === "sci" || o.entityName) return i;
      }
      return 0;
    }
    var personTypes = { identite: 1, domicile: 1, livret_famille: 1 };
    if (!personTypes[t] || owners.length < 2) return 0;
    return existingCount % owners.length;
  }

  global.ImmoDepositDriveSession = {
    save: save,
    load: load,
    merge: mergeSession,
    apply: applyToModules,
    getDepositSessionId: getDepositSessionId,
    collectUploadContext: collectUploadContext,
    resolveOwnerIndex: resolveOwnerIndex,
    hasSession: function () {
      return hasAuth(mergeSession(load()));
    },
    canUploadStaging: function () {
      return canUploadStaging(mergeSession(load()));
    },
    canUploadPropertyDocs: function () {
      return canUploadPropertyDocs(mergeSession(load()));
    },
    uploadAllPending: uploadAllPending,
    scheduleUpload: scheduleUpload,
  };

  document.addEventListener("lo:listing-submitted", function (ev) {
    var detail = (ev && ev.detail) || {};
    if (detail.session) save(mergeSession(detail.session));
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
