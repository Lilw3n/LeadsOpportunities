#!/usr/bin/env node
/** Vérifie le lien visite virtuelle acquéreur (gate e-mail/tél + quotas). */
var fs = require("fs");
var path = require("path");
var AdLib = require("../js/immo-ad-listings-lib.js");
var Tour = require("../js/immo-tour-access-lib.js");

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

[
  "immobilier/visite.html",
  "js/immo-tour-access-lib.js",
  "js/immo-tour-access-page.js",
  "api/_lib/routes/public-immo-tour-access.js",
  "api/_lib/routes/public-immo-tour-player.js",
  "crm-immo-pubs.html",
  "js/crm-contact-tour.js",
  "js/crm-immo-tour-requests.js",
  "crm-immo-tour-requests.html",
].forEach(function (f) {
  assert(fs.existsSync(path.join(ROOT, f)), f + " existe");
});

assert(Tour.normalizeEmail(" Wendy@Exemple.FR ") === "wendy@exemple.fr", "normalize email");
assert(Tour.normalizePhone("06 12 34 56 78") === "0612345678", "normalize phone");
assert(Tour.isTourToken(Tour.makeTourToken()), "token vt_");
assert(!Tour.isTourToken("ad_abc_def"), "token démo vendeur ≠ visite");

var gated = AdLib.applyAdToProperty(
  {
    id: "prop_tour",
    title: "T2 Nancy",
    city: "Nancy",
    status: "mandat",
    price_fai: 180000,
  },
  {
    headline: "T2 centre",
    virtual_tour: "https://my.matterport.com/show/?m=abc",
    channel_public: true,
    tour_gate: true,
    tour_days: 30,
    tour_duration_start: "created",
    tour_max_views: 50,
    tour_max_per_contact: 8,
  }
);
var ta = gated.metadata && gated.metadata.ad && gated.metadata.ad.tour_access;
assert(ta && ta.enabled && Tour.isTourToken(ta.token), "tour_access généré");
assert(ta.max_views === 50, "max 50 vues");
assert(ta.expires_at && Date.parse(ta.expires_at) > Date.now(), "date de fin dans le futur");

var hourly = AdLib.applyAdToProperty(
  { id: "prop_h", status: "mandat", title: "H", city: "Nancy" },
  {
    virtual_tour: "https://my.matterport.com/show/?m=h1",
    tour_gate: true,
    tour_duration_value: 6,
    tour_duration_unit: "hours",
    tour_duration_start: "created",
    tour_max_views: 1,
    tour_max_per_contact: 1,
  }
);
var tah = hourly.metadata.ad.tour_access;
var deltaH = Date.parse(tah.expires_at) - Date.now();
assert(tah.duration_unit === "hours" && tah.duration_value === 6, "durée 6 heures");
assert(deltaH > 5 * 3600000 && deltaH < 7 * 3600000, "expiration dans ~6 h");
assert(tah.max_views === 1, "1 utilisation");
assert(Tour.tourLinkStatus(Object.assign({}, tah, { view_count: 1 })).reason === "quota", "1/1 coupe le lien");

var firstClick = AdLib.applyAdToProperty(
  { id: "prop_click", status: "mandat", title: "C", city: "Nancy" },
  {
    virtual_tour: "https://my.matterport.com/show/?m=c1",
    tour_gate: true,
    tour_duration_value: 48,
    tour_duration_unit: "hours",
    tour_duration_start: "first_view",
    tour_max_views: 10,
  }
);
var tac = firstClick.metadata.ad.tour_access;
assert(tac.duration_start === "first_view", "durée au 1er clic");
assert(!tac.expires_at, "pas d’expiration avant la 1re ouverture");
assert(Tour.tourLinkStatus(tac).ok === true, "lien OK avant 1re ouverture");
var started = Tour.startDurationOnFirstView(tac, Date.parse("2026-09-08T12:00:00.000Z"));
assert(!!started.first_viewed_at, "1re ouverture horodatée");
assert(Date.parse(started.expires_at) === Date.parse("2026-09-10T12:00:00.000Z"), "expire 48 h après le 1er clic");

