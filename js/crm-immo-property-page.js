(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  var Schema = window.CrmImmoSchema;
  if (!Store || !Matcher || !Schema) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var prop = id ? Store.getProperty(id) : null;
  if (!prop) {
    document.getElementById("propTitle").textContent = "Bien introuvable";
    document.getElementById("smartBanner").textContent = "Crée d’abord un bien depuis Piges.";
    return;
  }

  prop.details = prop.details || Schema.emptyDetails();
  prop.units = Array.isArray(prop.units) ? prop.units : [];
  prop.docs_checklist = prop.docs_checklist || {};
  prop.images = Array.isArray(prop.images) ? prop.images : [];
  prop.history = Array.isArray(prop.history) ? prop.history : [];

  var state = {
    tab: "description",
    sectionId: null,
    activeUnitId: null,
    unitSectionId: "identite",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }


  function euro(n) {
    n = Number(n) || 0;
    return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  function findUnit(uid) {
    return (prop.units || []).find(function (u) {
      return u.id === uid;
    }) || null;
  }

  function unitLabel(u) {
    if (!u) return "Unité";
    var t = (Schema.UNIT_TYPES.find(function (x) { return x.id === u.type; }) || {}).label || u.type || "Lot";
    return (u.label || t) + (u.lot_number ? " · lot " + u.lot_number : "");
  }

  function compositionTotals() {
    var D = window.CrmImmoDossier;
    if (D && D.unitTotals) return D.unitTotals(prop.units || []);
    return { units: (prop.units || []).length, loues: 0, surface_m2: 0, loyer_reel: 0, loyer_previsionnel: 0, charges_locatives: 0, nb_pieces: 0, nb_chambres: 0, nb_sdb: 0, nb_wc: 0, nb_cuisines: 0, baux_actifs: 0 };
  }

  function leaveUnitMode() {
    collectActiveView();
    state.activeUnitId = null;
    state.unitSectionId = "identite";
    state.sectionId = "composition";
    renderAll();
  }

  function openUnit(uid) {
    collectActiveView();
    state.activeUnitId = uid;
    state.unitSectionId = "identite";
    state.tab = "description";
    renderAll();
  }

  function collectActiveView() {
    if (state.activeUnitId) collectUnitSection();
    else if (state.sectionId === "composition") collectUnits();
    else if (state.sectionId === "pieces") collectDocs();
    else collectCurrentFields();
  }

  function ensureSectionBucket(secId) {
    if (!prop.details[secId] || typeof prop.details[secId] !== "object") prop.details[secId] = {};
    return prop.details[secId];
  }

  function readMeta() {
    prop.title = document.getElementById("mTitle").value.trim() || prop.title;
    prop.property_type = document.getElementById("mType").value;
    prop.transaction = document.getElementById("mTransaction").value;
    prop.status = document.getElementById("mStatus").value;
    prop.listing_source = document.getElementById("mSource").value;
    prop.listing_url = document.getElementById("mUrl").value.trim();
  }

  function syncHeader() {
    document.getElementById("propTitle").textContent = prop.title || "Bien";
    var typeLabel = (Schema.TYPES.find(function (t) {
      return t.id === prop.property_type;
    }) || {}).label || prop.property_type;
    var txLabel = (Schema.TRANSACTIONS.find(function (t) {
      return t.id === prop.transaction;
    }) || {}).label || prop.transaction;
    document.getElementById("propSub").textContent =
      typeLabel +
      " · " +
      txLabel +
      " · " +
      Matcher.propertyStatusLabel(prop.status) +
      " · " +
      (prop.city || "") +
      " " +
      (prop.postal_code || "") +
      (prop.units.length ? " · " + prop.units.length + " unité(s)" : "");
    var a = document.getElementById("linkAnnonce");
    if (prop.listing_url) {
      a.href = prop.listing_url;
      a.hidden = false;
    } else a.hidden = true;
    var ag = document.getElementById("linkAgenda");
    if (ag) {
      ag.href =
        "./crm-event-create.html?propertyId=" +
        encodeURIComponent(prop.id) +
        "&title=" +
        encodeURIComponent((prop.title || "Bien") + " — RDV") +
        "&type=visite";
    }
    var fin = document.getElementById("linkFinancement");
    if (fin && window.FinanceDeepLink) {
      fin.href = window.FinanceDeepLink.baremesUrl({
        propertyPrice: prop.price_fai || prop.price_net || "",
        prixFai: prop.price_fai || "",
        prixNet: prop.price_net || "",
        priceMode: prop.price_fai ? "fai" : "net_vendeur",
        propertyId: prop.id,
        utmSource: "crm-immo-fiche",
      });
    } else if (fin) {
      var qs = new URLSearchParams();
      if (prop.price_fai) qs.set("prixFai", Math.round(prop.price_fai));
      if (prop.price_net) qs.set("prixNet", Math.round(prop.price_net));
      qs.set("priceMode", prop.price_fai ? "fai" : "net_vendeur");
      qs.set("propertyId", prop.id);
      fin.href = "./crm-agency-fees.html?" + qs.toString();
    }
  }

  function fillMeta() {
    var mType = document.getElementById("mType");
    var mTx = document.getElementById("mTransaction");
    var mSource = document.getElementById("mSource");
    var mStatus = document.getElementById("mStatus");
    mType.innerHTML = Schema.TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    mTx.innerHTML = Schema.TRANSACTIONS.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    mStatus.innerHTML = Matcher.PROPERTY_STATUSES.map(function (s) {
      return '<option value="' + s.id + '">' + s.label + "</option>";
    }).join("");
    var Portals = window.ImmoListingPortals;
    if (Portals && Portals.groupedOptions) {
      mSource.innerHTML = Portals.groupedOptions()
        .map(function (g) {
          return (
            '<optgroup label="' +
            g.label +
            '">' +
            g.items
              .map(function (t) {
                return '<option value="' + t.id + '">' + t.label + "</option>";
              })
              .join("") +
            "</optgroup>"
          );
        })
        .join("");
    } else {
      mSource.innerHTML = Matcher.LISTING_SOURCES.map(function (t) {
        return '<option value="' + t.id + '">' + t.label + "</option>";
      }).join("");
    }
    document.getElementById("mTitle").value = prop.title || "";
    mType.value = prop.property_type || "appartement";
    mTx.value = prop.transaction || "vente";
    prop.status = Matcher.normalizePropertyStatus(prop.status);
    mStatus.value = prop.status;
    mSource.value = prop.listing_source || "manual";
    document.getElementById("mUrl").value = prop.listing_url || "";
  }

  function smartText() {
    var ctx = Schema.contextFlags(prop);
    var bits = [];
    bits.push("Type actif : <strong>" + esc(ctx.type) + "</strong> · transaction <strong>" + esc(ctx.transaction) + "</strong>.");
    if (ctx.type === "complexe" || prop.units.length) {
      bits.push("Composition : " + prop.units.length + " unité(s) — utile pour terrain → maison → appartements loués.");
    }
    if (ctx.has_rented_unit) bits.push("Au moins une unité est louée → section Bail & pièces locatives activées.");
    if (ctx.type === "appartement") bits.push("Sections Copropriété / Carrez prioritaires.");
    if (ctx.type === "terrain" || ctx.type === "complexe") bits.push("Sections Terrain / urbanisme / viabilisation prioritaires.");
    if (ctx.type === "local") bits.push("Mode professionnel : surfaces utiles & bail commercial possibles.");
    if (ctx.transaction === "location") bits.push("Mode location : loyers / dépôt / bail mis en avant.");
    document.getElementById("smartBanner").innerHTML = bits.join(" ");
  }

  function renderTabs() {
    document.getElementById("topTabs").innerHTML = Schema.TABS.map(function (t) {
      return (
        '<button type="button" data-tab="' +
        t.id +
        '" class="' +
        (state.tab === t.id ? "active" : "") +
        '">' +
        esc(t.label) +
        "</button>"
      );
    }).join("");
    document.querySelectorAll("#topTabs [data-tab]").forEach(function (btn) {
      btn.onclick = function () {
        collectActiveView();
        state.tab = btn.getAttribute("data-tab");
        renderAll();
      };
    });
  }

  function renderSide() {
    var nav = document.getElementById("sideNav");
    if (!nav) return;

    if (state.activeUnitId) {
      var unit = findUnit(state.activeUnitId);
      if (!unit) {
        state.activeUnitId = null;
      } else {
        var unitSecs = Schema.UNIT_SECTIONS || [];
        if (!state.unitSectionId || !unitSecs.some(function (s) { return s.id === state.unitSectionId; })) {
          state.unitSectionId = unitSecs[0] ? unitSecs[0].id : "identite";
        }
        nav.innerHTML =
          '<button type="button" class="side-back" id="btnBackComposition"><span>← Composition</span></button>' +
          '<div class="side-unit-tag">' +
          esc(unitLabel(unit)) +
          '<span class="occ-badge ' +
          (unit.occupation === "loue" || unit.loue ? "is-loue" : "is-vide") +
          '">' +
          (unit.occupation === "loue" || unit.loue ? "loué" : "vide") +
          "</span></div>" +
          unitSecs
            .map(function (s) {
              return (
                '<button type="button" data-unit-sec="' +
                s.id +
                '" class="' +
                (state.unitSectionId === s.id ? "active" : "") +
                '"><span>' +
                esc(s.label) +
                '</span><span class="chev">›</span></button>'
              );
            })
            .join("");
        var back = document.getElementById("btnBackComposition");
        if (back) back.onclick = leaveUnitMode;
        nav.querySelectorAll("[data-unit-sec]").forEach(function (btn) {
          btn.onclick = function () {
            collectUnitSection();
            state.unitSectionId = btn.getAttribute("data-unit-sec");
            renderSection();
            renderSide();
          };
        });
        return;
      }
    }

    var sections = Schema.visibleSections(prop);
    if (!state.sectionId || !sections.some(function (s) { return s.id === state.sectionId; })) {
      state.sectionId = sections[0] ? sections[0].id : null;
    }
    nav.innerHTML = sections
      .map(function (s) {
        return (
          '<button type="button" data-sec="' +
          s.id +
          '" class="' +
          (state.sectionId === s.id ? "active" : "") +
          '"><span>' +
          esc(s.label) +
          '</span><span class="chev">›</span></button>'
        );
      })
      .join("");
    nav.querySelectorAll("[data-sec]").forEach(function (btn) {
      btn.onclick = function () {
        collectActiveView();
        state.activeUnitId = null;
        state.sectionId = btn.getAttribute("data-sec");
        renderSection();
        renderSide();
      };
    });
  }

  function triHtml(fieldId, value) {
    var v = value || "any";
    return (
      '<div class="tri" data-field="' +
      esc(fieldId) +
      '">' +
      '<button type="button" data-v="yes" class="' +
      (v === "yes" ? "active-yes" : "") +
      '">✓</button>' +
      '<button type="button" data-v="any" class="' +
      (v === "any" ? "active-any" : "") +
      '">○</button>' +
      '<button type="button" data-v="no" class="' +
      (v === "no" ? "active-no" : "") +
      '">✕</button></div>'
    );
  }

  function fieldHtml(field, value) {
    var ctrl = "";
    if (field.type === "tri") ctrl = triHtml(field.id, value);
    else if (field.type === "select") {
      ctrl =
        '<select data-field="' +
        esc(field.id) +
        '">' +
        (field.options || [])
          .map(function (o) {
            var val = o == null ? "" : String(o);
            return (
              '<option value="' +
              esc(val) +
              '"' +
              (String(value || "") === val ? " selected" : "") +
              ">" +
              esc(val || "—") +
              "</option>"
            );
          })
          .join("") +
        "</select>";
    } else if (field.type === "textarea") {
      ctrl =
        '<textarea data-field="' +
        esc(field.id) +
        '" placeholder="Non renseigné">' +
        esc(value || "") +
        "</textarea>";
    } else {
      ctrl =
        '<input data-field="' +
        esc(field.id) +
        '" type="' +
        (field.type === "number" ? "number" : field.type === "date" ? "date" : "text") +
        '" value="' +
        esc(value || "") +
        '" placeholder="Non renseigné" />';
    }
    if (field.unit) ctrl += '<span class="field-unit">' + esc(field.unit) + "</span>";
    return (
      '<div class="field-row"><label class="' +
      (field.important ? "important" : "") +
      '">' +
      esc(field.label) +
      "</label><div class=\"field-ctrl\">" +
      ctrl +
      "</div></div>"
    );
  }

  function collectCurrentFields() {
    var body = document.getElementById("sectionBody");
    if (!body || !state.sectionId) return;
    if (state.sectionId === "composition" || state.sectionId === "pieces") return;
    var bucket = ensureSectionBucket(state.sectionId);
    body.querySelectorAll("[data-field]").forEach(function (el) {
      var fid = el.getAttribute("data-field");
      if (el.classList && el.classList.contains("tri")) return;
      bucket[fid] = el.value;
    });
    body.querySelectorAll(".tri[data-field]").forEach(function (group) {
      var fid = group.getAttribute("data-field");
      var active = group.querySelector(".active-yes, .active-no, .active-any");
      bucket[fid] = active ? active.getAttribute("data-v") : "any";
    });
  }

  function bindTri(root) {
    root.querySelectorAll(".tri").forEach(function (group) {
      group.querySelectorAll("button").forEach(function (btn) {
        btn.onclick = function () {
          group.querySelectorAll("button").forEach(function (b) {
            b.className = "";
          });
          var v = btn.getAttribute("data-v");
          btn.className = v === "yes" ? "active-yes" : v === "no" ? "active-no" : "active-any";
        };
      });
    });
  }


  function photoUrlsText(u) {
    var photos = (u && u.photos) || [];
    return photos
      .map(function (p) {
        return typeof p === "string" ? p : p && p.url ? p.url : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  function syncUnitDerived(obj) {
    if (obj.loyer_reel !== "" && obj.loyer_reel != null) obj.loyer = obj.loyer_reel;
    else if (obj.loyer !== "" && obj.loyer != null && (obj.loyer_reel === "" || obj.loyer_reel == null)) obj.loyer_reel = obj.loyer;
    if (obj.nb_pieces !== "" && obj.nb_pieces != null) obj.rooms = obj.nb_pieces;
    else if (obj.rooms !== "" && obj.rooms != null && (obj.nb_pieces === "" || obj.nb_pieces == null)) obj.nb_pieces = obj.rooms;
    if (obj.nb_chambres !== "" && obj.nb_chambres != null) obj.bedrooms = obj.nb_chambres;
    else if (obj.bedrooms !== "" && obj.bedrooms != null && (obj.nb_chambres === "" || obj.nb_chambres == null)) obj.nb_chambres = obj.bedrooms;
    return obj;
  }

  function collectUnitSection() {
    if (!state.activeUnitId) return;
    var unit = findUnit(state.activeUnitId);
    if (!unit) return;
    var body = document.getElementById("sectionBody");
    if (!body) return;
    var Dossier = window.CrmImmoDossier;
    body.querySelectorAll("[data-uk]").forEach(function (el) {
      var k = el.getAttribute("data-uk");
      if (el.type === "radio") {
        if (el.checked) unit[k] = el.value;
      } else if (el.type === "checkbox") unit[k] = el.checked;
      else if (k === "photos") {
        unit.photos = Dossier
          ? Dossier.normalizePhotoList(el.value)
          : String(el.value || "")
              .split(/\n+/)
              .map(function (s) { return s.trim(); })
              .filter(Boolean)
              .map(function (url) { return { url: url, kind: "photo" }; });
      } else if (k === "parent_id") {
        unit.parent_id = el.value || null;
      } else unit[k] = el.value;
    });
    if (unit.occupation === "loue" || unit.occupation === "vide") {
      unit.loue = unit.occupation === "loue";
    }
    if (body.querySelector("[data-pieces-editor]")) {
      unit.pieces_list = collectPiecesEditor(body);
      if (Dossier && Dossier.syncCountersFromPieces) Dossier.syncCountersFromPieces(unit);
    }
    syncUnitDerived(unit);
    if (Dossier && Dossier.normalizeUnit) {
      var idx = prop.units.findIndex(function (u) { return u.id === unit.id; });
      if (idx >= 0) prop.units[idx] = Dossier.normalizeUnit(unit);
    }
  }

  function roomTypes() {
    var D = window.CrmImmoDossier;
    return (D && D.ROOM_TYPES) || [
      { id: "chambre", label: "Chambre" },
      { id: "cuisine", label: "Cuisine" },
      { id: "sdb", label: "Salle de bain" },
      { id: "wc", label: "WC" },
      { id: "autre", label: "Autre" },
    ];
  }

  function collectPiecesEditor(root) {
    var rows = [];
    (root || document).querySelectorAll("[data-piece-row]").forEach(function (row) {
      var typeEl = row.querySelector("[data-pk=type]");
      var labelEl = row.querySelector("[data-pk=label]");
      var qtyEl = row.querySelector("[data-pk=qty]");
      var surfEl = row.querySelector("[data-pk=surface_m2]");
      var type = typeEl ? typeEl.value : "autre";
      var meta = roomTypes().find(function (t) { return t.id === type; });
      rows.push({
        id: row.getAttribute("data-piece-row") || undefined,
        type: type,
        label: labelEl && labelEl.value.trim() ? labelEl.value.trim() : meta ? meta.label : "Pièce",
        qty: qtyEl ? qtyEl.value : 1,
        surface_m2: surfEl ? surfEl.value : "",
      });
    });
    var D = window.CrmImmoDossier;
    return D && D.normalizePiecesList ? D.normalizePiecesList(rows) : rows;
  }

  function pieceRowHtml(piece) {
    piece = piece || {};
    var types = roomTypes();
    var typeOpts = types
      .map(function (t) {
        return (
          '<option value="' +
          esc(t.id) +
          '"' +
          (piece.type === t.id ? " selected" : "") +
          ">" +
          esc(t.label) +
          "</option>"
        );
      })
      .join("");
    return (
      '<div class="piece-row" data-piece-row="' +
      esc(piece.id || "") +
      '">' +
      '<select data-pk="type" title="Type">' +
      typeOpts +
      "</select>" +
      '<input data-pk="label" type="text" value="' +
      esc(piece.label || "") +
      '" placeholder="Libellé (ex. Chambre parentale)" />' +
      '<input data-pk="qty" type="number" min="1" step="1" value="' +
      esc(piece.qty != null ? piece.qty : 1) +
      '" title="Quantité" />' +
      '<input data-pk="surface_m2" type="number" min="0" step="0.1" value="' +
      esc(piece.surface_m2 || "") +
      '" placeholder="m²" title="Surface" />' +
      '<button type="button" class="btn btn-ghost btn-sm" data-del-piece title="Retirer">✕</button>' +
      "</div>"
    );
  }

  function piecesEditorHtml(unit) {
    var D = window.CrmImmoDossier;
    var list =
      unit.pieces_list && unit.pieces_list.length
        ? unit.pieces_list
        : D && D.seedPiecesFromCounters
          ? D.seedPiecesFromCounters(unit)
          : [];
    var summary =
      '<div class="pieces-summary">' +
      "Totaux dérivés : " +
      (Number(unit.nb_chambres) || 0) +
      " ch. · " +
      (Number(unit.nb_sdb) || 0) +
      " SDB · " +
      (Number(unit.nb_wc) || 0) +
      " WC · " +
      (Number(unit.nb_cuisines) || 0) +
      " cuisine(s)</div>";
    return (
      '<div class="field-row field-row-block"><label class="important">Pièces du lot</label><div class="field-ctrl field-ctrl-stack">' +
      '<p class="pieces-editor-hint">Ajoute chaque pièce (type, libellé, quantité, surface). Les compteurs chambres / SDB / WC / cuisines se recalculent pour les totaux composition.</p>' +
      summary +
      '<div class="pieces-editor" data-pieces-editor>' +
      (list.length
        ? list.map(pieceRowHtml).join("")
        : '<p class="pieces-empty">Aucune pièce — clique « Ajouter une pièce ».</p>') +
      "</div>" +
      '<div class="pieces-editor-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnAddPiece">+ Ajouter une pièce</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnAddPiecePreset">+ Chambre + SDB + WC + cuisine</button>' +
      "</div></div></div>"
    );
  }

  function bindPiecesEditor(root) {
    var editor = (root || document).querySelector("[data-pieces-editor]");
    if (!editor) return;
    var D = window.CrmImmoDossier;
    function refreshSummary() {
      var unit = findUnit(state.activeUnitId);
      if (!unit) return;
      unit.pieces_list = collectPiecesEditor(root);
      if (D && D.syncCountersFromPieces) D.syncCountersFromPieces(unit);
      var box = (root || document).querySelector(".pieces-summary");
      if (box) {
        box.textContent =
          "Totaux dérivés : " +
          (Number(unit.nb_chambres) || 0) +
          " ch. · " +
          (Number(unit.nb_sdb) || 0) +
          " SDB · " +
          (Number(unit.nb_wc) || 0) +
          " WC · " +
          (Number(unit.nb_cuisines) || 0) +
          " cuisine(s)";
      }
    }
    function ensureNotEmptyMsg() {
      var empty = editor.querySelector(".pieces-empty");
      if (empty && editor.querySelector("[data-piece-row]")) empty.remove();
    }
    editor.querySelectorAll("[data-del-piece]").forEach(function (btn) {
      btn.onclick = function () {
        var row = btn.closest("[data-piece-row]");
        if (row) row.remove();
        if (!editor.querySelector("[data-piece-row]")) {
          editor.innerHTML = '<p class="pieces-empty">Aucune pièce — clique « Ajouter une pièce ».</p>';
        }
        refreshSummary();
      };
    });
    editor.querySelectorAll("[data-pk]").forEach(function (el) {
      el.onchange = refreshSummary;
      el.oninput = refreshSummary;
    });
    var addBtn = document.getElementById("btnAddPiece");
    if (addBtn) {
      addBtn.onclick = function () {
        ensureNotEmptyMsg();
        var empty = editor.querySelector(".pieces-empty");
        if (empty) empty.remove();
        var piece = D && D.emptyPiece ? D.emptyPiece("chambre") : { id: "piece_new", type: "chambre", label: "Chambre", qty: 1, surface_m2: "" };
        editor.insertAdjacentHTML("beforeend", pieceRowHtml(piece));
        bindPiecesEditor(root);
        refreshSummary();
      };
    }
    var presetBtn = document.getElementById("btnAddPiecePreset");
    if (presetBtn) {
      presetBtn.onclick = function () {
        var empty = editor.querySelector(".pieces-empty");
        if (empty) empty.remove();
        ["chambre", "sdb", "wc", "cuisine"].forEach(function (type) {
          var piece = D && D.emptyPiece ? D.emptyPiece(type) : { type: type, label: type, qty: 1, surface_m2: "" };
          editor.insertAdjacentHTML("beforeend", pieceRowHtml(piece));
        });
        bindPiecesEditor(root);
        refreshSummary();
      };
    }
  }

  function bindOccupationToggle(root) {
    var box = (root || document).querySelector("[data-uk-occupation]");
    if (!box) return;
    box.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.onchange = function () {
        box.querySelectorAll(".occ-opt").forEach(function (lab) {
          lab.classList.toggle("is-on", !!(lab.querySelector("input") && lab.querySelector("input").checked));
        });
        var unit = findUnit(state.activeUnitId);
        if (!unit) return;
        unit.occupation = input.value;
        unit.loue = input.value === "loue";
        renderSide();
      };
    });
  }

  function unitFieldHtml(field, unit) {
    if (field.type === "pieces_editor") return piecesEditorHtml(unit);
    var val = unit[field.id];
    if (field.id === "photos") val = photoUrlsText(unit);
    var ctrl = "";
    if (field.type === "occupation") {
      var occ = unit.occupation === "loue" || unit.loue ? "loue" : "vide";
      ctrl =
        '<div class="occ-toggle" data-uk-occupation>' +
        '<label class="occ-opt' +
        (occ === "loue" ? " is-on" : "") +
        '"><input type="radio" name="occ_' +
        esc(unit.id) +
        '" data-uk="occupation" value="loue"' +
        (occ === "loue" ? " checked" : "") +
        " /> Loué</label>" +
        '<label class="occ-opt' +
        (occ === "vide" ? " is-on" : "") +
        '"><input type="radio" name="occ_' +
        esc(unit.id) +
        '" data-uk="occupation" value="vide"' +
        (occ === "vide" ? " checked" : "") +
        " /> Vide</label>" +
        "</div>";
    } else if (field.type === "checkbox") {
      ctrl = '<input type="checkbox" data-uk="' + esc(field.id) + '"' + (unit[field.id] ? " checked" : "") + " />";
    } else if (field.type === "unit_type") {
      ctrl =
        '<select data-uk="type">' +
        (Schema.UNIT_TYPES || [])
          .map(function (t) {
            return (
              '<option value="' + t.id + '"' + (unit.type === t.id ? " selected" : "") + ">" + esc(t.label) + "</option>"
            );
          })
          .join("") +
        "</select>";
    } else if (field.type === "unit_parent") {
      ctrl =
        '<select data-uk="parent_id"><option value="">— Aucun (racine) —</option>' +
        (prop.units || [])
          .filter(function (p) { return p.id !== unit.id; })
          .map(function (p) {
            return (
              '<option value="' +
              esc(p.id) +
              '"' +
              (unit.parent_id === p.id ? " selected" : "") +
              ">" +
              esc(unitLabel(p)) +
              "</option>"
            );
          })
          .join("") +
        "</select>";
    } else if (field.type === "unit_transaction") {
      ctrl =
        '<select data-uk="transaction">' +
        '<option value="vente"' + (unit.transaction === "vente" ? " selected" : "") + ">Vente</option>" +
        '<option value="location"' + (unit.transaction === "location" ? " selected" : "") + ">Location</option>" +
        "</select>";
    } else if (field.type === "select") {
      ctrl =
        '<select data-uk="' +
        esc(field.id) +
        '">' +
        (field.options || [])
          .map(function (o) {
            var v = o == null ? "" : String(o);
            return (
              '<option value="' + esc(v) + '"' + (String(val || "") === v ? " selected" : "") + ">" + esc(v || "—") + "</option>"
            );
          })
          .join("") +
        "</select>";
    } else if (field.type === "textarea" || field.type === "photos") {
      ctrl =
        '<textarea data-uk="' +
        esc(field.id) +
        '" rows="3" placeholder="Non renseigné">' +
        esc(val || "") +
        "</textarea>";
    } else {
      ctrl =
        '<input data-uk="' +
        esc(field.id) +
        '" type="' +
        (field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text") +
        '" value="' +
        esc(val || "") +
        '" placeholder="Non renseigné" />';
    }
    if (field.unit) ctrl += '<span class="field-unit">' + esc(field.unit) + "</span>";
    return (
      '<div class="field-row"><label class="' +
      (field.important ? "important" : "") +
      '">' +
      esc(field.label) +
      '</label><div class="field-ctrl">' +
      ctrl +
      "</div></div>"
    );
  }

  function renderUnitSection() {
    var unit = findUnit(state.activeUnitId);
    if (!unit) {
      leaveUnitMode();
      return "<p>Unité introuvable.</p>";
    }
    var sec =
      (Schema.UNIT_SECTIONS || []).find(function (s) {
        return s.id === state.unitSectionId;
      }) || (Schema.UNIT_SECTIONS || [])[0];
    if (!sec) return "<p>Aucune section unité.</p>";
    document.getElementById("sectionTitle").textContent = unitLabel(unit) + " · " + sec.label;
    document.getElementById("sectionHint").textContent = sec.hint || "Fiche détaillée de cette unité (barre noire à gauche).";
    return (
      '<div class="unit-mode-banner">' +
      "<strong>" +
      esc(unitLabel(unit)) +
      "</strong> — navigation noire dédiée à ce lot. " +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnBackComposition2">← Retour composition / totaux</button>' +
      "</div>" +
      (sec.fields || []).map(function (f) { return unitFieldHtml(f, unit); }).join("")
    );
  }

  function typeLabel(typeId) {
    var t = (Schema.UNIT_TYPES || []).find(function (x) {
      return x.id === typeId;
    });
    return (t && t.label) || typeId || "Lot";
  }

  function levelRole(typeId) {
    var D = window.CrmImmoDossier;
    var levels = (D && D.COMPOSITION_LEVELS) || [];
    var hit = levels.find(function (l) {
      return l.id === typeId;
    });
    return hit ? hit.role : "lot";
  }

  function renderCompositionNode(node, depth) {
    var u = node.unit;
    var D = window.CrmImmoDossier;
    var branch =
      D && D.subtreeTotals
        ? D.subtreeTotals(prop.units, u.id, false)
        : { units: node.children.length, loyer_reel: 0, loyer_previsionnel: 0, nb_pieces: 0, nb_chambres: 0 };
    var role = levelRole(u.type);
    var isLot = role === "lot" || role === "annexe";
    var html =
      '<div class="comp-node role-' +
      esc(role) +
      '" style="margin-left:' +
      depth * 18 +
      'px">' +
      '<div class="comp-node-main">' +
      '<span class="comp-type">' +
      esc(typeLabel(u.type)) +
      "</span>" +
      "<strong>" +
      esc(unitLabel(u)) +
      "</strong>" +
      '<div class="comp-meta">' +
      (u.floor ? "Étage " + esc(u.floor) + " · " : "") +
      (u.lot_number ? "lot " + esc(u.lot_number) + " · " : "") +
      (u.occupation === "loue" || u.loue
        ? '<span class="occ-badge is-loue">loué</span> · '
        : '<span class="occ-badge is-vide">vide</span> · ') +
      (u.locataire_nom ? esc(u.locataire_nom) + " · " : "") +
      esc(u.surface_m2 || "—") +
      " m²</div>";
    if (isLot) {
      html +=
        '<div class="comp-stats">Loyer réel ' +
        euro(u.loyer_reel || u.loyer) +
        " · prév. " +
        euro(u.loyer_previsionnel) +
        " · " +
        esc(u.nb_chambres || u.bedrooms || "0") +
        " ch. · " +
        esc(u.nb_sdb || "0") +
        " SDB · " +
        esc(u.nb_wc || "0") +
        " WC · " +
        esc(u.nb_cuisines || "0") +
        " cuisine(s)</div>";
    } else if (node.children.length) {
      html +=
        '<div class="comp-stats">Branche · ' +
        branch.units +
        " lot(s) · loyers réels " +
        euro(branch.loyer_reel) +
        " · prév. " +
        euro(branch.loyer_previsionnel) +
        " · " +
        (Number(branch.nb_pieces) || 0) +
        " pcs / " +
        (Number(branch.nb_chambres) || 0) +
        " ch.</div>";
    }
    html +=
      "</div>" +
      '<div class="comp-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" data-open-unit="' +
      esc(u.id) +
      '">Fiche (barre noire)</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-del-unit="' +
      esc(u.id) +
      '">Retirer</button>' +
      "</div></div>";
    (node.children || []).forEach(function (child) {
      html += renderCompositionNode(child, depth + 1);
    });
    return html;
  }

  function renderUnitsOverview() {
    var tot = compositionTotals();
    var D = window.CrmImmoDossier;
    var tree = D && D.buildCompositionTree ? D.buildCompositionTree(prop.units || []) : [];
    var html =
      '<div class="comp-synthesis">' +
      "<strong>Synthèse du modèle</strong>" +
      "<p>La composition empile les infos du plus large au plus fin : " +
      "<em>terrain / parcelle</em> → <em>immeuble ou maison</em> → <em>étage</em> → <em>appartement / local</em> " +
      "(+ dépendances). Chaque nœud ouvre sa propre barre noire (loyers, pièces, bail, médias). " +
      "Les totaux globaux et par branche remontent automatiquement.</p>" +
      '<ol class="comp-levels">' +
      "<li><b>Terrain</b> — cadastre, surface foncière, viabilisation</li>" +
      "<li><b>Immeuble / maison</b> — enveloppe bâtie, lots rattachés</li>" +
      "<li><b>Étage</b> — regroupement des lots d’un niveau</li>" +
      "<li><b>Appart / local</b> — loyer réel & prévisionnel, pièces, bail individuel</li>" +
      "</ol></div>";

    html +=
      '<div class="totals-grid">' +
      '<div class="total-card"><span class="total-label">Unités</span><strong>' +
      tot.units +
      "</strong><small>" +
      tot.loues +
      " louée(s)</small></div>" +
      '<div class="total-card"><span class="total-label">Loyers réels</span><strong>' +
      euro(tot.loyer_reel) +
      "</strong><small>/ mois</small></div>" +
      '<div class="total-card"><span class="total-label">Loyers prévisionnels</span><strong>' +
      euro(tot.loyer_previsionnel) +
      "</strong><small>/ mois</small></div>" +
      '<div class="total-card"><span class="total-label">Charges locatives</span><strong>' +
      euro(tot.charges_locatives) +
      "</strong><small>/ mois</small></div>" +
      '<div class="total-card"><span class="total-label">Surface</span><strong>' +
      (Number(tot.surface_m2) || 0) +
      " m²</strong></div>" +
      '<div class="total-card"><span class="total-label">Pièces / chambres</span><strong>' +
      (Number(tot.nb_pieces) || 0) +
      " / " +
      (Number(tot.nb_chambres) || 0) +
      "</strong></div>" +
      '<div class="total-card"><span class="total-label">SDB / WC / cuisines</span><strong>' +
      (Number(tot.nb_sdb) || 0) +
      " / " +
      (Number(tot.nb_wc) || 0) +
      " / " +
      (Number(tot.nb_cuisines) || 0) +
      "</strong></div>" +
      '<div class="total-card"><span class="total-label">Baux renseignés</span><strong>' +
      tot.baux_actifs +
      "</strong></div>" +
      "</div>";

    if (!prop.units.length) {
      html += '<p style="color:var(--muted)">Aucune unité — ajoute un lot ou utilise un preset.</p>';
    } else {
      html += '<h4 class="comp-tree-title">Schéma de composition</h4><div class="comp-tree">';
      if (tree.length) {
        tree.forEach(function (root) {
          html += renderCompositionNode(root, 0);
        });
      } else {
        prop.units.forEach(function (u) {
          html += renderCompositionNode({ unit: u, children: [] }, 0);
        });
      }
      html += "</div>";
    }

    html +=
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnAddUnit">+ Ajouter une unité</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnPresetComplex">Preset terrain + maison + 2 appts</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnPresetImmeuble">Preset immeuble (étages + appts)</button>' +
      "</div>";
    return html;
  }


  function collectUnits() {
    var cards = document.querySelectorAll(".unit-card[data-unit]");
    if (!cards.length && state.sectionId !== "composition") return;
    var Dossier = window.CrmImmoDossier;
    var next = [];
    cards.forEach(function (card) {
      var uid = card.getAttribute("data-unit");
      var prev = prop.units.find(function (u) {
        return u.id === uid;
      }) || { id: uid };
      var obj = Object.assign({}, prev);
      card.querySelectorAll("[data-k]").forEach(function (el) {
        var k = el.getAttribute("data-k");
        if (el.type === "checkbox") obj[k] = el.checked;
        else if (k === "photos") {
          obj.photos = Dossier
            ? Dossier.normalizePhotoList(el.value)
            : String(el.value || "")
                .split(/\n+/)
                .map(function (s) {
                  return s.trim();
                })
                .filter(Boolean)
                .map(function (url) {
                  return { url: url, kind: "photo" };
                });
        } else if (k === "parent_id") {
          obj.parent_id = el.value || null;
        } else obj[k] = el.value;
      });
      next.push(Dossier ? Dossier.normalizeUnit(obj) : obj);
    });
    if (cards.length) prop.units = next;
  }

  function renderDocs() {
    var html = '<p class="dossier-hint">Checklist intelligente : les groupes s’adaptent au type / vente-location / unités louées. Coche Requis / Reçu.</p>';
    Schema.DOC_GROUPS.forEach(function (group) {
      var items = group.items.filter(function (it) {
        return Schema.documentApplies(it, prop);
      });
      if (!items.length) return;
      html += '<div class="doc-group"><h4>' + esc(group.label) + "</h4>";
      html +=
        '<table class="doc-table"><thead><tr><th>Document</th><th>Requis</th><th>Reçu</th></tr></thead><tbody>';
      items.forEach(function (it) {
        var st = prop.docs_checklist[it.id] || {};
        var req = st.requis != null ? !!st.requis : Schema.suggestedRequired(it, prop);
        var rec = !!st.recu;
        html +=
          "<tr><td>" +
          esc(it.label) +
          '</td><td><input type="checkbox" data-doc="' +
          esc(it.id) +
          '" data-flag="requis"' +
          (req ? " checked" : "") +
          ' /></td><td><input type="checkbox" data-doc="' +
          esc(it.id) +
          '" data-flag="recu"' +
          (rec ? " checked" : "") +
          " /></td></tr>";
      });
      html += "</tbody></table></div>";
    });
    return html;
  }

  function collectDocs() {
    document.querySelectorAll("#sectionBody [data-doc]").forEach(function (el) {
      var did = el.getAttribute("data-doc");
      var flag = el.getAttribute("data-flag");
      if (!prop.docs_checklist[did]) prop.docs_checklist[did] = {};
      prop.docs_checklist[did][flag] = el.checked;
    });
  }

  function bindCompositionActions(body) {
    var btnAdd = document.getElementById("btnAddUnit");
    if (btnAdd) {
      btnAdd.onclick = function () {
        prop.units.push(Schema.emptyUnit(prop.property_type === "terrain" ? "terrain" : "appartement"));
        state.sectionId = "composition";
        renderSection();
        smartText();
        renderSide();
        syncHeader();
      };
    }
    var btnComplex = document.getElementById("btnPresetComplex");
    if (btnComplex) {
      btnComplex.onclick = function () {
        prop.property_type = "complexe";
        document.getElementById("mType").value = "complexe";
        var terrain = Object.assign(Schema.emptyUnit("terrain"), {
          label: "Terrain / parcelle",
          transaction: "vente",
          cadastre_ref: "",
        });
        var maison = Object.assign(Schema.emptyUnit("maison"), {
          label: "Maison principale",
          transaction: "vente",
          parent_id: terrain.id,
        });
        prop.units = [
          terrain,
          maison,
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 1",
            transaction: "location",
            loue: true,
            parent_id: maison.id,
            floor: "RDC",
            loyer_reel: 650,
            loyer_previsionnel: 700,
            nb_pieces: 3,
            nb_chambres: 2,
            nb_sdb: 1,
            nb_wc: 1,
            nb_cuisines: 1,
            type_bail: "Nu (loi 89)",
            locataire_nom: "",
          }),
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 2",
            transaction: "location",
            loue: true,
            parent_id: maison.id,
            floor: "1",
            loyer_reel: 750,
            loyer_previsionnel: 800,
            nb_pieces: 4,
            nb_chambres: 3,
            nb_sdb: 1,
            nb_wc: 1,
            nb_cuisines: 1,
            type_bail: "Meublé",
            locataire_nom: "",
          }),
        ];
        prop.is_parent_dossier = true;
        state.activeUnitId = null;
        state.sectionId = "composition";
        renderAll();
      };
    }
    var btnImmeuble = document.getElementById("btnPresetImmeuble");
    if (btnImmeuble) {
      btnImmeuble.onclick = function () {
        prop.property_type = "immeuble";
        document.getElementById("mType").value = "immeuble";
        var terrain = Object.assign(Schema.emptyUnit("terrain"), {
          label: "Parcelle / terrain",
          transaction: "vente",
          surface_m2: 420,
          cadastre_ref: "AB 123",
        });
        var immeuble = Object.assign(Schema.emptyUnit("immeuble"), {
          label: "Immeuble A",
          transaction: "vente",
          parent_id: terrain.id,
          surface_m2: 280,
        });
        var etageRdc = Object.assign(Schema.emptyUnit("etage"), {
          label: "RDC",
          floor: "RDC",
          parent_id: immeuble.id,
        });
        var etage1 = Object.assign(Schema.emptyUnit("etage"), {
          label: "1er étage",
          floor: "1",
          parent_id: immeuble.id,
        });
        var etage2 = Object.assign(Schema.emptyUnit("etage"), {
          label: "2e étage",
          floor: "2",
          parent_id: immeuble.id,
        });
        prop.units = [
          terrain,
          immeuble,
          etageRdc,
          etage1,
          etage2,
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement RDC",
            floor: "RDC",
            lot_number: "1",
            parent_id: etageRdc.id,
            transaction: "location",
            loue: true,
            loyer_reel: 580,
            loyer_previsionnel: 620,
            nb_pieces: 2,
            nb_chambres: 1,
            nb_sdb: 1,
            nb_wc: 1,
            nb_cuisines: 1,
            type_bail: "Nu (loi 89)",
            locataire_nom: "Martin",
          }),
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 1er",
            floor: "1",
            lot_number: "2",
            parent_id: etage1.id,
            transaction: "location",
            loue: true,
            loyer_reel: 640,
            loyer_previsionnel: 680,
            nb_pieces: 3,
            nb_chambres: 2,
            nb_sdb: 1,
            nb_wc: 1,
            nb_cuisines: 1,
            type_bail: "Meublé",
            locataire_nom: "Bernard",
          }),
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 2e",
            floor: "2",
            lot_number: "3",
            parent_id: etage2.id,
            transaction: "vente",
            nb_pieces: 3,
            nb_chambres: 2,
            nb_sdb: 1,
            nb_wc: 1,
            nb_cuisines: 1,
            loyer_previsionnel: 720,
          }),
          Object.assign(Schema.emptyUnit("dependance"), {
            label: "Cave / local technique",
            parent_id: immeuble.id,
            surface_m2: 12,
          }),
        ];
        prop.is_parent_dossier = true;
        state.activeUnitId = null;
        state.sectionId = "composition";
        renderAll();
      };
    }
    body.querySelectorAll("[data-open-unit]").forEach(function (btn) {
      btn.onclick = function () {
        openUnit(btn.getAttribute("data-open-unit"));
      };
    });
    body.querySelectorAll("[data-del-unit]").forEach(function (btn) {
      btn.onclick = function () {
        var uid = btn.getAttribute("data-del-unit");
        if (state.activeUnitId === uid) state.activeUnitId = null;
        prop.units = prop.units.filter(function (u) {
          return u.id !== uid;
        });
        prop.units.forEach(function (u) {
          if (u.parent_id === uid) u.parent_id = null;
        });
        state.sectionId = "composition";
        renderSection();
        smartText();
        renderSide();
        syncHeader();
      };
    });
  }

  function renderSection() {
    var body = document.getElementById("sectionBody");
    if (!body) return;

    if (state.activeUnitId) {
      if (!findUnit(state.activeUnitId)) {
        state.activeUnitId = null;
      } else {
        body.innerHTML = renderUnitSection();
        var back2 = document.getElementById("btnBackComposition2");
        if (back2) back2.onclick = leaveUnitMode;
        bindPiecesEditor(body);
        bindOccupationToggle(body);
        return;
      }
    }

    var sections = Schema.visibleSections(prop);
    var section = sections.find(function (s) {
      return s.id === state.sectionId;
    }) || sections[0];
    if (!section) return;
    state.sectionId = section.id;
    document.getElementById("sectionTitle").textContent = section.label;
    document.getElementById("sectionHint").textContent = section.hint || "";

    if (section.special === "units") {
      body.innerHTML = renderUnitsOverview();
      bindCompositionActions(body);
      return;
    }

    if (section.special === "documents") {
      body.innerHTML = renderDocs();
      return;
    }

    var bucket = ensureSectionBucket(section.id);
    var fields = Schema.visibleFields(section, prop);
    body.innerHTML = fields.map(function (field) {
      return fieldHtml(field, bucket[field.id]);
    }).join("");
    bindTri(body);
  }

  function ensureMediaDetails(p) {
    if (!p.details.medias) p.details.medias = {};
    return p.details.medias;
  }

  function renderImagesTab(panel, p) {
    var Cloud = window.CrmImmoCloud;
    panel.innerHTML =
      '<div class="immo-img-layout">' +
      '<aside class="immo-img-side">' +
      '<button type="button" class="immo-img-cat is-active" data-img-cat="public">Images (' +
      (p.images || []).length +
      ")</button>" +
      '<button type="button" class="immo-img-cat" data-img-cat="confidential">Images confidentielles</button>' +
      '<button type="button" class="immo-img-cat" data-img-cat="medias">Médias (liens)</button>' +
      "</aside>" +
      '<div class="immo-img-main" id="imgMain"></div></div>';

    var cat = "public";
    function paint() {
      var main = document.getElementById("imgMain");
      if (!main) return;
      document.querySelectorAll("[data-img-cat]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-img-cat") === cat);
      });
      if (cat === "medias") {
        var m = ensureMediaDetails(p);
        main.innerHTML =
          "<h3>Médias & liens</h3><p class='immo-hint'>Visites virtuelles, vidéo, 360° — liens externes.</p>" +
          [
            ["visite_virtuelle", "Visite virtuelle"],
            ["visite_privee", "Visite virtuelle privée"],
            ["video_aerienne", "Vidéo aérienne"],
            ["url_360", "URL 360°"],
            ["plan_2d_3d", "URL plan 2D-3D"],
            ["lien_video", "Lien vidéo"],
            ["url_myphoto", "URL MyPhotoAgency"],
          ]
            .map(function (row) {
              return (
                '<label class="immo-field">' +
                esc(row[1]) +
                '<input class="crm-input" data-media-key="' +
                row[0] +
                '" value="' +
                esc(m[row[0]] || "") +
                '" placeholder="https://…" /></label>'
              );
            })
            .join("") +
          '<p class="immo-hint">Les fichiers photos / PDF passent par <strong>Immo cloud</strong> (Google Drive).</p>';
        main.querySelectorAll("[data-media-key]").forEach(function (inp) {
          inp.onchange = function () {
            ensureMediaDetails(p)[inp.getAttribute("data-media-key")] = inp.value.trim();
          };
        });
        return;
      }
      if (cat === "confidential") {
        main.innerHTML =
          "<h3>Images confidentielles</h3><p class='immo-hint'>Dossier Drive <strong>02_photos_confidentielles</strong> — non diffusées sur les portails.</p>" +
          '<button type="button" class="btn btn-primary" id="btnGoCloudConf">Ouvrir Immo cloud</button>';
        var go = document.getElementById("btnGoCloudConf");
        if (go) {
          go.onclick = function () {
            state.tab = "cloud";
            renderAll();
          };
        }
        return;
      }
      main.innerHTML =
        '<div class="immo-img-toolbar">' +
        '<label class="btn btn-primary btn-sm">Ajouter image(s)<input type="file" id="imgFiles" accept="image/*" multiple hidden /></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btnSyncDrive">Sync Drive → galerie</button>' +
        '<label class="immo-inline">URL<input id="imgUrl" class="crm-input" placeholder="https://…" /></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btnAddImgUrl">Ajouter URL</button>' +
        "</div>" +
        '<p class="immo-hint">Upload → Google Drive (photos publiques). Réordonnez avec ↑↓.</p>' +
        '<div id="imgList" class="immo-img-grid"></div>' +
        '<p id="imgStatus" class="immo-hint"></p>';

      function paintGrid() {
        var list = document.getElementById("imgList");
        if (!list) return;
        list.innerHTML =
          (p.images || [])
            .map(function (url, i) {
              var isLocal = String(url).indexOf("data:") === 0 || String(url).indexOf("local://") === 0;
              return (
                '<div class="immo-img-card" data-i="' +
                i +
                '">' +
                (isLocal && String(url).indexOf("data:") === 0
                  ? '<img src="' + esc(url) + '" alt="" />'
                  : isLocal
                    ? '<div class="immo-img-ph">Local</div>'
                    : '<img src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'" />') +
                '<div class="immo-img-actions">' +
                '<button type="button" class="btn btn-ghost btn-sm" data-up="' +
                i +
                '">↑</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-dn="' +
                i +
                '">↓</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-rm-img="' +
                i +
                '">Suppr.</button></div></div>'
              );
            })
            .join("") || "<p class='immo-hint'>Aucune image. Uploadez ou ajoutez une URL.</p>";
        list.querySelectorAll("[data-rm-img]").forEach(function (b) {
          b.onclick = function () {
            p.images.splice(Number(b.getAttribute("data-rm-img")), 1);
            paintGrid();
          };
        });
        list.querySelectorAll("[data-up]").forEach(function (b) {
          b.onclick = function () {
            var i = Number(b.getAttribute("data-up"));
            if (i < 1) return;
            var t = p.images[i - 1];
            p.images[i - 1] = p.images[i];
            p.images[i] = t;
            paintGrid();
          };
        });
        list.querySelectorAll("[data-dn]").forEach(function (b) {
          b.onclick = function () {
            var i = Number(b.getAttribute("data-dn"));
            if (i >= p.images.length - 1) return;
            var t = p.images[i + 1];
            p.images[i + 1] = p.images[i];
            p.images[i] = t;
            paintGrid();
          };
        });
      }

      document.getElementById("btnAddImgUrl").onclick = function () {
        var u = document.getElementById("imgUrl").value.trim();
        if (!u) return;
        p.images.push(u);
        document.getElementById("imgUrl").value = "";
        paintGrid();
      };

      document.getElementById("imgFiles").onchange = async function (ev) {
        var files = Array.from(ev.target.files || []);
        var st = document.getElementById("imgStatus");
        if (!files.length || !Cloud) return;
        st.textContent = "Upload Drive…";
        try {
          for (var fi = 0; fi < files.length; fi++) {
            var up = await Cloud.upload(p, files[fi], { hint: "photos" });
            var f = up.file || {};
            var link = f.url || f.webViewLink || f.thumbnailLink || "";
            if (link && p.images.indexOf(link) === -1) p.images.push(link);
          }
          st.textContent = files.length + " fichier(s) envoyé(s) / classés.";
          paintGrid();
        } catch (e) {
          st.textContent = "Erreur upload : " + (e.message || e);
        }
        ev.target.value = "";
      };

      document.getElementById("btnSyncDrive").onclick = async function () {
        var st = document.getElementById("imgStatus");
        if (!Cloud) return;
        st.textContent = "Sync…";
        try {
          var ensured = await Cloud.ensure(p);
          if (ensured.folderId) p.drive_folder_id = ensured.folderId;
          if (ensured.subfolderIds) p.drive_subfolders = ensured.subfolderIds;
          var listed = await Cloud.list(p, "01_photos_publiques");
          (listed.files || []).forEach(function (f) {
            var u = f.url || f.webViewLink || f.thumbnailLink;
            if (u && p.images.indexOf(u) === -1) p.images.push(u);
          });
          st.textContent =
            (listed.configured ? "Drive" : "Local") + " — " + (listed.files || []).length + " fichier(s) photos.";
          paintGrid();
        } catch (e) {
          st.textContent = "Sync : " + (e.message || e);
        }
      };

      paintGrid();
    }

    document.querySelectorAll("[data-img-cat]").forEach(function (b) {
      b.onclick = function () {
        cat = b.getAttribute("data-img-cat");
        paint();
      };
    });
    paint();
  }

  function renderCloudTab(panel, p) {
    var Cloud = window.CrmImmoCloud;
    if (!Cloud) {
      panel.innerHTML = "<p class='immo-hint'>Module cloud non chargé.</p>";
      return;
    }
    panel.innerHTML =
      '<div class="immo-cloud-head">' +
      "<div><h3>Immo cloud</h3><p class='immo-hint'>Drive intelligent par bien — classement auto (photos, diagnostics, mandat, docs). Google Drive (compte service) ou cache navigateur si non configuré.</p></div>" +
      '<div class="immo-cloud-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnCloudEnsure">Ouvrir / créer dossier</button>' +
      '<label class="btn btn-ghost btn-sm">Uploader<input type="file" id="cloudFiles" multiple hidden /></label>' +
      '<a class="btn btn-ghost btn-sm" href="./crm-immo-documents.html?property=' +
      encodeURIComponent(p.id) +
      '">Éditeur documents</a>' +
      '<a class="btn btn-ghost btn-sm" href="./test-drive.html" target="_blank" rel="noopener">Statut Drive</a>' +
      "</div></div>" +
      '<div id="cloudFolders" class="immo-cloud-folders"></div>' +
      '<div id="cloudBrowser" class="immo-cloud-browser"></div>' +
      '<p id="cloudStatus" class="immo-hint"></p>';

    var currentFolder = null;

    function status(msg) {
      var el = document.getElementById("cloudStatus");
      if (el) el.textContent = msg || "";
    }

    function paintFolderNav(subfolders) {
      var nav = document.getElementById("cloudFolders");
      var list = subfolders || Cloud.DEFAULT_FOLDERS;
      nav.innerHTML = list
        .map(function (f) {
          var key = f.id;
          var label = f.label || f.id;
          return (
            '<button type="button" class="immo-cloud-folder-btn' +
            (currentFolder === key ? " is-active" : "") +
            '" data-folder="' +
            esc(key) +
            '">📁 ' +
            esc(label) +
            "</button>"
          );
        })
        .join("");
      nav.querySelectorAll("[data-folder]").forEach(function (btn) {
        btn.onclick = function () {
          currentFolder = btn.getAttribute("data-folder");
          browse(currentFolder);
        };
      });
    }

    async function browse(folderKey) {
      currentFolder = folderKey || null;
      paintFolderNav(p._cloudSubfolders || Cloud.DEFAULT_FOLDERS);
      status("Chargement…");
      try {
        var listed = await Cloud.list(p, folderKey || undefined);
        p._cloudSubfolders = listed.subfolders || Cloud.DEFAULT_FOLDERS;
        paintFolderNav(p._cloudSubfolders);
        var files = listed.files || [];
        var html =
          "<table class='immo-cloud-table'><thead><tr><th>Nom</th><th>Type</th><th>Source</th><th></th></tr></thead><tbody>";
        if (!files.length) {
          html +=
            "<tr><td colspan='4' class='immo-hint'>Dossier vide — uploadez des photos ou PDF. Classement automatique selon le nom (DPE → diagnostics, mandat → mandat, images → photos…).</td></tr>";
        }
        files.forEach(function (f) {
          var link = f.webViewLink || f.url
            ? "<a href='" + esc(f.webViewLink || f.url) + "' target='_blank' rel='noopener'>Ouvrir</a>"
            : "—";
          html +=
            "<tr><td>" +
            esc(f.name) +
            "</td><td>" +
            esc(f.mimeType || "") +
            "</td><td>" +
            esc(f.source || "") +
            "</td><td>" +
            link +
            "</td></tr>";
        });
        html += "</tbody></table>";
        document.getElementById("cloudBrowser").innerHTML = html;
        status(
          (listed.configured ? "Google Drive" : "Mode local") +
            (folderKey ? " · " + folderKey : " · racine / tous") +
            " — " +
            files.length +
            " fichier(s)"
        );
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
    }

    async function openRoot() {
      status("Connexion…");
      try {
        var ensured = await Cloud.ensure(p);
        if (ensured.folderId) p.drive_folder_id = ensured.folderId;
        if (ensured.subfolderIds) p.drive_subfolders = ensured.subfolderIds;
        p._cloudSubfolders = ensured.subfolders || Cloud.DEFAULT_FOLDERS;
        status(
          ensured.configured || ensured.ok
            ? ensured.simulated || !ensured.configured
              ? "Mode local — Drive Google non configuré (docs/DRIVE-SETUP.md). Classement intelligent actif."
              : "Google Drive prêt — dossier bien créé."
            : ensured.message || "OK"
        );
        await browse(null);
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
    }

    document.getElementById("btnCloudEnsure").onclick = openRoot;
    document.getElementById("cloudFiles").onchange = async function (ev) {
      var files = Array.from(ev.target.files || []);
      if (!files.length) return;
      status("Upload…");
      try {
        if (!p.drive_folder_id) {
          var ens = await Cloud.ensure(p);
          if (ens.folderId) p.drive_folder_id = ens.folderId;
          if (ens.subfolderIds) p.drive_subfolders = ens.subfolderIds;
        }
        for (var i = 0; i < files.length; i++) {
          var classified = Cloud.classify(files[i].name, files[i].type, false, "");
          var up = await Cloud.upload(p, files[i], {});
          status("Uploadé : " + files[i].name + " → " + (up.classifiedAs || classified));
          if ((files[i].type || "").indexOf("image/") === 0 && String(up.classifiedAs || "").indexOf("photos_publiques") !== -1) {
            var link = (up.file && (up.file.url || up.file.webViewLink)) || "";
            if (link && p.images.indexOf(link) === -1) p.images.push(link);
          }
        }
        await browse(currentFolder);
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
      ev.target.value = "";
    };

    openRoot();
  }

  function renderOtherTab() {
    var panel = document.getElementById("otherPanel");
    if (state.tab === "vendeur") {
      var Rel = window.CrmPeopleRelations;
      var parties = Store.listParties(prop.id);
      var totals = Rel ? Rel.ownershipShareTotal(parties) : { ok: true, counted: 0, sum: 0, warning: "" };
      var shareBanner = "";
      if (totals.counted && !totals.ok) {
        shareBanner = '<p class="rel-share-warn">' + esc(totals.warning) + "</p>";
      } else if (totals.counted && totals.ok) {
        shareBanner =
          '<p class="rel-share-ok">Quote-parts propriétaires : ' +
          esc(String(totals.sum)) +
          " %.</p>";
      }
      panel.innerHTML =
        "<h3>Personnes, propriétaires &amp; parts</h3>" +
        '<p class="dossier-hint">Plusieurs propriétaires, héritiers, SCI, usufruit : chaque personne a un rôle, une capacité et une quote-part. Le parrainage est un apporteur d’affaires — ' +
        esc((Rel && Rel.NO_PROMISE) || "") +
        "</p>" +
        shareBanner +
        (parties.length
          ? parties
              .map(function (p) {
                var bits = [];
                if (p.share_pct != null && p.share_pct !== "") bits.push(p.share_pct + " %");
                if (p.legal_form && Rel) bits.push(Rel.legalFormLabel(p.legal_form));
                if (p.capacity && Rel) bits.push(Rel.capacityLabel(p.capacity));
                if (p.entity_name) bits.push(p.entity_name);
                var roleLabel = (Matcher.PARTY_ROLES.find(function (r) {
                  return r.id === p.role;
                }) || { label: p.role }).label;
                var disc =
                  p.role === "apporteur" && Rel
                    ? '<div class="rel-disclaimer" style="margin:6px 0 0">' + esc(Rel.NO_PROMISE) + "</div>"
                    : "";
                return (
                  '<div class="party-row" data-party-id="' +
                  esc(p.id) +
                  '"><div><strong>' +
                  esc(p.name || "—") +
                  "</strong> · " +
                  esc(roleLabel) +
                  (p.contact_id
                    ? ' · <a href="./crm-contact.html?id=' +
                      encodeURIComponent(p.contact_id) +
                      '">fiche</a>'
                    : "") +
                  "<br><span class='party-meta'>" +
                  esc(p.phone || "") +
                  " " +
                  esc(p.email || "") +
                  (bits.length ? " · " + esc(bits.join(" · ")) : "") +
                  "</span>" +
                  disc +
                  '</div><button type="button" class="btn btn-ghost btn-sm btn-del-party" data-id="' +
                  esc(p.id) +
                  '">Retirer</button></div>'
                );
              })
              .join("")
          : "<p style='color:var(--muted)'>Aucune personne liée — ajoute les propriétaires, héritiers, associés SCI, usufruitiers…</p>") +
        '<form id="partyForm" style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">' +
        '<label>Rôle<select id="partyRole">' +
        Matcher.PARTY_ROLES.map(function (r) {
          return '<option value="' + r.id + '">' + r.label + "</option>";
        }).join("") +
        "</select></label>" +
        '<label>Nom<input id="partyName" required /></label>' +
        '<label>Tél<input id="partyPhone" /></label>' +
        '<label>Email<input id="partyEmail" /></label>' +
        '<label>Quote-part %<input id="partyShare" type="number" min="0" max="100" step="0.01" placeholder="ex. 50" /></label>' +
        '<label>Forme<select id="partyLegal"><option value="">—</option>' +
        (Rel ? Rel.optionsHtml(Rel.LEGAL_FORMS, "") : "") +
        "</select></label>" +
        '<label>Capacité<select id="partyCapacity"><option value="">—</option>' +
        (Rel ? Rel.optionsHtml(Rel.CAPACITIES, "") : "") +
        "</select></label>" +
        '<label>SCI / entité<input id="partyEntity" placeholder="Nom SCI ou indivision" /></label>' +
        '<label>Contact CRM<input id="partyContact" placeholder="id ou recherche" /></label>' +
        '<label class="full" style="grid-column:1/-1">Rechercher un contact<input id="partySearch" type="search" placeholder="Nom, email…" autocomplete="off" /></label>' +
        '<div id="partySearchHits" style="grid-column:1/-1"></div>' +
        '<p id="partyApporteurHint" class="rel-disclaimer" hidden style="grid-column:1/-1">' +
        esc((Rel && Rel.NO_PROMISE) || "") +
        "</p>" +
        '<button class="btn btn-primary" type="submit">Ajouter</button></form>';

      function toggleApporteurHint() {
        var hint = document.getElementById("partyApporteurHint");
        if (hint) hint.hidden = document.getElementById("partyRole").value !== "apporteur";
      }
      document.getElementById("partyRole").onchange = toggleApporteurHint;
      toggleApporteurHint();

      var searchTimer = null;
      document.getElementById("partySearch").oninput = function () {
        var q = this.value.trim();
        clearTimeout(searchTimer);
        if (q.length < 2) {
          document.getElementById("partySearchHits").innerHTML = "";
          return;
        }
        searchTimer = setTimeout(function () {
          var tok = localStorage.getItem("lo_token") || "";
          fetch("/api/crm/contacts?search=" + encodeURIComponent(q) + "&limit=6", {
            headers: tok ? { Authorization: "Bearer " + tok } : {},
          })
            .then(function (r) {
              return r.json();
            })
            .then(function (res) {
              var hits = (res && res.contacts) || [];
              document.getElementById("partySearchHits").innerHTML = hits
                .map(function (c) {
                  var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || c.id;
                  return (
                    '<button type="button" class="btn btn-ghost btn-sm party-pick" data-id="' +
                    esc(c.id) +
                    '" data-name="' +
                    esc(name) +
                    '" data-email="' +
                    esc(c.email || "") +
                    '" data-phone="' +
                    esc(c.phone || "") +
                    '">' +
                    esc(name) +
                    (c.contact_type ? " · " + esc(c.contact_type) : "") +
                    "</button>"
                  );
                })
                .join(" ");
              panel.querySelectorAll(".party-pick").forEach(function (btn) {
                btn.onclick = function () {
                  document.getElementById("partyContact").value = btn.getAttribute("data-id") || "";
                  document.getElementById("partyName").value = btn.getAttribute("data-name") || "";
                  document.getElementById("partyEmail").value = btn.getAttribute("data-email") || "";
                  document.getElementById("partyPhone").value = btn.getAttribute("data-phone") || "";
                };
              });
            })
            .catch(function () {});
        }, 250);
      };

      panel.querySelectorAll(".btn-del-party").forEach(function (btn) {
        btn.onclick = function () {
          if (!confirm("Retirer cette personne du bien ?")) return;
          Store.deleteParty(btn.getAttribute("data-id"));
          renderOtherTab();
        };
      });
      document.getElementById("partyForm").onsubmit = function (e) {
        e.preventDefault();
        Store.upsertParty({
          property_id: prop.id,
          role: document.getElementById("partyRole").value,
          name: document.getElementById("partyName").value.trim(),
          phone: document.getElementById("partyPhone").value.trim(),
          email: document.getElementById("partyEmail").value.trim(),
          contact_id: document.getElementById("partyContact").value.trim() || null,
          share_pct: document.getElementById("partyShare").value,
          legal_form: document.getElementById("partyLegal").value,
          capacity: document.getElementById("partyCapacity").value,
          entity_name: document.getElementById("partyEntity").value.trim(),
        });
        renderOtherTab();
      };
      return;
    }
    if (state.tab === "pieces_plan") {
      panel.innerHTML =
        "<h3>Pièces / plans</h3><p style='color:var(--muted)'>Découpage pièce par pièce (à enrichir). Pour l’instant, utilise Surfaces + Composition.</p>" +
        "<ul>" +
        prop.units
          .map(function (u) {
            return "<li><strong>" + esc(u.label || u.type) + "</strong> — " + esc(u.surface_m2 || "?") + " m² · " + esc(u.rooms || "?") + " p.</li>";
          })
          .join("") +
        "</ul>";
      return;
    }
    if (state.tab === "images") {
      renderImagesTab(panel, prop);
      return;
    }
    if (state.tab === "cloud") {
      renderCloudTab(panel, prop);
      return;
    }
    if (state.tab === "historique") {
      panel.innerHTML =
        "<h3>Historique</h3>" +
        (prop.history.length
          ? "<ul>" +
            prop.history
              .slice()
              .reverse()
              .map(function (h) {
                return "<li><strong>" + esc(h.at) + "</strong> — " + esc(h.text) + "</li>";
              })
              .join("") +
            "</ul>"
          : "<p style='color:var(--muted)'>Pas encore d’événements.</p>");
      return;
    }
    if (state.tab === "stats") {
      var filled = 0;
      var total = 0;
      Schema.visibleSections(prop).forEach(function (s) {
        if (!s.fields) return;
        Schema.visibleFields(s, prop).forEach(function (f) {
          total += 1;
          var v = prop.details[s.id] && prop.details[s.id][f.id];
          if (v && v !== "any" && v !== "") filled += 1;
        });
      });
      var docs = Object.keys(prop.docs_checklist || {});
      var recu = docs.filter(function (k) {
        return prop.docs_checklist[k] && prop.docs_checklist[k].recu;
      }).length;
      var tot = compositionTotals();
      panel.innerHTML =
        "<h3>Statistiques fiche</h3><p>Complétude champs visibles : <strong>" +
        (total ? Math.round((filled / total) * 100) : 0) +
        " %</strong> (" +
        filled +
        "/" +
        total +
        ")</p><p>Unités : <strong>" +
        tot.units +
        "</strong> (" +
        tot.loues +
        " louée(s), " +
        tot.baux_actifs +
        " bail(s))</p><p>Loyers réels / prévisionnels : <strong>" +
        euro(tot.loyer_reel) +
        "</strong> / <strong>" +
        euro(tot.loyer_previsionnel) +
        "</strong></p><p>Pièces totales : <strong>" +
        (Number(tot.nb_pieces) || 0) +
        "</strong> · chambres <strong>" +
        (Number(tot.nb_chambres) || 0) +
        "</strong> · SDB <strong>" +
        (Number(tot.nb_sdb) || 0) +
        "</strong> · WC <strong>" +
        (Number(tot.nb_wc) || 0) +
        "</strong> · cuisines <strong>" +
        (Number(tot.nb_cuisines) || 0) +
        "</strong></p><p>Pièces justificatives reçues : <strong>" +
        recu +
        "</strong></p>";
      return;
    }
    panel.innerHTML = "<p>Onglet</p>";
  }

  function save() {
    readMeta();
    collectActiveView();
    if (state.sectionId === "pieces" && !state.activeUnitId) collectDocs();
    // sync some top-level fields from localisation / finances for piges list
    var loc = prop.details.localisation || {};
    var fin = prop.details.finances || {};
    var surf = prop.details.surfaces || {};
    if (loc.ville) prop.city = loc.ville;
    if (loc.code_postal) prop.postal_code = loc.code_postal;
    if (loc.adresse) prop.address = loc.adresse;
    if (loc.departement) prop.department = loc.departement;
    if (fin.prix_net !== "" && fin.prix_net != null) prop.price_net = Number(fin.prix_net) || prop.price_net;
    if (fin.prix_fai !== "" && fin.prix_fai != null) prop.price_fai = Number(fin.prix_fai) || prop.price_fai;
    if (fin.honoraires !== "" && fin.honoraires != null) prop.honoraires = Number(fin.honoraires) || prop.honoraires;
    if (surf.surface_habitable !== "" && surf.surface_habitable != null) prop.surface_m2 = Number(surf.surface_habitable) || prop.surface_m2;
    if (surf.nb_pieces !== "" && surf.nb_pieces != null) prop.rooms = Number(surf.nb_pieces) || prop.rooms;
    if (surf.nb_chambres !== "" && surf.nb_chambres != null) prop.bedrooms = Number(surf.nb_chambres) || prop.bedrooms;
    var diag = prop.details.diagnostics || {};
    if (diag.conso_energie_primaire) prop.dpe = diag.conso_energie_primaire;
    if (diag.ges) prop.ges = diag.ges;
    var com = prop.details.commentaires || {};
    if (com.url_fiche) prop.listing_url = com.url_fiche;
    var adSec = prop.details.annonce_pub || {};
    if (adSec.ad_headline || adSec.ad_body || adSec.ad_channel_public === "yes" || adSec.ad_channel_private === "yes") {
      var AdLib = window.ImmoAdListings;
      if (AdLib && AdLib.applyAdToProperty) {
        prop = AdLib.applyAdToProperty(prop, {
          title: prop.title,
          headline: adSec.ad_headline || prop.title,
          description: prop.description,
          body: adSec.ad_body || prop.description,
          photos: String(adSec.ad_photo_urls || "")
            .split(/\n+/)
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean)
            .map(function (url) {
              return { url: url, kind: "photo" };
            }),
          videos: adSec.ad_video_urls,
          virtual_tour: adSec.ad_virtual_tour,
          platforms: adSec.ad_platforms,
          demo_label: adSec.ad_demo_label,
          channel_public: adSec.ad_channel_public === "yes",
          channel_private: adSec.ad_channel_private === "yes",
          city: prop.city,
          postal_code: prop.postal_code,
          property_type: prop.property_type,
          rooms: prop.rooms,
          bedrooms: prop.bedrooms,
          surface_m2: prop.surface_m2,
          price_fai: prop.price_fai,
          status: prop.status,
        });
      }
    }
    prop.history = prop.history || [];
    prop.history.push({ at: new Date().toLocaleString("fr-FR"), text: "Fiche enregistrée (" + (state.sectionId || state.tab) + ")" });
    Store.upsertProperty(prop);
    syncHeader();
    smartText();
    alert("Fiche enregistrée.");
  }

  function renderAll() {
    readMeta();
    syncHeader();
    smartText();
    renderTabs();
    var desc = document.getElementById("tabDescription");
    var other = document.getElementById("tabOther");
    if (state.tab === "description") {
      desc.hidden = false;
      other.hidden = true;
      renderSide();
      renderSection();
    } else {
      if (state.activeUnitId) collectUnitSection();
      desc.hidden = true;
      other.hidden = false;
      renderOtherTab();
    }
  }

  ["mType", "mTransaction"].forEach(function (idEl) {
    document.getElementById(idEl).addEventListener("change", function () {
      readMeta();
      // re-pick first visible section if current hidden
      state.sectionId = null;
      renderAll();
    });
  });

  var btnPrintProp = document.getElementById("btnPrintProperty");
  if (btnPrintProp) {
    btnPrintProp.onclick = function () {
      if (window.PrintDocument) window.PrintDocument.fromProperty(prop);
    };
  }

  document.getElementById("btnSave").onclick = save;
  document.getElementById("btnSave2").onclick = save;

  fillMeta();
  (function bindUrlDetect() {
    var urlEl = document.getElementById("mUrl");
    var srcEl = document.getElementById("mSource");
    if (!urlEl || !srcEl || !window.ImmoListingPortals) return;
    urlEl.addEventListener("change", function () {
      var d = window.ImmoListingPortals.detectFromUrl(urlEl.value);
      if (d.ok && d.portal && d.portal !== "autre") srcEl.value = d.portal;
    });
  })();
  // seed localisation from top-level if empty
  var loc = ensureSectionBucket("localisation");
  if (!loc.ville && prop.city) loc.ville = prop.city;
  if (!loc.code_postal && prop.postal_code) loc.code_postal = prop.postal_code;
  if (!loc.adresse && prop.address) loc.adresse = prop.address;
  var fin = ensureSectionBucket("finances");
  if ((fin.prix_net === "" || fin.prix_net == null) && prop.price_net != null) fin.prix_net = prop.price_net;
  if ((fin.prix_fai === "" || fin.prix_fai == null) && prop.price_fai != null) fin.prix_fai = prop.price_fai;
  var surf = ensureSectionBucket("surfaces");
  if ((surf.surface_habitable === "" || surf.surface_habitable == null) && prop.surface_m2 != null) surf.surface_habitable = prop.surface_m2;
  if ((surf.nb_pieces === "" || surf.nb_pieces == null) && prop.rooms != null) surf.nb_pieces = prop.rooms;
  var com = ensureSectionBucket("commentaires");
  if (!com.url_fiche && prop.listing_url) com.url_fiche = prop.listing_url;

  renderAll();
})();
