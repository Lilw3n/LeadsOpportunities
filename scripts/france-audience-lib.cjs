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

var LEAD_INTENT_RE =
  /mutuelle|assurance|emprunteur|sinistre|habitation|inondation|canicule|orages?|alerte orange|s[eé]cheresse|cr[eé]dit|pr[eê]t immobil|rembours|ost[eé]opath|hospitalisation|vtc\b|animaux|v[eé]t[eé]rinair|catastrophe naturelle|loi lemoine|orias|franchise|pr[eé]voyance|piratage|cyberattaque|iban|assurance-vie|epargne/i;

var FOREIGN_DISASTER_RE =
  /\bnépal\b|\bnepal\b|\btibet\b|\bukraine\b|\bgaza\b|\bsyrie\b|\biran\b|\birak\b|\by[eé]men\b|\bsoudan\b|\bha[iï]ti\b/i;

function looksLikeEnglishTitle(title) {
  var t = String(title || "");
  var enHits = (
    t.match(
      /\b(the|and|into|of|for|with|regarding|potential|sale|enters|memorandum|understanding|what|you|need|know|about|health|insurance|advantages|getting)\b/gi
    ) || []
  ).length;
  var frHits = (
    t.match(
      /\b(le|la|les|des|une|un|du|de la|dans|pour|avec|sur|aux|france|assurance|mutuelle|quel|quelle|contre|apr[eè]s)\b/gi
    ) || []
  ).length;
  return enHits >= 3 && enHits > frHits;
}

function isStalePubDate(pubDate, maxDays) {
  if (!pubDate) return false;
  var t = Date.parse(pubDate);
  if (!t) return false;
  var days = (Date.now() - t) / 86400000;
  return days > (maxDays || 90);
}

function hasFranceLeadIntent(candidate) {
  var hay = String((candidate && candidate.title) || "") + " " + String((candidate && candidate.summary) || "");
  return LEAD_INTENT_RE.test(hay);
}

function isLowQualityLeadCandidate(candidate) {
  if (!candidate) return true;
  var title = String(candidate.title || "");
  var hay = title + " " + String(candidate.summary || "");
  if (looksLikeEnglishTitle(title)) return true;
  if (/^\s*en direct\b/i.test(title)) return true;
  if (FOREIGN_DISASTER_RE.test(hay)) return true;
  if (isStalePubDate(candidate.pubDate, 90)) return true;
  if (/obtenez un devis avec mutuelle\.fr|la r[eé]daction du parisien n'a pas particip[eé]/i.test(hay)) {
    return true;
  }
  if (
    /openai|anthropic|g[eé]ants de la tech|r[eé]ponse mondiale/i.test(hay) &&
    !/mutuelle|iban|assur[ée]s?\b/i.test(hay)
  ) {
    return true;
  }
  if (!hasFranceLeadIntent(candidate)) return true;
  return false;
}

function franceLeadScoreAdjust(candidate) {
  var title = String(candidate.title || "").toLowerCase();
  var summary = String(candidate.summary || "").toLowerCase();
  var hay = title + " " + summary;
  var delta = 0;

  if (isInternationalAudienceTopic(hay) && !/\bfrance\b|\bfrançais|\bfrancais|\bparis\b|\béquipe de france|\bequipe de france/i.test(hay)) {
    delta -= 45;
  }

  if (isLowQualityLeadCandidate(candidate)) delta -= 80;

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
  looksLikeEnglishTitle: looksLikeEnglishTitle,
  isLowQualityLeadCandidate: isLowQualityLeadCandidate,
  hasFranceLeadIntent: hasFranceLeadIntent,
};
