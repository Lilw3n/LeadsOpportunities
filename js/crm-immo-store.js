/**
 * Store CRM immobilier — localStorage + sync API Neon si dispo.
 */
window.CrmImmoStore = (function () {
  var KEY = "lo_crm_immo_v1";
  var Matcher = window.CrmImmoMatcher;

  function uid(prefix) {
    return (
      (prefix || "id") +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function emptyDb() {
    return {
      version: 1,
      properties: [],
      criteria: [],
      parties: [],
      documents: [],
      updatedAt: null,
    };
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      var db = raw ? JSON.parse(raw) : null;
      if (!db || typeof db !== "object") return emptyDb();
      db.properties = Array.isArray(db.properties) ? db.properties.map(hydrateLocalProperty) : [];
      db.criteria = Array.isArray(db.criteria) ? db.criteria : [];
      db.parties = Array.isArray(db.parties) ? db.parties : [];
      db.documents = Array.isArray(db.documents) ? db.documents : [];
      return db;
    } catch (e) {
      return emptyDb();
    }
  }

  function parseMetaField(v) {
    if (v && typeof v === "object" && !Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) {
      try {
        return JSON.parse(v);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  function hydrateLocalProperty(p) {
    if (!p) return p;
    var meta = parseMetaField(p.metadata_json || p.metadata);
    if (!p.details || !Object.keys(p.details).length) p.details = meta.details || p.details || {};
    if (!Array.isArray(p.images) || !p.images.length) {
      var photos = p.photos_json || p.photos;
      if (typeof photos === "string") {
        try {
          photos = JSON.parse(photos);
        } catch (e) {
          photos = [];
        }
      }
      if (Array.isArray(photos) && photos.length) p.images = photos;
    }
    if (!p.transaction && meta.transaction) p.transaction = meta.transaction;
    if (p.drive_folder_id == null && meta.drive_folder_id) p.drive_folder_id = meta.drive_folder_id;
    return p;
  }

  function serializePropertyForApi(item) {
    var photos = Array.isArray(item.images) ? item.images : [];
    var meta = parseMetaField(item.metadata_json || item.metadata);
    meta = Object.assign({}, meta, {
      details: item.details || meta.details || {},
      transaction: item.transaction || meta.transaction || "vente",
      images: photos,
      drive_folder_id: item.drive_folder_id || meta.drive_folder_id || null,
      drive_subfolders: item.drive_subfolders || meta.drive_subfolders || null,
      units: item.units || meta.units || [],
      docs_checklist: item.docs_checklist || meta.docs_checklist || {},
      history: item.history || meta.history || [],
    });
    return Object.assign({}, item, {
      photos_json: photos,
      photos: photos,
      metadata_json: meta,
      metadata: meta,
    });
  }

  function saveLocal(db) {
    db.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(db));
    return db;
  }

  function token() {
    return localStorage.getItem("lo_token") || "";
  }

  async function api(method, path, body) {
    var opts = {
      method: method,
      headers: {
        Authorization: "Bearer " + token(),
        "Content-Type": "application/json",
      },
    };
    if (body != null) opts.body = JSON.stringify(body);
    var res = await fetch(path, opts);
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || data.ok === false) {
      var err = new Error(data.error || data.detail || "API immo");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function syncFromApi() {
    try {
      var data = await api("GET", "/api/crm/immo?entity=all");
      if (data && data.db) {
        saveLocal(data.db);
        return data.db;
      }
    } catch (e) {
      /* offline / pas de Neon → local */
    }
    return loadLocal();
  }

  async function pushEntity(entity, item) {
    try {
      await api("POST", "/api/crm/immo", { entity: entity, item: item });
    } catch (e) {
      /* keep local */
    }
  }

  async function deleteRemote(entity, id) {
    try {
      await api("DELETE", "/api/crm/immo?entity=" + encodeURIComponent(entity) + "&id=" + encodeURIComponent(id));
    } catch (e) {}
  }

  function listProperties(query) {
    var db = loadLocal();
    var list = db.properties.slice();
    if (Matcher) list = Matcher.filterProperties(list, query || {});
    list.sort(function (a, b) {
      return String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
    });
    return list;
  }

  function getProperty(id) {
    return loadLocal().properties.find(function (p) {
      return p.id === id;
    }) || null;
  }

  function upsertProperty(input) {
    var db = loadLocal();
    var now = new Date().toISOString();
    var item = Object.assign({}, input || {});
    if (!item.id) item.id = uid("prop");
    if (!item.created_at) item.created_at = now;
    item.updated_at = now;
    if (!item.title) item.title = "Bien sans titre";
    if (!item.status) item.status = "estimation";
    else item.status = Matcher.normalizePropertyStatus(item.status);
    if (!item.property_type) item.property_type = "appartement";
    if (!item.transaction) item.transaction = "vente";
    if (!item.listing_source) item.listing_source = "manual";
    if (!item.details || typeof item.details !== "object") item.details = {};
    if (!Array.isArray(item.units)) item.units = [];
    if (!item.docs_checklist || typeof item.docs_checklist !== "object") item.docs_checklist = {};
    if (!Array.isArray(item.images)) item.images = [];
    if (!Array.isArray(item.history)) item.history = [];
    var payload = serializePropertyForApi(item);
    var idx = db.properties.findIndex(function (p) {
      return p.id === payload.id;
    });
    if (idx >= 0) db.properties[idx] = Object.assign({}, db.properties[idx], payload);
    else db.properties.unshift(payload);
    saveLocal(db);
    pushEntity("property", payload);
    return payload;
  }

  function deleteProperty(id) {
    var db = loadLocal();
    db.properties = db.properties.filter(function (p) {
      return p.id !== id;
    });
    db.parties = db.parties.filter(function (p) {
      return p.property_id !== id;
    });
    db.documents = db.documents.filter(function (d) {
      return d.property_id !== id;
    });
    saveLocal(db);
    deleteRemote("property", id);
  }

  function listCriteria() {
    return loadLocal().criteria.slice().sort(function (a, b) {
      return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
    });
  }

  function getCriteria(id) {
    return (
      loadLocal().criteria.find(function (c) {
        return c.id === id;
      }) || null
    );
  }

  function upsertCriteria(input) {
    var db = loadLocal();
    var now = new Date().toISOString();
    var item = Object.assign({}, input || {});
    if (!item.id) item.id = uid("crit");
    if (!item.created_at) item.created_at = now;
    item.updated_at = now;
    if (!item.label) item.label = "Recherche acquéreur";
    if (!item.status) item.status = "active";
    ["property_types", "cities", "postal_codes", "departments", "must_haves"].forEach(function (k) {
      if (typeof item[k] === "string") {
        item[k] = item[k]
          .split(/[,;\n]/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
      }
      if (!Array.isArray(item[k])) item[k] = item[k] ? [item[k]] : [];
    });
    var idx = db.criteria.findIndex(function (c) {
      return c.id === item.id;
    });
    if (idx >= 0) db.criteria[idx] = Object.assign({}, db.criteria[idx], item);
    else db.criteria.unshift(item);
    saveLocal(db);
    pushEntity("criteria", item);
    return item;
  }

  function deleteCriteria(id) {
    var db = loadLocal();
    db.criteria = db.criteria.filter(function (c) {
      return c.id !== id;
    });
    saveLocal(db);
    deleteRemote("criteria", id);
  }

  function listParties(propertyId) {
    return loadLocal().parties.filter(function (p) {
      return !propertyId || p.property_id === propertyId;
    });
  }

  function upsertParty(input) {
    var db = loadLocal();
    var now = new Date().toISOString();
    var item = Object.assign({}, input || {});
    if (!item.id) item.id = uid("party");
    if (!item.created_at) item.created_at = now;
    item.updated_at = now;
    if (!item.role) item.role = "prospect";
    var idx = db.parties.findIndex(function (p) {
      return p.id === item.id;
    });
    if (idx >= 0) db.parties[idx] = Object.assign({}, db.parties[idx], item);
    else db.parties.unshift(item);
    saveLocal(db);
    pushEntity("party", item);
    return item;
  }

  function deleteParty(id) {
    var db = loadLocal();
    db.parties = db.parties.filter(function (p) {
      return p.id !== id;
    });
    saveLocal(db);
    deleteRemote("party", id);
  }

  function listDocuments(opts) {
    opts = opts || {};
    return loadLocal().documents.filter(function (d) {
      if (opts.property_id && d.property_id !== opts.property_id) return false;
      if (opts.contact_id && d.contact_id !== opts.contact_id) return false;
      return true;
    });
  }

  function upsertDocument(input) {
    var db = loadLocal();
    var now = new Date().toISOString();
    var item = Object.assign({}, input || {});
    if (!item.id) item.id = uid("idoc");
    if (!item.created_at) item.created_at = now;
    item.updated_at = now;
    if (!item.doc_type) item.doc_type = "autre";
    if (!item.status) item.status = "draft";
    if (!item.title) item.title = "Document immobilier";
    if (!item.data || typeof item.data !== "object") item.data = item.data_json ? JSON.parse(item.data_json || "{}") : {};
    var idx = db.documents.findIndex(function (d) {
      return d.id === item.id;
    });
    if (idx >= 0) db.documents[idx] = Object.assign({}, db.documents[idx], item);
    else db.documents.unshift(item);
    saveLocal(db);
    pushEntity("document", item);
    return item;
  }

  function deleteDocument(id) {
    var db = loadLocal();
    db.documents = db.documents.filter(function (d) {
      return d.id !== id;
    });
    saveLocal(db);
    deleteRemote("document", id);
  }

  function match(criteriaIdOrObj, opts) {
    var criteria =
      typeof criteriaIdOrObj === "string" ? getCriteria(criteriaIdOrObj) : criteriaIdOrObj;
    if (!criteria) return { matches: [], count: 0, best: null };
    return Matcher.matchPropertiesToBuyer(criteria, listProperties({}), opts);
  }

  function seedDemoIfEmpty() {
    var db = loadLocal();
    if (db.properties.length) return db;
    var props = [
      {
        id: uid("prop"),
        title: "T3 centre Strasbourg — exemple",
        property_type: "appartement",
        status: "mandat",
        listing_source: "leboncoin",
        listing_url: "https://www.leboncoin.fr/",
        city: "Strasbourg",
        postal_code: "67000",
        department: "67",
        surface_m2: 68,
        rooms: 3,
        bedrooms: 2,
        price_fai: 265000,
        price_net: 250000,
        honoraires: 15000,
        has_cave: true,
        has_balcony: true,
        has_elevator: true,
        dpe: "C",
        description: "Exemple de bien saisi manuellement (lien portail collé, sans scraping).",
      },
      {
        id: uid("prop"),
        title: "Maison 5 pièces Illkirch",
        property_type: "maison",
        status: "mandat",
        listing_source: "seloger",
        listing_url: "https://www.seloger.com/",
        city: "Illkirch-Graffenstaden",
        postal_code: "67400",
        department: "67",
        surface_m2: 120,
        rooms: 5,
        bedrooms: 4,
        price_fai: 420000,
        price_net: 400000,
        has_garage: true,
        has_garden: true,
        has_terrace: true,
        dpe: "D",
      },
      {
        id: uid("prop"),
        title: "Studio Krutenau",
        property_type: "appartement",
        status: "mandat",
        listing_source: "paruvendu",
        city: "Strasbourg",
        postal_code: "67000",
        department: "67",
        surface_m2: 28,
        rooms: 1,
        bedrooms: 1,
        price_fai: 145000,
        price_net: 138000,
        has_cave: true,
      },
    ];
    var crit = {
      id: uid("crit"),
      label: "Famille — Strasbourg / Illkirch",
      status: "active",
      property_types: ["appartement", "maison"],
      cities: ["Strasbourg", "Illkirch-Graffenstaden"],
      departments: ["67"],
      surface_min: 60,
      rooms_min: 3,
      bedrooms_min: 2,
      budget_max: 350000,
      price_mode: "fai",
      want_garage: false,
      want_cave: true,
      want_balcony: true,
      notes: "Exemple de fiche recherche acquéreur.",
    };
    db.properties = props;
    db.criteria = [crit];
    db.parties = [
      {
        id: uid("party"),
        property_id: props[0].id,
        role: "vendeur",
        name: "M. Exemple Vendeur",
        phone: "",
        email: "",
      },
    ];
    db.documents = [
      {
        id: uid("idoc"),
        property_id: props[0].id,
        doc_type: "mandat_vente",
        title: "Mandat de vente — brouillon",
        status: "draft",
        data: {
          parties: { mandant: "M. Exemple Vendeur", agent: "" },
          bien: { adresse: "Strasbourg", prix_fai: 265000 },
          clauses: "À compléter — éditeur documents immo (fondation).",
        },
        notes: "",
      },
    ];
    return saveLocal(db);
  }

  return {
    KEY: KEY,
    loadLocal: loadLocal,
    syncFromApi: syncFromApi,
    listProperties: listProperties,
    getProperty: getProperty,
    upsertProperty: upsertProperty,
    deleteProperty: deleteProperty,
    listCriteria: listCriteria,
    getCriteria: getCriteria,
    upsertCriteria: upsertCriteria,
    deleteCriteria: deleteCriteria,
    listParties: listParties,
    upsertParty: upsertParty,
    deleteParty: deleteParty,
    listDocuments: listDocuments,
    upsertDocument: upsertDocument,
    deleteDocument: deleteDocument,
    match: match,
    seedDemoIfEmpty: seedDemoIfEmpty,
    uid: uid,
  };
})();
