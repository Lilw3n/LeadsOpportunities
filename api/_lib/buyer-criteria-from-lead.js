/**
 * Extrait et enregistre les critères de recherche acquéreur
 * depuis un payload lead (wizard / dépôt public) → crm_immo_buyer_criteria.
 */
function flatten(body) {
  if (!body || typeof body !== "object") return {};
  if (body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)) {
    var merged = Object.assign({}, body, body.payload);
    delete merged.payload;
    return merged;
  }
  return Object.assign({}, body);
}

function num(v) {
  if (v == null || v === "") return null;
  var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function str(v, max) {
  if (v == null) return "";
  var s = String(v).trim();
  if (!s) return "";
  return max ? s.slice(0, max) : s;
}

function asList(v) {
  if (Array.isArray(v)) {
    return v
      .map(function (x) {
        return str(x, 80);
      })
      .filter(Boolean);
  }
  if (v == null || v === "") return [];
  return String(v)
    .split(/[,;/|]+/)
    .map(function (x) {
      return x.trim();
    })
    .filter(Boolean);
}

function isBuyerVertical(p) {
  var vertical = String(p.vertical || p.need || p.serviceNeed || "").toLowerCase();
  var role = String(p.role || p.immoHat || p.searchKind || "").toLowerCase();
  if (
    /acheteur|acquereur|buyer|les_deux|acheteur_vendeur|acheteur-vendeur/.test(vertical)
  ) {
    return true;
  }
  if (role === "acheteur" || role === "les_deux" || role === "bien" || role === "both") {
    return true;
  }
  if (p.searchCities || p.budgetMax || p.buyCity || p.buyBudgetMax) return true;
  if (Array.isArray(p.propertySought) && p.propertySought.length) return true;
  return false;
}

function truthy(v) {
  return v === true || v === "1" || v === "on" || v === "true" || v === "yes";
}

/**
 * @returns {object|null} payload prêt pour upsertCriteria, ou null si rien d'utile
 */
function buildCriteriaItem(body, leadId, contactId) {
  var p = flatten(body);
  if (!isBuyerVertical(p)) return null;

  var cities = asList(p.searchCities || p.buyCity || p.searchCitiesBuy || "");
  if (!cities.length && p.city && !p.sellCity) {
    cities = asList(p.city);
  }
  var postal = str(p.postalProject || p.buyPostal || p.buy_postal_code || p.postal_code || "", 5);
  var postals = postal ? [postal] : [];
  var depts = [];
  if (postal && postal.length >= 2) depts.push(postal.slice(0, 2));
  if (!depts.length && /nancy|jarville|varangéville|varangeville|dombasle|houdemont|ludres|54/i.test(cities.join(" "))) {
    depts.push("54");
  }

  var types = asList(p.propertySought || p.buyPropertyType || p.buy_property_type || p.property_type || "");
  var budgetMax = num(p.budgetMax || p.buyBudgetMax || p.buy_budget_max);
  var budgetMin = num(p.budgetMin || p.buyBudgetMin);
  var roomsMin = num(p.roomsMin || p.buyRoomsMin || p.buy_rooms_min);
  var bedroomsMin = num(p.bedroomsMin || p.buyBedroomsMin);
  var surfaceMin = num(p.propertySurfaceSearch || p.surfaceMin || p.buySurfaceMin || p.buy_surface_min);
  var radiusKm = num(p.searchRadiusKm || p.radius_km || p.radiusKm);

  var hasSignal =
    cities.length ||
    postals.length ||
    types.length ||
    budgetMax != null ||
    roomsMin != null ||
    surfaceMin != null ||
    bedroomsMin != null;
  if (!hasSignal) return null;

  var person =
    [p.firstName || p.first_name || p.prenom, p.lastName || p.last_name || p.nom]
      .filter(Boolean)
      .join(" ")
      .trim() || "Acquéreur";
  var role = String(p.role || "").toLowerCase();
  var notesBits = [];
  if (p.details) notesBits.push(str(p.details, 400));
  if (p.searchNotes) notesBits.push(str(p.searchNotes, 400));
  if (p.wantsRelais === true || p.wantsRelais === "1") notesBits.push("Prêt relais / chaîne demandé.");
  if (p.sellerType) notesBits.push("Vendeur souhaité : " + str(p.sellerType, 40));
  if (p.listingUrls) notesBits.push("URLs vues : " + str(p.listingUrls, 300));

  return {
    contact_id: contactId || null,
    lead_id: leadId || null,
    label: "Recherche — " + (cities[0] || person),
    status: "active",
    property_types: types,
    cities: cities,
    postal_codes: postals,
    departments: depts,
    radius_km: radiusKm,
    surface_min: surfaceMin,
    rooms_min: roomsMin,
    bedrooms_min: bedroomsMin,
    budget_min: budgetMin,
    budget_max: budgetMax,
    want_garage: truthy(p.wantGarage || p.want_garage),
    want_parking: truthy(p.wantParking || p.want_parking),
    want_cave: truthy(p.wantCave || p.want_cave),
    want_garden: truthy(p.wantGarden || p.want_garden),
    want_terrace: truthy(p.wantTerrace || p.want_terrace),
    want_balcony: truthy(p.wantBalcony || p.want_balcony),
    want_elevator: truthy(p.wantElevator || p.want_elevator),
    want_pool: truthy(p.wantPool || p.want_pool),
    notes: notesBits.join(" ").slice(0, 800) || null,
    metadata: {
      origin: p._criteriaOrigin || "public_lead",
      role: role || "acheteur",
      vertical: p.vertical || p.need || null,
    },
  };
}

async function upsertBuyerCriteriaFromLead(sql, body, leadId, contactId) {
  if (!sql) return null;
  var item = buildCriteriaItem(body, leadId, contactId);
  if (!item) return null;
  try {
    var store = require("./immo-properties-store");
    return await store.upsertCriteria(sql, item, null);
  } catch (err) {
    console.warn("[buyer-criteria] upsert", err && err.message);
    return null;
  }
}

module.exports = {
  buildCriteriaItem,
  upsertBuyerCriteriaFromLead,
  isBuyerVertical,
};
