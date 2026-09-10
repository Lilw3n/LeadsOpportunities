#!/usr/bin/env node
/**
 * Vérifie la reprise d'infos depuis un lien / texte Leboncoin (sans scraping).
 */
var Paste = require("../js/immo-listing-paste-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(Paste.parseListingPaste, "parseListingPaste exposé");
assert(Paste.extractPhotoUrls, "extractPhotoUrls exposé");

var sample =
  "https://www.leboncoin.fr/ad/ventes_immobilieres/2781234567\n\n" +
  "Appartement T3 lumineux Varangéville\n" +
  "147 000 €\n" +
  "65 m²\n" +
  "3 pièces\n" +
  "2 chambres\n" +
  "Étage : 1\n" +
  "54110 Varangéville\n" +
  "Classe énergie D\n" +
  "GES : C\n" +
  "Chauffage : Gaz individuel\n" +
  "Ascenseur\n" +
  "Cave\n" +
  "Bel appartement proche écoles, avec balcon.";

var p = Paste.parseListingPaste(sample);
assert(p.ok, "parse ok");
assert(p.listing_url.indexOf("leboncoin.fr") !== -1, "URL LBC");
assert(p.portal === "leboncoin", "portal leboncoin");
assert(Number(p.price_fai) === 147000, "prix 147000");
assert(Number(p.surface_m2) === 65, "surface 65");
assert(Number(p.rooms) === 3, "3 pièces");
assert(Number(p.bedrooms) === 2, "2 chambres");
assert(p.floor === "1", "étage 1");
assert(p.postal_code === "54110", "CP");
assert(/varang/i.test(p.city), "ville");
assert(p.dpe === "D" && p.ges === "C", "DPE/GES");
assert(/gaz/i.test(p.heating), "chauffage");
assert(p.has_elevator === true && p.has_cave === true, "équipements");
assert(p.has_balcony === true, "balcon");
assert(p.property_type === "appartement", "type appartement");

var urlOnly = Paste.parseListingPaste("https://www.leboncoin.fr/ad/ventes_immobilieres/9998887777");
assert(urlOnly.listing_url.indexOf("9998887777") !== -1, "URL seule reconnue");
assert(urlOnly.hint && /bloque|collez|photo/i.test(urlOnly.hint), "hint coller texte/photos si URL seule");

var htmlPhotos =
  '<img src="https://img.leboncoin.fr/api/v1/lebocom-ads-images/images/aa/bb/cc.jpg?rule=ad-large" />' +
  '<img srcset="https://img.leboncoin.fr/api/v1/lebocom-ads-images/images/dd/ee/ff.jpg?rule=ad-small 400w, https://img.leboncoin.fr/api/v1/lebocom-ads-images/images/dd/ee/ff.jpg?rule=ad-large 1200w" />' +
  '<meta property="og:image" content="https://img.leboncoin.fr/api/v1/cover/zz.webp" />';
var extracted = Paste.extractPhotoUrls(htmlPhotos);
assert(extracted.length >= 2, "HTML → au moins 2 photos");
assert(
  extracted.some(function (u) {
    return /cc\.jpg/.test(u);
  }),
  "src image détectée"
);
assert(
  extracted.some(function (u) {
    return /ff\.jpg/.test(u);
  }),
  "srcset image détectée"
);
assert(
  extracted.some(function (u) {
    return /cover\/zz\.webp/.test(u);
  }),
  "og:image détectée"
);

var withPhotos = Paste.parseListingPaste(
  "https://www.leboncoin.fr/ad/ventes_immobilieres/2781234567\n\nT3 Nancy\n200 000 €\n" + htmlPhotos
);
assert(withPhotos.photo_urls && withPhotos.photo_urls.length >= 2, "parseListingPaste reprend les photos");
assert(withPhotos.fields_filled.indexOf("photos") !== -1, "fields_filled inclut photos");

var fs = require("fs");
var path = require("path");
function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}
assert(read("api/[action].js").indexOf("immo-listing-photos") !== -1, "route immo-listing-photos enregistrée");
assert(fs.existsSync(path.join(__dirname, "../api/_lib/routes/crm-immo-listing-photos.js")), "fichier route photos");
var routeSrc = read("api/_lib/routes/crm-immo-listing-photos.js");
assert(routeSrc.indexOf("getAuthUser") !== -1, "API photos : auth CRM");
assert(routeSrc.indexOf("blocked") !== -1, "API photos : signal blocked si captcha");
assert(routeSrc.indexOf("extractPhotoUrls") !== -1, "API photos : extractPhotoUrls");
assert(!/solveCaptcha|2captcha|anticaptcha|puppeteer|playwright/i.test(routeSrc), "pas de solveur captcha");

