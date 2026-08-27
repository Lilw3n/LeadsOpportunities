/**
 * Blog — voiture sans permis (VSP, permis AM, quadricycle).
 * Chargé par blog-articles-manifest.cjs. Google Search explicite (marques OK).
 */
var LANDING = "../landings/vsp.html?utm_source=blog&utm_medium=article&utm_campaign=vsp";
var QUEST =
  "../landings/questionnaire.html?need=vsp&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=vsp";
var CTA = { href: LANDING, label: "Devis voiture sans permis" };

var RELATED_CORE = [
  { href: "./assurance-voiture-sans-permis-guide-2026.html", label: "Guide VSP 2026" },
  { href: "./permis-am-bsr-assr-voiture-sans-permis-2026.html", label: "Permis AM / BSR / ASSR" },
  { href: "./tarif-assurance-voiture-sans-permis-2026.html", label: "Tarifs assurance VSP" },
  { href: "./assurance-voiturette-quadricycle-leger-2026.html", label: "Quadricycle léger" },
  { href: "./jeune-conducteur-16-ans-assurance-voiture-sans-permis.html", label: "Jeune conducteur 16 ans" },
  { href: "../assurance-voiture-sans-permis/", label: "Hub voiture sans permis" },
  { href: "../landings/vsp.html", label: "Landing devis VSP" },
];

function related() {
  var extra = Array.prototype.slice.call(arguments);
  var seen = {};
  return extra.concat(RELATED_CORE).filter(function (l) {
    if (seen[l.href]) return false;
    seen[l.href] = true;
    return true;
  });
}

