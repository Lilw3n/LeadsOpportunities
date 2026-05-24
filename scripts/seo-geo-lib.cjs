/**
 * Pages locales SEO — toutes les grandes villes de France (metropole + DOM).
 */
const fs = require("fs");
const path = require("path");

const GEO_PRODUCTS = [
  {
    key: "vtc",
    theme: "vtc",
    dir: "assurance-vtc",
    siloLabel: "Assurance VTC",
    siloUrl: "/assurance-vtc/",
    hubUrl: "/assurance-vtc/villes/",
    landing: "/landings/vtc.html",
    ctaLabel: function (city) {
      return "Devis VTC " + city.name;
    },
    title: function (city) {
      return "Assurance VTC " + city.name + " | Devis chauffeur " + city.region;
    },
    description: function (city) {
      return (
        "Assurance VTC a " +
        city.name +
        " (" +
        city.region +
        ") : devis rapide, RC pro, garanties adaptees. Courtier ORIAS, chauffeurs Uber, Bolt, Heetch."
      );
    },
    h1: function (city) {
      return "Assurance VTC a " + city.name;
    },
    intro: function (city) {
      return (
        "Chauffeur VTC base a " +
        city.name +
        " ? Nous comparons les offres du marche pour votre zone (" +
        city.region +
        ") et vous accompagnons jusqu a la souscription, sans engagement."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Pourquoi une assurance dediee a " + city.name + " ?",
          paragraphs: [
            "Les assureurs integrent la zone d exercice dans le tarif. Un profil base a " +
              city.name +
              " ne se compare pas a un exercice dans une autre region.",
            "Nous verifions RC pro, franchises et options (vehicule de remplacement, protection juridique) avant toute recommandation.",
          ],
        },
        {
          h2: "Accompagnement partout en France",
          paragraphs: [
            "Notre equipe couvre la metropole et les DOM. Vous beneficiez du meme niveau de conseil, que vous soyez en creation d activite ou chauffeur confirme.",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "Intervenez-vous bien a " + city.name + " ?",
          a: "Oui, nous accompagnons les chauffeurs VTC a " + city.name + " et dans toute la region " + city.region + ".",
        },
        {
          q: "Combien de temps pour un devis ?",
          a: "En moyenne sous 15 minutes en heures ouvrables apres votre demande en ligne.",
        },
      ];
    },
  },
  {
    key: "sante",
    theme: "sante",
    dir: "assurance-sante",
    siloLabel: "Mutuelle sante",
    siloUrl: "/assurance-sante/",
    hubUrl: "/assurance-sante/villes/",
    landing: "/landings/sante.html",
    ctaLabel: function (city) {
      return "Devis mutuelle " + city.name;
    },
    title: function (city) {
      return "Mutuelle sante " + city.name + " | Comparatif " + city.region;
    },
    description: function (city) {
      return (
        "Mutuelle sante a " +
        city.name +
        " : comparatif optique, dentaire, hospitalisation. Courtier ORIAS, devis gratuit pour particuliers et independants."
      );
    },
    h1: function (city) {
      return "Mutuelle sante a " + city.name;
    },
    intro: function (city) {
      return (
        "Residents de " +
        city.name +
        ", familles et independants : nous calibrons votre mutuelle selon vos postes de soins prioritaires (optique, dentaire, hospitalisation) avec un comparatif clair."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Choisir sa mutuelle a " + city.name,
          paragraphs: [
            "Le prix seul est trompeur : deux contrats peuvent afficher la meme cotisation avec des remboursements optique ou dentaire tres differents.",
            "Nous partons de votre usage reel pour proposer des garanties equilibrees a " + city.name + " et en " + city.region + ".",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "Puis-je comparer plusieurs mutuelles depuis " + city.name + " ?",
          a: "Oui, le comparatif et le conseil initial sont gratuits et sans engagement.",
        },
      ];
    },
  },
  {
    key: "credit",
    theme: "credit",
    dir: "credit-immo",
    siloLabel: "Credit immobilier",
    siloUrl: "/credit-immo/",
    hubUrl: "/credit-immo/villes/",
    landing: "/landings/credit-immo.html",
    ctaLabel: function (city) {
      return "Simulation credit " + city.name;
    },
    title: function (city) {
      return "Credit immobilier " + city.name + " | Courtier " + city.region;
    },
    description: function (city) {
      return (
        "Credit immobilier a " +
        city.name +
        " : simulation, capacite d emprunt, negociation de taux. Courtier ORIAS, primo-accedants et investisseurs."
      );
    },
    h1: function (city) {
      return "Credit immobilier a " + city.name;
    },
    intro: function (city) {
      return (
        "Projet d achat ou investissement locatif a " +
        city.name +
        " ? Nous analysons votre capacite d emprunt et identifions les banques les plus favorables a votre profil en " +
        city.region +
        "."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Financer un bien a " + city.name,
          paragraphs: [
            "Marche local, apport, assurance emprunteur : chaque element compte dans l acceptation du dossier. Nous vous aidons a presenter un financement credible.",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "La simulation est-elle gratuite ?",
          a: "Oui, la premiere analyse de faisabilite est gratuite et sans obligation.",
        },
      ];
    },
  },
];

