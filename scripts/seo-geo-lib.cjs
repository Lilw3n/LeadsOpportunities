/**
 * Pages locales SEO — toutes les grandes villes de France (metropole + DOM).
 */
const fs = require("fs");
const path = require("path");
const contentLib = require("./seo-content-lib.cjs");

const DEFAULT_GEO_STEPS = [
  { title: "Demande en ligne", text: "Formulaire ou demande de rappel sur le site." },
  { title: "Analyse du profil", text: "Un conseiller qualifie votre besoin (ville, usage, budget)." },
  { title: "Comparatif explique", text: "Offres a garanties equivalentes, en langage clair." },
];

const GEO_PRODUCTS = [
  {
    key: "vtc",
    theme: "vtc",
    dir: "assurance-vtc",
    siloLabel: "Assurance VTC",
    siloUrl: "/assurance-vtc/",
    hubUrl: "/assurance-vtc/villes/",
    hubDeptUrl: "/assurance-vtc/departements/",
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
    hubDeptUrl: "/assurance-sante/departements/",
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
    hubDeptUrl: "/credit-immo/departements/",
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
  {
    key: "auto",
    theme: "auto",
    dir: "assurance-auto",
    siloLabel: "Assurance auto",
    siloUrl: "/assurance-auto/",
    hubUrl: "/assurance-auto/villes/",
    hubDeptUrl: "/assurance-auto/departements/",
    landing: "/landings/devis.html?need=auto",
    ctaLabel: function (city) {
      return "Devis auto " + city.name;
    },
    title: function (city) {
      return "Assurance auto " + city.name + " | Devis " + city.region;
    },
    description: function (city) {
      return (
        "Assurance auto a " +
        city.name +
        " : tous risques, au tiers, jeune conducteur. Comparatif et devis gratuit, courtier ORIAS."
      );
    },
    h1: function (city) {
      return "Assurance auto a " + city.name;
    },
    intro: function (city) {
      return (
        "Conducteur base a " +
        city.name +
        " ? Nous comparons les formules auto (tiers, intermediaire, tous risques) et optimisons votre bonus-malus."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Assurer sa voiture a " + city.name,
          paragraphs: [
            "Stationnement, trajets domicile-travail, sinistralite locale : votre profil influence le tarif. Nous comparons a garanties equivalentes.",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "Puis-je assurer un jeune conducteur a " + city.name + " ?",
          a: "Oui, nous identifions les assureurs les plus competitifs sur les profils juniors et permis probatoire.",
        },
      ];
    },
  },
  {
    key: "habitation",
    theme: "habitation",
    dir: "assurance-habitation",
    siloLabel: "Assurance habitation",
    siloUrl: "/assurance-habitation/",
    hubUrl: "/assurance-habitation/villes/",
    hubDeptUrl: "/assurance-habitation/departements/",
    landing: "/landings/devis.html?need=habitation",
    ctaLabel: function (city) {
      return "Devis habitation " + city.name;
    },
    title: function (city) {
      return "Assurance habitation " + city.name + " | Devis locataire & proprietaire";
    },
    description: function (city) {
      return (
        "Assurance habitation a " +
        city.name +
        " : locataire, proprietaire, MRH. Devis gratuit, garanties vol, degats des eaux, RC vie privee."
      );
    },
    h1: function (city) {
      return "Assurance habitation a " + city.name;
    },
    intro: function (city) {
      return (
        "Locataire ou proprietaire a " +
        city.name +
        " ? Nous calibrons votre multirisque habitation selon le type de bien et votre situation."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Proteger son logement a " + city.name,
          paragraphs: [
            "Degats des eaux, vol, responsabilite civile : les garanties essentielles varient selon que vous etes locataire ou proprietaire occupant.",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "Assurance habitation obligatoire a " + city.name + " ?",
          a: "Oui pour les locataires (risques locatifs). Proprietaires : fortement recommande, parfois exige par la copropriete ou la banque.",
        },
      ];
    },
  },
  {
    key: "prevoyance",
    theme: "prevoyance",
    dir: "assurance-prevoyance",
    siloLabel: "Assurance prevoyance",
    siloUrl: "/assurance-prevoyance/",
    hubUrl: "/assurance-prevoyance/villes/",
    hubDeptUrl: "/assurance-prevoyance/departements/",
    landing: "/landings/devis.html?need=prevoyance",
    ctaLabel: function (city) {
      return "Devis prevoyance " + city.name;
    },
    title: function (city) {
      return "Assurance prevoyance " + city.name + " | Devis " + city.region;
    },
    description: function (city) {
      return (
        "Prevoyance et protection du revenu a " +
        city.name +
        " : deces, invalidite, arret de travail. Courtier ORIAS, devis gratuit."
      );
    },
    h1: function (city) {
      return "Assurance prevoyance a " + city.name;
    },
    intro: function (city) {
      return (
        "Salaries, independants et dirigeants a " +
        city.name +
        " : securisez vos revenus et votre famille avec une prevoyance adaptee."
      );
    },
    sections: function (city) {
      return [
        {
          h2: "Prevoyance a " + city.name,
          paragraphs: [
            "Arret de travail, invalidite, deces : les prestations varient selon votre statut. Nous clarifions les garanties avant souscription.",
          ],
        },
      ];
    },
    faq: function (city) {
      return [
        {
          q: "Prevoyance pour independants a " + city.name + " ?",
          a: "Oui, TNS et dirigeants : nous montons des solutions deces, ITT/IPT et perte de revenus.",
        },
      ];
    },
  },
  {
    key: "animaux",
    theme: "animaux",
    dir: "assurance-animaux",
    siloLabel: "Assurance animaux",
    siloUrl: "/assurance-animaux/",
    hubUrl: "/assurance-animaux/villes/",
    hubDeptUrl: "/assurance-animaux/departements/",
    landing: "/landings/animaux.html",
    ctaLabel: function (city) {
      return "Devis animaux " + city.name;
    },
    title: function (city) {
      return "Assurance animaux " + city.name + " | Chien & chat — " + city.region;
    },
    description: function (city) {
      return (
        "Assurance animaux a " +
        city.name +
        " : chien, chat, frais veterinaires. Comparatif Santévet, Bulle Bleue, Kozoo. Courtier ORIAS, devis gratuit."
      );
    },
    h1: function (city) {
      return "Assurance animaux a " + city.name;
    },
    intro: function (city) {
      return (
        "Proprietaire de chien ou chat a " +
        city.name +
        " ? Nous comparons les formules (prevention, chirurgie, plafonds) avec un conseiller dedie, partout en " +
        city.region +
        "."
      );
    },
    sections: contentLib.animauxCitySections,
    faq: contentLib.animauxCityFaq,
    geoSteps: DEFAULT_GEO_STEPS,
    extraRelated: [
      { href: "/assurance-animaux/chien/", label: "Assurance chien (national)" },
      { href: "/assurance-animaux/chat/", label: "Assurance chat (national)" },
      { href: "/assurance-chien/villes/", label: "Assurance chien par ville" },
      { href: "/assurance-chat/villes/", label: "Assurance chat par ville" },
      { href: "/assurance-animaux/comparatif/", label: "Comparatif animaux" },
      { href: "/assurance-animaux/tarif/", label: "Tarifs animaux" },
      { href: "/landings/animaux-express.html", label: "Rappel express" },
    ],
  },
  {
    key: "chien",
    theme: "animaux",
    dir: "assurance-chien",
    siloLabel: "Assurance chien",
    siloUrl: "/assurance-animaux/chien/",
    hubUrl: "/assurance-chien/villes/",
    hubDeptUrl: "/assurance-chien/departements/",
    landing: "/landings/animaux.html",
    ctaLabel: function (city) {
      return "Devis assurance chien " + city.name;
    },
    title: function (city) {
      return "Assurance chien " + city.name + " | Devis " + city.region;
    },
    description: function (city) {
      return (
        "Assurance chien a " +
        city.name +
        " : chiot, adulte, senior. Comparatif frais veterinaires. Courtier ORIAS, demande de rappel en ligne."
      );
    },
    h1: function (city) {
      return "Assurance chien a " + city.name;
    },
    intro: function (city) {
      return (
        "Vous cherchez une assurance chien a " +
        city.name +
        " ? Meme reseau d assureurs qu en grande ville : devis en ligne, puis rappel conseiller pour comparer plafonds et franchises."
      );
    },
    sections: contentLib.chienCitySections,
    faq: function (city) {
      return contentLib.defaultCityFaq(city, "Assurance chien").concat([
        {
          q: "Assurance chiot a " + city.name + " ?",
          a: "Oui, adhesion des 2-3 mois selon assureurs. Voir aussi notre guide assurance chiot.",
        },
      ]);
    },
    geoSteps: DEFAULT_GEO_STEPS,
    extraRelated: [
      { href: "/assurance-animaux/chien/", label: "Guide assurance chien" },
      { href: "/assurance-animaux/chien/pas-cher/", label: "Chien pas cher" },
      { href: "/assurance-animaux/chien/chiot/", label: "Assurance chiot" },
      { href: "/assurance-animaux/", label: "Assurance animaux" },
    ],
  },
  {
    key: "chat",
    theme: "animaux",
    dir: "assurance-chat",
    siloLabel: "Assurance chat",
    siloUrl: "/assurance-animaux/chat/",
    hubUrl: "/assurance-chat/villes/",
    hubDeptUrl: "/assurance-chat/departements/",
    landing: "/landings/animaux.html",
    ctaLabel: function (city) {
      return "Devis assurance chat " + city.name;
    },
    title: function (city) {
      return "Assurance chat " + city.name + " | Mutuelle " + city.region;
    },
    description: function (city) {
      return (
        "Assurance chat a " +
        city.name +
        " : chaton, chat senior, prevention. Comparatif et devis gratuit, courtier ORIAS."
      );
    },
    h1: function (city) {
      return "Assurance chat a " + city.name;
    },
    intro: function (city) {
      return (
        "Assurance chat pour les habitants de " +
        city.name +
        " : formules prevention, urgence et chirurgie. Questionnaire 3 minutes ou demande de rappel."
      );
    },
    sections: contentLib.chatCitySections,
    faq: function (city) {
      return contentLib.defaultCityFaq(city, "Assurance chat");
    },
    geoSteps: DEFAULT_GEO_STEPS,
    extraRelated: [
      { href: "/assurance-animaux/chat/", label: "Guide assurance chat" },
      { href: "/assurance-animaux/chat/pas-cher/", label: "Chat pas cher" },
      { href: "/assurance-animaux/chat/chaton/", label: "Assurance chaton" },
      { href: "/assurance-animaux/", label: "Assurance animaux" },
    ],
  },
  {
    key: "chasse",
    theme: "niche",
    dir: "assurance-chasse",
    siloLabel: "Assurance chasse",
    siloUrl: "/assurance-chasse/",
    hubUrl: "/assurance-chasse/villes/",
    hubDeptUrl: "/assurance-chasse/departements/",
    landing: "/landings/devis.html?need=chasse",
    ctaLabel: function (city) {
      return "Devis chasse " + city.name;
    },
    title: function (city) {
      return "Assurance chasse " + city.name + " | RC chasseur " + city.region;
    },
    description: function (city) {
      return (
        "Assurance chasse a " +
        city.name +
        " : RC chasseur, blessures, chien courant. Courtier ORIAS, devis gratuit."
      );
    },
    h1: function (city) {
      return "Assurance chasse a " + city.name;
    },
    intro: function (city) {
      return (
        "Chasseurs de " +
        city.name +
        " et du departement : nous montons votre dossier RC et options chiens courants avec un conseiller."
      );
    },
    sections: contentLib.chasseCitySections,
    faq: function (city) {
      return contentLib.defaultCityFaq(city, "Assurance chasse");
    },
    geoSteps: DEFAULT_GEO_STEPS,
    extraRelated: [
      { href: "/assurance-chasse/rc-chasseur/", label: "RC chasseur" },
      { href: "/assurance-chasse/chien-chasse/", label: "Chien de chasse" },
      { href: "/niches/", label: "Niches assurance" },
    ],
  },
  {
    key: "equitation",
    theme: "niche",
    dir: "assurance-equitation",
    siloLabel: "Assurance equitation",
    siloUrl: "/assurance-equitation/",
    hubUrl: "/assurance-equitation/villes/",
    hubDeptUrl: "/assurance-equitation/departements/",
    landing: "/landings/devis.html?need=equitation",
    ctaLabel: function (city) {
      return "Devis equitation " + city.name;
    },
    title: function (city) {
      return "Assurance equitation " + city.name + " | Cheval & RC " + city.region;
    },
    description: function (city) {
      return (
        "Assurance equitation a " +
        city.name +
        " : RC equestre, cheval, materiel. Courtier ORIAS, France entiere."
      );
    },
    h1: function (city) {
      return "Assurance equitation a " + city.name;
    },
    intro: function (city) {
      return (
        "Cavaliers et proprietaires a " +
        city.name +
        " : RC equestre et garanties cheval selon produits disponibles. Devis en ligne puis rappel."
      );
    },
    sections: contentLib.equitationCitySections,
    faq: function (city) {
      return contentLib.defaultCityFaq(city, "Assurance equitation");
    },
    geoSteps: DEFAULT_GEO_STEPS,
    extraRelated: [
      { href: "/assurance-equitation/rc-equestre/", label: "RC equestre" },
      { href: "/assurance-equitation/cheval/", label: "Assurance cheval" },
      { href: "/niches/", label: "Niches assurance" },
    ],
  },
];

function crossLinksForCity(product, city) {
  var links = [];
  if (product.key === "animaux" || product.key === "chien" || product.key === "chat") {
    if (product.key !== "chien") {
      links.push({
        href: "/assurance-chien/" + city.slug + "/",
        label: "Assurance chien " + city.name,
      });
    }
    if (product.key !== "chat") {
      links.push({
        href: "/assurance-chat/" + city.slug + "/",
        label: "Assurance chat " + city.name,
      });
    }
    if (product.key !== "animaux") {
      links.push({
        href: "/assurance-animaux/" + city.slug + "/",
        label: "Assurance animaux " + city.name,
      });
    }
  }
  return links;
}

function buildGeoPageConfigs(cities, pageFn) {
  const out = [];
  GEO_PRODUCTS.forEach(function (product) {
    cities.forEach(function (city) {
      var sections =
        typeof product.sections === "function" ? product.sections(city) : product.sections || [];
      var faq = typeof product.faq === "function" ? product.faq(city) : contentLib.defaultCityFaq(city, product.siloLabel);
      var related = [
        { href: product.hubUrl, label: "Toutes les villes — " + product.siloLabel },
        { href: product.siloUrl, label: "Guide national" },
        { href: "/france/departement/" + city.dept + "/", label: "Departement " + city.dept.replace(/-/g, " ") },
      ];
      if (product.extraRelated) {
        related = related.concat(product.extraRelated);
      }
      related = related.concat(crossLinksForCity(product, city));
      related = related.concat(contentLib.nearbyLinks(city, cities, product.dir, 8));

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
          steps: product.geoSteps || DEFAULT_GEO_STEPS,
          sections: sections,
          related: related,
          nearbyCities: contentLib.nearbyLinks(city, cities, product.dir, 12),
          faq: faq,
        })
      );
    });
  });
  return out;
}