var crmHtml = read("crm-immo-pubs.html");
assert(crmHtml.indexOf("lbcPhotoBookmarklet") === -1, "CRM : plus de marque-page obscur");
assert(crmHtml.indexOf("btnFetchListingPhotos") !== -1, "CRM : bouton essayer depuis le lien");
assert(crmHtml.indexOf("Copier l’adresse de l’image") !== -1 || crmHtml.indexOf("Copier l'adresse de l'image") !== -1, "CRM : consignes collage photos");

var crmJs = read("js/crm-immo-pubs.js");
assert(crmJs.indexOf("fetchListingPhotosFromApi") !== -1, "CRM JS : fetch API photos");
assert(crmJs.indexOf("/api/immo-listing-photos") !== -1, "CRM JS : endpoint photos");
assert(crmJs.indexOf("btnRetryPhotosEmpty") !== -1, "CRM JS : retry photos galerie vide");
assert(crmJs.indexOf("marque-page") === -1, "CRM JS : plus de mention marque-page");

var pagesJs = read("js/immo-ad-pages.js");
assert(pagesJs.indexOf("btnRetryListingPhotos") !== -1, "pages : bouton retry photos admin");
assert(pagesJs.indexOf("btnImportPastedPhotos") !== -1, "pages : importer photos collées");
assert(pagesJs.indexOf("btnPickListingPhotos") !== -1, "pages : bouton ajouter photos fichier");
assert(pagesJs.indexOf("adPhotoFileInput") !== -1, "pages : input fichiers photos");
assert(pagesJs.indexOf("ingestAdminFiles") !== -1, "pages : ingest fichiers admin");
assert(pagesJs.indexOf("adPhotoPasteBox") !== -1, "pages : zone collage photos");
assert(pagesJs.indexOf("bindAdminPhotoRetry") !== -1, "pages : bindAdminPhotoRetry");
assert(pagesJs.indexOf("persist: true") !== -1 || pagesJs.indexOf("persist:true") !== -1, "pages : persist photos");
assert(pagesJs.indexOf("marque-page") === -1, "pages : plus de marque-page");

var css = read("css/immo-ad-listings.css");
assert(css.indexOf("lbc-gallery__admin-retry") !== -1, "CSS : zone retry admin");
assert(css.indexOf("lbc-gallery__admin-paste") !== -1, "CSS : zone collage admin");

assert(routeSrc.indexOf("persistPhotos") !== -1 || routeSrc.indexOf("persisted") !== -1, "API : persistance photos");
assert(routeSrc.indexOf("source: \"direct\"") !== -1 || routeSrc.indexOf("source: 'direct'") !== -1 || routeSrc.indexOf('source: "direct"') !== -1, "API : photo_urls directs");
assert(routeSrc.indexOf("marque-page") === -1, "API : plus de marque-page");
assert(read("immobilier/biens.html").indexOf("immo-listing-paste-lib") !== -1, "hub biens charge paste lib");
assert(read("immobilier/biens.html").indexOf("immo-photo-compress-lib") !== -1, "hub biens charge compress");
assert(read("immobilier/biens.html").indexOf("v=20260910drop") !== -1, "hub biens cache-bust");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks reprise Leboncoin + photos OK");
