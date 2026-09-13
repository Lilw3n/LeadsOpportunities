/**
 * Dossier immeuble / parcelle / lots — pack & hydrate dans metadata_json.
 * Utilisable Node + navigateur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmImmoDossier = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function parseMeta(raw) {
    if (!raw) return {};
    if (typeof raw === "object" && !Array.isArray(raw)) return Object.assign({}, raw);
    try {
      var p = JSON.parse(raw);
      return p && typeof p === "object" && !Array.isArray(p) ? p : {};
    } catch (e) {
      return {};
    }
  }

  function normalizePhotoList(v) {
    if (!v) return [];
    if (typeof v === "string") {
      return v
        .split(/\n+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean)
        .map(function (url) {
          return { url: url, kind: "photo" };
        });
    }
    if (!Array.isArray(v)) return [];
    return v
      .map(function (p) {
        if (!p) return null;
        if (typeof p === "string") return { url: p, kind: "photo" };
        if (p.url) return { url: String(p.url), kind: p.kind || "photo" };
        return null;
      })
      .filter(Boolean);
  }

  function numOrEmpty(v) {
    if (v == null || v === "") return "";
    var n = Number(v);
    return isNaN(n) ? "" : n;
  }

  function normalizeUnit(u) {
    u = u && typeof u === "object" ? Object.assign({}, u) : {};
    if (!u.id) {
      u.id = "unit_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    }
    u.type = u.type || "appartement";
    u.label = u.label || "";
    u.transaction = u.transaction || "vente";
    u.loue = !!u.loue;
    u.surface_m2 = u.surface_m2 != null ? u.surface_m2 : "";
    u.rooms = u.rooms != null ? u.rooms : "";
    u.bedrooms = u.bedrooms != null ? u.bedrooms : "";
    u.nb_pieces = u.nb_pieces != null && u.nb_pieces !== "" ? u.nb_pieces : u.rooms;
    u.nb_chambres = u.nb_chambres != null && u.nb_chambres !== "" ? u.nb_chambres : u.bedrooms;
    u.nb_sdb = u.nb_sdb != null ? u.nb_sdb : "";
    u.nb_wc = u.nb_wc != null ? u.nb_wc : "";
    u.nb_cuisines = u.nb_cuisines != null ? u.nb_cuisines : "";
    u.floor = u.floor != null ? u.floor : "";
    u.lot_number = u.lot_number != null ? u.lot_number : "";
    u.cadastre_ref = u.cadastre_ref != null ? u.cadastre_ref : "";
    u.price = u.price != null ? u.price : "";
    u.loyer = u.loyer != null ? u.loyer : "";
    u.loyer_reel = u.loyer_reel != null && u.loyer_reel !== "" ? u.loyer_reel : u.loyer;
    u.loyer_previsionnel = u.loyer_previsionnel != null ? u.loyer_previsionnel : "";
    u.charges_locatives = u.charges_locatives != null ? u.charges_locatives : "";
    u.depot_garantie = u.depot_garantie != null ? u.depot_garantie : "";
    u.type_bail = u.type_bail || "";
    u.locataire_nom = u.locataire_nom || "";
    u.date_debut_bail = u.date_debut_bail || "";
    u.date_fin_bail = u.date_fin_bail || "";
    u.notes = u.notes || "";
    u.parent_id = u.parent_id || null;
    u.virtual_tour = u.virtual_tour || "";
    u.photos = normalizePhotoList(u.photos || u.photo_urls || []);
    if (!u.details || typeof u.details !== "object") u.details = {};
    return u;
  }

  function emptyUnit(type) {
    return normalizeUnit({
      type: type || "appartement",
      label: "",
      transaction: "vente",
      loue: false,
      photos: [],
      virtual_tour: "",
      parent_id: null,
    });
  }

  /** Fusionne le dossier riche (units, details…) dans metadata pour Neon. */
  function packMetadata(item) {
    item = item || {};
    var meta = parseMeta(item.metadata_json != null ? item.metadata_json : item.metadata);
    if (item.details && typeof item.details === "object") meta.details = item.details;
    if (Array.isArray(item.units)) meta.units = item.units.map(normalizeUnit);
    if (item.docs_checklist && typeof item.docs_checklist === "object") meta.docs_checklist = item.docs_checklist;
    if (Array.isArray(item.images)) meta.images = item.images;
    if (Array.isArray(item.history)) meta.history = item.history;
    if (item.transaction) meta.transaction = item.transaction;
    if (item.is_parent_dossier != null) meta.is_parent_dossier = !!item.is_parent_dossier;
    // Soft-hide marché : flag persisté dans metadata (pas de colonne SQL).
    if (item.market_visible != null) meta.market_visible = item.market_visible !== false;
    else if (meta.market_visible == null && item.metadata && item.metadata.market_visible != null) {
      meta.market_visible = item.metadata.market_visible !== false;
    }
    return meta;
  }

  /** Remonte units/details depuis metadata_json vers le bien. */
  function hydrateProperty(row) {
    if (!row) return null;
    var prop = Object.assign({}, row);
    var meta = parseMeta(prop.metadata_json != null ? prop.metadata_json : prop.metadata);
    prop.metadata = meta;
    if (prop.market_visible == null && meta.market_visible != null) {
      prop.market_visible = meta.market_visible !== false;
    }
    if (!prop.details || typeof prop.details !== "object") {
      prop.details = meta.details && typeof meta.details === "object" ? meta.details : {};
    }
    if (!Array.isArray(prop.units) || !prop.units.length) {
      prop.units = Array.isArray(meta.units) ? meta.units.map(normalizeUnit) : [];
    } else {
      prop.units = prop.units.map(normalizeUnit);
    }
    if (!prop.docs_checklist || typeof prop.docs_checklist !== "object") {
      prop.docs_checklist =
        meta.docs_checklist && typeof meta.docs_checklist === "object" ? meta.docs_checklist : {};
    }
    if (!Array.isArray(prop.images)) {
      prop.images = Array.isArray(meta.images) ? meta.images : [];
    }
    if (!Array.isArray(prop.history)) {
      prop.history = Array.isArray(meta.history) ? meta.history : [];
    }
    if (!prop.transaction && meta.transaction) prop.transaction = meta.transaction;
    if (prop.is_parent_dossier == null && meta.is_parent_dossier != null) {
      prop.is_parent_dossier = !!meta.is_parent_dossier;
    }
    if (
      !prop.is_parent_dossier &&
      prop.units.length &&
      ["immeuble", "complexe", "terrain", "maison"].indexOf(prop.property_type) !== -1
    ) {
      prop.is_parent_dossier = true;
    }
    return prop;
  }

  function unitSummary(units) {
    units = Array.isArray(units) ? units : [];
    var appts = units.filter(function (u) {
      return u.type === "appartement";
    }).length;
    var terrains = units.filter(function (u) {
      return u.type === "terrain";
    }).length;
    var withTour = units.filter(function (u) {
      return !!(u.virtual_tour && String(u.virtual_tour).trim());
    }).length;
    var withPhotos = units.filter(function (u) {
      return Array.isArray(u.photos) && u.photos.length;
    }).length;
    return {
      total: units.length,
      appartements: appts,
      terrains: terrains,
      with_tour: withTour,
      with_photos: withPhotos,
    };
  }

  function sumField(units, key) {
    return (Array.isArray(units) ? units : []).reduce(function (acc, u) {
      var n = Number(u && u[key]);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }

  /** Totaux composition : loyers, pièces, surfaces, baux actifs. */
  function unitTotals(units) {
    units = (Array.isArray(units) ? units : []).map(normalizeUnit);
    var loues = units.filter(function (u) {
      return u.loue || u.transaction === "location";
    });
    return {
      units: units.length,
      loues: loues.length,
      surface_m2: sumField(units, "surface_m2"),
      loyer_reel: sumField(units, "loyer_reel"),
      loyer_previsionnel: sumField(units, "loyer_previsionnel"),
      charges_locatives: sumField(units, "charges_locatives"),
      nb_pieces: sumField(units, "nb_pieces"),
      nb_chambres: sumField(units, "nb_chambres"),
      nb_sdb: sumField(units, "nb_sdb"),
      nb_wc: sumField(units, "nb_wc"),
      nb_cuisines: sumField(units, "nb_cuisines"),
      baux_actifs: units.filter(function (u) {
        return !!(u.type_bail || u.locataire_nom || u.date_debut_bail);
      }).length,
    };
  }

  /**
   * Arbre parent→enfants (terrain → immeuble → étage → appart…).
   * Les orphelins (parent inconnu) sont remontés en racines.
   */
  function buildCompositionTree(units) {
    units = (Array.isArray(units) ? units : []).map(normalizeUnit);
    var byId = {};
    units.forEach(function (u) {
      byId[u.id] = { unit: u, children: [] };
    });
    var roots = [];
    units.forEach(function (u) {
      var node = byId[u.id];
      if (u.parent_id && byId[u.parent_id] && u.parent_id !== u.id) {
        byId[u.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });
    function sortNodes(list) {
      list.sort(function (a, b) {
        var fa = String((a.unit.floor || "") + (a.unit.lot_number || "") + (a.unit.label || ""));
        var fb = String((b.unit.floor || "") + (b.unit.lot_number || "") + (b.unit.label || ""));
        return fa.localeCompare(fb, "fr");
      });
      list.forEach(function (n) {
        sortNodes(n.children);
      });
    }
    sortNodes(roots);
    return roots;
  }

  /** Tous les descendants (hors nœud racine), pour totaux partiels. */
  function collectSubtreeUnits(units, rootId, includeRoot) {
    units = (Array.isArray(units) ? units : []).map(normalizeUnit);
    var byParent = {};
    units.forEach(function (u) {
      var pid = u.parent_id || "";
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(u);
    });
    var out = [];
    var root = units.find(function (u) {
      return u.id === rootId;
    });
    if (includeRoot && root) out.push(root);
    function walk(pid) {
      (byParent[pid] || []).forEach(function (child) {
        out.push(child);
        walk(child.id);
      });
    }
    if (rootId) walk(rootId);
    return out;
  }

  function subtreeTotals(units, rootId, includeRoot) {
    return unitTotals(collectSubtreeUnits(units, rootId, includeRoot !== false));
  }

  /** Niveaux métier attendus dans le schéma composition. */
  var COMPOSITION_LEVELS = [
    { id: "terrain", label: "Terrain / parcelle", role: "foncier", aggregates: ["surface_m2", "cadastre"] },
    { id: "immeuble", label: "Immeuble / enveloppe", role: "bati", aggregates: ["lots", "loyers", "pieces"] },
    { id: "maison", label: "Maison / bâti", role: "bati", aggregates: ["lots", "loyers", "pieces"] },
    { id: "etage", label: "Étage", role: "niveau", aggregates: ["lots", "loyers", "pieces"] },
    { id: "appartement", label: "Appartement / lot", role: "lot", aggregates: ["loyer", "bail", "pieces", "medias"] },
    { id: "local", label: "Local pro", role: "lot", aggregates: ["loyer", "bail", "pieces", "medias"] },
    { id: "dependance", label: "Dépendance", role: "annexe", aggregates: ["surface_m2", "medias"] },
  ];

  return {
    parseMeta: parseMeta,
    normalizePhotoList: normalizePhotoList,
    normalizeUnit: normalizeUnit,
    emptyUnit: emptyUnit,
    packMetadata: packMetadata,
    hydrateProperty: hydrateProperty,
    unitSummary: unitSummary,
    unitTotals: unitTotals,
    sumField: sumField,
    buildCompositionTree: buildCompositionTree,
    collectSubtreeUnits: collectSubtreeUnits,
    subtreeTotals: subtreeTotals,
    COMPOSITION_LEVELS: COMPOSITION_LEVELS,
  };
});