var implicit = AdLib.applyAdToProperty(
  { id: "prop_implicit", status: "mandat", title: "I", city: "Nancy" },
  {
    virtual_tour: "https://my.matterport.com/show/?m=i1",
    tour_gate: true,
    tour_duration_value: 2,
    tour_duration_unit: "days",
  }
);
assert(implicit.metadata.ad.tour_access.duration_start === "first_view", "défaut : durée au 1er clic");
assert(!implicit.metadata.ad.tour_access.expires_at, "défaut : pas d’expiration avant ouverture");

var named = AdLib.applyAdToProperty(implicit, {
  virtual_tour: "https://my.matterport.com/show/?m=i1",
  tour_gate: true,
  tour_name: "Leboncoin Dombasle",
  tour_availability: "active",
  tour_visibility: "listed",
  tour_duration_value: 48,
  tour_duration_unit: "hours",
  tour_duration_start: "first_view",
  tour_link_id: implicit.metadata.ad.tour_access.id || implicit.metadata.ad.tour_access.token,
});
assert(named.metadata.ad.tour_access.token === implicit.metadata.ad.tour_access.token, "renommer / durée : token inchangé");
assert(named.metadata.ad.tour_access.name === "Leboncoin Dombasle", "nom du lien");
assert(Array.isArray(named.metadata.ad.tour_links) && named.metadata.ad.tour_links.length >= 1, "tour_links persistés");

var extra = AdLib.applyAdToProperty(named, {
  virtual_tour: "https://my.matterport.com/show/?m=i1",
  tour_gate: true,
  tour_create_link: true,
  tour_name: "Site vitrine",
  tour_availability: "active",
  tour_visibility: "listed",
  tour_duration_value: 7,
  tour_duration_unit: "days",
});
assert(extra.metadata.ad.tour_links.length === 2, "2e lien nommé");
assert(extra.metadata.ad.tour_links[0].token === named.metadata.ad.tour_access.token, "1er lien Leboncoin intact");
assert(extra.metadata.ad.tour_links[1].name === "Site vitrine", "2e lien nommé Site");
assert(extra.metadata.ad.tour_links[1].token !== extra.metadata.ad.tour_links[0].token, "2 tokens distincts");
assert(AdLib.findByTourToken([extra], extra.metadata.ad.tour_links[1].token).id === "prop_implicit", "findByTourToken 2e lien");

var deleted = AdLib.applyAdToProperty(extra, {
  virtual_tour: "https://my.matterport.com/show/?m=i1",
  tour_delete_link: true,
  tour_link_id: extra.metadata.ad.tour_links[1].id || extra.metadata.ad.tour_links[1].token,
});
assert(deleted.metadata.ad.tour_links.length === 1, "suppression d’un lien nommé");
assert(deleted.metadata.ad.tour_links[0].token === extra.metadata.ad.tour_links[0].token, "l’autre lien reste");
assert(Tour.removeTourLink, "API removeTourLink exportée");

var paused = AdLib.applyAdToProperty(named, {
  virtual_tour: "https://my.matterport.com/show/?m=i1",
  tour_gate: true,
  tour_availability: "paused",
  tour_visibility: "unlisted",
  tour_name: "Leboncoin Dombasle",
  tour_link_id: named.metadata.ad.tour_access.id,
  tour_duration_value: 48,
  tour_duration_unit: "hours",
  tour_duration_start: "first_view",
});
assert(paused.metadata.ad.tour_access.token === named.metadata.ad.tour_access.token, "pause : token inchangé");
assert(Tour.tourLinkStatus(paused.metadata.ad.tour_access).reason === "paused", "pause coupe l’accès");
assert(!AdLib.toAdListing(paused).tour_href, "masqué site : pas de bouton vitrine");
assert(!AdLib.toAdListing(paused).virtual_tour, "pause : Matterport toujours masqué");