function buildGeoPageConfigs(cities, pageFn) {
  const out = [];
  GEO_PRODUCTS.forEach(function (product) {
    cities.forEach(function (city) {
      out.push(
        pageFn({
          file: product.dir + "/" + city.slug + "/index.html",
          theme: product.theme,
          badge: city.region,
          title: product.title(city),
          description: product.description(city),
          h1: product.h1(city),
          intro: product.intro(city),
          cta: { href: product.landing, label: product.ctaLabel(city) },
          city: city,
          crumbs: [
            { name: "Accueil", url: "/" },
            { name: product.siloLabel, url: product.siloUrl },
            { name: city.name, url: "/" + product.dir + "/" + city.slug + "/" },
          ],
          benefits: [
            { title: "Couverture nationale", text: "Conseil identique en metropole et DOM." },
            { title: "Reponse rapide", text: "Rappel sous 15 min en heures ouvrables." },
            { title: "ORIAS", text: "Courtier enregistre, devis sans engagement." },
          ],
          sections: product.sections(city),
          related: [
            { href: product.hubUrl, label: "Toutes les villes" },
            { href: product.siloUrl, label: "Guide national" },
            { href: "/france/", label: "Couverture France" },
          ],
          faq: product.faq(city),
        })
      );
    });
  });
  return out;
}

function buildHubPageConfigs(cities, pageFn) {
  const out = [];
  GEO_PRODUCTS.forEach(function (product) {
    const cityLinks = cities
      .slice()
      .sort(function (a, b) {
        return a.name.localeCompare(b.name, "fr");
      })
      .map(function (c) {
        return {
          href: "/" + product.dir + "/" + c.slug + "/",
          label: product.siloLabel.split(" ")[0] + " " + c.name,
        };
      });

    out.push(
      pageFn({
        file: product.dir + "/villes/index.html",
        theme: product.theme,
        badge: "France entiere",
        title: product.siloLabel + " par ville | Toute la France",
        description:
          product.siloLabel +
          " dans plus de " +
          cities.length +
          " villes en France (metropole et DOM). Devis gratuit, courtier ORIAS.",
        h1: product.siloLabel + " : nos villes couvertes",
        intro:
          "Selectionnez votre ville pour acceder a une page dediee (devis, FAQ, conseils locaux). Nous accompagnons les clients partout en France.",
        cta: { href: product.landing, label: "Demander un devis" },
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: product.siloLabel, url: product.siloUrl },
          { name: "Villes", url: product.hubUrl },
        ],
        related: cityLinks.slice(0, 24).concat([
          { href: product.siloUrl, label: "Page pilier nationale" },
          { href: "/france/", label: "Couverture nationale" },
        ]),
        faq: [
          {
            q: "Couvrez-vous toute la France ?",
            a: "Oui, metropole et DOM. Si votre ville n est pas listee, contactez-nous : nous traitons aussi les communes voisines.",
          },
        ],
        hubCityGrid: cityLinks,
      })
    );
  });

  const allCityLinks = [];
  GEO_PRODUCTS.forEach(function (product) {
    cities.forEach(function (c) {
      allCityLinks.push({
        href: "/" + product.dir + "/" + c.slug + "/",
        label: product.key === "vtc" ? "VTC" : product.key === "sante" ? "Sante" : "Credit",
        city: c.name,
      });
    });
  });

  out.push(
    pageFn({
      file: "france/index.html",
      theme: "vtc",
      badge: "SEO France",
      title: "Courtier assurance et credit partout en France | Leads Opportunities",
      description:
        "Devis assurance VTC, mutuelle sante et credit immobilier dans toute la France : metropole et DOM. Plus de 50 villes, courtier ORIAS.",
      h1: "Present partout en France",
      intro:
        "Notre objectif : vous permettre de trouver Leads Opportunities sur votre ville, votre region et votre besoin (VTC, sante, credit immo). Chaque page locale est optimisee pour un devis rapide et un conseil humain.",
      cta: { href: "/nos-services.html", label: "Voir tous nos services" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
      ],
      sections: [
        {
          h2: "Nos 3 expertises nationales",
          list: [
            "Assurance VTC — chauffeurs et creation d activite",
            "Mutuelle sante — particuliers, familles, independants",
            "Credit immobilier — primo-accedants et investisseurs",
          ],
        },
      ],
      related: [
        { href: "/assurance-vtc/villes/", label: "Villes VTC" },
        { href: "/assurance-sante/villes/", label: "Villes mutuelle" },
        { href: "/credit-immo/villes/", label: "Villes credit immo" },
      ],
      faq: [
        {
          q: "Pourquoi des pages par ville ?",
          a: "Pour repondre aux recherches locales (ex. assurance VTC Lyon) avec un contenu utile et un parcours de devis dedie.",
        },
      ],
      hubProducts: GEO_PRODUCTS.map(function (p) {
        return { href: p.hubUrl, label: p.siloLabel + " — annuaire villes" };
      }),
    })
  );

  return out;
}

