/**
 * Champs typologie annonce / bien — questionnaire vente propriétaire.
 */
(function () {
  var T = function () {
    return window.ImmoListingTaxonomy;
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function fillSelect(el, html) {
    if (!el) return;
    el.innerHTML = html;
  }

  function initSelects(root) {
    var tax = T();
    if (!tax) return;
    fillSelect(qs("#sellListingType", root), tax.optionsHtml(tax.LISTING_TYPES, "— Choisir —"));
    fillSelect(qs("#sellPropertyCategory", root), tax.optionsHtml(tax.PROPERTY_CATEGORIES, "— Choisir —"));
    fillSelect(qs("#sellCoproStatus", root), tax.optionsHtml(tax.COPRO_STATUS, null));
    fillSelect(qs("#sellEnvironment", root), tax.optionsHtml(tax.ENVIRONMENTS, null));
    fillSelect(qs("#sellGeneralCondition", root), tax.optionsHtml(tax.GENERAL_CONDITIONS, null));
    rebuildSubtype(root, "");
    rebuildCommercialActivity(root, "");
  }

  function rebuildSubtype(root, filter) {
    var tax = T();
    var sel = qs("#sellPropertySubtype", root);
    if (!sel || !tax) return;
    var cur = sel.value;
    var q = tax.normalizeSearch(filter);
    var list = tax.sortedSubtypes().filter(function (label) {
      if (!q) return true;
      return tax.normalizeSearch(label).indexOf(q) >= 0;
    });
    sel.innerHTML = tax.optionsHtml(list, "— Choisir —");
    if (cur && sel.querySelector('option[value="' + cur + '"]')) sel.value = cur;
  }

  function rebuildCommercialActivity(root, filter) {
    var tax = T();
    var sel = qs("#sellCommercialActivity", root);
    if (!sel || !tax) return;
    var cur = sel.value;
    var groups = tax.filteredCommercialGroups(filter);
    sel.innerHTML = tax.groupedOptionsHtml(groups, "— Choisir —");
    if (cur && sel.querySelector('option[value="' + cur + '"]')) sel.value = cur;
  }

  function syncLegacyPropertyType(root) {
    var tax = T();
    if (!tax) return;
    var cat = qs("#sellPropertyCategory", root);
    var sub = qs("#sellPropertySubtype", root);
    var legacy = tax.legacyPropertyType(
      cat && cat.value,
      sub && sub.options[sub.selectedIndex] ? sub.options[sub.selectedIndex].textContent : sub && sub.value
    );
    var radios = root.querySelectorAll('[name="sellPropertyType"]');
    radios.forEach(function (r) {
      r.checked = r.value === legacy;
    });
    var hidden = qs("#sellPropertyTypeLegacy", root);
    if (hidden) hidden.value = legacy;
  }

  function toggleCommercialRequired(root) {
    var tax = T();
    var cat = qs("#sellPropertyCategory", root);
    var sub = qs("#sellPropertySubtype", root);
    var act = qs("#sellCommercialActivity", root);
    var hint = qs("[data-commercial-hint]", root);
    if (!act) return;
    var pro =
      (cat && tax && tax.PRO_CATEGORIES[cat.value]) ||
      (sub &&
        sub.options[sub.selectedIndex] &&
        /local|commerce|entrep|bar|ferme|exploitation|entreprise|fonds/i.test(sub.options[sub.selectedIndex].textContent));
    act.required = !!pro;
    if (hint) hint.hidden = !pro;
  }

  function bind(root) {
    if (!root || root.dataset.listingFieldsBound) return;
    root.dataset.listingFieldsBound = "1";
    initSelects(root);

    var filter = qs("#sellPropertySubtypeFilter", root);
    if (filter) {
      filter.addEventListener("input", function () {
        rebuildSubtype(root, filter.value);
      });
    }

    var actFilter = qs("#sellCommercialActivityFilter", root);
    if (actFilter) {
      actFilter.addEventListener("input", function () {
        rebuildCommercialActivity(root, actFilter.value);
      });
    }

    ["sellListingType", "sellPropertyCategory", "sellPropertySubtype"].forEach(function (id) {
      var el = qs("#" + id, root);
      if (el) {
        el.addEventListener("change", function () {
          syncLegacyPropertyType(root);
          toggleCommercialRequired(root);
        });
      }
    });

    syncLegacyPropertyType(root);
    toggleCommercialRequired(root);
  }

  function validate(root) {
    var ok = true;
    var listing = qs("#sellListingType", root);
    var category = qs("#sellPropertyCategory", root);
    var subtype = qs("#sellPropertySubtype", root);
    var hint = qs("[data-listing-taxonomy-hint]", root);
    if (hint) hint.hidden = true;

    [listing, category].forEach(function (el) {
      if (!el) return;
      el.classList.remove("input-invalid");
      if (!el.value) {
        el.classList.add("input-invalid");
        ok = false;
      }
    });

    if (subtype) {
      subtype.classList.remove("input-invalid");
      if (!subtype.value) {
        subtype.classList.add("input-invalid");
        ok = false;
      }
    }

    var act = qs("#sellCommercialActivity", root);
    if (act && act.required && !(act.value || "").trim()) {
      act.classList.add("input-invalid");
      ok = false;
    } else if (act) act.classList.remove("input-invalid");

    if (!ok && hint) hint.hidden = false;
    syncLegacyPropertyType(root);
    return ok;
  }

  function hasPropertyType(root) {
    var cat = qs("#sellPropertyCategory", root);
    if (cat && cat.value) return true;
    return !!root.querySelector('[name="sellPropertyType"]:checked');
  }

  function boot() {
    document.querySelectorAll("[data-search-vente-panel]").forEach(bind);
  }

  window.AcheteurImmoListingFields = {
    bind: bind,
    validate: validate,
    hasPropertyType: hasPropertyType,
    syncLegacyPropertyType: syncLegacyPropertyType,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
