/**
 * POST /api/immo-listing-photos — reprise photos d'une annonce (CRM auth).
 * Tente un fetch HTTP classique de l'URL publique. Si Leboncoin renvoie
 * DataDome/captcha (fréquent), renvoie blocked=true — pas de contournement.
 * Accepte aussi { html } collé depuis la page déjà ouverte chez le conseiller.
 * Avec property_id + persist:true, enregistre les photos sur le bien CRM
 * (+ Google Drive dossier personne / bien pour les data:image).
 * remove_urls : retire des photos déjà enregistrées.
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getAuthUser } = require("../auth");
const { getSql } = require("../db");
const Paste = require("../../../js/immo-listing-paste-lib.js");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const PublicLib = require("../../../js/immo-public-listings-lib.js");

var ALLOWED_HOST =
  /^(www\.)?(leboncoin\.fr|seloger\.com|bienici\.com|pap\.fr|paruvendu\.fr|orpi\.com|logic-immo\.com)$/i;

var MAX_PHOTOS = 24;

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

function isAllowedPhotoUrl(url) {
  if (PublicLib && PublicLib.isSafeMediaUrl) return PublicLib.isSafeMediaUrl(url);
  if (!url || typeof url !== "string") return false;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(url) && url.length <= 280000) return true;
  if (/^https?:\/\//i.test(url) && url.length <= 2000) return true;
  return false;
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
      if (u && typeof u === "object" && u.url) {
        return {
          url: String(u.url),
          kind: u.kind === "capture" ? "capture" : "photo",
          driveFileId: u.driveFileId || null,
          webViewLink: u.webViewLink || null,
          storage: u.storage || null,
        };
      }
      return { url: String(u || ""), kind: "photo" };
    })
    .filter(function (p) {
      return isAllowedPhotoUrl(p.url);
    })
    .slice(0, MAX_PHOTOS);
}

function photoKey(p) {
  if (!p) return "";
  if (p.driveFileId) return "drive:" + p.driveFileId;
  return String(p.url || p || "").slice(0, 500);
}

function enrichPropertyForDrive(found, db) {
  var out = Object.assign({}, found);
  var parties = (db && db.parties) || [];
  for (var i = 0; i < parties.length; i++) {
    var party = parties[i];
    if (String(party.property_id) !== String(found.id)) continue;
    if (party.role !== "vendeur" && party.role !== "owner") continue;
    var name = String(party.name || "").trim();
    if (name) {
      var bits = name.split(/\s+/);
      if (bits.length >= 2) {
        out.firstName = out.firstName || bits[0];
        out.lastName = out.lastName || bits.slice(1).join(" ");
      }
      out.sellerName = out.sellerName || name;
    }
    break;
  }
  var meta = found.metadata || found.metadata_json || {};
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch (e) {
      meta = {};
    }
  }
  var sell = (meta && meta.sellDossier) || {};
  out.firstName = out.firstName || sell.ownerFirstName || sell.firstName || "";
  out.lastName = out.lastName || sell.ownerLastName || sell.lastName || "";
  out.sellerName = out.sellerName || sell.sellerName || out.title || "";
  return out;
}

async function loadProperty(sql, propertyId) {
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
  return { store: store, db: db, found: found };
}

async function persistPhotos(propertyId, photoUrls, listingUrl) {
  var sql = getSql();
  if (!sql || !propertyId || !photoUrls || !photoUrls.length) {
    return { saved: false, reason: "missing_sql_or_photos", photos: [] };
  }
  var loaded = await loadProperty(sql, propertyId);
  var found = loaded.found;
  if (!found) return { saved: false, reason: "property_not_found", photos: [] };

  var objs = toPhotoObjs(photoUrls);
  if (AdLib && AdLib.sanitizePhotos) objs = AdLib.sanitizePhotos(objs);
  if (!objs.length) return { saved: false, reason: "no_valid_photos", photos: [] };

  var bag = AdLib.getAdMeta(found);
  var meta = Object.assign({}, bag.meta || {});
  var ad = Object.assign({}, bag.ad || {});
  var prev = Array.isArray(ad.photos) ? ad.photos.slice() : [];
  if (!prev.length && Array.isArray(found.photos)) prev = found.photos.slice();
  var seen = {};
  var merged = [];
  function push(p) {
    var key = photoKey(p);
    if (!key || seen[key]) return;
    if (!isAllowedPhotoUrl(typeof p === "string" ? p : p.url)) return;
    seen[key] = true;
    merged.push(typeof p === "string" ? { url: p, kind: "photo" } : p);
  }
  // Nouvelles d'abord (ordre d'ajout utilisateur), puis anciennes
  objs.forEach(push);
  prev.forEach(push);
  merged = merged.slice(0, MAX_PHOTOS);

  var driveDetail = null;
  var drivePhotos = merged.filter(function (p) {
    return p && /^data:image\//i.test(p.url);
  });
  if (drivePhotos.length) {
    try {
      var { syncPropertyPhotosToDrive } = require("../immo-listing-drive");
      var propForDrive = enrichPropertyForDrive(found, loaded.db);
      driveDetail = await syncPropertyPhotosToDrive(propForDrive, drivePhotos);
      if (driveDetail && Array.isArray(driveDetail.photos) && driveDetail.photos.length) {
        var byData = {};
        drivePhotos.forEach(function (orig, idx) {
          byData[photoKey(orig)] = driveDetail.photos[idx] || orig;
        });
        merged = merged.map(function (p) {
          var k = photoKey(p);
          return byData[k] || p;
        });
      }
      if (driveDetail && driveDetail.driveFolderId) {
        found.drive_folder_id = driveDetail.driveFolderId;
        meta.drive = Object.assign({}, meta.drive || {}, {
          folderId: driveDetail.driveFolderId,
          webViewLink: driveDetail.webViewLink || (meta.drive && meta.drive.webViewLink) || null,
          uploaded: (meta.drive && meta.drive.uploaded ? meta.drive.uploaded : 0) + (driveDetail.uploaded || 0),
          simulated: !!driveDetail.simulated,
        });
      }
    } catch (driveErr) {
      console.warn("[immo-listing-photos] drive", driveErr && driveErr.message);
      driveDetail = { saved: false, error: String((driveErr && driveErr.message) || driveErr).slice(0, 200) };
    }
  }

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
    drive_folder_id: found.drive_folder_id || null,
  });
  await loaded.store.upsertProperty(sql, next, null);
  return {
    saved: true,
    count: merged.length,
    photos: merged,
    drive: driveDetail,
    drive_folder_id: found.drive_folder_id || null,
  };
}

async function removePhotos(propertyId, removeUrls) {
  var sql = getSql();
  if (!sql || !propertyId) return { saved: false, reason: "missing", photos: [] };
  var loaded = await loadProperty(sql, propertyId);
  var found = loaded.found;
  if (!found) return { saved: false, reason: "property_not_found", photos: [] };

  var bag = AdLib.getAdMeta(found);
  var meta = Object.assign({}, bag.meta || {});
  var ad = Object.assign({}, bag.ad || {});
  var prev = Array.isArray(ad.photos) ? ad.photos.slice() : [];
  if (!prev.length && Array.isArray(found.photos)) prev = found.photos.slice();

  var drop = {};
  (removeUrls || []).forEach(function (u) {
    drop[String(u).slice(0, 500)] = true;
  });
  var kept = prev.filter(function (p) {
    var url = typeof p === "string" ? p : p && p.url;
    return url && !drop[String(url).slice(0, 500)];
  });

  ad.photos = kept;
  ad.updated_at = new Date().toISOString();
  meta.ad = ad;
  var next = Object.assign({}, found, {
    photos: kept,
    photos_json: kept,
    metadata: meta,
    metadata_json: meta,
  });
  await loaded.store.upsertProperty(sql, next, null);
  return { saved: true, count: kept.length, photos: kept };
}

async function resolveListingUrl(body) {
  var url = String(body.url || body.listing_url || "").trim();
  if (url) return url;
  var propertyId = String(body.property_id || body.id || "").trim();
  if (!propertyId) return "";
  var sql = getSql();
  if (!sql) return "";
  try {
    var loaded = await loadProperty(sql, propertyId);
    if (!loaded.found) return "";
    var bag = AdLib.getAdMeta(loaded.found);
    return String((bag.ad && bag.ad.listing_url) || loaded.found.listing_url || "").trim();
  } catch (e) {
    return "";
  }
}

function photoUrlsFromResult(detail, fallback) {
  if (detail && Array.isArray(detail.photos) && detail.photos.length) {
    return detail.photos.map(function (p) {
      return typeof p === "string" ? p : p.url;
    }).filter(Boolean);
  }
  return fallback || [];
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
  var rl = rateLimit("immo-listing-photos:" + (user.userId || ip), 30, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ ok: false, error: "Trop de requêtes, réessayez plus tard" });
  }

  var body = req.body && typeof req.body === "object" ? req.body : {};
  var html = String(body.html || body.page_html || "").trim();
  var propertyId = String(body.property_id || body.id || "").trim();
  var persist = body.persist === true || body.persist === 1 || body.persist === "1";
  var url = await resolveListingUrl(body);
  var directPhotos = Array.isArray(body.photo_urls)
    ? body.photo_urls.map(String).filter(Boolean).slice(0, MAX_PHOTOS)
    : [];
  var removeUrls = Array.isArray(body.remove_urls)
    ? body.remove_urls.map(String).filter(Boolean).slice(0, MAX_PHOTOS)
    : [];

  if (removeUrls.length && propertyId) {
    try {
      var removed = await removePhotos(propertyId, removeUrls);
      return res.status(200).json({
        ok: !!(removed && removed.saved),
        source: "remove",
        photo_urls: photoUrlsFromResult(removed, []),
        photos: (removed && removed.photos) || [],
        count: (removed && removed.count) || 0,
        persisted: !!(removed && removed.saved),
        persist_detail: removed || null,
        hint:
          removed && removed.saved
            ? "Photo(s) retirée(s). Il reste " + removed.count + " photo(s)."
            : (removed && removed.reason) || "Suppression impossible.",
      });
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: String((e && e.message) || e).slice(0, 200),
      });
    }
  }

  async function maybePersist(photoUrls) {
    if (!persist || !propertyId || !photoUrls.length) return null;
    try {
      return await persistPhotos(propertyId, photoUrls, url);
    } catch (e) {
      return { saved: false, reason: String((e && e.message) || e).slice(0, 200), photos: [] };
    }
  }

  if (directPhotos.length && !html) {
    var savedDirect = await maybePersist(directPhotos);
    var urlsOut = photoUrlsFromResult(savedDirect, directPhotos);
    return res.status(200).json({
      ok: true,
      source: "direct",
      photo_urls: urlsOut,
      photos: (savedDirect && savedDirect.photos) || toPhotoObjs(urlsOut),
      count: urlsOut.length,
      persisted: !!(savedDirect && savedDirect.saved),
      persist_detail: savedDirect || null,
      drive_folder_id: (savedDirect && savedDirect.drive_folder_id) || null,
      hint:
        (savedDirect && savedDirect.saved
          ? urlsOut.length +
            " photo(s) enregistrée(s) sur le bien" +
            (savedDirect.drive && savedDirect.drive.uploaded
              ? " (+" + savedDirect.drive.uploaded + " sur Drive)."
              : ".")
          : directPhotos.length +
            " photo(s) reçue(s)." +
            (savedDirect && savedDirect.reason ? " Persist: " + savedDirect.reason : "")),
    });
  }

  if (html) {
    var fromHtml = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(html) : [];
    if (!fromHtml.length && directPhotos.length) fromHtml = directPhotos;
    var savedHtml = await maybePersist(fromHtml);
    var urlsHtml = photoUrlsFromResult(savedHtml, fromHtml);
    return res.status(200).json({
      ok: urlsHtml.length > 0,
      source: "html",
      photo_urls: urlsHtml,
      photos: (savedHtml && savedHtml.photos) || toPhotoObjs(urlsHtml),
      count: urlsHtml.length,
      persisted: !!(savedHtml && savedHtml.saved),
      persist_detail: savedHtml || null,
      drive_folder_id: (savedHtml && savedHtml.drive_folder_id) || null,
      hint:
        urlsHtml.length > 0
          ? urlsHtml.length +
            " photo(s) extraites." +
            (savedHtml && savedHtml.saved ? " Enregistrées sur le bien." : "")
          : "Aucune URL image détectée dans le HTML.",
    });
  }

  if (!url || !hostOk(url)) {
    return res.status(400).json({
      ok: false,
      error:
        "URL d’annonce introuvable. Renseignez le lien Leboncoin sur la pub, ou passez listing_url / photo_urls.",
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
        "Impossible de joindre l’annonce depuis nos serveurs. Utilisez « Ajouter des photos » (fichiers / glisser-déposer).",
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
        "Leboncoin bloque encore la lecture automatique. Ajoutez plusieurs photos via fichiers ou glisser-déposer.",
    });
  }

  var photos = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(fetched.html) : [];
  var parsed = Paste.parseListingPaste
    ? Paste.parseListingPaste(url + "\n\n" + String(fetched.html || "").replace(/<[^>]+>/g, " ").slice(0, 12000))
    : null;
  var saved = await maybePersist(photos);
  var urlsFetch = photoUrlsFromResult(saved, photos);

  return res.status(200).json({
    ok: urlsFetch.length > 0,
    blocked: false,
    source: "fetch",
    http_status: fetched.status,
    final_url: fetched.finalUrl,
    photo_urls: urlsFetch,
    photos: (saved && saved.photos) || toPhotoObjs(urlsFetch),
    count: urlsFetch.length,
    persisted: !!(saved && saved.saved),
    persist_detail: saved || null,
    drive_folder_id: (saved && saved.drive_folder_id) || null,
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
      urlsFetch.length > 0
        ? urlsFetch.length +
          " photo(s) récupérées." +
          (saved && saved.saved ? " Enregistrées sur le bien." : "")
        : "Page lue mais aucune photo trouvée. Ajoutez les fichiers manuellement.",
  });
};
