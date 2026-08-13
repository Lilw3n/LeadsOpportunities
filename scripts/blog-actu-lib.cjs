/**
 * Bibliothèque pipeline articles actu → assurance (leads qualifiés).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");
const { loadPendingArticles, appendPendingArticle, stripForManifest } = require("./blog-actu-pending.cjs");
const { franceLeadScoreAdjust, isFranceMarketTopic } = require("./france-audience-lib.cjs");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2) + "\n");
}

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function existingFiles() {
  var files = new Set();
  try {
    var manifest = require("./blog-articles-manifest.cjs");
    manifest.articles.forEach(function (a) {
      files.add(a.file);
    });
  } catch (e) {}
  var pending = readJson("blog-actu-pending.json", { articles: [] });
  (pending.articles || []).forEach(function (a) {
    files.add(a.file);
  });
  try {
    fs.readdirSync(path.join(ROOT, "blog")).forEach(function (f) {
      if (f.endsWith(".html") && f !== "index.html") files.add(f);
    });
  } catch (e) {}
  return files;
}

function keywordMatches(hay, kw) {
  var k = String(kw || "")
    .toLowerCase()
    .trim();
  if (!k) return false;
  var escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (k.length <= 5) {
    var re = new RegExp("(^|[^a-z0-9àâäéèêëïîôùûüç])" + escaped + "([^a-z0-9àâäéèêëïîôùûüç]|$)", "i");
    return re.test(hay);
  }
  if (hay.indexOf(k) === -1) return false;
  if (k === "équipe de france" || k === "equipe de france") {
    if (/[ée]quipe de france t[ée]l[ée]visions/i.test(hay)) return false;
  }
  return true;
}

function matchTopic(text) {
  var cfg = readJson("blog-actu-keywords.json", { rules: [], default: {}, leadCta: {} });
  var hay = String(text || "").toLowerCase();
  var best = null;
  var bestScore = 0;
  (cfg.rules || []).forEach(function (rule) {
    var score = 0;
    (rule.keywords || []).forEach(function (kw) {
      if (keywordMatches(hay, kw)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  });
  var picked = best || cfg.default || { section: "actu", need: "habitation", tag: "Actu", tagClass: "tag-actu" };
  var cta = (cfg.leadCta || {})[picked.need] || cfg.leadCta.habitation;
  return {
    section: picked.section,
    need: picked.need,
    tag: picked.tag,
    tagClass: picked.tagClass || "tag-actu",
    cta: cta,
    matched: bestScore > 0,
  };
}

function hasLeadKeywords(text) {
  return /assurance|mutuelle|emprunteur|sinistre|pr[eê]t|cr[eé]dit|habitation|rembours|garantie|locataire|v[eé]t[eé]rinaire|franchise|orias|lemoine|pr[eé]voyance|rc pro/i.test(
    String(text || "")
  );
}

function isWeakLeadCandidate(c) {
  var hay = String((c && c.title) || "") + " " + String((c && c.summary) || "") + " " + String((c && c.note) || "");
  if (hasLeadKeywords(hay)) return false;
  if (/[ée]clipse|astronomie|chasseurs d['’][ée]clipse/i.test(hay)) return true;
  var topic = matchTopic(hay);
  if (!topic.matched) return true;
  if (topic.tag === "Actu" && topic.need === "habitation") return true;
  return false;
}

function uniqueFile(baseSlug) {
  var files = existingFiles();
  var slug = baseSlug;
  var n = 2;
  while (files.has(slug + ".html")) {
    slug = baseSlug.slice(0, 60) + "-" + n;
    n += 1;
  }
  return slug + ".html";
}

function monthLabel() {
  var months = ["Jan", "Fev", "Mars", "Avr", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"];
  var d = new Date();
  return months[d.getMonth()] + " " + d.getFullYear();
}

/** Score 0–100 : potentiel lead questionnaire */
function scoreLeadPotential(candidate) {
  var score = 0;
  var title = String(candidate.title || "").toLowerCase();
  var need = candidate.need || "";

  if (candidate.status === "queued") score += 25;
  if (candidate.sourceType === "cafeyn" || candidate.sourceType === "edge" || candidate.sourceType === "firefox") {
    score += 12;
  }
  if (need === "sante" || need === "emprunteur" || need === "habitation" || need === "auto") score += 20;
  if (need === "vtc" || need === "animaux" || need === "prevoyance") score += 15;

  ["assurance", "mutuelle", "emprunteur", "sinistre", "pret", "prêt", "rembours", "garantie"].forEach(function (kw) {
    if (title.indexOf(kw) !== -1) score += 8;
  });

  var hay = title + " " + String(candidate.summary || "").toLowerCase();
  if (isFranceMarketTopic(hay) || /équipe de france|equipe de france|les bleus|mbapp/i.test(hay)) {
    [
      "coupe du monde",
      "mondial",
      "mbappe",
      "mbappé",
      "deschamps",
      "équipe de france",
      "equipe de france",
      "supporters",
      "match france",
      "les bleus",
    ].forEach(function (kw) {
      if (title.indexOf(kw) !== -1) score += 14;
    });
  }

  score += franceLeadScoreAdjust(candidate);

  if (isWeakLeadCandidate(candidate)) score -= 40;

  if (title.indexOf("chomage") !== -1 && title.indexOf("assurance") === -1) score -= 15;

  if (candidate.pubDate) {
    var age = Date.now() - new Date(candidate.pubDate).getTime();
    if (age < 3 * 86400000) score += 12;
    else if (age < 7 * 86400000) score += 6;
  }

  return Math.min(100, Math.max(0, score));
}

