/**
 * GET /api/immo-ads — pubs publiques des mandats (sans PII).
 * GET /api/immo-ads?token=… — démo privée (grant requis si accès restreint).
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const Access = require("../../../js/immo-ad-demo-access-lib.js");

async function loadProperties() {
  var sql = getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return db.properties || [];
}

module.exports = async function publicImmoAds(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-ads:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes, réessayez plus tard" });
  }

  var token = String((req.query && (req.query.token || req.query.share)) || "").trim();
  var grant = String((req.query && req.query.grant) || "").trim();
  var properties = [];
  try {
    properties = await loadProperties();
  } catch (err) {
    console.warn("[immo-ads]", err && err.message);
    properties = [];
  }

  res.setHeader("Cache-Control", "private, no-store");

  if (token) {
    var found = AdLib.findByShareToken(properties, token);
    if (!found) {
      return res.status(404).json({ ok: false, error: "Démo introuvable ou expirée" });
    }
    var bag = AdLib.getAdMeta(found);
    if (Access.hasRestrictedAccess(bag.ad)) {
      var okGrant = Access.verifyGrant(grant, token);
      if (!okGrant) {
        return res.status(401).json({
          ok: false,
          requires_auth: true,
          methods: Access.accessMethods(bag.ad),
          error: "Connexion requise (e-mail ou téléphone + code)",
        });
      }
    }
    return res.status(200).json({
      ok: true,
      channel: "private",
      listing: AdLib.toAdListing(found),
    });
  }

  var listings = AdLib.filterPublicAds(properties);
  return res.status(200).json({
    ok: true,
    channel: "public",
    count: listings.length,
    listings: listings,
  });
};
