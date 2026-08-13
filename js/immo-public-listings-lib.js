/**
 * Annonces immobilières publiques (vitrine) — sans PII.
 * Utilisable en Node et dans le navigateur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoPublicListings = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var TYPE_LABELS = {
    appartement: "Appartement",
    maison: "Maison",
    terrain: "Terrain",
    local: "Local / mixte",
    immeuble: "Immeuble",
    parking: "Parking / garage",
    complexe: "Complexe",
    autre: "Autre",
  };

  var DEMO_LISTINGS = [
    {
      id: "demo_strasbourg_t3",
      title: "T3 centre Strasbourg",
      property_type: "appartement",
      city: "Strasbourg",
      postal_code: "67000",
      department: "67",
      surface_m2: 68,
      rooms: 3,
      bedrooms: 2,
      price_fai: 265000,
      dpe: "C",
      has_elevator: true,
      has_balcony: true,
      has_cave: true,
      description: "Appartement lumineux proche tram, cave et balcon. Mandat d'exemple.",
    },
    {
      id: "demo_illkirch_maison",
      title: "Maison 5 pièces Illkirch",
      property_type: "maison",
      city: "Illkirch-Graffenstaden",
      postal_code: "67400",
      department: "67",
      surface_m2: 120,
      rooms: 5,
      bedrooms: 4,
      price_fai: 420000,
      dpe: "D",
      has_garage: true,
      has_garden: true,
      has_terrace: true,
      description: "Maison familiale avec jardin et garage, proche écoles.",
    },
    {
      id: "demo_krutenau_studio",
      title: "Studio Krutenau",
      property_type: "appartement",
      city: "Strasbourg",
      postal_code: "67000",
      department: "67",
      surface_m2: 28,
      rooms: 1,
      bedrooms: 1,
      price_fai: 145000,
      dpe: "E",
      has_cave: true,
      description: "Studio au calme, idéal primo-accédant ou investissement.",
    },
    {
      id: "demo_lyon_t4",
      title: "T4 Presqu'île Lyon",
      property_type: "appartement",
      city: "Lyon",
      postal_code: "69003",
      department: "69",
      surface_m2: 82,
      rooms: 4,
      bedrooms: 3,
      price_fai: 389000,
      dpe: "C",
      has_elevator: true,
      has_parking: true,
      description: "Grand T4 avec parking, proche métro.",
    },
    {
      id: "demo_bordeaux_maison",
      title: "Maison avec jardin Bordeaux",
      property_type: "maison",
      city: "Bordeaux",
      postal_code: "33000",
      department: "33",
      surface_m2: 95,
      rooms: 4,
      bedrooms: 3,
      price_fai: 345000,
      dpe: "D",
      has_garden: true,
      has_terrace: true,
      description: "Maison de ville, jardin clos, commerces à pied.",
    },
    {
      id: "demo_paris11_t2",
      title: "T2 Paris 11e",
      property_type: "appartement",
      city: "Paris",
      postal_code: "75011",
      department: "75",
      surface_m2: 42,
      rooms: 2,
      bedrooms: 1,
      price_fai: 429000,
      dpe: "D",
      has_elevator: true,
      has_balcony: true,
      description: "T2 avec balcon, quartier Oberkampf.",
    },
    {
      id: "demo_nantes_t3",
      title: "T3 Nantes centre",
      property_type: "appartement",
      city: "Nantes",
      postal_code: "44000",
      department: "44",
      surface_m2: 70,
      rooms: 3,
      bedrooms: 2,
      price_fai: 259000,
      dpe: "C",
      has_parking: true,
      has_balcony: true,
      description: "T3 rénové, parking, proche tramway.",
    },
    {
      id: "demo_lille_maison",
      title: "Maison 5 pièces Lille",
      property_type: "maison",
      city: "Lille",
      postal_code: "59000",
      department: "59",
      surface_m2: 110,
      rooms: 5,
      bedrooms: 3,
      price_fai: 275000,
      dpe: "E",
      has_garage: true,
      has_garden: true,
      description: "Maison de caractère, garage et jardin.",
    },
  ];

  var SENSITIVE_KEYS = [
    "address",
    "notes",
    "email",
    "phone",
    "owner_contact_id",
    "buyer_contact_id",
    "lead_id",
    "assigned_to",
    "created_by",
    "listing_url",
    "photos_json",
    "photos",
    "metadata_json",
    "metadata",
    "honoraires",
    "price_net",
    "lat",
    "lng",
    "parties",
    "documents",
  ];

  function toNum(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : null;
  }

  function typeLabel(type) {
    return TYPE_LABELS[type] || TYPE_LABELS.autre;
  }

  function looksPrivate(text) {
    var t = String(text || "");
    if (/@/.test(t)) return true;
    if (/\b0[1-9](?:[\s.-]*\d{2}){4}\b/.test(t)) return true;
    return false;
  }

  function publicTitle(p) {
    var t = String(p.title || "").trim();
    if (t && !looksPrivate(t) && t.length <= 90) return t;
    return [typeLabel(p.property_type), p.rooms ? p.rooms + " pièces" : "", p.city]
      .filter(Boolean)
      .join(" · ");
  }

  function publicDescription(p) {
    var d = String(p.description || "").replace(/\s+/g, " ").trim();
    if (!d || looksPrivate(d)) return "";
    return d.slice(0, 220);
  }

  function toPublicListing(raw) {
    var p = raw || {};
    var postal = String(p.postal_code || "").replace(/\D/g, "").slice(0, 5);
    var listing = {
      id: String(p.id || ""),
      title: publicTitle(p),
      property_type: String(p.property_type || "appartement"),
      type_label: typeLabel(p.property_type),
      city: String(p.city || "").trim(),
      postal_code: postal,
      department: String(p.department || postal.slice(0, 2)).trim(),
      rooms: toNum(p.rooms),
      bedrooms: toNum(p.bedrooms),
      surface_m2: toNum(p.surface_m2),
      floor: p.floor != null && p.floor !== "" ? String(p.floor) : "",
      has_elevator: !!p.has_elevator,
      has_garage: !!p.has_garage,
      has_parking: !!p.has_parking,
      has_cave: !!p.has_cave,
      has_garden: !!p.has_garden,
      has_terrace: !!p.has_terrace,
      has_balcony: !!p.has_balcony,
      dpe: String(p.dpe || "").trim().toUpperCase().slice(0, 1),
      ges: String(p.ges || "").trim().toUpperCase().slice(0, 1),
      price_fai: toNum(p.price_fai != null ? p.price_fai : p.price),
      description: publicDescription(p),
      demo: !!p.demo || String(p.id || "").indexOf("demo_") === 0,
    };
    SENSITIVE_KEYS.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(listing, k)) delete listing[k];
    });
    return listing;
  }

  function parseTypes(query) {
    var raw = query && (query.types || query.type || query.property_type);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    return String(raw)
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function filterListings(listings, query) {
    query = query || {};
    var types = parseTypes(query);
    var city = String(query.city || "").toLowerCase().trim();
    var postal = String(query.postal || query.postal_code || "").replace(/\D/g, "");
    var budgetMax = toNum(query.budgetMax || query.budget_max || query.max_price);
    var budgetMin = toNum(query.budgetMin || query.budget_min || query.min_price);
    var roomsMin = toNum(query.roomsMin || query.rooms_min || query.min_rooms);
    var surfaceMin = toNum(query.surfaceMin || query.surface_min || query.min_surface);
    var q = String(query.q || "").toLowerCase().trim();

    return (listings || []).filter(function (raw) {
      var p = raw.property_type ? raw : toPublicListing(raw);
      if (types.length && types.indexOf(p.property_type) === -1) return false;
      if (city) {
        var hayCity = ((p.city || "") + " " + (p.postal_code || "")).toLowerCase();
        if (hayCity.indexOf(city) === -1) return false;
      }
      if (postal) {
        var cp = String(p.postal_code || "");
        if (postal.length === 2) {
          if (String(p.department || cp.slice(0, 2)) !== postal) return false;
        } else if (cp.indexOf(postal) !== 0) {
          return false;
        }
      }
      if (budgetMax != null && (p.price_fai == null || p.price_fai > budgetMax)) return false;
      if (budgetMin != null && (p.price_fai == null || p.price_fai < budgetMin)) return false;
      if (roomsMin != null && (p.rooms == null || p.rooms < roomsMin)) return false;
      if (surfaceMin != null && (p.surface_m2 == null || p.surface_m2 < surfaceMin)) return false;
      if (q) {
        var hay = [p.title, p.city, p.postal_code, p.type_label, p.description].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function formatPrice(n) {
    var v = toNum(n);
    if (v == null) return "Prix sur demande";
    return (
      Math.round(v)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"
    );
  }

  function amenityTags(p) {
    var tags = [];
    if (p.has_garage) tags.push("Garage");
    if (p.has_parking) tags.push("Parking");
    if (p.has_garden) tags.push("Jardin");
    if (p.has_terrace) tags.push("Terrasse");
    if (p.has_balcony) tags.push("Balcon");
    if (p.has_elevator) tags.push("Ascenseur");
    if (p.has_cave) tags.push("Cave");
    return tags;
  }

  return {
    TYPE_LABELS: TYPE_LABELS,
    DEMO_LISTINGS: DEMO_LISTINGS.map(function (p) {
      return toPublicListing(Object.assign({ demo: true }, p));
    }),
    SENSITIVE_KEYS: SENSITIVE_KEYS,
    toPublicListing: toPublicListing,
    filterListings: filterListings,
    formatPrice: formatPrice,
    amenityTags: amenityTags,
    typeLabel: typeLabel,
  };
});
