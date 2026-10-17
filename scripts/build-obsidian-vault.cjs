#!/usr/bin/env node
/**
 * Coffre Obsidian — SEO + netlinking Leads Opportunities.
 * Régénère les notes à partir des silos, clusters, maillage et URLs GSC.
 * Les notes manuelles dans vault/Journal/ ne sont pas écrasées.
 *
 * Ouvrir le dossier vault/ comme coffre : Fichier → Ouvrir le dossier en tant que coffre.
 */
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var vault = path.join(root, "vault");
var SITE = require("./site-url.cjs").SITE_ORIGIN;
var markets = require("../data/seo-niche-markets.json");
var clusters = require("../data/seo-keyword-clusters.json").clusters || [];
var LT = require("./seo-long-term-related.cjs");
var gsc = require("./seo-gsc-priority-urls.cjs").GSC_INDEX_NOW_PRIORITY;

var GENERATED = ["SEO", "Netlinking", "Silos", "Clusters", "Maillage", "Pages"];

var SILO_NEIGHBORS = {
  chasse: ["animaux", "equitation"],
  animaux: ["chasse"],
  equitation: ["chasse", "padel"],
  vsp: ["convoyage"],
  collective: ["metiers-batiment", "mrp"],
  ramonage: ["decennale", "immeuble-pro"],
  esthetique: ["salles-loisirs", "padel"],
  "salles-loisirs": ["padel", "esthetique"],
  padel: ["salles-loisirs", "equitation"],
  "immeuble-pro": ["decennale", "ramonage"],
  decennale: ["metiers-batiment", "immeuble-pro", "ramonage"],
  convoyage: ["transport-logistique", "vsp"],
  garage: ["mrp", "convoyage"],
  mrp: ["immeuble-pro", "rc-pro"],
  "rc-pro": ["metiers-batiment", "mrp"],
  "metiers-batiment": ["decennale", "collective"],
  "transport-logistique": ["transport-voyageurs", "convoyage"],
  "transport-voyageurs": ["transport-logistique", "convoyage"],
};
require("./metiers-suite-catalog.cjs").forEach(function (item) {
  SILO_NEIGHBORS[item.id] = item.neighbors || [];
});

