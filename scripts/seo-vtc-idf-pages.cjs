/**
 * Pages SEO VTC Île-de-France : hub régional, aéroports, La Défense, gares, arrondissements.
 */
var Img = require("./seo-images-lib.cjs");

var LANDING = "/landings/vtc.html";
var BASE = "/assurance-vtc/";

var ARRONDISSEMENTS = [
  { n: 1, slug: "paris-1er", name: "Paris 1er", zone: "Louvre, Palais-Royal, Les Halles", angle: "hôtels, touristes et sièges autour du Louvre : beaucoup de courses courtes et de prises en charge hôtelières." },
  { n: 2, slug: "paris-2e", name: "Paris 2e", zone: "Bourse, Grands Boulevards", angle: "quartiers d affaires et salles de spectacle : pics le soir et en semaine aux heures de bureau." },
  { n: 3, slug: "paris-3e", name: "Paris 3e", zone: "Haut Marais", angle: "ruelles, restaurants et clientèle loisir : stationnement tendu, RC Pro et bris de glace comptent." },
  { n: 4, slug: "paris-4e", name: "Paris 4e", zone: "Marais, Île de la Cité, Hôtel de Ville", angle: "cœur historique, ponts et hôtels : forte densité de courses touristiques." },
  { n: 5, slug: "paris-5e", name: "Paris 5e", zone: "Quartier latin", angle: "universités, hôtels rive gauche : mix loisir / congrès, surtout le week-end." },
  { n: 6, slug: "paris-6e", name: "Paris 6e", zone: "Saint-Germain-des-Prés", angle: "hôtellerie haut de gamme et soirées : profil de risque plutôt urbain, kilométrage souvent court." },
  { n: 7, slug: "paris-7e", name: "Paris 7e", zone: "Tour Eiffel, Invalides", angle: "un des secteurs les plus photographiés au monde : transferts hôtels / aéroports fréquents." },
  { n: 8, slug: "paris-8e", name: "Paris 8e", zone: "Champs-Élysées, Madeleine", angle: "sièges, palaces et événements : courses corporate et soirées, véhicules berline souvent demandés." },
  { n: 9, slug: "paris-9e", name: "Paris 9e", zone: "Opéra, Grands Magasins", angle: "shopping et théâtres : flux journée + sorties, idéal pour un contrat VTC temps plein." },
  { n: 10, slug: "paris-10e", name: "Paris 10e", zone: "Gare du Nord, Gare de l Est", angle: "deux gares internationales : files, Eurostar, Thalys — l assurance doit coller aux plateformes." },
  { n: 11, slug: "paris-11e", name: "Paris 11e", zone: "Oberkampf, Bastille", angle: "vie nocturne dense : plus de courses tardives, pensez à la garantie conducteur." },
  { n: 12, slug: "paris-12e", name: "Paris 12e", zone: "Gare de Lyon, Bercy, Nation", angle: "TGV Sud-Est et Accor Arena : pics événements et correspondances Lyon / Marseille." },
  { n: 13, slug: "paris-13e", name: "Paris 13e", zone: "Bibliothèque, Olympiades, Austerlitz", angle: "tours, gare Austerlitz et Chinatown : mix résidentiel et business." },
  { n: 14, slug: "paris-14e", name: "Paris 14e", zone: "Montparnasse, Denfert", angle: "Gare Montparnasse (Ouest / Atlantique) : flux provinciaux réguliers." },
  { n: 15, slug: "paris-15e", name: "Paris 15e", zone: "Porte de Versailles, Beaugrenelle", angle: "arrondissement le plus peuplé : parc expo, hôtels et résidence — volume de courses élevé." },
  { n: 16, slug: "paris-16e", name: "Paris 16e", zone: "Trocadéro, Auteuil, Porte Maillot", angle: "clientèle résidentielle et palaces : berlines, transferts aéroports, image véhicule importante." },
  { n: 17, slug: "paris-17e", name: "Paris 17e", zone: "Batignolles, Ternes, Porte de Champerret", angle: "mix familles / bureaux, accès A1 / périphérique nord." },
  { n: 18, slug: "paris-18e", name: "Paris 18e", zone: "Montmartre, Barbès, Porte de la Chapelle", angle: "tourisme Sacré-Cœur et accès A1 : courses loisir + liaisons Saint-Denis / CDG." },
  { n: 19, slug: "paris-19e", name: "Paris 19e", zone: "La Villette, Buttes-Chaumont", angle: "événements Villette et parc : week-ends chargés, liaisons 93." },
  { n: 20, slug: "paris-20e", name: "Paris 20e", zone: "Belleville, Père-Lachaise, Porte de Bagnolet", angle: "A3 / Bagnolet : entrée Est de Paris, flux banlieue Est et Marne." },
];

