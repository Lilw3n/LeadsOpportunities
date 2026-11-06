/**
 * GET /api/immo-tour-og?t=vt_…
 * HTML Open Graph pour crawlers sociaux (Facebook / Meta Ads, WhatsApp…).
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const Tour = require("../../../js/immo-tour-access-lib.js");
const Og = require("../../../js/immo-tour-og-lib.js");

async function loadProperties() {
  var sql = require("../db").getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return db.properties || [];
}

function canonicalUrl(req) {
  var host = (req.headers && (req.headers["x-forwarded-host"] || req.headers.host)) || "www.leadsopportunities.fr";
  var proto = (req.headers && req.headers["x-forwarded-proto"]) || "https";
  var q = req.query || {};
  var params = new URLSearchParams();
  if (q.t) params.set("t", String(q.t));
  else if (q.token) params.set("t", String(q.token));
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) {
    if (q[k]) params.set(k, String(q[k]));
  });
  var qs = params.toString();
  return proto + "://" + host + "/immobilier/visite.html" + (qs ? "?" + qs : "");
}

module.exports = async function immoTourOg(req, res) {
  applyApiGuards(req, res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }
  var ip = getClientIp(req);
  var rl = rateLimit("immo-tour-og:" + ip, 60, 60 * 1000);
  if (!rl.allowed) return res.status(429).send("Trop de requêtes");

  var token = String((req.query && (req.query.t || req.query.token)) || "").trim();
  var url = canonicalUrl(req);
  var fallback = Og.buildPayload(null, { name: "Visite virtuelle" }, url);

  if (!Tour.isTourToken(token)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).send(Og.renderOgHtml(fallback));
  }

  var props = [];
  try {
    props = await loadProperties();
  } catch (e) {
    props = [];
  }
  var found = AdLib.findByTourToken(props, token);
  if (!found) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(200).send(Og.renderOgHtml(fallback));
  }

  var access = Tour.getTourAccessForToken
    ? Tour.getTourAccessForToken(AdLib.getAdMeta(found).ad, token)
    : AdLib.getAdMeta(found).ad.tour_access;
  var listing = AdLib.toAdListing(found, { includeTourUrl: false });
  var tourMeta = Tour.publicMeta(access, { title: listing.headline, city: listing.city }, found);
  var payload = Og.buildPayload(listing, tourMeta, url);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(200).send(Og.renderOgHtml(payload));
};
