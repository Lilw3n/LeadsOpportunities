/**
 * Parse produit / ville depuis les URLs silo SEO (/assurance-vtc/paris/).
 */
var SILO_PRODUCT = {
  "assurance-vtc": "vtc",
  "assurance-sante": "sante",
  "assurance-auto": "auto",
  "assurance-habitation": "habitation",
  "assurance-emprunteur": "emprunteur",
  "assurance-prevoyance": "prevoyance",
  "assurance-animaux": "animaux",
  "assurance-chien": "chien",
  "assurance-chat": "chat",
  "assurance-chasse": "chasse",
  "assurance-equitation": "equitation",
  "credit-immo": "credit-immo",
};

var SILO_SUBFOLDERS = new Set([
  "villes",
  "departements",
  "departement",
  "devis-rapide",
  "tarif",
  "simulation",
  "comparatif",
  "rc-pro",
  "uber-bolt",
  "creation-activite",
  "resiliation",
  "comparatif-assureurs",
  "pas-cher",
  "remboursement-optique",
  "rc-chasseur",
  "chien-chasse",
  "rc-equestre",
  "cheval",
]);

function slugToLabel(slug) {
  try {
    return decodeURIComponent(String(slug || "")).replace(/-/g, " ");
  } catch (e) {
    return String(slug || "").replace(/-/g, " ");
  }
}

function parseSeoFromPath(path) {
  var p = String(path || "")
    .replace(/\/index\.html$/, "/")
    .replace(/\?.*$/, "");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  var parts = p.split("/").filter(Boolean);
  var out = {
    seo_product: null,
    seo_city: null,
    seo_department: null,
    seo_region: null,
    landing_slug: p || "/",
  };
  if (!parts.length) return out;

  if (parts[0] === "landings") {
    out.landing_slug = "/" + parts.join("/");
    return out;
  }

  if (parts[0] === "france") {
    if (parts[1] === "departement" && parts[2]) out.seo_department = parts[2];
    if (parts[1] === "region" && parts[2]) out.seo_region = parts[2];
    if (parts[1] === "villes" && parts[2]) out.seo_city = slugToLabel(parts[2]);
    return out;
  }

  var product = SILO_PRODUCT[parts[0]];
  if (product) {
    out.seo_product = product;
    if (parts[1] === "departement" && parts[2]) out.seo_department = parts[2];
    else if (parts[1] === "villes") {
      /* hub */
    } else if (parts[1] && !SILO_SUBFOLDERS.has(parts[1])) {
      out.seo_city = slugToLabel(parts[1]);
    }
    return out;
  }

  /* legacy */
  if (["vtc", "sante", "credit-immo", "vtc-taxi", "assurance-sante"].indexOf(parts[0]) !== -1) {
    out.seo_product = parts[0].replace("assurance-", "").replace("-taxi", "");
    if (parts[1] === "villes" && parts[2]) out.seo_city = slugToLabel(parts[2]);
  }

  return out;
}

function parseSeoCityFromPath(path) {
  return parseSeoFromPath(path).seo_city || "";
}

function parseSeoProductFromPath(path) {
  return parseSeoFromPath(path).seo_product || "";
}

module.exports = {
  parseSeoFromPath: parseSeoFromPath,
  parseSeoCityFromPath: parseSeoCityFromPath,
  parseSeoProductFromPath: parseSeoProductFromPath,
};
