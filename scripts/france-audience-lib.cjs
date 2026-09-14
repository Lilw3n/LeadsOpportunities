/**
 * Ciblage marché France — filtre actu internationale, meta robots, scoring SEO.
 */
const INTL_TOPIC_PATTERNS = [
  /\bworld cup\b/i,
  /\bworld\s+cup\b/i,
  /\busa\b/i,
  /\bétats-unis\b/i,
  /\betats-unis\b/i,
  /\bunited states\b/i,
  /\btrump\b/i,
  /\bgta\s*6\b/i,
  /\bgta\b/i,
  /\bzelda\b/i,
  /\bnintendo\b/i,
  /\bformule\s*1\b/i,
  /\bgrand\s+prix\b/i,
  /\bligue des champions\b/i,
  /\bchampions league\b/i,
  /\bgaming\b/i,
  /\btwitch\b/i,
  /\bstreamer\b/i,
  /\bplaystation\b/i,
  /\bxbox\b/i,
  /\bmondial\s+(foot\s+)?usa\b/i,
  /\bfifa\s+2026\b/i,
  /\bworld\s+cup\s+2026\b/i,
];

const FRANCE_MARKET_PATTERNS = [
  /\bfrance\b/i,
  /\bfrançais(?:e|es)?\b/i,
  /\bfrancais(?:e|es)?\b/i,
  /\bparis\b/i,
  /\blyon\b/i,
  /\bmarseille\b/i,
  /\bmutuelle\b/i,
  /\bassurance\b/i,
  /\bhabitation\b/i,
  /\bemprunteur\b/i,
  /\bpr[eê]t immobilier\b/i,
  /\bloi lemoine\b/i,
  /\borias\b/i,
  /\bs[eé]cu\b/i,
  /\bsecu\b/i,
  /\bmacron\b/i,
  /\bpr[eé]voyance\b/i,
  /\bdom\b/i,
  /\bdom-tom\b/i,
  /\bmetropole\b/i,
  /\bcr[eé]dit conso/i,
  /\bpr[eê]t consommation/i,
  /\bpr[eê]t personnel/i,
  /\bcode de la consommation/i,
  /\bvoiture sans permis\b/i,
  /\bquadricycle\b/i,
  /\bpermis AM\b/i,
  /\béquipe de france\b/i,
  /\bequipe de france\b/i,
  /\bcoupe du monde\b/i,
  /\bmondial\b/i,
];

const INTL_ACTU_FILES = new Set([
  "coupe-monde-2026-assurance-voyage-sante.html",
  "coupe-monde-voyage-assurance-sante-etranger-2026.html",
  "gta-6-pret-immobilier-budget-gaming.html",
  "gta-6-sortie-assurance-gaming-materiel.html",
  "trump-politique-us-taux-pret-assurance-emprunteur.html",
  "formule-1-grands-prix-assurance-voyage-auto.html",
  "ligue-champions-assurance-voyage-deplacement.html",
  "zelda-ocarina-time-collection-assurance-habitation.html",
  "assurance-streamer-gaming-setup-materiel.html",
]);

function textBlob(articleOrText) {
  if (typeof articleOrText === "string") return articleOrText;
  if (!articleOrText) return "";
  return [
    articleOrText.title,
    articleOrText.description,
    articleOrText.file,
    articleOrText.tag,
    articleOrText.summary,
  ]
    .filter(Boolean)
    .join(" ");
}

/** « France 24 » / « Franceinfo » ne doivent pas faire passer une actu étrangère pour un sujet FR. */
function stripMediaBrandNoise(hay) {
  return String(hay || "")
    .replace(/\bfrance\s*24\b/gi, " ")
    .replace(/\bfranceinfo\b/gi, " ")
    .replace(/\bfrance[\s-]?info\b/gi, " ")
    .replace(/\ble\s+figaro\b/gi, " ")
    .replace(/\beurope\s*1\b/gi, " ");
}

function isWeakLeadActuTopic(input) {
  var hay = stripMediaBrandNoise(textBlob(input)).toLowerCase();
  if (!hay.trim()) return true;
  if (/visite officielle/.test(hay) && !/\bfrance\b|\bparis\b|\bmacron\b/.test(hay)) return true;
  if (
    /\b(guinéen|guineen|ivoirien)\b/.test(hay) &&
    !/\bfrance\b|\bassurance\b|\bmutuelle\b|\bpr[eê]t\b/.test(hay)
  ) {
    return true;
  }
  return false;
}

function isInternationalAudienceTopic(input) {
  var hay = stripMediaBrandNoise(textBlob(input));
  return INTL_TOPIC_PATTERNS.some(function (re) {
    return re.test(hay);
  });
}

function isFranceMarketTopic(input) {
  var hay = stripMediaBrandNoise(textBlob(input));
  return FRANCE_MARKET_PATTERNS.some(function (re) {
    return re.test(hay);
  });
}

function isInternationalActuArticle(article) {
  if (!article) return false;
  if (article.audience === "international") return true;
  if (article.audience === "france") return false;
  if (article.file && INTL_ACTU_FILES.has(article.file)) return true;
  if (article.section !== "actu") return false;
  return isInternationalAudienceTopic(article) && !isFranceMarketTopic(article);
}

function robotsMetaForArticle(article) {
  if (isInternationalActuArticle(article)) {
    return "noindex,follow";
  }
  return "index,follow";
}

function franceLeadScoreAdjust(candidate) {
  var title = String(candidate.title || "").toLowerCase();
  var summary = String(candidate.summary || "").toLowerCase();
  var hay = stripMediaBrandNoise(title + " " + summary);
  var delta = 0;

  if (isWeakLeadActuTopic(hay)) delta -= 50;

  if (isInternationalAudienceTopic(hay) && !/\bfrance\b|\bfrançais|\bfrancais|\bparis\b|\béquipe de france|\bequipe de france/i.test(hay)) {
    delta -= 45;
  }

  if (isFranceMarketTopic(hay)) delta += 25;

  ["mutuelle", "assurance", "habitation", "emprunteur", "orias", "sinistre", "crédit immo", "credit immo"].forEach(function (kw) {
    if (hay.indexOf(kw) !== -1) delta += 10;
  });

  return delta;
}

module.exports = {
  INTL_ACTU_FILES: INTL_ACTU_FILES,
  isInternationalAudienceTopic: isInternationalAudienceTopic,
  isFranceMarketTopic: isFranceMarketTopic,
  isWeakLeadActuTopic: isWeakLeadActuTopic,
  stripMediaBrandNoise: stripMediaBrandNoise,
  isInternationalActuArticle: isInternationalActuArticle,
  robotsMetaForArticle: robotsMetaForArticle,
  franceLeadScoreAdjust: franceLeadScoreAdjust,
};
