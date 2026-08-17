/**
 * Hubs SEO prêt + recherche : îles, DOM-TOM, destinations françaises.
 */
var Immo = require("./seo-immo-content-lib.cjs");
var LT = require("./seo-long-term-related.cjs");

var PRET_LANDING = "/landings/credit-immo.html";
var SEARCH_LANDING = "/landings/acheteur-immo.html";
var PROJ = "/landings/projection-achat.html";

function destPage(page, data) {
  return page(
    Object.assign(
      {
        theme: "credit",
        benefits: data.benefits || [
          { title: "Courtier ORIAS", text: "Pret, assurance emprunteur et recherche de bien." },
          { title: "Iles & destinations", text: "Corse, Antilles, Reunion, Pacifique, cote, montagne." },
          { title: "A distance", text: "Pieces numeriques, visio, rappel conseiller." },
        ],
        related: data.related || LT.mergeUnique(
          [
            { href: "/pret-immobilier/", label: "Pret immobilier" },
            { href: "/recherche-bien/", label: "Recherche de bien" },
            { href: PRET_LANDING, label: "Simulation pret" },
            { href: SEARCH_LANDING, label: "Lancer une recherche" },
          ],
          LT.PRET_REFUSE.slice(0, 4)
        ),
      },
      data
    )
  );
}

