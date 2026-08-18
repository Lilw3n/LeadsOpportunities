/**
 * SEO prêt immobilier — bassin Nancy métropole (54).
 * Priorité absolue : Varangéville, Jarville, Nancy et communes alentour.
 * Courtier basé à Varangéville — Wendy BUCHET / Leads Opportunities.
 */
var COMMUNES = [
  {
    slug: "nancy",
    name: "Nancy",
    keywords: ["pret immobilier nancy", "credit immo nancy", "courtier nancy"],
    market:
      "hyper-centre historique, quartiers universitaires, appartements haussmanniens et immeubles récents — marché tendu sur les biens finançables",
    loan:
      "les banques nancéiennes regardent le reste à vivre, l'apport et la stabilité professionnelle. Nous connaissons les quartiers (Vieux-Nancy, Saint-Léon, plateau) pour caler un dossier crédible",
    local:
      "Capitale du Grand Est pour l'achat RP : compromis rapides, copropriétés anciennes, diagnostics énergétiques exigeants",
  },
  {
    slug: "jarville-la-malgrange",
    name: "Jarville-la-Malgrange",
    keywords: ["pret immobilier jarville", "credit immo jarville la malgrange"],
    market:
      "zone commerciale Jarville, maisons de ville et résidences entre Nancy et la vallée de la Moselle — bon rapport surface / budget",
    loan:
      "profils salariés du bassin d'emploi (santé, industrie, fonction publique) : nous montons le dossier avec les banques habituées au 54",
    local:
      "Sortie A33, tram vers Nancy : les acquéreurs veulent souvent un accord de principe avant de visiter sur Jarville",
  },
  {
    slug: "varangeville",
    name: "Varangéville",
    aliases: ["Varengeville"],
    keywords: ["pret immobilier varangeville", "pret immobilier varengeville", "credit immo varangeville"],
    market:
      "commune résidentielle entre Nancy et Jarville : maisons individuelles, lotissements, demande familiale stable",
    loan:
      "courtier basé à Varangéville : accompagnement de proximité pour les projets du bassin (RP, premier achat, rachat)",
    local:
      "Recherche « prêt Varangéville » ou « Varengeville » : même bassin Nancy métropole, même étude de faisabilité",
  },
  {
    slug: "maxeville",
    name: "Maxéville",
    keywords: ["pret immobilier maxeville"],
    market: "pavillons, résidences récentes, forte demande primo-accédants proches Nancy",
    loan: "apport 10–20 % souvent attendu ; nous optimisons assurance emprunteur et durée pour tenir la mensualité",
    local: "Commune limitrophe de Nancy — les dossiers Maxéville partent souvent vers les mêmes banques que Nancy centre",
  },
  {
    slug: "vandoeuvre-les-nancy",
    name: "Vandœuvre-lès-Nancy",
    keywords: ["pret immobilier vandoeuvre"],
    market: "campus universitaire, résidences étudiantes et maisons familiales — mix locatif et RP",
    loan: "investissement locatif étudiant ou RP famille : usage du bien clarifié dès la simulation",
    local: "Brabois, Technopôle : marché spécifique, prix au m² différent du centre-ville Nancy",
  },
  {
    slug: "laxou",
    name: "Laxou",
    keywords: ["pret immobilier laxou"],
    market: "villas, résidences haut standing côté Plateau, appartements proches CHU de Brabois",
    loan: "tickets d'entrée plus élevés : reste à vivre et épargne de précaution décisifs",
    local: "Laxou reste une commune recherchée des cadres du bassin nancéien",
  },
  {
    slug: "saint-nicolas-de-port",
    name: "Saint-Nicolas-de-Port",
    keywords: ["pret immobilier saint nicolas de port"],
    market: "maisons de ville, pavillons, marché plus accessible qu'à Nancy — familles et primo-accédants",
    loan: "bonne alternative budget : mensualité maîtrisée avec apport raisonnable",
    local: "Basilique, centre-bourg : délais de vente parfois plus longs — l'accord de principe rassure le vendeur",
  },
  {
    slug: "essey-les-nancy",
    name: "Essey-lès-Nancy",
    keywords: ["pret immobilier essey les nancy"],
    market: "résidentiel calme, maisons et petits collectifs proches zones d'activité",
    loan: "profils couples actifs du secteur sud-est de l'agglomération",
    local: "Commune discrète mais recherchée pour le rapport qualité / prix",
  },
  {
    slug: "tomblaine",
    name: "Tomblaine",
    keywords: ["pret immobilier tomblaine"],
    market: "proximité zones commerciales et axes vers Nancy — appartements et maisons",
    loan: "dossiers salariés et fonctionnaires : capacité d'emprunt calée sur le marché local",
    local: "Tomblaine attire les acheteurs qui veulent rester proches de Nancy sans payer le centre",
  },
  {
    slug: "heillecourt",
    name: "Heillecourt",
    keywords: ["pret immobilier heillecourt"],
    market: "pavillons, lotissements, demande familiale sur la rive droite de la Moselle",
    loan: "étude apport + assurance emprunteur pour sécuriser l'accord banque",
    local: "Heillecourt : communes périphériques où le courtier connaît les prix au m² réels",
  },
  {
    slug: "malzeville",
    name: "Malzéville",
    keywords: ["pret immobilier malzeville"],
    market: "villas, résidences, vue sur Nancy — segment intermédiaire à premium",
    loan: "projets avec apport conséquent ou revenus solides",
    local: "Malzéville : biens avec vue, souvent négociation sur le prix et le délai",
  },
  {
    slug: "villers-les-nancy",
    name: "Villers-lès-Nancy",
    keywords: ["pret immobilier villers les nancy"],
    market: "résidentiel proche CHU et facultés — appartements et maisons de ville",
    loan: "marché étudiant et familles : bien cadrer RP vs locatif",
    local: "Quartiers proches Brabois : forte rotation locative possible",
  },
  {
    slug: "laneuveville-devant-nancy",
    name: "Laneuveville-devant-Nancy",
    keywords: ["pret immobilier laneuveville"],
    market: "petite commune résidentielle au sud de Nancy",
    loan: "dossiers primo-accédants avec budget maîtrisé",
    local: "Stock limité : un financement validé avant la visite fait la différence",
  },
  {
    slug: "lay-saint-christophe",
    name: "Lay-Saint-Christophe",
    keywords: ["pret immobilier lay saint christophe"],
    market: "villas et maisons, cadre verdoyant au nord de Nancy",
    loan: "profils cadres et familles : apport et reste à vivre au cœur de l'étude",
    local: "Commune prisée pour le calme tout en restant proche de l'agglomération",
  },
  {
    slug: "art-sur-meurthe",
    name: "Art-sur-Meurthe",
    keywords: ["pret immobilier art sur meurthe"],
    market: "bourg rural proche Jarville — maisons et terrains",
    loan: "financement maison individuelle : terrain + construction ou ancien rénové",
    local: "Vallée de la Meurthe : prix plus doux qu'à Nancy intra-muros",
  },
  {
    slug: "seichamps",
    name: "Seichamps",
    keywords: ["pret immobilier seichamps"],
    market: "résidentiel ouest de l'agglomération, pavillons",
    loan: "couples actifs du bassin : simulation avant compromis recommandée",
    local: "Seichamps : alternative pavillonnaire à Laxou / Maxéville",
  },
  {
    slug: "fleville-devant-nancy",
    name: "Fléville-devant-Nancy",
    keywords: ["pret immobilier fleville"],
    market: "petite commune résidentielle limitrophe de Jarville",
    loan: "projets familiaux avec budget 54",
    local: "Proximité Jarville — même dynamique commerciale et emploi",
  },
  {
    slug: "custines",
    name: "Custines",
    keywords: ["pret immobilier custines"],
    market: "centre-bourg, maisons et appartements, marché accessible",
    loan: "primo-accédants et rachats : étude gratuite de faisabilité",
    local: "Custines : bon point d'entrée pour un premier achat dans le 54",
  },
  {
    slug: "pompey",
    name: "Pompey",
    keywords: ["pret immobilier pompey"],
    market: "vallée de la Moselle, maisons et petits collectifs",
    loan: "dossiers salariés industries et services du secteur",
    local: "Pompey : axe Nancy — Pont-à-Mousson",
  },
  {
    slug: "richardmenil",
    name: "Richardménil",
    keywords: ["pret immobilier richardmenil"],
    market: "rural proche Saint-Nicolas — maisons et dépendances",
    loan: "maisons avec travaux : intégrer enveloppe travaux dans le montage",
    local: "Secteur sud du bassin nancéien",
  },
  {
    slug: "pont-a-mousson",
    name: "Pont-à-Mousson",
    keywords: ["pret immobilier pont a mousson"],
    market: "centre-ville mosellan, maisons de ville, marché étudiant et familles",
    loan: "profils université et salariés locaux — apport et garanties classiques",
    local: "Pont-à-Mousson : porte sud du bassin d'emploi nancéien",
  },
  {
    slug: "dombasle-sur-meurthe",
    name: "Dombasle-sur-Meurthe",
    keywords: ["pret immobilier dombasle", "credit immo dombasle sur meurthe"],
    market: "commune voisine de Varangéville : maisons, lotissements, bassin salin — demande familiale et primo-accédants",
    loan: "dossiers du secteur Dombasle–Varangéville–Jarville : même étude de faisabilité, banques habituées au 54",
    local: "Dombasle est collée à Varangéville : recherches « prêt Dombasle » = même courtier de proximité",
  },
  {
    slug: "houdemont",
    name: "Houdemont",
    keywords: ["pret immobilier houdemont"],
    market: "pavillons, résidences, Technopôle Brabois à deux pas — cadres et familles du Grand Nancy",
    loan: "tickets parfois plus élevés qu'à Jarville : reste à vivre et apport à caler avant offre",
    local: "Houdemont : commune de la métropole, très demandée pour le calme et l'accès Nancy / Brabois",
  },
  {
    slug: "ludres",
    name: "Ludres",
    keywords: ["pret immobilier ludres"],
    market: "sud de l'agglomération, maisons et zones d'activité — bon rapport surface / budget",
    loan: "profils salariés du sud nancéien : simulation avant compromis recommandée",
    local: "Ludres : alternative à Vandœuvre et Houdemont pour un premier achat",
  },
  {
    slug: "saint-max",
    name: "Saint-Max",
    keywords: ["pret immobilier saint max"],
    market: "commune limitrophe de Nancy : appartements, maisons de ville, marché tendu sur les biens finançables",
    loan: "comme Nancy intra-muros : banques regardent apport, stabilité et reste à vivre",
    local: "Saint-Max : recherche « prêt Nancy » souvent élargie à Saint-Max et Essey",
  },
  {
    slug: "pulnoy",
    name: "Pulnoy",
    keywords: ["pret immobilier pulnoy"],
    market: "est de l'agglomération, pavillons et petits collectifs proches Essey et Seichamps",
    loan: "couples actifs et familles : mensualité calée sur le marché local 54",
    local: "Pulnoy : commune du Grand Nancy, stock limité — financement validé avant visite",
  },
  {
    slug: "saulxures-les-nancy",
    name: "Saulxures-lès-Nancy",
    keywords: ["pret immobilier saulxures les nancy"],
    market: "résidentiel calme entre Seichamps et Pulnoy — maisons familiales",
    loan: "projets RP famille : apport et assurance emprunteur au cœur du dossier",
    local: "Saulxures-lès-Nancy : souvent tapé « Saulxures Nancy » dans les recherches Google",
  },
  {
    slug: "dommartemont",
    name: "Dommartemont",
    keywords: ["pret immobilier dommartemont"],
    market: "petite commune de la métropole, villas et maisons, cadre verdoyant au nord-est",
    loan: "tickets plus élevés : épargne de précaution et reste à vivre décisifs",
    local: "Dommartemont : stock rare, un accord de principe fait la différence",
  },
  {
    slug: "rosieres-aux-salines",
    name: "Rosières-aux-Salines",
    keywords: ["pret immobilier rosieres aux salines"],
    market: "sud-est du bassin (Dombasle, Saint-Nicolas) : maisons, centre-bourg, prix plus doux qu'à Nancy",
    loan: "primo-accédants et familles : bonne alternative budget au 54",
    local: "Rosières-aux-Salines : même dynamique que Saint-Nicolas-de-Port et Dombasle",
  },
  {
    slug: "champigneulles",
    name: "Champigneulles",
    keywords: ["pret immobilier champigneulles"],
    market: "nord de Nancy, maisons et collectifs, axe Pompey / Frouard",
    loan: "dossiers salariés industries et services du val de Moselle",
    local: "Champigneulles : porte nord du bassin, souvent cherchée avec Maxéville et Frouard",
  },
  {
    slug: "frouard",
    name: "Frouard",
    keywords: ["pret immobilier frouard"],
    market: "confluent Moselle / Meurthe, maisons de ville, marché accessible",
    loan: "primo-accédants et rachats : étude de faisabilité identique au reste du 54",
    local: "Frouard : searches « prêt Frouard Pompey » — même courtier Varangéville",
  },
  {
    slug: "liverdun",
    name: "Liverdun",
    keywords: ["pret immobilier liverdun"],
    market: "bourg perché, maisons de caractère, vue Moselle — mix ancien et pavillonnaire",
    loan: "biens anciens : intégrer travaux et DPE dans le montage",
    local: "Liverdun : commune recherchée pour le cadre, financement à préparer avant visite",
  },
  {
    slug: "neuves-maisons",
    name: "Neuves-Maisons",
    keywords: ["pret immobilier neuves maisons"],
    market: "sud Moselle, maisons et appartements, marché plus accessible que Nancy centre",
    loan: "profils salariés et primo-accédants du sud nancéien",
    local: "Neuves-Maisons : souvent associée à Chavigny, Méréville, Richardménil",
  },
  {
    slug: "bouxieres-aux-dames",
    name: "Bouxières-aux-Dames",
    keywords: ["pret immobilier bouxieres aux dames"],
    market: "nord-est, pavillons, proximité Lay-Saint-Christophe et Malzéville",
    loan: "familles du nord de l'agglomération : simulation avant offre",
    local: "Bouxières-aux-Dames : commune recherchée pour le résidentiel calme",
  },
  {
    slug: "gondreville",
    name: "Gondreville",
    keywords: ["pret immobilier gondreville 54"],
    market: "ouest du bassin, maisons et terrains, cadre semi-rural proche Laxou / Velaine",
    loan: "maison + éventuellement terrain : enveloppe globale à monter avec la banque",
    local: "Gondreville : alternative ouest à Laxou et Villers pour un budget 54",
  },
  {
    slug: "mereville",
    name: "Méréville",
    keywords: ["pret immobilier mereville 54"],
    market: "sud, maisons et lotissements proches Neuves-Maisons et Richardménil",
    loan: "projets familiaux avec budget maîtrisé",
    local: "Méréville (54) : ne pas confondre avec l'Essonne — bassin nancéien",
  },
  {
    slug: "chavigny",
    name: "Chavigny",
    keywords: ["pret immobilier chavigny 54"],
    market: "petite commune sud, maisons, proximité Neuves-Maisons",
    loan: "stock limité : financement prêt avant de visiter",
    local: "Chavigny : recherches locales souvent couplées à Neuves-Maisons",
  },
];