var listing = AdLib.toAdListing(gated);
assert(listing.tour_gate === true, "listing public : porte activée");
assert(!listing.virtual_tour, "Matterport non exposé en public");
assert(listing.has_virtual_tour === true, "badge visite conservé");
assert(listing.tour_href.indexOf("/immobilier/visite.html?t=") === 0, "href porte");

var raw = AdLib.toAdListing(gated, { includeTourUrl: true });
assert(raw.virtual_tour.indexOf("matterport") !== -1, "URL brute seulement en interne");

assert(AdLib.findByTourToken([gated], ta.token).id === "prop_tour", "findByTourToken");
assert(!AdLib.findByTourToken([gated], "vt_inconnu_xxxx"), "token inconnu");

var st = Tour.tourLinkStatus(ta);
assert(st.ok && st.remaining === 50, "quota initial 50");
var almost = Object.assign({}, ta, { view_count: 49 });
assert(Tour.tourLinkStatus(almost).ok === true && Tour.tourLinkStatus(almost).remaining === 1, "49/50 encore autorisé");
var burned = Object.assign({}, ta, { view_count: 50 });
assert(Tour.tourLinkStatus(burned).reason === "quota", "quota atteint");
var expired = Object.assign({}, ta, { expires_at: "2020-01-01T00:00:00.000Z" });
assert(Tour.tourLinkStatus(expired).reason === "expired", "lien expiré");

assert(Tour.nextAskOutcome("").status === "pending" && Tour.nextAskOutcome("").create === true, "1re demande → pending");
assert(Tour.nextAskOutcome("pending").create === false && Tour.nextAskOutcome("pending").resend === false, "déjà pending : pas de code");
assert(Tour.nextAskOutcome("declined").ok === false, "déclinée : refus");
assert(Tour.nextAskOutcome("approved").resend === true, "déjà validée : renvoi possible");
assert(Tour.applyRequestDecision("approve").status === "approved", "Wendy valide");
assert(Tour.applyRequestDecision("decline").status === "declined", "Wendy décline");
assert(Tour.requestCanVerify("approved") === true, "code seulement après validation");
assert(Tour.requestCanVerify("pending") === false && Tour.requestCanVerify("declined") === false, "pending/déclinée : pas de visite");
assert(Tour.requestStatusMessage("pending").indexOf("attente") !== -1, "message attente");
assert(Tour.storeContactKey("Wendy@Exemple.FR", "", "vt_x") === "wendy@exemple.fr", "clé contact e-mail");

var otp = Tour.otpCode(ta.token, "email|wendy@exemple.fr");
assert(/^\d{6}$/.test(otp), "OTP e-mail 6 chiffres");
assert(Tour.verifyOtp(ta.token, "email|wendy@exemple.fr", otp), "verify OTP");
var grant = Tour.makeGrant(ta.token, "wendy@exemple.fr|0612345678");
assert(Tour.verifyGrant(grant, ta.token).contact.indexOf("wendy@exemple.fr") === 0, "grant HMAC");

var ungated = AdLib.applyAdToProperty(
  { id: "prop_old", status: "mandat", title: "X", city: "Nancy" },
  { virtual_tour: "https://my.matterport.com/show/?m=xyz", channel_public: true }
);
assert(AdLib.toAdListing(ungated).virtual_tour.indexOf("matterport") !== -1, "sans tour_gate : comportement historique");

