#!/usr/bin/env node
/**
 * Génère data/blog-pubs-catalog.json depuis ads/meta-blog-conversions.csv
 * pour la page CRM /crm-blog-pubs.html (pubs articles prêtes à lancer).
 */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var CSV_PATH = path.join(ROOT, "ads/meta-blog-conversions.csv");
var ADMIN_PATH = path.join(ROOT, "data/blog-questionnaire-admin.json");
var OUT_PATH = path.join(ROOT, "data/blog-pubs-catalog.json");

var VERTICAL_LABELS = {
  vtc: "VTC",
  sante: "Santé / mutuelle",
  finance: "Crédit / finance",
  habitat: "Habitation",
  auto: "Auto",
  vsp: "Citadine (VSP)",
  collective: "Santé collective",
  chasse: "Chasse",
  equitation: "Équitation",
  actu: "Actu / foyer",
};

var DEST_LABELS = {
  blog_then_bridge: "Article → bridge",
  direct_landing: "Landing directe",
};

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

function loadAdminTitles() {
  if (!fs.existsSync(ADMIN_PATH)) return {};
  var data = JSON.parse(fs.readFileSync(ADMIN_PATH, "utf8"));
  var map = {};
  (data.rows || []).forEach(function (r) {
    var slug = String(r.file || "").replace(/\.html$/, "");
    if (slug) map[slug] = { title: r.title || "", section: r.section || "", need: r.need || "" };
  });
  return map;
}

function prioritySortKey(p) {
  var s = String(p == null ? "" : p);
  var m = s.match(/^(\d+)([a-z]*)$/i);
  if (!m) return [999, s];
  return [Number(m[1]) || 999, m[2] || ""];
}

function build() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("CSV manquant:", CSV_PATH);
    process.exit(1);
  }
  var titles = loadAdminTitles();
  var lines = fs.readFileSync(CSV_PATH, "utf8").split(/\r?\n/).filter(Boolean);
  var headers = parseCsvLine(lines[0]);
  var items = [];

  for (var i = 1; i < lines.length; i++) {
    var cols = parseCsvLine(lines[i]);
    if (cols.length < 9) continue;
    var row = {};
    headers.forEach(function (h, idx) {
      row[h] = cols[idx] != null ? cols[idx] : "";
    });
    var slug = row.article_slug || "";
    if (!slug) continue;
    var admin = titles[slug] || {};
    var dest = row.ad_destination_type || "";
    items.push({
      priority: row.priority || "",
      vertical: row.vertical || "",
      vertical_label: VERTICAL_LABELS[row.vertical] || row.vertical || "",
      slug: slug,
      title: admin.title || row.meta_ad_copy_headline || slug,
      article_url: row.article_url || "",
      destination_type: dest,
      destination_label: DEST_LABELS[dest] || dest,
      conversion_landing: row.conversion_landing || "",
      meta_campaign: row.meta_campaign || "",
      primary_text: row.meta_ad_copy_primary || "",
      headline: row.meta_ad_copy_headline || "",
      budget_eur_day: Number(row.budget_when_ready_eur_day) || 0,
      notes: row.notes || "",
      is_blog: dest === "blog_then_bridge" || /\/blog\//.test(row.article_url || ""),
    });
  }

  items.sort(function (a, b) {
    var ka = prioritySortKey(a.priority);
    var kb = prioritySortKey(b.priority);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] < kb[1] ? -1 : 1;
    return String(a.slug).localeCompare(String(b.slug));
  });

  var verticals = {};
  items.forEach(function (it) {
    verticals[it.vertical] = (verticals[it.vertical] || 0) + 1;
  });

  var catalog = {
    generated_at: new Date().toISOString(),
    source: "ads/meta-blog-conversions.csv",
    docs: [
      { href: "./docs/ACQUISITION-BLOG-CONVERSION.md", label: "Stratégie blog → conversion" },
      { href: "./docs/ACQUISITION-PRIORITES-90J.md", label: "Priorités 90 j" },
      { href: "./crm-pubs.html", label: "Gestion pubs (Ads Manager)" },
      { href: "./crm-blog-stats.html", label: "Stats blog (activer si organique OK)" },
    ],
    counts: {
      total: items.length,
      blog: items.filter(function (x) {
        return x.is_blog;
      }).length,
      direct: items.filter(function (x) {
        return x.destination_type === "direct_landing";
      }).length,
      verticals: verticals,
    },
    vertical_labels: VERTICAL_LABELS,
    items: items,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  console.log("OK  data/blog-pubs-catalog.json —", items.length, "créas");
}

build();
