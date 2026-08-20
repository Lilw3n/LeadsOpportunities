/**
 * Registre UI : plusieurs URL d'annonces + mandat hors établissement (type, validité).
 */
(function () {
  var Lib = window.ImmoExternalListings;
  var Portals = window.ImmoListingPortals;
  if (!Lib) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function mandateOptions(selected) {
    return Lib.MANDATE_TYPES.map(function (m) {
      return (
        '<option value="' +
        esc(m.id) +
        '"' +
        (selected === m.id ? " selected" : "") +
        ">" +
        esc(m.label) +
        "</option>"
      );
    }).join("");
  }

  function emptyRow() {
    return {
      url: "",
      portal: "",
      label: "",
      mandateType: "",
      validFrom: "",
      validTo: "",
      approximateDates: false,
      horsEtablissement: true,
      notes: "",
    };
  }

  function readRow(el) {
    if (!el) return null;
    var url = (el.querySelector("[data-el-url]") || {}).value || "";
    url = String(url).trim();
    if (!url) return null;
    return Lib.normalizeItem({
      url: url,
      mandateType: (el.querySelector("[data-el-mandate-type]") || {}).value,
      validFrom: (el.querySelector("[data-el-valid-from]") || {}).value,
      validTo: (el.querySelector("[data-el-valid-to]") || {}).value,
      approximateDates: (el.querySelector("[data-el-approx-dates]") || {}).checked,
      horsEtablissement: (el.querySelector("[data-el-hors-etab]") || {}).checked,
      notes: (el.querySelector("[data-el-notes]") || {}).value,
    });
  }

  function rowHtml(item, index) {
    item = item || emptyRow();
    var det = item.url ? Lib.detectUrl(item.url) : null;
    var pill = det && det.ok && det.portal !== "autre" ? '<span class="url-pill">' + esc(det.label) + "</span>" : "";
    return (
      '<div class="external-listing-row" data-external-listing-row data-index="' +
      index +
      '">' +
      '<div class="external-listing-row-head">' +
      '<span class="external-listing-row-title">Annonce ' +
      (index + 1) +
      "</span>" +
      '<span data-el-portal-pill>' +
      pill +
      "</span>" +
      '<button type="button" class="external-listing-remove" data-remove-external-listing aria-label="Retirer cette annonce">×</button>' +
      "</div>" +
      '<label class="external-listing-field">URL annonce (Leboncoin, SeLoger…)' +
      '<input type="url" data-el-url value="' +
      esc(item.url) +
      '" placeholder="https://www.leboncoin.fr/ad/…" autocomplete="off" />' +
      "</label>" +
      '<div class="external-listing-grid">' +
      '<label class="external-listing-field">Type de mandat' +
      '<select data-el-mandate-type>' +
      mandateOptions(item.mandateType) +
      "</select></label>" +
      '<label class="external-listing-field">Début validité' +
      '<input type="date" data-el-valid-from value="' +
      esc(item.validFrom) +
      '" /></label>' +
      '<label class="external-listing-field">Fin validité' +
      '<input type="date" data-el-valid-to value="' +
      esc(item.validTo) +
      '" /></label>' +
      '<label class="external-listing-check">' +
      '<input type="checkbox" data-el-approx-dates' +
      (item.approximateDates ? " checked" : "") +
      " /> Dates approximatives</label>" +
      '<label class="external-listing-check">' +
      '<input type="checkbox" data-el-hors-etab' +
      (item.horsEtablissement !== false ? " checked" : "") +
      " /> Mandat hors établissement</label>" +
      "</div>" +
      '<label class="external-listing-field">Agence / notes (optionnel)' +
      '<input type="text" data-el-notes value="' +
      esc(item.notes) +
      '" placeholder="Ex. Agence X, réf. mandat…" /></label>' +
      "</div>"
    );
  }

  function syncLegacyTextarea(root, list) {
    var area = qs(root, "[data-listing-urls]");
    if (!area) return;
    area.value = (list || [])
      .map(function (item) {
        return item.url;
      })
      .filter(Boolean)
      .join("\n");
  }

  function renderDetected(root, list) {
    var mount = qs(root, "[data-url-detected]");
    if (!mount) return;
    if (!list.length) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = list
      .map(function (item) {
        var cls = item.portal === "autre" ? " url-pill--unknown" : "";
        var extra = item.mandateType ? " · " + esc(Lib.mandateLabel(item.mandateType)) : "";
        return '<span class="url-pill' + cls + '" title="' + esc(item.url) + '">' + esc(item.label || item.portal) + extra + "</span>";
      })
      .join("");
  }

  function updatePortalPill(rowEl) {
    if (!rowEl) return;
    var url = ((rowEl.querySelector("[data-el-url]") || {}).value || "").trim();
    var mount = rowEl.querySelector("[data-el-portal-pill]");
    if (!mount) return;
    if (!url) {
      mount.innerHTML = "";
      return;
    }
    var det = Lib.detectUrl(url);
    if (det.ok && det.portal !== "autre") mount.innerHTML = '<span class="url-pill">' + esc(det.label) + "</span>";
    else mount.innerHTML = '<span class="url-pill url-pill--unknown">URL</span>';
  }

  function collect(root) {
    root = root || document;
    var mount = qs(root, "[data-external-listings-list]");
    if (!mount) {
      var area = qs(root, "[data-listing-urls]");
      if (area && Portals) {
        return Lib.fromLegacyUrls(area.value);
      }
      return [];
    }
    var rows = mount.querySelectorAll("[data-external-listing-row]");
    var list = [];
    rows.forEach(function (row) {
      var item = readRow(row);
      if (item) list.push(item);
    });
    return Lib.normalizeList(list);
  }

  function render(root, items) {
    var mount = qs(root, "[data-external-listings-list]");
    if (!mount) return;
    items = items && items.length ? items : [emptyRow()];
    mount.innerHTML = items.map(rowHtml).join("");
    var list = collect(root);
    syncLegacyTextarea(root, list);
    renderDetected(root, list);
  }

  function bind(root) {
    if (!root || root.dataset.externalListingsBound) return;
    root.dataset.externalListingsBound = "1";

    var addBtn = qs(root, "[data-external-listings-add]");
    var listMount = qs(root, "[data-external-listings-list]");
    var legacyToggle = qs(root, "[data-external-listings-legacy-toggle]");
    var legacyArea = qs(root, "[data-listing-urls-legacy]");

    function emitChange() {
      var list = collect(root);
      syncLegacyTextarea(root, list);
      renderDetected(root, list);
      try {
        root.dispatchEvent(new CustomEvent("external-listings-change", { bubbles: true, detail: { list: list } }));
      } catch (e) {}
    }

    if (addBtn && listMount) {
      addBtn.addEventListener("click", function () {
        var current = collect(root);
        current.push(emptyRow());
        render(root, current.length ? current : [emptyRow()]);
      });
    }

    if (legacyToggle && legacyArea) {
      legacyToggle.addEventListener("click", function () {
        legacyArea.hidden = !legacyArea.hidden;
        legacyToggle.setAttribute("aria-expanded", legacyArea.hidden ? "false" : "true");
      });
    }

    root.addEventListener("input", function (e) {
      var row = e.target.closest("[data-external-listing-row]");
      if (row && e.target.matches("[data-el-url]")) updatePortalPill(row);
      if (row || e.target.matches("[data-listing-urls-legacy]")) emitChange();
    });

    root.addEventListener("change", function (e) {
      if (e.target.closest("[data-external-listing-row]") || e.target.matches("[data-listing-urls-legacy]")) emitChange();
    });

    root.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-remove-external-listing]");
      if (!rm) return;
      var row = rm.closest("[data-external-listing-row]");
      if (!row || !listMount) return;
      var rows = listMount.querySelectorAll("[data-external-listing-row]");
      if (rows.length <= 1) {
        render(root, [emptyRow()]);
        return;
      }
      row.remove();
      emitChange();
    });

    if (legacyArea) {
      legacyArea.addEventListener("blur", function () {
        var parsed = Lib.fromLegacyUrls(legacyArea.value);
        if (parsed.length) render(root, parsed);
      });
    }

    if (!listMount.children.length) render(root, [emptyRow()]);
  }

  function init(root, initialItems) {
    if (!root) return;
    if (initialItems && initialItems.length) render(root, initialItems);
    else if (!root.querySelector("[data-external-listing-row]")) render(root, [emptyRow()]);
    bind(root);
  }

  function urlHits(root) {
    return Lib.toUrlHits(collect(root));
  }

  window.ImmoExternalListingsUi = {
    init: init,
    collect: collect,
    render: render,
    urlHits: urlHits,
    emptyRow: emptyRow,
    readRow: readRow,
    rowHtml: rowHtml,
  };
})();
