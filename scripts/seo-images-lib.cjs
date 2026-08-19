/**
 * Catalogue d’images SEO — VTC (images/seo/) + autres thèmes (blog/images, og/).
 */
var THEME_OG = {
  vtc: "images/seo/vtc/og-vtc.jpg",
  sante: "og/og-sante.jpg",
  credit: "og/og-credit-immo.jpg",
  auto: "og/og-default.svg",
  habitation: "og/og-default.svg",
  prevoyance: "og/og-default.svg",
  animaux: "og/og-animaux.jpg",
  niche: "og/og-default.svg",
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

var SANTE_ASSETS = {
  family: { file: "blog/images/sante/family-health.jpg", alt: "Famille — couverture mutuelle santé adaptée" },
  senior: { file: "blog/images/sante/senior-doctor.jpg", alt: "Senior en consultation médicale avec un professionnel de santé" },
  optique: { file: "blog/images/sante/optique-lunettes.jpg", alt: "Choix de lunettes en magasin d'optique — remboursement mutuelle" },
  dental: { file: "blog/images/sante/dental-care.jpg", alt: "Soin dentaire — remboursement mutuelle" },
  hospital: { file: "blog/images/sante/hospital-care.jpg", alt: "Personnel soignant et patient en établissement de santé" },
  consult: { file: "blog/images/sante/medecin-consultation.jpg", alt: "Consultation chez le médecin généraliste" },
  docs: { file: "blog/images/sante/mutuelle-documents.jpg", alt: "Documents et contrat de complémentaire santé" },
  seniors: { file: "blog/images/sante/seniors-couple.jpg", alt: "Couple de seniors — mutuelle santé adaptée" },
};

var ANIMAUX_ASSETS = {
  chienVet: { file: "blog/images/animaux/chien-veterinaire.jpg", alt: "Chien chez le vétérinaire — assurance animaux" },
  chat: { file: "blog/images/animaux/chat-soin.jpg", alt: "Chat domestique — assurance animaux" },
  chiot: { file: "blog/images/animaux/chiot-chaton.jpg", alt: "Chiot et chaton — assurer tôt ou tard" },
  promenade: { file: "blog/images/animaux/chien-promenade.jpg", alt: "Propriétaire promenant son chien" },
};

var CREDIT_ASSETS = {
  cles: { file: "blog/images/finance/credit-immo-cles.jpg", alt: "Clés et maison — crédit immobilier" },
  signature: { file: "blog/images/finance/signature-pret.jpg", alt: "Signature de contrat de prêt immobilier" },
  budget: { file: "blog/images/finance/budget-famille.jpg", alt: "Budget familial et documents financiers" },
};

var AUTO_ASSETS = {
  voiture: { file: "blog/images/auto/voiture-route.jpg", alt: "Voiture sur route — assurance auto" },
  jeune: { file: "blog/images/auto/jeune-conducteur.jpg", alt: "Jeune conducteur au volant" },
  bonus: { file: "blog/images/auto/bonus-malus.jpg", alt: "Tableau de bord voiture — bonus-malus" },
};

var HABITATION_ASSETS = {
  maison: { file: "blog/images/habitat/maison-famille.jpg", alt: "Maison avec jardin — assurance habitation" },
  appart: { file: "blog/images/habitat/appartement-locataire.jpg", alt: "Salon d'appartement en location" },
  sinistre: { file: "blog/images/habitat/sinistre-degats.jpg", alt: "Intervention après sinistre dans un logement" },
};

var PREVOYANCE_ASSETS = {
  famille: { file: "blog/images/prevoyance/famille-protection.jpg", alt: "Famille réunie — prévoyance et protection" },
  obseques: { file: "blog/images/prevoyance/deces-obseques.jpg", alt: "Bougie et fleurs — assurance décès et obsèques" },
};

var SECTION_POOL = {
  vtc: [VTC_ASSETS.voiture, VTC_ASSETS.chauffeur, VTC_ASSETS.smartphone, VTC_ASSETS.route],
  sante: [SANTE_ASSETS.consult, SANTE_ASSETS.optique, SANTE_ASSETS.dental, SANTE_ASSETS.hospital, SANTE_ASSETS.seniors],
  animaux: [ANIMAUX_ASSETS.chienVet, ANIMAUX_ASSETS.chat, ANIMAUX_ASSETS.chiot, ANIMAUX_ASSETS.promenade],
  credit: [CREDIT_ASSETS.cles, CREDIT_ASSETS.signature, CREDIT_ASSETS.budget],
  auto: [AUTO_ASSETS.voiture, AUTO_ASSETS.jeune, AUTO_ASSETS.bonus],
  habitation: [HABITATION_ASSETS.maison, HABITATION_ASSETS.appart, HABITATION_ASSETS.sinistre],
  prevoyance: [PREVOYANCE_ASSETS.famille, PREVOYANCE_ASSETS.obseques],
  niche: [SANTE_ASSETS.family, ANIMAUX_ASSETS.chienVet, CREDIT_ASSETS.cles],
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

function isExternalPath(file) {
  return /^(blog|og)\//.test(String(file || ""));
}

function publicPath(file) {
  file = String(file || "").replace(/^\//, "");
  if (isExternalPath(file)) return "/" + file;
  if (file.indexOf("images/seo/") === 0) return "/" + file;
  return "/images/seo/" + file;
}

function srcFor(file, prefix) {
  prefix = prefix || "/";
  if (prefix === "./") prefix = "";
  file = String(file || "").replace(/^\//, "");
  if (isExternalPath(file) || file.indexOf("og/") === 0) return prefix + file;
  if (file.indexOf("images/seo/") === 0) return prefix + file.replace(/^images\/seo\//, "images/seo/");
  return prefix + "images/seo/" + file;
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

function pickSanteHero(page) {
  var file = (page && page.file) || "";
  if (file.indexOf("optique") >= 0) return SANTE_ASSETS.optique;
  if (file.indexOf("comparatif") >= 0) return SANTE_ASSETS.docs;
  if (file.indexOf("hospital") >= 0) return SANTE_ASSETS.hospital;
  if (file.indexOf("dentaire") >= 0) return SANTE_ASSETS.dental;
  if (file.indexOf("canicule") >= 0) return SANTE_ASSETS.seniors;
  return SANTE_ASSETS.family;
}

function pickAnimauxHero(page) {
  var file = (page && page.file) || "";
  if (file.indexOf("chat") >= 0) return ANIMAUX_ASSETS.chat;
  if (file.indexOf("chiot") >= 0 || file.indexOf("chaton") >= 0) return ANIMAUX_ASSETS.chiot;
  if (file.indexOf("chien") >= 0) return ANIMAUX_ASSETS.promenade;
  return ANIMAUX_ASSETS.chienVet;
}

function pickCreditHero(page) {
  var file = (page && page.file) || "";
  if (file.indexOf("simulation") >= 0 || file.indexOf("rachat") >= 0) return CREDIT_ASSETS.budget;
  if (file.indexOf("pret") >= 0 || file.indexOf("emprunteur") >= 0) return CREDIT_ASSETS.signature;
  return CREDIT_ASSETS.cles;
}

function pickHero(page) {
  if (page && page.heroImage) return page.heroImage;
  var theme = (page && page.theme) || "vtc";
  if (theme === "vtc") return pickVtcHero(page);
  if (theme === "sante") return pickSanteHero(page);
  if (theme === "animaux") return pickAnimauxHero(page);
  if (theme === "credit") return pickCreditHero(page);
  if (theme === "auto") return AUTO_ASSETS.voiture;
  if (theme === "habitation") return HABITATION_ASSETS.maison;
  if (theme === "prevoyance") return PREVOYANCE_ASSETS.famille;
  return SANTE_ASSETS.family;
}

function ogFileFor(page) {
  if (page && page.ogImage) return page.ogImage;
  var theme = (page && page.theme) || "vtc";
  if (theme === "vtc") return VTC_ASSETS.og.file;
  return THEME_OG[theme] || THEME_OG.niche;
}

function enrichSections(sections, theme, page) {
  if (!sections || !sections.length) return sections || [];
  var pool = SECTION_POOL[theme] || SECTION_POOL.niche;
  if (!pool || !pool.length) return sections;
  var file = (page && page.file) || "";
  var offset = 0;
  for (var i = 0; i < file.length; i++) offset = (offset * 31 + file.charCodeAt(i)) >>> 0;
  return sections.map(function (s, i) {
    if (s.figure && s.figure.file) return s;
    return Object.assign({}, s, { figure: pool[(offset + i) % pool.length] });
  });
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
  SANTE_ASSETS: SANTE_ASSETS,
  ANIMAUX_ASSETS: ANIMAUX_ASSETS,
  CREDIT_ASSETS: CREDIT_ASSETS,
  UNSPLASH: UNSPLASH,
  publicPath: publicPath,
  srcFor: srcFor,
  pickVtcHero: pickVtcHero,
  pickHero: pickHero,
  ogFileFor: ogFileFor,
  enrichSections: enrichSections,
  renderFigure: renderFigure,
  renderGallery: renderGallery,
  imageObjectLd: imageObjectLd,
};
