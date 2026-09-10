/**
 * POST /api/immo-listing-photos — reprise photos d'une annonce (CRM auth).
 * Tente un fetch HTTP classique de l'URL publique. Si Leboncoin renvoie
 * DataDome/captcha (fréquent), renvoie blocked=true — pas de contournement.
 * Accepte aussi { html } collé depuis la page déjà ouverte chez le conseiller.
 * Avec property_id + persist:true, enregistre les photos sur le bien CRM.
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getAuthUser } = require("../auth");
const { getSql } = require("../db");
const Paste = require("../../../js/immo-listing-paste-lib.js");
const AdLib = require("../../../js/immo-ad-listings-lib.js");

var ALLOWED_HOST =
  /^(www\.)?(leboncoin\.fr|seloger\.com|bienici\.com|pap\.fr|paruvendu\.fr|orpi\.com|logic-immo\.com)$/i;

function hostOk(url) {
  try {
    var h = new URL(String(url || "")).hostname;
    return ALLOWED_HOST.test(h);
  } catch (e) {
    return false;
  }
}

function looksBlocked(status, html) {
  if (status === 403 || status === 401 || status === 429) return true;
  var t = String(html || "").slice(0, 8000);
  return /datadome|captcha|geo\.captcha|Please enable JS|cf-challenge|attention required/i.test(t);
}

async function fetchListingHtml(url) {
  var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = setTimeout(function () {
    if (ctrl) ctrl.abort();
  }, 12000);
  try {
    var res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl ? ctrl.signal : undefined,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
      },
    });
    var text = await res.text();
    return { status: res.status, html: text, finalUrl: String(res.url || url) };
  } finally {
    clearTimeout(timer);
  }
}

function toPhotoObjs(urls) {
  return (urls || [])
    .map(function (u) {
      return { url: String(u), kind: "photo" };
    })
    .filter(function (p) {
      return p.url.indexOf("https://") === 0 || p.url.indexOf("http://") === 0;
    })
    .slice(0, 24);
}

async function persistPhotos(propertyId, photoUrls, listingUrl) {
  var sql = getSql();
  if (!sql || !propertyId || !photoUrls || !photoUrls.length) {
    return { saved: false, reason: "missing_sql_or_photos" };
  }
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  var list = db.properties || [];
  var found = null;
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(propertyId)) {
      found = list[i];
      break;
    }
  }
  if (!found) return { saved: false, reason: "property_not_found" };

  var objs = toPhotoObjs(photoUrls);
  if (AdLib && AdLib.sanitizePhotos) objs = AdLib.sanitizePhotos(objs);
  if (!objs.length) return { saved: false, reason: "no_valid_photos" };

  var bag = AdLib.getAdMeta(found);
  var meta = Object.assign({}, bag.meta || {});
  var ad = Object.assign({}, bag.ad || {});
  var prev = Array.isArray(ad.photos) ? ad.photos.slice() : [];
  var seen = {};
  var merged = [];
  function push(p) {
    var u = p && (p.url || p);
    if (!u || seen[u]) return;
    seen[u] = true;
    merged.push(typeof p === "string" ? { url: p, kind: "photo" } : p);
  }
  objs.forEach(push);
  prev.forEach(push);
  merged = merged.slice(0, 24);
  ad.photos = merged;
  if (listingUrl) ad.listing_url = String(listingUrl).slice(0, 500);
  ad.updated_at = new Date().toISOString();
  meta.ad = ad;

  var next = Object.assign({}, found, {
    photos: merged,
    photos_json: merged,
    metadata: meta,
    metadata_json: meta,
    listing_url: listingUrl || found.listing_url || ad.listing_url || "",
  });
  await store.upsertProperty(sql, next, null);
  return { saved: true, count: merged.length };
}

async function resolveListingUrl(body) {
  var url = String(body.url || body.listing_url || "").trim();
  if (url) return url;
  var propertyId = String(body.property_id || body.id || "").trim();
  if (!propertyId) return "";
  var sql = getSql();
  if (!sql) return "";
  try {
    var store = require("../immo-properties-store");
    var db = await store.loadAll(sql);
    var list = db.properties || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) !== propertyId) continue;
      var bag = AdLib.getAdMeta(list[i]);
      return String((bag.ad && bag.ad.listing_url) || list[i].listing_url || "").trim();
    }
  } catch (e) {
    /* ignore */
  }
  return "";
}