var html = read("immobilier/visite.html");
assert(html.indexOf("noindex") !== -1, "visite noindex");
assert(html.indexOf("tourEmail") !== -1 && html.indexOf("tourPhone") !== -1, "champs e-mail + tél");
assert(html.indexOf("Demander l") !== -1 && html.indexOf("Valider le code") !== -1, "demande d’accès + validation de code");
assert(html.indexOf("validera ou déclinera") !== -1, "page : Wendy valide ou décline");
assert(html.indexOf("même si ce lien était réservé") !== -1, "page : demande hors liste autorisée");
assert(html.indexOf("id=\"tourCodes\"") !== -1 && html.indexOf("id=\"tourVerify\"") !== -1, "bloc valider toujours présent");
assert(html.indexOf("tourTerms") !== -1 && html.indexOf("Wendy BUCHET") !== -1, "droits d’auteur + mandataire");
assert(html.indexOf("usage unique et personnel") !== -1, "bandeau visite respectueux");
assert(html.indexOf("outil de pub") === -1 && html.indexOf("ou le propriétaire") === -1, "bandeau sans viser le propriétaire");
assert(html.indexOf("tourRedirect") !== -1, "redirection Wendy si lien usé");
assert(html.indexOf("immo-tour-access-page.js") !== -1, "script page");
assert(html.indexOf("tourStage") !== -1 && html.indexOf("tourImportant") !== -1, "layout stage + infos importantes");
assert(html.indexOf("Informations importantes") !== -1, "bandeau infos importantes");
assert(html.indexOf("tourDirectActions") !== -1 && html.indexOf("tourOpenNone") !== -1, "bouton Voir la visite accès direct");
var pageJsDirect = read("js/immo-tour-access-page.js");
assert(pageJsDirect.indexOf("immo-tour-page--direct") !== -1, "page : classe layout direct");
assert(pageJsDirect.indexOf("openDirectAccess") !== -1, "page : ouverture auto accès libre");
assert(pageJsDirect.indexOf("setDirectLayout") !== -1, "page : panneau latéral infos");
assert(pageJsDirect.indexOf("tourDirectActions") !== -1, "page : actions directes hors étapes OTP");
assert(pageJsDirect.indexOf("resolveVerifyMode") !== -1, "page : mode dérivé de require_otp");
assert(html.indexOf("immo-tour-access-page.js?v=") !== -1, "page : cache-bust script visite");
var cssDirect = read("css/immo-ad-listings.css");
assert(cssDirect.indexOf("tour-direct-layout") !== -1, "css : layout accès direct");
assert(cssDirect.indexOf("Visite élargie") !== -1, "css : visite élargie");
assert(cssDirect.indexOf("1680px") !== -1 && cssDirect.indexOf("82vh") !== -1, "css : player large");


var crm = read("crm-immo-pubs.html");
assert(crm.indexOf("chTourGate") !== -1 && crm.indexOf("adTourDuration") !== -1, "CRM : durée libre");
assert(crm.indexOf("adTourDurationUnit") !== -1 && crm.indexOf("Heures") !== -1, "CRM : heures ou jours");
assert(crm.indexOf("adTourDurationStart") !== -1, "CRM : durée dès la 1re consultation");
assert(crm.indexOf("adTourName") !== -1 && crm.indexOf("adTourAvailability") !== -1, "CRM : nom + disponibilité");
assert(crm.indexOf("adTourVisibility") !== -1 && crm.indexOf("btnNewNamedTourLink") !== -1, "CRM : visibilité + autre lien");
assert(crm.indexOf("btnCopyTourLink") !== -1 && crm.indexOf("btnRotateTourLink") !== -1, "CRM : copier / renouveler");
assert(crm.indexOf("adTourVerify") !== -1 && crm.indexOf("adTourPeriod") !== -1, "CRM : vérif + période");
assert(crm.indexOf("adTourAllowEmails") !== -1 && crm.indexOf("chTourBindLbc") !== -1, "CRM : personnes + canaux");