function rankCandidates(candidates) {
  return candidates
    .map(function (c) {
      return Object.assign({}, c, { leadScore: scoreLeadPotential(c) });
    })
    .sort(function (a, b) {
      return b.leadScore - a.leadScore;
    });
}

function ctaWithUtm(need, slug) {
  var cfg = readJson("blog-actu-keywords.json", { leadCta: {} });
  var base = cfg.leadCta[need] || cfg.leadCta.habitation;
  var content = slugify(slug || need).slice(0, 40);
  return {
    href:
      base.href +
      (base.href.indexOf("?") === -1 ? "?" : "&") +
      "utm_source=blog&utm_medium=actu_daily&utm_campaign=" +
      encodeURIComponent(need) +
      "&utm_content=" +
      encodeURIComponent(content),
    label: base.label,
  };
}

function scaffoldArticle(input) {
  var title = String(input.title || "").trim();
  if (!title) return null;
  var topic = matchTopic(title + " " + (input.summary || "") + " " + (input.note || ""));
  var baseSlug = slugify(title);
  if (!baseSlug) baseSlug = "actu-assurance-" + Date.now();
  var file = uniqueFile(baseSlug);
  var insuranceAngle =
    topic.section === "actu"
      ? "assurance et pret immobilier"
      : topic.tag.toLowerCase();

  var shortTitle = title.length > 85 ? title.slice(0, 82) + "…" : title;

  return {
    file: file,
    section: topic.section,
    tag: topic.tag,
    tagClass: topic.tagClass,
    title: shortTitle + " : impact " + insuranceAngle + " (conseils 2026)",
    description:
      title +
      " — ce que cette actualite change pour votre couverture assurance. Conseils courtier ORIAS, questionnaire gratuit.",
    meta: "7 min · " + monthLabel(),
    cardExcerpt: title.slice(0, 120) + " — lien concret avec votre assurance.",
    cta: topic.cta,
    source: {
      name: input.source || input.feedName || "manual",
      url: input.url || "",
      fetchedAt: new Date().toISOString(),
    },
    blocks: [
      {
        type: "p",
        text:
          "L'actualite <strong>" +
          title.replace(/</g, "") +
          "</strong> rappelle un point souvent neglige : <strong>votre contrat d'assurance est-il encore adapte</strong> a votre situation ? Chez Leads Opportunities, chaque sujet du moment se traduit en risques concrets (habitation, sante, auto, emprunteur, prevoyance) et en actions simples avant un sinistre ou un renouvellement.",
      },
      {
        type: "h2",
        text: "Ce que cette actu change pour vous",
      },
      {
        type: "p",
        text:
          "Au-dela du titre, posez-vous trois questions : <strong>1)</strong> quel bien ou revenu est expose ? <strong>2)</strong> quelle garantie du contrat actuel s'applique (ou pas) ? <strong>3)</strong> faut-il mettre a jour les declarations, comparer a garanties equivalentes, ou souscrire une option manquante ?",
      },
      { type: "bridge" },
      {
        type: "h2",
        text: "Checklist assurance (5 minutes)",
      },
      {
        type: "ul",
        items: [
          "Relire les plafonds, franchises et exclusions du contrat en vigueur",
          "Verifier que les declarations (valeur mobilier, usage logement, km auto) sont a jour",
          "Comparer au moins deux offres a garanties equivalentes avant la prochaine echeance",
          "Garder une trace des echanges assureur (mails, courriers) en cas de litige",
          "Utiliser un questionnaire guide pour cibler le bon niveau de couverture",
        ],
      },
      {
        type: "p",
        text:
          "Notre <strong>questionnaire gratuit</strong> (3 a 6 minutes) oriente vers le parcours adapte — sans engagement. Un courtier ORIAS peut ensuite affiner avec April, AXA, Allianz, Generali, Zephir et le reste du marche.",
      },
    ],
    related: relatedForSection(topic.section, topic.need),
    _scaffold: true,
    _needsAgentEnrichment: true,
  };
}