function buildDeptPageConfigs(departments, cities, pageFn) {
  const out = [];
  GEO_PRODUCTS.forEach(function (product) {
    departments.forEach(function (dept) {
      const deptCities = cities.filter(function (c) {
        return c.dept === dept.slug;
      });
      const cityLinks = deptCities.map(function (c) {
        return {
          href: "/" + product.dir + "/" + c.slug + "/",
          label: c.name,
        };
      });
      out.push(
        pageFn({
          file: product.dir + "/departement/" + dept.slug + "/index.html",
          theme: product.theme,
          badge: dept.name,
          title: product.siloLabel + " " + dept.name + " (" + dept.region + ")",
          description:
            product.siloLabel +
            " dans le " +
            dept.name +
            " : " +
            deptCities.length +
            " villes couvertes. Devis gratuit, courtier ORIAS.",
          h1: product.siloLabel + " dans le " + dept.name,
          intro:
            "Retrouvez nos pages locales pour le departement " +
            dept.name +
            " (" +
            dept.region +
            "). Devis en ligne et accompagnement par telephone.",
          cta: { href: product.landing, label: "Demander un devis" },
          crumbs: [
            { name: "Accueil", url: "/" },
            { name: product.siloLabel, url: product.siloUrl },
            { name: dept.name, url: "/" + product.dir + "/departement/" + dept.slug + "/" },
          ],
          related: [
            { href: product.hubUrl, label: "Toutes les villes" },
            { href: product.hubDeptUrl || product.siloUrl + "departements/", label: "Tous les departements" },
            { href: "/france/region/" + dept.regionSlug + "/", label: dept.region },
          ],
          hubCityGrid: cityLinks,
          faq: [
            {
              q: "Couvrez-vous tout le " + dept.name + " ?",
              a: "Oui, communes principales et agglomerations du departement. Contactez-nous pour une commune non listee.",
            },
          ],
        })
      );
    });
  });
  return out;
}

