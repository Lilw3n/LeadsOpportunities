#!/usr/bin/env node
/**
 * Contrôle qualité articles actu avant publication.
 * Usage: node scripts/verify-actu-quality.cjs [--file=path] [--stdin]
 *
 * En CI (stdin non-TTY vide), on retombe sur data/blog-actu-pending.json
 * au lieu de JSON.parse("") qui faisait échouer le cron GitHub.
 */
const fs = require("fs");
const path = require("path");

var MIN_BLOCKS = 6;
var MIN_PARAGRAPHS = 3;
var PENDING_FILE = path.join(__dirname, "..", "data", "blog-actu-pending.json");

function arg(name) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  return m ? m.split("=").slice(1).join("=") : "";
}

function readStdinRaw() {
  if (process.stdin.isTTY) return "";
  try {
    return fs.readFileSync(0, "utf8").trim();
  } catch (e) {
    return "";
  }
}

function articlesFromJson(raw, label) {
  try {
    var parsed = JSON.parse(raw);
    return parsed.articles || (Array.isArray(parsed) ? parsed : [parsed]);
  } catch (e) {
    console.error("JSON invalide (" + label + "):", e.message);
    process.exit(1);
  }
}

function loadPendingArticles() {
  try {
    var data = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
    return data.articles || [];
  } catch (e) {
    console.error("Lecture pending:", e.message);
    process.exit(1);
  }
}

function validateArticle(article) {
  var errors = [];
  if (!article || !article.title) errors.push("titre manquant");
  if (article && /COLLEZ ICI|placeholder|titre de la une/i.test(String(article.title || ""))) {
    errors.push("titre placeholder (modele inbox)");
  }
  if (!article || !article.file) errors.push("file manquant");
  if (!article || !article.blocks || !article.blocks.length) {
    errors.push("blocks vides");
    return errors;
  }
  if (article.blocks.length < MIN_BLOCKS) {
    errors.push("blocks < " + MIN_BLOCKS + " (" + article.blocks.length + ")");
  }
  var paragraphs = article.blocks.filter(function (b) {
    return b.type === "p";
  }).length;
  if (paragraphs < MIN_PARAGRAPHS) {
    errors.push("paragraphes < " + MIN_PARAGRAPHS);
  }
  var hasBridge = article.blocks.some(function (b) {
    return b.type === "bridge";
  });
  if (!hasBridge) errors.push("bridge CTA manquant");
  var hasH2 = article.blocks.some(function (b) {
    return b.type === "h2";
  });
  if (!hasH2) errors.push("sous-titres h2 manquants");
  if (!article.cta || !article.cta.href) errors.push("cta manquant");
  else if (article.cta.href.indexOf("utm_medium=actu_daily") === -1) {
    errors.push("utm_medium=actu_daily absent du CTA");
  }
  if (!article.description || article.description.length < 80) {
    errors.push("meta description trop courte");
  }
  return errors;
}

function main() {
  var file = arg("file");
  var wantStdin = process.argv.indexOf("--stdin") !== -1;
  var articles = [];

  if (file) {
    var raw = fs.readFileSync(path.resolve(file), "utf8");
    articles = articlesFromJson(raw, file);
  } else {
    var stdinRaw = wantStdin || !process.stdin.isTTY ? readStdinRaw() : "";
    if (stdinRaw) {
      articles = articlesFromJson(stdinRaw, "stdin");
    } else if (wantStdin) {
      console.error("JSON stdin vide (--stdin).");
      process.exit(1);
    } else {
      articles = loadPendingArticles();
    }
  }

  if (!articles.length) {
    console.log("Aucun article à vérifier.");
    process.exit(0);
  }

  var ok = true;
  articles.forEach(function (a) {
    var errs = validateArticle(a);
    if (errs.length) {
      ok = false;
      console.log("[FAIL]", a.file || "?", "—", errs.join("; "));
    } else {
      console.log("[OK]", a.file, "—", a.blocks.length, "blocs");
    }
  });

  if (!ok) {
    console.error("\nQualité insuffisante — publication annulée.");
    process.exit(1);
  }
  console.log("\nQualité OK (" + articles.length + " article(s)).");
}

main();
