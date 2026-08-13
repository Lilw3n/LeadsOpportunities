#!/usr/bin/env node
/**
 * Pipeline 100 % auto : fetch (RSS Cafeyn/Edge/Firefox + Pocket) → rédaction → publish.
 *
 * Usage:
 *   npm run blog:actu:auto
 *   npm run blog:actu:auto -- --count=2
 *   npm run blog:actu:auto -- --dry-run
 *   npm run blog:actu:auto -- --no-ai
 */
const { execSync } = require("child_process");
const path = require("path");
const {
  readJson,
  writeJson,
  rankCandidates,
  appendPendingArticle,
  isJunkActuTitle,
  isLowConversionActuTitle,
  slugify,
} = require("./blog-actu-lib.cjs");
const { isInternationalAudienceTopic, isFranceMarketTopic } = require("./france-audience-lib.cjs");
const { enrichFromCandidate } = require("./blog-actu-enrich.cjs");
const { generateActuArticleAi } = require("./generate-actu-article-ai.cjs");

var MIN_PLATFORM_LEAD_SCORE = 40;

/** Unes déjà couvertes par des PR draft du jour — éviter les doublons. */
var DRAFT_SLUG_PREFIXES = [
  "acquereur-immobilier-pret-assurances-checklist-2026",
  "a-paris-cette-association-lutte-contre-l-isolement",
  "assurance-emprunteur-loi-lemoine-economies-2026",
  "assurance-habitation-certains-sinistres-doivent-attendre",
  "assurance-habitation-degats-eaux-locataire-2026",
  "assurance-habitation-des-hausses-de-tarifs-qui-atteignent",
  "assurance-habitation-incendies-de-foret-secheresses",
  "assurance-incendie-les-feux-de-foret-ne-sont-pas",
  "assurance-vtc-attestation-plateformes-2026",
  "avec-la-canicule-la-france-produit-moins-d-electricite",
  "baisses-de-remboursement-securite-sociale-les-mutuelles",
  "canicule-meteo-france-maintient-80-departements",
  "caniculeprev-fatigue-insomnies-anxiete",
  "canicules-en-france-la-ministre-de-l-ecologie",
  "canicules-en-france-un-cout-de-l-ordre-de-10",
  "c-est-comme-un-serre-tete-qui-brille",
  "c-etait-le-meilleur-spot-de-tout-paris",
  "changement-d-assurance-emprunteur-quatre-banques",
  "comparateur-mutuelle-comment-bien-choisir",
  "coupe-du-monde-2026-de-hockey",
  "coupe-du-monde-2026-france-maroc",
  "coupe-du-monde-2026-la-conference-de-presse",
  "drone-pompier-systeme-ultra-precis",
  "eclipse-ces-precautions-a-prendre",
  "eclipse-solaire",
  "en-direct-canicule",
  "en-direct-meteo",
  "en-savoie-deux-personnes-decedees-de-legionellose",
  "fabien-barthez",
  "france-conduite-sous-stupefiants",
  "gel-des-tarifs-sante",
  "hausse-des-primes-cout-des-sinistres",
  "il-pretend-que-ses-parents-lui-ont-prete-la-voiture",
  "la-prefecture-de-police-de-paris-ordonne",
  "l-eau-va-devenir-plus-chere-que-le-vin",
  "l-editorial-de-gaetan-de-capele",
  "le-parkour-geriatrique",
  "le-president-des-departements-de-france",
  "meilleure-mutuelle-sante-comment-choisir",
  "mutuelle-famille-budget-remboursements-2026",
  "nouvelle-journee-de-canicule-en-france",
  "pertes-agricoles-tresorerie",
  "quand-auront-lieu-les-prochaines-eclipses",
  "rachat-credits-rac-mensualite-2026",
  "sophrologie-quel-remboursement",
  "trottinettes-electriques-le-defaut-d-assurance",
  "equipe-de-france-zinedine-zidane",
  "equipe-de-france-le-staff-de-zinedine",
  "football-fabien-barthez",
  "hsbc-continental-europe",
  "mutuelle-en-ligne-obtenez-un-devis",
  "l-assurance-habitation-en-2025",
  "les-tarifs-de-l-assurance-habitation-grimpent",
];