var CIBLES = [
  {
    id: "google-business",
    titre: "Google Business Profile",
    type: "profil",
    silo: "nancy-local",
    url: SITE + "/",
    ancre: "Leads Opportunities",
    action: "Fiche Varangéville / bassin nancéien : nom, téléphone, site = accueil. C’est souvent la première apparition Maps.",
  },
  {
    id: "facebook",
    titre: "Bio Facebook",
    type: "profil",
    silo: "niches",
    url: SITE + "/assurances-niches.html",
    ancre: "assurances de niche",
    action: "Lien unique dans la bio vers le hub niches, pas vers l’accueil seul.",
  },
  {
    id: "instagram",
    titre: "Bio Instagram",
    type: "profil",
    silo: "niches",
    url: SITE + "/assurances-niches.html",
    ancre: "devis assurance niche",
    action: "Même URL que Facebook. Une publication = une landing (chasse, padel, VSP).",
  },
  {
    id: "signature-email",
    titre: "Signature e-mail",
    type: "profil",
    silo: "nancy-local",
    url: SITE + "/nancy-54/",
    ancre: "courtier Nancy",
    action: "Signature contact@ : lien vers le hub Nancy, pas un URL avec utm.",
  },
  {
    id: "pagesjaunes",
    titre: "PagesJaunes",
    type: "annuaire",
    silo: "nancy-local",
    url: SITE + "/",
    ancre: "courtier assurance Meurthe-et-Moselle",
    action: "Fiche établissement si elle existe. Une seule URL canonique www.",
  },
  {
    id: "federations-chasse",
    titre: "Fédérations et magazines chasse",
    type: "outreach",
    silo: "chasse",
    url: SITE + "/assurance-chasse/rc-chasseur/",
    ancre: "RC chasseur",
    action: "Proposer le guide RC chasseur aux fédérations départementales et magazines cynégétiques. Pas d’achat de lien.",
  },
  {
    id: "centres-equestres",
    titre: "Centres équestres et annuaires FFE",
    type: "outreach",
    silo: "equitation",
    url: SITE + "/assurance-equitation/",
    ancre: "assurance équitation",
    action: "Clubs et centres : page partenaire ou article invité vers le hub équitation.",
  },
  {
    id: "clubs-padel",
    titre: "Clubs de padel",
    type: "outreach",
    silo: "padel",
    url: SITE + "/landings/padel.html",
    ancre: "assurance club de padel",
    action: "Annuaire de clubs ou page « assurances du club » vers la landing padel.",
  },
  {
    id: "cma-artisans",
    titre: "CMA et annuaires artisans",
    type: "outreach",
    silo: "decennale",
    url: SITE + "/landings/decennale.html",
    ancre: "assurance décennale artisan",
    action: "Décennale et ramonage : chambres de métiers, annuaires artisans. Une page = un métier. Hub : /landings/metiers-batiment.html.",
  },
  {
    id: "garages-negociants",
    titre: "Garages et négociants auto",
    type: "outreach",
    silo: "garage",
    url: SITE + "/landings/garage-negociant-auto.html",
    ancre: "assurance garage et négociant auto",
    action: "Annuaires de garages et de marchands : lien vers la landing dépôt / atelier, pas vers une assurance auto particulière.",
  },
  {
    id: "transporteurs",
    titre: "Transporteurs et autocaristes",
    type: "outreach",
    silo: "transport-logistique",
    url: SITE + "/landings/transport-logistique.html",
    ancre: "assurance transport et logistique",
    action: "Marchandises vers la landing logistique. Voyageurs, autocar et scolaire vers /landings/transport-voyageurs.html. VTC vers le hub assurance VTC.",
  },
  {
    id: "chauffeurs-vtc",
    titre: "Groupes chauffeurs VTC",
    type: "outreach",
    silo: "vtc",
    url: "https://www.assurancevtcfrance.com/",
    ancre: "Assurance VTC France",
    action: "Le microsite AVF pointe déjà vers LO. Depuis le hub /assurance-vtc/, renvoyer vers AVF. Groupes chauffeurs : lien AVF, pas une ancre suroptimisée.",
  },
  {
    id: "bing",
    titre: "Bing Webmaster",
    type: "indexation",
    silo: "accueil",
    url: SITE + "/sitemap.xml",
    ancre: "sitemap",
    action: "Ajouter la propriété + sitemap. IndexNow est déjà pingé par le cron.",
  },
];

function absUrl(href) {
  if (!href) return "";
  if (href.indexOf("http") === 0) return href;
  if (href.charAt(0) !== "/") href = "/" + href;
  return SITE + href;
}

function yaml(obj) {
  var lines = ["---"];
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    if (Array.isArray(v)) {
      lines.push(k + ":");
      v.forEach(function (item) {
        lines.push("  - " + JSON.stringify(String(item)));
      });
    } else if (v == null || v === "") {
      lines.push(k + ": \"\"");
    } else if (typeof v === "number" || typeof v === "boolean") {
      lines.push(k + ": " + v);
    } else {
      lines.push(k + ": " + JSON.stringify(String(v)));
    }
  });
  lines.push("---");
  return lines.join("\n");
}

