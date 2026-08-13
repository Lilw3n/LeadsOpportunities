/**
 * Marque et balises SEO orientées marché France.
 */
const { GOOGLE_SITE_VERIFICATION } = require("./site-url.cjs");

const SHIELD_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';

function franceMetaBlock() {
  return [
    '<meta name="geo.region" content="FR" />',
    '<meta name="geo.placename" content="France" />',
    '<meta name="language" content="fr-FR" />',
    '<meta http-equiv="content-language" content="fr" />',
    '<meta property="og:locale" content="fr_FR" />',
    '<meta name="target" content="France — courtier assurance ORIAS" />',
  ].join("\n  ");
}

function franceLocaleMeta() {
  return [
    '<meta http-equiv="content-language" content="fr" />',
    '<meta property="og:locale" content="fr_FR" />',
  ].join("\n  ");
}

function logoBlock(options) {
  var href = (options && options.href) || "./index.html";
  var iconClass = (options && options.iconClass) || "logo-icon";
  var wrapClass = (options && options.wrapClass) || "logo";
  var iconSize = (options && options.iconSize) || 28;
  var svg = SHIELD_SVG.replace('width="18"', 'width="' + iconSize + '"').replace('height="18"', 'height="' + iconSize + '"');

  return (
    '<a class="' +
    wrapClass +
    '" href="' +
    href +
    '">\n        <span class="' +
    iconClass +
    '">\n          ' +
    svg +
    "\n        </span>\n        <span class=\"logo-text\">\n          <span class=\"logo-name\">Leads Opportunities</span>\n          <span class=\"logo-tagline\">Assurance · Immo · Prêt · Banque · Finance</span>\n        </span>\n      </a>"
  );
}

function seoLogoBlock(prefix) {
  return logoBlock({
    href: prefix + "index.html",
    wrapClass: "seo-logo",
    iconClass: "seo-logo-icon",
    iconSize: 16,
  });
}

function blogLogoBlock() {
  return (
    '<a class="blog-logo" href="../index.html">\n        <span class="blog-logo-icon">' +
    SHIELD_SVG +
    '</span>\n        <span class="logo-text">\n          <span class="logo-name">Leads Opportunities</span>\n          <span class="logo-tagline">Courtier · France</span>\n        </span>\n      </a>'
  );
}

function googleSiteVerificationMeta() {
  return '<meta name="google-site-verification" content="' + GOOGLE_SITE_VERIFICATION + '" />';
}

const HOME_TITLE = "Leads Opportunities | Assurance, immobilier, pret, banque & finance";
const HOME_DESCRIPTION =
  "Courtier ORIAS : assurances, immobilier, pret immobilier, banque & TRC, finance. Devis gratuit, 180+ villes, rappel sous 15 min.";

module.exports = {
  franceMetaBlock: franceMetaBlock,
  franceLocaleMeta: franceLocaleMeta,
  googleSiteVerificationMeta: googleSiteVerificationMeta,
  logoBlock: logoBlock,
  seoLogoBlock: seoLogoBlock,
  blogLogoBlock: blogLogoBlock,
  HOME_TITLE: HOME_TITLE,
  HOME_DESCRIPTION: HOME_DESCRIPTION,
};