function isAlreadyDrafted(title) {
  var slug = slugify(title);
  if (!slug) return false;
  return DRAFT_SLUG_PREFIXES.some(function (prefix) {
    var a = slug.slice(0, 36);
    var b = prefix.slice(0, 36);
    return slug.indexOf(b) === 0 || prefix.indexOf(a) === 0;
  });
}

var ROOT = path.join(__dirname, "..");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function hasAiKey() {
  return !!(
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY
  );
}

function loadFeedSourceMap() {
  var feedsCfg = readJson("blog-actu-feeds.json", { feeds: [] });
  var map = {};
  (feedsCfg.feeds || []).forEach(function (f) {
    map[f.id] = f.sourceType || "aggregator";
  });
  return map;
}

function normalizeTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function loadPublishedTitleKeys() {
  var keys = new Set();
  var pub = readJson("blog-actu-published.json", { articles: [] });
  (pub.articles || []).forEach(function (a) {
    keys.add(normalizeTitle(a.title));
  });
  try {
    var manifest = require("./blog-articles-manifest.cjs");
    (manifest.articles || []).forEach(function (a) {
      keys.add(normalizeTitle(a.title));
    });
  } catch (e) {}
  return keys;
}

var PLATFORM_TYPES = ["cafeyn", "edge", "firefox"];

function candidateSourceType(c, feedMap) {
  if (c.sourceType) return c.sourceType;
  var src = String(c.source || "").toLowerCase();
  if (src.indexOf("cafeyn") !== -1) return "cafeyn";
  if (src.indexOf("edge") !== -1 || src.indexOf("msn") !== -1 || src.indexOf("bing") !== -1) return "edge";
  if (src.indexOf("firefox") !== -1 || src.indexOf("pocket") !== -1) return "firefox";
  return feedMap[c.feedId] || "aggregator";
}

function isInsuranceIntent(c) {
  var hay = String(c.title || "") + " " + String(c.summary || "");
  return /assurance|mutuelle|emprunteur|sinistre|habitation|pr[eé]voyance|rembours|indemn|compl[eé]mentaire|s[eé]curit[eé] sociale|d[eé]l[eé]gation/i.test(
    hay
  );
}

function bestFromPlatform(available, platform, feedMap, used) {
  var list = available
    .filter(function (c) {
      var k = c.url || c.title;
      return (
        candidateSourceType(c, feedMap) === platform &&
        !used.has(k) &&
        (c.leadScore || 0) >= MIN_PLATFORM_LEAD_SCORE
      );
    })
    .sort(function (a, b) {
      var ia = isInsuranceIntent(a) ? 1 : 0;
      var ib = isInsuranceIntent(b) ? 1 : 0;
      if (ib !== ia) return ib - ia;
      return b.leadScore - a.leadScore;
    });
  if (!list.length) return null;
  if (!isInsuranceIntent(list[0])) return null;
  return list[0];
}

