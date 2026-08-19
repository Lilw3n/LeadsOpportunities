/**
 * Guide dépôt vendeur : validation guidée, progression, brouillon local (reprise).
 */
(function (global) {
  var DRAFT_KEY = "lo_immo_deposit_draft_v1";
  var SAVE_DELAY_MS = 1200;

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

  function resolveCity(form) {
    var c = val(form, "city");
    if (c) return c;
    var sellEl = document.querySelector("#sellCity");
    if (sellEl && String(sellEl.value || "").trim()) return String(sellEl.value).trim();
    if (global.AcheteurImmoDepositVente && global.AcheteurImmoDepositVente.collectSellDossier) {
      var sd = global.AcheteurImmoDepositVente.collectSellDossier();
      if (sd && sd.sellCity && String(sd.sellCity).trim()) return String(sd.sellCity).trim();
    }
    return "";
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

    if ((isOwner || isSignalement) && !resolveCity(form) && !hits.length) {
      var cityEl = document.querySelector("#sellCity") || form.querySelector("[name='city']");
      blocking.push(
        missingItem(
          "city",
          "Ville du bien (ou URL d'annonce)",
          cityEl,
          isSignalement ? "Signalement" : "Coordonnées du bien"
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

    if (!hasEmail(form) && !hasPhone(form)) {
      blocking.push(
        missingItem(
          "contact",
          "E-mail ou téléphone pour vous recontacter",
          form.querySelector("[name='email']") || form.querySelector("[name='phone']"),
          "Vos coordonnées"
        )
      );
    }

    if (isOwner) {
      if (!val(form, "firstName")) {
        recommended.push(missingItem("firstName", "Prénom", form.querySelector("[name='firstName']"), "Coordonnées"));
      }
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
      var sellType = document.querySelector('[name="sellPropertyType"]:checked');
      if (!sellType) {
        recommended.push(
          missingItem(
            "sellPropertyType",
            "Type de bien (appartement, maison…)",
            document.querySelector('[name="sellPropertyType"]'),
            "Descriptif"
          )
        );
      }
    }

    return {
      ok: blocking.length === 0,
      blocking: blocking,
      recommended: recommended,
      progress: computeProgress(form, isOwner, isSignalement, hits.length, photos, blocking, recommended),
    };
  }

  function computeProgress(form, isOwner, isSignalement, urlCount, photoCount, blocking, recommended) {
    var steps = [];
    steps.push({ id: "contact", done: hasEmail(form) || hasPhone(form), label: "Contact" });
    steps.push({
      id: "bien",
      done: !!resolveCity(form) || urlCount > 0,
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
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showSubmitError(errEl, result) {
    if (!errEl) return;
    if (result.ok) {
      errEl.hidden = true;
      errEl.textContent = "";
      return;
    }
    errEl.hidden = false;
    errEl.innerHTML =
      "<strong>Il manque " +
      result.blocking.length +
      " information" +
      (result.blocking.length > 1 ? "s" : "") +
      " pour envoyer.</strong> Cliquez sur un point ci-dessus pour y accéder directement.";
    if (result.blocking[0] && result.blocking[0].el) focusTarget(result.blocking[0].el);
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

  function collectDraft() {
    var form = qs("[data-url-capture-form]");
    var panel = qs("[data-search-vente-panel]");
    var ownersMount = qs("[data-owners-mount]");
    var owners = [];
    if (ownersMount && global.AcheteurImmoOwners && global.AcheteurImmoOwners.collect) {
      owners = global.AcheteurImmoOwners.collect(ownersMount);
    }
    return {
      v: 1,
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

  function saveDraft(silent) {
    try {
      var draft = collectDraft();
      if (!hasDraftContent(draft)) return false;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      updateDraftBanner(draft);
      if (!silent) showDraftToast("Brouillon enregistré sur cet appareil — vous pourrez reprendre plus tard.");
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadDraftRaw() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function restoreDraft(draft) {
    draft = draft || loadDraftRaw();
    if (!draft) return false;
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
    showDraftToast("Dossier repris — complétez les informations manquantes puis envoyez.");
    hideDraftBanner();
    refreshUi();
    return true;
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    hideDraftBanner();
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

  function updateDraftBanner(draft) {
    var banner = qs("[data-sell-draft-banner]");
    var text = qs("[data-sell-draft-text]");
    if (!banner || !text) return;
    draft = draft || loadDraftRaw();
    if (!draft || !hasDraftContent(draft)) {
      banner.hidden = true;
      return;
    }
    text.textContent = "Brouillon du " + formatDraftDate(draft.savedAt) + " — reprenez votre dossier vendeur.";
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

  var saveTimer = null;

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveDraft(true);
    }, SAVE_DELAY_MS);
  }

  function bind(root) {
    if (!root || root.dataset.depositGuideBound) return;
    root.dataset.depositGuideBound = "1";
    var form = qs("[data-url-capture-form]", root);

    root.addEventListener("click", function (e) {
      var focusBtn = e.target.closest("[data-sell-focus]");
      if (focusBtn) {
        var list = qs("[data-sell-validation-list]", root);
        var id = focusBtn.getAttribute("data-sell-focus");
        if (list && list._focusMap && list._focusMap[id]) focusTarget(list._focusMap[id]);
        return;
      }
      if (e.target.closest("[data-sell-draft-restore]")) {
        restoreDraft();
        return;
      }
      if (e.target.closest("[data-sell-draft-dismiss]")) {
        clearDraft();
        showDraftToast("Brouillon effacé.");
        return;
      }
      if (e.target.closest("[data-sell-draft-save]")) {
        saveDraft(false);
      }
    });

    if (form) {
      form.addEventListener("input", scheduleSave);
      form.addEventListener("change", scheduleSave);
    }
    var panel = qs("[data-search-vente-panel]");
    if (panel) {
      panel.addEventListener("input", scheduleSave);
      panel.addEventListener("change", scheduleSave);
    }

    document.addEventListener("lo:deposit-draft-restored", function () {
      refreshUi(root);
    });

    updateDraftBanner();
    refreshUi(root);

    try {
      if (new URLSearchParams(window.location.search).get("reprise") === "1") {
        restoreDraft();
      }
    } catch (repriseErr) {}
  }

  function boot() {
    qsa("[data-listing-url-capture]").forEach(bind);
  }

  global.AcheteurImmoDepositGuide = {
    validate: validate,
    renderValidationPanel: renderValidationPanel,
    showSubmitError: showSubmitError,
    buildCtx: buildCtx,
    focusTarget: focusTarget,
    saveDraft: saveDraft,
    restoreDraft: restoreDraft,
    clearDraft: clearDraft,
    refreshUi: refreshUi,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
