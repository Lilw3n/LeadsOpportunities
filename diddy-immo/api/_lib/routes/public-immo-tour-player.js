/**
 * GET /api/immo-tour-player?t=vt_…
 * Lecteur same-origin : le Matterport n’est jamais renvoyé en JSON ni dans visite.html.
 * Accessible uniquement en iframe depuis /immobilier/visite.html, avec cookie de grant.
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const Tour = require("../../../js/immo-tour-access-lib.js");

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadProperties() {
  var sql = getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return db.properties || [];
}

function deny(res, status, text) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(status).send(
    "<!doctype html><html lang='fr'><head><meta charset='utf-8'><meta name='robots' content='noindex'><title>Visite</title></head>" +
      "<body style='font-family:sans-serif;padding:24px;color:#7c2d12'>" +
      "<p>" +
      esc(text || "Accès refusé.") +
      "</p></body></html>"
  );
}

module.exports = async function immoTourPlayer(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-tour-player:" + ip, 40, 60 * 1000);
  if (!rl.allowed) return deny(res, 429, "Trop de requêtes.");

  var token = String((req.query && (req.query.t || req.query.token)) || "").trim();
  if (!Tour.isTourToken(token)) return deny(res, 400, "Lien invalide.");

  if (!Tour.playerRequestOk(req.headers || {})) {
    return deny(res, 403, "Cette visite s’ouvre uniquement depuis le lien du site.");
  }

  var grant = Tour.parseGrantCookie(req.headers && req.headers.cookie);
  var granted = Tour.verifyGrant(grant, token);
  if (!granted) return deny(res, 401, "Session expirée. Revenez à la page visite.");

  var properties = [];
  try {
    properties = await loadProperties();
  } catch (e) {
    properties = [];
  }
  var found = AdLib.findByTourToken(properties, token);
  if (!found) return deny(res, 404, "Lien introuvable.");

  var bag = AdLib.getAdMeta(found);
  var ad = bag.ad || {};
  var access = Tour.getTourAccessForToken ? Tour.getTourAccessForToken(ad, token) : ad.tour_access;
  var status = Tour.tourLinkStatus(access, 0, found);
  var isAdvisor = String(granted.contact || "").indexOf("admin:") === 0;
  if (!status.ok && !isAdvisor) return deny(res, 410, Tour.statusMessage(status.reason));

  var embed = Tour.resolveTourUrl ? Tour.resolveTourUrl(ad, access) : Tour.embedUrl(ad.virtual_tour);
  if (!embed) return deny(res, 404, "Visite 3D non configurée.");

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(
    "<!doctype html><html lang='fr'><head><meta charset='utf-8'>" +
      "<meta name='robots' content='noindex,nofollow'>" +
      "<meta name='referrer' content='same-origin'>" +
      "<style>html,body,.f{margin:0;height:100%;background:#0f172a}iframe{border:0;width:100%;height:100%}</style>" +
      "</head><body><div class='f'><iframe title='Visite' src='" +
      esc(embed) +
      "' allow='xr-spatial-tracking;fullscreen' allowfullscreen referrerpolicy='no-referrer'></iframe></div></body></html>"
  );
};