function relatedForSection(section, need) {
  var map = {
    sante: [
      { href: "./mutuelle-sante-5-criteres.html", label: "5 criteres mutuelle" },
      { href: "../assurance-sante/comparatif/", label: "Comparatif mutuelle" },
    ],
    habitat: [
      { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Guide habitation" },
      { href: "../assurance-habitation/", label: "Assurance habitation" },
    ],
    auto: [
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus" },
      { href: "../assurance-auto/", label: "Assurance auto" },
    ],
    animaux: [
      { href: "./assurance-animaux-comment-choisir.html", label: "Choisir assurance animaux" },
      { href: "../assurance-animaux/", label: "Assurance animaux" },
    ],
    vtc: [
      { href: "./assurance-vtc-moins-cher-2026.html", label: "VTC moins cher" },
      { href: "../assurance-vtc/", label: "Assurance VTC" },
    ],
    finance: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
      { href: "../assurance-emprunteur/", label: "Assurance emprunteur" },
    ],
    prevoyance: [
      { href: "./prevoyance-independants-guide.html", label: "Prevoyance independants" },
      { href: "../assurance-prevoyance/", label: "Assurance prevoyance" },
    ],
    actu: [
      { href: "./coupe-monde-2026-assurance-voyage-sante.html", label: "CDM 2026 — voyage & sante" },
      { href: "./coupe-monde-voyage-assurance-sante-etranger-2026.html", label: "Mutuelle a l'etranger" },
      { href: "./ligue-champions-assurance-voyage-deplacement.html", label: "Voyage & assurance" },
      { href: "../assurances/", label: "Toutes nos assurances" },
      { href: "./index.html", label: "Blog assurance" },
    ],
  };
  return map[section] || map.actu;
}


function parseRssItems(xml) {
  var items = [];
  var re = /<item[\s>]([\s\S]*?)<\/item>/gi;
  var m;
  while ((m = re.exec(xml))) {
    var block = m[1];
    var title = extractTag(block, "title");
    var link = extractTag(block, "link");
    var desc = extractTag(block, "description");
    var pub = extractTag(block, "pubDate");
    if (title) {
      items.push({
        title: decodeEntities(stripHtml(title)),
        url: decodeEntities(link || ""),
        summary: decodeEntities(stripHtml(desc || "")).slice(0, 400),
        pubDate: pub || "",
      });
    }
  }
  return items;
}

function extractTag(block, tag) {
  var re = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
  var m = block.match(re);
  return m ? m[1].trim() : "";
}

function isPlaceholderCandidate(c) {
  var title = String((c && c.title) || "");
  var id = String((c && c.id) || "");
  if (id === "cafeyn-pending-template") return true;
  if (/collez ici|placeholder|\[titre\]|TODO\s*:/i.test(title)) return true;
  return false;
}

function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    })
    .replace(/&#(\d+);/g, function (_, num) {
      return String.fromCharCode(parseInt(num, 10));
    })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

module.exports = {
  readJson: readJson,
  writeJson: writeJson,
  slugify: slugify,
  existingFiles: existingFiles,
  uniqueFile: uniqueFile,
  matchTopic: matchTopic,
  scaffoldArticle: scaffoldArticle,
  stripForManifest: stripForManifest,
  loadPendingArticles: loadPendingArticles,
  appendPendingArticle: appendPendingArticle,
  parseRssItems: parseRssItems,
  monthLabel: monthLabel,
  scoreLeadPotential: scoreLeadPotential,
  rankCandidates: rankCandidates,
  ctaWithUtm: ctaWithUtm,
  relatedForSection: relatedForSection,
  isPlaceholderCandidate: isPlaceholderCandidate,
  hasLeadKeywords: hasLeadKeywords,
  isWeakLeadCandidate: isWeakLeadCandidate,
};