var SLUG_SET = {};
COMMUNES.forEach(function (c) {
  SLUG_SET[c.slug] = c;
});

function getCommune(slugOrCity) {
  var slug = typeof slugOrCity === "string" ? slugOrCity : slugOrCity && slugOrCity.slug;
  return SLUG_SET[slug] || null;
}

function isBassinCity(city) {
  return !!(city && SLUG_SET[city.slug]);
}

function allSlugs() {
  return COMMUNES.map(function (c) {
    return c.slug;
  });
}

function profile(city) {
  var c = getCommune(city);
  if (!c) return null;
  return {
    kind: "nancy-bassin",
    label: "Nancy métropole (54)",
    market: c.market,
    loan: c.loan,
    local: c.local,
    search:
      c.local +
      ". Filtrez par mensualité cible après simulation — pas seulement par prix affiché sur les portails",
  };
}

function pretTitle(city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  return "Prêt immobilier " + name + " (54) | Courtier Nancy métropole";
}

function pretDescription(city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  var extra = c && c.aliases && c.aliases.length ? " (" + c.aliases.join(", ") + ")" : "";
  return (
    "Prêt immobilier à " +
    name +
    extra +
    " : simulation, apport, assurance emprunteur. Courtier ORIAS basé à Varangéville — bassin Nancy, Jarville, 54."
  );
}

