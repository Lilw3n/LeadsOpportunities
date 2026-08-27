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

function loadPendingArticles() {
  var pending = path.join(__dirname, "..", "data", "blog-actu-pending.json");
  var data = JSON.parse(fs.readFileSync(pending, "utf8"));
  return data.articles || [];
}

function parseArticlesJson(raw, source) {
  if (!raw || !String(raw).trim()) {
    throw new Error("JSON vide (" + source + ")");
  }
  var parsed = JSON.parse(raw);
  return parsed.articles || (Array.isArray(parsed) ? parsed : [parsed]);
}

function main() {
  var file = arg("file");
  var forceStdin = process.argv.indexOf("--stdin") !== -1;
  var articles = [];

  if (file) {
    articles = parseArticlesJson(fs.readFileSync(path.resolve(file), "utf8"), file);
  } else if (forceStdin || !process.stdin.isTTY) {
    var stdin = "";
    try {
      stdin = fs.readFileSync(0, "utf8");
    } catch (e) {
      stdin = "";
    }
    if (String(stdin).trim()) {
      articles = parseArticlesJson(stdin, "stdin");
    } else if (forceStdin) {
      console.error("stdin vide (--stdin).");
      process.exit(1);
    } else {
      try {
        articles = loadPendingArticles();
      } catch (e) {
        console.error("Lecture pending:", e.message);
        process.exit(1);
      }
    }
  } else {
    try {
      articles = loadPendingArticles();
    } catch (e) {
      console.error("Lecture pending:", e.message);
      process.exit(1);
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
