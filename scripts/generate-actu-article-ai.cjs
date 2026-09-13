#!/usr/bin/env node
/**
 * Génère un article blog JSON via Gemini/OpenAI à partir d'un candidat actu.
 * Usage: node scripts/generate-actu-article-ai.cjs --title="..." --need=sante
 */
const { generateWithFallback } = require("../api/_lib/ai-provider-router.js");
const { ctaWithUtm, monthLabel, relatedForSection, matchTopic, slugify, uniqueFile } = require("./blog-actu-lib.cjs");
const { isSportActu } = require("./blog-actu-enrich.cjs");

function arg(name) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  return m ? m.split("=").slice(1).join("=") : "";
}

function buildPrompt(candidate) {
  var topic = matchTopic(candidate.title + " " + (candidate.summary || ""));
  var need = candidate.need || topic.need;
  var platform = candidate.sourceType || candidate.source || "actu";
  var sportBlock = "";
  if (isSportActu(candidate.title + " " + (candidate.summary || ""))) {
    need = "sante";
    sportBlock =
      "\nContexte COUPE DU MONDE 2026 : accroche sur matchs actuels, supporters, joueurs iconiques (Mbappe, Deschamps, Bleus…).\n" +
      "Angle OBLIGATOIRE Leads Opportunities : assurance voyage / mutuelle a l'etranger (USA, Mexique, Canada), " +
      "habitation vide pendant deplacement, auto garee, annulation voyage. Pas un article sportif pur — toujours lien questionnaire sante.\n" +
      'Tag JSON: "Coupe du monde 2026"\n';
  }
  return (
    "Tu es redacteur SEO pour Leads Opportunities, courtier ORIAS assurance en France.\n" +
    "A partir de cette actualite, redige un article ORIGINAL (ne copie pas le journal) qui convertit vers un questionnaire.\n\n" +
    "ACTU:\nTitre: " +
    candidate.title +
    "\nResume: " +
    (candidate.summary || "") +
    "\nPlateforme source: " +
    platform +
    " (Cafeyn, Edge, Firefox, Google News, Bing News ou Yahoo)\nNeed questionnaire: " +
    need +
    sportBlock +
    "\n" +
    "Reponds UNIQUEMENT en JSON valide (pas de markdown):\n" +
    "{\n" +
    '  "title": "titre H1 accrocheur max 90 caracteres",\n' +
    '  "description": "meta description 150 caracteres",\n' +
    '  "cardExcerpt": "1 phrase carte blog",\n' +
    '  "tag": "badge court",\n' +
    '  "blocks": [\n' +
    '    {"type":"p","text":"..."},\n' +
    '    {"type":"h2","text":"..."},\n' +
    '    {"type":"ul","items":["...","..."]},\n' +
    '    {"type":"bridge"}\n' +
    "  ]\n" +
    "}\n\n" +
    "Regles: 8 a 12 blocs, ton conseiller, angle assurance concret, mentionner questionnaire gratuit, pas de plagiat."
  );
}

function parseJsonFromText(text) {
  var raw = String(text || "").trim();
  var start = raw.indexOf("{");
  var end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON introuvable dans reponse IA");
  return JSON.parse(raw.slice(start, end + 1));
}

async function generateActuArticleAi(candidate) {
  var res = await generateWithFallback(buildPrompt(candidate), 4096);
  if (!res.success) {
    return { ok: false, error: res.error };
  }
  var parsed = parseJsonFromText(res.text);
  var topic = matchTopic(candidate.title);
  var need = candidate.need || topic.need;
  var baseSlug = slugify(candidate.title) || "actu-" + Date.now();
  var file = candidate.suggestedFile || uniqueFile(baseSlug);
  if (!file.endsWith(".html")) file += ".html";

  return {
    ok: true,
    provider: res.provider,
    article: {
      file: file,
      section: topic.section,
      tag: parsed.tag || topic.tag,
      tagClass: topic.tagClass,
      title: parsed.title,
      description: parsed.description,
      meta: "8 min · " + monthLabel(),
      cardExcerpt: parsed.cardExcerpt || parsed.description,
      cta: ctaWithUtm(need, baseSlug),
      blocks: parsed.blocks || [],
      related: relatedForSection(topic.section, need),
    },
  };
}

async function main() {
  var candidate = {
    title: arg("title"),
    summary: arg("summary"),
    need: arg("need"),
    suggestedFile: arg("file"),
  };
  if (!candidate.title) {
    console.error("Usage: --title=... [--summary=] [--need=sante]");
    process.exit(1);
  }
  var out = await generateActuArticleAi(candidate);
  if (!out.ok) {
    console.error(out.error);
    process.exit(1);
  }
  console.log(JSON.stringify(out.article, null, 2));
}

if (require.main === module) {
  main().catch(function (e) {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { generateActuArticleAi: generateActuArticleAi };
