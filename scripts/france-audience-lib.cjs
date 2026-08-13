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
  /\bfrançais\b/i,
  /\bfrancais\b/i,
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
  /\bnancy\b/i,
  /\bmeurthe\b/i,
  /\blorraine\b/i,
  /\bmartinique\b/i,
  /\bguadeloupe\b/i,
  /\br[eé]union\b/i,
  /\bdom-tom\b/i,
  /\boutre-mer\b/i,
  /\bfort-de-france\b/i,
  /\bpointe[- ]a[- ]pitre\b/i,
  /\bcr[eé]dit conso/i,
  /\bpr[eê]t consommation/i,
  /\bpr[eê]t personnel/i,
  /\bcode de la consommation/i,
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
  ]
    .filter(Boolean)
    .join(" ");
}

function isInternationalAudienceTopic(input) {
  var hay = textBlob(input);
  return INTL_TOPIC_PATTERNS.some(function (re) {
    return re.test(hay);
  });
}

function isFranceMarketTopic(input) {
  var hay = textBlob(input);
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
  var hay = title + " " + summary;
  var delta = 0;

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
  isInternationalActuArticle: isInternationalActuArticle,
  robotsMetaForArticle: robotsMetaForArticle,
  franceLeadScoreAdjust: franceLeadScoreAdjust,
};
