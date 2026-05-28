/**
 * Memo partenariat grossistes — stockage local + fusion avec registre par defaut
 */
window.CrmWholesalersMemo = (function () {
  var STORAGE_KEY = "lo_wholesalers_memo_v1";

  var PRODUCT_OPTIONS = [
    { id: "auto", label: "Auto particulier" },
    { id: "auto-pro", label: "Auto pro" },
    { id: "vtc-taxi", label: "VTC / Taxi" },
    { id: "habitation", label: "Habitation" },
    { id: "sante", label: "Sante" },
    { id: "prevoyance", label: "Prevoyance" },
    { id: "rc-pro", label: "RC Pro" },
    { id: "decennale", label: "Decennale" },
    { id: "flotte", label: "Flotte" },
    { id: "transport", label: "Transport" },
    { id: "moto", label: "Moto" },
    { id: "emprunteur", label: "Emprunteur" },
    { id: "negociant-auto", label: "Negociant auto" },
    { id: "autre", label: "Autre" },
  ];

  var PARTNERSHIP_STATUS = [
    { id: "to_contact", label: "A contacter", cls: "st-todo" },
    { id: "in_progress", label: "Contact en cours", cls: "st-progress" },
    { id: "docs_sent", label: "Documents envoyes", cls: "st-progress" },
    { id: "signed", label: "Convention signee", cls: "st-ok" },
    { id: "active_partner", label: "Actif (production)", cls: "st-ok" },
    { id: "paused", label: "Inactif / pause", cls: "st-pause" },
  ];

  var PRIORITY = [
    { id: "high", label: "Haute" },
    { id: "medium", label: "Moyenne" },
    { id: "low", label: "Basse" },
  ];

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var bag = raw ? JSON.parse(raw) : {};
      if (!bag || typeof bag !== "object") bag = {};
      if (!Array.isArray(bag.custom)) bag.custom = [];
      if (!bag.overrides || typeof bag.overrides !== "object") bag.overrides = {};
      return bag;
    } catch (e) {
      return { custom: [], overrides: {} };
    }
  }

  function saveStore(bag) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
  }

  function statusMeta(id) {
    return PARTNERSHIP_STATUS.find(function (s) {
      return s.id === id;
    }) || PARTNERSHIP_STATUS[0];
  }

  function productLabel(id) {
    var p = PRODUCT_OPTIONS.find(function (x) {
      return x.id === id;
    });
    return p ? p.label : id;
  }

  function normalizeEntry(raw, isCustom) {
    var products = Array.isArray(raw.products) ? raw.products.slice() : [];
    return {
      id: String(raw.id || "wh_" + Date.now()),
      displayName: String(raw.displayName || raw.name || "Sans nom").trim(),
      logo: raw.logo || "🏢",
      website: raw.website || "",
      contactName: raw.contactName || "",
      contactEmail: raw.contactEmail || "",
      contactPhone: raw.contactPhone || "",
      products: products,
      specialties: raw.specialties || (Array.isArray(raw.specialties) ? raw.specialties.join(" · ") : ""),
      partnershipStatus: raw.partnershipStatus || "to_contact",
      commission: raw.commission || "",
      onboardingDays: raw.onboardingDays || "",
      priority: raw.priority || "medium",
      notes: raw.notes || "",
      nextAction: raw.nextAction || "",
      isVerified: !!raw.isVerified,
      status: raw.status || "active",
      isCustom: !!isCustom,
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  function listAll() {
    var store = loadStore();
    var base = (window.CrmWholesalersData && window.CrmWholesalersData.PARTNERS) || [];
    var merged = base.map(function (p) {
      var ov = store.overrides[p.id] || {};
      return normalizeEntry(
        Object.assign({}, p, ov, {
          specialties:
            ov.specialties ||
            (Array.isArray(p.specialties) ? p.specialties.join(" · ") : p.specialties || ""),
        }),
        false
      );
    });
    store.custom.forEach(function (c) {
      merged.push(normalizeEntry(c, true));
    });
    return merged;
  }

  function getById(id) {
    return listAll().find(function (p) {
      return p.id === id;
    });
  }

  function upsert(entry) {
    var store = loadStore();
    var clean = normalizeEntry(entry, !!entry.isCustom);
    var baseIds = ((window.CrmWholesalersData && window.CrmWholesalersData.PARTNERS) || []).map(function (p) {
      return p.id;
    });
    clean.updatedAt = new Date().toISOString();

    if (clean.isCustom || baseIds.indexOf(clean.id) < 0) {
      var idx = store.custom.findIndex(function (c) {
        return c.id === clean.id;
      });
      if (idx >= 0) store.custom[idx] = clean;
      else store.custom.push(clean);
    } else {
      store.overrides[clean.id] = Object.assign({}, store.overrides[clean.id] || {}, {
        displayName: clean.displayName,
        website: clean.website,
        contactName: clean.contactName,
        contactEmail: clean.contactEmail,
        contactPhone: clean.contactPhone,
        products: clean.products,
        specialties: clean.specialties,
        partnershipStatus: clean.partnershipStatus,
        commission: clean.commission,
        onboardingDays: clean.onboardingDays,
        priority: clean.priority,
        notes: clean.notes,
        nextAction: clean.nextAction,
        updatedAt: clean.updatedAt,
      });
    }
    saveStore(store);
    return clean;
  }

  function remove(id) {
    var store = loadStore();
    store.custom = store.custom.filter(function (c) {
      return c.id !== id;
    });
    delete store.overrides[id];
    saveStore(store);
  }

  function toCsv(rows) {
    var header = [
      "Grossiste",
      "Produits",
      "Specialites",
      "Contact",
      "Email",
      "Tel",
      "Statut partenariat",
      "Commission",
      "Delai onboarding",
      "Priorite",
      "Prochaine action",
      "Notes",
    ];
    var lines = [header.join(";")];
    rows.forEach(function (r) {
      lines.push(
        [
          r.displayName,
          (r.products || []).map(productLabel).join(" | "),
          r.specialties,
          r.contactName,
          r.contactEmail,
          r.contactPhone,
          statusMeta(r.partnershipStatus).label,
          r.commission,
          r.onboardingDays,
          r.priority,
          r.nextAction,
          (r.notes || "").replace(/[\n\r;]/g, " "),
        ]
          .map(function (v) {
            return '"' + String(v || "").replace(/"/g, '""') + '"';
          })
          .join(";")
      );
    });
    return lines.join("\n");
  }

  return {
    PRODUCT_OPTIONS: PRODUCT_OPTIONS,
    PARTNERSHIP_STATUS: PARTNERSHIP_STATUS,
    PRIORITY: PRIORITY,
    listAll: listAll,
    getById: getById,
    upsert: upsert,
    remove: remove,
    statusMeta: statusMeta,
    productLabel: productLabel,
    toCsv: toCsv,
  };
})();