function buildImmoDestinationPages(page, cities) {
  cities = cities || [];
  var pages = [];

  function cityLinks(dir, pred) {
    return cities
      .filter(pred)
      .map(function (c) {
        return { href: "/" + dir + "/" + c.slug + "/", label: c.name };
      });
  }

  var islandSlugs = Object.keys(Immo.ISLAND_REGIONS);
  var destSlugs = Object.keys(Immo.DEST_SLUGS);

  pages.push(
    destPage(page, {
      file: "pret-immobilier/index.html",
      badge: "Pret immobilier",
      title: "Pret immobilier France | Iles, DOM-TOM et toutes les villes",
      description:
        "Pret immobilier partout en France : metropole, Corse, Antilles, Reunion, Guyane, Mayotte, Polynesie, Nouvelle-Caledonie. Simulation, courtier ORIAS.",
      keywords:
        "pret immobilier, pret immobilier ville, pret immobilier ile, pret immobilier outre-mer, courtier credit, simulation pret",
      h1: "Pret immobilier : chaque ville, les iles et les destinations",
      intro:
        "Primo-accedant, investisseur ou residence secondaire : nous etudions votre capacite d emprunt et montons un dossier banque + assurance emprunteur. Metropole, Corse, DOM-TOM et destinations francaises.",
      cta: { href: PRET_LANDING, label: "Simuler mon pret" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Pret immobilier", url: "/pret-immobilier/" },
      ],
      steps: [
        { title: "Projet et budget", text: "Ville, usage (RP, secondaire, locatif), apport." },
        { title: "Faisabilite", text: "Capacite, banques, assurance emprunteur." },
        { title: "Offre de pret", text: "Pieces, negociation, signature." },
      ],
      sections: [
        {
          h2: "Pourquoi une page par ville",
          paragraphs: [
            "Les recherches « pret immobilier + ville » et « pret immobilier Reunion / Martinique / Corse » meritent une reponse locale : marche, usage du bien, particularites outre-mer.",
            "Chaque fiche ville detaille ce que les banques regardent, puis renvoie vers la simulation et la recherche de bien.",
          ],
        },
        {
          h2: "Iles et outre-mer",
          paragraphs: [
            "Nous accompagnons aussi les Francais des iles : residents, metropolitains qui achètent sur place, ou insulaires qui financent un bien en metropole. Pacifique (CFP) : etude au cas par cas.",
          ],
        },
        {
          h2: "Apres un refus de pret",
          paragraphs: [
            "Si une banque a deja refuse votre dossier, consultez nos guides « pret refuse » (endettement, apport, emprunteur sante) puis la landing credit avec l option deuxieme chance.",
          ],
        },
      ],
      hubCityGrid: [
        { href: "/pret-immobilier/iles-francaises/", label: "Iles francaises" },
        { href: "/pret-immobilier/dom-tom/", label: "DOM-TOM & Pacifique" },
        { href: "/pret-immobilier/destinations/", label: "Destinations (cote, montagne)" },
        { href: "/pret-immobilier/villes/", label: "Toutes les villes" },
        { href: "/pret-immobilier/paris/", label: "Paris" },
        { href: "/pret-immobilier/fort-de-france/", label: "Fort-de-France" },
        { href: "/pret-immobilier/saint-denis-reunion/", label: "Saint-Denis Reunion" },
        { href: "/pret-immobilier/ajaccio/", label: "Ajaccio" },
        { href: "/pret-immobilier/papeete/", label: "Papeete" },
        { href: "/pret-immobilier/noumea/", label: "Noumea" },
        { href: "/recherche-bien/", label: "Recherche de bien" },
        { href: PROJ, label: "Projection cout reel" },
        { href: "/landings/credit-immo.html#pret-refuse", label: "Pret refuse — 2e chance" },
      ],
      related: LT.mergeUnique(
        [
          { href: "/recherche-bien/", label: "Recherche de bien" },
          { href: PRET_LANDING, label: "Simulation pret" },
          { href: "/credit-immo/", label: "Guide credit immo" },
          { href: PROJ, label: "Projection cout reel" },
        ],
        LT.PRET_REFUSE
      ),
      faq: [
        {
          q: "Intervenez-vous hors metropole ?",
          a: "Oui : Corse, Antilles, Reunion, Guyane, Mayotte, Saint-Martin, Saint-Barth, Polynesie, Nouvelle-Caledonie, Saint-Pierre-et-Miquelon, Wallis-et-Futuna — selon le circuit bancaire possible.",
        },
        {
          q: "La simulation est-elle gratuite ?",
          a: "Oui, sans engagement.",
        },
        {
          q: "Que faire apres un refus de pret ?",
          a: "Analyser la cause (endettement, apport, assurance, fichiers), corriger le dossier, puis repartir en multibanque avec un courtier.",
        },
      ],
    })
  );

  pages.push(
    destPage(page, {
      file: "recherche-bien/index.html",
      badge: "Recherche de bien",
      title: "Recherche de bien immobilier | Alerte acquéreur ville par ville",
      description:
        "Appartements et maisons a vendre en France : alerte acquereur (tel. + e-mail), visites, matching. Metropole, Corse, DOM-TOM. Pret optionnel.",
      keywords: "appartements a vendre, alerte immobilier, recherche bien, acheter appartement, maisons a vendre",
      h1: "Appartements et maisons : alerte acquéreur, ville par ville",
      intro:
        "Creez une alerte (ville, telephone, e-mail) : on vous previent des qu un mandat correspond. Les vendeurs rejoignent un vivier d acquereurs — pas une vitrine vide. Le pret reste optionnel.",
      cta: { href: SEARCH_LANDING + "#alerte", label: "Creer mon alerte" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Recherche de bien", url: "/recherche-bien/" },
      ],
      steps: [
        { title: "Alerte", text: "Ville, telephone, e-mail — 30 secondes." },
        { title: "Visites", text: "Mandats qui matchent vos criteres." },
        { title: "Offre", text: "Pret et assurances seulement si besoin." },
      ],
      sections: [
        {
          h2: "Pourquoi l alerte avant la vitrine",
          paragraphs: [
            "Sans acquereurs visibles, un vendeur n a aucune raison de deposer. Nous inversons : d abord un vivier d acheteurs (alerte tel. + e-mail), ensuite les mandats. Pas de scraping Leboncoin ou SeLoger.",
          ],
        },
      ],
      hubCityGrid: [
        { href: "/recherche-bien/iles-francaises/", label: "Iles francaises" },
        { href: "/recherche-bien/dom-tom/", label: "DOM-TOM & Pacifique" },
        { href: "/recherche-bien/destinations/", label: "Destinations" },
        { href: "/recherche-bien/villes/", label: "Toutes les villes" },
        { href: SEARCH_LANDING + "#alerte", label: "Alerte acquereur" },
        { href: "/pret-immobilier/", label: "Pret immobilier" },
        { href: PROJ, label: "Projection cout reel" },
      ],
      related: LT.mergeUnique(
        [
          { href: SEARCH_LANDING + "#alerte", label: "Alerte acquereur" },
          { href: "/recherche-bien/villes/", label: "Recherche par ville" },
          { href: "/pret-immobilier/", label: "Pret immobilier" },
          { href: PRET_LANDING, label: "Simulation pret" },
          { href: PROJ, label: "Projection cout reel" },
        ],
        LT.ACQUEREUR_IMMO ? LT.ACQUEREUR_IMMO.slice(0, 4) : [],
        LT.PRET_REFUSE.slice(0, 2),
        LT.SILOS_IMMO
      ),
      faq: [
        {
          q: "Comment etre alerte d un bien ?",
          a: "Laissez telephone et e-mail + votre ville. Un conseiller confirme les criteres et vous previent des qu un mandat correspond.",
        },
        {
          q: "Pourquoi la grille est parfois vide ?",
          a: "Nous n importons pas les portails. Les biens affiches sont des mandats deposes ici. L alerte sert justement a ne pas attendre une vitrine pleine.",
        },
        {
          q: "Je vends : puis-je deposer ?",
          a: "Oui, parcours vendeur / depot. Les acquereurs alertes sont deja la — c est l offre inversee.",
        },
      ],
    })
  );

  function islandHub(dir, landing, label, cta) {
    return destPage(page, {
      file: dir + "/iles-francaises/index.html",
      badge: "Iles francaises",
      title: label + " dans les iles francaises | Corse, Re, Oleron, Antilles…",
      description:
        label +
        " iles francaises : Corse, Ile de Re, Oleron, Belle-Ile, Noirmoutier, Antilles, Reunion. Courtier ORIAS.",
      keywords: "pret immobilier ile, achat maison corse, villa reunion, ile de re credit",
      h1: label + " : iles francaises",
      intro:
        "Corse, iles atlantiques, Antilles, Reunion, Pacifique : chaque ile a son marche et son circuit de financement. Nous accompagnons residents et metropolitains.",
      cta: { href: landing, label: cta },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: label, url: "/" + dir + "/" },
        { name: "Iles francaises", url: "/" + dir + "/iles-francaises/" },
      ],
      sections: [
        {
          h2: "Quelles iles ?",
          paragraphs: [
            "Corse (Ajaccio, Bastia, Porto-Vecchio, Bonifacio, Calvi), Ile de Re et Oleron, Belle-Ile, Noirmoutier, Martinique, Guadeloupe, Reunion, Saint-Martin, Saint-Barth, Polynesie, Nouvelle-Caledonie.",
          ],
        },
      ],
      hubCityGrid: cityLinks(dir, function (c) {
        return islandSlugs.indexOf(c.regionSlug) >= 0 || destSlugs.indexOf(c.slug) >= 0;
      }),
      related: [
        { href: "/" + dir + "/dom-tom/", label: "DOM-TOM & Pacifique" },
        { href: "/" + dir + "/destinations/", label: "Destinations" },
        { href: "/" + dir + "/villes/", label: "Toutes les villes" },
      ],
      faq: [
        {
          q: "Un pret metropole suffit-il pour acheter sur une ile ?",
          a: "Parfois oui (Corse, Re, Oleron, DOM). Pacifique (CFP) : circuit local, etude au cas par cas.",
        },
      ],
    });
  }

  function domHub(dir, landing, label, cta) {
    return destPage(page, {
      file: dir + "/dom-tom/index.html",
      badge: "Outre-mer",
      title: label + " DOM-TOM | Antilles, Reunion, Guyane, Pacifique",
      description:
        label +
        " outre-mer : Martinique, Guadeloupe, Reunion, Guyane, Mayotte, Polynesie, Nouvelle-Caledonie, Saint-Martin, Saint-Barth.",
      keywords: "pret immobilier reunion, pret immobilier martinique, credit papeete, noumea immobilier",
      h1: label + " en outre-mer et dans le Pacifique",
      intro:
        "DROM (Antilles, Reunion, Guyane, Mayotte) et COM (Polynesie, Nouvelle-Caledonie, Saint-Martin, Saint-Barth, Saint-Pierre, Wallis). Accompagnement a distance, pieces numeriques.",
      cta: { href: landing, label: cta },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: label, url: "/" + dir + "/" },
        { name: "DOM-TOM", url: "/" + dir + "/dom-tom/" },
      ],
      sections: [
        {
          h2: "Ce que nous clarifions",
          paragraphs: [
            "Usage du bien, devise (euro / CFP), banques locales vs reseaux nationaux, assurance emprunteur, et realisme du budget. Pas de promesse de taux unique.",
          ],
        },
      ],
      hubCityGrid: cityLinks(dir, function (c) {
        return (
          ["martinique", "guadeloupe", "la-reunion", "guyane", "mayotte", "polynesie-francaise", "nouvelle-caledonie", "saint-martin", "saint-barthelemy", "saint-pierre-et-miquelon", "wallis-et-futuna"].indexOf(
            c.regionSlug
          ) >= 0
        );
      }),
      related: [
        { href: "/" + dir + "/iles-francaises/", label: "Toutes les iles" },
        { href: "/" + dir + "/villes/", label: "Toutes les villes" },
      ],
      faq: [
        {
          q: "Polynesie et Nouvelle-Caledonie ?",
          a: "Oui, pour cadrer le projet et le budget. Le pret en franc CFP passe souvent par des etablissements locaux : nous l expliquons sans fausse promesse.",
        },
      ],
    });
  }

  function destHub(dir, landing, label, cta) {
    return destPage(page, {
      file: dir + "/destinations/index.html",
      badge: "Destinations",
      title: label + " destinations | Cote d Azur, Re, montagne, bassin",
      description:
        label +
        " destinations francaises : Saint-Tropez, Cannes, Ile de Re, Arcachon, Chamonix, Deauville. Secondaire et locatif.",
      keywords: "pret immobilier saint-tropez, achat ile de re, villa cannes, chalet chamonix",
      h1: label + " : destinations cote et montagne",
      intro:
        "Cote d Azur, iles atlantiques, bassin d Arcachon, cote basque, Deauville, Alpes : marches de destinations. Les banques distinguent RP, secondaire et saisonnier.",
      cta: { href: landing, label: cta },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: label, url: "/" + dir + "/" },
        { name: "Destinations", url: "/" + dir + "/destinations/" },
      ],
      sections: [
        {
          h2: "Secondaire et locatif",
          paragraphs: [
            "Un dossier « je louerai tout l ete » ne suffit pas. Nous calons apport, vacance locative et plan B avant l offre.",
          ],
        },
      ],
      hubCityGrid: cityLinks(dir, function (c) {
        return destSlugs.indexOf(c.slug) >= 0;
      }),
      related: [
        { href: "/" + dir + "/iles-francaises/", label: "Iles" },
        { href: "/" + dir + "/villes/", label: "Toutes les villes" },
      ],
      faq: [],
    });
  }

  pages.push(islandHub("pret-immobilier", PRET_LANDING, "Pret immobilier", "Simuler un pret ile"));
  pages.push(domHub("pret-immobilier", PRET_LANDING, "Pret immobilier", "Etude pret outre-mer"));
  pages.push(destHub("pret-immobilier", PRET_LANDING, "Pret immobilier", "Simulation destination"));
  pages.push(islandHub("recherche-bien", SEARCH_LANDING + "#alerte", "Recherche de bien", "Alerte sur une ile"));
  pages.push(domHub("recherche-bien", SEARCH_LANDING + "#alerte", "Recherche de bien", "Alerte outre-mer"));
  pages.push(destHub("recherche-bien", SEARCH_LANDING + "#alerte", "Recherche de bien", "Alerte destination"));

  return pages;
}

function getImmoDestinationSitemapEntries(base) {
  var paths = [
    "/pret-immobilier/",
    "/pret-immobilier/iles-francaises/",
    "/pret-immobilier/dom-tom/",
    "/pret-immobilier/destinations/",
    "/recherche-bien/",
    "/recherche-bien/iles-francaises/",
    "/recherche-bien/dom-tom/",
    "/recherche-bien/destinations/",
    "/landings/acheteur-immo.html",
    "/landings/credit-immo.html",
    "/landings/projection-achat.html",
  ];
  var today = new Date().toISOString().slice(0, 10);
  return paths.map(function (p, i) {
    return {
      loc: base + p,
      lastmod: today,
      changefreq: "weekly",
      priority: i < 2 ? "0.94" : "0.9",
    };
  });
}

module.exports = {
  buildImmoDestinationPages: buildImmoDestinationPages,
  getImmoDestinationSitemapEntries: getImmoDestinationSitemapEntries,
};
