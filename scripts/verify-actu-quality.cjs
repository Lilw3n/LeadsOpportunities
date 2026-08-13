#!/usr/bin/env node
/**
 * Contrôle qualité articles actu avant publication.
 * Usage: node scripts/verify-actu-quality.cjs [--file=path] [--stdin]
 */
const fs = require("fs");
const path = require("path");

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

function readStdinTrimmed() {
  if (process.stdin.isTTY) return "";
  try {
    return fs.readFileSync(0, "utf8").trim();
  } catch (e) {
    return "";
  }
}

function articlesFromJson(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.articles)) return raw.articles;
  if (raw && typeof raw === "object") return [raw];
  return [];
}

function loadPendingArticles() {
  var pending = path.join(__dirname, "..", "data", "blog-actu-pending.json");
  try {
    var data = JSON.parse(fs.readFileSync(pending, "utf8"));
    return data.articles || [];
  } catch (e) {
    console.error("Lecture pending:", e.message);
    process.exit(1);
  }
}

function main() {
  var file = arg("file");
  var wantStdin = process.argv.indexOf("--stdin") !== -1;
  var articles = [];

  if (file) {
    var raw = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
    articles = articlesFromJson(raw);
  } else {
    var stdin = readStdinTrimmed();
    if (stdin) {
      try {
        articles = articlesFromJson(JSON.parse(stdin));
      } catch (e) {
        if (wantStdin) {
          console.error("JSON stdin invalide:", e.message);
          process.exit(1);
        }
        articles = [];
      }
    } else if (wantStdin) {
      console.log("Aucun article à vérifier (stdin vide).");
      process.exit(0);
    }
    if (!articles.length) {
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