function buildDeptHubPageConfigs(departments, pageFn) {
  const out = [];
  GEO_PRODUCTS.forEach(function (product) {
    const deptLinks = departments.map(function (d) {
      return {
        href: "/" + product.dir + "/departement/" + d.slug + "/",
        label: d.name,
      };
    });
    out.push(
      pageFn({
        file: product.dir + "/departements/index.html",
        theme: product.theme,
        badge: "Departements",
        title: product.siloLabel + " par departement | France",
        description: product.siloLabel + " dans " + departments.length + " departements. Annuaire local, devis gratuit.",
        h1: product.siloLabel + " : departements couverts",
        intro: "Accedez a une page dediee par departement avec les villes principales et un parcours devis rapide.",
        cta: { href: product.landing, label: "Demander un devis" },
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: product.siloLabel, url: product.siloUrl },
          { name: "Departements", url: "/" + product.dir + "/departements/" },
        ],
        hubCityGrid: deptLinks,
        related: [
          { href: product.hubUrl, label: "Par ville" },
          { href: product.siloUrl, label: "Guide national" },
        ],
        faq: [],
      })
    );
  });
  return out;
}

function buildRegionPageConfigs(regions, departments, cities, pageFn) {
  const out = [];
  regions.forEach(function (region) {
    const regionDepts = departments.filter(function (d) {
      return d.regionSlug === region.slug;
    });
    const regionCities = cities.filter(function (c) {
      return c.regionSlug === region.slug;
    });
    const deptLinks = regionDepts.map(function (d) {
      return { href: "/france/departement/" + d.slug + "/", label: d.name };
    });
    const citySample = regionCities.slice(0, 36).map(function (c) {
      return { href: "/assurance-vtc/" + c.slug + "/", label: c.name };
    });
    out.push(
      pageFn({
        file: "france/region/" + region.slug + "/index.html",
        theme: "vtc",
        badge: region.name,
        title: "Assurance & credit en " + region.name + " | Devis local",
        description:
          "Courtier assurance et credit en " +
          region.name +
          " : VTC, mutuelle, auto, habitation, credit immo. " +
          regionCities.length +
          " villes, devis gratuit.",
        h1: "Nos services en " + region.name,
        intro:
          "Pages locales pour " +
          regionDepts.length +
          " departements et " +
          regionCities.length +
          " villes en " +
          region.name +
          ".",
        cta: { href: "/nos-services.html", label: "Tous nos services" },
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: "France", url: "/france/" },
          { name: region.name, url: "/france/region/" + region.slug + "/" },
        ],
        hubCityGrid: citySample,
        hubDeptGrid: deptLinks,
        related: GEO_PRODUCTS.map(function (p) {
          return { href: p.hubUrl, label: p.siloLabel + " (villes)" };
        }),
        faq: [],
      })
    );
  });
  return out;
}

