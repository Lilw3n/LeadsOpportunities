#!/usr/bin/env node
/**
 * Contrôle qualité articles actu avant publication.
 * Usage: node scripts/verify-actu-quality.cjs [--file=path] [--stdin]
 */
const fs = require("fs");
const path = require("path");
const { isPlaceholderActuItem } = require("./blog-actu-lib.cjs");

var MIN_BLOCKS = 6;
var MIN_PARAGRAPHS = 3;

function arg(name) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  return m ? m.split("=").slice(1).join("=") : "";
}

function validateArticle(article) {
  var errors = [];
  if (!article || !article.title) errors.push("titre manquant");
  if (article && isPlaceholderActuItem(article)) errors.push("titre placeholder (file Cafeyn)");
  if (!article.file) errors.push("file manquant");
  if (!article.blocks || !article.blocks.length) {
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

function readPendingArticles() {
  var pending = path.join(__dirname, "..", "data", "blog-actu-pending.json");
  var data = JSON.parse(fs.readFileSync(pending, "utf8"));
  return data.articles || [];
}

function parseJsonOrEmpty(raw, label) {
  var text = String(raw || "").trim();
  if (!text) return { empty: true };
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    console.error("JSON invalide (" + label + "):", e.message);
    process.exit(1);
  }
}

function articlesFromParsed(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.articles)) return parsed.articles;
  if (parsed && parsed.title) return [parsed];
  return [];
}

function loadArticles() {
  var file = arg("file");
  var forceStdin = process.argv.indexOf("--stdin") !== -1;

  if (file) {
    var fromFile = parseJsonOrEmpty(fs.readFileSync(path.resolve(file), "utf8"), file);
    if (fromFile.empty) return [];
    return articlesFromParsed(fromFile.value);
  }

  if (forceStdin || !process.stdin.isTTY) {
    var stdin = "";
    try {
      stdin = fs.readFileSync(0, "utf8");
    } catch (e) {
      stdin = "";
    }
    var fromStdin = parseJsonOrEmpty(stdin, "stdin");
    if (!fromStdin.empty) return articlesFromParsed(fromStdin.value);
  }

  try {
    return readPendingArticles();
  } catch (e) {
    console.error("Lecture pending:", e.message);
    process.exit(1);
  }
}

function main() {
  var articles = loadArticles();

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

if (require.main === module) {
  main();
}

module.exports = { validateArticle: validateArticle, loadArticles: loadArticles };
