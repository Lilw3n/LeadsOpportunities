#!/usr/bin/env node
/**
 * Ajoute le contenu de fond, la FAQ et les données structurées aux pages devis de /landings/.
 * Idempotent : le bloc est remplacé entre ses marqueurs à chaque passage.
 * Appelé à la fin de build-pro-metiers-landings.cjs et build-metiers-suite-landings.cjs,
 * et directement pour les pages écrites à la main (décennale, ramonage, padel…).
 */
var fs = require("fs");
var path = require("path");
var CONTENT = require("./landing-seo-content.cjs");
var CATALOG = require("./metiers-suite-catalog.cjs");

var root = path.join(__dirname, "..");
var SITE = "https://www.leadsopportunities.fr";
var START = "<!-- seo-landing:start -->";
var END = "<!-- seo-landing:end -->";

/** Maillage entre pages pro : chaque page renvoie vers les autres. */
var PRO_LINKS = [
  ["rc-pro.html", "RC Pro"],
  ["decennale.html", "Décennale"],
  ["multirisque-professionnelle.html", "Multirisque professionnelle"],
  ["metiers-batiment.html", "Métiers du bâtiment"],
  ["flotte-vehicules.html", "Flotte automobile"],
  ["garage-negociant-auto.html", "Garage et négociant auto"],
  ["transport-logistique.html", "Transport de marchandises"],
  ["transport-voyageurs.html", "Transport de voyageurs"],
  ["prevoyance-tns.html", "Prévoyance TNS"],
  ["assurance-dirigeant.html", "Homme clé et dirigeant"],
  ["protection-juridique-pro.html", "Protection juridique"],
  ["immeuble-professionnel.html", "Immeuble professionnel"],
  ["sante-collective.html", "Mutuelle d'entreprise"],
  ["credit-professionnel.html", "Crédit professionnel"],
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, "");
}

/** Fiche issue du catalogue des métiers, pour les pages sans contenu rédigé à part. */
function fromCatalog(file) {
  var c = CATALOG.filter(function (p) {
    return p.file === file;
  })[0];
  if (!c) return null;
  return {
    service: c.marketLabel,
    h1: c.title.split(" | ")[0] + " : devis en ligne",
    sections: (c.sections || []).map(function (s) {
      return { h2: s.h2, p: s.p ? [s.p] : [], list: s.items || [] };
    }),
    faq: c.faq || [],
  };
}

function entryFor(file) {
  return CONTENT[file] || fromCatalog(file);
}

function allFiles() {
  var seen = {};
  Object.keys(CONTENT).forEach(function (f) {
    seen[f] = true;
  });
  CATALOG.forEach(function (p) {
    seen[p.file] = true;
  });
  return Object.keys(seen);
}

function block(file, entry, need, campaign) {
  var out = [];
  entry.sections.forEach(function (s) {
    var h = '        <div class="form-wrap seo-copy">\n          <h2>' + esc(s.h2) + "</h2>\n";
    var paras = s.p || [];
    if (paras.length && (s.list || []).length) h += "          <p>" + paras[0] + "</p>\n";
    if ((s.list || []).length) {
      h += "          <ul>\n" + s.list.map(function (li) { return "            <li>" + li + "</li>"; }).join("\n") + "\n          </ul>\n";
      paras = paras.slice(1);
    }
    paras.forEach(function (para) {
      h += "          <p>" + para + "</p>\n";
    });
    out.push(h + "        </div>");
  });

  if ((entry.faq || []).length) {
    out.push(
      '        <div class="form-wrap seo-copy">\n          <h2>Questions fréquentes</h2>\n          <ul class="faq-list landing-faq">\n' +
        entry.faq
          .map(function (f) {
            return (
              '            <li>\n              <details class="faq-item">\n                <summary><span>' +
              esc(f.q) +
              "</span></summary>\n                <p>" +
              esc(f.a) +
              "</p>\n              </details>\n            </li>"
            );
          })
          .join("\n") +
        "\n          </ul>\n        </div>"
    );
  }

  var q = "./questionnaire.html?need=" + need + "&amp;journey=standard&amp;utm_source=landing&amp;utm_campaign=" + campaign + "&amp;utm_content=bas_de_page";
  var devis = "./devis.html?need=" + need + "&amp;utm_source=landing&amp;utm_campaign=" + campaign + "&amp;utm_content=bas_de_page";
  out.push(
    '        <div class="form-wrap seo-copy seo-copy-cta">\n          <h2>Obtenir votre devis</h2>\n' +
      "          <p>Décrivez votre activité en quelques questions. Un conseiller vous rappelle, compare plusieurs assureurs et vous explique les écarts. Gratuit et sans engagement.</p>\n" +
      '          <div class="actions">\n            <a class="btn btn-primary" href="' + q + '">Demander mon devis</a>\n' +
      '            <a class="btn btn-soft" href="' + devis + '">Être rappelé</a>\n          </div>\n        </div>'
  );

  var own = (entry.links || []).map(function (l) {
    return '<a href="' + l[0] + '">' + esc(l[1]) + "</a>";
  });
  var pro = PRO_LINKS.filter(function (l) {
    return l[0] !== file;
  }).map(function (l) {
    return '<a href="./' + l[0] + '">' + esc(l[1]) + "</a>";
  });
  out.push(
    '        <nav class="form-wrap seo-copy seo-copy-links" aria-label="Autres assurances professionnelles">\n          <h2>Autres assurances et financements</h2>\n          <p>' +
      own.concat(pro).join(" · ") +
      ' · <a href="../assurances-niches.html">Toutes les assurances de niche</a> · <a href="../assurances/">Toutes nos assurances</a></p>\n        </nav>'
  );
  return START + "\n" + out.join("\n") + "\n        " + END;
}

