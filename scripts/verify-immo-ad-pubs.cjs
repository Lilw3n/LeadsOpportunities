#!/usr/bin/env node
/**
 * Vérifie pubs mandats (public) + démo privée vendeur (anti-copie).
 */
var fs = require("fs");
var path = require("path");
var AdLib = require("../js/immo-ad-listings-lib.js");
var Protect = require("../js/immo-ad-protect.js");

var ROOT = path.join(__dirname, "..");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

assert(AdLib.applyAdToProperty && AdLib.filterPublicAds, "lib ad listings exposée");
assert(Protect.attach, "lib anti-copie exposée");

var sample = AdLib.applyAdToProperty(
  {
    id: "prop_test_ad",
    title: "T3 Nancy",
    city: "Nancy",
    postal_code: "54000",
    property_type: "appartement",
    status: "mandat",
    rooms: 3,
    surface_m2: 68,
    price_fai: 265000,
    description: "Bel appartement",
  },
  {
    headline: "T3 lumineux Nancy",
    body: "Proche tram, cave.",
    photos: [{ url: "https://cdn.example.com/photo1.jpg", kind: "photo" }],
    videos: ["https://www.youtube.com/watch?v=abc123"],
    virtual_tour: "https://my.matterport.com/show/?m=xyz",
    channel_public: true,
    channel_private: true,
    platforms: ["Meta", "Google"],
  }
);

assert(AdLib.isPublicMandateAd(sample), "canal public + statut mandat");
assert(AdLib.isPrivateDemoAd(sample), "canal privé");
assert(sample.metadata && sample.metadata.ad && sample.metadata.ad.share_token, "share_token généré");
assert(sample.seo_published === true, "seo_published si public");

var listing = AdLib.toAdListing(sample);
assert(listing.videos && listing.videos.length === 1, "vidéos dans listing");
assert(listing.virtual_tour.indexOf("matterport") !== -1, "visite virtuelle");
assert(listing.share_token == null, "token non exposé dans listing public");

var priv = AdLib.toAdListing(sample, { includeToken: true });
assert(priv.share_token && priv.share_token.indexOf("ad_") === 0, "token en mode privé");

var found = AdLib.findByShareToken([sample], sample.metadata.ad.share_token);
assert(found && found.id === "prop_test_ad", "findByShareToken");

assert(!AdLib.isPublicMandateAd({ status: "estimation", metadata: { ad: { channels: ["public"] } } }), "estimation seule ≠ pub mandat");
assert(
  AdLib.applyAdToProperty({ status: "estimation" }, { channel_public: true, title: "X", city: "Nancy" }).status === "mandat",
  "activer canal public passe en mandat"
);

var files = [
  "crm-immo-pubs.html",
  "js/crm-immo-pubs.js",
  "js/immo-ad-listings-lib.js",
  "js/immo-ad-demo-access-lib.js",
  "js/immo-ad-protect.js",
  "js/immo-ad-pages.js",
  "css/immo-ad-listings.css",
  "immobilier/pubs-mandats.html",
  "immobilier/demo-pub-vendeur.html",
  "api/_lib/routes/public-immo-ads.js",
  "api/_lib/routes/public-immo-ad-demo-access.js",
];
files.forEach(function (f) {
  assert(fs.existsSync(path.join(ROOT, f)), "fichier " + f);
});

var crm = read("crm-immo-pubs.html");
assert(crm.indexOf("adVideos") !== -1 && crm.indexOf("adTour") !== -1, "CRM : vidéos + visite virtuelle");
assert(crm.indexOf("adEnergyCost") !== -1, "CRM : coût énergie estimé");
assert(crm.indexOf("questionnaire fiche interlocuteur") !== -1, "CRM : hint sources critères");
assert(crm.indexOf("chPublic") !== -1 && crm.indexOf("chPrivate") !== -1, "CRM : canaux public/privé");
assert(crm.indexOf("adPhotoFiles") !== -1, "CRM : upload fichiers photos");
assert(crm.indexOf("immo-photo-compress") !== -1, "CRM : compression photos");
assert(crm.indexOf("btnAddVideo") !== -1, "CRM : ajout vidéo");
assert(crm.indexOf("Matterport") !== -1, "CRM : visite virtuelle Matterport");
assert(crm.indexOf("adAccessEmails") !== -1 && crm.indexOf("adAccessPhones") !== -1, "CRM : e-mails / tél. autorisés");
assert(crm.indexOf("createLinkUrl") !== -1 || crm.indexOf("Créer une pub") !== -1, "CRM : lien de création");
assert(crm.indexOf("createdBanner") !== -1, "CRM : bandeau pub créée");

