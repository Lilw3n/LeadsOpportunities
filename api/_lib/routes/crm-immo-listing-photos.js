/**
 * POST /api/immo-listing-photos — reprise photos d'une annonce (CRM auth).
 * Tente un fetch HTTP classique de l'URL publique. Si Leboncoin renvoie
 * DataDome/captcha (fréquent), renvoie blocked=true — pas de contournement.
 * Accepte aussi { html } collé depuis la page déjà ouverte chez le conseiller.
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getAuthUser } = require("../auth");
const Paste = require("../../../js/immo-listing-paste-lib.js");

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
  var url = String(body.url || body.listing_url || "").trim();

  if (html) {
    var fromHtml = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(html) : [];
    return res.status(200).json({
      ok: fromHtml.length > 0,
      source: "html",
      photo_urls: fromHtml,
      count: fromHtml.length,
      hint:
        fromHtml.length > 0
          ? fromHtml.length + " photo(s) extraites du HTML collé."
          : "Aucune URL image détectée dans le HTML.",
    });
  }

  if (!url || !hostOk(url)) {
    return res.status(400).json({
      ok: false,
      error: "URL d’annonce invalide (Leboncoin / portail FR https attendu)",
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
        "Impossible de joindre l’annonce depuis nos serveurs. Ouvrez votre annonce dans le navigateur et utilisez le marque-page « Photos LBC » (vos photos, page déjà ouverte).",
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
        "Leboncoin protège la page côté serveur (captcha). Ce sont bien vos photos : ouvrez l’annonce chez vous, cliquez le marque-page « Photos LBC → presse-papiers », puis collez ici.",
    });
  }

  var photos = Paste.extractPhotoUrls ? Paste.extractPhotoUrls(fetched.html) : [];
  var parsed = Paste.parseListingPaste
    ? Paste.parseListingPaste(url + "\n\n" + String(fetched.html || "").replace(/<[^>]+>/g, " ").slice(0, 12000))
    : null;

  return res.status(200).json({
    ok: photos.length > 0,
    blocked: false,
    source: "fetch",
    http_status: fetched.status,
    final_url: fetched.finalUrl,
    photo_urls: photos,
    count: photos.length,
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
        ? photos.length + " photo(s) récupérées depuis le lien."
        : "Page lue mais aucune photo trouvée. Collez le HTML de la galerie ou utilisez le marque-page.",
  });
};
