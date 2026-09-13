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
    if (u.occupation === "loue" || u.occupation === "vide") {
      u.loue = u.occupation === "loue";
    } else if (u.loue != null) {
      u.occupation = u.loue ? "loue" : "vide";
      u.loue = !!u.loue;
    } else {
      u.occupation = u.transaction === "location" ? "loue" : "vide";
      u.loue = u.occupation === "loue";
    }
    u.surface_m2 = u.surface_m2 != null ? u.surface_m2 : "";
    u.rooms = u.rooms != null ? u.rooms : "";
    u.bedrooms = u.bedrooms != null ? u.bedrooms : "";
    u.nb_pieces = u.nb_pieces != null && u.nb_pieces !== "" ? u.nb_pieces : u.rooms;
    u.nb_chambres = u.nb_chambres != null && u.nb_chambres !== "" ? u.nb_chambres : u.bedrooms;
    u.nb_sdb = u.nb_sdb != null ? u.nb_sdb : "";
    u.nb_wc = u.nb_wc != null ? u.nb_wc : "";
    u.nb_cuisines = u.nb_cuisines != null ? u.nb_cuisines : "";
    u.pieces_list = normalizePiecesList(u.pieces_list || u.rooms_list || []);
    if (u.pieces_list.length) syncCountersFromPieces(u);

    // Surfaces
    u.surface_m2 = u.surface_m2 != null ? u.surface_m2 : "";
    u.surface_carrez = u.surface_carrez != null ? u.surface_carrez : "";
    u.surface_non_carrez = u.surface_non_carrez != null ? u.surface_non_carrez : "";
    u.surface_utile = u.surface_utile != null ? u.surface_utile : "";

    // Cadastre / lots / tantièmes
    u.cadastre_section = u.cadastre_section || "";
    u.cadastre_numero = u.cadastre_numero || "";
    u.cadastre_ref = u.cadastre_ref || "";
    u.lot_propriete = u.lot_propriete || u.lot_number || "";
    u.lot_number = u.lot_number || u.lot_propriete || "";
    u.milliemes_privatifs = u.milliemes_privatifs != null ? u.milliemes_privatifs : "";
    u.milliemes_communs = u.milliemes_communs != null ? u.milliemes_communs : "";
    u.parties_communes = u.parties_communes || "";

    // Loyers HC / CC — loyer_reel = valeur affichée/agrégée selon le mode
    u.loyer_mode = u.loyer_mode === "CC" || u.loyer_mode === "HC" ? u.loyer_mode : "HC";
    u.loyer_hc = u.loyer_hc != null && u.loyer_hc !== "" ? u.loyer_hc : "";
    u.loyer_cc = u.loyer_cc != null && u.loyer_cc !== "" ? u.loyer_cc : "";
    u.charges_locatives = u.charges_locatives != null ? u.charges_locatives : "";
    u.charges_type = u.charges_type || "";
    if ((u.loyer_hc === "" || u.loyer_hc == null) && u.loyer_reel !== "" && u.loyer_reel != null && u.loyer_mode === "HC") {
      u.loyer_hc = u.loyer_reel;
    }
    if ((u.loyer_cc === "" || u.loyer_cc == null) && u.loyer_reel !== "" && u.loyer_reel != null && u.loyer_mode === "CC") {
      u.loyer_cc = u.loyer_reel;
    }
    if ((u.loyer_hc === "" || u.loyer_hc == null) && u.loyer !== "" && u.loyer != null && u.loyer_mode === "HC") {
      u.loyer_hc = u.loyer;
    }
    if ((u.loyer_cc === "" || u.loyer_cc == null) && u.loyer !== "" && u.loyer != null && u.loyer_mode === "CC") {
      u.loyer_cc = u.loyer;
    }
    var fromMode = u.loyer_mode === "CC" ? u.loyer_cc : u.loyer_hc;
    if (fromMode !== "" && fromMode != null) {
      u.loyer_reel = fromMode;
      u.loyer = fromMode;
    } else if (u.loyer_reel == null || u.loyer_reel === "") {
      u.loyer_reel = u.loyer != null ? u.loyer : "";
    }

    // Confort / équipements
    u.type_chauffage = u.type_chauffage || "";
    u.energie_chauffage = u.energie_chauffage || "";
    u.pompe_chaleur = !!u.pompe_chaleur;
    u.chaudiere = u.chaudiere || "";
    u.cheminee = !!u.cheminee;
    u.climatisation = !!u.climatisation;
    u.mezzanine = !!u.mezzanine;
    u.balcon = !!u.balcon;
    u.terrasse = !!u.terrasse;
    u.veranda = !!u.veranda;
    u.plateau_nu = !!u.plateau_nu;
    u.cave = !!u.cave;
    u.parking = !!u.parking;
    u.digicode = u.digicode || "";
    u.porte_numero = u.porte_numero || "";
    u.parking_numero = u.parking_numero || "";
    u.garage_numero = u.garage_numero || "";
    u.equipements_notes = u.equipements_notes || "";

    // Locataire / investisseur
    u.locataire_prenom = u.locataire_prenom || "";
    u.locataire_tel = u.locataire_tel || "";
    u.locataire_email = u.locataire_email || "";
    u.locataire_employeur = u.locataire_employeur || "";
    u.locataire_revenus = u.locataire_revenus != null ? u.locataire_revenus : "";
    u.garant_nom = u.garant_nom || "";
    u.rendement_brut = u.rendement_brut != null ? u.rendement_brut : "";
    u.rendement_net = u.rendement_net != null ? u.rendement_net : "";
    u.vacance_locative_jours = u.vacance_locative_jours != null ? u.vacance_locative_jours : "";
    u.taxe_fonciere = u.taxe_fonciere != null ? u.taxe_fonciere : "";
    u.assurance_pno = u.assurance_pno != null ? u.assurance_pno : "";
    u.frais_gestion = u.frais_gestion != null ? u.frais_gestion : "";
    u.cashflow_mensuel = u.cashflow_mensuel != null ? u.cashflow_mensuel : "";
    u.investor_notes = u.investor_notes || "";

    // Syndic / copro
    u.syndic_nom = u.syndic_nom || "";
    u.syndic_contact = u.syndic_contact || "";
    u.syndic_tel = u.syndic_tel || "";
    u.syndic_email = u.syndic_email || "";
    u.charges_copro = u.charges_copro != null ? u.charges_copro : "";
    u.travaux_copro = u.travaux_copro || "";
    u.travaux_prevus = u.travaux_prevus || "";
    u.procedure_en_cours = !!u.procedure_en_cours;
    u.procedure_details = u.procedure_details || "";
    u.fonds_travaux = u.fonds_travaux != null ? u.fonds_travaux : "";
    u.nb_lots_copro = u.nb_lots_copro != null ? u.nb_lots_copro : "";

    // Propriétaire
    u.proprietaire_nom = u.proprietaire_nom || "";
    u.proprietaire_prenom = u.proprietaire_prenom || "";
    u.proprietaire_tel = u.proprietaire_tel || "";
    u.proprietaire_email = u.proprietaire_email || "";
    u.regime_matrimonial = u.regime_matrimonial || "";
    u.origine_propriete = u.origine_propriete || "";
    u.date_acquisition = u.date_acquisition || "";
    u.prix_acquisition = u.prix_acquisition != null ? u.prix_acquisition : "";
    u.notaire_nom = u.notaire_nom || "";
    u.proprietaire_notes = u.proprietaire_notes || "";

    u.floor = u.floor != null ? u.floor : "";
    u.price = u.price != null ? u.price : "";
    u.loyer = u.loyer != null ? u.loyer : "";
    u.loyer_previsionnel = u.loyer_previsionnel != null ? u.loyer_previsionnel : "";
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

  /** Catalogue de types de pièces ajoutables librement sur un lot. */
  var ROOM_TYPES = [
    { id: "chambre", label: "Chambre", counter: "nb_chambres" },
    { id: "salon", label: "Salon", counter: null },
    { id: "sejour", label: "Séjour", counter: null },
    { id: "cuisine", label: "Cuisine", counter: "nb_cuisines" },
    { id: "sdb", label: "Salle de bain", counter: "nb_sdb" },
    { id: "sde", label: "Salle d'eau", counter: "nb_sdb" },
    { id: "wc", label: "WC", counter: "nb_wc" },
    { id: "bureau", label: "Bureau", counter: null },
    { id: "dressing", label: "Dressing", counter: null },
    { id: "cellier", label: "Cellier / buanderie", counter: null },
    { id: "entree", label: "Entrée", counter: null },
    { id: "couloir", label: "Couloir", counter: null },
    { id: "mezzanine", label: "Mezzanine", counter: null },
    { id: "balcon", label: "Balcon", counter: null },
    { id: "terrasse", label: "Terrasse", counter: null },
    { id: "veranda", label: "Véranda", counter: null },
    { id: "plateau_nu", label: "Plateau nu", counter: null },
    { id: "cave", label: "Cave", counter: null },
    { id: "garage", label: "Garage", counter: null },
    { id: "parking", label: "Parking", counter: null },
    { id: "autre", label: "Autre", counter: null },
  ];

  /** Attributs optionnels par pièce (cheminée, etc.). */
  var ROOM_ATTRS = [
    { id: "cheminee", label: "Cheminée" },
    { id: "mezzanine", label: "Mezzanine" },
    { id: "balcon", label: "Balcon" },
    { id: "terrasse", label: "Terrasse" },
    { id: "veranda", label: "Véranda" },
    { id: "plateau_nu", label: "Plateau nu" },
    { id: "climatisation", label: "Clim" },
    { id: "placards", label: "Placards" },
  ];

  function emptyPiece(type) {
    type = type || "chambre";
    var meta = ROOM_TYPES.find(function (t) {
      return t.id === type;
    });
    var row = {
      id: "piece_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
      type: type,
      label: meta ? meta.label : "",
      qty: 1,
      surface_m2: "",
      notes: "",
    };
    ROOM_ATTRS.forEach(function (a) {
      row[a.id] = false;
    });
    return row;
  }

  function normalizePiece(p) {
    p = p && typeof p === "object" ? Object.assign({}, p) : {};
    if (!p.id) {
      p.id = "piece_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    }
    p.type = p.type || "autre";
    var meta = ROOM_TYPES.find(function (t) {
      return t.id === p.type;
    });
    p.label = p.label != null && String(p.label).trim() ? String(p.label).trim() : meta ? meta.label : "Pièce";
    var q = Number(p.qty);
    p.qty = isNaN(q) || q < 1 ? 1 : Math.round(q);
    p.surface_m2 = p.surface_m2 != null && p.surface_m2 !== "" ? numOrEmpty(p.surface_m2) : "";
    p.notes = p.notes || "";
    ROOM_ATTRS.forEach(function (a) {
      p[a.id] = !!p[a.id];
    });
    return p;
  }

  function normalizePiecesList(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizePiece).filter(Boolean);
  }

  /** Recalcule nb_chambres / SDB / WC / cuisines depuis la liste libre. */
  function syncCountersFromPieces(u) {
    if (!u || !Array.isArray(u.pieces_list) || !u.pieces_list.length) return u;
    var counts = { nb_chambres: 0, nb_sdb: 0, nb_wc: 0, nb_cuisines: 0 };
    u.pieces_list.forEach(function (p) {
      var meta = ROOM_TYPES.find(function (t) {
        return t.id === p.type;
      });
      if (meta && meta.counter && counts[meta.counter] != null) {
        counts[meta.counter] += Number(p.qty) || 0;
      }
    });
    u.nb_chambres = counts.nb_chambres;
    u.nb_sdb = counts.nb_sdb;
    u.nb_wc = counts.nb_wc;
    u.nb_cuisines = counts.nb_cuisines;
    u.bedrooms = counts.nb_chambres;
    return u;
  }

  /** Si la liste est vide, propose des lignes à partir des compteurs existants. */
  function seedPiecesFromCounters(u) {
    u = normalizeUnit(u);
    if (u.pieces_list && u.pieces_list.length) return u.pieces_list;
    var seeded = [];
    function add(type, n) {
      n = Number(n) || 0;
      if (n > 0) {
        var row = emptyPiece(type);
        row.qty = n;
        seeded.push(row);
      }
    }
    add("chambre", u.nb_chambres || u.bedrooms);
    add("sdb", u.nb_sdb);
    add("wc", u.nb_wc);
    add("cuisine", u.nb_cuisines);
    return seeded;
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
      pieces_list: [],
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

  /** Totaux composition : loyers HC/CC, Carrez, pièces, baux actifs. */
  function unitTotals(units) {
    units = (Array.isArray(units) ? units : []).map(normalizeUnit);
    var loues = units.filter(function (u) {
      return u.occupation === "loue" || u.loue || u.transaction === "location";
    });
    return {
      units: units.length,
      loues: loues.length,
      surface_m2: sumField(units, "surface_m2"),
      surface_carrez: sumField(units, "surface_carrez"),
      surface_non_carrez: sumField(units, "surface_non_carrez"),
      loyer_reel: sumField(units, "loyer_reel"),
      loyer_hc: sumField(units, "loyer_hc"),
      loyer_cc: sumField(units, "loyer_cc"),
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
    ROOM_TYPES: ROOM_TYPES,
    ROOM_ATTRS: ROOM_ATTRS,
    emptyPiece: emptyPiece,
    normalizePiece: normalizePiece,
    normalizePiecesList: normalizePiecesList,
    syncCountersFromPieces: syncCountersFromPieces,
    seedPiecesFromCounters: seedPiecesFromCounters,
  };
});