var crmJs = read("js/crm-immo-pubs.js");
assert(crmJs.indexOf("compressMany") !== -1 || crmJs.indexOf("ImmoPhotoCompress") !== -1, "JS : compression photos");
assert(crmJs.indexOf("photoState") !== -1 && crmJs.indexOf("videoState") !== -1, "JS : état médias");
assert(crmJs.indexOf("MAX_PHOTOS") !== -1, "JS : plafond photos");
assert(crmJs.indexOf("showCreatedBanner") !== -1 && crmJs.indexOf("highlightId") !== -1, "JS : mise en évidence après création");
assert(crmJs.indexOf("advisor_phone_code") !== -1, "JS : code téléphone CRM");
assert(crmJs.indexOf("openAdminPreview") !== -1 && crmJs.indexOf("Voir en admin") !== -1, "JS : lien admin sans e-mail/tél");
assert(crmJs.indexOf("advisor_preview_grant") !== -1, "JS : grant prévisualisation admin");

var Access = require("../js/immo-ad-demo-access-lib.js");
assert(Access.normalizeEmail(" Wendy@Exemple.FR ") === "wendy@exemple.fr", "normalize email");
assert(Access.normalizePhone("06 12 34 56 78") === "0612345678", "normalize phone");
var otp = Access.otpCode("ad_tok_test", "wendy@exemple.fr");
assert(/^\d{6}$/.test(otp), "OTP 6 chiffres");
assert(Access.verifyOtp("ad_tok_test", "wendy@exemple.fr", otp), "verify OTP");
var grant = Access.makeGrant("ad_tok_test", "wendy@exemple.fr");
assert(Access.verifyGrant(grant, "ad_tok_test"), "grant valide");

var apiAccess = read("api/_lib/routes/public-immo-ad-demo-access.js");
assert(apiAccess.indexOf("request_code") !== -1 && apiAccess.indexOf("verify_code") !== -1, "API accès démo");
assert(apiAccess.indexOf("advisor_preview_grant") !== -1, "API grant admin preview");
assert(read("api/[action].js").indexOf("immo-ad-demo-access") !== -1, "route immo-ad-demo-access");

var demoPage = read("immobilier/demo-pub-vendeur.html");
assert(demoPage.indexOf("adGate") !== -1, "page démo : portail d'accès");

var pagesJs = read("js/immo-ad-pages.js");
assert(pagesJs.indexOf("renderGate") !== -1 && pagesJs.indexOf("requires_auth") !== -1, "pages : gate auth");
assert(pagesJs.indexOf("adminMode") !== -1 || pagesJs.indexOf("admin=1") !== -1, "pages : mode admin preview");
assert(pagesJs.indexOf("L'info n'a pas été renseignée") !== -1, "pages : libellé champ vide");
assert(pagesJs.indexOf("lbc-listing") !== -1 && pagesJs.indexOf("lbc-gallery") !== -1, "pages : layout Leboncoin");
assert(pagesJs.indexOf("lbc-criteria") !== -1, "pages : grille critères");
assert(pagesJs.indexOf("openLightbox") !== -1 || pagesJs.indexOf("lbcLightbox") !== -1, "pages : lightbox zoom");
assert(pagesJs.indexOf("setScale") !== -1, "pages : zoom scale");
assert(pagesJs.indexOf("nextZoomStep") !== -1, "pages : clic photo = zoom progressif");
assert(pagesJs.indexOf("lbc-criteria-hint") !== -1, "pages : hint sources champs vides");
assert(pagesJs.indexOf("crm-immo-pubs.html") !== -1, "pages : lien crm pubs dans hint");

var listingLibSrc = read("js/immo-ad-listings-lib.js");
assert(listingLibSrc.indexOf("sellDossierToCriteria") !== -1, "lib : mapping sellDossier → critères");

var fromSellListing = AdLib.toAdListing({
  id: "p_sell",
  status: "prospection",
  city: "Varangéville",
  postal_code: "54110",
  property_type: "appartement",
  surface_m2: 65,
  metadata: {
    sellDossier: {
      sellRooms: 3,
      sellBedrooms: 2,
      sellFloor: "1",
      sellDpe: "D",
      sellGes: "C",
      sellHeating: "Gaz",
      sellEnergyCostAnnual: 980,
      sellChargesAnnual: 1200,
      sellBuildYear: 1985,
      sellFurnished: "1",
      sellEquip: ["ascenseur"],
      sellCaveCount: 1,
    },
    ad: { channels: ["private"], share_token: "ad_test_sell_01" },
  },
});
assert(fromSellListing.rooms === 3 && fromSellListing.bedrooms === 2, "sellDossier → pièces/chambres");
assert(fromSellListing.floor === "1" && fromSellListing.dpe === "D", "sellDossier → étage/DPE");
assert(fromSellListing.heating === "Gaz" && Number(fromSellListing.energy_cost) === 980, "sellDossier → chauffage/énergie");
assert(fromSellListing.has_elevator === true && fromSellListing.has_cave === true, "sellDossier → équipements");

var intLib = read("js/interlocuteur-dossier-lib.js");
assert(intLib.indexOf("AD_DEMO_EDIT_KEYS") !== -1, "interlocuteur : clés critères démo");
assert(intLib.indexOf("sellFloor") !== -1 && intLib.indexOf("sellHeating") !== -1, "interlocuteur : étage/chauffage éditables");
assert(intLib.indexOf("sellDossier") !== -1 && intLib.indexOf("sellDossier[k]") !== -1, "interlocuteur : flatten sellDossier");

