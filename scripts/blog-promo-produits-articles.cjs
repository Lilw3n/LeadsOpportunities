/**
 * Articles blog promotionnels — produits LO (VTC prioritaire + verticales conversion).
 * Chargé par blog-articles-manifest.cjs. CTA → landings / questionnaires UTM blog.
 */
var UTM = "utm_source=blog&utm_medium=article&utm_campaign=promo_produits";

function landing(need, pathExtra, content) {
  var base =
    need === "vtc"
      ? "../landings/vtc.html"
      : need === "sante"
        ? "../landings/sante.html"
        : need === "credit"
          ? "../landings/credit-immo.html"
          : need === "vsp"
            ? "../landings/vsp.html"
            : need === "habitation"
              ? "../landings/devis.html?need=habitation"
              : "../landings/questionnaire.html?need=" + need + "&journey=standard";
  var sep = base.indexOf("?") >= 0 ? "&" : "?";
  return (
    base +
    sep +
    UTM +
    (content ? "&utm_content=" + content : "") +
    (pathExtra || "")
  );
}

function quest(need, content) {
  return (
    "../landings/questionnaire.html?need=" +
    need +
    "&journey=standard&" +
    UTM +
    (content ? "&utm_content=" + content : "")
  );
}

var VTC_LANDING = landing("vtc", "", "vtc-hub");
var VTC_QUEST = quest("vtc", "vtc-quest");
var CTA_VTC = { href: VTC_LANDING, label: "Devis assurance VTC" };

var RELATED_VTC = [
  { href: "./assurance-vtc-moins-cher-2026.html", label: "Assurance VTC moins cher" },
  { href: "./assurance-vtc-uber-bolt-heetch.html", label: "Uber Bolt Heetch" },
  { href: "./assurance-vtc-creation-chauffeur.html", label: "Création chauffeur" },
  { href: "./vtc-premiere-course-checklist-assurance.html", label: "Checklist 1ʳᵉ course" },
  { href: "./assurance-vtc-rc-pro-garanties.html", label: "RC Pro VTC" },
  { href: "../assurance-vtc/", label: "Hub assurance VTC" },
  { href: "../landings/vtc.html", label: "Landing devis VTC" },
];

function relatedVtc() {
  var extra = Array.prototype.slice.call(arguments);
  var seen = {};
  return extra.concat(RELATED_VTC).filter(function (l) {
    if (seen[l.href]) return false;
    seen[l.href] = true;
    return true;
  });
}