module.exports = [
  {
    file: "assurance-voiture-sans-permis-guide-2026.html",
    section: "vsp",
    tag: "Voiture sans permis",
    tagClass: "tag-actu",
    themes: ["vsp", "mobilite", "auto"],
    title: "Assurance voiture sans permis 2026 : RC, VSP, permis AM",
    description:
      "Guide assurance voiture sans permis (VSP / quadricycle léger) : RC obligatoire, vol, bris, permis AM, BSR, ASSR, jeunes conducteurs. Devis courtier ORIAS.",
    meta: "10 min · Août 2026",
    cardExcerpt: "VSP : ce que couvre vraiment un contrat quadricycle léger en 2026.",
    keywords: [
      "assurance voiture sans permis",
      "assurance vsp",
      "devis vsp",
      "assurance sans permis",
      "quadricycle léger",
      "permis AM assurance",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text: "Une <strong>voiture sans permis</strong> (VSP, quadricycle léger L6e) n’est pas une citadine au permis B. Aixam, Ligier, Microcar, Citroën Ami : le contrat auto classique refuse souvent le risque ou le tarife mal. Ce guide relie <strong>RC obligatoire</strong>, formules vol / bris, <strong>permis AM</strong> et âge de souscription. <a href=\"" +
          LANDING +
          "\"><strong>Comparer mon assurance VSP</strong></a> · <a href=\"" +
          QUEST +
          "\">questionnaire VSP</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. RC : le minimum légal pour circuler" },
      {
        type: "p",
        text: "Comme tout véhicule terrestre à moteur, une VSP doit être assurée au <strong>tiers</strong> (responsabilité civile). Sans ça : infraction, et aucun recours si vous blessez un piéton ou un autre véhicule. Les options (vol, incendie, bris de glace, assistance) se discutent ensuite selon la valeur du véhicule et le stationnement.",
      },
      { type: "h2", text: "2. Pourquoi pas une auto « normale » ?" },
      {
        type: "p",
        text: "Les assureurs grand public calibrent leurs grilles sur le <strong>permis B</strong> et des cylindrées classiques. Un quadricycle léger a un PTAC, une vitesse maximale (45 km/h) et un permis AM différents. Les produits spécialisés (AMI 3F, FMA/Wakam, Solly Azar) existent pour ça — nous les comparons dans le CRM. Pages dédiées : <a href=\"./assurance-aixam-ligier-microcar-voiture-sans-permis.html\">marques VSP</a> · <a href=\"./citroen-ami-assurance-sans-permis.html\">Citroën Ami</a>.",
      },
      { type: "h2", text: "3. Âge : 14 ans au volant, souvent 16 ans à l’adhésion" },
      {
        type: "ul",
        items: [
          "Conduite : permis AM dès 14 ans (réforme)",
          "Souscription partenaire : souvent dès 16 ans",
          "14–15 ans : on enregistre le besoin et on rappelle à l’approche des 16 ans",
          "Jeunes 16–25 ans : prime plus élevée, franchises à lire",
        ],
      },
      {
        type: "p",
        text: "Détail âge et pièces : <a href=\"./jeune-conducteur-16-ans-assurance-voiture-sans-permis.html\">jeune conducteur 16 ans</a> · <a href=\"./permis-am-bsr-assr-voiture-sans-permis-2026.html\">permis AM, BSR, ASSR</a>.",
      },
      { type: "h2", text: "4. Formules : tiers, vol / bris, tous risques" },
      {
        type: "p",
        text: "Le <strong>tiers</strong> suffit à circuler. Dès qu’on gare la VSP dans la rue, le <strong>vol</strong> et le <strong>bris de glace</strong> deviennent le vrai sujet. Un véhicule neuf ou récent (électrique, Ami, Aixam récent) justifie souvent une formule plus complète. Voir <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">vol, bris, tous risques</a> et <a href=\"./tarif-assurance-voiture-sans-permis-2026.html\">ordres de prix 2026</a>.",
      },
      { type: "h2", text: "5. Ce que nous demandons au devis" },
      {
        type: "p",
        text: "Année de naissance (ASSR si né en 1988 ou après), BSR / permis AM, marque et année du véhicule, usage ville, formule souhaitée. Cinq minutes en ligne, puis un rappel conseiller. Pages locales : <a href=\"../assurance-voiture-sans-permis/\">hub VSP</a>, <a href=\"../assurance-voiture-sans-permis/villes/\">par ville</a>, <a href=\"../assurance-voiture-sans-permis/permis-am/\">permis AM</a>, <a href=\"./assurance-vsp-nancy-varangeville-meurthe-et-moselle.html\">Nancy / Varangéville (54)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Checklist avant de comparer" },
      {
        type: "ul",
        items: [
          "Carte grise du quadricycle (catégorie L6e)",
          "Attestation permis AM ou BSR + ASSR si concerné",
          "Lieu de stationnement (rue, box, résidence)",
          "Valeur à neuf / valeur actuelle",
          "Sinistres des 24–36 derniers mois",
        ],
      },
    ],
    faq: [
      {
        q: "Une voiture sans permis doit-elle vraiment être assurée ?",
        a: "Oui. C’est un véhicule terrestre à moteur : la responsabilité civile est obligatoire, comme pour une auto ou un scooter.",
      },
      {
        q: "Puis-je assurer une VSP sur mon contrat auto permis B ?",
        a: "Rarement. La plupart des contrats auto classiques excluent le quadricycle léger. Il faut un produit VSP / L6e.",
      },
      {
        q: "Combien coûte une assurance VSP en 2026 ?",
        a: "Ça dépend de l’âge, du permis AM, de la formule et de la commune. Voir l’article tarifs — un devis personnalisé reste plus fiable qu’une moyenne nationale.",
      },
    ],
    related: related({ href: "./tarif-assurance-voiture-sans-permis-2026.html", label: "Tarifs VSP" }),
  },
  {
    file: "permis-am-bsr-assr-voiture-sans-permis-2026.html",
    section: "vsp",
    tag: "Permis AM",
    tagClass: "tag-actu",
    themes: ["vsp", "permis-am", "auto"],
    title: "Permis AM, BSR et ASSR : conduire une voiture sans permis en 2026",
    description:
      "Permis AM (ex-BSR) et ASSR pour une voiture sans permis. Né avant / après 1988, documents à préparer, lien avec l'assurance VSP.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Permis AM et ASSR : ce qu’il faut pour assurer une VSP.",
    keywords: [
      "permis AM",
      "BSR voiture sans permis",
      "ASSR 1988",
      "conduire sans permis B",
      "assurance permis AM",
      "assurance BSR",
    ],
    cta: { href: LANDING, label: "Devis VSP / permis AM" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>permis AM</strong> a remplacé le BSR. Il autorise cyclomoteur et <strong>quadricycle léger</strong> sans permis B. L’<strong>ASSR</strong> scolaire s’ajoute selon l’année de naissance. Sans ces pièces, beaucoup d’assureurs VSP bloquent le devis. <a href=\"" +
          LANDING +
          "\"><strong>Préparer mon dossier VSP</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Né avant 1988 vs 1988 et après" },
      {
        type: "p",
        text: "Seuil officiel : <strong>1er janvier 1988</strong>. Né(e) avant : BSR / permis AM suffit en principe (pas d’ASSR obligatoire). Né(e) en 1988 ou après : ASSR 1 et/ou 2 selon scolarité + permis AM. Nous posons la question « année de naissance » dans le questionnaire — pas dans une pub Facebook.",
      },
      { type: "h2", text: "2. Documents utiles au devis" },
      {
        type: "ul",
        items: [
          "Attestation permis AM ou BSR",
          "ASSR si concerné (nés en 1988 ou après)",
          "Carte grise du quadricycle",
          "Pièce d’identité (âge 16 ans pour beaucoup de contrats)",
        ],
      },
      { type: "h2", text: "3. Lien avec l’assurance" },
      {
        type: "p",
        text: "Un permis AM valide ne garantit pas l’adhésion à 14 ans. Les fiches partenaires (AMI, FMA, Solly) indiquent souvent <strong>16 ans</strong> minimum. Le courtier oriente : attendre, autre acteur, ou usage encadré. Guide : <a href=\"../assurance-voiture-sans-permis/permis-am/\">page permis AM</a> · <a href=\"./jeune-conducteur-16-ans-assurance-voiture-sans-permis.html\">16 ans et VSP</a> · <a href=\"" +
          QUEST +
          "\">questionnaire</a>.",
      },
      { type: "h2", text: "4. Formation AM : ce que l’assureur ne vérifie pas toujours" },
      {
        type: "p",
        text: "La formation permis AM (7 heures en auto-école) est une obligation de conduite, pas une garantie d’assurance. Conservez l’attestation : en sinistre, l’assureur peut demander la preuve. Un oubli de pièce ralentit l’indemnisation plus souvent qu’un « malus VSP » (le bonus-malus auto classique ne s’applique pas de la même façon).",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le BSR suffit-il encore en 2026 ?",
        a: "Le BSR a été remplacé par le permis AM. Un BSR obtenu avant la réforme reste en principe valable ; l’assureur demandera l’attestation correspondante.",
      },
      {
        q: "Faut-il l’ASSR si j’ai 40 ans ?",
        a: "Si vous êtes né(e) avant 1988, l’ASSR n’est en principe pas exigée. Le questionnaire pose l’année de naissance pour ne pas bloquer le dossier.",
      },
    ],
    related: related({ href: "../assurance-voiture-sans-permis/permis-am/", label: "Hub permis AM" }),
  },
  {
    file: "tarif-assurance-voiture-sans-permis-2026.html",
    section: "vsp",
    tag: "Tarifs VSP",
    tagClass: "tag-actu",
    themes: ["vsp", "tarif", "auto"],
    title: "Tarif assurance voiture sans permis 2026 : prix, formules, ce qui fait varier",
    description:
      "Prix d’une assurance voiture sans permis (VSP) en 2026 : tiers, vol, bris, tous risques. Âge, permis AM, commune, valeur du quadricycle. Devis courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Combien coûte une assurance VSP en 2026 — et pourquoi les grilles varient.",
    keywords: [
      "tarif assurance voiture sans permis",
      "prix assurance vsp",
      "assurance vsp pas cher",
      "devis vsp",
      "coût assurance sans permis",
    ],
    cta: { href: LANDING, label: "Estimer mon tarif VSP" },
    blocks: [
      {
        type: "p",
        text: "Chercher <strong>tarif assurance voiture sans permis</strong>, c’est souvent tomber sur une moyenne nationale qui ne correspond pas à votre dossier. Âge (16–25 vs 40 ans), <strong>permis AM</strong>, formule, valeur du véhicule, stationnement : cinq leviers. Voici comment lire un devis VSP en 2026, sans prendre une grille auto permis B. <a href=\"" +
          LANDING +
          "\"><strong>Obtenir un tarif personnalisé</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ordres de grandeur (pas un engagement)" },
      {
        type: "p",
        text: "Un <strong>tiers</strong> VSP pour un conducteur adulte, usage ville, véhicule d’occasion, se situe souvent dans une fourchette plus basse qu’une citadine permis B. Dès qu’on ajoute <strong>vol + bris</strong> ou un jeune de 16–20 ans, la prime grimpe. Les spécialistes (AMI 3F, FMA/Wakam, Solly Azar) n’ont pas les mêmes seuils d’âge ni les mêmes franchises : d’où l’intérêt de comparer, pas de coller au premier prix Google.",
      },
      { type: "h2", text: "2. Ce qui fait vraiment varier le prix" },
      {
        type: "ul",
        items: [
          "Âge du conducteur (16–25 ans : chargement jeune)",
          "Formule : RC seule vs vol / bris vs tous risques",
          "Valeur du quadricycle (Ami neuve ≠ Aixam 2012)",
          "Commune et stationnement (rue vs box)",
          "Antécédents (résiliation, sinistres, défaut d’assurance)",
        ],
      },
      { type: "h2", text: "3. « Pas cher » vs « trop juste »" },
      {
        type: "p",
        text: "Une <strong>assurance VSP pas cher</strong> au tiers, c’est légal. Ce n’est pas adapté si vous garez un véhicule récent dehors toute la semaine. Un vol non couvert coûte plus cher que 8 €/mois d’option. Lisez franchise vol, exclusion des accessoires, et assistance 0 km. Détail formules : <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">vol, bris, tous risques</a>.",
      },
      { type: "h2", text: "4. Page tarifs du silo + devis" },
      {
        type: "p",
        text: "Le silo SEO a une page <a href=\"../assurance-voiture-sans-permis/tarif/\">tarifs VSP</a>. Elle pose le cadre ; le devis (questionnaire 3 min) calibre votre cas. Changer d’assureur en cours d’année : <a href=\"./resilier-changer-assurance-voiture-sans-permis.html\">résilier / Hamon</a>. Bassin 54 : <a href=\"./assurance-vsp-nancy-varangeville-meurthe-et-moselle.html\">Nancy et Varangéville</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Pourquoi mon devis VSP est plus cher qu’un ami du même âge ?",
        a: "Commune, stationnement, valeur du véhicule, date d’obtention du permis AM et sinistres suffisent à écarter deux tarifs. Comparez à garanties équivalentes.",
      },
      {
        q: "Le prix Google Ads est-il le prix final ?",
        a: "Non. L’annonce amène au devis. Le tarif sort après âge, AM/BSR, marque et formule — pas avant.",
      },
    ],
    related: related({ href: "../assurance-voiture-sans-permis/tarif/", label: "Page tarifs VSP" }),
  },
  {
    file: "assurance-voiturette-quadricycle-leger-2026.html",
    section: "vsp",
    tag: "Quadricycle",
    tagClass: "tag-actu",
    themes: ["vsp", "quadricycle", "auto"],
    title: "Assurance voiturette et quadricycle léger L6e : ce n’est pas une auto",
    description:
      "Assurance voiturette / quadricycle léger (L6e, 45 km/h) : différences avec l’auto permis B, RC obligatoire, permis AM. Devis VSP courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Voiturette, VSP, L6e : le bon contrat n’est pas une auto classique.",
    keywords: [
      "assurance voiturette",
      "assurance quadricycle léger",
      "quadricycle L6e",
      "assurance sans permis",
      "voiturette assurance",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text: "On dit <strong>voiturette</strong>, <strong>VSP</strong> ou <strong>quadricycle léger</strong> (catégorie L6e). Vitesse bridée, PTAC limité, <strong>permis AM</strong> : ce n’est pas une citadine au permis B. L’assurance suit la même logique — produit dédié, pas un avenant « petite auto ». <a href=\"" +
          LANDING +
          "\"><strong>Devis voiturette / VSP</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. L6e vs voiture particulière" },
      {
        type: "p",
        text: "Le <strong>quadricycle léger</strong> est homologué pour 45 km/h. Carte grise, contrôle (selon âge du véhicule) et fiscalité ne sont pas ceux d’une Clio. Un assureur auto « standard » peut refuser le risque ou l’exclure. Hub technique : <a href=\"../assurance-voiture-sans-permis/quadricycle/\">page quadricycle</a>.",
      },
      { type: "h2", text: "2. Qui conduit ?" },
      {
        type: "p",
        text: "Permis AM (ex-BSR), parfois un permis B (qui autorise aussi le L6e). L’assureur veut savoir <strong>qui est au volant</strong> : jeune 16 ans, senior sans permis B, usage courses. Voir <a href=\"./permis-am-bsr-assr-voiture-sans-permis-2026.html\">permis AM / ASSR</a>.",
      },
      { type: "h2", text: "3. Marques et usages fréquents" },
      {
        type: "ul",
        items: [
          "Aixam, Ligier, Microcar, Chatenet : VSP « traditionnelles »",
          "Citroën Ami : quadricycle électrique très recherché",
          "Usage ville, dernière mile, mobilité sans permis B",
        ],
      },
      {
        type: "p",
        text: "Articles marques : <a href=\"./assurance-aixam-ligier-microcar-voiture-sans-permis.html\">Aixam, Ligier, Microcar</a> · <a href=\"./citroen-ami-assurance-sans-permis.html\">assurance Citroën Ami</a>.",
      },
      { type: "h2", text: "4. Garanties à ne pas oublier" },
      {
        type: "p",
        text: "RC d’abord. Puis vol (fréquemment en ville), bris, assistance dépannage. Une voiturette électrique a une batterie : vérifiez si le contrat parle d’incendie / dommages électriques. <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">Formules vol / bris</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Voiturette et VSP, c’est la même chose ?",
        a: "Dans le langage courant, oui. Techniquement on parle de quadricycle léger L6e. L’assurance VSP couvre cette catégorie.",
      },
      {
        q: "Un permis B suffit-il pour assurer une voiturette ?",
        a: "Le permis B autorise la conduite. Le contrat, lui, doit quand même être un produit quadricycle / VSP, pas un contrat auto classique.",
      },
    ],
    related: related({ href: "../assurance-voiture-sans-permis/quadricycle/", label: "Hub quadricycle" }),
  },
  {
    file: "assurance-aixam-ligier-microcar-voiture-sans-permis.html",
    section: "vsp",
    tag: "Marques VSP",
    tagClass: "tag-actu",
    themes: ["vsp", "aixam", "auto"],
    title: "Assurance Aixam, Ligier, Microcar : assurer sa voiture sans permis",
    description:
      "Assurance Aixam, Ligier, Microcar (et Chatenet) : RC, vol, bris pour VSP / quadricycle léger. Devis courtier, permis AM, âge 16 ans.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Aixam, Ligier, Microcar : le contrat VSP adapté à la marque.",
    keywords: [
      "assurance aixam",
      "assurance ligier",
      "assurance microcar",
      "assurance chatenet",
      "assurance voiture sans permis aixam",
    ],
    cta: { href: LANDING, label: "Devis Aixam / Ligier / Microcar" },
    blocks: [
      {
        type: "p",
        text: "Les recherches <strong>assurance Aixam</strong>, <strong>Ligier</strong> ou <strong>Microcar</strong> tombent souvent sur des contrats auto inadaptés. Ces marques sont des <strong>voitures sans permis</strong> (quadricycle léger). Il faut un produit VSP : RC, éventuellement vol et bris, âge et permis AM. <a href=\"" +
          LANDING +
          "\"><strong>Devis selon la marque</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi la marque compte" },
      {
        type: "p",
        text: "Valeur à neuf, pièces, fréquence de vol, motorisation essence vs électrique : l’assureur tarife. Un Aixam récent n’a pas le même capital à garantir qu’un Ligier de 15 ans. Indiquez <strong>marque, modèle, année</strong> dans le questionnaire (plaque non bloquante).",
      },
      { type: "h2", text: "2. Aixam, Ligier, Microcar, Chatenet" },
      {
        type: "ul",
        items: [
          "Aixam : très présent en France, pièces identifiables",
          "Ligier / Microcar : même univers VSP, grilles parfois distinctes",
          "Chatenet : moins de volume, dossier à documenter (carte grise, photos)",
        ],
      },
      { type: "h2", text: "3. Ce qu’il ne faut pas coller sur Facebook" },
      {
        type: "p",
        text: "Côté <strong>Google Search et blog</strong>, on parle clairement Aixam / VSP / permis AM. Côté <strong>Meta</strong>, la pub reste discrète (« citadine légère ») : les règles d’annonces n’aiment pas le ciblage « sans permis ». Ici, on est sur le canal SEO — les mots-clés marques sont voulus.",
      },
      { type: "h2", text: "4. Formule selon l’âge du véhicule" },
      {
        type: "p",
        text: "Occasion ancienne : le <strong>tiers</strong> + assistance peut suffire. Véhicule récent ou déjà victime de vandalisme : <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">vol et bris</a>. Ami électrique : article dédié <a href=\"./citroen-ami-assurance-sans-permis.html\">Citroën Ami</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Mon Aixam est-il assurable sans permis B ?",
        a: "Oui, c’est le cas d’usage VSP : permis AM / BSR, souvent 16 ans minimum à la souscription selon l’assureur.",
      },
      {
        q: "La plaque d’immatriculation est-elle obligatoire pour le devis ?",
        a: "Non pour un premier devis : marque, année et formule suffisent. La plaque sert ensuite à l’émission du contrat.",
      },
    ],
    related: related({ href: "./citroen-ami-assurance-sans-permis.html", label: "Assurance Citroën Ami" }),
  },
  {
    file: "citroen-ami-assurance-sans-permis.html",
    section: "vsp",
    tag: "Citroën Ami",
    tagClass: "tag-actu",
    themes: ["vsp", "ami", "auto"],
    title: "Assurance Citroën Ami : voiture sans permis électrique (quadricycle)",
    description:
      "Assurer une Citroën Ami (quadricycle léger électrique, sans permis B) : RC, vol, bris, batterie, permis AM. Devis VSP courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Citroën Ami : le bon contrat est un contrat VSP / L6e, pas une auto.",
    keywords: [
      "assurance citroen ami",
      "assurance citroën ami",
      "ami sans permis assurance",
      "assurance quadricycle électrique",
      "devis ami citroën",
    ],
    cta: { href: LANDING, label: "Devis Citroën Ami / VSP" },
    blocks: [
      {
        type: "p",
        text: "La <strong>Citroën Ami</strong> se cherche comme une citadine. En version sans permis B, c’est un <strong>quadricycle léger</strong> (L6e) électrique. L’assurance n’est donc pas un contrat auto Clio : c’est un produit <strong>VSP</strong>, avec RC obligatoire, souvent vol et bris (stationnement rue). <a href=\"" +
          LANDING +
          "\"><strong>Devis Ami / voiture sans permis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ami = L6e, pas permis B" },
      {
        type: "p",
        text: "Conduite : <strong>permis AM</strong> (ou B). Vitesse bridée, gabarit urbain. Si votre Ami est bien en catégorie quadricycle, un contrat « auto particulière » peut être refusé ou mal rédigé. Vérifiez la carte grise avant de coller un devis auto discount.",
      },
      { type: "h2", text: "2. Vol, bris, batterie" },
      {
        type: "p",
        text: "L’Ami se gare souvent en ville, parfois sans box. Le <strong>vol</strong> et le <strong>vandalisme / bris</strong> valent le détour. Posez la question batterie / incendie électrique au conseiller — les clauses varient. <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">Détail des formules</a>.",
      },
      { type: "h2", text: "3. Âge et souscription" },
      {
        type: "p",
        text: "Même logique que les autres VSP : conduite possible dès 14 ans avec AM, <strong>souscription souvent 16 ans</strong>. Jeune conducteur : <a href=\"./jeune-conducteur-16-ans-assurance-voiture-sans-permis.html\">article 16 ans</a>. Tarifs : <a href=\"./tarif-assurance-voiture-sans-permis-2026.html\">prix VSP 2026</a>.",
      },
      { type: "h2", text: "4. Comparer sans se tromper de rayon" },
      {
        type: "p",
        text: "Un comparateur auto grand public peut proposer des garanties qui excluent le L6e. Passez par un courtier qui a des partenaires VSP (AMI 3F, FMA, Solly…). Questionnaire : <a href=\"" +
          QUEST +
          "\">need=vsp</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je assurer mon Ami sur le contrat auto du foyer ?",
        a: "En général non, si l’Ami est un quadricycle léger. Il faut un contrat VSP dédié, éventuellement en second véhicule chez un spécialiste.",
      },
      {
        q: "L’Ami a-t-elle besoin du permis AM ?",
        a: "La version sans permis B se conduit avec le permis AM (ou un permis B). L’assureur demandera la pièce correspondante.",
      },
    ],
    related: related({ href: "./assurance-aixam-ligier-microcar-voiture-sans-permis.html", label: "Aixam Ligier Microcar" }),
  },
  {
    file: "jeune-conducteur-16-ans-assurance-voiture-sans-permis.html",
    section: "vsp",
    tag: "Jeune conducteur",
    tagClass: "tag-actu",
    themes: ["vsp", "jeune", "permis-am"],
    title: "Assurance voiture sans permis à 16 ans : jeune conducteur, AM, parents",
    description:
      "Assurer une VSP à 16 ans (permis AM, BSR, ASSR) : qui souscrit, prime jeune, franchises, 14 vs 16 ans. Devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "16 ans et VSP : souscription, pièces AM/ASSR et ce que paient les parents.",
    keywords: [
      "assurance voiture sans permis 16 ans",
      "assurance vsp jeune conducteur",
      "permis AM 16 ans",
      "assurance sans permis adolescent",
      "voiture sans permis mineur",
    ],
    cta: { href: LANDING, label: "Devis VSP jeune / 16 ans" },
    blocks: [
      {
        type: "p",
        text: "À <strong>16 ans</strong>, on peut souvent <strong>souscrire</strong> une assurance voiture sans permis — alors que la conduite en permis AM est possible plus tôt. Les parents paient, le jeune conduit, l’assureur veut des pièces (AM, ASSR). Voici le cadre 2026, sans promesse de « tarif étudiant auto ». <a href=\"" +
          LANDING +
          "\"><strong>Préparer le devis 16 ans</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. 14 ans au volant ≠ 16 ans au contrat" },
      {
        type: "p",
        text: "La réforme du permis AM a abaissé l’âge de conduite. Les <strong>partenaires assurance</strong> restent souvent à <strong>16 ans</strong> pour l’adhésion. Entre 14 et 16 ans : on note le besoin, on rappelle à l’anniversaire. Ne promettez pas un contrat émis à 14 ans si la fiche produit l’interdit.",
      },
      { type: "h2", text: "2. Qui est souscripteur ?" },
      {
        type: "ul",
        items: [
          "Parent / tuteur : souscripteur payeur, jeune déclaré conducteur",
          "À 18 ans : bascule possible au nom du jeune",
          "Pièces : identité, AM/BSR, ASSR si né en 1988 ou après (tous les 16 ans le sont)",
        ],
      },
      { type: "h2", text: "3. Prime et franchises" },
      {
        type: "p",
        text: "Un jeune 16–20 ans est un risque statistique plus élevé. La prime VSP n’atteint pas toujours celle d’une 208 jeune permis B, mais elle n’est pas « mini ». Lisez <strong>franchise vol</strong> et exclusions (prêt du volant, alcool). Tarifs globaux : <a href=\"./tarif-assurance-voiture-sans-permis-2026.html\">article tarifs</a>. Permis : <a href=\"./permis-am-bsr-assr-voiture-sans-permis-2026.html\">AM / ASSR</a>.",
      },
      { type: "h2", text: "4. Usage lycée, apprentissage, week-end" },
      {
        type: "p",
        text: "Dites le vrai usage (trajet domicile–lycée, apprentissage, week-end). Un sinistre « conducteur non déclaré » est le piège classique. Questionnaire : <a href=\"" +
          QUEST +
          "\">need=vsp</a> (tranche d’âge + AM).",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un parent peut-il assurer la VSP du lycéen ?",
        a: "Oui, c’est le montage le plus fréquent : adulte souscripteur, jeune conducteur désigné, pièces AM/ASSR du jeune.",
      },
      {
        q: "Peut-on assurer une VSP à 14 ans ?",
        a: "La conduite peut être autorisée avec le permis AM ; la souscription partenaire est souvent à 16 ans. On enregistre le dossier et on rappelle.",
      },
    ],
    related: related({ href: "./permis-am-bsr-assr-voiture-sans-permis-2026.html", label: "Permis AM / ASSR" }),
  },
  {
    file: "assurance-vsp-vol-bris-tous-risques.html",
    section: "vsp",
    tag: "Garanties",
    tagClass: "tag-actu",
    themes: ["vsp", "vol", "auto"],
    title: "Assurance VSP : vol, bris de glace ou tous risques ?",
    description:
      "Choisir sa formule voiture sans permis : RC, vol, bris de glace, tous risques. Stationnement rue, valeur du quadricycle, franchises. Devis ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Tiers, vol, bris : quelle formule pour une VSP garée en ville ?",
    keywords: [
      "assurance vsp tous risques",
      "assurance voiture sans permis vol",
      "bris de glace vsp",
      "formule assurance sans permis",
      "garantie vol voiturette",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text: "Le <strong>tiers</strong> permet de circuler. Ce n’est pas toujours assez : une VSP ou une Ami garée dans la rue subit vol, rayures, bris. Voici comment choisir entre RC, pack vol / bris et « tous risques » VSP — en lisant les franchises. <a href=\"" +
          LANDING +
          "\"><strong>Comparer les formules</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Tiers (RC) : le plancher légal" },
      {
        type: "p",
        text: "Vous blessez un tiers : la RC indemnise. Votre propre véhicule : rien. Adapté à une voiturette ancienne de faible valeur, box fermé, usage rare.",
      },
      { type: "h2", text: "2. Vol et bris : le vrai sujet urbain" },
      {
        type: "ul",
        items: [
          "Vol : franchise, conditions antivol, stationnement déclaré",
          "Bris de glace / glaces : fréquents en ville, franchise parfois élevée",
          "Vandalisme : parfois option séparée, parfois inclus au vol",
        ],
      },
      { type: "h2", text: "3. Tous risques VSP : utile si le capital le justifie" },
      {
        type: "p",
        text: "Dommages tous accidents (même responsable) : intéressant sur un véhicule récent / électrique. Sur un Aixam de 12 ans, le calcul « prime + franchise vs valeur » peut dire non. <a href=\"./tarif-assurance-voiture-sans-permis-2026.html\">Tarifs</a> · <a href=\"./citroen-ami-assurance-sans-permis.html\">cas Ami</a>.",
      },
      { type: "h2", text: "4. Assistance 0 km" },
      {
        type: "p",
        text: "Une panne à 3 km de chez soi sans assistance, c’est la dépanneuse à vos frais. Sur L6e, les réseaux ne sont pas toujours ceux de l’auto classique : vérifiez le prestataire.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le tous risques VSP couvre-t-il le conducteur blessé ?",
        a: "Pas automatiquement. La garantie du conducteur / individuelle accident est une ligne à part. On la coche dans le questionnaire si besoin.",
      },
      {
        q: "Le vol est-il exclu si je n’ai pas de box ?",
        a: "Non en principe, mais le tarif et la franchise changent. Déclarez le stationnement réel (rue, résidence, box).",
      },
    ],
    related: related({ href: "./tarif-assurance-voiture-sans-permis-2026.html", label: "Tarifs VSP" }),
  },
  {
    file: "resilier-changer-assurance-voiture-sans-permis.html",
    section: "vsp",
    tag: "Résiliation",
    tagClass: "tag-actu",
    themes: ["vsp", "resiliation", "auto"],
    title: "Résilier et changer d’assurance voiture sans permis (loi Hamon)",
    description:
      "Changer d’assurance VSP : loi Hamon après 1 an, préavis, relevé d’information, résiliation pour prime trop élevée. Devis courtier ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Hamon, relevé d’information : comment changer d’assureur VSP sans trou de garantie.",
    keywords: [
      "résilier assurance voiture sans permis",
      "changer assurance vsp",
      "loi hamon vsp",
      "relevé information voiturette",
      "résiliation assurance sans permis",
    ],
    cta: { href: LANDING, label: "Comparer avant de résilier" },
    blocks: [
      {
        type: "p",
        text: "Votre <strong>assurance voiture sans permis</strong> a augmenté, ou le service ne suit pas : on peut <strong>changer</strong> sans se retrouver sans RC. Après un an, la <strong>loi Hamon</strong> (infra-annuelle) s’applique aux contrats auto — y compris beaucoup de VSP. On compare d’abord, on résilie ensuite. <a href=\"" +
          LANDING +
          "\"><strong>Devis pour changer d’assureur</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ne jamais laisser un trou de RC" },
      {
        type: "p",
        text: "Circuler sans assurance VSP, c’est l’infraction + le fonds de garantie. Datez la prise d’effet du nouveau contrat <strong>avant</strong> la fin de l’ancien. Le courtier aligne les dates.",
      },
      { type: "h2", text: "2. Hamon, échéance, motifs" },
      {
        type: "ul",
        items: [
          "Après 12 mois : résiliation infra-annuelle (Hamon) — le nouvel assureur peut s’en charger",
          "À l’échéance : préavis habituel (souvent 2 mois) si vous êtes encore dans la 1re année",
          "Vente du véhicule, déménagement : motifs spécifiques, justificatifs",
        ],
      },
      { type: "h2", text: "3. Relevé d’information" },
      {
        type: "p",
        text: "Même logique qu’en auto : le nouvel assureur veut l’historique. Demandez le relevé à l’ancien. Sinistres, résiliation pour impayé : dites-le au questionnaire, ça évite un refus plus tard.",
      },
      { type: "h2", text: "4. Pourquoi changer" },
      {
        type: "p",
        text: "Prime trop haute vs formule trop juste, sinistre mal géré, véhicule changé (passage Ami, Aixam plus récent). Recalibrez avec <a href=\"./assurance-vsp-vol-bris-tous-risques.html\">les garanties</a> et <a href=\"./tarif-assurance-voiture-sans-permis-2026.html\">le tarif</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le nouvel assureur peut-il résilier l’ancien pour moi ?",
        a: "Souvent oui après un an (Hamon). Fournissez le RIB, le contrat en cours et le relevé d’information.",
      },
      {
        q: "Une résiliation pour impayé bloque-t-elle tout le marché VSP ?",
        a: "Elle complique le dossier, elle ne le rend pas toujours impossible. Un courtier oriente vers les partenaires qui acceptent le risque, parfois avec surprimes.",
      },
    ],
    related: related({ href: "./tarif-assurance-voiture-sans-permis-2026.html", label: "Tarifs VSP" }),
  },
  {
    file: "assurance-vsp-nancy-varangeville-meurthe-et-moselle.html",
    section: "vsp",
    tag: "Meurthe-et-Moselle",
    tagClass: "tag-actu",
    themes: ["vsp", "nancy", "local-54"],
    title: "Assurance voiture sans permis à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "Assurance VSP à Nancy, Varangéville, Jarville et métropole 54 : devis local, permis AM, quadricycle. Courtier ORIAS, bassin nancéien.",
    meta: "8 min · Août 2026",
    cardExcerpt: "VSP dans le 54 : Nancy, Varangéville, Jarville — devis local, pas un comparateur national anonyme.",
    keywords: [
      "assurance voiture sans permis nancy",
      "assurance vsp varangéville",
      "assurance sans permis meurthe-et-moselle",
      "voiturette nancy",
      "permis AM nancy",
    ],
    cta: { href: LANDING, label: "Devis VSP Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Assurer une <strong>voiture sans permis</strong> à <strong>Nancy</strong>, <strong>Varangéville</strong>, Jarville-la-Malgrange ou dans la métropole, ce n’est pas coller un tarif Paris. Stationnement (centre, lotissement, village), trajets Meurthe-et-Moselle, âge et permis AM : le dossier se monte en local. <a href=\"" +
          LANDING +
          "\"><strong>Devis VSP bassin nancéien</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pages ville du silo 54" },
      {
        type: "p",
        text: "Le site a déjà des pages money : <a href=\"../assurance-voiture-sans-permis/nancy/\">assurance VSP Nancy</a>, <a href=\"../assurance-voiture-sans-permis/varangeville/\">Varangéville</a>, <a href=\"../assurance-voiture-sans-permis/jarville-la-malgrange/\">Jarville-la-Malgrange</a>. Cet article relie le <strong>blog</strong> au terrain : agence / courtage autour de Varangéville, pas une hotline lointaine.",
      },
      { type: "h2", text: "2. Usages typiques dans le bassin" },
      {
        type: "ul",
        items: [
          "Trajets village ↔ Nancy / Saint-Max / Dombasle",
          "Seniors sans permis B, jeunes 16 ans (lycée, apprentissage)",
          "Stationnement rue vs box — le vol pèse autant qu’à Lyon",
        ],
      },
      { type: "h2", text: "3. Permis AM et pièces, comme partout en France" },
      {
        type: "p",
        text: "Les règles AM / ASSR 1988 sont nationales. On ne « simplifie » pas le 54. En revanche le conseiller connaît les auto-écoles et les usages locaux. <a href=\"./permis-am-bsr-assr-voiture-sans-permis-2026.html\">Guide permis AM</a> · <a href=\"./jeune-conducteur-16-ans-assurance-voiture-sans-permis.html\">16 ans</a>.",
      },
      { type: "h2", text: "4. Aussi le prêt et l’agence, si le projet dépasse la VSP" },
      {
        type: "p",
        text: "Leads Opportunities est ancré sur le <strong>bassin nancéien</strong> (Nancy, Jarville, <strong>Varangéville</strong>). Si le foyer a aussi un projet immobilier : <a href=\"../pret-immobilier/nancy-metropole/\">hub prêt Nancy métropole</a>, <a href=\"../agence-varangeville/\">agence Varangéville</a>. Pour la seule VSP : questionnaire <a href=\"" +
          QUEST +
          "\">need=vsp</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Comment s’écrit la commune du 54 ?",
        a: "Varangéville (avec un a, Meurthe-et-Moselle, bassin de Nancy / Dombasle). C’est celle de l’agence locale.",
      },
      {
        q: "Puis-je faire le devis en ligne depuis Nancy ?",
        a: "Oui. Le questionnaire VSP est national ; le rappel peut être localisé 54. Les pages ville Nancy / Varangéville / Jarville servent aussi au SEO local.",
      },
    ],
    related: related(
      { href: "../assurance-voiture-sans-permis/nancy/", label: "VSP Nancy" },
      { href: "../assurance-voiture-sans-permis/varangeville/", label: "VSP Varangéville" },
      { href: "../pret-immobilier/nancy-metropole/", label: "Prêt Nancy métropole" }
    ),
  },
];