function buildFranceDeptHub(departments, pageFn) {
  const links = departments.map(function (d) {
    return { href: "/france/departement/" + d.slug + "/", label: d.name + " (" + d.region + ")" };
  });
  return [
    pageFn({
      file: "france/departements/index.html",
      theme: "vtc",
      badge: "France",
      title: "Departements couverts | Assurance & credit France",
      description: "Annuaire par departement : assurance VTC, mutuelle, auto, habitation, prevoyance, credit immo.",
      h1: "Tous les departements",
      intro: "Selectionnez votre departement pour acceder aux villes et formulaires de devis.",
      cta: { href: "/france/", label: "Couverture France" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
        { name: "Departements", url: "/france/departements/" },
      ],
      hubCityGrid: links,
      related: [{ href: "/france/regions/", label: "Par region" }],
      faq: [],
    }),
  ];
}

function buildFranceDeptPages(departments, cities, pageFn) {
  return departments.map(function (dept) {
    const deptCities = cities.filter(function (c) {
      return c.dept === dept.slug;
    });
    const productLinks = GEO_PRODUCTS.map(function (p) {
      return {
        href: "/" + p.dir + "/departement/" + dept.slug + "/",
        label: p.siloLabel,
      };
    });
    const cityLinks = deptCities.map(function (c) {
      return { href: "/assurance-vtc/" + c.slug + "/", label: c.name };
    });
    return pageFn({
      file: "france/departement/" + dept.slug + "/index.html",
      theme: "vtc",
      badge: dept.region,
      title: "Courtier assurance " + dept.name + " | " + dept.region,
      description:
        "Devis assurance et credit dans le " +
        dept.name +
        " : VTC, sante, auto, habitation, credit immo. " +
        deptCities.length +
        " villes.",
      h1: "Assurance & financement dans le " + dept.name,
      intro: "Acces direct aux devis par produit et par ville pour le departement " + dept.name + ".",
      cta: { href: "/landings/devis.html", label: "Devis gratuit" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
        { name: dept.name, url: "/france/departement/" + dept.slug + "/" },
      ],
      hubCityGrid: cityLinks,
      hubDeptGrid: productLinks,
      related: [{ href: "/france/region/" + dept.regionSlug + "/", label: dept.region }],
      faq: [],
    });
  });
}

