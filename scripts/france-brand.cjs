/**
 * Marque et balises SEO orientées marché France.
 */
const { GOOGLE_SITE_VERIFICATION } = require("./site-url.cjs");

/** Icône carrée LO (gradient) — chemin absolu site. */
const LOGO_ICON_SRC = "/assets/brand/logo-mark.png";
const LOGO_BANNER_SRC = "/assets/brand/logo-banner.jpg";
const LOGO_ICON_ALT = "Leads Opportunities — Wendy Buchet";

function logoImgHtml(size) {
  var s = Number(size) || 28;
  return (
    '<img class="logo-img" src="' +
    LOGO_ICON_SRC +
    '" alt="' +
    LOGO_ICON_ALT +
    '" width="' +
    s +
    '" height="' +
    s +
    '" decoding="async" />'
  );
}

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

function brandIconsMeta() {
  return [
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
    '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />',
  ].join("\n  ");
}

function logoBlock(options) {
  var href = (options && options.href) || "./index.html";
  var iconClass = (options && options.iconClass) || "logo-icon";
  var wrapClass = (options && options.wrapClass) || "logo";
  var iconSize = (options && options.iconSize) || 36;
  var tagline =
    (options && options.tagline) || "Assurance · Immo · Prêt · Banque · Finance";

  return (
    '<a class="' +
    wrapClass +
    '" href="' +
    href +
    '">\n        <span class="' +
    iconClass +
    '">\n          ' +
    logoImgHtml(iconSize) +
    "\n        </span>\n        <span class=\"logo-text\">\n          <span class=\"logo-name\">Leads Opportunities</span>\n          <span class=\"logo-tagline\">" +
    tagline +
    "</span>\n        </span>\n      </a>"
  );
}

function seoLogoBlock(prefix) {
  return logoBlock({
    href: prefix + "index.html",
    wrapClass: "seo-logo",
    iconClass: "seo-logo-icon",
    iconSize: 32,
  });
}

function blogLogoBlock() {
  return logoBlock({
    href: "../index.html",
    wrapClass: "blog-logo",
    iconClass: "blog-logo-icon",
    iconSize: 32,
    tagline: "Wendy Buchet · Courtier · France",
  });
}

function googleSiteVerificationMeta() {
  return '<meta name="google-site-verification" content="' + GOOGLE_SITE_VERIFICATION + '" />';
}

const HOME_TITLE = "Courtier assurance, mutuelle & credit | Nancy — Leads Opportunities";
const HOME_DESCRIPTION =
  "Courtier ORIAS : mutuelle sante, assurance, credit immobilier et pret. Devis gratuit. Cabinet Varangeville pres de Nancy (54) — dossiers partout en France.";

module.exports = {
  franceMetaBlock: franceMetaBlock,
  franceLocaleMeta: franceLocaleMeta,
  googleSiteVerificationMeta: googleSiteVerificationMeta,
  brandIconsMeta: brandIconsMeta,
  logoBlock: logoBlock,
  seoLogoBlock: seoLogoBlock,
  blogLogoBlock: blogLogoBlock,
  logoImgHtml: logoImgHtml,
  LOGO_ICON_SRC: LOGO_ICON_SRC,
  LOGO_BANNER_SRC: LOGO_BANNER_SRC,
  HOME_TITLE: HOME_TITLE,
  HOME_DESCRIPTION: HOME_DESCRIPTION,
};
