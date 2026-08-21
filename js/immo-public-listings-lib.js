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
    "listing_urls_json",
    "mandate_started_at",
    "mandate_ends_at",
    "mandate_form",
    "mandate_ref",
    "date_mandat",
    "date_echeance",
    "photos_json",
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
    if (!d) return "";
    d = d.replace(/\b0[1-9](?:[\s.-]*\d{2}){4}\b/g, "").replace(/\S+@\S+\.\S+/g, "").replace(/\s+/g, " ").trim();
    return d.slice(0, 700);
  }

  function isSafeMediaUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(url) && url.length <= 280000) return true;
    if (/^https:\/\//i.test(url) && url.length <= 2000 && !/@/.test(url)) return true;
    return false;
  }

  function sanitizeMedia(list) {
    var arr = list;
    if (typeof list === "string") {
      try {
        arr = JSON.parse(list);
      } catch (e) {
        arr = [];
      }
    }
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    arr.forEach(function (item) {
      if (out.length >= 5) return;
      var url = typeof item === "string" ? item : item && (item.url || item.src);
      var kind = item && item.kind === "capture" ? "capture" : "photo";
      if (!isSafeMediaUrl(url)) return;
      out.push({ url: url, kind: kind });
    });
    return out;
  }

  function coverOf(photos) {
    if (!photos || !photos.length) return null;
    var photo = photos.filter(function (p) {
      return p.kind !== "capture";
    })[0];
    return photo || photos[0];
  }

  function captureOf(photos) {
    if (!photos || !photos.length) return null;
    return (
      photos.filter(function (p) {
        return p.kind === "capture";
      })[0] || null
    );
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
    var media = sanitizeMedia(p.photos || p.photos_json);
    listing.photos = media;
    listing.cover = coverOf(media);
    listing.capture = captureOf(media);
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
    SENSITIVE_KEYS: SENSITIVE_KEYS,
    toPublicListing: toPublicListing,
    sanitizeMedia: sanitizeMedia,
    isSafeMediaUrl: isSafeMediaUrl,
    coverOf: coverOf,
    captureOf: captureOf,
    filterListings: filterListings,
    formatPrice: formatPrice,
    amenityTags: amenityTags,
    typeLabel: typeLabel,
  };
});