function pickCandidates(candidates, count, state) {
  var feedMap = loadFeedSourceMap();
  var processed = new Set(state.processedUrls || []);
  var titleKeys = loadPublishedTitleKeys();
  var ranked = rankCandidates(candidates);

  var available = ranked.filter(function (c) {
    if (c.url && processed.has(c.url)) return false;
    if (titleKeys.has(normalizeTitle(c.title))) return false;
    if (isJunkActuTitle(c.title) || isLowConversionActuTitle(c.title)) return false;
    if (isAlreadyDrafted(c.title)) return false;
    var hay = String(c.title || "") + " " + String(c.summary || "");
    if (isInternationalAudienceTopic(hay) && !isFranceMarketTopic(hay)) return false;
    return true;
  });

  if (!available.length) return [];

  var picks = [];
  var used = new Set();

  available
    .filter(function (c) {
      return c.status === "queued";
    })
    .slice(0, count)
    .forEach(function (c) {
      if (picks.length >= count) return;
      picks.push(c);
      used.add(c.url || c.title);
    });

  if (count >= 3) {
    PLATFORM_TYPES.forEach(function (platform) {
      if (picks.length >= count) return;
      var pick = bestFromPlatform(available, platform, feedMap, used);
      if (pick) {
        picks.push(pick);
        used.add(pick.url || pick.title);
      }
    });
    state._nextPlatformRotation = ((state.platformRotationIndex || 0) + PLATFORM_TYPES.length) % PLATFORM_TYPES.length;
  } else {
    var rot = state.platformRotationIndex || 0;
    for (var i = 0; i < count && picks.length < count; i++) {
      var platform = PLATFORM_TYPES[(rot + i) % PLATFORM_TYPES.length];
      var rotated = bestFromPlatform(available, platform, feedMap, used);
      if (rotated) {
        picks.push(rotated);
        used.add(rotated.url || rotated.title);
      }
    }
    state._nextPlatformRotation = (rot + count) % PLATFORM_TYPES.length;
  }

  function preferInsurance(list) {
    return list.slice().sort(function (a, b) {
      var ia = isInsuranceIntent(a) ? 1 : 0;
      var ib = isInsuranceIntent(b) ? 1 : 0;
      if (ib !== ia) return ib - ia;
      return (b.leadScore || 0) - (a.leadScore || 0);
    });
  }

  preferInsurance(
    available.filter(function (c) {
      return PLATFORM_TYPES.indexOf(candidateSourceType(c, feedMap)) !== -1;
    })
  ).forEach(function (c) {
    if (picks.length >= count) return;
    var k = c.url || c.title;
    if (used.has(k)) return;
    picks.push(c);
    used.add(k);
  });

  preferInsurance(available).forEach(function (c) {
    if (picks.length >= count) return;
    var k = c.url || c.title;
    if (used.has(k)) return;
    picks.push(c);
    used.add(k);
  });

  return picks;
}

function runNode(script) {
  execSync("node " + script, { stdio: "inherit", cwd: ROOT });
}

