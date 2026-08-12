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

const JUNK_TITLE_PATTERNS = [
  /\bcollez\s+ici\b/i,
  /\bcoll(ez|er)\s+ici\b/i,
  /\btitre\s+de\s+la\s+une\b/i,
  /\bplaceholder\b/i,
  /\bTODO\b/,
  /\bXXX+\b/,
  /\blorem\s+ipsum\b/i,
  /^\s*\[.*\]\s*$/,
  /^\s*test\s*$/i,
];

/** Titres anglais (communiqués) sans angle FR lisible — à exclure du pipeline leads FR. */
function looksMostlyEnglishTitle(title) {
  var t = String(title || "").trim();
  if (!t || t.length < 24) return false;
  if (/[àâäéèêëïîôùûüçœæ]/i.test(t)) return false;
  if (
    /\b(la|le|les|des|une|du|aux|sur|pour|avec|dans|france|français|francais|mutuelle|assurances?|emprunteur|canicule|sinistre|habitation|banque de france)\b/i.test(
      t
    )
  ) {
    return false;
  }
  var words = t.split(/\s+/).filter(Boolean);
  if (words.length < 5) return false;
  var englishHits = 0;
  var eng = /^(the|a|an|of|to|for|in|on|and|or|with|into|regarding|potential|sale|enters|enters|memorandum|understanding|regarding|advantages|getting|money|talk)$/i;
  words.forEach(function (w) {
    if (eng.test(w.replace(/[^a-zA-Z']/g, ""))) englishHits++;
  });
  return englishHits >= 3;
}

function isJunkActuCandidate(candidate) {
  var title = String((candidate && candidate.title) || "");
  var summary = String((candidate && candidate.summary) || "");
  if (!title.trim() || title.trim().length < 18) return true;
  if (JUNK_TITLE_PATTERNS.some(function (re) {
    return re.test(title);
  })) {
    return true;
  }
  // Blog leads FR : pas de communiqués 100 % anglais (même si angle France).
  if (looksMostlyEnglishTitle(title)) return true;
  return false;
}

function franceLeadScoreAdjust(candidate) {
  var title = String(candidate.title || "").toLowerCase();
  var summary = String(candidate.summary || "").toLowerCase();
  var hay = title + " " + summary;
  var delta = 0;

  if (isJunkActuCandidate(candidate)) delta -= 80;

  if (isInternationalAudienceTopic(hay) && !/\bfrance\b|\bfrançais|\bfrancais|\bparis\b|\béquipe de france|\bequipe de france/i.test(hay)) {
    delta -= 45;
  }

  if (isFranceMarketTopic(hay)) delta += 25;

  ["mutuelle", "assurance", "habitation", "emprunteur", "orias", "sinistre", "crédit immo", "credit immo", "canicule", "prime"].forEach(function (kw) {
    if (hay.indexOf(kw) !== -1) delta += 10;
  });

  if (looksMostlyEnglishTitle(candidate.title || "")) delta -= 35;

  return delta;
}

module.exports = {
  INTL_ACTU_FILES: INTL_ACTU_FILES,
  isInternationalAudienceTopic: isInternationalAudienceTopic,
  isFranceMarketTopic: isFranceMarketTopic,
  isInternationalActuArticle: isInternationalActuArticle,
  robotsMetaForArticle: robotsMetaForArticle,
  franceLeadScoreAdjust: franceLeadScoreAdjust,
  isJunkActuCandidate: isJunkActuCandidate,
  looksMostlyEnglishTitle: looksMostlyEnglishTitle,
};
