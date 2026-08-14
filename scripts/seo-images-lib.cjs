/**
 * Catalogue d’images SEO (photos stock Unsplash, hebergees en local).
 */
var THEME_OG = {
  vtc: "vtc/og-vtc.jpg",
  sante: "vtc/og-vtc.jpg",
  credit: "vtc/og-vtc.jpg",
  auto: "vtc/voiture-nuit.jpg",
  habitation: "vtc/og-vtc.jpg",
  prevoyance: "vtc/og-vtc.jpg",
  animaux: "vtc/og-vtc.jpg",
  niche: "vtc/og-vtc.jpg",
};

var VTC_ASSETS = {
  og: { file: "vtc/og-vtc.jpg", alt: "Chauffeur VTC en ville — assurance professionnelle" },
  chauffeur: { file: "vtc/chauffeur-ville.jpg", alt: "Chauffeur VTC au volant en agglomération" },
  paris: { file: "vtc/paris-eiffel.jpg", alt: "Paris, Tour Eiffel — zone VTC Île-de-France" },
  parisNuit: { file: "vtc/paris-nuit.jpg", alt: "Paris de nuit — courses VTC et déplacements" },
  rue: { file: "vtc/paris-rue.jpg", alt: "Rue parisienne — trafic et transport de personnes" },
  voiture: { file: "vtc/berline-ville.jpg", alt: "Berline VTC en circulation urbaine" },
  smartphone: { file: "vtc/app-course.jpg", alt: "Application VTC Uber Bolt Heetch sur smartphone" },
  aeroport: { file: "vtc/aeroport.jpg", alt: "Aéroport — transferts VTC CDG et Orly" },
  defense: { file: "vtc/la-defense.jpg", alt: "Quartier d’affaires — La Défense et courses corporate" },
  gare: { file: "vtc/gare.jpg", alt: "Gare parisienne — prises en charge VTC" },
  route: { file: "vtc/peripherique.jpg", alt: "Voie rapide Île-de-France — activité chauffeur VTC" },
};

var UNSPLASH = {
  "vtc/og-vtc.jpg": "photo-1449965408869-eaa3f722e40d",
  "vtc/chauffeur-ville.jpg": "photo-1549317661-bd32c8ce0db2",
  "vtc/paris-eiffel.jpg": "photo-1502602898657-3e91760cbb34",
  "vtc/paris-nuit.jpg": "photo-1508057198894-247b23fe5ade",
  "vtc/paris-rue.jpg": "photo-1522093007474-d86e9bf7ba6f",
  "vtc/berline-ville.jpg": "photo-1494976388531-d1058494cdd8",
  "vtc/app-course.jpg": "photo-1551836022-d5d88e9218df",
  "vtc/aeroport.jpg": "photo-1436491865332-7a61a109cc05",
  "vtc/la-defense.jpg": "photo-1486406146926-c627a92ad1ab",
  "vtc/gare.jpg": "photo-1474487548417-781cb71495f3",
  "vtc/peripherique.jpg": "photo-1469854523086-cc02fe5d8800",
};

function publicPath(file) {
  return "/images/seo/" + file.replace(/^\//, "");
}

function srcFor(file, prefix) {
  prefix = prefix || "/";
  if (prefix === "./") prefix = "";
  return prefix + "images/seo/" + file.replace(/^\//, "");
}

function pickVtcHero(page) {
  if (page && page.heroImage) return page.heroImage;
  var city = page && page.city;
  var file = (page && page.file) || "";
  if (file.indexOf("aeroport") >= 0 || file.indexOf("cdg") >= 0 || file.indexOf("orly") >= 0) {
    return VTC_ASSETS.aeroport;
  }
  if (file.indexOf("defense") >= 0) return VTC_ASSETS.defense;
  if (file.indexOf("gare") >= 0) return VTC_ASSETS.gare;
  if (file.indexOf("uber") >= 0) return VTC_ASSETS.smartphone;
  if (city && city.regionSlug === "ile-de-france") {
    if (city.slug === "paris") return VTC_ASSETS.paris;
    if (city.slug === "puteaux" || city.slug === "courbevoie" || city.slug === "nanterre") {
      return VTC_ASSETS.defense;
    }
    if (city.slug === "orly" || city.slug === "roissy-en-france" || city.slug === "gonesse") {
      return VTC_ASSETS.aeroport;
    }
    return VTC_ASSETS.parisNuit;
  }
  return VTC_ASSETS.chauffeur;
}

function ogFileFor(page) {
  if (page && page.ogImage) return page.ogImage;
  if (page && page.theme === "vtc") return VTC_ASSETS.og.file;
  return null;
}

function renderFigure(asset, prefix, className, eager) {
  if (!asset || !asset.file) return "";
  return (
    '<figure class="' +
    (className || "seo-figure") +
    '">' +
    '<img src="' +
    srcFor(asset.file, prefix) +
    '" alt="' +
    String(asset.alt || "").replace(/"/g, "&quot;") +
    '" width="1280" height="720" ' +
    (eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"') +
    " />" +
    (asset.caption ? "<figcaption>" + asset.caption + "</figcaption>" : "") +
    "</figure>"
  );
}

function renderGallery(assets, prefix) {
  if (!assets || !assets.length) return "";
  return (
    '<div class="seo-gallery">' +
    assets
      .map(function (a) {
        return renderFigure(a, prefix, "seo-gallery-item");
      })
      .join("") +
    "</div>"
  );
}

function imageObjectLd(base, file) {
  return {
    "@type": "ImageObject",
    url: base + publicPath(file),
    width: 1280,
    height: 720,
  };
}

module.exports = {
  THEME_OG: THEME_OG,
  VTC_ASSETS: VTC_ASSETS,
  UNSPLASH: UNSPLASH,
  publicPath: publicPath,
  srcFor: srcFor,
  pickVtcHero: pickVtcHero,
  ogFileFor: ogFileFor,
  renderFigure: renderFigure,
  renderGallery: renderGallery,
  imageObjectLd: imageObjectLd,
};