function buildPillarPageConfigs(pageFn) {
  const pillars = [
    {
      file: "assurance-auto/index.html",
      theme: "auto",
      siloLabel: "Assurance auto",
      siloUrl: "/assurance-auto/",
      landing: "/landings/devis.html?need=auto",
      title: "Assurance auto | Devis et comparatif France",
      description: "Assurance auto en France : tous risques, au tiers, jeune conducteur. Devis gratuit, courtier ORIAS.",
      h1: "Assurance auto : comparez les offres",
      intro: "Particuliers et familles : nous comparons les assureurs pour trouver le meilleur rapport garanties / prix.",
    },
    {
      file: "assurance-habitation/index.html",
      theme: "habitation",
      siloLabel: "Assurance habitation",
      siloUrl: "/assurance-habitation/",
      landing: "/landings/devis.html?need=habitation",
      title: "Assurance habitation | Devis locataire & proprietaire",
      description: "Assurance habitation en France : locataire, proprietaire, degats des eaux, vol. Devis gratuit.",
      h1: "Assurance habitation : proteger votre logement",
      intro: "Locataire ou proprietaire : multirisque habitation, responsabilite civile et options sur mesure.",
    },
    {
      file: "assurance-prevoyance/index.html",
      theme: "prevoyance",
      siloLabel: "Assurance prevoyance",
      siloUrl: "/assurance-prevoyance/",
      landing: "/landings/devis.html?need=prevoyance",
      title: "Assurance prevoyance | Protection revenus & famille",
      description: "Prevoyance en France : deces, invalidite, arret de travail. Courtier ORIAS, devis gratuit.",
      h1: "Assurance prevoyance : securiser l avenir",
      intro: "Salaries et independants : garanties deces, ITT, IPT et maintien de revenus.",
    },
    {
      file: "assurance-chien/index.html",
      theme: "animaux",
      siloLabel: "Assurance chien",
      siloUrl: "/assurance-animaux/chien/",
      hubVillesUrl: "/assurance-chien/villes/",
      hubDeptUrl: "/assurance-chien/departements/",
      landing: "/landings/animaux.html",
      title: "Assurance chien par ville | France entiere",
      description: "Assurance chien dans toute la France : pages par ville, devis en ligne, courtier ORIAS.",
      h1: "Assurance chien : devis par ville",
      intro: "Selectionnez votre ville ou lancez le questionnaire chien : comparatif national, rappel conseiller.",
    },
    {
      file: "assurance-chat/index.html",
      theme: "animaux",
      siloLabel: "Assurance chat",
      siloUrl: "/assurance-animaux/chat/",
      hubVillesUrl: "/assurance-chat/villes/",
      hubDeptUrl: "/assurance-chat/departements/",
      landing: "/landings/animaux.html",
      title: "Assurance chat par ville | France entiere",
      description: "Assurance chat : pages locales par ville, chaton et senior. Devis gratuit.",
      h1: "Assurance chat : devis par ville",
      intro: "Mutuelle chat et assurance chaton : une page dediee par grande ville de France.",
    },
  ];
  return pillars.map(function (p) {
    var villesHub = p.hubVillesUrl || p.siloUrl.replace(/\/$/, "") + "/villes/";
    var deptHub = p.hubDeptUrl || p.siloUrl.replace(/\/$/, "") + "/departements/";
    return pageFn({
      file: p.file,
      theme: p.theme,
      badge: "France entiere",
      title: p.title,
      description: p.description,
      h1: p.h1,
      intro: p.intro,
      cta: { href: p.landing, label: "Demander un devis" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: p.siloLabel, url: p.siloUrl },
      ],
      benefits: [
        { title: "Comparatif", text: "Plusieurs compagnies analysees." },
        { title: "Conseil humain", text: "Un courtier dedie." },
        { title: "France entiere", text: "Pages par ville et departement." },
      ],
      related: [
        { href: villesHub, label: "Par ville" },
        { href: deptHub, label: "Par departement" },
        { href: "/france/", label: "Couverture France" },
      ],
      faq: [
        {
          q: "Le devis est-il gratuit ?",
          a: "Oui, sans engagement.",
        },
      ],
    });
  });
}

