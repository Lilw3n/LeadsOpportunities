/**
 * Cluster blog 2026 — VTC, auto, moto, chasse, équitation, habitation, RC Pro, niches.
 * Complète le silo VSP (blog-vsp-articles.cjs). Chargé par le manifeste.
 */
function u(need, campaign) {
  return (
    "../landings/questionnaire.html?need=" +
    need +
    "&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=" +
    campaign
  );
}
function L(path, campaign) {
  var sep = path.indexOf("?") >= 0 ? "&" : "?";
  return path + sep + "utm_source=blog&utm_medium=article&utm_campaign=" + campaign;
}

var QVTC = u("vtc", "vtc");
var QAUTO = u("auto", "auto");
var QMoto = u("moto", "moto");
var QCH = "../landings/chasse.html?utm_source=blog&utm_medium=article&utm_campaign=chasse";
var QEQ = "../landings/equitation.html?utm_source=blog&utm_medium=article&utm_campaign=equitation";
var QHAB = u("habitation", "habitation");
var QPRO = u("rc-pro", "rcpro");
var QDEC = u("decennale", "decennale");
var QSANT = u("sante", "sante");
var QINS = u("instrument", "instrument");
var QBAT = u("bateau", "bateau");
var QCAR = u("caravane", "caravane");
var QPHOTO = u("materiel-photo", "photo");

function related(extra, core) {
  extra = extra || [];
  core = core || [];
  var seen = {};
  return extra.concat(core).filter(function (l) {
    if (!l || !l.href || seen[l.href]) return false;
    seen[l.href] = true;
    return true;
  });
}

var VTC_CORE = [
  { href: "./assurance-vtc-moins-cher-2026.html", label: "VTC moins cher" },
  { href: "./assurance-vtc-uber-bolt-heetch.html", label: "Uber Bolt Heetch" },
  { href: "./tarif-assurance-vtc-2026.html", label: "Tarifs VTC" },
  { href: "./assurance-vtc-ile-de-france-paris-2026.html", label: "VTC Île-de-France" },
  { href: "../assurance-vtc/", label: "Hub VTC" },
  { href: "../landings/vtc.html", label: "Devis VTC" },
];