module.exports = [
  /* ——— VTC (priorité acquisition) ——— */
  {
    file: "assurance-vtc-ile-de-france-paris-cdg-orly-2026.html",
    section: "vtc",
    tag: "VTC Île-de-France",
    tagClass: "tag-vtc",
    themes: ["vtc", "idf", "paris", "cdg", "orly"],
    title: "Assurance VTC Île-de-France 2026 : Paris, CDG, Orly — devis local",
    description:
      "Chauffeur VTC en Île-de-France (Paris, CDG, Orly) : RC pro, plateformes Uber Bolt Heetch, zones aéroport. Devis courtier ORIAS, rappel rapide.",
    meta: "11 min · Septembre 2026",
    cardExcerpt: "VTC IDF : assurance pro adaptée Paris / aéroports — devis gratuit.",
    keywords: [
      "assurance vtc île de france",
      "assurance vtc paris",
      "assurance vtc cdg",
      "assurance vtc orly",
      "devis vtc idf",
      "rc pro vtc paris",
      "chauffeur uber paris assurance",
    ],
    cta: CTA_VTC,
    blocks: [
      {
        type: "p",
        text:
          "Environ <strong>deux tiers des chauffeurs VTC</strong> travaillent en <strong>Île-de-France</strong> : Paris intramuros, banlieue, rotations <strong>CDG</strong> et <strong>Orly</strong>. L’assurance n’est pas un détail administratif — sans <strong>RC pro transport de personnes</strong> valide, les plateformes bloquent le compte. Ce guide relie zones, plateformes et devis. <a href=\"" +
          landing("vtc", "", "vtc-idf-intro") +
          "\"><strong>Demander mon devis VTC IDF</strong></a> · <a href=\"" +
          VTC_QUEST +
          "\">questionnaire 3 min</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi l’IDF change le devis" },
      {
        type: "p",
        text: "Kilométrage élevé, stationnement urbain, sinistralité différente d’une ville moyenne : les partenaires tarifent souvent le risque <strong>francilien</strong> à part. Un contrat « auto classique » refuse le transport de personnes. Il faut un produit <strong>VTC / taxi</strong> avec plafonds RC adaptés et mention plateformes.",
      },
      { type: "h2", text: "2. Paris, CDG, Orly : mêmes règles, usages différents" },
      {
        type: "ul",
        items: [
          "<strong>Paris</strong> : courses courtes, embouteillages, stationnement — assistance et véhicule de remplacement utiles",
          "<strong>CDG / Orly</strong> : rotations aéroport, bagages, clients internationaux — vérifier exclusions et franchises",
          "<strong>Banlieue / Grand Paris</strong> : trajets plus longs, nuit — lire les plages horaires et le bonus-malus",
          "Hubs SEO locaux : <a href=\"../assurance-vtc/ile-de-france/\">Île-de-France</a> · <a href=\"../assurance-vtc/aeroport-cdg/\">CDG</a> · <a href=\"../assurance-vtc/aeroport-orly/\">Orly</a>",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "3. Uber, Bolt, Heetch : une attestation qui passe" },
      {
        type: "p",
        text:
          "Les plateformes exigent une attestation <strong>à jour</strong> avec activité VTC. Avant d’activer le compte ou de renouveler, comparez les offres (Zéphir, Solly Azar, etc.) via un courtier ORIAS. Voir <a href=\"./assurance-vtc-uber-bolt-heetch.html\">compatibilité plateformes</a> et <a href=\"./comparatif-vtc-zephir-solly-azar.html\">comparatif partenaires</a>. <a href=\"" +
          landing("vtc", "", "vtc-idf-plateformes") +
          "\"><strong>Comparer mon devis</strong></a>.",
      },
      { type: "h2", text: "4. Documents à préparer (IDF)" },
      {
        type: "ul",
        items: [
          "Carte VTC / inscription au registre",
          "Carte grise + contrôle technique",
          "Permis B + casier / extrait si demandé",
          "Attestation d’assurance précédente (si changement)",
          "RIB et SIRET / micro-entreprise",
        ],
      },
      {
        type: "p",
        text:
          "On vous oriente en <strong>rappel sous 15 min</strong> quand le dossier est complet. <a href=\"" +
          landing("vtc", "", "vtc-idf-cta") +
          "\">Lancer mon devis VTC Île-de-France</a>.",
      },
    ],
    related: relatedVtc(
      { href: "../assurance-vtc/ile-de-france/", label: "Hub VTC Île-de-France" },
      { href: "../assurance-vtc/aeroport-cdg/", label: "VTC aéroport CDG" },
      { href: "../assurance-vtc/aeroport-orly/", label: "VTC aéroport Orly" }
    ),
    faq: [
      {
        q: "Faut-il une assurance différente pour CDG et Orly ?",
        a: "Le cadre légal est le même (RC pro VTC). Le tarif peut varier selon usage, véhicule et antécédents — pas selon « un contrat aéroport » isolé.",
      },
      {
        q: "Je suis en banlieue 93/94/92 : ça compte comme IDF ?",
        a: "Oui pour la plupart des partenaires. Indiquez votre code postal et votre zone de courses dans le questionnaire.",
      },
      {
        q: "Combien de temps pour un devis ?",
        a: "Souvent le jour même si les documents sont prêts. Le rappel express vise ~15 minutes pour un premier échange.",
      },
    ],
  },
  {
    file: "assurance-vtc-rentabilite-cout-mensuel-2026.html",
    section: "vtc",
    tag: "VTC rentabilité",
    tagClass: "tag-vtc",
    themes: ["vtc", "rentabilite", "cout"],
    title: "Assurance VTC : quel coût mensuel en 2026 ? (et comment le rentabiliser)",
    description:
      "Prime VTC, franchise, charges : comment intégrer l’assurance dans votre rentabilité Uber/Bolt. Leviers pour payer juste sans sous-assurer.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Coût mensuel assurance VTC : intégrer la prime dans le business plan courses.",
    keywords: [
      "cout assurance vtc",
      "prix assurance vtc mensuel",
      "rentabilite chauffeur vtc",
      "combien coute assurance vtc",
      "prime vtc 2026",
      "charges chauffeur uber",
    ],
    cta: CTA_VTC,
    blocks: [
      {
        type: "p",
        text:
          "Beaucoup de chauffeurs regardent uniquement le <strong>prix de la prime</strong>. Erreur : une franchise trop haute ou une exclusion plateforme peut coûter une semaine de courses. Voici comment lire le <strong>coût mensuel réel</strong> et le comparer. <a href=\"" +
          landing("vtc", "", "vtc-cout-intro") +
          "\"><strong>Obtenir mon devis chiffré</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qui compose le « coût assurance »" },
      {
        type: "ul",
        items: [
          "Prime annuelle / mensuelle (RC pro + véhicule)",
          "Franchise en cas de sinistre",
          "Options : bris de glace, assistance 0 km, véhicule de remplacement",
          "Éventuelle surprime jeune permis / antécédents",
        ],
      },
      { type: "h2", text: "2. Règle simple de rentabilité" },
      {
        type: "p",
        text: "Divisez la prime annuelle par vos <strong>mois actifs</strong>, puis par le nombre de courses moyen. Si l’assurance représente une part trop forte du CA net (après commission plateforme et carburant), comparez d’autres formules — sans descendre sous le minimum légal. Guide prix : <a href=\"./assurance-vtc-moins-cher-2026.html\">7 leviers pour payer moins cher</a>.",
      },
      { type: "h2", text: "3. Ne pas sous-assurer pour « gagner » 20 €/mois" },
      {
        type: "p",
        text:
          "Une économie de prime qui fait refuser votre attestation Uber coûte plus cher qu’un devis bien calibré. Priorité : <strong>conformité plateformes</strong>, puis optimisation franchise / options. <a href=\"" +
          quest("vtc", "vtc-cout-quest") +
          "\">Décrire mon activité (questionnaire)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. On compare pour vous" },
      {
        type: "p",
        text:
          "Courtier ORIAS : on croise plusieurs partenaires VTC, on explique franchise et garanties en français clair. <a href=\"" +
          landing("vtc", "", "vtc-cout-cta") +
          "\"><strong>Comparer mon assurance VTC</strong></a>.",
      },
    ],
    related: relatedVtc({ href: "./assurance-vtc-franchise-garanties-2026.html", label: "Franchise & garanties" }),
    faq: [
      {
        q: "Quel budget mensuel typique ?",
        a: "Ça dépend du véhicule, de l’âge, des antécédents et de la zone. Un devis personnalisé vaut mieux qu’un « prix moyen » trompeur.",
      },
      {
        q: "Puis-je payer au mois ?",
        a: "Souvent oui (fractionnement). Vérifiez frais de fractionnement et date d’échéance.",
      },
    ],
  },
  {
    file: "assurance-vtc-vehicule-electrique-hybride-2026.html",
    section: "vtc",
    tag: "VTC électrique",
    tagClass: "tag-vtc",
    themes: ["vtc", "electrique", "hybride"],
    title: "Assurance VTC véhicule électrique ou hybride 2026 : ce qui change",
    description:
      "Tesla, hybride rechargeable, Zoe en VTC : valeur à neuf, batterie, assistance dépannage. Comment assurer un VTC électrifié sans mauvaise surprise.",
    meta: "9 min · Septembre 2026",
    cardExcerpt: "VTC électrique / hybride : valeur, batterie, assistance — points à vérifier.",
    keywords: [
      "assurance vtc electrique",
      "assurance vtc tesla",
      "assurance vtc hybride",
      "vtc batterie assurance",
      "chauffeur uber voiture electrique assurance",
    ],
    cta: CTA_VTC,
    blocks: [
      {
        type: "p",
        text:
          "De plus en plus de chauffeurs passent à l’<strong>électrique ou l’hybride</strong> (économies carburant, critères plateformes, ZFE). Le contrat VTC doit coller à la <strong>valeur du véhicule</strong> et aux spécificités batterie / dépannage. <a href=\"" +
          landing("vtc", "", "vtc-ev-intro") +
          "\"><strong>Devis VTC électrifié</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Valeur à neuf et indemnisation" },
      {
        type: "p",
        text: "Un VE se déprécie autrement qu’un thermique. Vérifiez la durée de <strong>valeur à neuf</strong>, le mode d’indemnisation (valeur de remplacement) et si la batterie est bien couverte en cas de sinistre total.",
      },
      { type: "h2", text: "2. Assistance : dépannage adapté" },
      {
        type: "ul",
        items: [
          "Remorquage vers borne / garage agréé",
          "Véhicule de remplacement (thermique ou VE selon contrat)",
          "Panne batterie 0 km — lire les exclusions",
        ],
      },
      { type: "h2", text: "3. RC pro : inchangée sur le principe" },
      {
        type: "p",
        text:
          "Électrique ou non, vous transportez des personnes : la <strong>RC pro VTC</strong> reste obligatoire. Voir <a href=\"./assurance-vtc-rc-pro-garanties.html\">garanties RC pro</a>. <a href=\"" +
          VTC_QUEST +
          "\">Questionnaire VTC</a>.",
      },
      { type: "bridge" },
    ],
    related: relatedVtc(),
    faq: [
      {
        q: "Tesla en VTC : plus cher à assurer ?",
        a: "Souvent oui (valeur, pièces, sinistralité). Un comparatif multi-partenaires évite de surpayer.",
      },
      {
        q: "La batterie est-elle toujours couverte ?",
        a: "Pas automatiquement de la même façon partout. Demandez la fiche produit et les exclusions écrites.",
      },
    ],
  },
  {
    file: "assurance-vtc-temps-partiel-deuxieme-activite-2026.html",
    section: "vtc",
    tag: "VTC temps partiel",
    tagClass: "tag-vtc",
    themes: ["vtc", "temps-partiel", "micro"],
    title: "VTC à temps partiel ou 2ᵉ activité : quelle assurance en 2026 ?",
    description:
      "Salarié + VTC le week-end, micro-entreprise à côté : comment assurer sans mentir sur l’usage et rester conforme Uber/Bolt.",
    meta: "8 min · Septembre 2026",
    cardExcerpt: "VTC secondaire : déclarer le bon usage pour rester assuré et connecté.",
    keywords: [
      "assurance vtc temps partiel",
      "vtc seconde activite",
      "assurance uber week end",
      "vtc micro entreprise salarie",
      "cumul emploi vtc assurance",
    ],
    cta: CTA_VTC,
    blocks: [
      {
        type: "p",
        text:
          "Beaucoup démarrent le VTC en <strong>complément</strong> (week-ends, soirs). L’erreur fréquente : garder une auto perso et « activer Uber ». Sans contrat <strong>usage pro / VTC</strong>, vous n’êtes pas couvert — et la plateforme peut exiger une attestation. <a href=\"" +
          landing("vtc", "", "vtc-partiel-intro") +
          "\"><strong>Déclarer mon activité partielle</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Dire la vérité sur le kilométrage et l’usage" },
      {
        type: "p",
        text: "Les assureurs tarient selon <strong>usage déclaré</strong>. Sous-déclarer pour payer moins = risque de refus de garantie. Indiquez courses occasionnelles vs plein temps : des formules existent pour démarrer.",
      },
      { type: "h2", text: "2. Micro-entreprise + salariat" },
      {
        type: "p",
        text: "Le statut (micro, EI) se gère avec l’URSSAF / impôts ; l’assurance, elle, regarde le <strong>risque véhicule + transport de personnes</strong>. On ne remplace pas votre expert-comptable : on aligne le contrat sur votre réalité de courses.",
      },
      { type: "h2", text: "3. Passage à plein temps plus tard" },
      {
        type: "p",
        text:
          "Prévenez quand le volume augmente : avenant ou nouveau devis. Voir aussi <a href=\"./assurance-vtc-creation-chauffeur.html\">création d’activité</a>. <a href=\"" +
          quest("vtc", "vtc-partiel-quest") +
          "\">Questionnaire VTC</a>.",
      },
      { type: "bridge" },
    ],
    related: relatedVtc({ href: "./assurance-vtc-creation-chauffeur.html", label: "Création chauffeur VTC" }),
    faq: [
      {
        q: "Puis-je assurer seulement le week-end ?",
        a: "Le contrat couvre en général la période d’assurance, pas « samedi-dimanche » isolé. En revanche le tarif peut refléter un usage secondaire déclaré.",
      },
      {
        q: "Mon assureur auto perso refuse le VTC ?",
        a: "Normal. Il faut un produit VTC / transport de personnes. On compare les partenaires adaptés.",
      },
    ],
  },
  {
    file: "changer-assurance-vtc-loi-hamon-documents-2026.html",
    section: "vtc",
    tag: "Changer d’assurance VTC",
    tagClass: "tag-vtc",
    themes: ["vtc", "resiliation", "hamon"],
    title: "Changer d’assurance VTC en 2026 : loi Hamon, documents, sans coupure Uber",
    description:
      "Résilier / changer d’assurance VTC sans perdre l’accès aux plateformes : échéance, loi Hamon, attestation, checklist documents.",
    meta: "9 min · Septembre 2026",
    cardExcerpt: "Changer d’assureur VTC sans coupure plateforme — checklist Hamon.",
    keywords: [
      "changer assurance vtc",
      "resilier assurance vtc",
      "loi hamon vtc",
      "attestation assurance uber",
      "renouvellement assurance vtc",
    ],
    cta: CTA_VTC,
    blocks: [
      {
        type: "p",
        text:
          "Prime qui flambe à l’échéance, franchise trop haute, mauvaises exclusions : vous voulez <strong>changer d’assurance VTC</strong> — sans jour de trou qui coupe Uber ou Bolt. Voici le mode d’emploi. <a href=\"" +
          landing("vtc", "", "vtc-hamon-intro") +
          "\"><strong>Comparer avant de résilier</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ne résiliez pas avant d’avoir le nouveau contrat" },
      {
        type: "p",
        text: "Ordre : devis signé → attestation émise → puis résiliation / bascule. Sinon risque de <strong>non-assurance</strong> et de suspension plateforme. Complément : <a href=\"./assurance-vtc-renouvellement-resiliation.html\">renouvellement &amp; résiliation</a>.",
      },
      { type: "h2", text: "2. Loi Hamon et échéance" },
      {
        type: "p",
        text: "Après un an, la <strong>résiliation infra-annuelle</strong> (Hamon) est souvent possible sur les contrats concernés. Votre nouvel assureur / courtier peut gérer la résiliation. Vérifiez les délais d’envoi d’attestation aux plateformes.",
      },
      { type: "h2", text: "3. Checklist documents" },
      {
        type: "ul",
        items: [
          "Attestation actuelle + conditions particulières",
          "Relevé d’informations (sinistres)",
          "Carte grise, carte VTC, permis",
          "SIRET / KBIS selon statut",
        ],
      },
      {
        type: "p",
        text:
          "<a href=\"" +
          quest("vtc", "vtc-hamon-quest") +
          "\">Lancer mon changement d’assurance VTC</a> · <a href=\"" +
          landing("vtc", "", "vtc-hamon-cta") +
          "\">devis comparatif</a>.",
      },
      { type: "bridge" },
    ],
    related: relatedVtc({ href: "./assurance-vtc-renouvellement-resiliation.html", label: "Renouvellement / résiliation" }),
    faq: [
      {
        q: "Uber accepte-t-il tous les assureurs ?",
        a: "Ils exigent des garanties minimales et une attestation valide. On vise des partenaires connus du marché VTC.",
      },
      {
        q: "Combien de jours avant l’échéance ?",
        a: "Idéalement 3–4 semaines pour comparer, souscrire et uploader la nouvelle attestation.",
      },
    ],
  },
  {
    file: "devis-assurance-vtc-rappel-15-min-courtier-orias.html",
    section: "vtc",
    tag: "Devis VTC",
    tagClass: "tag-vtc",
    themes: ["vtc", "devis", "conversion"],
    title: "Devis assurance VTC en 15 min : courtier ORIAS, gratuit, sans engagement",
    description:
      "Besoin d’un devis VTC rapide ? Questionnaire, rappel ~15 min, comparaison partenaires. Courtier ORIAS Leads Opportunities — France.",
    meta: "6 min · Septembre 2026",
    cardExcerpt: "Devis VTC gratuit : questionnaire + rappel rapide par courtier ORIAS.",
    keywords: [
      "devis assurance vtc",
      "devis vtc gratuit",
      "courtier assurance vtc",
      "rappel assurance vtc",
      "comparer assurance vtc",
      "orias vtc",
    ],
    cta: { href: landing("vtc", "", "vtc-devis-rapide"), label: "Obtenir mon devis VTC" },
    blocks: [
      {
        type: "p",
        text:
          "Vous cherchez un <strong>devis assurance VTC</strong> clair, sans call-center opaque ? Chez <strong>Leads Opportunities</strong> (courtier ORIAS), le parcours est court : questionnaire → rappel → comparaison. <a href=\"" +
          landing("vtc", "", "vtc-devis-hero") +
          "\"><strong>Démarrer mon devis</strong></a> · <a href=\"" +
          quest("vtc", "vtc-devis-quest") +
          "\">questionnaire VTC</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que vous obtenez" },
      {
        type: "ul",
        items: [
          "Lecture de votre usage (IDF, province, plateformes, VE ou thermique)",
          "Comparaison de formules RC pro + véhicule",
          "Explication franchises et exclusions en français",
          "Attestation pour Uber / Bolt / Heetch quand le contrat est en place",
        ],
      },
      { type: "h2", text: "2. Gratuit et sans engagement" },
      {
        type: "p",
        text: "Le devis est <strong>gratuit</strong>. Vous ne signez que si la proposition vous convient. Pas de pression : l’objectif est un contrat conforme et compréhensible.",
      },
      { type: "h2", text: "3. Autres besoins du même foyer ?" },
      {
        type: "p",
        text:
          "Mutuelle, auto perso, habitation : on peut enchaîner après le VTC. <a href=\"" +
          landing("vtc", "", "vtc-devis-cta") +
          "\"><strong>Je veux mon devis VTC maintenant</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: relatedVtc(
      { href: "./assurance-vtc-ile-de-france-paris-cdg-orly-2026.html", label: "VTC Île-de-France" },
      { href: "./vtc-premiere-course-checklist-assurance.html", label: "Checklist 1ʳᵉ course" }
    ),
    faq: [
      {
        q: "C’est vraiment gratuit ?",
        a: "Oui pour l’étude et le devis. La rémunération courtier intervient si vous souscrivez via nos partenaires, selon les règles ORIAS.",
      },
      {
        q: "Vous couvrez toute la France ?",
        a: "Oui. L’Île-de-France est très demandée, mais les devis province sont tout aussi possibles.",
      },
    ],
  },

  /* ——— Autres produits (promo croisée) ——— */
  {
    file: "mutuelle-sante-comparer-avant-renouvellement-2026.html",
    section: "sante",
    tag: "Mutuelle",
    tagClass: "tag-sante",
    themes: ["mutuelle", "sante", "renouvellement"],
    title: "Mutuelle santé 2026 : comparez avant le renouvellement (et évitez la hausse)",
    description:
      "Hausse de mutuelle à l’échéance ? 5 points à vérifier (optique, dentaire, délais) avant de reconduire. Devis gratuit courtier ORIAS.",
    meta: "8 min · Septembre 2026",
    cardExcerpt: "Avant de reconduire votre mutuelle : comparez garanties et prix.",
    keywords: [
      "comparer mutuelle 2026",
      "hausse mutuelle renouvellement",
      "changer mutuelle avant echeance",
      "devis mutuelle sante",
      "mutuelle optique dentaire",
    ],
    cta: { href: landing("sante", "", "mutuelle-renouv"), label: "Comparer ma mutuelle" },
    blocks: [
      {
        type: "p",
        text:
          "Votre mutuelle annonce une <strong>hausse</strong> ou un changement de garanties ? Ne signez pas en mode automatique. Un comparatif ciblé (foyer, optique, dentaire, hospitalisation) suffit souvent à retrouver un meilleur équilibre. <a href=\"" +
          landing("sante", "", "mutuelle-intro") +
          "\"><strong>Comparer ma mutuelle</strong></a> · <a href=\"" +
          quest("sante", "mutuelle-quest") +
          "\">questionnaire santé</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Relire la fiche garanties (pas seulement le prix)" },
      {
        type: "p",
        text: "Optique, dentaire, audiologie, forfait hospit : ce sont les postes qui font la différence. Guide : <a href=\"./mutuelle-sante-5-criteres.html\">5 critères pour choisir</a> · <a href=\"./mutuelle-remboursement-optique-dentaire-2026.html\">optique &amp; dentaire</a>.",
      },
      { type: "h2", text: "2. Timing résiliation" },
      {
        type: "p",
        text: "Selon le contrat (loi Chatel, infra-annuelle santé), les délais changent. On vous indique la marche à suivre <strong>après</strong> avoir un devis de remplacement.",
      },
      {
        type: "p",
        text:
          "<a href=\"" +
          landing("sante", "", "mutuelle-cta") +
          "\"><strong>Obtenir mon devis mutuelle</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./mutuelle-sante-5-criteres.html", label: "5 critères mutuelle" },
      { href: "./inflation-mutuelle-hausse-2026.html", label: "Hausse mutuelle 2026" },
      { href: "../landings/sante.html", label: "Landing mutuelle" },
    ],
    faq: [
      {
        q: "Puis-je changer en cours d’année ?",
        a: "Souvent oui selon le type de contrat. On vérifie votre cas avant de résilier.",
      },
    ],
  },
  {
    file: "credit-immobilier-courtier-accompagnement-2026.html",
    section: "finance",
    tag: "Crédit immo",
    tagClass: "tag-immo",
    themes: ["credit", "pret", "immo"],
    title: "Crédit immobilier 2026 : se faire accompagner par un courtier (sans stress)",
    description:
      "Taux, assurance emprunteur, dossier banque : pourquoi un courtier ORIAS clarifie le parcours crédit. Étude gratuite, multi-banques.",
    meta: "9 min · Septembre 2026",
    cardExcerpt: "Crédit immo : courtier pour comparer banques et assurance emprunteur.",
    keywords: [
      "courtier credit immobilier",
      "accompagnement pret immobilier",
      "comparer taux credit immo",
      "assurance emprunteur courtier",
      "etude credit immobilier gratuite",
    ],
    cta: {
      href: landing("credit", "", "credit-intro"),
      label: "Étude crédit immobilière",
    },
    blocks: [
      {
        type: "p",
        text:
          "Un <strong>prêt immobilier</strong>, ce n’est pas qu’un taux affiché. Endettement HCSF, apport, assurance emprunteur (loi Lemoine), conditions suspensives : un accompagnement évite les allers-retours inutiles. <a href=\"" +
          landing("credit", "", "credit-hero") +
          "\"><strong>Demander une étude crédit</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qu’on compare pour vous" },
      {
        type: "ul",
        items: [
          "Offres bancaires selon votre profil",
          "Assurance emprunteur (délégation possible)",
          "Durée, mensualité, coût total indicatif",
          "Cas particuliers : <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">prêt refusé</a>",
        ],
      },
      { type: "h2", text: "2. Tunnel bien → projection → crédit" },
      {
        type: "p",
        text:
          "Vous achetez ? Enchaînez <a href=\"../landings/acheteur-immo.html\">recherche / dépôt</a>, <a href=\"../landings/projection-achat.html\">projection de coût</a>, puis crédit. <a href=\"" +
          landing("credit", "", "credit-cta") +
          "\"><strong>Parler de mon projet</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé" },
      { href: "../landings/credit-immo.html", label: "Landing crédit" },
    ],
    faq: [
      {
        q: "L’étude est-elle payante ?",
        a: "L’étude de faisabilité / orientation est gratuite dans notre parcours. Les frais éventuels sont expliqués avant engagement.",
      },
    ],
  },
  {
    file: "assurance-voiture-sans-permis-devis-rapide-2026.html",
    section: "vsp",
    tag: "Voiture sans permis",
    tagClass: "tag-actu",
    themes: ["vsp", "mobilite"],
    title: "Assurance voiture sans permis : devis rapide 2026 (Aixam, Ligier, Ami)",
    description:
      "VSP / quadricycle : devis assurance adapté permis AM. Aixam, Ligier, Microcar, Citroën Ami. Courtier ORIAS, questionnaire court.",
    meta: "7 min · Septembre 2026",
    cardExcerpt: "VSP : devis assurance spécialisé — pas une auto classique.",
    keywords: [
      "devis assurance voiture sans permis",
      "assurance vsp devis",
      "assurance aixam",
      "assurance citroen ami",
      "assurance sans permis rapide",
    ],
    cta: { href: landing("vsp", "", "vsp-devis"), label: "Devis voiture sans permis" },
    blocks: [
      {
        type: "p",
        text:
          "Une <strong>voiture sans permis</strong> se tarife mal avec un contrat auto standard. Produits spécialisés, âge 16 ans+, permis AM : on compare pour vous. <a href=\"" +
          landing("vsp", "", "vsp-intro") +
          "\"><strong>Obtenir mon devis VSP</strong></a> · <a href=\"./assurance-voiture-sans-permis-guide-2026.html\">guide complet</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Marques couvertes" },
      {
        type: "p",
        text: "Aixam, Ligier, Microcar, Citroën Ami et autres quadricycles légers. Voir <a href=\"./assurance-aixam-ligier-microcar-voiture-sans-permis.html\">marques VSP</a>.",
      },
      {
        type: "p",
        text:
          "<a href=\"" +
          quest("vsp", "vsp-quest") +
          "\">Questionnaire VSP</a> · <a href=\"" +
          landing("vsp", "", "vsp-cta") +
          "\">devis VSP</a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-voiture-sans-permis-guide-2026.html", label: "Guide VSP 2026" },
      { href: "./tarif-assurance-voiture-sans-permis-2026.html", label: "Tarifs VSP" },
      { href: "../landings/vsp.html", label: "Landing VSP" },
    ],
    faq: [
      {
        q: "Dès quel âge ?",
        a: "Conduite possible plus tôt selon permis AM ; souscription partenaire souvent dès 16 ans.",
      },
    ],
  },
];
