#!/usr/bin/env node
/**
 * Recense toutes les communes (COG geo.api.gouv.fr) et publie un annuaire
 * par département. Pas de page produit par hameau : les villes déjà suivies
 * gardent leurs URLs devis.
 *
 *   node scripts/build-france-communes.cjs
 *   node scripts/build-france-communes.cjs --refresh
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { SITE_ORIGIN } = require("./site-url.cjs");

const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "seo", "france-communes.json");
const FETCHED = "2026-10-17";

const REGION_BY_CODE = {
  "11": "Île-de-France",
  "24": "Centre-Val de Loire",
  "27": "Bourgogne-Franche-Comté",
  "28": "Normandie",
  "32": "Hauts-de-France",
  "44": "Grand Est",
  "52": "Pays de la Loire",
  "53": "Bretagne",
  "75": "Nouvelle-Aquitaine",
  "76": "Occitanie",
  "84": "Auvergne-Rhône-Alpes",
  "93": "Provence-Alpes-Côte d'Azur",
  "94": "Corse",
  "01": "Guadeloupe",
  "02": "Martinique",
  "03": "Guyane",
  "04": "La Réunion",
  "06": "Mayotte",
};

const EXTRA_DEPTS = [
  { code: "975", nom: "Saint-Pierre-et-Miquelon", codeRegion: "" },
  { code: "977", nom: "Saint-Barthélemy", codeRegion: "" },
  { code: "978", nom: "Saint-Martin", codeRegion: "" },
  { code: "984", nom: "Terres australes et antarctiques françaises", codeRegion: "" },
  { code: "986", nom: "Wallis-et-Futuna", codeRegion: "" },
  { code: "987", nom: "Polynésie française", codeRegion: "" },
  { code: "988", nom: "Nouvelle-Calédonie", codeRegion: "" },
  { code: "989", nom: "Île de Clipperton", codeRegion: "" },
];

function slugify(name) {
  return String(name || "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "ae")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR");
}

function getJson(url) {
  return new Promise(function (resolve, reject) {
    https
      .get(url, function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          getJson(res.headers.location).then(resolve, reject);
          return;
        }
        var chunks = [];
        res.on("data", function (c) {
          chunks.push(c);
        });
        res.on("end", function () {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function loadSource() {
  var refresh = process.argv.indexOf("--refresh") !== -1;
  var communesPath = "/tmp/cog-communes.json";
  var deptsPath = "/tmp/cog-depts.json";
  if (refresh || !fs.existsSync(communesPath)) {
    console.log("Téléchargement communes…");
    fs.writeFileSync(
      communesPath,
      JSON.stringify(await getJson("https://geo.api.gouv.fr/communes?fields=nom,code,codeDepartement,population&format=json"))
    );
  }
  if (refresh || !fs.existsSync(deptsPath)) {
    console.log("Téléchargement départements…");
    fs.writeFileSync(
      deptsPath,
      JSON.stringify(await getJson("https://geo.api.gouv.fr/departements?fields=nom,code,codeRegion"))
    );
  }
  return {
    communes: JSON.parse(fs.readFileSync(communesPath, "utf8")),
    departements: JSON.parse(fs.readFileSync(deptsPath, "utf8")),
  };
}

function buildCensus(raw) {
  var byCode = {};
  raw.departements.concat(EXTRA_DEPTS).forEach(function (d) {
    byCode[d.code] = d;
  });
  var departments = Object.keys(byCode)
    .map(function (code) {
      var d = byCode[code];
      var region = REGION_BY_CODE[d.codeRegion] || "";
      return {
        code: code,
        name: d.nom,
        slug: slugify(d.nom),
        region: region,
        regionSlug: region ? slugify(region) : "",
      };
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, "fr");
    });
  var known = {};
  departments.forEach(function (d) {
    known[d.code] = d;
  });
  var communes = raw.communes
    .map(function (c) {
      return [c.code, c.nom, c.codeDepartement, c.population == null ? 0 : c.population];
    })
    .filter(function (c) {
      return known[c[2]];
    })
    .sort(function (a, b) {
      if (a[2] !== b[2]) return a[2] < b[2] ? -1 : 1;
      return String(a[1]).localeCompare(String(b[1]), "fr");
    });
  return {
    source: "https://geo.api.gouv.fr/communes",
    fetched: FETCHED,
    count: communes.length,
    departments: departments,
    communes: communes,
  };
}

function pageShell(opts) {
  var crumbs = opts.crumbs
    .map(function (c) {
      return '<a href="' + esc(c.url) + '">' + esc(c.name) + "</a>";
    })
    .join(" · ");
  var crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: opts.crumbs.map(function (c, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: SITE_ORIGIN + c.url,
      };
    }),
  };
  var faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (opts.faq || []).map(function (f) {
      return {
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      };
    }),
  };
  return (
    "<!doctype html>\n<html lang=\"fr\">\n<head>\n" +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    esc(opts.title) +
    "</title>\n" +
    '  <meta name="description" content="' +
    esc(opts.description) +
    '" />\n' +
    '  <meta name="robots" content="index,follow" />\n' +
    '  <meta name="geo.region" content="FR" />\n' +
    '  <meta name="geo.placename" content="France" />\n' +
    '  <meta name="language" content="fr-FR" />\n' +
    '  <meta http-equiv="content-language" content="fr" />\n' +
    '  <meta property="og:locale" content="fr_FR" />\n' +
    '  <link rel="canonical" href="' +
    esc(SITE_ORIGIN + opts.path) +
    '" />\n' +
    '  <meta property="og:title" content="' +
    esc(opts.title) +
    '" />\n' +
    '  <meta property="og:description" content="' +
    esc(opts.description) +
    '" />\n' +
    '  <meta property="og:url" content="' +
    esc(SITE_ORIGIN + opts.path) +
    '" />\n' +
    '  <link rel="stylesheet" href="/seo/seo-pages.css" />\n' +
    "  <style>\n" +
    "    .commune-tools{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:0 0 14px}\n" +
    "    .commune-tools input{flex:1;min-width:200px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}\n" +
    "    .commune-list{columns:3;gap:18px;list-style:none;padding:0;margin:0}\n" +
    "    .commune-list li{break-inside:avoid;padding:3px 0;font-size:.92rem}\n" +
    "    .commune-list small{color:#64748b}\n" +
    "    .commune-list a{font-weight:600}\n" +
    "    @media(max-width:900px){.commune-list{columns:1}}\n" +
    "  </style>\n</head>\n<body>\n" +
    '  <header class="seo-header"><div class="seo-container"><a href="/">Leads Opportunities</a></div></header>\n' +
    '  <main class="seo-container" style="padding:28px 0 48px">\n' +
    '    <p class="seo-crumbs">' +
    crumbs +
    "</p>\n" +
    "    <h1>" +
    esc(opts.h1) +
    "</h1>\n" +
    "    <p>" +
    opts.introHtml +
    "</p>\n" +
    opts.body +
    '    <section class="seo-card"><h2>Questions fréquentes</h2>' +
    (opts.faq || [])
      .map(function (f) {
        return "<h3>" + esc(f.q) + "</h3><p>" + esc(f.a) + "</p>";
      })
      .join("") +
    "</section>\n" +
    "  </main>\n" +
    '  <footer class="seo-footer"><div class="seo-container"><small>ORIAS n° 15005935 · Leads Opportunities · recensement communes ' +
    esc(opts.fetched) +
    "</small></div></footer>\n" +
    '  <script type="application/ld+json">' +
    JSON.stringify(crumbLd) +
    "</script>\n" +
    '  <script type="application/ld+json">' +
    JSON.stringify(faqLd) +
    "</script>\n" +
    "  <script>\n" +
    '    var q=document.getElementById("communeFilter");\n' +
    "    if(q){q.addEventListener('input',function(){\n" +
    "      var n=q.value.trim().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');\n" +
    "      document.querySelectorAll('.commune-list li').forEach(function(li){\n" +
    "        li.style.display=!n||(li.getAttribute('data-s')||'').indexOf(n)!==-1?'':'none';\n" +
    "      });\n" +
    "    });}\n" +
    "  </script>\n" +
    '  <script src="/js/france-seo-meta.js"></script>\n' +
    '  <script src="/js/attribution.js"></script>\n' +
    '  <script src="/js/cookie-banner.js"></script>\n' +
    "</body>\n</html>\n"
  );
}

function writePages(census) {
  var cities = JSON.parse(fs.readFileSync(path.join(ROOT, "seo", "france-cities.json"), "utf8"));
  var money = {};
  cities.forEach(function (c) {
    money[c.dept + "|" + c.slug] = c;
  });
  var byDept = {};
  census.communes.forEach(function (row) {
    if (!byDept[row[2]]) byDept[row[2]] = [];
    byDept[row[2]].push(row);
  });
  var deptByCode = {};
  census.departments.forEach(function (d) {
    deptByCode[d.code] = d;
  });

  var indexItems = census.departments
    .filter(function (d) {
      return (byDept[d.code] || []).length;
    })
    .map(function (d) {
      var rows = byDept[d.code];
      var pop = rows.reduce(function (s, r) {
        return s + (r[3] || 0);
      }, 0);
      return (
        '<a class="seo-city-link" href="/france/communes/' +
        esc(d.slug) +
        '/">' +
        esc(d.name) +
        " · " +
        fmt(rows.length) +
        " communes</a>"
      );
    })
    .join("");

  var indexFaq = [
    {
      q: "Combien de communes sont recensées ?",
      a:
        "Le code officiel géographique compte " +
        fmt(census.count) +
        " communes au " +
        census.fetched +
        ", métropole, outre-mer et collectivités présentes dans geo.api.gouv.fr.",
    },
    {
      q: "Chaque village a-t-il une page devis ?",
      a: "Non. L’annuaire nomme chaque commune. Les pages devis existent pour les villes déjà suivies, afin d’éviter des milliers de pages identiques.",
    },
    {
      q: "Où demander un devis si ma commune n’a pas de page ville ?",
      a: "Le questionnaire est le même pour toute la France. Un conseiller traite la commune indiquée. Le prêt immobilier du bassin de Nancy est sur la page Nancy métropole.",
    },
  ];
    var indexHtml = pageShell({
    path: "/france/communes/",
    title: "Communes de France (" + fmt(census.count) + ") | Annuaire devis assurance et prêt",
    description:
      "Recensement des " +
      fmt(census.count) +
      " communes de France. Annuaire par département, devis courtier ORIAS, sans page creuse par hameau.",
    h1: "Toutes les communes de France",
    introHtml:
      "<strong>" +
      fmt(census.count) +
      "</strong> communes recensées le " +
      esc(census.fetched) +
      " (source geo.api.gouv.fr). Choisissez un département. Les villes qui ont déjà une page devis y sont reliées. Le bassin de prêt autour de Nancy : <a href=\"/pret-immobilier/nancy-metropole/\">Nancy métropole</a>.",
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "France", url: "/france/" },
      { name: "Communes", url: "/france/communes/" },
    ],
    faq: indexFaq,
    fetched: census.fetched,
    body:
      '<section class="seo-card"><h2>Par département</h2><div class="seo-city-grid">' +
      indexItems +
      "</div></section>\n",
  });
  fs.mkdirSync(path.join(ROOT, "france", "communes"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "france", "communes", "index.html"), indexHtml);

  var urls = [SITE_ORIGIN + "/france/communes/"];
  census.departments.forEach(function (d) {
    var rows = byDept[d.code] || [];
    if (!rows.length) return;
    var pop = rows.reduce(function (s, r) {
      return s + (r[3] || 0);
    }, 0);
    var top = rows
      .slice()
      .sort(function (a, b) {
        return (b[3] || 0) - (a[3] || 0);
      })
      .slice(0, 3)
      .map(function (r) {
        return r[1];
      });
    var list = rows
      .map(function (r) {
        var slug = slugify(r[1]);
        var city = money[d.slug + "|" + slug];
        var devis = "";
        if (city) {
          devis =
            ' · <a href="/pret-immobilier/' +
            esc(city.slug) +
            '/">Prêt</a> · <a href="/assurance-habitation/' +
            esc(city.slug) +
            '/">Habitation</a>';
        }
        return (
          '<li id="c' +
          esc(r[0]) +
          '" data-s="' +
          esc(slug) +
          '"><strong>' +
          esc(r[1]) +
          "</strong> <small>INSEE " +
          esc(r[0]) +
          " · " +
          fmt(r[3]) +
          " hab.</small>" +
          devis +
          "</li>"
        );
      })
      .join("");
    var deptPage = fs.existsSync(path.join(ROOT, "france", "departement", d.slug, "index.html"));
    var habDept = fs.existsSync(
      path.join(ROOT, "assurance-habitation", "departement", d.slug, "index.html")
    );
    var links =
      (deptPage
        ? '<a class="seo-city-link" href="/france/departement/' + esc(d.slug) + '/">Pages du département</a>'
        : "") +
      (habDept
        ? '<a class="seo-city-link" href="/assurance-habitation/departement/' +
          esc(d.slug) +
          '/">Assurance habitation</a><a class="seo-city-link" href="/pret-immobilier/departement/' +
          esc(d.slug) +
          '/">Prêt immobilier</a>'
        : '<a class="seo-city-link" href="/assurance-habitation/">Assurance habitation</a><a class="seo-city-link" href="/pret-immobilier/">Prêt immobilier</a>') +
      (d.code === "54"
        ? '<a class="seo-city-link" href="/pret-immobilier/nancy-metropole/">Nancy métropole</a>'
        : "");
    var faq = [
      {
        q: "Combien de communes dans " + d.name + " ?",
        a: d.name + " compte " + fmt(rows.length) + " communes dans ce recensement, environ " + fmt(pop) + " habitants.",
      },
      {
        q: "Comment obtenir un devis à " + (top[0] || d.name) + " ?",
        a: "Les communes reliées à Prêt et Habitation ont une page locale. Les autres passent par le questionnaire national : le conseiller couvre la commune.",
      },
    ];
    var html = pageShell({
      path: "/france/communes/" + d.slug + "/",
      title: "Communes " + d.name + " (" + fmt(rows.length) + ") | Devis assurance et prêt",
      description:
        "Annuaire des " +
        fmt(rows.length) +
        " communes " +
        (d.region ? "en " + d.region + ", " : "") +
        d.name +
        " : " +
        top.join(", ") +
        ". Devis courtier ORIAS.",
      h1: "Communes — " + d.name,
      introHtml:
        "<strong>" +
        fmt(rows.length) +
        "</strong> communes, <strong>" +
        fmt(pop) +
        "</strong> habitants. " +
        (d.region ? "Région " + esc(d.region) + ". " : "") +
        "Recherchez un village. Les liens Prêt et Habitation n’apparaissent que pour les villes déjà publiées.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
        { name: "Communes", url: "/france/communes/" },
        { name: d.name, url: "/france/communes/" + d.slug + "/" },
      ],
      faq: faq,
      fetched: census.fetched,
      body:
        '<div class="commune-tools"><label for="communeFilter">Rechercher une commune</label><input id="communeFilter" type="search" placeholder="Nom du village ou de la ville" /></div>\n' +
        '<p><a class="btn btn-primary" href="/landings/devis.html">Devis gratuit</a></p>\n' +
        '<div class="seo-city-grid">' +
        links +
        "</div>\n" +
        '<ul class="commune-list">' +
        list +
        "</ul>\n",
    });
    var dir = path.join(ROOT, "france", "communes", d.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    urls.push(SITE_ORIGIN + "/france/communes/" + d.slug + "/");
  });

  var sm =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(function (u) {
        return (
          "  <url><loc>" +
          u +
          "</loc><lastmod>" +
          census.fetched +
          "</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>"
        );
      })
      .join("\n") +
    "\n</urlset>\n";
  fs.writeFileSync(path.join(ROOT, "sitemap-communes.xml"), sm);

  var indexPath = path.join(ROOT, "sitemap.xml");
  var indexXml = fs.readFileSync(indexPath, "utf8");
  if (indexXml.indexOf("sitemap-communes.xml") === -1) {
    indexXml = indexXml.replace(
      "</sitemapindex>",
      "  <sitemap>\n    <loc>" +
        SITE_ORIGIN +
        "/sitemap-communes.xml</loc>\n    <lastmod>" +
        census.fetched +
        "</lastmod>\n  </sitemap>\n</sitemapindex>\n"
    );
    fs.writeFileSync(indexPath, indexXml);
  }

  function inject(file, href, label) {
    if (!fs.existsSync(file)) return;
    var html = fs.readFileSync(file, "utf8");
    if (html.indexOf(href) !== -1) return;
    if (html.indexOf('<ul class="seo-related">') === -1) return;
    html = html.replace(
      '<ul class="seo-related">',
      '<ul class="seo-related"><li><a href="' + href + '">' + label + "</a></li>"
    );
    fs.writeFileSync(file, html);
  }
  inject(path.join(ROOT, "france", "index.html"), "/france/communes/", "Toutes les communes");
  inject(path.join(ROOT, "france", "departements", "index.html"), "/france/communes/", "Annuaire des communes");
  census.departments.forEach(function (d) {
    inject(
      path.join(ROOT, "france", "departement", d.slug, "index.html"),
      "/france/communes/" + d.slug + "/",
      "Toutes les communes"
    );
  });
  return urls.length;
}

function writeVault(census) {
  var lines = census.departments
    .map(function (d) {
      var n = census.communes.filter(function (c) {
        return c[2] === d.code;
      }).length;
      if (!n) return "";
      return "| " + d.name + " | " + d.code + " | " + n + " | [[/france/communes/" + d.slug + "/]] |";
    })
    .filter(Boolean);
  var body = [
    "---",
    "generated: false",
    "type: journal",
    "tags:",
    "  - seo",
    "  - communes",
    "---",
    "",
    "# Communes de France",
    "",
    "Recensement du " + census.fetched + " via [geo.api.gouv.fr](https://geo.api.gouv.fr/communes) (code officiel géographique).",
    "",
    "- **Communes** : " + census.count,
    "- **Départements et collectivités avec au moins une commune** : " + lines.length,
    "- Annuaire public : https://www.leadsopportunities.fr/france/communes/",
    "- Donnée : `seo/france-communes.json`",
    "",
    "Les pages devis ville ne sont pas dupliquées pour chaque hameau. L’annuaire nomme chaque commune (code INSEE, habitants). Les liens Prêt et Habitation ne partent que vers une ville déjà publiée dans `seo/france-cities.json`.",
    "",
    "Bassin de prêt : [[/pret-immobilier/nancy-metropole/]]. Orthographe : **Varangéville** (INSEE 54549).",
    "",
    "Régénérer : `node scripts/build-france-communes.cjs`. Ne pas lancer `seo:build` pour ce recensement.",
    "",
    "| Département | Code | Communes | Annuaire |",
    "| --- | --- | --- | --- |",
  ]
    .concat(lines)
    .join("\n");
  fs.writeFileSync(path.join(ROOT, "vault", "Journal", "Communes de France.md"), body + "\n");
}

async function main() {
  var census;
  if (process.argv.indexOf("--html-only") !== -1 && fs.existsSync(OUT_JSON)) {
    census = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
  } else {
    census = buildCensus(await loadSource());
    fs.writeFileSync(OUT_JSON, JSON.stringify(census));
    console.log("JSON", census.count, "communes");
  }
  var n = writePages(census);
  writeVault(census);
  console.log("Pages", n);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
