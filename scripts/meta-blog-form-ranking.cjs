#!/usr/bin/env node
/**
 * Classe les articles blog pour lier formulaires Meta → contenus les plus performants.
 * Sources : ads/meta-blog-conversions.csv, config/meta-lead-forms.json, site_leads (si DATABASE_URL).
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "ads/meta-blog-conversions.csv");
const CONFIG_PATH = path.join(ROOT, "config/meta-lead-forms.json");
const ADMIN_PATH = path.join(ROOT, "data/blog-questionnaire-admin.json");
const OUT_PATH = path.join(ROOT, "data/meta-blog-form-ranking.json");

function parseCsvLine(line) {
  var parts = [];
  var cur = "";
  var inQ = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  parts.push(cur.trim());
  return parts;
}

function loadCsvPriorities() {
  if (!fs.existsSync(CSV_PATH)) return {};
  var lines = fs.readFileSync(CSV_PATH, "utf8").split(/\r?\n/).filter(Boolean);
  var map = {};
  for (var i = 1; i < lines.length; i++) {
    var cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;
    var slug = cols[2];
    if (!slug || slug === "direct_landing") continue;
    map[slug] = {
      priority: Number(cols[0]) || 99,
      vertical: cols[1],
      campaign: cols[6] || "",
      headline: cols[8] || "",
    };
  }
  return map;
}

function loadAdminTitles() {
  if (!fs.existsSync(ADMIN_PATH)) return {};
  var data = JSON.parse(fs.readFileSync(ADMIN_PATH, "utf8"));
  var map = {};
  (data.rows || []).forEach(function (r) {
    var slug = String(r.file || "").replace(/\.html$/, "");
    if (slug) map[slug] = { title: r.title, section: r.section, need: r.need };
  });
  return map;
}

async function loadLeadCountsBySlug() {
  var dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return {};
  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    var rows = await sql`
      SELECT payload, source, created_at
      FROM site_leads
      ORDER BY created_at DESC
      LIMIT 5000
    `;
    var counts = {};
    rows.forEach(function (row) {
      var payload = {};
      try {
        payload = row.payload ? JSON.parse(row.payload) : {};
      } catch (e) {}
      var hay =
        String(payload.landing_path || "") +
        " " +
        String(payload.referrer || "") +
        " " +
        String(payload.landing_slug || "") +
        " " +
        JSON.stringify(payload).slice(0, 4000);
      var m = hay.match(/\/blog\/([a-z0-9-]+)\.html/i);
      if (m) {
        counts[m[1]] = (counts[m[1]] || 0) + 1;
      }
    });
    return counts;
  } catch (e) {
    console.warn("[meta-blog-ranking] DB skip:", e.message);
    return {};
  }
}

function scoreArticle(slug, csvInfo, leadCount, adminInfo) {
  var score = 0;
  if (csvInfo) score += Math.max(0, 120 - csvInfo.priority * 10);
  if (leadCount) score += leadCount * 25;
  if (adminInfo && adminInfo.section) score += 5;
  return score;
}

async function main() {
  var cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  var csvMap = loadCsvPriorities();
  var adminMap = loadAdminTitles();
  var leadCounts = await loadLeadCountsBySlug();

  var byTemplate = [];
  var templates = cfg.form_templates || {};
  Object.keys(templates).forEach(function (key) {
    var t = templates[key];
    var slugs = t.blog_slugs || [];
    var articles = slugs.map(function (slug) {
      var csv = csvMap[slug];
      var admin = adminMap[slug];
      var leads = leadCounts[slug] || 0;
      return {
        slug: slug,
        title: (admin && admin.title) || slug,
        section: (admin && admin.section) || t.vertical,
        csvPriority: csv ? csv.priority : null,
        leadCount: leads,
        score: scoreArticle(slug, csv, leads, admin),
        campaign: (csv && csv.campaign) || t.campaign,
        headline: csv && csv.headline,
      };
    });
    articles.sort(function (a, b) {
      return b.score - a.score;
    });
    byTemplate.push({
      templateKey: key,
      templateName: t.name,
      vertical: t.vertical,
      campaign: t.campaign,
      articles: articles,
    });
  });

  byTemplate.sort(function (a, b) {
    var pa = (cfg.form_templates[a.templateKey] && cfg.form_templates[a.templateKey].priority) || 99;
    var pb = (cfg.form_templates[b.templateKey] && cfg.form_templates[b.templateKey].priority) || 99;
    return pa - pb;
  });

  var globalArticles = [];
  Object.keys(csvMap).forEach(function (slug) {
    globalArticles.push({
      slug: slug,
      vertical: csvMap[slug].vertical,
      csvPriority: csvMap[slug].priority,
      leadCount: leadCounts[slug] || 0,
      score: scoreArticle(slug, csvMap[slug], leadCounts[slug] || 0, adminMap[slug]),
    });
  });
  globalArticles.sort(function (a, b) {
    return b.score - a.score;
  });

  var out = {
    updatedAt: new Date().toISOString(),
    note: "Scores = priorité CSV ads + leads CRM (referrer/landing blog). GA4/Clarity : voir dashboards externes.",
    leadCountsFromDb: Object.keys(leadCounts).length > 0,
    byTemplate: byTemplate,
    topArticles: globalArticles.slice(0, 15),
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log("Écrit:", OUT_PATH);
  console.log("\nTop articles par template Meta:");
  byTemplate.forEach(function (block) {
    console.log("\n—", block.templateName);
    block.articles.slice(0, 3).forEach(function (a, i) {
      console.log(
        "  " +
          (i + 1) +
          ". " +
          a.slug +
          " (score " +
          a.score +
          ", leads CRM " +
          a.leadCount +
          ", CSV prio " +
          (a.csvPriority != null ? a.csvPriority : "—") +
          ")"
      );
    });
  });
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