function buildHubPageConfigs(cities, regions, departments, pageFn) {
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
        label: product.key === "vtc" ? "VTC" : product.key === "sante" ? "Sante" : product.key === "credit" ? "Credit" : product.key === "auto" ? "Auto" : product.key === "habitation" ? "Habitation" : "Prevoyance",
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
        "Devis assurance et credit dans " +
        cities.length +
        " villes et " +
        departments.length +
        " departements : VTC, mutuelle, auto, habitation, prevoyance, credit immo. Metropole et DOM.",
      h1: "Present partout en France",
      intro:
        "Plus de " +
        cities.length +
        " villes, " +
        departments.length +
        " departements et " +
        regions.length +
        " regions couverts : trouvez une page locale pour votre devis (VTC, sante, auto, habitation, prevoyance, credit immo).",
      cta: { href: "/nos-services.html", label: "Voir tous nos services" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
      ],
      sections: [
        {
          h2: "Nos expertises nationales",
          list: [
            "Assurance VTC — chauffeurs et creation d activite",
            "Mutuelle sante — particuliers, familles, independants",
            "Credit immobilier — primo-accedants et investisseurs",
            "Assurance auto — tous profils conducteurs",
            "Assurance habitation — locataires et proprietaires",
            "Prevoyance — protection revenus et famille",
          ],
        },
      ],
      related: [
        { href: "/france/regions/", label: "Par region" },
        { href: "/france/departements/", label: "Par departement" },
        { href: "/assurance-vtc/villes/", label: "Villes VTC" },
        { href: "/assurance-sante/villes/", label: "Villes mutuelle" },
        { href: "/assurance-auto/villes/", label: "Villes auto" },
        { href: "/assurance-habitation/villes/", label: "Villes habitation" },
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

  out.push(
    pageFn({
      file: "france/regions/index.html",
      theme: "vtc",
      badge: "Regions",
      title: "Regions de France | Assurance & credit local",
      description: "Pages SEO par region : " + regions.length + " regions, devis assurance et credit.",
      h1: "Toutes les regions",
      intro: "Selectionnez votre region pour acceder aux departements et villes couvertes.",
      cta: { href: "/france/", label: "Accueil France" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "France", url: "/france/" },
        { name: "Regions", url: "/france/regions/" },
      ],
      hubCityGrid: regions.map(function (r) {
        return { href: "/france/region/" + r.slug + "/", label: r.name };
      }),
      related: [{ href: "/france/departements/", label: "Par departement" }],
      faq: [],
    })
  );

  return out;
}