var contactHtml = read("crm-contact.html");
assert(contactHtml.indexOf("contactTourMount") !== -1 && contactHtml.indexOf("crm-contact-tour.js") !== -1, "fiche contact : bloc visite");
var contactJs = read("crm-contact.js");
assert(contactJs.indexOf("CrmContactTour") !== -1, "fiche contact : mount visite");
var tourUi = read("js/crm-contact-tour.js");
assert(tourUi.indexOf("tour_allow_emails") !== -1 && tourUi.indexOf("visite.html") !== -1, "contact tour : allowlist + lien public");
assert(tourUi.indexOf("ctTourEmails") !== -1 && tourUi.indexOf("ctTourPhones") !== -1, "contact tour : ajout e-mail / tél");
assert(tourUi.indexOf("emails0.concat") === -1 && tourUi.indexOf("contactEmail && emails.indexOf") === -1, "contact : pas d’auto-ajout propriétaire");
assert(tourUi.indexOf("data-delete-link") !== -1 && tourUi.indexOf("Supprimer ce lien") !== -1, "contact : supprimer un lien");
assert(crm.indexOf("btnDeleteTourLink") !== -1, "CRM pubs : supprimer CE lien");
var crmJsPubs = read("js/crm-immo-pubs.js");
assert(crmJsPubs.indexOf("tour_delete_link") !== -1 && crmJsPubs.indexOf("__deleteTourOnce") !== -1, "CRM pubs : flag suppression");
assert(Tour.removeTourLink && typeof Tour.removeTourLink === "function", "lib : removeTourLink");
assert(tourUi.indexOf("first_view") !== -1, "contact tour : durée au 1er clic");
assert(tourUi.indexOf("ctTourName") !== -1 && tourUi.indexOf("ctTourAvailability") !== -1, "contact tour : nom + dispo");
assert(tourUi.indexOf("URL inchangée") !== -1 && tourUi.indexOf("tour_create_link") !== -1, "contact tour : URL stable + autre lien");

var noneMode = AdLib.applyAdToProperty(
  { id: "prop_none", status: "mandat", title: "Y", city: "Nancy", forme_mandat: "Exclusif", mandate_started_at: "2026-01-01", mandate_ends_at: "2099-12-31" },
  {
    virtual_tour: "https://my.matterport.com/show/?m=n1",
    tour_gate: true,
    tour_verify_mode: "none",
    tour_period_mode: "mandate",
    tour_allow_emails: "a@b.fr",
    tour_bind_leboncoin: true,
    tour_bind_site: true,
  }
);
var taNone = noneMode.metadata.ad.tour_access;
assert(taNone.verify_mode === "none", "vérif nulle");
assert(taNone.max_views_per_contact === 0, "accès libre : pas de plafond par contact");
assert(Tour.contactQuotaOk(99, taNone) === true, "accès libre : quota contact ignoré");
var unlimited = AdLib.applyAdToProperty(
  { id: "prop_unlim", status: "mandat", title: "U", city: "Nancy" },
  {
    virtual_tour: "https://my.matterport.com/show/?m=u1",
    tour_gate: true,
    tour_verify_mode: "email",
    tour_max_views: 0,
    tour_max_per_contact: 8,
  }
);
var taUnlim = unlimited.metadata.ad.tour_access;
assert(taUnlim.max_views === 0, "utilisations max 0 = illimité");
assert(taUnlim.max_views_per_contact === 0, "illimité : plafond contact forcé à 0");
assert(Tour.contactQuotaOk(50, { max_views: 0, max_views_per_contact: 8 }) === true, "max_views 0 ignore plafond contact");
assert(Tour.contactQuotaOk(8, { max_views: 50, max_views_per_contact: 8 }) === false, "plafond contact coupe à 8");
assert(tourUi.indexOf("tour_max_per_contact: Number(maxViews) === 0") !== -1 || tourUi.indexOf('verify === "none" ? 0 : 8') !== -1, "contact tour : pas de 8 forcé si illimité");
assert(taNone.period_mode === "mandate", "période mandat");
assert(taNone.allow_emails[0] === "a@b.fr", "allowlist e-mail");
assert(Tour.isAllowlisted(taNone, "a@b.fr", "") === true, "allowlist ok");
assert(Tour.isAllowlisted(taNone, "x@y.fr", "") === false, "allowlist refus");
assert(Tour.tourLinkStatus(taNone, 0, noneMode).ok === true, "mandat exclusif en cours : lien OK");
var ended = Object.assign({}, noneMode, { mandate_started_at: "2019-01-01", mandate_ends_at: "2020-01-01" });
assert(Tour.tourLinkStatus(taNone, 0, ended).reason === "mandate_ended", "mandat échu coupe le lien");
assert(Tour.playerPath(taNone.token).indexOf("/api/immo-tour-player?t=") === 0, "chemin lecteur interne");
assert(Tour.playerRequestOk({ "sec-fetch-dest": "iframe" }) === true, "lecteur iframe OK");
assert(Tour.playerRequestOk({ referer: "https://www.leadsopportunities.fr/immobilier/visite.html?t=x" }) === true, "lecteur referer OK");
assert(Tour.playerRequestOk({ referer: "https://evil.example/x" }) === false, "lecteur refus hors page");
assert(Tour.publicMeta(taNone).approval_required === false, "vérif nulle : pas d’approbation");
assert(Tour.publicMeta(ta).approval_required === true, "e-mail : approbation Wendy requise");
assert(Tour.COPYRIGHT.indexOf("Wendy BUCHET") !== -1, "droits d’auteur Wendy");
assert(Tour.COPYRIGHT.indexOf("ou le propriétaire") === -1, "mentions légales sans viser le propriétaire");
assert(Tour.AUTHOR.role.indexOf("Mandataire") !== -1, "mandataire");
assert(Tour.channelLinks(taNone.token, "https://www.leadsopportunities.fr").leboncoin.indexOf("utm_source=leboncoin") !== -1, "lien LBC");