function jsonLd(file, entry, title, description) {
  var url = SITE + "/landings/" + file;
  var graph = [
    {
      "@type": "Service",
      name: entry.service || title,
      serviceType: entry.service || title,
      description: description,
      url: url,
      areaServed: { "@type": "Country", name: "France" },
      provider: { "@type": "InsuranceAgency", name: "Leads Opportunities", url: SITE + "/" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Assurances de niche", item: SITE + "/assurances-niches.html" },
        { "@type": "ListItem", position: 3, name: entry.service || title, item: url },
      ],
    },
  ];
  if ((entry.faq || []).length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: entry.faq.map(function (f) {
        return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: stripTags(f.a) } };
      }),
    });
  }
  return (
    '<script type="application/ld+json" data-seo-landing>' +
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") +
    "</script>"
  );
}

function enrich(file) {
  var entry = entryFor(file);
  var dest = path.join(root, "landings", file);
  if (!entry || !fs.existsSync(dest)) return false;
  var html = fs.readFileSync(dest, "utf8");

  // Nettoyage d'un passage précédent
  var a = html.indexOf(START);
  var b = html.indexOf(END);
  if (a >= 0 && b > a) html = html.slice(0, a).replace(/[ \t]*$/, "") + html.slice(b + END.length).replace(/^\r?\n/, "");
  html = html.replace(/[ \t]*<script type="application\/ld\+json" data-seo-landing>[\s\S]*?<\/script>\r?\n/g, "");

  if (entry.title) {
    html = html
      .replace(/<title>[^<]*<\/title>/, "<title>" + esc(entry.title) + "</title>")
      .replace(/(<meta property="og:title" content=")[^"]*/, "$1" + esc(entry.title));
  }
  if (entry.description) {
    html = html
      .replace(/(<meta name="description" content=")[^"]*/, "$1" + esc(entry.description))
      .replace(/(<meta property="og:description" content=")[^"]*/, "$1" + esc(entry.description));
  }
  if (entry.h1) html = html.replace(/<h1>[\s\S]*?<\/h1>/, "<h1>" + esc(entry.h1) + "</h1>");

  var title = (html.match(/<title>([^<]*)/) || [])[1] || "";
  var description = (html.match(/<meta name="description" content="([^"]*)/) || [])[1] || "";
  var need = (html.match(/data-callback-need="([^"]+)"/) || [])[1] || "rc-pro";
  var campaign = (html.match(/data-callback-source="([^"]+)"/) || [])[1] || "landing";

  var mainEnd = html.indexOf("</main>");
  var cut = html.lastIndexOf("</section>", mainEnd);
  if (mainEnd < 0 || cut < 0) throw new Error("structure inattendue : " + file);
  // Le bloc entre dans la carte, avant sa fermeture
  html = html.slice(0, cut) + block(file, entry, need, campaign) + "\n      " + html.slice(cut);
  html = html.replace("</head>", "  " + jsonLd(file, entry, title.replace(/&amp;/g, "&"), description.replace(/&amp;/g, "&").replace(/&quot;/g, '"')) + "\n</head>");
  fs.writeFileSync(dest, html);
  return true;
}

function run(files) {
  var done = [];
  (files || allFiles()).forEach(function (f) {
    if (enrich(f)) done.push(f);
  });
  return done;
}

module.exports = { run: run, enrich: enrich, allFiles: allFiles };

if (require.main === module) {
  var done = run();
  console.log("pages devis enrichies :", done.length);
}
