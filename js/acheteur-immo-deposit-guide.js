/**
 * Guide dépôt vendeur : validation guidée, progression, brouillon local (reprise).
 */
(function (global) {
  var DRAFT_KEY_V1 = "lo_immo_deposit_draft_v1";
  var INDEX_KEY = "lo_immo_deposit_drafts_index";
  var DRAFT_PREFIX = "lo_immo_deposit_draft_";
  var SESSION_ACTIVE_KEY = "lo_immo_draft_active_id";
  var MAX_DRAFTS = 8;
  var SAVE_DELAY_MS = 1200;

  var activeDraftId = null;
  var formDirty = false;
  var saveTimer = null;
  var refreshTimer = null;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function val(form, name) {
    var el = form && form.querySelector("[name='" + name + "']");
    return el ? String(el.value || "").trim() : "";
  }

  function radioVal(scope, name) {
    var el = (scope || document).querySelector("[name='" + name + "']:checked");
    return el ? String(el.value || "").trim() : "";
  }

  function hasPhone(form) {
    var p = val(form, "phone").replace(/\D/g, "");
    return p.length >= 10;
  }

  function hasEmail(form) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(form, "email"));
  }

  function isOwnerHat(hat) {
    return hat === "vendeur" || hat === "les_deux";
  }

  function getConfirmMethod(form, hat) {
    if (!isOwnerHat(hat)) return null;
    var el = form && form.querySelector("[name='confirmMethod']:checked");
    return el ? String(el.value || "").trim() : "email";
  }

  function isGoogleLoggedIn() {
    return !!(global.AcheteurImmoAccount && global.AcheteurImmoAccount.isLoggedIn());
  }

  function sessionEmail() {
    try {
      return localStorage.getItem("lo_client_email") || "";
    } catch (e) {
      return "";
    }
  }

  function contactSatisfied(form, hat) {
    var method = getConfirmMethod(form, hat);
    if (method === "google") return isGoogleLoggedIn();
    if (method === "email") return hasEmail(form);
    if (method === "phone") return hasPhone(form);
    return hasEmail(form) || hasPhone(form);
  }

  function contactMissingItem(form, hat) {
    var method = getConfirmMethod(form, hat);
    if (method === "google") {
      return missingItem(
        "confirmGoogle",
        "Connexion Google pour confirmer votre identité",
        qs("[data-account-google]", form) || qs("[data-account-block]", form),
        "Compte client"
      );
    }
    if (method === "email") {
      return missingItem(
        "contactEmail",
        "E-mail pour vous recontacter et confirmer votre identité",
        form.querySelector("[name='email']"),
        "Vos coordonnées"
      );
    }
    if (method === "phone") {
      return missingItem(
        "contactPhone",
        "Téléphone pour vous recontacter et confirmer votre identité",
        form.querySelector("[name='phone']"),
        "Vos coordonnées"
      );
    }
    return missingItem(
      "contact",
      "E-mail ou téléphone pour vous recontacter",
      form.querySelector("[name='email']") || form.querySelector("[name='phone']"),
      "Vos coordonnées"
    );
  }

  function resolveCity(form) {
    var c = val(form, "city");
    if (c) return c;
    var fb = document.querySelector("[data-city-fallback]");
    if (fb && String(fb.value || "").trim()) return String(fb.value).trim();
    var sellEl = document.querySelector("#sellCity");
    if (sellEl && String(sellEl.value || "").trim()) return String(sellEl.value).trim();
    if (global.AcheteurImmoDepositVente && global.AcheteurImmoDepositVente.collectSellDossier) {
      var sd = global.AcheteurImmoDepositVente.collectSellDossier();
      if (sd && sd.sellCity && String(sd.sellCity).trim()) return String(sd.sellCity).trim();
    }
    return "";
  }

  function hasBienLocation(form, urlHitCount) {
    if (urlHitCount > 0) return true;
    if (resolveCity(form)) return true;
    var postal = val(form, "postal_code").replace(/\D/g, "");
    if (postal.length >= 5) return true;
    var sellPostal = document.querySelector("#sellPostalCode");
    if (sellPostal && String(sellPostal.value || "").replace(/\D/g, "").length >= 5) return true;
    return false;
  }

  function bienLocationMissingEl(form) {
    return (
      form.querySelector("[name='city']") ||
      form.querySelector("[name='postal_code']") ||
      document.querySelector("[data-city-fallback]") ||
      document.querySelector("#sellCity") ||
      document.querySelector("#sellPostalCode") ||
      qs("[data-listing-urls]", form)
    );
  }

  function labelFor(el) {
    if (!el) return "Champ requis";
    if (el.id) {
      var lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl) return lbl.textContent.replace(/\s+/g, " ").trim();
    }
    var wrap = el.closest(".field, .immo-owner-card, fieldset");
    if (wrap) {
      var l2 = wrap.querySelector("label, legend, strong");
      if (l2) return l2.textContent.replace(/\s+/g, " ").trim().slice(0, 80);
    }
    return el.getAttribute("placeholder") || el.name || "Information";
  }

  function openAncestors(el) {
    var node = el;
    while (node) {
      if (node.tagName === "DETAILS" && !node.open) node.open = true;
      if (node.hidden === true) node.hidden = false;
      node = node.parentElement;
    }
  }

  function focusTarget(el) {
    if (!el) return;
    openAncestors(el);
    qsa(".input-invalid").forEach(function (n) {
      n.classList.remove("input-invalid");
    });
    qsa(".immo-owner-card--invalid").forEach(function (n) {
      n.classList.remove("immo-owner-card--invalid");
    });
    el.classList.add("input-invalid");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      el.focus({ preventScroll: true });
    } catch (e) {}
  }

  function missingItem(id, label, el, section) {
    return { id: id, label: label, el: el, section: section || "" };
  }

  function validate(ctx) {
    var form = ctx.form;
    var hat = ctx.hat || radioVal(document, "immoHat") || "acheteur";
    var isOwner = hat === "vendeur" || hat === "les_deux";
    var isSignalement = hat === "signalement";
    var hits = ctx.urlHits || [];
    var photos = ctx.photoCount || 0;
    var blocking = [];
    var recommended = [];

    if (!isOwner && !isSignalement && !hits.length) {
      blocking.push(
        missingItem(
          "urls",
          "URL d'annonce (Leboncoin, SeLoger…)",
          qs("[data-listing-urls]", form),
          "Saisie rapide"
        )
      );
    }

    if ((isOwner || isSignalement) && !hasBienLocation(form, hits.length)) {
      blocking.push(
        missingItem(
          "city",
          isSignalement
            ? "Ville du bien signalé (ou photo / description)"
            : "Ville ou code postal du bien (section « saisie rapide » en haut, ou URL d'annonce)",
          bienLocationMissingEl(form),
          isSignalement ? "Signalement" : "Le bien"
        )
      );
    }

    if (isSignalement && !photos && !val(form, "description")) {
      blocking.push(
        missingItem(
          "media",
          "Photo ou description du bien",
          qs("[data-listing-photos]", form) || qs("#urlDescription", form),
          "Signalement"
        )
      );
    }

    if (!contactSatisfied(form, hat)) {
      blocking.push(contactMissingItem(form, hat));
    }

    if (isOwner) {
      if (!val(form, "firstName")) {
        blocking.push(
          missingItem("firstName", "Prénom", form.querySelector("[name='firstName']"), "Vos coordonnées")
        );
      }
    }

    if (isOwner) {
      var ownersMount = document.querySelector("[data-owners-mount]");
      if (ownersMount && global.AcheteurImmoOwners) {
        var ov = global.AcheteurImmoOwners.validate(ownersMount);
        if (!ov.ok) {
          recommended.push(
            missingItem("owners", "Au moins un propriétaire (nom + tél ou e-mail)", ownersMount, "Propriétaires")
          );
        }
      }
      var sellPostal = document.querySelector("#sellPostalCode");
      if (sellPostal && !String(sellPostal.value || "").trim()) {
        recommended.push(missingItem("sellPostalCode", "Code postal du bien", sellPostal, "Coordonnées du bien"));
      }
      var sellType =
        (global.AcheteurImmoListingFields && global.AcheteurImmoListingFields.hasPropertyType(document)) ||
        document.querySelector('[name="sellPropertyType"]:checked');
      if (!sellType) {
        recommended.push(
          missingItem(
            "sellPropertyCategory",
            "Type d'annonce et type de bien",
            document.querySelector("#sellPropertyCategory") || document.querySelector('[name="sellPropertyType"]'),
            "Typologie"
          )
        );
      }
    }

    return {
      ok: blocking.length === 0,
      blocking: blocking,
      recommended: recommended,
      progress: computeProgress(form, hat, isOwner, isSignalement, hits.length, photos, blocking, recommended),
    };
  }

  function computeProgress(form, hat, isOwner, isSignalement, urlCount, photoCount, blocking, recommended) {
    hat = hat || val(form, "role") || radioVal(document, "immoHat") || "acheteur";
    var steps = [];
    steps.push({ id: "contact", done: contactSatisfied(form, hat), label: "Contact" });
    steps.push({
      id: "bien",
      done: hasBienLocation(form, urlCount),
      label: "Ville ou annonce",
    });
    if (isSignalement) {
      steps.push({ id: "media", done: photoCount > 0 || !!val(form, "description"), label: "Photo / description" });
    }
    if (isOwner) {
      steps.push({ id: "firstName", done: !!val(form, "firstName"), label: "Prénom" });
      var ownersMount = document.querySelector("[data-owners-mount]");
      var ownersOk =
        ownersMount && global.AcheteurImmoOwners
          ? global.AcheteurImmoOwners.validate(ownersMount).ok
          : true;
      steps.push({ id: "owners", done: ownersOk, label: "Propriétaire" });
      steps.push({
        id: "postal",
        done: !!((document.querySelector("#sellPostalCode") || {}).value || "").trim() || !!val(form, "postal_code"),
        label: "Code postal",
      });
    }
    var done = steps.filter(function (s) {
      return s.done;
    }).length;
    return {
      percent: steps.length ? Math.round((done / steps.length) * 100) : 0,
      done: done,
      total: steps.length,
      steps: steps,
      canSubmit: blocking.length === 0,
    };
  }

  function renderValidationPanel(root, result) {
    var panel = qs("[data-sell-validation-panel]", root);
    var list = qs("[data-sell-validation-list]", root);
    var progressBar = qs("[data-sell-progress-bar]", root);
    var progressLabel = qs("[data-sell-progress-label]", root);
    if (!panel || !list) return;

    if (progressBar) progressBar.style.width = result.progress.percent + "%";
    if (progressLabel) {
      progressLabel.textContent =
        "Dossier " +
        result.progress.percent +
        " % — minimum pour envoyer : " +
        (result.progress.canSubmit ? "OK" : "incomplet");
    }

    if (result.ok) {
      updateJumpErrors(root, 0);
      if (result.recommended && result.recommended.length && result.progress.percent < 100) {
        panel.hidden = false;
        list.innerHTML =
          '<li class="immo-deposit-optional-lead">Vous pouvez envoyer maintenant. Pour un dossier plus complet :</li>' +
          result.recommended
            .map(function (item) {
              return (
                '<li><button type="button" class="immo-deposit-missing-link immo-deposit-missing-link--soft" data-sell-focus="' +
                esc(item.id) +
                '">' +
                esc(item.label) +
                (item.section ? ' <span class="immo-deposit-missing-section">(' + esc(item.section) + ")</span>" : "") +
                "</button></li>"
              );
            })
            .join("");
        list._focusMap = {};
        result.recommended.forEach(function (item) {
          list._focusMap[item.id] = item.el;
        });
      } else {
        panel.hidden = true;
        list.innerHTML = "";
      }
      return;
    }

    panel.hidden = false;
    list.innerHTML = result.blocking
      .map(function (item, i) {
        return (
          '<li><button type="button" class="immo-deposit-missing-link" data-sell-focus="' +
          esc(item.id) +
          '">' +
          (i + 1) +
          ". " +
          esc(item.label) +
          (item.section ? ' <span class="immo-deposit-missing-section">(' + esc(item.section) + ")</span>" : "") +
          "</button></li>"
        );
      })
      .join("");

    list._focusMap = {};
    result.blocking.forEach(function (item) {
      list._focusMap[item.id] = item.el;
    });
    updateJumpErrors(root, result.blocking.length);
  }

  function updateJumpErrors(root, count) {
    var jumpBtn = qs("[data-sell-jump-errors]", root);
    if (!jumpBtn) return;
    if (count > 0) {
      jumpBtn.hidden = false;
      jumpBtn.textContent =
        "Voir les " + count + " erreur" + (count > 1 ? "s" : "") + " ↑";
    } else {
      jumpBtn.hidden = true;
    }
  }

  function jumpToErrors(root, result) {
    root = root || qs("[data-listing-url-capture]");
    var panel = qs("#deposer-bien-errors", root) || qs("[data-sell-validation-panel]", root);
    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (result && result.blocking && result.blocking.length) {
      var firstLink = qs("[data-sell-validation-list] .immo-deposit-missing-link", root);
      if (firstLink) {
        try {
          firstLink.focus({ preventScroll: true });
        } catch (e) {}
      }
      if (result.blocking[0] && result.blocking[0].el) {
        setTimeout(function () {
          focusTarget(result.blocking[0].el);
        }, 350);
      }
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showSubmitError(errEl, result, root) {
    if (!errEl) return;
    root = root || qs("[data-listing-url-capture]");
    if (result.ok) {
      errEl.hidden = true;
      errEl.textContent = "";
      updateJumpErrors(root, 0);
      return;
    }
    errEl.hidden = false;
    var n = result.blocking.length;
    errEl.innerHTML =
      "<strong>Il manque " +
      n +
      " information" +
      (n > 1 ? "s" : "") +
      ' pour envoyer.</strong> ' +
      '<button type="button" class="immo-link-btn immo-err-jump" data-sell-jump-errors-inline>Voir la liste des erreurs et corriger →</button>';
    updateJumpErrors(root, n);
    var panel = qs("[data-sell-validation-panel]", root);
    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    jumpToErrors(root, result);
  }

  function serializeScope(scope) {
    if (!scope) return {};
    var data = {};
    qsa("input, select, textarea", scope).forEach(function (el) {
      if (el.disabled || el.type === "file" || el.name === "_hp") return;
      var n = el.name;
      if (!n) return;
      if (el.type === "checkbox") {
        if (n.indexOf("[]") === n.length - 2) {
          var key = n.slice(0, -2);
          if (!data[key]) data[key] = [];
          if (el.checked) data[key].push(el.value);
        } else {
          data[n] = el.checked;
        }
      } else if (el.type === "radio") {
        if (el.checked) data[n] = el.value;
      } else {
        data[n] = el.value;
      }
    });
    return data;
  }

  function applyScope(scope, data) {
    if (!scope || !data) return;
    Object.keys(data).forEach(function (name) {
      var valData = data[name];
      var nodes = qsa('[name="' + name + '"]', scope);
      if (!nodes.length) return;
      if (nodes[0].type === "checkbox" && Array.isArray(valData)) {
        nodes.forEach(function (el) {
          el.checked = valData.indexOf(el.value) >= 0;
        });
        return;
      }
      if (nodes[0].type === "checkbox") {
        nodes[0].checked = !!valData;
        return;
      }
      if (nodes[0].type === "radio") {
        nodes.forEach(function (el) {
          el.checked = el.value === String(valData);
        });
        return;
      }
      nodes[0].value = valData == null ? "" : valData;
    });
  }

  function createDraftId() {
    return "d_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function draftStorageKey(id) {
    return DRAFT_PREFIX + id;
  }

  function readIndex() {
    try {
      var raw = localStorage.getItem(INDEX_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeIndex(list) {
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, MAX_DRAFTS)));
    } catch (e) {}
  }

  function migrateDraftV1() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY_V1);
      if (!raw) return;
      var draft = JSON.parse(raw);
      if (!hasDraftContent(draft)) {
        localStorage.removeItem(DRAFT_KEY_V1);
        return;
      }
      var id = createDraftId();
      draft.id = id;
      draft.v = 2;
      localStorage.setItem(draftStorageKey(id), JSON.stringify(draft));
      writeIndex([{ id: id, savedAt: draft.savedAt || Date.now(), label: draftLabelFromData(draft) }]);
      localStorage.removeItem(DRAFT_KEY_V1);
    } catch (e) {}
  }

  function draftLabelFromData(draft) {
    if (!draft) return "Dossier";
    var f = draft.form || {};
    var p = draft.panel || {};
    var city = p.sellCity || f.city || "";
    var name = f.firstName || "";
    if (city && name) return name + " — " + city;
    if (city) return "Bien à " + city;
    if (name) return name;
    if (f.email) return f.email;
    return "Dossier vendeur";
  }

  function loadDraftById(id) {
    if (!id) return null;
    try {
      var raw = localStorage.getItem(draftStorageKey(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getActiveDraftId() {
    if (activeDraftId) return activeDraftId;
    try {
      activeDraftId = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    } catch (e) {}
    return activeDraftId;
  }

  function setActiveDraftId(id) {
    activeDraftId = id;
    try {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, id);
    } catch (e) {}
  }

  function startNewDemand(root, skipConfirm) {
    var form = qs("[data-url-capture-form]", root);
    if (!skipConfirm && formDirty && hasDraftContent(collectDraft())) {
      if (!confirm("Démarrer une nouvelle demande ? Le brouillon de cet onglet sera conservé séparément.")) return;
    }
    flushSave(true);
    var newId = createDraftId();
    setActiveDraftId(newId);
    formDirty = false;
    if (form) form.reset();
    var panel = qs("[data-search-vente-panel]");
    if (panel) {
      qsa("input, select, textarea", panel).forEach(function (el) {
        if (el.type === "hidden" || el.type === "file") return;
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });
    }
    var mount = qs("[data-owners-mount]");
    if (mount && global.AcheteurImmoOwners) global.AcheteurImmoOwners.render(mount, [{}]);
    if (global.AcheteurImmoDepositVente) global.AcheteurImmoDepositVente.sync();
    updateDraftBanner();
    updateSessionHint(root);
    refreshUi(root);
    showDraftToast("Nouvelle demande — brouillon séparé (ne remplace pas vos autres dossiers).");
    try {
      var params = new URLSearchParams(location.search);
      params.set("nouveau", "1");
      params.delete("reprise");
      history.replaceState(null, "", location.pathname + "?" + params.toString() + (location.hash || ""));
    } catch (urlErr) {}
  }

  function getLatestDraftId(excludeId) {
    var list = readIndex().sort(function (a, b) {
      return (b.savedAt || 0) - (a.savedAt || 0);
    });
    for (var i = 0; i < list.length; i++) {
      if (list[i].id && list[i].id !== excludeId) {
        var d = loadDraftById(list[i].id);
        if (d && hasDraftContent(d)) return list[i].id;
      }
    }
    return null;
  }

  function initDraftSession(root) {
    migrateDraftV1();
    var params = new URLSearchParams(location.search);
    var forceNew = params.get("nouveau") === "1";
    var reprise = params.get("reprise");
    var sessionId = null;
    try {
      sessionId = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    } catch (e) {}

    if (forceNew) {
      setActiveDraftId(createDraftId());
      formDirty = false;
      updateDraftBanner();
      updateSessionHint(root);
      return;
    }

    if (reprise && reprise !== "1") {
      setActiveDraftId(reprise);
      restoreDraftById(reprise, { silent: false });
      return;
    }

    if (reprise === "1") {
      var pick = getLatestDraftId(null);
      if (pick) {
        setActiveDraftId(pick);
        restoreDraftById(pick, { silent: false });
      } else {
        setActiveDraftId(createDraftId());
      }
      updateDraftBanner();
      updateSessionHint(root);
      return;
    }

    if (sessionId && loadDraftById(sessionId) && hasDraftContent(loadDraftById(sessionId))) {
      setActiveDraftId(sessionId);
      restoreDraftById(sessionId, { silent: true });
      updateSessionHint(root);
      return;
    }

    setActiveDraftId(createDraftId());
    formDirty = false;
    updateDraftBanner();
    updateSessionHint(root);
  }

  function updateSessionHint(root) {
    var hint = qs("[data-sell-draft-session]", root);
    if (!hint) return;
    var id = getActiveDraftId();
    var others = readIndex().filter(function (x) {
      return x.id && x.id !== id && hasDraftContent(loadDraftById(x.id));
    }).length;
    hint.hidden = false;
    hint.textContent =
      "Demande en cours dans cet onglet (brouillon n° " +
      (id ? id.slice(-6) : "?") +
      "). " +
      (others
        ? others + " autre(s) dossier(s) sauvegardé(s) sur cet appareil — ouvrez « Nouvelle demande » pour ne pas les mélanger."
        : "Sauvegarde automatique si vous quittez la page par accident.");
  }

  function collectDraft() {
    var form = qs("[data-url-capture-form]");
    var panel = qs("[data-search-vente-panel]");
    var ownersMount = qs("[data-owners-mount]");
    var owners = [];
    if (ownersMount && global.AcheteurImmoOwners && global.AcheteurImmoOwners.collect) {
      owners = global.AcheteurImmoOwners.collect(ownersMount);
    }
    return {
      v: 2,
      id: getActiveDraftId(),
      savedAt: Date.now(),
      hat: document.documentElement.getAttribute("data-immo-hat") || radioVal(document, "immoHat"),
      listingMode: radioVal(document, "listingMode"),
      form: serializeScope(form),
      panel: serializeScope(panel),
      owners: owners,
      openBlocks: qsa("details.immo-vente-block[open]").map(function (d) {
        var s = d.querySelector("summary");
        return s ? s.textContent.trim() : "";
      }),
    };
  }

  function hasDraftContent(draft) {
    if (!draft) return false;
    var f = draft.form || {};
    var p = draft.panel || {};
    return !!(
      f.firstName ||
      f.lastName ||
      f.email ||
      f.phone ||
      f.city ||
      f.description ||
      (draft.owners && draft.owners.length && (draft.owners[0].firstName || draft.owners[0].lastName)) ||
      p.sellCity ||
      p.sellAddress ||
      p.sellPostalCode
    );
  }

  function saveDraft(silent, opts) {
    opts = opts || {};
    try {
      var id = getActiveDraftId();
      if (!id) {
        id = createDraftId();
        setActiveDraftId(id);
      }
      var draft = collectDraft();
      draft.id = id;
      if (!hasDraftContent(draft) && !opts.force && !formDirty) return false;
      if (!hasDraftContent(draft) && !opts.force) return false;
      localStorage.setItem(draftStorageKey(id), JSON.stringify(draft));
      var label = draftLabelFromData(draft);
      var index = readIndex().filter(function (x) {
        return x.id !== id;
      });
      index.unshift({ id: id, savedAt: draft.savedAt, label: label });
      writeIndex(index);
      updateDraftBanner();
      updateSessionHint();
      if (!silent) showDraftToast("Brouillon enregistré — reprenez plus tard sans perdre vos saisies.");
      return true;
    } catch (e) {
      return false;
    }
  }

  function flushSave(force) {
    clearTimeout(saveTimer);
    saveDraft(true, { force: !!force });
  }

  function restoreDraftById(id, opts) {
    opts = opts || {};
    var draft = loadDraftById(id);
    if (!draft) return false;
    setActiveDraftId(id);
    applyDraftToForm(draft);
    formDirty = true;
    if (!opts.silent) showDraftToast("Dossier repris — complétez puis envoyez.");
    hideDraftBanner();
    refreshUi();
    return true;
  }

  function applyDraftToForm(draft) {
    var form = qs("[data-url-capture-form]");
    var panel = qs("[data-search-vente-panel]");
    applyScope(form, draft.form);
    applyScope(panel, draft.panel);
    if (draft.owners && draft.owners.length) {
      var mount = qs("[data-owners-mount]");
      if (mount && global.AcheteurImmoOwners) global.AcheteurImmoOwners.render(mount, draft.owners);
    }
    if (draft.hat) {
      document.documentElement.setAttribute("data-immo-hat", draft.hat);
      var r = document.querySelector("[name='immoHat'][value='" + draft.hat + "']");
      if (r) r.checked = true;
    }
    if (draft.listingMode) {
      var lm = document.querySelector("[name='listingMode'][value='" + draft.listingMode + "']");
      if (lm) lm.checked = true;
    }
    if (global.AcheteurImmoDepositVente) global.AcheteurImmoDepositVente.sync();
    if (draft.openBlocks && draft.openBlocks.length) {
      qsa("details.immo-vente-block").forEach(function (d) {
        var s = d.querySelector("summary");
        if (s && draft.openBlocks.indexOf(s.textContent.trim()) >= 0) d.open = true;
      });
    }
    try {
      document.dispatchEvent(new CustomEvent("lo:deposit-draft-restored"));
    } catch (e) {}
  }

  function restoreDraft(draft) {
    if (draft && draft.id) return restoreDraftById(draft.id);
    var pick = getLatestDraftId(getActiveDraftId());
    if (pick) return restoreDraftById(pick);
    return false;
  }

  function clearDraft() {
    try {
      var id = getActiveDraftId();
      if (id) {
        localStorage.removeItem(draftStorageKey(id));
        writeIndex(
          readIndex().filter(function (x) {
            return x.id !== id;
          })
        );
      }
    } catch (e) {}
    formDirty = false;
    hideDraftBanner();
    updateSessionHint();
  }

  function clearDraftAfterSubmit() {
    clearDraft();
    try {
      sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    } catch (e) {}
    activeDraftId = null;
  }

  function formatDraftDate(ts) {
    try {
      return new Date(ts).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  function updateDraftBanner() {
    var banner = qs("[data-sell-draft-banner]");
    var text = qs("[data-sell-draft-text]");
    if (!banner || !text) return;
    var currentId = getActiveDraftId();
    var current = loadDraftById(currentId);
    if (current && hasDraftContent(current)) {
      banner.hidden = true;
      return;
    }
    var pick = getLatestDraftId(currentId);
    if (!pick) {
      banner.hidden = true;
      return;
    }
    var draft = loadDraftById(pick);
    var meta = readIndex().find(function (x) {
      return x.id === pick;
    });
    text.textContent =
      "Dossier sauvegardé" +
      (meta && meta.label ? " (« " + meta.label + " »)" : "") +
      " — " +
      formatDraftDate(draft.savedAt) +
      ". Reprendre ou démarrer une nouvelle demande séparée.";
    banner.hidden = false;
  }

  function hideDraftBanner() {
    var banner = qs("[data-sell-draft-banner]");
    if (banner) banner.hidden = true;
  }

  function showDraftToast(msg) {
    var toast = qs("[data-sell-draft-toast]");
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showDraftToast._t);
    showDraftToast._t = setTimeout(function () {
      toast.hidden = true;
    }, 5000);
  }

  function refreshUi(root) {
    root = root || qs("[data-listing-url-capture]");
    if (!root) return;
    var form = qs("[data-url-capture-form]", root);
    if (!form) return;
    var ctx = buildCtx(form, root);
    var result = validate(ctx);
    renderValidationPanel(root, result);
  }

  function buildCtx(form, root) {
    var Portals = global.ImmoListingPortals;
    var area = qs("[data-listing-urls]", root);
    var urlsText = area ? area.value : "";
    var hits = Portals
      ? Portals.detectMany(urlsText).filter(function (d) {
          return d.ok;
        })
      : [];
    var thumbs = qs("[data-listing-thumbs]", root);
    var photoCount = thumbs ? thumbs.querySelectorAll(".listing-thumb").length : 0;
    return {
      form: form,
      hat: val(form, "role") || radioVal(document, "immoHat"),
      urlHits: hits,
      photoCount: photoCount,
    };
  }

  function scheduleRefreshUi(root) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      refreshUi(root);
    }, 120);
  }

  function markDirty() {
    formDirty = true;
    scheduleSave();
    scheduleRefreshUi(qs("[data-listing-url-capture]"));
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveDraft(true);
    }, SAVE_DELAY_MS);
  }

  function bindUnloadGuards() {
    if (bindUnloadGuards._bound) return;
    bindUnloadGuards._bound = true;
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flushSave(true);
    });
    window.addEventListener("pagehide", function () {
      flushSave(true);
    });
  }

  function bind(root) {
    if (!root || root.dataset.depositGuideBound) return;
    root.dataset.depositGuideBound = "1";
    var form = qs("[data-url-capture-form]", root);

    initDraftSession(root);
    bindUnloadGuards();

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-sell-jump-errors], [data-sell-jump-errors-inline]")) {
        e.preventDefault();
        var ctx = buildCtx(form, root);
        jumpToErrors(root, validate(ctx));
        return;
      }
      var focusBtn = e.target.closest("[data-sell-focus]");
      if (focusBtn) {
        var list = qs("[data-sell-validation-list]", root);
        var id = focusBtn.getAttribute("data-sell-focus");
        if (list && list._focusMap && list._focusMap[id]) focusTarget(list._focusMap[id]);
        return;
      }
      if (e.target.closest("[data-sell-draft-restore]")) {
        restoreDraft();
        updateSessionHint(root);
        return;
      }
      if (e.target.closest("[data-sell-draft-new]")) {
        startNewDemand(root, false);
        return;
      }
      if (e.target.closest("[data-sell-draft-dismiss]")) {
        clearDraft();
        showDraftToast("Brouillon de cet onglet effacé.");
        return;
      }
      if (e.target.closest("[data-sell-draft-save]")) {
        saveDraft(false);
      }
    });

    if (form) {
      form.addEventListener("input", markDirty);
      form.addEventListener("change", markDirty);
    }
    var panel = qs("[data-search-vente-panel]");
    if (panel) {
      panel.addEventListener("input", markDirty);
      panel.addEventListener("change", markDirty);
    }

    document.addEventListener("lo:deposit-draft-restored", function () {
      refreshUi(root);
    });

    refreshUi(root);
  }

  function boot() {
    qsa("[data-listing-url-capture]").forEach(bind);
  }

  global.AcheteurImmoDepositGuide = {
    validate: validate,
    renderValidationPanel: renderValidationPanel,
    showSubmitError: showSubmitError,
    jumpToErrors: jumpToErrors,
    buildCtx: buildCtx,
    focusTarget: focusTarget,
    saveDraft: saveDraft,
    restoreDraft: restoreDraft,
    clearDraft: clearDraft,
    clearDraftAfterSubmit: clearDraftAfterSubmit,
    startNewDemand: startNewDemand,
    refreshUi: refreshUi,
    flushSave: flushSave,
    getConfirmMethod: getConfirmMethod,
    contactSatisfied: contactSatisfied,
    sessionEmail: sessionEmail,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
