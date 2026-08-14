/**
 * GET /api/immo-listings — vitrine publique des biens (sans PII).
 * Uniquement les biens sous mandat CRM. Les piges restent privées jusqu'à l'obtention du mandat.
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const Lib = require("../../../js/immo-public-listings-lib.js");
const Matcher = require("../../../js/crm-immo-matcher.js");

function queryFromReq(req) {
  var q = req.query || {};
  return {
    types: q.types || q.type || q.property_type || "",
    city: q.city || q.searchCities || "",
    postal: q.postal || q.postal_code || q.postalProject || "",
    budgetMax: q.budgetMax || q.budget_max || q.max_price || "",
    budgetMin: q.budgetMin || q.budget_min || q.min_price || "",
    roomsMin: q.roomsMin || q.rooms_min || q.min_rooms || "",
    surfaceMin: q.surfaceMin || q.surface_min || q.min_surface || "",
    q: q.q || "",
  };
}

function isPublicListingStatus(status) {
  return Matcher.normalizePropertyStatus(status) === "mandat";
}

async function loadCrmListings() {
  var sql = getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return (db.properties || [])
    .filter(function (p) {
      return isPublicListingStatus(p.status);
    })
    .map(function (p) {
      return Lib.toPublicListing(p);
    })
    .filter(function (p) {
      return p.id && p.city;
    });
}

module.exports = async function publicImmoListings(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listings:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes, réessayez plus tard" });
  }

  var query = queryFromReq(req);
  var source = "crm";
  var listings = [];

  try {
    listings = await loadCrmListings();
  } catch (err) {
    console.warn("[immo-listings]", err && err.message);
    listings = [];
  }

  var filtered = Lib.filterListings(listings, query);
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    ok: true,
    source: source,
    count: filtered.length,
    total: listings.length,
    listings: filtered,
  });
};