function noteNameFromPath(urlPath) {
  var s = String(urlPath || "/");
  s = s.split("?")[0].split("#")[0];
  if (s.length > 1 && s.charAt(s.length - 1) === "/") s = s.slice(0, -1);
  s = s.replace(/^\//, "") || "accueil";
  s = s.replace(/\.html$/, "");
  s = s.replace(/\//g, " — ");
  s = s.replace(/[\\:*?"<>|]/g, " ");
  return s.slice(0, 140);
}

function wikilink(target, label) {
  if (label && label !== target) return "[[" + target + "|" + label + "]]";
  return "[[" + target + "]]";
}

function write(rel, body) {
  var file = path.join(vault, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body.trim() + "\n", "utf8");
}

function resetGenerated() {
  GENERATED.forEach(function (dir) {
    var full = path.join(vault, dir);
    if (fs.existsSync(full)) fs.rmSync(full, { recursive: true, force: true });
  });
}

function marketById(id) {
  return (markets.markets || []).filter(function (m) {
    return m.id === id;
  })[0];
}

function siloTarget(id) {
  if (id === "accueil") return "Pages/accueil";
  if (id === "niches") return "SEO/MOC SEO";
  if (marketById(id)) return "Silos/" + id;
  var cluster = clusters.filter(function (c) {
    return c.id === id;
  })[0];
  if (cluster) return "Clusters/" + id;
  return "SEO/MOC SEO";
}

function pageIdFor(href) {
  var clean = String(href || "").split("?")[0];
  return "Pages/" + noteNameFromPath(clean);
}

function bulletLinks(items) {
  return (items || [])
    .map(function (item) {
      var href = item.href || item;
      var label = item.label || href;
      return "- " + wikilink(pageIdFor(href), label) + " — " + absUrl(href);
    })
    .join("\n");
}

function buildPagesIndex() {
  var seen = {};
  function add(href, source) {
    if (!href || href.indexOf("http") === 0) return;
    var clean = href.split("?")[0];
    if (!seen[clean]) seen[clean] = { href: clean, sources: [] };
    if (seen[clean].sources.indexOf(source) < 0) seen[clean].sources.push(source);
  }
  gsc.forEach(function (href) {
    add(href, "GSC");
  });
  (markets.markets || []).forEach(function (m) {
    add(m.pillarUrl, "silo:" + m.id);
    add(m.landing, "silo:" + m.id);
    (m.moneyUrls || []).forEach(function (u) {
      add(u, "silo:" + m.id);
    });
    (m.blogUrls || []).forEach(function (u) {
      add(u, "silo:" + m.id);
    });
  });
  clusters.forEach(function (c) {
    (c.moneyPages || []).forEach(function (u) {
      add(u, "cluster:" + c.id);
    });
    (c.blog || []).forEach(function (u) {
      add(u, "cluster:" + c.id);
    });
  });
  Object.keys(LT.PARTENARIAT || {}).forEach(function (id) {
    LT.PARTENARIAT[id].forEach(function (l) {
      add(l.href, "maillage:" + id);
    });
  });
  return seen;
}

function siloForPath(href) {
  var clean = String(href || "").split("?")[0];
  var found = null;
  (markets.markets || []).forEach(function (m) {
    var urls = [m.pillarUrl, m.landing].concat(m.moneyUrls || [], m.blogUrls || []);
    urls.forEach(function (u) {
      if (!u) return;
      if (clean === u.split("?")[0]) found = m.id;
    });
  });
  return found;
}

function writePageNotes(index) {
  Object.keys(index)
    .sort()
    .forEach(function (href) {
      var row = index[href];
      var id = noteNameFromPath(href);
      var silo = siloForPath(href);
      var links = row.sources
        .map(function (src) {
          if (src.indexOf("silo:") === 0) return wikilink("Silos/" + src.slice(5));
          if (src.indexOf("cluster:") === 0) return wikilink("Clusters/" + src.slice(8));
          if (src.indexOf("maillage:") === 0) return wikilink("Maillage/" + src.slice(9));
          return src;
        })
        .filter(function (x, i, arr) {
          return arr.indexOf(x) === i;
        });
      var body = [
        yaml({
          generated: true,
          type: "page",
          url: absUrl(href),
          path: href,
          silo: silo || "",
          tags: ["seo", "page"].concat(silo ? ["silo/" + silo] : []),
        }),
        "",
        "# " + id,
        "",
        "URL : " + absUrl(href),
        "",
        silo ? "Silo : " + wikilink("Silos/" + silo) : "Pas de silo niche (page cœur ou locale).",
        "",
        "## Dans le graphe",
        "",
        links.length ? links.map(function (l) { return "- " + l; }).join("\n") : "- Priorité indexation GSC",
        "",
        "Retour : " + wikilink("SEO/MOC SEO"),
      ].join("\n");
      write("Pages/" + id + ".md", body);
    });
  return Object.keys(index).length;
}

function writeSilos() {
  (markets.markets || []).forEach(function (m) {
    var neighbors = (SILO_NEIGHBORS[m.id] || [])
      .map(function (id) {
        return "- " + wikilink(siloTarget(id));
      })
      .join("\n");
    var urls = [];
    if (m.pillarUrl) urls.push({ href: m.pillarUrl, label: "Pilier" });
    if (m.landing) urls.push({ href: m.landing, label: "Landing" });
    (m.moneyUrls || []).forEach(function (u) {
      urls.push({ href: u, label: u });
    });
    (m.blogUrls || []).forEach(function (u) {
      urls.push({ href: u, label: "Article" });
    });
    var externe =
      m.status === "live"
        ? "Netlinking externe autorisé vers le pilier ou la landing, ancre = requête principale ou longue traîne."
        : "Silo planifié : pas de netlinking externe tant que les pages ne sont pas live.";
    var body = [
      yaml({
        generated: true,
        type: "silo",
        id: m.id,
        status: m.status,
        competition: m.competition || "",
        keyword: m.primaryKeyword || "",
        pages: m.pageCount || 0,
        tags: ["seo", "silo", m.status || "silo"],
      }),
      "",
      "# " + m.label,
      "",
      m.whyWin || markets.strategy || "",
      "",
      "- Requête : **" + (m.primaryKeyword || "—") + "**",
      "- Concurrence : " + (m.competition || "—"),
      "- Statut : " + m.status,
      "- Pages : " + (m.pageCount || "—"),
      "",
      "## URLs",
      "",
      bulletLinks(urls),
      "",
      "## Longue traîne",
      "",
      (m.longTail || []).map(function (k) { return "- " + k; }).join("\n") || "- —",
      "",
      "## Silos voisins",
      "",
      neighbors || "- Aucun voisin déclaré",
      "",
      "## Netlinking",
      "",
      externe,
      "",
      "Voir " + wikilink("Netlinking/MOC Netlinking") + " et " + wikilink("Netlinking/Liens entrants") + ".",
    ].join("\n");
    write("Silos/" + m.id + ".md", body);
  });
}

function writeClusters() {
  clusters.forEach(function (c) {
    var urls = (c.moneyPages || []).map(function (u) {
      return { href: u, label: "Money" };
    }).concat(
      (c.blog || []).map(function (u) {
        return { href: u, label: "Article" };
      })
    );
    var body = [
      yaml({
        generated: true,
        type: "cluster",
        id: c.id,
        keyword: c.primary || "",
        priority: c.priority || "",
        competition: c.competition || "",
        tags: ["seo", "cluster"],
      }),
      "",
      "# " + (c.primary || c.id),
      "",
      "Cluster `" + c.id + "` — priorité " + (c.priority || "—") + ", concurrence " + (c.competition || "—") + ".",
      "",
      "## URLs",
      "",
      bulletLinks(urls),
      "",
      "## Longue traîne",
      "",
      (c.longTail || []).map(function (k) { return "- " + k; }).join("\n") || "- —",
      "",
      "MOC : " + wikilink("SEO/MOC SEO"),
    ].join("\n");
    write("Clusters/" + c.id + ".md", body);
  });
}

function writeMaillage() {
  var groups = {
    "canicule-mutuelle": LT.CANICULE_MUTUELLE,
    "pret-refuse": LT.PRET_REFUSE,
    chasse: LT.NICHES_CHASSE,
    equitation: LT.NICHES_EQUITATION,
    animaux: LT.NICHES_ANIMAUX,
    vsp: LT.NICHES_VSP,
    "actu-climat": LT.ACTU_CLIMAT_HABITATION,
    "vtc-idf": LT.VTC_IDF,
    "silos-immo": LT.SILOS_IMMO,
  };
  Object.keys(LT.PARTENARIAT || {}).forEach(function (id) {
    groups["partenariat-" + id] = LT.PARTENARIAT[id];
  });
  var lines = ["# Maillage interne", "", "Chaque groupe est un bloc de liens déjà branché dans `scripts/seo-long-term-related.cjs`, ou à tenir sur les landings partenariat.", ""];
  Object.keys(groups).forEach(function (id) {
    lines.push("- " + wikilink("Maillage/" + id));
    var body = [
      yaml({ generated: true, type: "maillage", id: id, tags: ["seo", "maillage"] }),
      "",
      "# " + id,
      "",
      "Liens du cluster. Les ancres restent descriptives (pas « cliquez ici »).",
      "",
      bulletLinks(groups[id]),
      "",
      "Retour : " + wikilink("Netlinking/Maillage interne"),
    ].join("\n");
    write("Maillage/" + id + ".md", body);
  });
  lines.push("", "Source code : `scripts/seo-long-term-related.cjs`.");
  write("Netlinking/Maillage interne.md", lines.join("\n"));
}

function writeCibles() {
  var rows = CIBLES.map(function (c) {
    return "- [ ] " + wikilink("Netlinking/Cibles/" + c.id, c.titre) + " → `" + c.url + "`";
  });
  write(
    "Netlinking/Liens entrants.md",
    [
      yaml({ generated: true, type: "moc", tags: ["seo", "netlinking"] }),
      "",
      "# Liens entrants",
      "",
      "Un lien éditorial depuis un site du même sujet. Pas de réseau de sites, pas d’achat de liens, pas d’ancres identiques en masse.",
      "",
      "## À faire",
      "",
      rows.join("\n"),
      "",
      "Les silos `planned` ne reçoivent pas de campagne tant que les pages ne sont pas en ligne. Voir " + wikilink("SEO/Silos planifies") + ".",
    ].join("\n")
  );
  CIBLES.forEach(function (c) {
    write(
      "Netlinking/Cibles/" + c.id + ".md",
      [
        yaml({
          generated: true,
          type: "cible",
          cible: c.type,
          url: c.url,
          ancre: c.ancre,
          tags: ["netlinking", "cible", c.type],
        }),
        "",
        "# " + c.titre,
        "",
        "- Type : " + c.type,
        "- URL à faire linker : " + c.url,
        "- Ancre suggérée : **" + c.ancre + "**",
        "- Silo : " + wikilink(siloTarget(c.silo)),
        "",
        c.action,
        "",
        "Liste : " + wikilink("Netlinking/Liens entrants"),
      ].join("\n")
    );
  });
}

function writeMocs(pageCount) {
  var live = (markets.markets || []).filter(function (m) {
    return m.status === "live";
  });
  var planned = (markets.markets || []).filter(function (m) {
    return m.status !== "live";
  });
  write(
    "SEO/MOC SEO.md",
    [
      yaml({ generated: true, type: "moc", tags: ["seo", "moc"] }),
      "",
      "# MOC SEO",
      "",
      markets.strategy || "",
      "",
      "Pages dans le graphe : **" + pageCount + "**.",
      "",
      "## Pourquoi le site reste discret sur Google",
      "",
      (markets.whyNotOnGoogle || []).map(function (r) { return "- " + r; }).join("\n"),
      "",
      "## Silos live",
      "",
      live.map(function (m) { return "- " + wikilink("Silos/" + m.id, m.label) + " — " + (m.primaryKeyword || ""); }).join("\n"),
      "",
      "## Silos planifiés",
      "",
      planned.map(function (m) { return "- " + wikilink("Silos/" + m.id, m.label); }).join("\n"),
      "",
      "Détail : " + wikilink("SEO/Silos planifies"),
      "",
      "## Clusters requêtes",
      "",
      clusters.map(function (c) { return "- " + wikilink("Clusters/" + c.id, c.primary || c.id); }).join("\n"),
      "",
      "## Où ne pas se battre tout de suite",
      "",
      "- « mutuelle santé » seul, « assurance auto », marque « Leads Opportunities »",
      "- Gagner d’abord sur chasse, équitation, VSP, chien pas cher, décennale, padel, Nancy",
      "",
      "Indexation : " + wikilink("SEO/Indexation") + " · Netlinking : " + wikilink("Netlinking/MOC Netlinking"),
    ].join("\n")
  );

  write(
    "SEO/Silos planifies.md",
    [
      yaml({ generated: true, type: "note", tags: ["seo"] }),
      "",
      "# Silos planifiés",
      "",
      "Questionnaire prêt, silo geo pas encore live. On n’envoie pas de liens externes vers ces URLs.",
      "",
      planned
        .map(function (m) {
          return "- " + wikilink("Silos/" + m.id, m.label) + (m.pillarUrl ? " — `" + m.pillarUrl + "`" : "");
        })
        .join("\n"),
    ].join("\n")
  );

  write(
    "SEO/Indexation.md",
    [
      yaml({ generated: true, type: "note", tags: ["seo", "gsc"] }),
      "",
      "# Indexation",
      "",
      "1. Search Console, propriété préfixe `https://www.leadsopportunities.fr/`",
      "2. Sitemap `" + SITE + "/sitemap.xml`",
      "3. Demander l’indexation des URLs GSC (quelques dizaines par jour), en commençant par l’accueil et les silos à concurrence faible.",
      "",
      "Liste machine : `npm run gsc:urls` et `npm run gsc:niches`.",
      "",
      "Les notes " + wikilink("Pages/accueil") + " et les silos live sont la file d’attente. Bing : " + wikilink("Netlinking/Cibles/bing") + ".",
    ].join("\n")
  );

  var gscLinks = gsc
    .filter(function (href) {
      return href.indexOf("http") !== 0;
    })
    .slice(0, 25)
    .map(function (href) {
      return "- " + wikilink(pageIdFor(href), noteNameFromPath(href.split("?")[0]));
    });
  write(
    "SEO/File GSC.md",
    [
      yaml({ generated: true, type: "note", tags: ["seo", "gsc"] }),
      "",
      "# File GSC",
      "",
      "Vingt-cinq premières URLs de `scripts/seo-gsc-priority-urls.cjs`. Le coffre contient une note par URL prioritaire.",
      "",
      gscLinks.join("\n"),
    ].join("\n")
  );

  write(
    "Netlinking/MOC Netlinking.md",
    [
      yaml({ generated: true, type: "moc", tags: ["seo", "netlinking", "moc"] }),
      "",
      "# MOC Netlinking",
      "",
      "Deux couches :",
      "",
      "1. **Maillage interne** — " + wikilink("Netlinking/Maillage interne") + " — blog vers page money, silo vers silo voisin, villes vers le pilier.",
      "2. **Liens entrants** — " + wikilink("Netlinking/Liens entrants") + " — profils, annuaires, partenaires du métier.",
      "",
      "## Règles d’ancre",
      "",
      "- Une ancre = la requête ou une longue traîne du silo (" + wikilink("SEO/MOC SEO") + ").",
      "- Varier : parfois l’URL nue, parfois le nom de la page, parfois la requête.",
      "- Pas la même ancre exacte sur dix domaines.",
      "- Les liens internes du site n’utilisent pas d’UTM.",
      "",
      "## Ordre",
      "",
      "1. Relier les niches partenariat entre elles (ramonage, décennale, immeuble, loisirs, padel, convoyage).",
      "2. Hub VTC ↔ microsite Assurance VTC France.",
      "3. Profils (Google Business, bio, signature).",
      "4. Outreach chasse, équitation, padel, artisans — une demande à la fois, vers la page money.",
      "",
      "Plan : " + wikilink("Netlinking/Plan") + ".",
    ].join("\n")
  );

  write(
    "Netlinking/Plan.md",
    [
      yaml({ generated: true, type: "note", tags: ["seo", "netlinking"] }),
      "",
      "# Plan netlinking",
      "",
      "## Déjà dans le code",
      "",
      "- Clusters blog → hubs dans `scripts/seo-long-term-related.cjs` (chasse, équitation, animaux, VSP, VTC, prêt refusé, canicule).",
      "- Niches partenariat : chaque article de blog pointe vers deux pages voisines, et chaque landing aussi.",
      "- `assurancevtcfrance.com` lie l’accueil LO ; le hub `/assurance-vtc/` renvoie vers le microsite.",
      "",
      "## Cette série de demandes",
      "",
      "- [ ] " + wikilink("Netlinking/Cibles/google-business", "Google Business"),
      "- [ ] " + wikilink("Netlinking/Cibles/facebook", "Bio Facebook") + " et " + wikilink("Netlinking/Cibles/instagram", "Instagram"),
      "- [ ] " + wikilink("Netlinking/Cibles/signature-email", "Signature e-mail"),
      "- [ ] " + wikilink("Netlinking/Cibles/federations-chasse", "Chasse"),
      "- [ ] " + wikilink("Netlinking/Cibles/centres-equestres", "Équitation"),
      "- [ ] " + wikilink("Netlinking/Cibles/clubs-padel", "Padel"),
      "- [ ] " + wikilink("Netlinking/Cibles/cma-artisans", "Artisans / décennale"),
      "- [ ] " + wikilink("SEO/Indexation", "Search Console + sitemap"),
      "",
      "On ne lance pas les silos planifiés (" + wikilink("SEO/Silos planifies") + ") dans cette série.",
    ].join("\n")
  );

  write(
    "Accueil.md",
    [
      yaml({
        generated: true,
        type: "moc",
        tags: ["seo", "moc"],
      }),
      "",
      "# Leads Opportunities — SEO",
      "",
      "Coffre Obsidian du référencement. Ouvrir le dossier `vault/` comme coffre (Fichier → Ouvrir le dossier en tant que coffre).",
      "",
      "Régénérer après un changement de silo ou d’URL : `npm run vault:seo`.",
      "",
      "Les notes dans `Journal/` ne sont pas écrasées.",
      "",
      "## Cartes",
      "",
      "- " + wikilink("SEO/MOC SEO", "SEO — silos, requêtes, indexation"),
      "- " + wikilink("Netlinking/MOC Netlinking", "Netlinking — maillage et liens entrants"),
      "- " + wikilink("SEO/File GSC", "File d’indexation"),
      "- " + wikilink("Netlinking/Plan", "Plan"),
      "- " + wikilink("Journal/Modeles IA", "Modèles IA disponibles ici"),
      "- " + wikilink("Journal/Provenance leads", "Provenance des leads"),
      "- " + wikilink("Journal/Cluster pro et transport", "Cluster pro et transport"),
      "- " + wikilink("Journal/Sections blog", "Sections du blog"),
      "- " + wikilink("Journal/Appels Free", "Appels Free"),
      "- " + wikilink("Journal/Communes de France", "Communes de France"),
      "- " + wikilink("Journal/Actu 17 octobre 2026", "Actu 17 octobre 2026"),
      "- " + wikilink("Journal/n8n reseaux", "n8n réseaux"),
      "",
      "## Graphe",
      "",
      "Ouvrir la vue Graphe. Filtrer par tag `silo`, `maillage` ou `cible`. Les notes de pages prioritaires sont dans `Pages/`.",
    ].join("\n")
  );
}

function writeObsidianConfig() {
  var obs = path.join(vault, ".obsidian");
  fs.mkdirSync(obs, { recursive: true });
  fs.writeFileSync(
    path.join(obs, "app.json"),
    JSON.stringify(
      {
        useMarkdownLinks: false,
        newLinkFormat: "shortest",
        attachmentFolderPath: "Pieces",
        showFrontmatter: true,
        alwaysUpdateLinks: true,
      },
      null,
      2
    ) + "\n"
  );
  fs.writeFileSync(
    path.join(obs, "core-plugins.json"),
    JSON.stringify(
      ["file-explorer", "global-search", "graph", "backlink", "outgoing-link", "tag-pane", "page-preview", "note-composer", "outline", "bookmarks"],
      null,
      2
    ) + "\n"
  );
  fs.writeFileSync(
    path.join(obs, "graph.json"),
    JSON.stringify(
      {
        "collapse-filter": false,
        search: "",
        showTags: true,
        showAttachments: false,
        hideUnresolved: false,
        showOrphans: true,
        "collapse-color-groups": false,
        colorGroups: [
          { query: "tag:#silo", color: { a: 1, rgb: 5431378 } },
          { query: "tag:#netlinking", color: { a: 1, rgb: 14048236 } },
          { query: "tag:#maillage", color: { a: 1, rgb: 3900150 } },
        ],
        "collapse-display": false,
        showArrow: true,
        textFadeMultiplier: 0,
        nodeSizeMultiplier: 1,
        lineSizeMultiplier: 1,
        "collapse-forces": true,
        centerStrength: 0.5,
        repelStrength: 10,
        linkStrength: 1,
        linkDistance: 250,
        scale: 1,
      },
      null,
      2
    ) + "\n"
  );
}

function writeJournalStub() {
  var journal = path.join(vault, "Journal");
  fs.mkdirSync(journal, { recursive: true });
  var keep = path.join(journal, "Notes manuelles.md");
  if (!fs.existsSync(keep)) {
    fs.writeFileSync(
      keep,
      [
        "---",
        "generated: false",
        "tags:",
        "  - journal",
        "---",
        "",
        "# Notes manuelles",
        "",
        "Ce dossier n’est pas régénéré par `npm run vault:seo`.",
        "",
        "Y noter les demandes de liens déjà envoyées et les réponses.",
        "",
      ].join("\n"),
      "utf8"
    );
  }
}

function main() {
  fs.mkdirSync(vault, { recursive: true });
  resetGenerated();
  writeObsidianConfig();
  writeJournalStub();
  var index = buildPagesIndex();
  var pageCount = writePageNotes(index);
  writeSilos();
  writeClusters();
  writeMaillage();
  writeCibles();
  writeMocs(pageCount);
  console.log("Coffre Obsidian : " + vault);
  console.log("Notes de pages : " + pageCount);
  console.log("Silos : " + (markets.markets || []).length + " · clusters : " + clusters.length);
}

main();
