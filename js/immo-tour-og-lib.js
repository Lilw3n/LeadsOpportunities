/**
 * Open Graph pour liens visite 3D (Facebook, WhatsApp, Meta Ads…).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./immo-public-listings-lib.js"),
      require("./immo-tour-access-lib.js")
    );
  } else {
    root.ImmoTourOg = factory(root.ImmoPublicListings, root.ImmoTourAccess);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (PublicLib, Tour) {
  var SITE = "https://www.leadsopportunities.fr";
  var DEFAULT_IMAGE = SITE + "/assets/piliers/pilier-immobilier.jpg";
  var AUTHOR = (Tour && Tour.AUTHOR) || { name: "Wendy BUCHET", role: "Mandataire immobilier" };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPrice(n) {
    if (n == null || n === "") return "";
    var num = Number(n);
    if (!isFinite(num)) return "";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  function ogImageLarge(url) {
    if (!url || typeof url !== "string") return null;
    var u = url.trim();
    if (/\.svg(\?|$)/i.test(u)) return null;
    if (/^data:/i.test(u)) return u.length <= 280000 ? u : null;
    if (!/^https:\/\//i.test(u)) return null;
    if (/googleusercontent\.com/i.test(u)) {
      u = u.replace(/=s\d+(-c)?(-rw)?$/i, "=s1200");
      if (!/=s\d+/i.test(u)) u += (u.indexOf("?") >= 0 ? "&" : "?") + "s=1200";
    }
    return u.slice(0, 2000);
  }

  function pickImage(listing) {
    var photos = (listing && listing.photos) || [];
    var cover = listing && listing.cover;
    var url =
      (cover && (cover.url || cover.src)) ||
      (photos[0] && (photos[0].url || photos[0].src)) ||
      "";
    return ogImageLarge(url) || DEFAULT_IMAGE;
  }

  function buildPayload(listing, tourMeta, canonicalUrl) {
    var L = listing || {};
    var M = tourMeta || {};
    var city = String(L.city || M.city || "").trim();
    var typeLabel = String(L.type_label || L.property_type || "Bien").trim();
    var price = formatPrice(L.price_fai);
    var titleBits = ["Visite 3D immersive"];
    if (typeLabel && typeLabel.toLowerCase() !== "bien") titleBits.push(typeLabel);
    if (city) titleBits.push(city);
    if (price) titleBits.push(price);
    var title = titleBits.join(" · ").slice(0, 95);
    var descBits = ["Entrez dans le bien en 3D — pièces, volumes et agencement, comme sur place."];
    if (L.surface_m2) descBits.push(L.surface_m2 + " m²");
    if (L.rooms) descBits.push(L.rooms + " pièce(s)");
    if (L.dpe) descBits.push("DPE " + String(L.dpe).toUpperCase().slice(0, 1));
    descBits.push(AUTHOR.name + " — " + (AUTHOR.role || "mandataire immobilier") + ".");
    var description = descBits.join(" ").slice(0, 300);
    var linkName = String(M.name || "").trim();
    if (linkName && linkName !== "Visite virtuelle") {
      title = (linkName + " · " + title).slice(0, 95);
    }
    return {
      title: title,
      description: description,
      image: pickImage(L),
      url: canonicalUrl || SITE + "/immobilier/visite.html",
      siteName: "Leads Opportunities",
    };
  }

  function renderOgHtml(payload) {
    var p = payload || {};
    var url = p.url || SITE + "/immobilier/visite.html";
    return (
      "<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\"/>\n" +
      "<title>" +
      esc(p.title || "Visite 3D") +
      "</title>\n" +
      '<meta name="description" content="' +
      esc(p.description || "") +
      '"/>\n' +
      '<link rel="canonical" href="' +
      esc(url) +
      '"/>\n' +
      '<meta property="og:locale" content="fr_FR"/>\n' +
      '<meta property="og:type" content="website"/>\n' +
      '<meta property="og:site_name" content="' +
      esc(p.siteName || "Leads Opportunities") +
      '"/>\n' +
      '<meta property="og:url" content="' +
      esc(url) +
      '"/>\n' +
      '<meta property="og:title" content="' +
      esc(p.title || "") +
      '"/>\n' +
      '<meta property="og:description" content="' +
      esc(p.description || "") +
      '"/>\n' +
      '<meta property="og:image" content="' +
      esc(p.image || DEFAULT_IMAGE) +
      '"/>\n' +
      '<meta property="og:image:secure_url" content="' +
      esc(p.image || DEFAULT_IMAGE) +
      '"/>\n' +
      '<meta property="og:image:width" content="1200"/>\n' +
      '<meta property="og:image:height" content="630"/>\n' +
      '<meta name="twitter:card" content="summary_large_image"/>\n' +
      '<meta name="twitter:title" content="' +
      esc(p.title || "") +
      '"/>\n' +
      '<meta name="twitter:description" content="' +
      esc(p.description || "") +
      '"/>\n' +
      '<meta name="twitter:image" content="' +
      esc(p.image || DEFAULT_IMAGE) +
      '"/>\n' +
      '<meta name="robots" content="noindex,nofollow"/>\n' +
      "</head>\n<body>\n<p><a href=\"" +
      esc(url) +
      '">Ouvrir la visite 3D</a></p>\n</body>\n</html>'
    );
  }

  function isSocialCrawler(userAgent) {
    return /facebookexternalhit|facebot|meta-externalagent|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot/i.test(
      String(userAgent || "")
    );
  }

  return {
    SITE: SITE,
    DEFAULT_IMAGE: DEFAULT_IMAGE,
    buildPayload: buildPayload,
    renderOgHtml: renderOgHtml,
    pickImage: pickImage,
    ogImageLarge: ogImageLarge,
    isSocialCrawler: isSocialCrawler,
  };
});