module.exports = async function crmImmoListingPhotos(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var user = await getAuthUser(req);
  if (!user) return res.status(401).json({ ok: false, error: "Authentification CRM requise" });

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listing-photos:" + (user.userId || ip), 20, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ ok: false, error: "Trop de requêtes, réessayez plus tard" });
  }

  var body = req.body && typeof req.body === "object" ? req.body : {};
  var html = String(body.html || body.page_html || "").trim();
  var propertyId = String(body.property_id || body.id || "").trim();
  var persist = body.persist === true || body.persist === 1 || body.persist === "1";
  var url = await resolveListingUrl(body);

  async function maybePersist(photoUrls) {
    if (!persist || !propertyId || !photoUrls.length) return null;
    try {
      return await persistPhotos(propertyId, photoUrls, url);
    } catch (e) {
      return { saved: false, reason: String((e && e.message) || e).slice(0, 200) };
    }
  }

  if (html) {
    var fromHtml = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(html) : [];
    var savedHtml = await maybePersist(fromHtml);
    return res.status(200).json({
      ok: fromHtml.length > 0,
      source: "html",
      photo_urls: fromHtml,
      count: fromHtml.length,
      persisted: !!(savedHtml && savedHtml.saved),
      persist_detail: savedHtml || null,
      hint:
        fromHtml.length > 0
          ? fromHtml.length +
            " photo(s) extraites du HTML collé." +
            (savedHtml && savedHtml.saved ? " Enregistrées sur le bien." : "")
          : "Aucune URL image détectée dans le HTML.",
    });
  }

  if (!url || !hostOk(url)) {
    return res.status(400).json({
      ok: false,
      error:
        "URL d’annonce introuvable. Renseignez le lien Leboncoin sur la pub, ou passez listing_url.",
    });
  }

  var fetched;
  try {
    fetched = await fetchListingHtml(url);
  } catch (err) {
    return res.status(200).json({
      ok: false,
      blocked: true,
      source: "fetch",
      photo_urls: [],
      count: 0,
      hint:
        "Impossible de joindre l’annonce depuis nos serveurs. Réessayez plus tard, ou utilisez le marque-page « Photos LBC » sur votre page ouverte.",
      detail: String((err && err.message) || err).slice(0, 200),
    });
  }

  if (looksBlocked(fetched.status, fetched.html)) {
    return res.status(200).json({
      ok: false,
      blocked: true,
      source: "fetch",
      http_status: fetched.status,
      photo_urls: [],
      count: 0,
      hint:
        "Leboncoin protège encore la page (captcha). Réessayez dans un instant, ou ouvrez l’annonce et utilisez le marque-page Photos LBC.",
    });
  }

  var photos = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(fetched.html) : [];
  var parsed = Paste.parseListingPaste
    ? Paste.parseListingPaste(url + "\n\n" + String(fetched.html || "").replace(/<[^>]+>/g, " ").slice(0, 12000))
    : null;
  var saved = await maybePersist(photos);

  return res.status(200).json({
    ok: photos.length > 0,
    blocked: false,
    source: "fetch",
    http_status: fetched.status,
    final_url: fetched.finalUrl,
    photo_urls: photos,
    count: photos.length,
    persisted: !!(saved && saved.saved),
    persist_detail: saved || null,
    listing: parsed
      ? {
          title: parsed.title || "",
          price_fai: parsed.price_fai,
          city: parsed.city || "",
          postal_code: parsed.postal_code || "",
          surface_m2: parsed.surface_m2,
          rooms: parsed.rooms,
        }
      : null,
    hint:
      photos.length > 0
        ? photos.length +
          " photo(s) récupérées depuis le lien." +
          (saved && saved.saved ? " Enregistrées sur le bien." : "")
        : "Page lue mais aucune photo trouvée. Réessayez ou utilisez le marque-page.",
  });
};