function pretIntro(city) {
  var c = getCommune(city);
  var p = profile(city);
  return (
    "Vous financez un bien à " +
    (c ? c.name : city.name) +
    " ? " +
    p.loan +
    ". Simulation gratuite, dossier banque et assurance emprunteur — accompagnement de proximité sur le bassin nancéien."
  );
}

function pretCitySections(city) {
  var c = getCommune(city);
  var p = profile(city);
  var name = c ? c.name : city.name;
  return [
    {
      h2: "Prêt immobilier à " + name + " — bassin Nancy (54)",
      paragraphs: [
        "Projet à " + name + " : " + p.market + ".",
        p.loan + ".",
        "Leads Opportunities accompagne les acheteurs de Nancy métropole depuis Varangéville : Jarville, Dombasle-sur-Meurthe, Houdemont, Ludres, Saint-Max, Maxéville, Vandœuvre, Laxou, Saint-Nicolas-de-Port et toutes les communes alentour.",
      ],
      list: [
        "Simulation capacité d'emprunt et mensualité",
        "Apport, reste à vivre, charges et crédits en cours",
        "Assurance emprunteur (Loi Lemoine) et coût global",
        "Primo-accédant, investissement locatif ou résidence principale",
        "Projection coût réel (taxe foncière, énergie, travaux)",
      ],
    },
    {
      h2: "Dossier banque crédible pour " + name,
      paragraphs: [
        p.local + ".",
        "À " +
          name +
          ", un accord de principe avant les visites sérieuses évite de perdre le bien — vendeurs et notaires du 54 attendent un financement solide.",
        "Nous préparons un dossier lisible : revenus, pièces, type de bien, scénario 20 / 25 ans.",
      ],
      list: [
        "Bulletins, avis d'impôt, relevés 3 mois",
        "Apport disponible et épargne de précaution",
        "Type de bien visé à " + name,
        "Calendrier compromis et conditions suspensives",
      ],
    },
    {
      h2: "Communes voisines — même courtier",
      paragraphs: [
        "Vous cherchez aussi sur Jarville, Varangéville, Nancy ou les communes limitrophes ? Une seule étude de faisabilité couvre tout le bassin.",
        "Consultez le hub Nancy métropole pour toutes les pages prêt par commune.",
      ],
    },
  ];
}