function collectSitemapUrls(cities, departments, regions, base) {
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
    { loc: base + "/landings/animaux.html", priority: "0.92", changefreq: "weekly" },
    { loc: base + "/landings/animaux-express.html", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/niches/", priority: "0.85", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/", priority: "0.92", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/villes/", priority: "0.91", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/chien/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/chat/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/comparatif/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/tarif/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-animaux/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-chien/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-chat/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-chasse/", priority: "0.86", changefreq: "weekly" },
    { loc: base + "/assurance-chasse/villes/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-equitation/", priority: "0.86", changefreq: "weekly" },
    { loc: base + "/assurance-equitation/villes/", priority: "0.88", changefreq: "weekly" },
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
    { loc: base + "/assurance-auto/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-auto/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-auto/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-habitation/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-habitation/villes/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/assurance-habitation/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-prevoyance/", priority: "0.86", changefreq: "weekly" },
    { loc: base + "/assurance-prevoyance/villes/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-prevoyance/departements/", priority: "0.86", changefreq: "weekly" },
    { loc: base + "/assurance-vtc/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/assurance-sante/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/credit-immo/departements/", priority: "0.88", changefreq: "weekly" },
    { loc: base + "/france/regions/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/france/departements/", priority: "0.9", changefreq: "weekly" },
    { loc: base + "/blog/", priority: "0.8", changefreq: "weekly" },
    { loc: base + "/blog/assurance-vtc-moins-cher-2026.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/mutuelle-sante-5-criteres.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/pret-immo-erreurs-a-eviter.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/assurance-auto-bonus-malus.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/prevoyance-independants-guide.html", priority: "0.75", changefreq: "monthly" },
    { loc: base + "/blog/assurance-animaux-comment-choisir.html", priority: "0.8", changefreq: "monthly" },
    { loc: base + "/blog/assurance-chien-frais-veterinaires.html", priority: "0.78", changefreq: "monthly" },
    { loc: base + "/blog/assurance-chat-guide-complet.html", priority: "0.78", changefreq: "monthly" },
    { loc: base + "/blog/assurance-chiot-chaton-quand-assurer.html", priority: "0.78", changefreq: "monthly" },
    { loc: base + "/blog/comparatif-santevet-bulle-bleue-kozoo.html", priority: "0.78", changefreq: "monthly" },
    { loc: base + "/blog/feed.xml", priority: "0.5", changefreq: "weekly" },
    { loc: base + "/mentions-legales.html", priority: "0.3", changefreq: "yearly" },
    { loc: base + "/politique-confidentialite.html", priority: "0.35", changefreq: "yearly" },
    { loc: base + "/cgu.html", priority: "0.3", changefreq: "yearly" },
  ];

  GEO_PRODUCTS.forEach(function (product) {
    urls.push({ loc: base + product.siloUrl, priority: "0.88", changefreq: "weekly" });
    if (product.hubUrl) urls.push({ loc: base + product.hubUrl, priority: "0.9", changefreq: "weekly" });
    if (product.hubDeptUrl) urls.push({ loc: base + product.hubDeptUrl, priority: "0.88", changefreq: "weekly" });
    cities.forEach(function (city) {
      urls.push({
        loc: base + "/" + product.dir + "/" + city.slug + "/",
        priority: city.slug === "paris" ? "0.78" : "0.68",
        changefreq: "monthly",
      });
    });
    departments.forEach(function (dept) {
      urls.push({
        loc: base + "/" + product.dir + "/departement/" + dept.slug + "/",
        priority: "0.7",
        changefreq: "monthly",
      });
    });
  });

  regions.forEach(function (r) {
    urls.push({ loc: base + "/france/region/" + r.slug + "/", priority: "0.82", changefreq: "monthly" });
  });

  departments.forEach(function (d) {
    urls.push({ loc: base + "/france/departement/" + d.slug + "/", priority: "0.75", changefreq: "monthly" });
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

function writeSitemapIndex(sitemaps, outFile, base) {
  const today = new Date().toISOString().slice(0, 10);
  const body = sitemaps
    .map(function (name) {
      return "  <sitemap>\n    <loc>" + base + "/" + name + "</loc>\n    <lastmod>" + today + "</lastmod>\n  </sitemap>";
    })
    .join("\n");
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    "\n</sitemapindex>\n";
  fs.writeFileSync(outFile, xml, "utf8");
}

module.exports = {
  GEO_PRODUCTS,
  buildGeoPageConfigs,
  buildDeptPageConfigs,
  buildDeptHubPageConfigs,
  buildRegionPageConfigs,
  buildFranceDeptHub,
  buildFranceDeptPages,
  buildPillarPageConfigs,
  buildHubPageConfigs,
  collectSitemapUrls,
  writeSitemap,
  writeSitemapIndex,
};