function lt(page, data) {
  var hero = data.heroImage || Img.VTC_ASSETS.paris;
  return page(
    Object.assign(
      {
        theme: "vtc",
        cta: { href: LANDING, label: data.ctaLabel || "Devis VTC Île-de-France" },
        heroImage: hero,
        ogImage: Img.VTC_ASSETS.og.file,
        gallery: data.gallery || [Img.VTC_ASSETS.chauffeur, Img.VTC_ASSETS.voiture, Img.VTC_ASSETS.smartphone],
        benefits: [
          { title: "Courtier ORIAS", text: "Conseil spécialisé chauffeurs VTC Paris et petite couronne." },
          { title: "Compatible plateformes", text: "Uber, Bolt, Heetch — RC Pro et véhicule alignés." },
          { title: "Devis gratuit", text: "Comparatif sans engagement, rappel rapide." },
        ],
        related: data.related || [
          { href: BASE + "ile-de-france/", label: "Hub VTC Île-de-France" },
          { href: BASE + "paris/", label: "Assurance VTC Paris" },
          { href: BASE + "villes/", label: "Toutes les villes" },
          { href: LANDING, label: "Devis express" },
        ],
      },
      data
    )
  );
}

function buildVtcIdfPages(page) {
  var pages = [];

  pages.push(
    lt(page, {
      file: "assurance-vtc/ile-de-france/index.html",
      badge: "Île-de-France",
      title: "Assurance VTC Île-de-France | Paris, 75, 92, 93, 94, 77, 78, 91, 95",
      description:
        "Assurance VTC en Île-de-France : Paris, petite et grande couronne, CDG, Orly, La Défense. Devis chauffeur Uber Bolt, courtier ORIAS.",
      keywords:
        "assurance VTC Île-de-France, assurance VTC Paris, devis chauffeur VTC 75, VTC CDG Orly, Uber Paris",
      h1: "Assurance VTC en Île-de-France : Paris et toute la région",
      intro:
        "La région concentre l essentiel de l activité VTC française : aéroports, gares, La Défense, périphérique. Nous comparons RC Pro, véhicule et franchises pour les chauffeurs basés à Paris et en couronne.",
      heroImage: Img.VTC_ASSETS.paris,
      gallery: [
        Img.VTC_ASSETS.paris,
        Img.VTC_ASSETS.aeroport,
        Img.VTC_ASSETS.defense,
        Img.VTC_ASSETS.gare,
      ],
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Île-de-France", url: BASE + "ile-de-france/" },
      ],
      sections: [
        {
          h2: "Pourquoi l Île-de-France change votre tarif VTC",
          paragraphs: [
            "Trafic, stationnement, sinistralité urbaine et kilométrage aéroport : les assureurs notent autrement un chauffeur qui circule 6 jours sur 7 entre Paris, Roissy et Orly qu un chauffeur de ville moyenne.",
            "Nous calibrons le contrat sur votre zone réelle (Paris intramuros, petite couronne, grande couronne) et vos plateformes — pas sur une case générique auto perso.",
          ],
          list: [
            "Paris 75 et 20 arrondissements",
            "Hauts-de-Seine 92 — La Défense, Neuilly, Boulogne",
            "Seine-Saint-Denis 93 — Saint-Denis, CDG via A1",
            "Val-de-Marne 94 — Orly, Rungis, Créteil",
            "Grande couronne 77, 78, 91, 95",
          ],
          figure: Img.VTC_ASSETS.route,
        },
        {
          h2: "Aéroports, gares et business : les flux qui paient",
          paragraphs: [
            "CDG, Orly, Gare du Nord, Gare de Lyon, Montparnasse, La Défense : ce sont les corridors où un contrat mal rédigé (franchise, véhicule de remplacement, usage pro) se voit tout de suite.",
            "Un devis VTC Île-de-France utile pose ces questions : temps plein ou mixte, berline ou van, nuit, aéroports, antécédents.",
          ],
          figure: Img.VTC_ASSETS.aeroport,
        },
      ],
      related: [
        { href: BASE + "paris/", label: "VTC Paris" },
        { href: BASE + "aeroport-cdg/", label: "VTC aéroport CDG" },
        { href: BASE + "aeroport-orly/", label: "VTC aéroport Orly" },
        { href: BASE + "la-defense/", label: "VTC La Défense" },
        { href: BASE + "paris-gares/", label: "VTC gares parisiennes" },
        { href: BASE + "uber-paris/", label: "Uber / Bolt Paris" },
        { href: BASE + "departement/hauts-de-seine/", label: "VTC 92" },
        { href: BASE + "departement/seine-saint-denis/", label: "VTC 93" },
      ],
      faq: [
        {
          q: "Couvrez-vous toute l Ile-de-France ?",
          a: "Oui : Paris, petite et grande couronne, CDG, Orly, La Defense. Devis en ligne puis rappel conseiller.",
        },
        {
          q: "Uber et Bolt acceptent-ils votre attestation ?",
          a: "Nous calibrons un contrat VTC (transport de personnes a titre onereux) compatible avec les exigences habituelles des plateformes.",
        },
        {
          q: "Le devis est-il gratuit ?",
          a: "Oui, sans engagement. Vous comparez les garanties avant de signer.",
        },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/aeroport-cdg/index.html",
      badge: "Aéroport CDG",
      title: "Assurance VTC aéroport CDG Roissy | Devis chauffeur",
      description:
        "Assurance VTC pour les courses Roissy-Charles de Gaulle : A1, Gonesse, files aéroport. RC Pro, véhicule, courtier ORIAS.",
      h1: "Assurance VTC aéroport CDG (Roissy)",
      intro:
        "Les liaisons Paris — CDG cumulent kilométrage, files, bagages et horaires décalés. Votre contrat doit coller à cet usage, pas à une auto du dimanche.",
      heroImage: Img.VTC_ASSETS.aeroport,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Île-de-France", url: BASE + "ile-de-france/" },
        { name: "CDG", url: BASE + "aeroport-cdg/" },
      ],
      sections: [
        {
          h2: "Ce que les assureurs regardent sur CDG",
          paragraphs: [
            "Fréquence aéroport, véhicule (berline, van, break), stationnement, sinistres parking / bris de glace. Un chauffeur CDG n a pas le même profil qu un chauffeur centre-ville uniquement.",
            "Nous indiquons clairement l usage transport de personnes à titre onéreux — obligatoire pour Uber, Bolt et Heetch.",
          ],
          list: [
            "Liaisons Paris intramuros ↔ terminaux 1, 2, 3",
            "Chauffeurs basés à Gonesse, Roissy-en-France, Tremblay, Saint-Denis",
            "Nuit, early, correspondances",
          ],
        },
      ],
      related: [
        { href: BASE + "ile-de-france/", label: "Hub Île-de-France" },
        { href: BASE + "aeroport-orly/", label: "Aéroport Orly" },
        { href: BASE + "gonesse/", label: "VTC Gonesse" },
        { href: BASE + "roissy-en-france/", label: "VTC Roissy-en-France" },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/aeroport-orly/index.html",
      badge: "Aéroport Orly",
      title: "Assurance VTC aéroport Orly | Devis chauffeur 94",
      description:
        "Assurance VTC Orly : Rungis, A6, Val-de-Marne. Devis chauffeur, RC Pro, courtier ORIAS.",
      h1: "Assurance VTC aéroport d Orly",
      intro:
        "Orly, Rungis et le sud francilien : flux passagers + logistique. Un contrat VTC propre évite les refus de prise en charge après un sinistre sur parking aéroport.",
      heroImage: Img.VTC_ASSETS.aeroport,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Île-de-France", url: BASE + "ile-de-france/" },
        { name: "Orly", url: BASE + "aeroport-orly/" },
      ],
      sections: [
        {
          h2: "Orly, Rungis, A6 : un usage très identifié",
          paragraphs: [
            "Les chauffeurs du 94 et du 91 enchaînent souvent Orly, hôtels du pôle et Paris 13 / 14 / 15. La franchise bris de glace et le véhicule de remplacement pèsent plus que le slogan « pas cher ».",
          ],
        },
      ],
      related: [
        { href: BASE + "orly/", label: "VTC Orly (ville)" },
        { href: BASE + "villejuif/", label: "VTC Villejuif" },
        { href: BASE + "creteil/", label: "VTC Créteil" },
        { href: BASE + "aeroport-cdg/", label: "VTC CDG" },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/la-defense/index.html",
      badge: "La Défense",
      title: "Assurance VTC La Défense | Courbevoie, Puteaux, Nanterre",
      description:
        "Assurance VTC La Défense : courses corporate 92, berlines, horaires bureau. Devis chauffeur, courtier ORIAS.",
      h1: "Assurance VTC à La Défense",
      intro:
        "Premier quartier d affaires européen : prises en charge hôtels, sièges, gare La Défense / Nanterre-Préfecture. Les berlines et le look véhicule comptent autant que la RC Pro.",
      heroImage: Img.VTC_ASSETS.defense,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Île-de-France", url: BASE + "ile-de-france/" },
        { name: "La Défense", url: BASE + "la-defense/" },
      ],
      sections: [
        {
          h2: "Courbevoie, Puteaux, Nanterre",
          paragraphs: [
            "La Défense déborde sur trois communes. Un chauffeur basé à Nanterre ou Puteaux a souvent un mix corporate + Paris 8 / 16 / 17.",
            "Nous comparons des offres qui autorisent l usage VTC à temps plein, y compris le soir après les bureaux.",
          ],
        },
      ],
      related: [
        { href: BASE + "courbevoie/", label: "VTC Courbevoie" },
        { href: BASE + "puteaux/", label: "VTC Puteaux" },
        { href: BASE + "nanterre/", label: "VTC Nanterre" },
        { href: BASE + "neuilly-sur-seine/", label: "VTC Neuilly" },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/paris-gares/index.html",
      badge: "Gares Paris",
      title: "Assurance VTC gares de Paris | Nord, Lyon, Montparnasse, Est",
      description:
        "Assurance VTC pour les gares parisiennes : Gare du Nord, de Lyon, Montparnasse, Est, Austerlitz. Devis chauffeur.",
      h1: "Assurance VTC aux gares de Paris",
      intro:
        "TGV, Eurostar, Ouigo : les gares sont des points de prise en charge majeurs. Files, bagages, horaires de trains — le contrat doit suivre le rythme.",
      heroImage: Img.VTC_ASSETS.gare,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Île-de-France", url: BASE + "ile-de-france/" },
        { name: "Gares", url: BASE + "paris-gares/" },
      ],
      sections: [
        {
          h2: "Nord, Est, Lyon, Montparnasse, Austerlitz, Saint-Lazare",
          paragraphs: [
            "Chaque gare a son bassin : Nord / Est vers le 10e et le 93, Lyon vers le 12e et le 94, Montparnasse vers le 14e / 15e, Saint-Lazare vers le 8e et le 92.",
            "Un seul contrat VTC Île-de-France couvre l ensemble si l usage pro est bien déclaré.",
          ],
        },
      ],
      related: [
        { href: BASE + "paris-10e/", label: "VTC Paris 10e (Gare du Nord)" },
        { href: BASE + "paris-12e/", label: "VTC Paris 12e (Gare de Lyon)" },
        { href: BASE + "paris-14e/", label: "VTC Paris 14e (Montparnasse)" },
        { href: BASE + "ile-de-france/", label: "Hub Île-de-France" },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/uber-paris/index.html",
      badge: "Uber Paris",
      title: "Assurance VTC Uber Paris | Bolt, Heetch Île-de-France",
      description:
        "Assurance compatible Uber, Bolt et Heetch à Paris et en Île-de-France. RC Pro, véhicule, devis courtier ORIAS.",
      h1: "Assurance VTC Uber, Bolt et Heetch à Paris",
      intro:
        "Les plateformes exigent une couverture VTC, pas une auto perso. Nous alignons RC Pro, usage transport de personnes et attestations pour exercer à Paris et en couronne.",
      heroImage: Img.VTC_ASSETS.smartphone,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Uber Paris", url: BASE + "uber-paris/" },
      ],
      sections: [
        {
          h2: "Ce que Uber / Bolt / Heetch attendent",
          paragraphs: [
            "Attestation d assurance au nom du conducteur, véhicule assuré pour le transport de personnes à titre onéreux, RC adaptée. Un contrat « auto classique » est en général refusé ou non couvrant.",
            "Nous préparons un comparatif lisible : garanties, franchises, bonus-malus, options perte d exploitation.",
          ],
          figure: Img.VTC_ASSETS.smartphone,
        },
      ],
      related: [
        { href: BASE + "uber-bolt/", label: "Guide plateformes national" },
        { href: BASE + "ile-de-france/", label: "VTC Île-de-France" },
        { href: "/blog/assurance-vtc-uber-bolt-heetch.html", label: "Article Uber Bolt Heetch" },
      ],
    })
  );

  pages.push(
    lt(page, {
      file: "assurance-vtc/tarif-ile-de-france/index.html",
      badge: "Tarif IDF",
      title: "Tarif assurance VTC Île-de-France | Prix chauffeur Paris",
      description:
        "Prix assurance VTC à Paris et en Île-de-France : ce qui fait varier la cotisation (zone, bonus, véhicule, aéroports). Devis gratuit.",
      h1: "Tarif assurance VTC en Île-de-France",
      intro:
        "Le prix affiché sans les garanties ne veut rien dire. En IDF, le kilométrage, le bonus-malus et l usage aéroport pèsent souvent plus que le code postal.",
      heroImage: Img.VTC_ASSETS.voiture,
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: BASE },
        { name: "Tarif IDF", url: BASE + "tarif-ile-de-france/" },
      ],
      sections: [
        {
          h2: "Les leviers de cotisation en région parisienne",
          paragraphs: [
            "Bonus-malus, valeur du véhicule, franchise, antécédents, temps plein vs mixte, et déclaration honnête de la zone (Paris / couronne / aéroports).",
            "Nous comparons à garanties équivalentes pour éviter le piège du contrat le moins cher qui exclut l activité VTC.",
          ],
          list: [
            "RC Pro : non négociable",
            "Dommages tous accidents vs tiers",
            "Véhicule de remplacement",
            "Bris de glace (parking, périphérique)",
          ],
        },
      ],
      related: [
        { href: BASE + "tarif/", label: "Comprendre le tarif VTC" },
        { href: BASE + "pas-cher/", label: "VTC pas cher : limites" },
        { href: "/blog/assurance-vtc-moins-cher-2026.html", label: "7 leviers pour payer moins cher" },
      ],
    })
  );

  ARRONDISSEMENTS.forEach(function (ar) {
    pages.push(
      lt(page, {
        file: "assurance-vtc/" + ar.slug + "/index.html",
        badge: ar.name,
        title: "Assurance VTC " + ar.name + " | Devis chauffeur " + ar.zone.split(",")[0],
        description:
          "Assurance VTC " +
          ar.name +
          " (" +
          ar.zone +
          ") : devis Uber Bolt, RC Pro, courtier ORIAS Île-de-France.",
        keywords: "assurance VTC " + ar.name + ", chauffeur VTC " + ar.zone,
        h1: "Assurance VTC " + ar.name,
        intro:
          "Chauffeur basé ou qui travaille surtout dans le " +
          ar.name +
          " (" +
          ar.zone +
          ") ? " +
          ar.angle +
          " Nous comparons les offres VTC pour ce secteur.",
        heroImage: ar.n % 2 === 0 ? Img.VTC_ASSETS.parisNuit : Img.VTC_ASSETS.paris,
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: "Assurance VTC", url: BASE },
          { name: "Paris", url: BASE + "paris/" },
          { name: ar.name, url: BASE + ar.slug + "/" },
        ],
        sections: [
          {
            h2: ar.name + " — " + ar.zone,
            paragraphs: [
              ar.angle.charAt(0).toUpperCase() + ar.angle.slice(1),
              "Le contrat reste un contrat VTC Île-de-France : l arrondissement aide à décrire votre usage (gares, hôtels, nuit, aéroports) pour coller aux questions de l assureur.",
            ],
            list: [
              "Devis en ligne, rappel conseiller",
              "Compatible Uber, Bolt, Heetch",
              "Pages voisines : autres arrondissements et hub IDF",
            ],
          },
        ],
        related: [
          { href: BASE + "paris/", label: "VTC Paris" },
          { href: BASE + "ile-de-france/", label: "Île-de-France" },
          { href: BASE + "paris-gares/", label: "Gares parisiennes" },
          { href: BASE + "uber-paris/", label: "Uber Paris" },
        ],
      })
    );
  });

  return pages;
}

function getVtcIdfSitemapEntries(base) {
  var today = new Date().toISOString().slice(0, 10);
  var paths = [
    "/assurance-vtc/ile-de-france/",
    "/assurance-vtc/aeroport-cdg/",
    "/assurance-vtc/aeroport-orly/",
    "/assurance-vtc/la-defense/",
    "/assurance-vtc/paris-gares/",
    "/assurance-vtc/uber-paris/",
    "/assurance-vtc/tarif-ile-de-france/",
  ].concat(
    ARRONDISSEMENTS.map(function (a) {
      return "/assurance-vtc/" + a.slug + "/";
    })
  );
  return paths.map(function (p) {
    var prio = p.indexOf("ile-de-france") >= 0 || p.indexOf("paris-") >= 0 ? "0.86" : "0.84";
    if (p.indexOf("ile-de-france") >= 0) prio = "0.9";
    return { loc: base + p, lastmod: today, changefreq: "weekly", priority: prio };
  });
}

module.exports = {
  ARRONDISSEMENTS: ARRONDISSEMENTS,
  buildVtcIdfPages: buildVtcIdfPages,
  getVtcIdfSitemapEntries: getVtcIdfSitemapEntries,
};