function pretCityFaq(city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  return [
    {
      q: "Intervenez-vous pour un prêt immobilier à " + name + " ?",
      a:
        "Oui. Nous étudions les projets à " +
        name +
        " et dans tout le bassin Nancy métropole (54). Simulation gratuite, courtier ORIAS basé à Varangéville.",
    },
    {
      q: "Cherchez-vous « prêt Varengeville » ou « Varangéville » ?",
      a:
        "C'est le même secteur : Varangéville (orthographe officielle), souvent tapé « Varengeville ». Nous couvrons Jarville, Nancy et les communes alentour.",
    },
    {
      q: "Quel apport pour acheter à " + name + " ?",
      a: "Cela dépend du prix local, de votre reste à vivre et de la banque. Nous calculons une fourchette réaliste pour le marché du 54.",
    },
    {
      q: "Prêt refusé — pouvez-vous relancer le dossier ?",
      a: "Oui. Deuxième chance multi-banques, rééquilibrage assurance emprunteur, endettement : voir nos guides prêt refusé et la landing crédit.",
    },
    {
      q: "La simulation est-elle gratuite ?",
      a: "Oui. Première analyse de faisabilité gratuite, puis accompagnement dossier si vous poursuivez.",
    },
  ];
}

function nearbyLinks(city, productDir) {
  return COMMUNES.filter(function (c) {
    return c.slug !== city.slug;
  })
    .slice(0, 16)
    .map(function (c) {
      return {
        href: "/" + productDir + "/" + c.slug + "/",
        label: "Prêt " + c.name,
      };
    });
}