function collectSitemapUrls(cities, base) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: base + "/", priority: "1.0", changefreq: "weekly" },
    { loc: base + "/france/", priority: "0.95", changefreq: "weekly" },
    { loc: base + "/nos-services.html", priority: "0.95", changefreq: "weekly" },
    { loc: base + "/landings/vtc.html", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/landings/sante.html", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/landings/credit-immo.html", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/landings/devis.html", priority: "0.85", changefreq: "weekly" },
    { loc: base + "/landings/devis-rapide.html", priority: "0.85", changefreq: "weekly" },
    { loc: base + "/assurance-vtc/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-vtc/devis-rapide/", priority: "0.87", changefreq: "weekly" },
    { loc: base + "/assurance-vtc/tarif/", priority: "0.82", changefreq: "weekly" },
    { loc: base + "/assurance-vtc/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-sante/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-sante/comparatif/", priority: "0.87", changefreq: "weekly" },
    { loc: base + "/assurance-sante/remboursement-optique/", priority: "0.78", changefreq: "monthly" },
    { loc: base + "/assurance-sante/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/credit-immo/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/credit-immo/simulation/", priority: "0.87", changefreq: "weekly" },
    { loc: base + "/credit-immo/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/blog/", priority: "0.8", changefreq: "weekly" },
    { loc: base + "/blog/assurance-vtc-moins-cher-2026.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/mutuelle-sante-5-criteres.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/pret-immo-erreurs-a-eviter.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/mentions-legales.html", priority: "0.3", changefreq: "yearly" },
    { loc: base + "/politique-confidentialite.html", priority: "0.35", changefreq: "yearly" },
    { loc: base + "/cgu.html", priority: "0.3", changefreq: "yearly" },
  ];

  GEO_PRODUCTS.forEach(function (product) {
    cities.forEach(function (city) {
      urls.push({
        loc: base + "/" + product.dir + "/" + city.slug + "/",
        priority: city.slug === "paris" ? "0.8" : "0.72",
        changefreq: "monthly",
      });
    });
  });

  return urls.map(function (u) {
    return Object.assign({ lastmod: today }, u);
  });
}

function writeSitemap(urls, outFile) {
  const body = urls
    .map(function (u) {
      return (
        "  <url>\n    <loc>" +
        u.loc +
        "</loc>\n    <lastmod>" +
        u.lastmod +
        "</lastmod>\n    <changefreq>" +
        u.changefreq +
        "</changefreq>\n    <priority>" +
        u.priority +
        "</priority>\n  </url>"
      );
    })
    .join("\n");

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    "\n</urlset>\n";
  fs.writeFileSync(outFile, xml, "utf8");
}

module.exports = {
  GEO_PRODUCTS,
  buildGeoPageConfigs,
  buildHubPageConfigs,
  collectSitemapUrls,
  writeSitemap,
};