var patchSrc = read("api/_lib/lead-questionnaire-patch.js");
assert(patchSrc.indexOf("mirrorSellIntoDossier") !== -1, "patch : miroir sell → sellDossier");
assert(patchSrc.indexOf("syncSellToLinkedProperties") !== -1, "patch : sync biens liés");
assert(patchSrc.indexOf("sellDossierToCriteria") !== -1, "patch : critères depuis sell");

var css = read("css/immo-ad-listings.css");
assert(css.indexOf("lbc-gallery__stage") !== -1 && css.indexOf("72vh") !== -1, "CSS : grande galerie photo");
assert(css.indexOf("lbc-lightbox") !== -1, "CSS : lightbox plein écran");
assert(css.indexOf("scale") !== -1 || css.indexOf("zoom-in") !== -1, "CSS : curseur zoom");
assert(css.indexOf("lbc-criteria-hint") !== -1, "CSS : hint critères vides");

var adsRoute = read("api/_lib/routes/public-immo-ads.js");
assert(adsRoute.indexOf("getAuthUser") !== -1 || adsRoute.indexOf("tryAuthUser") !== -1, "API ads : bypass admin CRM");
assert(adsRoute.indexOf("admin_preview") !== -1, "API ads : flag admin_preview");

var listingRich = AdLib.toAdListing(
  AdLib.applyAdToProperty(
    { id: "p2", status: "mandat", city: "Nancy" },
    {
      title: "T3",
      channel_private: true,
      channel_public: false,
      rooms: 3,
      surface_m2: 65,
      dpe: "D",
      has_elevator: true,
      floor: "2",
      energy_cost: 1100,
    }
  )
);
assert(listingRich.dpe === "D" && listingRich.floor === "2" && listingRich.has_elevator === true, "critères DPE/étage/ascenseur");
assert(Number(listingRich.energy_cost) === 1100, "critères coût énergie via pubs");
assert(listingRich.has_garden === null || listingRich.has_garden === false, "jardin non forcé à tort");

var withAccess = AdLib.applyAdToProperty(
  { id: "p1", status: "estimation", city: "Nancy" },
  {
    title: "Demo",
    channel_private: true,
    access_emails: "vendeur@test.fr",
    access_phones: "0611223344",
  }
);
assert(withAccess.metadata.ad.access.emails[0] === "vendeur@test.fr", "access emails stockés");
assert(withAccess.metadata.ad.access.phones[0] === "0611223344", "access phones stockés");

var pubPage = read("immobilier/pubs-mandats.html");
assert(pubPage.indexOf("index,follow") !== -1, "vitrine publique indexable");
assert(pubPage.indexOf("immo-ad-protect") !== -1, "vitrine : protect chargé");

var privPage = read("immobilier/demo-pub-vendeur.html");
assert(privPage.indexOf("noindex") !== -1, "démo privée noindex");
assert(privPage.indexOf("bootPrivate") !== -1, "démo : bootPrivate");
assert(privPage.indexOf("clic droit") !== -1 || privPage.indexOf("copie") !== -1, "bandeau anti-copie");

var protectSrc = read("js/immo-ad-protect.js");
assert(protectSrc.indexOf("contextmenu") !== -1, "bloque clic droit");
assert(protectSrc.indexOf("\"copy\"") !== -1 || protectSrc.indexOf("'copy'") !== -1, "bloque copie");

var apiIndex = read("api/[action].js");
assert(apiIndex.indexOf("immo-ads") !== -1, "route API immo-ads enregistrée");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-immo-pubs.html") !== -1, "lien sidebar CRM");

var hub = read("immobilier/index.html");
assert(hub.indexOf("pubs-mandats.html") !== -1, "lien hub immobilier");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf("annonce_pub") !== -1, "section fiche bien Annonce & pubs");

var handler = require("../api/_lib/routes/public-immo-ads.js");
var captured = { status: 0, body: null, headers: {} };
var res = {
  setHeader: function (k, v) {
    captured.headers[k] = v;
  },
  status: function (c) {
    captured.status = c;
    return this;
  },
  json: function (b) {
    captured.body = b;
    return this;
  },
  end: function () {
    return this;
  },
};

return Promise.resolve(handler({ method: "GET", query: {}, headers: {} }, res)).then(function () {
  assert(captured.status === 200 && captured.body && captured.body.ok, "GET /api/immo-ads 200");
  assert(captured.body.channel === "public", "canal public par défaut");
  assert(Array.isArray(captured.body.listings), "listings[]");

  captured = { status: 0, body: null, headers: {} };
  return handler({ method: "GET", query: { token: "ad_inexistant_xyz" }, headers: {} }, res);
}).then(function () {
  assert(captured.status === 404, "token inconnu → 404");

  var pkg = JSON.parse(read("package.json"));
  assert(pkg.scripts["verify:immo-ad-pubs"], "npm script verify:immo-ad-pubs");

  if (failed) {
    console.log("\n" + failed + " échec(s)");
    process.exit(1);
  }
  console.log("\nTous les checks pubs mandats OK");
});
