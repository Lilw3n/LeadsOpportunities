/**
 * Blog auto + MRH (habitation) — SEO + conversion courtier / grossiste.
 * Chargé par blog-articles-manifest.cjs.
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

var QAUTO = u("auto", "auto");
var QHAB = u("habitation", "habitation");
var LAUTO = L("../landings/devis.html?need=auto", "auto");
var LHAB = L("../landings/devis.html?need=habitation", "habitation");

var AUTO_CORE = [
  { href: "./tarif-assurance-auto-2026.html", label: "Tarifs auto 2026" },
  { href: "./assurance-auto-tous-risques-ou-tiers-2026.html", label: "Tous risques ou tiers" },
  { href: "./resilier-assurance-auto-loi-hamon-2026.html", label: "Résilier (loi Hamon)" },
  { href: "./assurance-auto-courtier-grossiste-comparatif-2026.html", label: "Courtier / grossiste" },
  { href: "./assurance-auto-nancy-varangeville-54.html", label: "Auto Nancy / Varangéville" },
  { href: "../assurance-auto/", label: "Hub auto" },
  { href: "../landings/devis.html?need=auto", label: "Devis auto" },
];

var MRH_CORE = [
  { href: "./assurance-habitation-vol-cambriolage-2026.html", label: "Vol et cambriolage" },
  { href: "./changer-assurance-habitation-loi-hamon.html", label: "Changer de MRH (Hamon)" },
  { href: "./assurance-habitation-courtier-grossiste-mrh-2026.html", label: "Courtier / grossiste MRH" },
  { href: "./assurance-habitation-nancy-varangeville-54.html", label: "MRH Nancy / Varangéville" },
  { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Locataire / propriétaire" },
  { href: "../assurance-habitation/", label: "Hub habitation" },
  { href: "../landings/devis.html?need=habitation", label: "Devis habitation" },
];

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

var ARTICLES = [
  {
    file: "tarif-assurance-auto-2026.html",
    audience: "france",
    section: "auto",
    tag: "Auto",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Tarif assurance auto 2026 : prix, bonus-malus, devis courtier",
    description:
      "Prix assurance auto 2026 : bonus-malus, commune, jeune conducteur, tous risques. Comparatif courtier / grossiste, devis ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Ce qui fait vraiment varier le tarif auto — et comment comparer à garanties égales.",
    keywords: [
      "tarif assurance auto 2026",
      "prix assurance auto",
      "devis assurance auto",
      "assurance auto pas cher",
      "comparatif assurance auto",
    ],
    cta: { href: LAUTO, label: "Devis assurance auto" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>tarif assurance auto</strong> 2026 dépend du bonus-malus, de la commune, de l’usage, du véhicule et de la formule (tiers, intermédiaire, tous risques). Un comparateur nu refuse souvent les profils atypiques. Un <strong>courtier ORIAS</strong> accède aussi aux <strong>grilles grossistes</strong>. <a href=\"" +
          LAUTO +
          "\"><strong>Devis auto</strong></a> · <a href=\"" +
          QAUTO +
          "\">questionnaire</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qui fait varier le prix" },
      {
        type: "ul",
        items: [
          "<strong>Bonus-malus (CRM)</strong> et antécédents sinistres",
          "<strong>Code postal</strong> : Paris / IDF ≠ Nancy / Varangéville (54)",
          "Âge, date de permis, jeune conducteur, malus",
          "Formule : tiers, vol-incendie, tous risques, bris de glace",
        ],
      },
      { type: "h2", text: "2. Courtier vs comparateur" },
      {
        type: "p",
        text: "Le comparateur en ligne affiche souvent les mêmes compagnies grand public. Le <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">courtier / grossiste</a> ouvre d’autres tarifs (jeune permis, malus, usage pro léger). Local : <a href=\"./assurance-auto-paris-ile-de-france-2026.html\">Paris / IDF</a> · <a href=\"./assurance-auto-nancy-varangeville-54.html\">Nancy / 54</a>.",
      },
      { type: "h2", text: "3. Changer sans trou" },
      {
        type: "p",
        text: "<a href=\"./resilier-assurance-auto-loi-hamon-2026.html\">Loi Hamon</a> après 12 mois : le nouvel assureur résilie souvent l’ancien. Relevé d’information obligatoire. <a href=\"" +
          QAUTO +
          "\">Questionnaire auto</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Pourquoi mon devis auto est-il plus cher qu’en 2025 ?",
        a: "Sinistralité, inflation pièces, commune, CRM. Comparez à garanties égales, pas au seul prix d’appel.",
      },
      {
        q: "Le courtier est-il plus cher qu’en direct ?",
        a: "Non : la commission est dans la prime. L’intérêt, c’est l’accès aux grilles grossistes et le conseil.",
      },
    ],
    related: AUTO_CORE,
  },
  {
    file: "assurance-auto-tous-risques-ou-tiers-2026.html",
    audience: "france",
    section: "auto",
    tag: "Auto",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Assurance auto tous risques ou tiers 2026 : comment choisir",
    description:
      "Tous risques, tiers ou intermédiaire : valeur du véhicule, franchise, vol, bris. Devis courtier ORIAS, grilles grossistes.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Tiers sur une voiture neuve, tous risques sur une épave : les deux extrêmes coûtent cher.",
    keywords: [
      "assurance auto tous risques",
      "assurance au tiers",
      "assurance auto intermédiaire",
      "franchise tous risques",
    ],
    cta: { href: LAUTO, label: "Comparer tiers / tous risques" },
    blocks: [
      {
        type: "p",
        text: "<strong>Tous risques</strong> ou <strong>au tiers</strong> : le bon choix dépend de la valeur du véhicule, du bonus, du stationnement et de votre capacité à encaisser un sinistre. <a href=\"" +
          LAUTO +
          "\"><strong>Devis auto</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Tiers, intermédiaire, tous risques" },
      {
        type: "ul",
        items: [
          "<strong>Tiers</strong> : RC obligatoire (dommages causés à autrui)",
          "<strong>Intermédiaire</strong> : vol, incendie, parfois bris de glace",
          "<strong>Tous risques</strong> : collision responsable, vandalisme selon contrat",
        ],
      },
      { type: "h2", text: "2. Franchise et valeur à dire d’expert" },
      {
        type: "p",
        text: "Une franchise trop haute annule l’intérêt du tous risques sur une petite cote. Un courtier calibre. Guide : <a href=\"./tarif-assurance-auto-2026.html\">tarifs 2026</a> · <a href=\"./assurance-auto-malus-apres-accident.html\">malus après accident</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La banque exige-t-elle le tous risques en crédit auto ?",
        a: "Souvent oui (prêt ou LOA). Vérifiez la perte financière / GAP si la cote est inférieure au capital restant dû.",
      },
    ],
    related: AUTO_CORE,
  },
  {
    file: "resilier-assurance-auto-loi-hamon-2026.html",
    audience: "france",
    section: "auto",
    tag: "Loi Hamon",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Résilier son assurance auto (loi Hamon) 2026 : dates, relevé, sans trou",
    description:
      "Loi Hamon auto : résiliation après 1 an, relevé d’information, sans jour blanc. Courtier ORIAS, devis avant de changer.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Après 12 mois, le nouvel assureur peut résilier l’ancien. Préparez le relevé.",
    keywords: [
      "résilier assurance auto",
      "loi hamon assurance auto",
      "changer d'assurance auto",
      "relevé d'information auto",
    ],
    cta: { href: LAUTO, label: "Changer d’auto sans trou" },
    blocks: [
      {
        type: "p",
        text: "La <strong>loi Hamon</strong> permet de <strong>résilier l’assurance auto</strong> après un an, à tout moment. Le nouvel assureur envoie souvent la lettre. Sans relevé d’information à jour, le devis est faux. <a href=\"" +
          LAUTO +
          "\"><strong>Devis avant de résilier</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Timing" },
      {
        type: "ul",
        items: [
          "Avant 1 an : échéance / Chatel selon contrat",
          "Après 1 an : Hamon, sans frais ni motif",
          "Ne résiliez pas à vide : trou de garantie = infraction",
        ],
      },
      { type: "h2", text: "2. Relevé d’information" },
      {
        type: "p",
        text: "CRM, sinistres 24 ou 36 mois, conducteurs. Demandez-le à l’assureur actuel. Un <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">courtier</a> le relit avant d’interroger les grossistes. <a href=\"" +
          QAUTO +
          "\">Questionnaire</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je changer en cours d’année ?",
        a: "Oui après 12 mois (Hamon). Avant, d’autres cas (vente du véhicule, résiliation assureur, Chatel).",
      },
    ],
    related: AUTO_CORE,
  },
  {
    file: "assurance-auto-malus-apres-accident.html",
    audience: "france",
    section: "auto",
    tag: "Malus",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Malus auto après accident 2026 : coefficient, devis, solutions",
    description:
      "Malus après accident responsable : coefficient CRM, surprimes, assureurs spécialisés. Courtier / grossiste, devis ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Après un accident responsable, le comparateur grand public se ferme. Le courtier ouvre d’autres grilles.",
    keywords: [
      "malus auto après accident",
      "coefficient bonus malus",
      "assurance auto malussé",
      "devis auto malus",
    ],
    cta: { href: LAUTO, label: "Devis auto malussé" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>accident responsable</strong> augmente le <strong>coefficient bonus-malus</strong> et le tarif. Beaucoup de compagnies grand public refusent. Un <strong>courtier / grossiste</strong> vise des grilles malussés. <a href=\"" +
          LAUTO +
          "\"><strong>Devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que le CRM change" },
      {
        type: "p",
        text: "Le relevé d’information porte le coefficient et les sinistres. Sans lui, aucun devis sérieux. Guide : <a href=\"./tarif-assurance-auto-2026.html\">tarifs</a> · <a href=\"./assurance-auto-bonus-malus.html\">bonus-malus</a>.",
      },
      { type: "h2", text: "2. Ne pas rester non assuré" },
      {
        type: "p",
        text: "Même malussé, la RC est obligatoire. <a href=\"" + QAUTO + "\">Questionnaire</a> avec date de permis, sinistres, commune.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le malus dure-t-il toute la vie ?",
        a: "Non. Sans nouveau sinistre responsable, le coefficient redescend chaque année (règles CRM).",
      },
    ],
    related: related([{ href: "./assurance-auto-bonus-malus.html", label: "Guide bonus-malus" }], AUTO_CORE),
  },
  {
    file: "assurance-auto-courtier-grossiste-comparatif-2026.html",
    audience: "france",
    section: "auto",
    tag: "Grossiste",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Assurance auto courtier et grossiste 2026 : comparer les meilleures grilles",
    description:
      "Courtier ORIAS + courtiers grossistes : plus de grilles auto que le comparateur grand public. Devis à garanties équivalentes.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Le comparateur montre 4 devis. Le grossiste en ouvre d’autres — surtout jeune permis, malus, usage atypique.",
    keywords: [
      "courtier assurance auto",
      "courtier grossiste auto",
      "comparatif assurance auto courtier",
      "meilleure offre assurance auto",
      "devis auto grossiste",
    ],
    cta: { href: LAUTO, label: "Comparer via courtier / grossiste" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>courtier grossiste</strong> (wholesale) agrège des compagnies et des délégations que le grand public ne voit pas. Nous, courtier ORIAS, comparons ces <strong>offres grossistes</strong> à garanties équivalentes : RC, vol, bris, assistance. Pas de magie : un dossier incomplet reste cher. <a href=\"" +
          LAUTO +
          "\"><strong>Devis auto</strong></a> · <a href=\"" +
          QAUTO +
          "\">questionnaire 3 min</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi le grossiste change la donne" },
      {
        type: "ul",
        items: [
          "Plus de <strong>compagnies</strong> qu’un comparateur web",
          "Profils <strong>jeune conducteur</strong>, malus, véhicule puissant",
          "Usage domicile-travail, trajets pro légers, conducteurs secondaires",
          "Négociation franchise / options (bris, catastrophes, conducteur occasionnel)",
        ],
      },
      { type: "h2", text: "2. Ce que nous ne promettons pas" },
      {
        type: "p",
        text: "Personne ne peut garantir « le prix le plus bas de France » sans dossier. Nous promettons un <strong>comparatif honnête</strong> sur les grilles auxquelles nous avons accès, y compris partenaires grossistes. Local : <a href=\"./assurance-auto-nancy-varangeville-54.html\">Nancy / Varangéville</a> · <a href=\"./assurance-auto-paris-ile-de-france-2026.html\">Paris / IDF</a>.",
      },
      { type: "h2", text: "3. Comment ça se passe" },
      {
        type: "p",
        text: "Questionnaire → relevé d’information → comparaison → rappel conseiller. Même parcours MRH : <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">habitation grossiste</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le courtier grossiste est-il un assureur ?",
        a: "Non. C’est un intermédiaire B2B. Vous signez chez une compagnie ; nous restons votre courtier de proximité (ORIAS).",
      },
      {
        q: "Dois-je payer le courtier en plus de la prime ?",
        a: "Le devis indique la prime. Pas de frais de dossier surprise : on vous dit avant si un honoraire s’applique (cas rares).",
      },
    ],
    related: AUTO_CORE.concat(MRH_CORE.slice(0, 2)),
  },
  {
    file: "devis-assurance-auto-pas-cher-2026.html",
    audience: "france",
    section: "auto",
    tag: "Devis",
    tagClass: "tag-auto",
    themes: ["auto"],
    title: "Devis assurance auto pas cher 2026 : comparatif sans se tromper de garanties",
    description:
      "Assurance auto pas cher : pièges du prix d’appel, franchises, exclusions. Devis courtier / grossiste à garanties égales.",
    meta: "8 min · Août 2026",
    cardExcerpt: "« Pas cher » sans lire la franchise, c’est souvent plus cher au sinistre.",
    keywords: [
      "devis assurance auto pas cher",
      "assurance auto pas chère",
      "comparatif auto pas cher",
      "devis auto en ligne",
    ],
    cta: { href: LAUTO, label: "Devis auto à garanties égales" },
    blocks: [
      {
        type: "p",
        text: "Chercher une <strong>assurance auto pas cher</strong> est légitime. Le piège : un prix d’appel avec franchise énorme, assistance au rabais, exclusion vol. Nous comparons <strong>à garanties équivalentes</strong>, y compris grilles grossistes. <a href=\"" +
          LAUTO +
          "\"><strong>Devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Checklist avant de signer le moins-disant" },
      {
        type: "ul",
        items: [
          "Franchise collision / vol / bris",
          "Valeur à dire d’expert vs cote",
          "Conducteurs désignés",
          "Assistance 0 km",
        ],
      },
      { type: "h2", text: "2. Pages utiles" },
      {
        type: "p",
        text: "<a href=\"./assurance-auto-tous-risques-ou-tiers-2026.html\">Tous risques ou tiers</a> · <a href=\"./tarif-assurance-auto-2026.html\">tarifs</a> · <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">grossiste</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le moins cher est-il toujours une mauvaise affaire ?",
        a: "Non, si les garanties et franchises sont alignées. C’est ce que le devis courtier vérifie.",
      },
    ],
    related: AUTO_CORE,
  },
  {
    file: "assurance-auto-paris-ile-de-france-2026.html",
    audience: "france",
    section: "auto",
    tag: "Paris / IDF",
    tagClass: "tag-auto",
    themes: ["auto", "paris"],
    title: "Assurance auto à Paris et en Île-de-France 2026 : tarifs, stationnement, devis",
    description:
      "Assurance auto à Paris et en Île-de-France : stationnement voirie, vol, bris, codes 75, 92, 93, 94. Devis courtier ORIAS, pages par ville.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Paris et l’IDF : primes plus hautes, vol et bris plus fréquents. Le code postal pèse.",
    keywords: [
      "assurance auto paris",
      "assurance auto île-de-france",
      "devis auto paris",
      "assurance auto 75",
      "assurance auto 93",
    ],
    cta: { href: LAUTO, label: "Devis auto Paris / IDF" },
    blocks: [
      {
        type: "p",
        text: "<strong>Assurance auto à Paris</strong> et en <strong>Île-de-France</strong> : le tarif intègre vol, bris, stationnement sur voirie, sinistralité locale. Pages ville : <a href=\"../assurance-auto/paris/\">Paris</a> · <a href=\"../assurance-auto/villes/\">toutes les villes</a>. <a href=\"" +
          LAUTO +
          "\"><strong>Devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Stationnement, vol, bris" },
      {
        type: "p",
        text: "Voirie vs box, vol, bris de glace, codes 75 / 92 / 93 / 94. Silo : <a href=\"../assurance-auto/\">hub auto</a> · <a href=\"../assurance-auto/paris/\">page Paris</a>.",
      },
      { type: "h2", text: "2. Courtier / grossiste" },
      {
        type: "p",
        text: "En IDF, les grilles grand public saturent. <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">Comparatif grossiste</a>. Autre bassin : <a href=\"./assurance-auto-nancy-varangeville-54.html\">Nancy / Varangéville</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le stationnement en rue augmente-t-il vraiment la prime ?",
        a: "Souvent oui (vol, bris, collisions parking). Déclarez le vrai lieu de stationnement de nuit.",
      },
    ],
    related: AUTO_CORE,
  },
  {
    file: "assurance-auto-nancy-varangeville-54.html",
    audience: "france",
    section: "auto",
    tag: "Meurthe-et-Moselle",
    tagClass: "tag-auto",
    themes: ["auto", "nancy"],
    title: "Assurance auto à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "Devis assurance auto Nancy, Varangéville, Jarville, Dombasle (54). Courtier ORIAS bassin nancéien, grilles grossistes.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Auto dans le 54 : mêmes règles nationales, conseil ancré Nancy / Varangéville.",
    keywords: [
      "assurance auto nancy",
      "assurance auto varangéville",
      "devis auto meurthe-et-moselle",
      "assurance auto jarville",
      "courtier auto 54",
    ],
    cta: { href: LAUTO, label: "Devis auto Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Conducteur à <strong>Nancy</strong>, <strong>Varangéville</strong>, Jarville-la-Malgrange, Dombasle-sur-Meurthe ou dans le Grand Nancy : nous comparons l’<strong>assurance auto</strong> (tiers, tous risques, jeune permis) avec un cabinet ORIAS à Varangéville. Orthographe : <strong>Varangéville</strong> (54). <a href=\"" +
          LAUTO +
          "\"><strong>Devis auto 54</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pages ville" },
      {
        type: "ul",
        items: [
          "<a href=\"../assurance-auto/nancy/\">Assurance auto Nancy</a>",
          "<a href=\"../assurance-auto/varangeville/\">Assurance auto Varangéville</a>",
          "<a href=\"../assurance-auto/jarville-la-malgrange/\">Jarville</a> · <a href=\"../assurance-auto/villes/\">toutes les villes</a>",
        ],
      },
      { type: "h2", text: "2. Même dossier : habitation" },
      {
        type: "p",
        text: "Beaucoup de foyers du 54 revoient auto <strong>et</strong> MRH. <a href=\"./assurance-habitation-nancy-varangeville-54.html\">Habitation Nancy / Varangéville</a> · <a href=\"../agence-varangeville/\">agence</a> · <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">grilles grossistes</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le tarif Nancy est-il plus bas qu’à Paris ?",
        a: "Souvent oui (sinistralité, vol). Le dossier (CRM, véhicule) pèse davantage que le seul code postal.",
      },
    ],
    related: related([{ href: "../agence-varangeville/", label: "Agence Varangéville" }], AUTO_CORE),
  },
  {
    file: "assurance-habitation-vol-cambriolage-2026.html",
    audience: "france",
    section: "habitat",
    tag: "MRH",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Assurance habitation vol et cambriolage 2026 : garanties, franchises, bijoux",
    description:
      "MRH vol / cambriolage : franchise, alarme, bijoux, high-tech. Locataire et propriétaire. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Le vol est dans le contrat — jusqu’à la franchise, l’alarme et le plafond bijoux.",
    keywords: [
      "assurance habitation vol",
      "assurance cambriolage",
      "franchise vol habitation",
      "garantie vol MRH",
    ],
    cta: { href: LHAB, label: "Vérifier ma MRH vol" },
    blocks: [
      {
        type: "p",
        text: "La <strong>multirisque habitation (MRH)</strong> inclut souvent le <strong>vol</strong>, sous conditions : effraction, alarme, plafonds bijoux / informatique. Relisez avant le sinistre. <a href=\"" +
          LHAB +
          "\"><strong>Devis habitation</strong></a> · <a href=\"" +
          QHAB +
          "\">questionnaire</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Points à vérifier" },
      {
        type: "ul",
        items: [
          "Franchise vol et délai de carence",
          "Obligation d’alarme / serrures",
          "Plafonds objets de valeur",
          "Cave, garage, dépendance",
        ],
      },
      { type: "h2", text: "2. Sous-assurance" },
      {
        type: "p",
        text: "Capital mobilier trop bas = indemnité plafonnée. Guide : <a href=\"./assurance-habitation-sous-assurance-sinistre.html\">sous-assurance</a> · <a href=\"./mrh-degats-des-eaux-franchise-2026.html\">dégâts des eaux</a> · <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">grossiste MRH</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Sans trace d’effraction, suis-je couvert ?",
        a: "Souvent non, ou mal. Lisez les conditions vol (escalade, ruse, clés).",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "changer-assurance-habitation-loi-hamon.html",
    audience: "france",
    section: "habitat",
    tag: "Loi Hamon",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Changer d’assurance habitation (loi Hamon) sans trou de garantie",
    description:
      "Résilier MRH après 1 an (loi Hamon) : attestation locataire, sans jour blanc. Devis courtier ORIAS avant de changer.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Locataire : le bailleur veut une attestation continue. On change, on ne coupe pas.",
    keywords: [
      "changer assurance habitation",
      "loi hamon habitation",
      "résilier assurance habitation",
      "attestation habitation locataire",
    ],
    cta: { href: LHAB, label: "Changer de MRH sans trou" },
    blocks: [
      {
        type: "p",
        text: "Après <strong>12 mois</strong>, la <strong>loi Hamon</strong> permet de changer d’<strong>assurance habitation</strong> à tout moment. Le nouvel assureur résilie souvent l’ancien. Locataire : <strong>attestation</strong> sans interruption. <a href=\"" +
          LHAB +
          "\"><strong>Devis MRH</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Locataire vs propriétaire" },
      {
        type: "p",
        text: "Locataire : risques locatifs obligatoires. Propriétaire occupant / copro : souvent exigée. Guide : <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / proprio</a> · <a href=\"./attestation-assurance-habitation-locataire-2026.html\">attestation</a>.",
      },
      { type: "h2", text: "2. Comparer avant de résilier" },
      {
        type: "p",
        text: "Capital mobilier, vol, dégâts des eaux, RC vie privée. <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">Grilles grossistes</a>. <a href=\"" +
          QHAB +
          "\">Questionnaire</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le bailleur peut-il imposer sa compagnie ?",
        a: "Il peut exiger une attestation conforme, pas une marque. Vous choisissez l’assureur.",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "assurance-habitation-courtier-grossiste-mrh-2026.html",
    audience: "france",
    section: "habitat",
    tag: "Grossiste",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Assurance habitation courtier grossiste 2026 : MRH, meilleures grilles",
    description:
      "MRH via courtier ORIAS et courtiers grossistes : locataire, propriétaire, vol, dégâts des eaux. Comparatif à garanties égales.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Les meilleures grilles MRH ne sont pas toujours sur le comparateur grand public.",
    keywords: [
      "courtier assurance habitation",
      "courtier grossiste MRH",
      "comparatif assurance habitation",
      "meilleure assurance habitation",
      "devis MRH grossiste",
    ],
    cta: { href: LHAB, label: "Comparer ma MRH (grossiste)" },
    blocks: [
      {
        type: "p",
        text: "Un partenaire <strong>courtier grossiste</strong> donne accès à des formules <strong>multirisque habitation</strong> (locataire, propriétaire occupant, PNO) que le web grand public n’affiche pas toujours. Nous comparons ces grilles : capital mobilier, vol, dégâts des eaux, RC. <a href=\"" +
          LHAB +
          "\"><strong>Devis habitation</strong></a> · <a href=\"" +
          QHAB +
          "\">questionnaire</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pour qui ça change vraiment le tarif" },
      {
        type: "ul",
        items: [
          "Appartement Paris / IDF (vol, bris)",
          "Maison 54 — Nancy, Varangéville, Jarville",
          "Capital mobilier élevé, bijoux, télétravail",
          "Antécédents sinistres dégâts des eaux",
        ],
      },
      { type: "h2", text: "2. Auto + habitation le même jour" },
      {
        type: "p",
        text: "Beaucoup de foyers gagnent à revoir les deux. <a href=\"./assurance-auto-courtier-grossiste-comparatif-2026.html\">Auto grossiste</a> · <a href=\"./assurance-habitation-nancy-varangeville-54.html\">MRH 54</a> · <a href=\"./assurance-habitation-paris-ile-de-france-2026.html\">MRH Paris</a>.",
      },
      { type: "h2", text: "3. Transparence" },
      {
        type: "p",
        text: "Nous ne vendons pas « la meilleure offre du marché » en slogan. Nous ouvrons les <strong>grilles partenaires</strong> et nous expliquons franchises et exclusions. Courtier ORIAS, cabinet Varangéville, France entière en ligne.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le grossiste remplace-t-il mon courtier ?",
        a: "Non. Le grossiste est B2B. Vous gardez un interlocuteur unique : Leads Opportunities (ORIAS).",
      },
    ],
    related: MRH_CORE.concat(AUTO_CORE.slice(0, 2)),
  },
  {
    file: "mrh-degats-des-eaux-franchise-2026.html",
    audience: "france",
    section: "habitat",
    tag: "Dégâts des eaux",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Dégâts des eaux et franchise MRH 2026 : ce qui est vraiment couvert",
    description:
      "Dégâts des eaux habitation : recherche de fuite, franchise, copro, locataire. Devis MRH courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Le sinistre n°1 en habitation. La franchise et la recherche de fuite font la différence.",
    keywords: [
      "dégâts des eaux assurance",
      "franchise dégâts des eaux",
      "recherche de fuite habitation",
      "sinistre dégât des eaux locataire",
    ],
    cta: { href: LHAB, label: "Relire ma MRH dégâts des eaux" },
    blocks: [
      {
        type: "p",
        text: "Les <strong>dégâts des eaux</strong> sont le sinistre habitation le plus fréquent. Franchise, recherche de fuite, convention IRSI en copro : relisez avant la fuite. <a href=\"" +
          LHAB +
          "\"><strong>Devis MRH</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Locataire, proprio, copro" },
      {
        type: "p",
        text: "Qui déclare, qui paie la franchise, qui gère la recherche de fuite. Guide : <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">rôles</a> · canicule / orages : <a href=\"./canicule-degats-eaux-assurance-habitation.html\">canicule</a>.",
      },
      { type: "h2", text: "2. Comparer les contrats" },
      {
        type: "p",
        text: "<a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">Grilles grossistes</a> · <a href=\"" + QHAB + "\">questionnaire</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La recherche de fuite est-elle toujours comprise ?",
        a: "Non. C’est une option ou un plafond. Vérifiez-la : c’est souvent plus cher que la franchise.",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "assurance-habitation-proprietaire-occupant-2026.html",
    audience: "france",
    section: "habitat",
    tag: "Propriétaire",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Assurance habitation propriétaire occupant 2026 : MRH, copro, capital",
    description:
      "MRH propriétaire occupant : bâtiment, mobilier, copro, PNO. Devis courtier ORIAS, grilles grossistes.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Propriétaire : la copro ne remplace pas votre MRH occupant.",
    keywords: [
      "assurance habitation propriétaire occupant",
      "MRH propriétaire",
      "assurance copropriété propriétaire",
      "devis habitation propriétaire",
    ],
    cta: { href: LHAB, label: "Devis MRH propriétaire" },
    blocks: [
      {
        type: "p",
        text: "En <strong>propriétaire occupant</strong>, l’assurance de copropriété ne couvre pas votre mobilier ni toujours votre RC. Il faut une <strong>MRH</strong> calibrée. <a href=\"" +
          LHAB +
          "\"><strong>Devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Maison vs appartement" },
      {
        type: "p",
        text: "Maison : bâtiment + dépendances. Appartement : lots, cave, parking. <a href=\"./assurance-habitation-vol-cambriolage-2026.html\">Vol</a> · <a href=\"./pno-bailleur-proprietaire-non-occupant.html\">PNO si vous louez</a>.",
      },
      { type: "h2", text: "2. Local 54 et Paris" },
      {
        type: "p",
        text: "<a href=\"./assurance-habitation-nancy-varangeville-54.html\">Nancy / Varangéville</a> · <a href=\"./assurance-habitation-paris-ile-de-france-2026.html\">Paris / IDF</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La banque exige-t-elle une MRH avec le prêt ?",
        a: "Souvent oui (garantie incendie du bien financé). Vérifiez les avenants après travaux.",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "attestation-assurance-habitation-locataire-2026.html",
    audience: "france",
    section: "habitat",
    tag: "Locataire",
    tagClass: "tag-habitation",
    themes: ["habitat"],
    title: "Attestation d’assurance habitation locataire 2026 : obligatoire, délai, devis",
    description:
      "Attestation MRH locataire pour le bailleur : risques locatifs, délai, changer de contrat. Devis courtier ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Sans attestation, le bailleur peut souscrire pour votre compte — et vous facturer.",
    keywords: [
      "attestation assurance habitation locataire",
      "assurance habitation obligatoire locataire",
      "attestation MRH bail",
      "risques locatifs",
    ],
    cta: { href: LHAB, label: "Obtenir une attestation locataire" },
    blocks: [
      {
        type: "p",
        text: "L’<strong>attestation d’assurance habitation</strong> est exigée à l’entrée dans les lieux et souvent chaque année. Elle prouve les <strong>risques locatifs</strong>. <a href=\"" +
          LHAB +
          "\"><strong>Devis locataire</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Que doit-elle mentionner ?" },
      {
        type: "p",
        text: "Adresse du logement, période, garanties locatives. Guide : <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire / proprio</a> · <a href=\"./changer-assurance-habitation-loi-hamon.html\">changer (Hamon)</a>.",
      },
      { type: "h2", text: "2. Trop cher chez la banque du bailleur ?" },
      {
        type: "p",
        text: "Vous n’êtes pas obligé de prendre « son » assureur. <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">Comparer via grossiste</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je être couvert par l’assurance de mes parents ?",
        a: "Parfois en colocation chez eux, rarement pour un bail autonome. Demandez une attestation nominative à votre adresse.",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "assurance-habitation-paris-ile-de-france-2026.html",
    audience: "france",
    section: "habitat",
    tag: "Paris / IDF",
    tagClass: "tag-habitation",
    themes: ["habitat", "paris"],
    title: "Assurance habitation à Paris et en Île-de-France : locataire, proprio, vol",
    description:
      "MRH Paris / IDF 2026 : vol, cambriolage, locataire, propriétaire. Devis courtier ORIAS, pages par ville.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Paris : vol, bris, caves. Le capital mobilier et la franchise vol pèsent.",
    keywords: [
      "assurance habitation paris",
      "assurance habitation île-de-france",
      "devis MRH paris",
      "assurance locataire paris",
    ],
    cta: { href: LHAB, label: "Devis MRH Paris / IDF" },
    blocks: [
      {
        type: "p",
        text: "<strong>Assurance habitation à Paris</strong> et en <strong>Île-de-France</strong> : vol, cambriolage, dégâts des eaux en copro. Pages : <a href=\"../assurance-habitation/paris/\">Paris</a> · <a href=\"../assurance-habitation/villes/\">toutes les villes</a>. <a href=\"" +
          LHAB +
          "\"><strong>Devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Vol, copro, capital mobilier" },
      {
        type: "p",
        text: "Appartement Paris : vol, caves, dégâts des eaux en copro. <a href=\"./assurance-habitation-vol-cambriolage-2026.html\">Vol</a> · <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">grossiste</a>.",
      },
      { type: "h2", text: "2. Autre bassin" },
      {
        type: "p",
        text: "<a href=\"./assurance-habitation-nancy-varangeville-54.html\">Nancy / Varangéville</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Studio Paris : petite MRH suffisante ?",
        a: "Oui si le capital mobilier et la RC sont justes. Un télétravail / high-tech sous-évalué se paie au vol.",
      },
    ],
    related: MRH_CORE,
  },
  {
    file: "assurance-habitation-nancy-varangeville-54.html",
    audience: "france",
    section: "habitat",
    tag: "Meurthe-et-Moselle",
    tagClass: "tag-habitation",
    themes: ["habitat", "nancy"],
    title: "Assurance habitation à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "MRH Nancy, Varangéville, Jarville, Dombasle (54) : locataire, propriétaire, vol, dégâts des eaux. Courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Habitation dans le 54 : devis local, grilles grossistes, orthographe Varangéville.",
    keywords: [
      "assurance habitation nancy",
      "assurance habitation varangéville",
      "devis MRH 54",
      "assurance locataire nancy",
      "courtier habitation meurthe-et-moselle",
    ],
    cta: { href: LHAB, label: "Devis MRH Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Locataire ou propriétaire à <strong>Nancy</strong>, <strong>Varangéville</strong>, Jarville, Dombasle, Saint-Max, Vandœuvre : nous calibrons la <strong>multirisque habitation</strong> avec un cabinet à Varangéville. Orthographe : <strong>Varangéville</strong> uniquement. <a href=\"" +
          LHAB +
          "\"><strong>Devis habitation 54</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pages ville" },
      {
        type: "ul",
        items: [
          "<a href=\"../assurance-habitation/nancy/\">Habitation Nancy</a>",
          "<a href=\"../assurance-habitation/varangeville/\">Habitation Varangéville</a>",
          "<a href=\"../assurance-habitation/villes/\">Toutes les villes</a>",
        ],
      },
      { type: "h2", text: "2. Auto du même foyer" },
      {
        type: "p",
        text: "<a href=\"./assurance-auto-nancy-varangeville-54.html\">Auto Nancy / 54</a> · <a href=\"./assurance-habitation-courtier-grossiste-mrh-2026.html\">MRH grossiste</a> · <a href=\"../agence-varangeville/\">agence</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Maison en Meurthe-et-Moselle : Cat Nat sécheresse ?",
        a: "Les désordres de sécheresse dépendent souvent d’un arrêté Cat Nat. La MRH classique ne suffit pas toujours — on vérifie les options.",
      },
    ],
    related: related([{ href: "../agence-varangeville/", label: "Agence Varangéville" }], MRH_CORE),
  },
];

var LONG = require("./blog-auto-mrh-long.cjs");
module.exports = ARTICLES.map(function (a) {
  var extra = LONG[a.file];
  if (!extra) return a;
  var out = Object.assign({}, a);
  if (extra.blocks) out.blocks = (a.blocks || []).concat(extra.blocks);
  if (extra.faq) out.faq = (a.faq || []).concat(extra.faq);
  if (extra.skipEnrich) out.skipEnrich = true;
  if (extra.description) out.description = extra.description;
  if (extra.meta) out.meta = extra.meta;
  return out;
});
