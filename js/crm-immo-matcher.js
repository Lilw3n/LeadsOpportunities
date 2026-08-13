/**
 * Matching biens ↔ critères acquéreur (géo, surface, pièces, dépendances, budget).
 * Pure JS — utilisable côté Node et navigateur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmImmoMatcher = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var PROPERTY_TYPES = [
    { id: "appartement", label: "Appartement" },
    { id: "maison", label: "Maison" },
    { id: "terrain", label: "Terrain" },
    { id: "local", label: "Local commercial" },
    { id: "immeuble", label: "Immeuble" },
    { id: "parking", label: "Parking / garage" },
    { id: "complexe", label: "Complexe (terrain + bâtis)" },
    { id: "autre", label: "Autre" },
  ];

  var LISTING_SOURCES = [
    { id: "manual", label: "Saisie manuelle" },
    { id: "leboncoin", label: "Leboncoin" },
    { id: "seloger", label: "SeLoger" },
    { id: "paruvendu", label: "ParuVendu" },
    { id: "pap", label: "PAP" },
    { id: "logic_immo", label: "Logic-Immo" },
    { id: "orpi", label: "ORPI / réseau" },
    { id: "autre", label: "Autre portail" },
  ];

  var PARTY_ROLES = [
    { id: "vendeur", label: "Vendeur / propriétaire" },
    { id: "mandant", label: "Mandant" },
    { id: "agence", label: "Agence mandataire" },
    { id: "acquereur", label: "Acquéreur" },
    { id: "prospect", label: "Prospect intéressé" },
    { id: "colocataire", label: "Co-acquéreur" },
    { id: "notaire", label: "Notaire" },
    { id: "agent", label: "Agent / collègue" },
    { id: "apporteur", label: "Apporteur" },
  ];

  /** Statuts pipeline métier (réf. CRM immo) — numéro d’affichage + id stocké */
  var PROPERTY_STATUSES = [
    { id: "prospection", code: 1, label: "1 - Prospection", matchable: true },
    { id: "estimation", code: 2, label: "2 - Estimation", matchable: true },
    { id: "mandat", code: 3, label: "3 - Mandat en cours", matchable: true },
    { id: "suspendu", code: 4, label: "4 - Suspendu", matchable: false },
    { id: "sous_offre", code: 5, label: "5 - Sous offre", matchable: true },
    { id: "reserve_sru", code: 6, label: "6 - Réservé - SRU", matchable: true },
    { id: "compromis", code: 7, label: "7 - Compromis", matchable: false },
    { id: "vendu_loue", code: 8, label: "8 - Vendu / Loué", matchable: false },
    { id: "archive", code: 10, label: "10 - Archivé", matchable: false },
    { id: "a_supprimer", code: 11, label: "11 - A supprimer", matchable: false },
  ];

  var LEGACY_STATUS_MAP = {
    active: "mandat",
    under_offer: "compromis",
    sold: "vendu_loue",
    archived: "archive",
  };

  function normalizePropertyStatus(status) {
    var raw = String(status || "").trim();
    if (!raw) return "estimation";
    if (LEGACY_STATUS_MAP[raw]) return LEGACY_STATUS_MAP[raw];
    var found = PROPERTY_STATUSES.find(function (s) {
      return s.id === raw || String(s.code) === raw;
    });
    return found ? found.id : "estimation";
  }

  function propertyStatusLabel(status) {
    var id = normalizePropertyStatus(status);
    var found = PROPERTY_STATUSES.find(function (s) {
      return s.id === id;
    });
    return found ? found.label : id;
  }

  function isMatchableStatus(status) {
    var id = normalizePropertyStatus(status);
    var found = PROPERTY_STATUSES.find(function (s) {
      return s.id === id;
    });
    return !!(found && found.matchable);
  }

  var DOC_TYPES = [
    { id: "mandat_vente", label: "Mandat de vente" },
    { id: "mandat_recherche", label: "Mandat de recherche" },
    { id: "bon_visite", label: "Bon de visite" },
    { id: "offre_achat", label: "Offre d'achat" },
    { id: "compromis", label: "Compromis / promesse" },
    { id: "diagnostics", label: "Diagnostics (DPE…)" },
    { id: "honoraires", label: "Honoraires / facture" },
    { id: "autre", label: "Autre document" },
  ];

  function toNum(v) {
    if (v == null || v === "") return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  function parseJson(v, fallback) {
    if (Array.isArray(v) || (v && typeof v === "object")) return v;
    if (typeof v !== "string" || !v.trim()) return fallback;
    try {
      return JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    var a1 = toNum(lat1);
    var o1 = toNum(lng1);
    var a2 = toNum(lat2);
    var o2 = toNum(lng2);
    if (a1 == null || o1 == null || a2 == null || o2 == null) return null;
    var R = 6371;
    var dLat = ((a2 - a1) * Math.PI) / 180;
    var dLng = ((o2 - o1) * Math.PI) / 180;
    var x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((a1 * Math.PI) / 180) *
        Math.cos((a2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function normalizeProperty(p) {
    p = p || {};
    var deps = parseJson(p.dependencies_json || p.dependencies, {});
    return {
      id: p.id,
      title: p.title || "",
      property_type: p.property_type || "appartement",
      status: normalizePropertyStatus(p.status),
      listing_source: p.listing_source || "manual",
      listing_url: p.listing_url || "",
      address: p.address || "",
      city: (p.city || "").trim(),
      postal_code: String(p.postal_code || "").trim(),
      department: String(p.department || (p.postal_code || "").slice(0, 2)).trim(),
      lat: toNum(p.lat),
      lng: toNum(p.lng),
      surface_m2: toNum(p.surface_m2),
      rooms: toNum(p.rooms),
      bedrooms: toNum(p.bedrooms),
      has_elevator: !!(p.has_elevator || deps.elevator),
      has_garage: !!(p.has_garage || deps.garage),
      has_parking: !!(p.has_parking || deps.parking),
      has_cave: !!(p.has_cave || deps.cave),
      has_garden: !!(p.has_garden || deps.garden),
      has_terrace: !!(p.has_terrace || deps.terrace),
      has_balcony: !!(p.has_balcony || deps.balcony),
      has_pool: !!(p.has_pool || deps.pool),
      price_net: toNum(p.price_net),
      price_fai: toNum(p.price_fai),
      honoraires: toNum(p.honoraires),
      dpe: p.dpe || "",
      description: p.description || "",
      notes: p.notes || "",
      owner_contact_id: p.owner_contact_id || null,
      buyer_contact_id: p.buyer_contact_id || null,
      lead_id: p.lead_id || null,
    };
  }

  function normalizeCriteria(c) {
    c = c || {};
    return {
      id: c.id,
      contact_id: c.contact_id || null,
      lead_id: c.lead_id || null,
      label: c.label || "Recherche",
      status: c.status || "active",
      property_types: parseJson(c.property_types_json || c.property_types, []),
      cities: parseJson(c.cities_json || c.cities, []).map(function (x) {
        return String(x || "").trim().toLowerCase();
      }),
      postal_codes: parseJson(c.postal_codes_json || c.postal_codes, []).map(String),
      departments: parseJson(c.departments_json || c.departments, []).map(String),
      radius_km: toNum(c.radius_km),
      center_lat: toNum(c.center_lat),
      center_lng: toNum(c.center_lng),
      surface_min: toNum(c.surface_min),
      surface_max: toNum(c.surface_max),
      rooms_min: toNum(c.rooms_min),
      bedrooms_min: toNum(c.bedrooms_min),
      budget_min: toNum(c.budget_min),
      budget_max: toNum(c.budget_max),
      price_mode: c.price_mode === "net_vendeur" ? "net_vendeur" : "fai",
      want_garage: !!c.want_garage,
      want_parking: !!c.want_parking,
      want_cave: !!c.want_cave,
      want_garden: !!c.want_garden,
      want_terrace: !!c.want_terrace,
      want_balcony: !!c.want_balcony,
      want_elevator: !!c.want_elevator,
      want_pool: !!c.want_pool,
      must_haves: parseJson(c.must_haves_json || c.must_haves, []),
      notes: c.notes || "",
    };
  }

  function propertyPrice(p, mode) {
    if (mode === "net_vendeur") return p.price_net != null ? p.price_net : p.price_fai;
    return p.price_fai != null ? p.price_fai : p.price_net;
  }

  /**
   * Score 0–100 + raisons / écarts.
   */
  function scorePropertyAgainstCriteria(property, criteria) {
    var p = normalizeProperty(property);
    var c = normalizeCriteria(criteria);
    var reasons = [];
    var gaps = [];
    var score = 0;
    var max = 0;

    // Type (15)
    max += 15;
    if (!c.property_types.length || c.property_types.indexOf(p.property_type) !== -1) {
      score += 15;
      if (c.property_types.length) reasons.push("Type correspondant");
    } else {
      gaps.push("Type : " + p.property_type + " ≠ recherche");
    }

    // Géographie (25)
    max += 25;
    var geoPts = 0;
    var cityHit =
      c.cities.length &&
      p.city &&
      c.cities.indexOf(p.city.toLowerCase()) !== -1;
    var cpHit =
      c.postal_codes.length &&
      p.postal_code &&
      c.postal_codes.some(function (cp) {
        return p.postal_code.indexOf(String(cp)) === 0 || String(cp).indexOf(p.postal_code) === 0;
      });
    var deptHit =
      c.departments.length &&
      p.department &&
      c.departments.indexOf(p.department) !== -1;
    var dist = null;
    if (c.center_lat != null && c.center_lng != null && p.lat != null && p.lng != null) {
      dist = haversineKm(c.center_lat, c.center_lng, p.lat, p.lng);
    }
    if (cityHit || cpHit) {
      geoPts = 25;
      reasons.push(cityHit ? "Ville cible" : "Code postal cible");
    } else if (deptHit) {
      geoPts = 16;
      reasons.push("Département cible");
    } else if (dist != null && c.radius_km != null) {
      if (dist <= c.radius_km) {
        geoPts = Math.max(8, Math.round(25 * (1 - dist / Math.max(c.radius_km, 0.1))));
        reasons.push("À " + dist.toFixed(1) + " km (rayon " + c.radius_km + ")");
      } else {
        gaps.push("Hors rayon (" + dist.toFixed(1) + " km > " + c.radius_km + ")");
      }
    } else if (!c.cities.length && !c.postal_codes.length && !c.departments.length && c.radius_km == null) {
      geoPts = 12;
    } else {
      gaps.push("Zone géographique éloignée");
    }
    score += geoPts;

    // Surface (15)
    max += 15;
    if (p.surface_m2 == null) {
      score += 5;
      gaps.push("Surface non renseignée");
    } else if (
      (c.surface_min == null || p.surface_m2 >= c.surface_min) &&
      (c.surface_max == null || p.surface_m2 <= c.surface_max)
    ) {
      score += 15;
      reasons.push(p.surface_m2 + " m² dans la fourchette");
    } else {
      var mid =
        c.surface_min != null && c.surface_max != null
          ? (c.surface_min + c.surface_max) / 2
          : c.surface_min != null
            ? c.surface_min
            : c.surface_max;
      var ratio = mid ? Math.min(1, p.surface_m2 / mid) : 0;
      if (ratio > 1) ratio = Math.min(1, mid / p.surface_m2);
      score += Math.round(15 * Math.max(0, ratio * 0.55));
      gaps.push("Surface " + p.surface_m2 + " m² hors fourchette");
    }

    // Pièces / chambres (15)
    max += 15;
    var roomPts = 0;
    if (c.rooms_min == null || (p.rooms != null && p.rooms >= c.rooms_min)) {
      roomPts += 8;
      if (c.rooms_min != null) reasons.push((p.rooms || "?") + " pièces");
    } else if (p.rooms != null) {
      gaps.push("Pièces insuffisantes (" + p.rooms + " < " + c.rooms_min + ")");
    }
    if (c.bedrooms_min == null || (p.bedrooms != null && p.bedrooms >= c.bedrooms_min)) {
      roomPts += 7;
      if (c.bedrooms_min != null) reasons.push((p.bedrooms || "?") + " chambres");
    } else if (p.bedrooms != null) {
      gaps.push("Chambres insuffisantes");
    }
    if (c.rooms_min == null && c.bedrooms_min == null) roomPts = 10;
    score += Math.min(15, roomPts);

    // Budget (15)
    max += 15;
    var price = propertyPrice(p, c.price_mode);
    if (price == null) {
      score += 5;
      gaps.push("Prix non renseigné");
    } else if (
      (c.budget_min == null || price >= c.budget_min) &&
      (c.budget_max == null || price <= c.budget_max)
    ) {
      score += 15;
      reasons.push("Budget OK (" + Math.round(price).toLocaleString("fr-FR") + " €)");
    } else if (c.budget_max != null && price > c.budget_max) {
      var over = (price - c.budget_max) / Math.max(c.budget_max, 1);
      score += Math.max(0, Math.round(15 * (1 - Math.min(over, 1))));
      gaps.push("Au-dessus du budget (+" + Math.round(over * 100) + " %)");
    } else {
      score += 8;
      gaps.push("Sous le budget min");
    }

    // Dépendances (15)
    max += 15;
    var wants = [
      ["want_garage", "has_garage", "garage"],
      ["want_parking", "has_parking", "parking"],
      ["want_cave", "has_cave", "cave"],
      ["want_garden", "has_garden", "jardin"],
      ["want_terrace", "has_terrace", "terrasse"],
      ["want_balcony", "has_balcony", "balcon"],
      ["want_elevator", "has_elevator", "ascenseur"],
      ["want_pool", "has_pool", "piscine"],
    ];
    var wantCount = 0;
    var gotCount = 0;
    wants.forEach(function (w) {
      if (!c[w[0]]) return;
      wantCount += 1;
      if (p[w[1]]) {
        gotCount += 1;
        reasons.push(w[2]);
      } else {
        gaps.push("Manque " + w[2]);
      }
    });
    if (!wantCount) {
      score += 10;
    } else {
      score += Math.round(15 * (gotCount / wantCount));
    }

    var pct = max > 0 ? Math.round((score / max) * 100) : 0;
    var status = pct >= 80 ? "excellent" : pct >= 60 ? "bon" : pct >= 40 ? "partiel" : "faible";

    return {
      score: pct,
      status: status,
      reasons: reasons,
      gaps: gaps,
      distanceKm: dist,
      property: p,
      criteria: c,
    };
  }

  function matchPropertiesToBuyer(criteria, properties, opts) {
    opts = opts || {};
    var minScore = opts.minScore != null ? Number(opts.minScore) : 0;
    var list = (properties || []).map(function (p) {
      return scorePropertyAgainstCriteria(p, criteria);
    });
    list = list.filter(function (r) {
      return r.score >= minScore && isMatchableStatus(r.property.status);
    });
    list.sort(function (a, b) {
      return b.score - a.score;
    });
    return {
      generatedAt: new Date().toISOString(),
      criteria: normalizeCriteria(criteria),
      matches: list,
      best: list[0] || null,
      count: list.length,
    };
  }

  function filterProperties(properties, query) {
    var q = (query || {}).q ? String(query.q).toLowerCase().trim() : "";
    var type = query.property_type || "";
    var source = query.listing_source || "";
    var city = (query.city || "").toLowerCase().trim();
    var status = query.status || "";
    var etat = query.etat || "";
    var transaction = query.transaction || "";
    var agence = (query.agence || "").toLowerCase().trim();
    var suivi = (query.suivi_par || "").toLowerCase().trim();
    var minPrice = toNum(query.min_price);
    var maxPrice = toNum(query.max_price);
    var minSurface = toNum(query.min_surface);
    var maxSurface = toNum(query.max_surface);
    var minRooms = toNum(query.min_rooms);
    var maxRooms = toNum(query.max_rooms);
    var minBed = toNum(query.min_bedrooms);
    var maxBed = toNum(query.max_bedrooms);
    var phoneMode = query.phone || "any";
    var geoMode = query.geo || "any";
    var aContacter = query.a_contacter;
    var contactConnu = query.contact_connu;
    var dateFrom = query.date_from ? String(query.date_from) : "";
    var dateTo = query.date_to ? String(query.date_to) : "";

    return (properties || []).filter(function (raw) {
      var p = normalizeProperty(raw);
      if (status && p.status !== status) return false;
      if (type && p.property_type !== type) return false;
      if (source && p.listing_source !== source) return false;
      if (transaction && (raw.transaction || "vente") !== transaction) return false;
      if (etat && (raw.etat || "non_affectee") !== etat) return false;
      if (city) {
        var hayCity = ((p.city || "") + " " + (p.postal_code || "")).toLowerCase();
        if (hayCity.indexOf(city) === -1) return false;
      }
      if (agence && String(raw.agence || "").toLowerCase().indexOf(agence) === -1) return false;
      if (suivi && String(raw.suivi_par || "").toLowerCase().indexOf(suivi) === -1) return false;
      var price = p.price_fai != null ? p.price_fai : p.price_net;
      if (minPrice != null && (price == null || price < minPrice)) return false;
      if (maxPrice != null && (price == null || price > maxPrice)) return false;
      if (minSurface != null && (p.surface_m2 == null || p.surface_m2 < minSurface)) return false;
      if (maxSurface != null && (p.surface_m2 == null || p.surface_m2 > maxSurface)) return false;
      if (minRooms != null && (p.rooms == null || p.rooms < minRooms)) return false;
      if (maxRooms != null && (p.rooms == null || p.rooms > maxRooms)) return false;
      if (minBed != null && (p.bedrooms == null || p.bedrooms < minBed)) return false;
      if (maxBed != null && (p.bedrooms == null || p.bedrooms > maxBed)) return false;
      var hasPhone = !!(raw.phone || raw.contact_phone);
      if (phoneMode === "yes" && !hasPhone) return false;
      if (phoneMode === "no" && hasPhone) return false;
      var hasGeo = p.lat != null && p.lng != null;
      if (geoMode === "yes" && !hasGeo) return false;
      if (geoMode === "no" && hasGeo) return false;
      if (aContacter === true && !raw.a_contacter) return false;
      if (contactConnu === true && !raw.contact_connu && !raw.owner_contact_id && !raw.buyer_contact_id) return false;
      var created = String(raw.created_at || raw.updated_at || "").slice(0, 10);
      if (dateFrom && created && created < dateFrom) return false;
      if (dateTo && created && created > dateTo) return false;
      if (q) {
        var hay = [
          p.title,
          p.city,
          p.postal_code,
          p.address,
          p.listing_url,
          p.description,
          p.notes,
          raw.agence,
          raw.suivi_par,
          raw.phone,
        ]
          .join(" ")
          .toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  return {
    PROPERTY_TYPES: PROPERTY_TYPES,
    PROPERTY_STATUSES: PROPERTY_STATUSES,
    LISTING_SOURCES: LISTING_SOURCES,
    PARTY_ROLES: PARTY_ROLES,
    DOC_TYPES: DOC_TYPES,
    normalizeProperty: normalizeProperty,
    normalizePropertyStatus: normalizePropertyStatus,
    propertyStatusLabel: propertyStatusLabel,
    isMatchableStatus: isMatchableStatus,
    normalizeCriteria: normalizeCriteria,
    scorePropertyAgainstCriteria: scorePropertyAgainstCriteria,
    matchPropertiesToBuyer: matchPropertiesToBuyer,
    filterProperties: filterProperties,
    haversineKm: haversineKm,
    propertyPrice: propertyPrice,
  };
});