function hubCityGrid(productDir) {
  return COMMUNES.map(function (c) {
    return { href: "/" + productDir + "/" + c.slug + "/", label: c.name };
  });
}

function buildHubPages(page) {
  var gridPret = hubCityGrid("pret-immobilier");
  var gridCredit = hubCityGrid("credit-immo");
  var intro =
    "Prêt immobilier et crédit sur Nancy métropole : Nancy, Jarville-la-Malgrange, Varangéville (Varengeville), Dombasle-sur-Meurthe, Houdemont, Ludres, Saint-Max, Maxéville, Vandœuvre, Laxou, Saint-Nicolas-de-Port, Champigneulles, Frouard, Neuves-Maisons et toutes les communes du 54. Courtier ORIAS basé à Varangéville — simulation gratuite, dossier banque, assurance emprunteur.";
  function hub(file, siloLabel, siloUrl, grid, ctaHref) {
    return page({
      file: file,
      theme: "credit",
      badge: "Nancy métropole · 54",
      title: "Prêt immobilier Nancy métropole | Jarville, Varangéville, Dombasle, Houdemont, 54",
      description:
        "Prêt immobilier Nancy, Jarville, Varangéville, Dombasle, Houdemont, Ludres, Saint-Max, Maxéville et communes du Grand Nancy (54). Courtier à Varangéville. Simulation gratuite.",
      keywords:
        "pret immobilier nancy, pret jarville, pret varangeville, pret varengeville, credit immo 54, courtier nancy",
      h1: "Prêt immobilier — bassin Nancy métropole (54)",
      intro: intro,
      cta: { href: ctaHref, label: "Simulation prêt — bassin Nancy" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: siloLabel, url: siloUrl },
        { name: "Nancy métropole", url: siloUrl.replace(/\/$/, "") + "/nancy-metropole/" },
      ],
      sections: [
        {
          h2: "Pourquoi une page par commune",
          paragraphs: [
            "Les recherches « prêt immobilier Jarville », « crédit Varangéville », « prêt Dombasle », « crédit Houdemont », « simulation prêt Nancy » méritent une réponse locale : prix au m², type de biens, banques habituées au 54.",
            "Chaque fiche commune détaille le marché local et renvoie vers la simulation en ligne avec rappel conseiller.",
          ],
        },
        {
          h2: "Courtier de proximité — Varangéville",
          paragraphs: [
            "Leads Opportunities (Wendy BUCHET) accompagne les projets du bassin nancéien : primo-accédants, rachats, investisseurs, prêt refusé (2e chance).",
            "Une seule demande couvre Nancy, Jarville, Varangéville, Dombasle, Houdemont, Ludres, Saint-Max et les communes alentour — pas besoin de multiplier les interlocuteurs.",
          ],
        },
      ],
      hubCityGrid: grid,
      related: [
        { href: "/landings/credit-immo.html?ville=Nancy", label: "Simulation prêt en ligne" },
        { href: "/landings/projection-achat.html", label: "Coût réel de l'achat" },
        { href: "/recherche-bien/nancy/", label: "Recherche de bien Nancy" },
        { href: "/blog/pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé : que faire" },
        { href: "/pret-immobilier/departement/meurthe-et-moselle/", label: "Département 54" },
      ],
      faq: [
        {
          q: "Couvrez-vous Varangéville et Varengeville ?",
          a: "Oui — orthographe officielle Varangéville ; beaucoup de recherches tapent « Varengeville ». Même bassin, même accompagnement.",
        },
        {
          q: "Et Jarville-la-Malgrange ?",
          a: "Oui, page dédiée et étude de faisabilité incluant les profils du secteur commercial et résidentiel de Jarville.",
        },
        {
          q: "Dombasle, Houdemont, Ludres, Saint-Max : vous y allez ?",
          a: "Oui. Dombasle-sur-Meurthe (voisine de Varangéville), Houdemont, Ludres, Saint-Max, Pulnoy, Champigneulles, Frouard, Neuves-Maisons : une page par commune et la même simulation.",
        },
        {
          q: "Quelles communes du Grand Nancy couvrez-vous ?",
          a: "Nancy, Art-sur-Meurthe, Essey, Fléville, Heillecourt, Houdemont, Jarville, Laneuveville, Laxou, Ludres, Malzéville, Maxéville, Pulnoy, Saint-Max, Saulxures-lès-Nancy, Seichamps, Tomblaine, Vandœuvre, Villers, Dommartemont — plus Varangéville, Dombasle et le bassin élargi (54).",
        },
      ],
    });
  }
  return [
    hub(
      "pret-immobilier/nancy-metropole/index.html",
      "Prêt immobilier",
      "/pret-immobilier/",
      gridPret,
      "/landings/credit-immo.html?ville=Nancy"
    ),
    hub(
      "credit-immo/nancy-metropole/index.html",
      "Crédit immobilier",
      "/credit-immo/",
      gridCredit,
      "/landings/credit-immo.html?ville=Nancy"
    ),
  ];
}

function sitemapEntries(base) {
  var urls = [
    { loc: base + "/pret-immobilier/nancy-metropole/", priority: "0.97", changefreq: "weekly" },
    { loc: base + "/credit-immo/nancy-metropole/", priority: "0.96", changefreq: "weekly" },
  ];
  COMMUNES.forEach(function (c) {
    if (c.slug === "nancy") return;
    urls.push({
      loc: base + "/pret-immobilier/" + c.slug + "/",
      priority: "0.94",
      changefreq: "weekly",
    });
    urls.push({
      loc: base + "/credit-immo/" + c.slug + "/",
      priority: "0.93",
      changefreq: "weekly",
    });
  });
  return urls;
}

module.exports = {
  COMMUNES: COMMUNES,
  allSlugs: allSlugs,
  getCommune: getCommune,
  isBassinCity: isBassinCity,
  profile: profile,
  pretTitle: pretTitle,
  pretDescription: pretDescription,
  pretIntro: pretIntro,
  pretCitySections: pretCitySections,
  pretCityFaq: pretCityFaq,
  nearbyLinks: nearbyLinks,
  hubCityGrid: hubCityGrid,
  buildHubPages: buildHubPages,
  sitemapEntries: sitemapEntries,
};