var api = read("api/_lib/routes/public-immo-tour-access.js");
assert(api.indexOf("request_access") !== -1 && api.indexOf("view_tour") !== -1, "API actions");
assert(api.indexOf("advisor_code") !== -1, "API : code à donner depuis le CRM");
assert(api.indexOf("decide_request") !== -1 && api.indexOf("list_requests") !== -1, "API : valider / décliner");
assert(api.indexOf("crm_immo_tour_requests") !== -1, "API : table file d’attente");
assert(api.indexOf("en attente de validation") !== -1 || api.indexOf("va la valider ou la décliner") !== -1, "API : pas de code auto");
assert(api.indexOf("sendVisitorOtpEmail") !== -1, "API : code seulement après validation Wendy");
assert(api.indexOf("accepted_terms") !== -1 && api.indexOf("isAllowlisted") !== -1, "API : droits + allowlist");
assert(api.indexOf("!Tour.needsOtp(info.access) && !Tour.isAllowlisted") === -1, "API : accès libre non bloqué par allowlist");
assert(api.indexOf("Accès libre (verify_mode none)") !== -1, "API : commentaire accès libre public");
assert(api.indexOf("Cette visite est réservée à une liste") === -1, "API : liste ne bloque plus la demande");
assert(api.indexOf("onAllowlist") !== -1 && api.indexOf("Hors liste prévue") !== -1, "API : demande hors liste quand même");
assert(api.indexOf("acheteur_immo") !== -1, "lead vertical acquéreur");
assert(api.indexOf("registerTourProspect") !== -1 && api.indexOf("ensureContactLinked") !== -1, "API : lead + prospect à la demande");
assert(api.indexOf("propertyIds") !== -1 && api.indexOf('role: "prospect"') !== -1, "API : bien intéressé lié au prospect");
assert(api.indexOf("startDurationOnFirstView") !== -1, "API : durée au 1er clic");
assert(api.indexOf("TWILIO_SMS_ENABLED") !== -1, "API : SMS Twilio coupé par défaut");
assert(api.indexOf("sms_disabled") !== -1, "API : aucun SMS tant que le flag est off");
assert(crm.indexOf("désactivé — payant") !== -1, "CRM : SMS marqué payant");
assert(tourUi.indexOf("E-mail (gratuit)") !== -1, "contact : vérif e-mail par défaut");
assert(api.indexOf("player_url") !== -1, "API : lecteur same-origin");
assert(api.indexOf("embed_url") === -1, "API : pas d’URL Matterport en JSON");
var player = read("api/_lib/routes/public-immo-tour-player.js");
assert(player.indexOf("playerRequestOk") !== -1, "lecteur : iframe / referer");
assert(player.indexOf("lo_immo_tour_grant") !== -1 || player.indexOf("parseGrantCookie") !== -1, "lecteur : cookie grant");
var routes = read("api/[action].js");
assert(routes.indexOf("immo-tour-player") !== -1, "route lecteur enregistrée");
var pageJs = read("js/immo-tour-access-page.js");
assert(pageJs.indexOf("immo-tour-player") !== -1, "page : iframe interne");
assert(pageJs.indexOf("my.matterport.com") === -1, "page : pas d’URL Matterport");
assert(tourUi.indexOf("ctTourUrlEdit") !== -1 && tourUi.indexOf("masqué") !== -1, "contact : lien 3D masqué");
assert(tourUi.indexOf("lien indépendant") !== -1, "contact : liens indépendants");
assert(tourUi.indexOf("data-give-code") !== -1 && tourUi.indexOf("advisor_code") !== -1, "contact : donner un code");
assert(tourUi.indexOf("ctTourRequests") !== -1 && tourUi.indexOf("CrmImmoTourRequests") !== -1, "contact : file Valider / Décliner");
assert(tourUi.indexOf("tu valides ou tu déclines") !== -1 || tourUi.indexOf("Biens intéressés") !== -1, "contact : biens intéressés / validation");
assert(tourUi.indexOf("ctTourInterest") !== -1 && tourUi.indexOf("data-pick-prop") !== -1, "contact : proposer un autre lien");
assert(tourUi.indexOf("lead") !== -1 && tourUi.indexOf("prospect") !== -1, "contact : lead + prospect");
var reqUi = read("js/crm-immo-tour-requests.js");
assert(reqUi.indexOf("decide_request") !== -1 && reqUi.indexOf("data-tour-approve") !== -1, "CRM : bouton Valider");
assert(reqUi.indexOf("data-tour-decline") !== -1 && reqUi.indexOf("Décliner") !== -1, "CRM : bouton Décliner");
assert(reqUi.indexOf("hors liste prévue") !== -1, "CRM : badge hors liste");
assert(reqUi.indexOf("crm-contact.html") !== -1 && reqUi.indexOf("Prospect") !== -1, "CRM : lien fiche prospect");
var reqHtml = read("crm-immo-tour-requests.html");
assert(reqHtml.indexOf("tourRequestMount") !== -1, "page CRM demandes de visite");
assert(crm.indexOf("tourRequestInbox") !== -1 && crm.indexOf("crm-immo-tour-requests.html") !== -1, "pubs : file + lien demandes");
var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-immo-tour-requests.html") !== -1, "sidebar : Demandes de visite");
assert(pageJs.indexOf("Envoi de la demande") !== -1, "page : demande sans envoi auto de code");
assert(pageJs.indexOf("res.d.pending") !== -1, "page : état en attente");
assert(crm.indexOf("btnEditTourUrl") !== -1 && crm.indexOf("adTourMasked") !== -1, "CRM : lien 3D masqué");

var css = read("css/immo-ad-listings.css");
assert(css.indexOf(".immo-ad-gate [hidden]") !== -1, "hidden n’est pas écrasé par display:flex");

var pages = read("js/immo-ad-pages.js");
assert(pages.indexOf("tour_href") !== -1, "vitrine pointe vers la porte");

var routes = read("api/[action].js");
assert(routes.indexOf("immo-tour-access") !== -1, "route enregistrée");

var vercel = read("vercel.json");
assert(vercel.indexOf("/immobilier/visite") !== -1, "rewrite Vercel");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-tour-access"], "script npm");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles visite acquéreur OK.");