async function main() {
  var count = Math.min(5, Math.max(1, Number(arg("count", 1)) || 1));
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var skipPublish = process.argv.indexOf("--skip-publish") !== -1;
  var useAi = hasAiKey() && process.argv.indexOf("--no-ai") === -1;

  console.log("=== Auto actu publish ===");
  console.log("count:", count, "| IA:", useAi ? "oui" : "non (enrich)", "| dry-run:", dryRun);
  console.log("");

  var feedsCfg = readJson("blog-actu-feeds.json", { pocket: {} });
  if (feedsCfg.pocket && feedsCfg.pocket.enabled !== false) {
    try {
      runNode("scripts/fetch-pocket.cjs");
    } catch (e) {
      console.warn("Pocket skip:", e.message || e);
    }
  }

  try {
    runNode("scripts/fetch-actu-candidates.cjs");
  } catch (e) {
    console.warn("Fetch RSS partiel — on continue.");
  }

  var candidates = readJson("blog-actu-candidates.json", { candidates: [] }).candidates || [];
  var state = readJson("blog-actu-state.json", {
    processedUrls: [],
    publishedFiles: [],
    autoRuns: [],
  });
  var picks = pickCandidates(candidates, count, state);

  if (!picks.length) {
    console.log("Aucun candidat disponible.");
    process.exit(0);
  }

  console.log("Sélection:", picks.length, "candidat(s)");
  var published = [];
  var feedMap = loadFeedSourceMap();

  for (var i = 0; i < picks.length; i++) {
    var pick = picks[i];
    var platform = candidateSourceType(pick, feedMap);
    console.log(
      "\n[" +
        (i + 1) +
        "/" +
        picks.length +
        "] [" +
        platform.toUpperCase() +
        "] score=" +
        pick.leadScore +
        " — " +
        pick.title.slice(0, 72)
    );

    var article = null;
    if (useAi) {
      var aiRes = await generateActuArticleAi(pick);
      if (aiRes.ok) {
        article = aiRes.article;
        console.log("  Rédaction IA:", aiRes.provider);
      } else {
        console.warn("  IA:", aiRes.error, "→ enrichissement local");
        article = enrichFromCandidate(pick);
      }
    } else {
      article = enrichFromCandidate(pick);
    }

    if (!article || !article.blocks || !article.blocks.length) {
      console.warn("  Article invalide — ignoré");
      continue;
    }

    if (dryRun) {
      console.log("  [dry-run]", article.file);
      published.push({ file: article.file, title: article.title });
      continue;
    }

    appendPendingArticle(article);
    if (pick.url) {
      state.processedUrls = state.processedUrls || [];
      if (state.processedUrls.indexOf(pick.url) === -1) {
        state.processedUrls.push(pick.url);
      }
    }
    published.push({
      file: article.file,
      title: article.title,
      source: pick.feedName || pick.source || pick.feedId,
      sourceType: platform,
    });
  }

  if (!published.length) {
    console.log("Rien généré.");
    process.exit(0);
  }

  if (dryRun) {
    console.log("\nDry-run terminé —", published.length, "article(s) simulé(s).");
    process.exit(0);
  }

  if (!skipPublish) {
    if (process.env.STRICT_ACTU_QUALITY === "1" || process.argv.indexOf("--strict-quality") !== -1) {
      console.log("\n=== Contrôle qualité ===");
      try {
        execSync("node scripts/verify-actu-quality.cjs", { stdio: "inherit", cwd: ROOT });
      } catch (e) {
        console.error("Qualité insuffisante — publication annulée. Utilisez Cursor pour enrichir.");
        process.exit(1);
      }
    }
    console.log("\n=== Génération HTML + SEO ===");
    execSync("npm run blog:actu:publish", { stdio: "inherit", cwd: ROOT });
    runNode("scripts/archive-actu-pending.cjs");
  }

  state.lastAutoRun = new Date().toISOString();
  state.autoRuns = state.autoRuns || [];
  state.autoRuns.push({
    at: state.lastAutoRun,
    count: published.length,
    usedAi: useAi,
    articles: published,
  });
  if (state.autoRuns.length > 50) {
    state.autoRuns = state.autoRuns.slice(-50);
  }
  if (state._nextPlatformRotation !== undefined) {
    state.platformRotationIndex = state._nextPlatformRotation;
    delete state._nextPlatformRotation;
  }
  writeJson("blog-actu-state.json", state);

  var queue = readJson("blog-actu-queue.json", { items: [] });
  picks.forEach(function (p) {
    (queue.items || []).forEach(function (item) {
      if (item.title === p.title || (p.url && item.url === p.url)) {
        item.status = "published";
      }
    });
  });
  queue.updated = new Date().toISOString();
  writeJson("blog-actu-queue.json", queue);

  try {
    var dbIds = picks.filter(function (p) {
      return p.id && String(p.id).indexOf("ingest-") === 0;
    }).map(function (p) {
      return p.id;
    });
    if (dbIds.length) {
      var dbMod = require("./blog-actu-queue-db.cjs");
      await dbMod.markQueuePublished(dbIds);
      console.log("DB queue: marqué publié —", dbIds.length);
    }
  } catch (e) {
    console.warn("DB queue mark:", e.message);
  }

  console.log("\n✓ Publié:", published.length, "article(s)");
  published.forEach(function (p) {
    console.log("  -", p.file, "[" + (p.sourceType || "?").toUpperCase() + "]", "(" + (p.source || "?") + ")");
  });
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