module.exports = [
  /* ——— VTC ——— */
  {
    file: "assurance-vtc-ile-de-france-paris-2026.html",
    section: "vtc",
    tag: "VTC IDF",
    tagClass: "tag-vtc",
    themes: ["vtc", "paris", "idf"],
    title: "Assurance VTC en Île-de-France et à Paris : tarifs, aéroports, gares",
    description:
      "Assurance VTC Paris / IDF 2026 : RC pro, Uber Bolt Heetch, CDG, Orly, La Défense. Devis courtier ORIAS, rappel sous 15 min.",
    meta: "9 min · Août 2026",
    cardExcerpt: "VTC Paris et IDF : ce qui change vs le reste de la France.",
    keywords: [
      "assurance vtc paris",
      "assurance vtc île-de-france",
      "assurance chauffeur uber paris",
      "rc pro vtc idf",
    ],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Devis VTC Paris / IDF" },
    blocks: [
      {
        type: "p",
        text: "Deux tiers des VTC français travaillent en <strong>Île-de-France</strong>. Prime, sinistralité, aéroports (CDG, Orly), gares, La Défense : un contrat « province » mal calé se paie au premier sinistre parisien. <a href=\"" +
          L("../landings/vtc.html", "vtc") +
          "\"><strong>Devis VTC IDF</strong></a> · <a href=\"" +
          QVTC +
          "\">questionnaire chauffeur</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi l’IDF tarife plus" },
      {
        type: "p",
        text: "Kilométrage, densité, stationnement, vols, bris : Paris et la petite couronne ne sont pas Dijon. Déclarez la <strong>zone réelle</strong> (75, 92, 93, 94…) et les plateformes. Hub : <a href=\"../assurance-vtc/ile-de-france/\">VTC Île-de-France</a> · <a href=\"../assurance-vtc/paris/\">Paris</a>.",
      },
      { type: "h2", text: "2. Aéroports et gares" },
      {
        type: "ul",
        items: [
          "<a href=\"../assurance-vtc/aeroport-cdg/\">CDG</a> et <a href=\"../assurance-vtc/aeroport-orly/\">Orly</a> : files, stationnement, horaires de nuit",
          "<a href=\"../assurance-vtc/paris-gares/\">Gares parisiennes</a> : flux, sinistres manœuvre",
          "<a href=\"../assurance-vtc/la-defense/\">La Défense</a> : clientèle B2B, horaires de pointe",
        ],
      },
      { type: "h2", text: "3. RC pro + véhicule" },
      {
        type: "p",
        text: "Les plateformes veulent une <strong>RC pro transport de personnes</strong> + un véhicule déclaré. Voir <a href=\"./assurance-vtc-rc-pro-garanties.html\">RC pro</a> et <a href=\"./assurance-vtc-uber-bolt-heetch.html\">Uber / Bolt / Heetch</a>. Tarifs : <a href=\"./tarif-assurance-vtc-2026.html\">prix 2026</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un contrat VTC Lyon marche-t-il à Paris ?",
        a: "Souvent oui s’il couvre la France, mais la prime et les franchises sont calées sur la zone déclarée. Recalibrez si vous basculez en IDF.",
      },
      {
        q: "Faut-il un contrat par arrondissement ?",
        a: "Non. Un contrat VTC IDF / Paris suffit. Les pages 15e, CDG, Orly aident au SEO et au devis, pas à multiplier les polices.",
      },
    ],
    related: related(
      [
        { href: "./assurance-vtc-aeroport-cdg-orly-2026.html", label: "VTC CDG / Orly" },
        { href: "../assurance-vtc/ile-de-france/", label: "Hub IDF" },
      ],
      VTC_CORE
    ),
  },
  {
    file: "assurance-vtc-aeroport-cdg-orly-2026.html",
    section: "vtc",
    tag: "Aéroports",
    tagClass: "tag-vtc",
    themes: ["vtc", "aeroport"],
    title: "Assurance VTC aéroport CDG et Orly : courses, files, garanties",
    description:
      "Chauffeur VTC CDG / Orly : RC pro, stationnement, nuit, Uber Bolt. Devis courtier ORIAS Île-de-France.",
    meta: "8 min · Août 2026",
    cardExcerpt: "CDG et Orly : le contrat VTC doit suivre les courses aéroport.",
    keywords: ["assurance vtc cdg", "assurance vtc orly", "chauffeur uber aéroport", "rc pro vtc aéroport"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Devis VTC aéroport" },
    blocks: [
      {
        type: "p",
        text: "Les courses <strong>CDG</strong> et <strong>Orly</strong> pèsent lourd en IDF : files, bagages, horaires de nuit, stationnement. L’assurance VTC doit couvrir le <strong>transport de personnes</strong> sans exclusion aéroport. <a href=\"" +
          L("../landings/vtc.html", "vtc") +
          "\"><strong>Devis chauffeur aéroport</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que l’assureur veut savoir" },
      {
        type: "ul",
        items: [
          "Part du CA aéroport vs ville",
          "Amplitude (nuit, 5 h du matin)",
          "Véhicule (break, berline, 7 places)",
          "Plateformes (Uber Airport, Bolt, centrales)",
        ],
      },
      { type: "h2", text: "2. Pages money" },
      {
        type: "p",
        text: "<a href=\"../assurance-vtc/aeroport-cdg/\">Assurance VTC CDG</a> · <a href=\"../assurance-vtc/aeroport-orly/\">Orly</a> · <a href=\"./assurance-vtc-ile-de-france-paris-2026.html\">cluster IDF</a>.",
      },
      { type: "h2", text: "3. Sinistres typiques" },
      {
        type: "p",
        text: "Manœuvre parking, hayon, bagages, accrochage file. Franchise <a href=\"./assurance-vtc-franchise-garanties-2026.html\">tous risques vs tiers</a> : calculez avant de signer un « pas cher ».",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Les plateformes exigent-elles une mention aéroport ?",
        a: "Elles exigent un contrat VTC transport de personnes. La mention aéroport n’est pas toujours nominative — l’usage pro et la zone IDF le sont.",
      },
    ],
    related: related([{ href: "../assurance-vtc/aeroport-cdg/", label: "Hub CDG" }], VTC_CORE),
  },
  {
    file: "tarif-assurance-vtc-2026.html",
    section: "vtc",
    tag: "Tarifs VTC",
    tagClass: "tag-vtc",
    themes: ["vtc", "tarif"],
    title: "Tarif assurance VTC 2026 : prix, RC pro, ce qui fait varier",
    description:
      "Prix d’une assurance VTC en 2026 : RC pro, véhicule, IDF vs province, franchise. Devis Zéphir, Solly Azar, courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Combien coûte une assurance VTC en 2026 — et pourquoi l’IDF change tout.",
    keywords: ["tarif assurance vtc", "prix assurance vtc 2026", "assurance vtc pas cher", "cotisation rc pro vtc"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Estimer mon tarif VTC" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>tarif assurance VTC</strong> n’est pas un prix catalogue auto. RC pro, passagers, plateforme, zone (Paris vs Nantes), valeur du véhicule, sinistres : cinq leviers. <a href=\"" +
          L("../landings/vtc.html", "vtc") +
          "\"><strong>Obtenir un tarif personnalisé</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ordres de grandeur" },
      {
        type: "p",
        text: "Un chauffeur province, véhicule d’occasion, faible sinistralité : fourchette plus basse. <strong>IDF + berline récente + tous risques</strong> : la prime grimpe. Les moyennes Google ne remplacent pas un devis Zéphir / Solly Azar / Allianz à garanties égales. Page silo : <a href=\"../assurance-vtc/tarif/\">tarif VTC</a> · <a href=\"../assurance-vtc/pas-cher/\">pas cher</a>.",
      },
      { type: "h2", text: "2. Leviers" },
      {
        type: "ul",
        items: [
          "Franchise véhicule (voir <a href=\"./assurance-vtc-franchise-garanties-2026.html\">article franchise</a>)",
          "Zone : IDF vs autres régions",
          "Ancienneté carte VTC et permis",
          "Crédit / LOA : souvent tous risques imposé",
          "Pack RC pro + auto chez le même acteur",
        ],
      },
      { type: "h2", text: "3. « Pas cher » vs interruption d’activité" },
      {
        type: "p",
        text: "Un contrat trop juste fait désactiver Uber. Comparez <a href=\"./comparatif-vtc-zephir-solly-azar.html\">Zéphir / Solly Azar</a> et <a href=\"./assurance-vtc-moins-cher-2026.html\">7 leviers</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC pro est-elle dans le même tarif que l’auto ?",
        a: "Parfois packagée, parfois deux lignes. Le devis doit afficher les deux : véhicule + transport de personnes.",
      },
    ],
    related: related([{ href: "../assurance-vtc/tarif/", label: "Page tarifs VTC" }], VTC_CORE),
  },
  {
    file: "carte-professionnelle-vtc-assurance-obligatoire.html",
    section: "vtc",
    tag: "Carte VTC",
    tagClass: "tag-vtc",
    themes: ["vtc", "creation"],
    title: "Carte professionnelle VTC et assurance obligatoire : l’ordre des démarches",
    description:
      "Carte VTC, visite médicale, immatriculation, RC pro : que souscrire avant la première course Uber / Bolt. Courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Sans attestation VTC, pas de plateforme — l’assurance avant la 1re course.",
    keywords: ["carte vtc assurance", "assurance obligatoire vtc", "création chauffeur vtc", "rc pro avant première course"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Devis création VTC" },
    blocks: [
      {
        type: "p",
        text: "La <strong>carte professionnelle VTC</strong> ne remplace pas l’assurance. Plateformes et préfecture veulent une <strong>RC pro transport de personnes</strong> + un véhicule assuré usage pro. Ordre : pièces, devis, attestation, activation. <a href=\"" +
          QVTC +
          "\"><strong>Questionnaire nouveau chauffeur</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Checklist" },
      {
        type: "ul",
        items: [
          "Carte VTC + visite médicale à jour",
          "Immatriculation / statut (EI, société)",
          "Attestation RC pro VTC",
          "Attestation véhicule (usage transport personnes)",
          "Puis compte Uber / Bolt / Heetch",
        ],
      },
      { type: "h2", text: "2. Guides liés" },
      {
        type: "p",
        text: "<a href=\"./assurance-vtc-creation-chauffeur.html\">Création activité</a> · <a href=\"./vtc-premiere-course-checklist-assurance.html\">1re course</a> · <a href=\"../assurance-vtc/creation-activite/\">page silo</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je activer Uber avec une auto perso ?",
        a: "Non : il faut un contrat VTC (transport de personnes). Un contrat auto particulier exclut souvent l’activité onéreuse.",
      },
    ],
    related: related([{ href: "./vtc-premiere-course-checklist-assurance.html", label: "Checklist 1re course" }], VTC_CORE),
  },
  {
    file: "assurance-vtc-nancy-varangeville-54.html",
    section: "vtc",
    tag: "Meurthe-et-Moselle",
    tagClass: "tag-vtc",
    themes: ["vtc", "nancy", "local-54"],
    title: "Assurance VTC à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "Chauffeur VTC Nancy / Varangéville (54) : RC pro, Uber Bolt, devis local courtier ORIAS. Bassin nancéien, pas une hotline anonyme.",
    meta: "8 min · Août 2026",
    cardExcerpt: "VTC dans le 54 : Nancy, Varangéville, métropole — devis local.",
    keywords: [
      "assurance vtc nancy",
      "assurance vtc varangéville",
      "chauffeur uber nancy",
      "rc pro vtc meurthe-et-moselle",
    ],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Devis VTC Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Assurer un <strong>VTC à Nancy</strong>, <strong>Varangéville</strong> ou Jarville, ce n’est pas coller un tarif Paris. Trajets métropole, gare, aéroport régional, plateformes : le dossier se monte en <strong>Meurthe-et-Moselle</strong>. <a href=\"" +
          L("../landings/vtc.html", "vtc") +
          "\"><strong>Devis VTC bassin nancéien</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pages ville" },
      {
        type: "p",
        text: "Silo : <a href=\"../assurance-vtc/nancy/\">VTC Nancy</a> (si page ville live) · agence <a href=\"../agence-varangeville/\">Varangéville</a>. Orthographe : <strong>Varangéville</strong> (54), pas une commune normande.",
      },
      { type: "h2", text: "2. Usages locaux" },
      {
        type: "ul",
        items: [
          "Gare Nancy, CHRU, parc des expositions",
          "Trajets village ↔ métropole (Dombasle, Saint-Max, Ludres)",
          "Moins de files aéroport qu’en IDF — prime souvent plus douce",
        ],
      },
      { type: "h2", text: "3. Même RC pro qu’ailleurs" },
      {
        type: "p",
        text: "Les exigences Uber / Bolt sont nationales. Le 54 change le <strong>tarif véhicule</strong>, pas l’obligation RC pro. <a href=\"./assurance-vtc-uber-bolt-heetch.html\">Plateformes</a> · <a href=\"./tarif-assurance-vtc-2026.html\">tarifs</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Comment s’écrit la commune du 54 ?",
        a: "Varangéville (avec un a), bassin de Nancy / Dombasle. C’est celle de l’agence locale.",
      },
    ],
    related: related(
      [
        { href: "../agence-varangeville/", label: "Agence Varangéville" },
        { href: "./assurance-vsp-nancy-varangeville-meurthe-et-moselle.html", label: "VSP Nancy / 54" },
      ],
      VTC_CORE
    ),
  },
  {
    file: "assurance-vtc-vehicule-loa-credit.html",
    section: "vtc",
    tag: "LOA / crédit",
    tagClass: "tag-vtc",
    themes: ["vtc", "credit"],
    title: "VTC en LOA ou crédit : assurance tous risques, perte financière",
    description:
      "Véhicule VTC financé (LOA, LLD, crédit) : tous risques souvent imposé, perte financière, franchise. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "LOA VTC : le financeur exige souvent le tous risques.",
    keywords: ["assurance vtc loa", "assurance vtc crédit auto", "tous risques vtc leasing", "perte financière vtc"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Devis VTC véhicule financé" },
    blocks: [
      {
        type: "p",
        text: "En <strong>LOA / LLD / crédit</strong>, le financeur impose presque toujours le <strong>tous risques</strong> + parfois une <strong>perte financière</strong>. Un tiers VTC « pas cher » fait refuser le dossier ou laisse un trou après vol. <a href=\"" +
          QVTC +
          "\"><strong>Déclarer mon financement</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que demande le loueur" },
      {
        type: "ul",
        items: [
          "Tous risques, valeur à neuf ou valeur à dire d’expert",
          "Attestation à son nom / clause bénéficiaire",
          "Franchise plafonnée",
        ],
      },
      { type: "h2", text: "2. Perte financière" },
      {
        type: "p",
        text: "Si le véhicule est détruit, l’assureur indemnise la valeur ; le crédit peut rester plus élevé. La garantie perte financière comble l’écart. À caler avec <a href=\"./assurance-vtc-tous-risques-passagers.html\">tous risques + passagers</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je passer en tiers la 2e année de LOA ?",
        a: "Rarement tant que le contrat de financement l’interdit. Relisez le leasing avant de baisser la formule pour « économiser ».",
      },
    ],
    related: related([{ href: "./assurance-vtc-franchise-garanties-2026.html", label: "Franchises VTC" }], VTC_CORE),
  },
  {
    file: "assurance-vtc-tous-risques-passagers.html",
    section: "vtc",
    tag: "Tous risques",
    tagClass: "tag-vtc",
    themes: ["vtc", "garanties"],
    title: "Assurance VTC tous risques et passagers : ce qui est vraiment couvert",
    description:
      "Tous risques VTC vs tiers : véhicule, passagers, RC pro. Franchises, exclusions plateformes. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Tous risques VTC : véhicule + passagers, deux sujets différents.",
    keywords: ["assurance vtc tous risques", "garantie passagers vtc", "tiers vtc", "dommages passagers chauffeur"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Comparer formules VTC" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>tous risques VTC</strong> répare votre voiture. Les <strong>passagers</strong> relèvent de la RC pro / garantie corporelle. Mélanger les deux, c’est signer le mauvais devis. <a href=\"" +
          L("../landings/vtc.html", "vtc") +
          "\"><strong>Comparer les formules</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Tiers vs tous risques (véhicule)" },
      {
        type: "p",
        text: "Tiers : vous cassez la voiture d’un autre. Tous risques : la vôtre aussi (même responsable), avec franchise. Détail : <a href=\"./assurance-vtc-franchise-garanties-2026.html\">franchises 2026</a>.",
      },
      { type: "h2", text: "2. Passagers" },
      {
        type: "p",
        text: "Chute, freinage, accident : la RC pro VTC indemnise. Vérifiez plafonds corporels exigés par Uber / Bolt. <a href=\"./assurance-vtc-rc-pro-garanties.html\">RC pro</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le tous risques couvre-t-il un passager blessé ?",
        a: "Pas à lui seul. Les dommages corporels passagers passent par la RC pro / garantie dédiée. Les deux doivent être en place.",
      },
    ],
    related: related([{ href: "./assurance-vtc-rc-pro-garanties.html", label: "RC Pro VTC" }], VTC_CORE),
  },
  {
    file: "assurance-vtc-multi-apps-uber-bolt-heetch.html",
    section: "vtc",
    tag: "Multi-apps",
    tagClass: "tag-vtc",
    themes: ["vtc", "plateformes"],
    title: "VTC multi-apps : un seul contrat pour Uber, Bolt et Heetch ?",
    description:
      "Rouler sur plusieurs plateformes VTC : un contrat, des exclusions, des plafonds. Devis compatible Uber + Bolt + Heetch.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Multi-plateforme : un contrat VTC bien rédigé suffit en général.",
    keywords: ["assurance vtc multi plateforme", "uber et bolt même assurance", "contrat vtc plusieurs apps"],
    cta: { href: L("../landings/vtc.html", "vtc"), label: "Vérifier mon contrat multi-apps" },
    blocks: [
      {
        type: "p",
        text: "La plupart des chauffeurs empilent <strong>Uber + Bolt</strong> (parfois Heetch). Un seul <strong>contrat VTC</strong> suffit s’il couvre le transport de personnes <strong>sans restriction nominative</strong> d’app. <a href=\"" +
          QVTC +
          "\"><strong>Déclarer mes plateformes</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qui bloque" },
      {
        type: "ul",
        items: [
          "Exclusion « activité VTC » ou « plateforme »",
          "Attestation au nom d’une seule app",
          "Usage déclaré « loisir » au lieu de pro",
        ],
      },
      { type: "h2", text: "2. Article lié" },
      {
        type: "p",
        text: "<a href=\"./assurance-vtc-uber-bolt-heetch.html\">Exigences Uber Bolt Heetch</a> · silo <a href=\"../assurance-vtc/uber-bolt/\">uber-bolt</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Dois-je prévenir l’assureur si j’ajoute Bolt ?",
        a: "Si le contrat vise déjà le transport de personnes via plateforme, souvent non. En cas de doute, une attestation à jour évite un sinistre contesté.",
      },
    ],
    related: related([{ href: "./assurance-vtc-uber-bolt-heetch.html", label: "Uber Bolt Heetch" }], VTC_CORE),
  },

  /* ——— Auto ——— */
  {
    file: "tarif-assurance-auto-2026.html",
    section: "auto",
    tag: "Tarifs auto",
    tagClass: "tag-auto",
    themes: ["auto", "tarif"],
    title: "Tarif assurance auto 2026 : prix, bonus-malus, ce qui fait varier",
    description:
      "Prix d’une assurance auto en 2026 : bonus-malus, jeune conducteur, tous risques, commune. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Combien coûte une assurance auto en 2026 — au-delà de la moyenne nationale.",
    keywords: ["tarif assurance auto 2026", "prix assurance auto", "assurance auto pas cher", "cotisation bonus malus"],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Devis assurance auto" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>tarif auto 2026</strong> dépend du coefficient CRM, du véhicule, de la commune et de la formule — pas d’un « prix moyen France » collé en pub. <a href=\"" +
          QAUTO +
          "\"><strong>Comparer à garanties égales</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Leviers" },
      {
        type: "ul",
        items: [
          "Bonus-malus (<a href=\"./assurance-auto-bonus-malus.html\">guide CRM</a>)",
          "Jeune permis (<a href=\"./assurance-auto-jeune-conducteur-2026.html\">article jeunes</a>)",
          "Tous risques vs tiers (<a href=\"./assurance-auto-tous-risques-ou-tiers-2026.html\">choix formule</a>)",
          "Stationnement, kilométrage, conducteurs secondaires",
        ],
      },
      { type: "h2", text: "2. Changer sans trou" },
      {
        type: "p",
        text: "<a href=\"./resilier-assurance-auto-loi-hamon-2026.html\">Loi Hamon</a> après un an. Relevé d’information obligatoire. On compare des offres <strong>courtier / grossiste</strong> à garanties égales — pas un prix Facebook.",
      },
      { type: "h2", text: "3. Localité : Paris, IDF, Nancy / 54" },
      {
        type: "p",
        text: "La commune tarife. Pages : <a href=\"./assurance-auto-paris-ile-de-france-2026.html\">auto Paris / Île-de-France</a> · <a href=\"./assurance-auto-nancy-varangeville-54.html\">Nancy, Varangéville, Meurthe-et-Moselle</a> · silo <a href=\"../assurance-auto/villes/\">assurance auto par ville</a>.",
      },
      { type: "h2", text: "4. Mots-clés utiles pour comparer" },
      {
        type: "ul",
        items: [
          "assurance auto pas cher / tarif assurance auto 2026",
          "tous risques ou tiers, vol, bris de glace",
          "jeune conducteur, permis probatoire, malus après accident",
          "assurance auto Paris, Lyon, Marseille, Nancy, Varangéville",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Pourquoi deux devis si différents pour la même Clio ?",
        a: "CRM, date de permis, commune, conducteur secondaire et franchise suffisent. Comparez le tableau de garanties, pas le seul mensualité.",
      },
    ],
    related: [
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus" },
      { href: "./assurance-auto-paris-ile-de-france-2026.html", label: "Auto Paris / IDF" },
      { href: "./assurance-auto-nancy-varangeville-54.html", label: "Auto Nancy / 54" },
      { href: "../assurance-auto/", label: "Hub auto" },
    ],
  },
  {
    file: "assurance-auto-tous-risques-ou-tiers-2026.html",
    section: "auto",
    tag: "Formules",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Assurance auto tous risques ou tiers en 2026 : comment choisir",
    description:
      "Tiers, tiers + vol/bris, tous risques : quelle formule auto selon l’âge du véhicule, le crédit et le stationnement.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Tous risques vs tiers : le calcul valeur du véhicule / franchise.",
    keywords: ["assurance auto tous risques", "tiers ou tous risques", "formule assurance auto", "vol bris de glace auto"],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Comparer formules auto" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>tiers</strong> est le plancher légal. Le <strong>tous risques</strong> a un sens sur un véhicule récent, financé, ou trop exposé en rue. Entre les deux : vol / bris. <a href=\"" +
          QAUTO +
          "\"><strong>Choisir ma formule</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Quand le tiers suffit" },
      {
        type: "p",
        text: "Voiture ancienne, faible valeur, box, bonus élevé. La prime tous risques + franchise peut dépasser la valeur à dire d’expert.",
      },
      { type: "h2", text: "2. Quand viser plus" },
      {
        type: "ul",
        items: ["Crédit / LOA", "Véhicule &lt; 5–7 ans", "Stationnement rue, grande ville", "Jeune conducteur (choc responsable fréquent)"],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le bris de glace est-il dans le tiers ?",
        a: "Pas toujours. C’est souvent une option. Vérifiez franchise bris : elle peut tuer l’intérêt de l’option.",
      },
    ],
    related: [
      { href: "./tarif-assurance-auto-2026.html", label: "Tarifs auto" },
      { href: "../assurance-auto/", label: "Hub auto" },
    ],
  },
  {
    file: "resilier-assurance-auto-loi-hamon-2026.html",
    section: "auto",
    tag: "Résiliation",
    tagClass: "tag-auto",
    themes: ["auto", "hamon"],
    title: "Résilier son assurance auto (loi Hamon) : dates, relevé, sans trou",
    description:
      "Changer d’assurance auto après 1 an (Hamon), à l’échéance ou vente du véhicule. Relevé d’information, dates de prise d’effet.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Hamon auto : le nouvel assureur peut résilier l’ancien après 12 mois.",
    keywords: ["résilier assurance auto", "loi hamon auto", "changer d'assurance auto", "relevé d'information auto"],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Comparer avant de résilier" },
    blocks: [
      {
        type: "p",
        text: "Après <strong>12 mois</strong>, la <strong>loi Hamon</strong> permet de changer d’assurance auto sans attendre l’échéance. On compare d’abord, on aligne les dates ensuite — jamais de trou de RC. <a href=\"" +
          QAUTO +
          "\"><strong>Devis pour changer</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pièces" },
      {
        type: "ul",
        items: ["Relevé d’information", "Carte grise", "Permis", "RIB pour le nouvel assureur"],
      },
      { type: "h2", text: "2. Cas particuliers" },
      {
        type: "p",
        text: "Vente du véhicule, malus après accident (<a href=\"./assurance-auto-malus-apres-accident.html\">article malus</a>), jeune ajouté au foyer.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le nouvel assureur s’occupe-t-il de la résiliation ?",
        a: "Souvent oui après un an (Hamon). Fournissez le contrat en cours et le relevé.",
      },
    ],
    related: [
      { href: "./tarif-assurance-auto-2026.html", label: "Tarifs auto" },
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus" },
    ],
  },
  {
    file: "assurance-auto-malus-apres-accident.html",
    section: "auto",
    tag: "Malus",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Malus auto après accident : que faire de son coefficient 2026",
    description:
      "Sinistre responsable, malus CRM, surprimes, changer d’assureur. Solutions courtier après un accident.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Après un accident responsable : relire le CRM avant de résilier à la hâte.",
    keywords: ["malus après accident", "coefficient crm sinistre", "assurance auto malus", "changer assureur malus"],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Devis même avec malus" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>sinistre responsable</strong> fait monter le CRM. Ce n’est pas la fin du marché : certains assureurs restent compétitifs à 1,25 ou 1,50. <a href=\"./assurance-auto-bonus-malus.html\">Comprendre le bonus-malus</a> · <a href=\"" +
          QAUTO +
          "\">devis</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Attendre le relevé" },
      {
        type: "p",
        text: "Ne résiliez pas au feeling. Le nouvel assureur lira le relevé, pas votre souvenir de l’accrochage.",
      },
      { type: "h2", text: "2. Levier formule" },
      {
        type: "p",
        text: "Parfois mieux vaut une franchise plus haute qu’un assureur « malus » hors de prix. <a href=\"./assurance-auto-tous-risques-ou-tiers-2026.html\">Tiers vs tous risques</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un accident non responsable malusse-t-il ?",
        a: "En principe non (CRM). Vérifiez le partage de responsabilité sur le constat / l’enquête.",
      },
    ],
    related: [
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus" },
      { href: "./resilier-assurance-auto-loi-hamon-2026.html", label: "Hamon auto" },
    ],
  },

  /* ——— Moto / scooter ——— */
  {
    file: "assurance-moto-scooter-2026.html",
    section: "auto",
    tag: "Moto",
    tagClass: "tag-auto",
    themes: ["moto", "auto"],
    title: "Assurance moto et scooter 2026 : RC, vol, jeune permis",
    description:
      "Assurer moto, scooter 125 ou 50 cm³ : RC obligatoire, vol, bris, permis A2. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Moto / scooter : un contrat deux-roues, pas une auto.",
    keywords: ["assurance moto 2026", "assurance scooter 125", "assurance deux-roues", "rc moto obligatoire"],
    cta: { href: L("../landings/devis.html?need=moto", "moto"), label: "Devis moto / scooter" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>deux-roues</strong> n’entre pas dans le contrat auto du foyer. RC obligatoire, vol fréquent en ville, permis A / A2 / AM selon cylindrée. <a href=\"" +
          QMoto +
          "\"><strong>Devis moto ou scooter</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Cylindrée et permis" },
      {
        type: "ul",
        items: [
          "50 cm³ / AM : proche VSP cyclomoteur — <a href=\"./assurance-scooter-50-125-permis.html\">article 50/125</a>",
          "125 cm³ : permis A1 ou formation 7 h selon cas",
          "Grosse cylindrée : A2 puis A, tarif et vol plus élevés",
        ],
      },
      { type: "h2", text: "2. Jeune permis moto" },
      {
        type: "p",
        text: "<a href=\"./assurance-moto-jeune-permis-a2.html\">Jeune permis A2</a> : surprimes, franchises, parfois exclusion des 1res cylindrées sportives.",
      },
      { type: "h2", text: "3. Ville et stationnement" },
      {
        type: "p",
        text: "Paris, Lyon, Nancy : le vol deux-roues pèse plus que la cylindrée. Déclarez box vs rue. Croisé auto : <a href=\"./tarif-assurance-auto-2026.html\">tarifs auto</a> · VSP : <a href=\"./assurance-voiture-sans-permis-guide-2026.html\">voiture sans permis</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je assurer le scooter sur l’auto ?",
        a: "Presque jamais. Il faut un contrat deux-roues dédié (RC + options vol).",
      },
    ],
    related: [
      { href: "./assurance-moto-jeune-permis-a2.html", label: "Jeune permis moto" },
      { href: "../landings/devis.html?need=moto", label: "Devis moto" },
    ],
  },
  {
    file: "assurance-moto-jeune-permis-a2.html",
    section: "auto",
    tag: "Permis A2",
    tagClass: "tag-auto",
    themes: ["moto"],
    title: "Assurance moto jeune permis A2 : surprimes, cylindrée, astuces 2026",
    description:
      "Jeune permis moto A2 : comment payer moins sans véhicule inassurable. Devis deux-roues courtier ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "A2 : le choix de la moto pèse plus que le comparateur.",
    keywords: ["assurance moto A2", "jeune permis moto", "assurance 125 jeune", "surprime moto"],
    cta: { href: L("../landings/devis.html?need=moto", "moto"), label: "Devis jeune permis moto" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>permis A2</strong> bride la puissance — pas toujours la prime. Cylindrée, usage, stationnement, antécédents auto : le courtier compare. <a href=\"" +
          QMoto +
          "\"><strong>Devis A2</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Éviter les modèles « sport »" },
      {
        type: "p",
        text: "Certains roadsters sont refusés ou tarifés hors marché la 1re année. Une trail / 125 bien choisie passe mieux.",
      },
      { type: "h2", text: "2. Pack vol" },
      {
        type: "p",
        text: "En ville, le vol vaut souvent plus que l’option. Antivol, garage, tracing : déclarez le vrai stationnement.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le bonus auto se transfère-t-il à la moto ?",
        a: "Pas automatiquement. Certains assureurs tiennent compte du CRM auto ; d’autres tarient la moto à part.",
      },
    ],
    related: [{ href: "./assurance-moto-scooter-2026.html", label: "Guide moto / scooter" }],
  },
  {
    file: "assurance-scooter-50-125-permis.html",
    section: "auto",
    tag: "Scooter",
    tagClass: "tag-auto",
    themes: ["moto", "vsp"],
    title: "Assurance scooter 50 et 125 cm³ : permis AM, A1, formation 7 h",
    description:
      "Assurer un scooter 50 (AM) ou 125 : documents, vol, RC. Lien avec VSP / cyclomoteur. Devis ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "50 cm³ vs 125 : le permis change, le contrat deux-roues aussi.",
    keywords: ["assurance scooter 50", "assurance scooter 125", "assurance cyclomoteur", "permis AM scooter"],
    cta: { href: L("../landings/devis.html?need=moto", "moto"), label: "Devis scooter" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>scooter 50</strong> se conduit souvent en permis AM (comme une partie des VSP cyclomoteurs). Le <strong>125</strong> demande A1 ou une formation. Deux contrats, deux tarifs. <a href=\"" +
          QMoto +
          "\"><strong>Devis scooter</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. 50 cm³ et AM" },
      {
        type: "p",
        text: "Même logique de pièce que <a href=\"./permis-am-bsr-assr-voiture-sans-permis-2026.html\">permis AM / BSR</a>. Ne pas coller le scooter sur l’auto des parents sans avenant deux-roues.",
      },
      { type: "h2", text: "2. Vol en ville" },
      {
        type: "p",
        text: "Option vol quasi indispensable hors box. Franchise et conditions antivol à lire.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un 50 cm³ est-il une VSP ?",
        a: "Non : cyclomoteur / scooter, pas quadricycle L6e. L’assurance est un contrat deux-roues, pas le produit VSP Aixam.",
      },
    ],
    related: [
      { href: "./assurance-moto-scooter-2026.html", label: "Guide moto" },
      { href: "./assurance-voiture-sans-permis-guide-2026.html", label: "Guide VSP" },
    ],
  },

  /* ——— Chasse / équitation ——— */
  {
    file: "tarif-assurance-chasse-rc-chasseur-2026.html",
    section: "chasse",
    tag: "Tarifs chasse",
    tagClass: "tag-actu",
    themes: ["chasse"],
    title: "Tarif assurance chasse et RC chasseur 2026 : prix, chien, arme",
    description:
      "Prix d’une RC chasseur 2026 : individuelle, via fédération, chien de chasse. Devis courtier, landing chasse.",
    meta: "8 min · Août 2026",
    cardExcerpt: "RC chasseur : ce que coûte vraiment une saison 2026.",
    keywords: ["tarif assurance chasse", "prix rc chasseur", "assurance chasse pas cher", "rc chasseur 2026"],
    cta: { href: QCH, label: "Devis assurance chasse" },
    blocks: [
      {
        type: "p",
        text: "La <strong>RC chasseur</strong> est le poste minimum (tir, tiers, parfois chien). Le tarif 2026 dépend du mode (individuelle vs fédération), des options chien / arme, de la zone. <a href=\"" +
          QCH +
          "\"><strong>Devis chasse</strong></a> · guide <a href=\"./assurance-chasse-rc-chasseur-guide-2026.html\">RC 2026</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Fédération vs contrat individuel" },
      {
        type: "p",
        text: "La fédé couvre souvent le minimum. Chien de chasse, invités, chasse à l’étranger : un contrat dédié complète. <a href=\"./assurance-chien-de-chasse-rc-comparatif.html\">Chien de chasse</a>.",
      },
      { type: "h2", text: "2. Local 54" },
      {
        type: "p",
        text: "<a href=\"./assurance-chasse-nancy-meurthe-et-moselle.html\">Chasse Nancy / Meurthe-et-Moselle</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC de la fédération suffit-elle ?",
        a: "Pour un tir simple parfois. Dès qu’un chien, un véhicule, un invité ou un déplacement entre en jeu, relisez les plafonds.",
      },
    ],
    related: [
      { href: "./assurance-chasse-rc-chasseur-guide-2026.html", label: "Guide RC chasseur" },
      { href: "../assurance-chasse/", label: "Hub chasse" },
      { href: "../landings/chasse.html", label: "Landing chasse" },
    ],
  },
  {
    file: "assurance-chasse-nancy-meurthe-et-moselle.html",
    section: "chasse",
    tag: "Chasse 54",
    tagClass: "tag-actu",
    themes: ["chasse", "nancy"],
    title: "Assurance chasse en Meurthe-et-Moselle : Nancy, Varangéville, battues",
    description:
      "RC chasseur 54 (Nancy, Varangéville, Dombasle) : battues, chien, devis local. Courtier ORIAS bassin nancéien.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Chasse en 54 : RC et chien, devis ancré Nancy / Varangéville.",
    keywords: ["assurance chasse nancy", "rc chasseur meurthe-et-moselle", "assurance chasse varangéville"],
    cta: { href: QCH, label: "Devis chasse 54" },
    blocks: [
      {
        type: "p",
        text: "Chasser en <strong>Meurthe-et-Moselle</strong> (autour de <strong>Nancy</strong> et <strong>Varangéville</strong>) : mêmes règles nationales de RC, usage local (battues, forestier, chien). <a href=\"" +
          QCH +
          "\"><strong>Devis chasse 54</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Silo" },
      {
        type: "p",
        text: "<a href=\"../assurance-chasse/\">Hub chasse</a> · villes du silo · <a href=\"./assurance-chasse-rc-chasseur-guide-2026.html\">guide RC</a>.",
      },
      { type: "h2", text: "2. Chien" },
      {
        type: "p",
        text: "Souvent le vrai coût véto. <a href=\"./assurance-chien-de-chasse-rc-comparatif.html\">Chien de chasse & RC</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Varangéville, c’est bien le 54 ?",
        a: "Oui : Varangéville en Meurthe-et-Moselle, bassin nancéien.",
      },
    ],
    related: [
      { href: "./tarif-assurance-chasse-rc-chasseur-2026.html", label: "Tarifs chasse" },
      { href: "../landings/chasse.html", label: "Devis chasse" },
      { href: "../agence-varangeville/", label: "Agence Varangéville" },
    ],
  },
  {
    file: "assurance-chasse-arme-permis-responsabilite.html",
    section: "chasse",
    tag: "Arme & RC",
    tagClass: "tag-actu",
    themes: ["chasse"],
    title: "Permis de chasser, arme et RC : ce que l’assurance couvre (et pas)",
    description:
      "Permis de chasser, détention d’arme, responsabilité civile : articuler les papiers et le contrat RC chasseur.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Le permis autorise ; la RC indemnise les tiers — deux sujets.",
    keywords: ["rc permis de chasser", "assurance arme chasse", "responsabilité civile chasseur"],
    cta: { href: QCH, label: "Devis RC chasseur" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>permis de chasser</strong> et la validation annuelle n’équivalent pas à une <strong>RC</strong> confortable. L’arme, le transport, le tiers blessé : lisez le contrat. <a href=\"" +
          QCH +
          "\"><strong>Vérifier ma RC</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que la RC fait" },
      {
        type: "p",
        text: "Dommages causés à autrui pendant l’acte de chasse (selon définitions). Pas magique pour le vol d’arme au coffre ni pour un usage hors cadre.",
      },
      { type: "h2", text: "2. Guide" },
      {
        type: "p",
        text: "<a href=\"./assurance-chasse-rc-chasseur-guide-2026.html\">Guide RC chasseur 2026</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L’assurance habitation couvre-t-elle la chasse ?",
        a: "La RC vie privée exclut souvent la chasse. Il faut une RC chasseur (fédé ou contrat dédié).",
      },
    ],
    related: [
      { href: "./assurance-chasse-rc-chasseur-guide-2026.html", label: "Guide RC" },
      { href: "../assurance-chasse/rc-chasseur/", label: "Hub RC chasseur" },
    ],
  },
  {
    file: "rc-equestre-cavalier-club-2026.html",
    section: "equitation",
    tag: "RC équestre",
    tagClass: "tag-actu",
    themes: ["equitation"],
    title: "RC équestre 2026 : cavalier loisir, club, propriétaire de cheval",
    description:
      "Responsabilité civile équestre : club, cavalier, propriétaire. Ce que la licence FFE ne couvre pas. Devis équitation.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Licence club ≠ RC propriétaire de cheval — vérifiez les plafonds.",
    keywords: ["rc équestre", "assurance cavalier", "responsabilité civile cheval", "assurance équitation club"],
    cta: { href: QEQ, label: "Devis équitation / RC" },
    blocks: [
      {
        type: "p",
        text: "La <strong>RC équestre</strong> n’est pas la même pour un cavalier au club, un propriétaire, un éleveur. La licence FFE a un socle ; le cheval en pension, le pré, les tiers à l’obstacle : autre contrat. <a href=\"" +
          QEQ +
          "\"><strong>Devis équitation</strong></a> · <a href=\"./assurance-equitation-rc-equestre-guide-2026.html\">guide RC</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Trois profils" },
      {
        type: "ul",
        items: [
          "Cavalier loisir (licence)",
          "Propriétaire / demi-pension",
          "Structure (centre, écurie) — RC pro",
        ],
      },
      { type: "h2", text: "2. Cheval pas cher" },
      {
        type: "p",
        text: "Critères mortalité / frais véto : <a href=\"./assurance-cheval-pas-cher-criteres-2026.html\">article cheval</a>. Local : <a href=\"./assurance-equitation-nancy-lorraine.html\">Nancy / Lorraine</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La licence FFE me suffit-elle ?",
        a: "Pour un cours club, souvent un socle RC. Propriétaire de cheval, transport, pré : relisez ou souscrivez un contrat dédié.",
      },
    ],
    related: [
      { href: "./assurance-equitation-rc-equestre-guide-2026.html", label: "Guide RC équestre" },
      { href: "../assurance-equitation/", label: "Hub équitation" },
      { href: "../landings/equitation.html", label: "Landing équitation" },
    ],
  },
  {
    file: "assurance-equitation-nancy-lorraine.html",
    section: "equitation",
    tag: "Équitation 54",
    tagClass: "tag-actu",
    themes: ["equitation", "nancy"],
    title: "Assurance équitation à Nancy et en Lorraine : RC, cheval, clubs",
    description:
      "Cavalier ou propriétaire en Meurthe-et-Moselle (Nancy, Varangéville) : RC équestre et assurance cheval. Devis ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Équitation 54 : clubs nancéiens, RC et cheval, devis local.",
    keywords: ["assurance équitation nancy", "rc équestre lorraine", "assurance cheval meurthe-et-moselle"],
    cta: { href: QEQ, label: "Devis équitation 54" },
    blocks: [
      {
        type: "p",
        text: "Centres équestres autour de <strong>Nancy</strong> et <strong>Varangéville</strong> : même besoin de <strong>RC équestre</strong> qu’ailleurs, devis ancré 54. <a href=\"" +
          QEQ +
          "\"><strong>Devis équitation Lorraine</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Hub" },
      {
        type: "p",
        text: "<a href=\"../assurance-equitation/\">Assurance équitation</a> · <a href=\"./rc-equestre-cavalier-club-2026.html\">RC cavalier / club</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Proposez-vous un devis depuis Varangéville ?",
        a: "Oui : questionnaire en ligne, rappel conseiller, bassin nancéien (Varangéville, Nancy, Jarville).",
      },
    ],
    related: [
      { href: "./assurance-cheval-pas-cher-criteres-2026.html", label: "Cheval pas cher" },
      { href: "../agence-varangeville/", label: "Agence Varangéville" },
    ],
  },

  /* ——— Habitation / RC Pro / Mutuelle ——— */
  {
    file: "assurance-habitation-vol-cambriolage-2026.html",
    section: "habitat",
    tag: "Vol",
    tagClass: "tag-habitation",
    themes: ["habitation", "vol"],
    title: "Assurance habitation vol et cambriolage 2026 : garanties, franchises",
    description:
      "Cambriolage, vol, vandalisme : ce que couvre la MRH, alarmes, bijoux, déclaration. Devis habitation courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Vol habitation : franchise, objets nommés, délais de déclaration.",
    keywords: ["assurance habitation vol", "cambriolage assurance", "garantie vol mrh", "vandalisme habitation"],
    cta: { href: L("../landings/devis.html?need=habitation", "habitation"), label: "Devis habitation" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>cambriolage</strong> se joue sur la franchise, les plafonds bijoux / high-tech et les conditions d’alarme. La MRH « tous risques » n’est pas magique. <a href=\"" +
          QHAB +
          "\"><strong>Relire mon contrat vol</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Déclaration" },
      {
        type: "ul",
        items: ["Plainte / main courante", "Photos, factures", "Délai souvent 2 jours ouvrés pour le vol"],
      },
      { type: "h2", text: "2. Prévention" },
      {
        type: "p",
        text: "Certaines formules exigent serrure A2P, alarme. Un défaut peut réduire l’indemnité. Guide large : <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / propriétaire</a>.",
      },
      { type: "h2", text: "3. Changer de MRH et pages ville" },
      {
        type: "p",
        text: "<a href=\"./changer-assurance-habitation-loi-hamon.html\">Loi Hamon habitation</a> · <a href=\"./assurance-habitation-paris-ile-de-france-2026.html\">MRH Paris / IDF</a> · <a href=\"./assurance-habitation-nancy-varangeville-54.html\">Nancy / Varangéville</a> · silo <a href=\"../assurance-habitation/villes/\">habitation par ville</a>.",
      },
      { type: "h2", text: "4. Courtier vs comparateur nu" },
      {
        type: "p",
        text: "Un courtier ORIAS aligne des offres <strong>grossiste</strong> (vol, dégâts des eaux, RC) sur votre logement réel — pas un devis générique « France ». <a href=\"" +
          QHAB +
          "\">Questionnaire habitation</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le vol sans effraction est-il couvert ?",
        a: "Souvent exclu ou très limité. Lisez la définition d’effraction / agression.",
      },
    ],
    related: [
      { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Locataire / propriétaire" },
      { href: "../assurance-habitation/", label: "Hub habitation" },
    ],
  },
  {
    file: "changer-assurance-habitation-loi-hamon.html",
    section: "habitat",
    tag: "Hamon habitation",
    tagClass: "tag-habitation",
    themes: ["habitation", "hamon"],
    title: "Changer d’assurance habitation (loi Hamon) sans trou de garantie",
    description:
      "Résilier sa MRH après 1 an, déménagement, vente. Dates, attestation, comparatif. Devis courtier ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Hamon habitation : le nouvel assureur résilie souvent l’ancien.",
    keywords: ["résilier assurance habitation", "loi hamon habitation", "changer mrh", "attestation habitation"],
    cta: { href: L("../landings/devis.html?need=habitation", "habitation"), label: "Comparer ma MRH" },
    blocks: [
      {
        type: "p",
        text: "Locataire : l’attestation est obligatoire. Propriétaire copro : souvent aussi. On <strong>change</strong> après 12 mois (Hamon) sans jour blanc. <a href=\"" +
          QHAB +
          "\"><strong>Devis MRH</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Déménagement" },
      {
        type: "p",
        text: "Motif légitime : résiliation possible hors Hamon avec justificatif. Caler l’entrée dans le nouveau logement.",
      },
      { type: "h2", text: "2. Sous-assurance" },
      {
        type: "p",
        text: "Profitez du changement pour recalculer le capital mobilier. <a href=\"./assurance-habitation-sous-assurance-sinistre.html\">Sous-assurance</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le bailleur peut-il imposer son assureur ?",
        a: "Il peut exiger une attestation MRH, pas une marque. Vous choisissez l’assureur.",
      },
    ],
    related: [
      { href: "./assurance-habitation-vol-cambriolage-2026.html", label: "Vol / cambriolage" },
      { href: "../assurance-habitation/", label: "Hub habitation" },
    ],
  },
  {
    file: "assurance-decennale-artisan-btp-2026.html",
    section: "pro",
    tag: "Décennale",
    tagClass: "tag-pro",
    themes: ["pro", "btp"],
    title: "Assurance décennale artisan BTP 2026 : obligation, prix, attestations",
    description:
      "Décennale obligatoire pour les artisans du bâtiment : qui, combien, attestation pour les marchés. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Sans décennale, pas de chantier sérieux — attestation avant le premier devis client.",
    keywords: ["assurance décennale 2026", "décennale artisan", "prix décennale auto-entrepreneur", "attestation décennale"],
    cta: { href: L("../landings/devis.html?need=decennale", "decennale"), label: "Devis décennale" },
    blocks: [
      {
        type: "p",
        text: "L’<strong>assurance décennale</strong> est obligatoire pour les travaux de construction / rénovation du gros œuvre (et bien d’autres lots). Sans attestation, les marchés publics et beaucoup de privés refusent. <a href=\"" +
          QDEC +
          "\"><strong>Devis décennale</strong></a> · RC : <a href=\"./rc-pro-auto-entrepreneur-2026.html\">RC pro AE</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Qui est concerné" },
      {
        type: "p",
        text: "Maçon, charpentier, électricien, plombier, étanchéité… L’activité déclarée au contrat doit coller au Kbis / INSEE. Un oubli de lot = sinistre non couvert.",
      },
      { type: "h2", text: "2. Prix" },
      {
        type: "p",
        text: "CA, lots, antécédents, sous-traitance. Un AE débutant n’a pas le tarif d’une SARL à 800 k€ de CA. Questionnaire <a href=\"" +
          QPRO +
          "\">RC pro</a> en parallèle si besoin.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC pro remplace-t-elle la décennale ?",
        a: "Non. La RC pro couvre les dommages pendant le chantier / à des tiers ; la décennale couvre la solidité / ouvrage 10 ans après réception.",
      },
    ],
    related: [
      { href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro freelance" },
      { href: "../landings/devis.html?need=decennale", label: "Devis décennale" },
    ],
  },
  {
    file: "rc-pro-auto-entrepreneur-2026.html",
    section: "pro",
    tag: "Auto-entrepreneur",
    tagClass: "tag-pro",
    themes: ["pro"],
    title: "RC Pro auto-entrepreneur 2026 : obligatoire ou pas, prix, plafonds",
    description:
      "Auto-entrepreneur : quand la RC professionnelle est exigée (clients, plateformes, marchés). Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "AE : la RC pro n’est pas toujours légalement obligatoire — vos clients, si.",
    keywords: ["rc pro auto-entrepreneur", "assurance rc pro micro-entreprise", "rc pro obligatoire ae"],
    cta: { href: L("../landings/devis.html?need=rc-pro", "rcpro"), label: "Devis RC Pro AE" },
    blocks: [
      {
        type: "p",
        text: "En <strong>micro-entreprise</strong>, la RC pro n’est pas toujours une obligation légale — mais Uber, les marchés, les clients B2B et les coworkings l’exigent. Un préjudice sans contrat = patrimoine perso. <a href=\"" +
          QPRO +
          "\"><strong>Devis RC Pro</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Métiers" },
      {
        type: "ul",
        items: [
          "BTP : souvent décennale + RC (<a href=\"./assurance-decennale-artisan-btp-2026.html\">décennale</a>)",
          "Conseil, dev, coach : RC recommandée",
          "VTC : RC transport de personnes — silo <a href=\"./assurance-vtc-rc-pro-garanties.html\">VTC</a>",
        ],
      },
      { type: "h2", text: "2. Plafonds" },
      {
        type: "p",
        text: "1 à 8 M€ selon cahier des charges. Guide : <a href=\"./rc-pro-freelance-artisan-guide.html\">RC freelance / artisan</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L’assurance habitation AE suffit-elle ?",
        a: "La RC vie privée exclut l’activité pro. Il faut un contrat RC professionnelle (parfois packagé MRPro).",
      },
    ],
    related: [
      { href: "./rc-pro-freelance-artisan-guide.html", label: "Guide RC Pro" },
      { href: "./assurance-decennale-artisan-btp-2026.html", label: "Décennale BTP" },
    ],
  },
  {
    file: "changer-mutuelle-resiliation-2026.html",
    section: "sante",
    tag: "Résiliation mutuelle",
    tagClass: "tag-sante",
    themes: ["sante", "hamon"],
    title: "Changer de mutuelle en 2026 : résiliation, carences, sans trou",
    description:
      "Résilier sa complémentaire santé après 1 an, portabilité, carences dentaire/optique. Devis mutuelle courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "On change de mutuelle après comparaison des tableaux — pas sur un prix Facebook.",
    keywords: ["changer de mutuelle 2026", "résilier mutuelle", "loi hamon mutuelle", "carence mutuelle dentaire"],
    cta: { href: L("../landings/sante.html", "sante"), label: "Comparer ma mutuelle" },
    blocks: [
      {
        type: "p",
        text: "Après un an, la <strong>résiliation infra-annuelle</strong> s’applique à beaucoup de complémentaires santé. Le piège : les <strong>carences</strong> (dentaire, optique, hospit) du nouveau contrat. <a href=\"" +
          QSANT +
          "\"><strong>Questionnaire mutuelle</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Inventaire avant de partir" },
      {
        type: "p",
        text: "Soins en cours, devis dentaire, lunettes prévues. Guide critères : <a href=\"./mutuelle-sante-5-criteres.html\">5 critères</a> · <a href=\"./mutuelle-remboursement-optique-dentaire-2026.html\">optique / dentaire</a>.",
      },
      { type: "h2", text: "2. TNS / indépendant" },
      {
        type: "p",
        text: "<a href=\"./mutuelle-tns-independant-2026.html\">Mutuelle TNS</a> : pas de part employeur, loi Madelin parfois.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le nouvel organisme résilie-t-il l’ancien ?",
        a: "Souvent oui après 12 mois. Gardez l’attestation de droits pour éviter un jour sans complémentaire.",
      },
    ],
    related: [
      { href: "./mutuelle-sante-5-criteres.html", label: "5 critères mutuelle" },
      { href: "../assurance-sante/", label: "Hub mutuelle" },
      { href: "../landings/sante.html", label: "Landing santé" },
    ],
  },
  {
    file: "mutuelle-tns-independant-2026.html",
    section: "sante",
    tag: "TNS",
    tagClass: "tag-sante",
    themes: ["sante", "tns"],
    title: "Mutuelle TNS et indépendant 2026 : Madelin, niveaux, prix",
    description:
      "Complémentaire santé auto-entrepreneur, artisan, profession libérale : Madelin, hospitalisation, devis courtier.",
    meta: "8 min · Août 2026",
    cardExcerpt: "TNS : 100 % à votre charge — le niveau hospit / dentaire se calcule autrement qu’en collectif.",
    keywords: ["mutuelle tns 2026", "mutuelle auto-entrepreneur", "mutuelle madelin", "complémentaire santé indépendant"],
    cta: { href: L("../landings/sante.html", "sante"), label: "Devis mutuelle TNS" },
    blocks: [
      {
        type: "p",
        text: "Sans mutuelle d’entreprise, l’<strong>indépendant</strong> paie 100 % de la complémentaire. Loi <strong>Madelin</strong> (selon statut) : cotisations déductibles, contrat responsable. <a href=\"" +
          QSANT +
          "\"><strong>Profil TNS</strong></a> · prévoyance : <a href=\"./prevoyance-independants-guide.html\">guide TNS</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ne pas copier un contrat salarié" },
      {
        type: "p",
        text: "Le collectif d’un CDI n’est pas un bon modèle : vous n’avez pas de part employeur. Visez hospit + vos postes réels (optique, dentaire).",
      },
      { type: "h2", text: "2. Inflation" },
      {
        type: "p",
        text: "<a href=\"./inflation-mutuelle-hausse-2026.html\">Hausses 2026</a> : comparer avant l’échéance, pas après la facture.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L’AE a-t-il droit au Madelin ?",
        a: "Le régime micro / AE a des règles spécifiques. Un conseiller vérifie le statut (BNC, BIC, micro) avant de promettre la déductibilité.",
      },
    ],
    related: [
      { href: "./changer-mutuelle-resiliation-2026.html", label: "Changer de mutuelle" },
      { href: "./prevoyance-independants-guide.html", label: "Prévoyance TNS" },
    ],
  },

  /* ——— Niches questionnaire ready ——— */
  {
    file: "assurance-instrument-musique-2026.html",
    section: "pro",
    tag: "Instrument",
    tagClass: "tag-pro",
    themes: ["instrument", "pro"],
    title: "Assurance instrument de musique 2026 : vol, casse, transport, pro",
    description:
      "Assurer guitare, piano, violon : vol, casse, transport, usage scène. Devis courtier, questionnaire instrument.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Un instrument de 3 000 € n’est pas un « objet » MRH anonyme.",
    keywords: ["assurance instrument musique", "assurance guitare vol", "assurance piano", "assurance matériel musicien"],
    cta: { href: QINS, label: "Devis instrument de musique" },
    blocks: [
      {
        type: "p",
        text: "Guitare, piano, sax : la <strong>MRH</strong> plafonne souvent le matériel. Vol en tournée, casse, humidité : un contrat <strong>instrument</strong> (parfois pack musicien pro) est plus lisible. <a href=\"" +
          QINS +
          "\"><strong>Questionnaire instrument</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que la maison ne couvre pas" },
      {
        type: "ul",
        items: ["Plafond objets précieux trop bas", "Exclusion hors domicile / scène", "Valeur à dire d’expert vs facture"],
      },
      { type: "h2", text: "2. Pro vs loisir" },
      {
        type: "p",
        text: "Enseignant, sideman, studio : RC + matériel. Photo / vidéo liée : <a href=\"./assurance-materiel-photo-video-2026.html\">matériel photo</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Faut-il une expertise ?",
        a: "Au-delà d’un certain capital, oui (facture + photos, parfois expert). Le questionnaire pose la valeur.",
      },
    ],
    related: [
      { href: "./assurance-materiel-photo-video-2026.html", label: "Matériel photo" },
      { href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro" },
    ],
  },
  {
    file: "assurance-materiel-photo-video-2026.html",
    section: "pro",
    tag: "Photo / vidéo",
    tagClass: "tag-pro",
    themes: ["photo", "pro"],
    title: "Assurance matériel photo et vidéo 2026 : vol, casse, RC tournage",
    description:
      "Boîtiers, optiques, drones, lumière : assurer le matos photo / vidéo et la RC sur un tournage. Questionnaire matériel photo.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Un reflex + trois optiques dépassent souvent le plafond MRH.",
    keywords: ["assurance matériel photo", "assurance appareil photo vol", "assurance drone vidéo", "rc tournage"],
    cta: { href: QPHOTO, label: "Devis matériel photo" },
    blocks: [
      {
        type: "p",
        text: "Photographe, vidéaste, drone : le <strong>matériel</strong> et la <strong>RC</strong> (tiers sur un shooting) sont deux lignes. La MRH perso sous-assure. <a href=\"" +
          QPHOTO +
          "\"><strong>Questionnaire matériel photo</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Inventaire" },
      {
        type: "p",
        text: "Boîtiers, optiques, lumière, ordi de rushs, drone (réglementation DGAC à part). Factures + n° de série.",
      },
      { type: "h2", text: "2. RC" },
      {
        type: "p",
        text: "Un pied dans un client, un drone : <a href=\"./rc-pro-auto-entrepreneur-2026.html\">RC pro AE</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le drone est-il dans le même contrat ?",
        a: "Pas toujours : responsabilité aérienne / usage loisir vs pro. Déclarez-le clairement au devis.",
      },
    ],
    related: [
      { href: "./assurance-instrument-musique-2026.html", label: "Instrument musique" },
      { href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro" },
    ],
  },
  {
    file: "assurance-bateau-plaisance-2026.html",
    section: "auto",
    tag: "Bateau",
    tagClass: "tag-auto",
    themes: ["bateau"],
    title: "Assurance bateau de plaisance 2026 : RC, corps, assistance",
    description:
      "Assurer voilier, bateau à moteur, jet : RC plaisance, corps du navire, vol moteur. Questionnaire bateau, courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "La RC plaisance n’est pas l’auto du foyer — et le corps du navire est une autre ligne.",
    keywords: ["assurance bateau plaisance", "assurance voilier", "rc bateau", "assurance jet ski"],
    cta: { href: QBAT, label: "Devis bateau plaisance" },
    blocks: [
      {
        type: "p",
        text: "Voilier, vedette, jet : la <strong>RC plaisance</strong> protège les tiers ; le <strong>corps</strong> (coque, moteur) est optionnel selon valeur. <a href=\"" +
          QBAT +
          "\"><strong>Questionnaire bateau</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ports et hivernage" },
      {
        type: "p",
        text: "Lieu d’amarrage, navigation (côtière, hauturier), hivernage à terre : tout tarife. Un contrat « lac » n’est pas un contrat mer.",
      },
      { type: "h2", text: "2. Caravane / camping-car" },
      {
        type: "p",
        text: "Véhicule loisir terrestre : <a href=\"./assurance-caravane-camping-car-2026.html\">caravane / camping-car</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La carte de plaisance suffit-elle ?",
        a: "C’est un titre de conduite, pas une assurance. La RC (et souvent le corps) se souscrivent à part.",
      },
    ],
    related: [
      { href: "./assurance-caravane-camping-car-2026.html", label: "Caravane / camping-car" },
      { href: "../landings/questionnaire.html?need=bateau&journey=standard", label: "Questionnaire bateau" },
    ],
  },
  {
    file: "assurance-caravane-camping-car-2026.html",
    section: "auto",
    tag: "Caravane",
    tagClass: "tag-auto",
    themes: ["caravane", "auto"],
    title: "Assurance caravane et camping-car 2026 : tractée, vol, séjour",
    description:
      "Caravane tractée, fourgon, camping-car : RC, vol contenu, assistance Europe. Questionnaire caravane, courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Une caravane n’est pas un coffre de Clio — contenu et séjour ont leurs plafonds.",
    keywords: ["assurance caravane", "assurance camping-car", "assurance fourgon aménagé", "vol caravane"],
    cta: { href: QCAR, label: "Devis caravane / camping-car" },
    blocks: [
      {
        type: "p",
        text: "<strong>Caravane tractée</strong> vs <strong>camping-car</strong> : deux produits. L’auto du tracteur ne couvre pas toujours la caravane ni le contenu en stationnement. <a href=\"" +
          QCAR +
          "\"><strong>Questionnaire caravane</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Tractée" },
      {
        type: "p",
        text: "RC via le véhicule tracteur parfois, dommages / vol caravane souvent option. Masse, PTAC, permis B vs BE.",
      },
      { type: "h2", text: "2. Camping-car / van" },
      {
        type: "p",
        text: "Usage (loisirs, semi-résidence), assistance Europe, contenu. Croisé auto : <a href=\"./tarif-assurance-auto-2026.html\">tarifs auto</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L’habitation couvre-t-elle la caravane au jardin ?",
        a: "Parfois en dépendance, avec plafonds bas. Dès qu’elle voyage, il faut un contrat dédié.",
      },
    ],
    related: [
      { href: "./assurance-bateau-plaisance-2026.html", label: "Bateau plaisance" },
      { href: "./assurance-auto-tous-risques-ou-tiers-2026.html", label: "Formules auto" },
    ],
  },

  /* ——— Auto / MRH par ville (SEO local) ——— */
  {
    file: "assurance-auto-paris-ile-de-france-2026.html",
    section: "auto",
    tag: "Auto IDF",
    tagClass: "tag-auto",
    themes: ["auto", "paris", "idf"],
    title: "Assurance auto à Paris et en Île-de-France 2026 : tarifs, stationnement, devis",
    description:
      "Assurance auto Paris / IDF : tous risques, vol, jeune conducteur, bonus-malus. Devis courtier ORIAS, pages ville assurance-auto.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Auto à Paris : stationnement, vol, CRM — pas un tarif « France ». ",
    keywords: [
      "assurance auto paris",
      "assurance auto île-de-france",
      "devis assurance auto paris",
      "assurance auto 75",
      "tous risques paris",
    ],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Devis auto Paris / IDF" },
    blocks: [
      {
        type: "p",
        text: "Assurer une voiture à <strong>Paris</strong> ou en <strong>Île-de-France</strong>, ce n’est pas coller un tarif province. Stationnement rue, vols, bris, trajets périurbains, malus : le courtier compare des offres <strong>grossiste</strong> à garanties égales. <a href=\"" +
          QAUTO +
          "\"><strong>Questionnaire auto IDF</strong></a> · silo <a href=\"../assurance-auto/paris/\">assurance auto Paris</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que l’assureur tarife en IDF" },
      {
        type: "ul",
        items: [
          "Code postal (75, 92, 93, 94, 77, 78, 91, 95)",
          "Stationnement : rue, box, parking copro",
          "Kilométrage, usage pro ponctuel",
          "Formule : <a href=\"./assurance-auto-tous-risques-ou-tiers-2026.html\">tous risques vs tiers</a>",
        ],
      },
      { type: "h2", text: "2. Jeune conducteur et malus" },
      {
        type: "p",
        text: "<a href=\"./assurance-auto-jeune-conducteur-2026.html\">Jeune permis</a> · <a href=\"./assurance-auto-malus-apres-accident.html\">malus après accident</a>. Un comparateur nu refuse souvent ; un courtier ouvre d’autres grilles.",
      },
      { type: "h2", text: "3. Pages ville du silo" },
      {
        type: "p",
        text: "Le hub <a href=\"../assurance-auto/villes/\">assurance auto par ville</a> couvre Paris, Lyon, Marseille, Toulouse, etc. Tarifs : <a href=\"./tarif-assurance-auto-2026.html\">article 2026</a>. Hamon : <a href=\"./resilier-assurance-auto-loi-hamon-2026.html\">changer d’auto</a>.",
      },
      { type: "h2", text: "4. Mots-clés Search" },
      {
        type: "ul",
        items: [
          "assurance auto paris, devis assurance auto paris",
          "assurance auto ile de france, assurance auto 75",
          "assurance auto tous risques paris, jeune conducteur paris",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un contrat auto Nantes marche-t-il à Paris ?",
        a: "Oui s’il couvre la France, mais la prime est calée sur le code postal déclaré. Recalibrez si vous emménagez en IDF.",
      },
    ],
    related: [
      { href: "./assurance-auto-nancy-varangeville-54.html", label: "Auto Nancy / 54" },
      { href: "./tarif-assurance-auto-2026.html", label: "Tarifs auto 2026" },
      { href: "../assurance-auto/paris/", label: "Hub auto Paris" },
    ],
  },
  {
    file: "assurance-auto-nancy-varangeville-54.html",
    section: "auto",
    tag: "Auto 54",
    tagClass: "tag-auto",
    themes: ["auto", "nancy", "local-54"],
    title: "Assurance auto à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "Assurance auto Nancy / Varangéville (54) : tous risques, jeune conducteur, devis local courtier ORIAS. Bassin nancéien.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Auto dans le 54 : Nancy, Varangéville, Jarville — devis ancré local.",
    keywords: [
      "assurance auto nancy",
      "assurance auto varangéville",
      "devis auto meurthe-et-moselle",
      "assurance auto 54",
    ],
    cta: { href: L("../landings/devis.html?need=auto", "auto"), label: "Devis auto Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Assurer sa voiture à <strong>Nancy</strong>, <strong>Varangéville</strong> ou Jarville : même RC nationale, tarif calé sur le <strong>54</strong> (pas Paris). Courtier ORIAS, comparatif grossiste. <a href=\"" +
          QAUTO +
          "\"><strong>Devis auto bassin nancéien</strong></a>. Orthographe : <strong>Varangéville</strong> (Meurthe-et-Moselle).",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Silo ville" },
      {
        type: "p",
        text: "<a href=\"../assurance-auto/nancy/\">Assurance auto Nancy</a> (page ville) · <a href=\"../agence-varangeville/\">agence Varangéville</a> · <a href=\"./tarif-assurance-auto-2026.html\">tarifs 2026</a>.",
      },
      { type: "h2", text: "2. Usages locaux" },
      {
        type: "ul",
        items: [
          "Trajets métropole (Dombasle, Saint-Max, Ludres, Laxou)",
          "Stationnement village vs centre Nancy",
          "Jeune permis 54 : <a href=\"./assurance-auto-jeune-conducteur-2026.html\">article jeunes</a>",
        ],
      },
      { type: "h2", text: "3. Autres produits du bassin" },
      {
        type: "p",
        text: "<a href=\"./assurance-vtc-nancy-varangeville-54.html\">VTC 54</a> · <a href=\"./assurance-vsp-nancy-varangeville-meurthe-et-moselle.html\">VSP 54</a> · <a href=\"./assurance-habitation-nancy-varangeville-54.html\">MRH 54</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Comment s’écrit la commune du 54 ?",
        a: "Varangéville (avec un a), bassin de Nancy / Dombasle — pas Varengeville-sur-Mer.",
      },
    ],
    related: [
      { href: "./assurance-habitation-nancy-varangeville-54.html", label: "Habitation Nancy / 54" },
      { href: "../agence-varangeville/", label: "Agence Varangéville" },
      { href: "../assurance-auto/", label: "Hub auto" },
    ],
  },
  {
    file: "assurance-habitation-paris-ile-de-france-2026.html",
    section: "habitat",
    tag: "MRH IDF",
    tagClass: "tag-habitation",
    themes: ["habitation", "paris", "idf"],
    title: "Assurance habitation à Paris et en Île-de-France : locataire, proprio, vol",
    description:
      "MRH Paris / IDF 2026 : locataire, propriétaire, vol, dégâts des eaux, Hamon. Devis courtier ORIAS, pages ville.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Habitation Paris : copro, vol, cave — une MRH calée sur le 75 / petite couronne.",
    keywords: [
      "assurance habitation paris",
      "assurance habitation île-de-france",
      "mrh locataire paris",
      "devis habitation 75",
    ],
    cta: { href: L("../landings/devis.html?need=habitation", "habitation"), label: "Devis habitation Paris" },
    blocks: [
      {
        type: "p",
        text: "Une <strong>multirisque habitation à Paris</strong> se joue sur la copro, le capital mobilier, le vol, la cave et les dégâts des eaux. Locataire : attestation obligatoire. <a href=\"" +
          QHAB +
          "\"><strong>Questionnaire MRH IDF</strong></a> · <a href=\"../assurance-habitation/paris/\">page ville Paris</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Locataire vs propriétaire" },
      {
        type: "p",
        text: "Guide : <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / propriétaire</a>. Copro : souvent une attestation même en proprio occupant.",
      },
      { type: "h2", text: "2. Vol et sous-assurance" },
      {
        type: "p",
        text: "<a href=\"./assurance-habitation-vol-cambriolage-2026.html\">Vol / cambriolage</a> · <a href=\"./assurance-habitation-sous-assurance-sinistre.html\">sous-assurance</a>. High-tech et bijoux : plafonds à nommer.",
      },
      { type: "h2", text: "3. Changer sans jour blanc" },
      {
        type: "p",
        text: "<a href=\"./changer-assurance-habitation-loi-hamon.html\">Loi Hamon habitation</a>. Le nouvel assureur résilie souvent l’ancien. Silo : <a href=\"../assurance-habitation/villes/\">MRH par ville</a>.",
      },
      { type: "h2", text: "4. Mots-clés Search" },
      {
        type: "ul",
        items: [
          "assurance habitation paris, devis mrh paris",
          "assurance locataire paris, assurance pno ile de france",
          "changer assurance habitation paris, loi hamon habitation",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le bailleur parisien peut-il imposer son assureur ?",
        a: "Il peut exiger une attestation MRH, pas une marque. Vous choisissez l’assureur / le courtier.",
      },
    ],
    related: [
      { href: "./assurance-habitation-nancy-varangeville-54.html", label: "MRH Nancy / 54" },
      { href: "./assurance-habitation-vol-cambriolage-2026.html", label: "Vol habitation" },
      { href: "../assurance-habitation/", label: "Hub habitation" },
    ],
  },
  {
    file: "assurance-habitation-nancy-varangeville-54.html",
    section: "habitat",
    tag: "MRH 54",
    tagClass: "tag-habitation",
    themes: ["habitation", "nancy", "local-54"],
    title: "Assurance habitation à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "MRH Nancy / Varangéville (54) : locataire, propriétaire, vol, dégâts des eaux. Devis courtier ORIAS bassin nancéien.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Habitation 54 : Nancy, Varangéville, Jarville — MRH calée sur le logement réel.",
    keywords: [
      "assurance habitation nancy",
      "assurance habitation varangéville",
      "mrh meurthe-et-moselle",
      "devis habitation 54",
    ],
    cta: { href: L("../landings/devis.html?need=habitation", "habitation"), label: "Devis habitation Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Maison ou appart à <strong>Nancy</strong>, <strong>Varangéville</strong>, Dombasle : la MRH suit la surface, le capital, le vol et les dégâts des eaux — pas un forfait « Grand Est ». <a href=\"" +
          QHAB +
          "\"><strong>Devis habitation 54</strong></a>. Orthographe : <strong>Varangéville</strong>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pages locales" },
      {
        type: "p",
        text: "<a href=\"../assurance-habitation/nancy/\">Habitation Nancy</a> · <a href=\"../agence-varangeville/\">agence Varangéville</a> · <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / proprio</a>.",
      },
      { type: "h2", text: "2. Risques du bassin" },
      {
        type: "ul",
        items: [
          "Dégâts des eaux immeuble / cave",
          "Vol pavillon vs copro",
          "Sous-assurance mobilier : <a href=\"./assurance-habitation-sous-assurance-sinistre.html\">article</a>",
        ],
      },
      { type: "h2", text: "3. Auto et VTC du même foyer" },
      {
        type: "p",
        text: "<a href=\"./assurance-auto-nancy-varangeville-54.html\">Auto 54</a> · <a href=\"./assurance-vtc-nancy-varangeville-54.html\">VTC 54</a>. Un même courtier aligne les dates d’échéance.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Varangéville, c’est bien le 54 ?",
        a: "Oui : Varangéville en Meurthe-et-Moselle, bassin nancéien (pas Varengeville-sur-Mer).",
      },
    ],
    related: [
      { href: "./assurance-auto-nancy-varangeville-54.html", label: "Auto Nancy / 54" },
      { href: "../agence-varangeville/", label: "Agence Varangéville" },
      { href: "../assurance-habitation/", label: "Hub habitation" },
    ],
  },
];
