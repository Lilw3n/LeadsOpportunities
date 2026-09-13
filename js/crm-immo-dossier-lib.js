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
    u.floor = u.floor != null ? u.floor : "";
    u.lot_number = u.lot_number != null ? u.lot_number : "";
    u.cadastre_ref = u.cadastre_ref != null ? u.cadastre_ref : "";
    u.price = u.price != null ? u.price : "";
    u.loyer = u.loyer != null ? u.loyer : "";
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

  return {
    parseMeta: parseMeta,
    normalizePhotoList: normalizePhotoList,
    normalizeUnit: normalizeUnit,
    emptyUnit: emptyUnit,
    packMetadata: packMetadata,
    hydrateProperty: hydrateProperty,
    unitSummary: unitSummary,
  };
});
