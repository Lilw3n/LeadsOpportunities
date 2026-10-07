/**
 * Pack articles orientés pub Meta (CRM /crm-blog-pubs.html).
 * Auto + habitation + emprunteur — CTA landings UTM blog.
 */
var UTM = "utm_source=blog&utm_medium=article&utm_campaign=pubs_pack";

function devis(need, content) {
  var base =
    need === "auto"
      ? "../landings/devis.html?need=auto"
      : need === "habitation"
        ? "../landings/devis.html?need=habitation"
        : need === "credit"
          ? "../landings/credit-immo.html"
          : "../landings/questionnaire.html?need=" + need;
  var sep = base.indexOf("?") >= 0 ? "&" : "?";
  return base + sep + UTM + (content ? "&utm_content=" + content : "");
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

module.exports = [
  {
    file: "assurance-auto-tarifs-2026-comparer-sans-surpayer.html",
    section: "auto",
    tag: "Auto",
    tagClass: "tag-auto",
    themes: ["auto", "tarifs", "comparer"],
    title: "Assurance auto 2026 : comparez les tarifs sans surpayer (guide clair)",
    description:
      "Tarifs auto en hausse ? Bonus, usage, franchise, options inutiles : comment comparer vraiment et obtenir un devis courtier ORIAS.",
    meta: "8 min · Octobre 2026",
    cardExcerpt: "Auto trop chère ? Comparez garanties et prix avant de reconduire.",
    keywords: [
      "assurance auto tarifs 2026",
      "comparer assurance auto",
      "assurance auto moins cher",
      "devis assurance auto",
      "hausse assurance auto",
    ],
    cta: { href: devis("auto", "auto-tarifs"), label: "Devis assurance auto" },
    blocks: [
      {
        type: "p",
        text:
          "Votre <strong>assurance auto</strong> augmente encore en 2026 ? Avant de reconduire, comparez à garanties équivalentes : usage réel, bonus, franchise et options. Courtier ORIAS — <a href=\"" +
          devis("auto", "auto-tarifs-hero") +
          "\"><strong>demander un devis auto</strong></a> · <a href=\"" +
          quest("auto", "auto-tarifs-quest") +
          "\">questionnaire auto</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi les tarifs bougent" },
      {
        type: "p",
        text: "Coût des pièces, sinistralité, inflation des réparations : les primes suivent. Votre profil (jeune conducteur, malus, véhicule puissant, parking rue) pèse autant que le « prix moyen » affiché en pub.",
      },
      { type: "h2", text: "2. Ce qu’il faut aligner avant de comparer" },
      {
        type: "ul",
        items: [
          "Kilométrage et usage (trajet travail, loisirs, VTC perso interdit)",
          "Formule : tiers, tiers étendu, tous risques",
          "Franchise bris de glace / collision — trop basse = prime plus haute",
          "Options (assistance 0 km, véhicule de prêt) vraiment utiles",
          "Conducteurs secondaires déclarés",
        ],
      },
      { type: "h2", text: "3. Pièges à éviter" },
      {
        type: "ul",
        items: [
          "Comparer uniquement le prix mensuel sans lire les exclusions",
          "Sous-déclarer un conducteur ou un usage professionnel",
          "Rester chez le même assureur par habitude sans devis concurrent",
        ],
      },
      {
        type: "p",
        text:
          "Loi Hamon : après un an, vous pouvez souvent résilier plus facilement. Voir aussi <a href=\"./assurance-auto-resilier-loi-hamon-comparer-2026.html\">résilier et comparer avec Hamon</a>. <a href=\"" +
          devis("auto", "auto-tarifs-cta") +
          "\"><strong>Obtenir mon devis auto</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-auto-jeune-conducteur-2026.html", label: "Jeune conducteur" },
      { href: "./assurance-auto-resilier-loi-hamon-comparer-2026.html", label: "Résilier avec Hamon" },
      { href: "../landings/devis.html?need=auto", label: "Landing devis auto" },
    ],
    faq: [
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui. L’étude et le devis sont sans engagement ; vous ne changez que si la proposition vous convient.",
      },
      {
        q: "Faut-il tout risque ?",
        a: "Pas toujours. Véhicule ancien à faible côte : tiers étendu peut suffire. Véhicule récent ou crédit auto : tous risques souvent plus adapté.",
      },
    ],
  },
  {
    file: "assurance-auto-resilier-loi-hamon-comparer-2026.html",
    section: "auto",
    tag: "Auto · Hamon",
    tagClass: "tag-auto",
    themes: ["auto", "hamon", "resiliation"],
    title: "Résilier son assurance auto avec la loi Hamon et comparer en 2026",
    description:
      "Loi Hamon auto : après 12 mois, comment résilier, garder la couverture, et comparer un nouveau contrat sans trou de garantie.",
    meta: "7 min · Octobre 2026",
    cardExcerpt: "Hamon auto : changez d’assureur après 1 an sans galère.",
    keywords: [
      "resilier assurance auto hamon",
      "loi hamon auto",
      "changer assurance auto",
      "resiliation assurance auto",
      "comparer assurance auto hamon",
    ],
    cta: { href: devis("auto", "auto-hamon"), label: "Comparer mon auto" },
    blocks: [
      {
        type: "p",
        text:
          "La <strong>loi Hamon</strong> permet, en principe après un an de contrat, de <strong>résilier son assurance auto</strong> plus simplement pour en souscrire une autre. L’essentiel : enchaîner sans interruption de garantie. <a href=\"" +
          devis("auto", "auto-hamon-hero") +
          "\"><strong>Comparer maintenant</strong></a> · <a href=\"" +
          quest("auto", "auto-hamon-quest") +
          "\">questionnaire</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Quand Hamon s’applique" },
      {
        type: "p",
        text: "Après 12 mois, vous pouvez souvent demander la résiliation pour souscrire ailleurs. Le nouvel assureur peut parfois gérer les formalités. Vérifiez votre échéance et les conditions particulières.",
      },
      { type: "h2", text: "2. Checklist avant de partir" },
      {
        type: "ul",
        items: [
          "Relevé d’informations à jour (sinistres, bonus/malus)",
          "Attestation et conditions du contrat actuel",
          "Date de fin souhaitée = date de prise d’effet du nouveau contrat",
          "Carte grise et permis pour le devis",
        ],
      },
      { type: "h2", text: "3. Ne pas rester sans couverture" },
      {
        type: "p",
        text:
          "Rouler sans assurance est illégal et coûteux. Faites d’abord le devis, validez la souscription, puis résiliez. Guide tarifs : <a href=\"./assurance-auto-tarifs-2026-comparer-sans-surpayer.html\">comparer les tarifs auto 2026</a>. <a href=\"" +
          devis("auto", "auto-hamon-cta") +
          "\"><strong>Je veux un devis pour changer</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-auto-tarifs-2026-comparer-sans-surpayer.html", label: "Tarifs auto 2026" },
      { href: "./assurance-auto-jeune-conducteur-2026.html", label: "Jeune conducteur" },
    ],
    faq: [
      {
        q: "Puis-je résilier avant un an ?",
        a: "Hamon vise surtout après 12 mois. D’autres motifs (vente du véhicule, échéance annuelle…) peuvent s’appliquer selon votre contrat.",
      },
      {
        q: "Mon bonus est-il conservé ?",
        a: "Le bonus/malus suit le conducteur via le relevé d’informations. Déclarez correctement vos antécédents.",
      },
    ],
  },
  {
    file: "assurance-habitation-degat-des-eaux-que-faire-2026.html",
    section: "habitat",
    tag: "Habitation",
    tagClass: "tag-habitation",
    themes: ["habitation", "sinistre", "degat-eaux"],
    title: "Dégât des eaux : que faire et ce que couvre l’assurance habitation",
    description:
      "Fuite, infiltrations, voisinage : gestes d’urgence, déclaration, franchises MRH. Vérifiez votre contrat et demandez un devis si besoin.",
    meta: "8 min · Octobre 2026",
    cardExcerpt: "Dégât des eaux : gestes, déclaration, garanties MRH à vérifier.",
    keywords: [
      "degat des eaux assurance",
      "assurance habitation fuite",
      "declarer degat des eaux",
      "mrh degat des eaux",
      "devis assurance habitation",
    ],
    cta: { href: devis("habitation", "mrh-eaux"), label: "Devis habitation" },
    blocks: [
      {
        type: "p",
        text:
          "Un <strong>dégât des eaux</strong> arrive vite : joint défaillant, lave-linge, infiltration toiture, fuite chez le voisin. Votre <strong>MRH</strong> (multirisque habitation) intervient selon les garanties et franchises. <a href=\"" +
          devis("habitation", "mrh-eaux-hero") +
          "\"><strong>Vérifier / comparer mon habitation</strong></a> · <a href=\"" +
          quest("habitation", "mrh-eaux-quest") +
          "\">questionnaire</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Gestes immédiats" },
      {
        type: "ul",
        items: [
          "Couper l’eau et l’électricité si risque",
          "Limiter les dégâts (serpillères, bâches) sans vous mettre en danger",
          "Prévenir le voisin / syndic si immeuble",
          "Photographier avant de tout jeter",
          "Conserver factures d’urgence (plombier)",
        ],
      },
      { type: "h2", text: "2. Déclaration à l’assureur" },
      {
        type: "p",
        text: "Déclarez rapidement (souvent sous 5 jours ouvrés). Convention IRSI / CIDRE selon les cas entre assureurs. Locataire : prévenez aussi le propriétaire.",
      },
      { type: "h2", text: "3. Points de contrat à relire" },
      {
        type: "ul",
        items: [
          "Franchise dégât des eaux",
          "Recherche de fuite (prise en charge ou non)",
          "Biens mobiliers : plafonds et vétusté",
          "Responsabilité civile vie privée / voisinage",
        ],
      },
      {
        type: "p",
        text:
          "Contrat trop léger ou franchise trop haute ? <a href=\"" +
          devis("habitation", "mrh-eaux-cta") +
          "\"><strong>Demander un devis MRH</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-habitation-locataire-proprietaire-2026.html", label: "Locataire / proprio" },
      { href: "../landings/devis.html?need=habitation", label: "Landing devis habitation" },
    ],
    faq: [
      {
        q: "La recherche de fuite est-elle toujours remboursée ?",
        a: "Non. Beaucoup de contrats limitent ou excluent certaines recherches. Lisez les conditions particulières.",
      },
      {
        q: "Locataire ou propriétaire : qui déclare ?",
        a: "Chacun peut avoir à déclarer selon les dommages (mobilier locataire vs parties communes / bâtiment). En pratique : prévenir l’autre partie et les deux assureurs si besoin.",
      },
    ],
  },
  {
    file: "assurance-emprunteur-changer-economiser-2026.html",
    section: "finance",
    tag: "Emprunteur",
    tagClass: "tag-credit",
    themes: ["emprunteur", "lemoine", "credit"],
    title: "Changer d’assurance emprunteur en 2026 : économiser sans stress",
    description:
      "Loi Lemoine : changez d’assurance de prêt à tout moment à garanties équivalentes. Étude gratuite courtier ORIAS — économies possibles.",
    meta: "8 min · Octobre 2026",
    cardExcerpt: "Emprunteur : changez de contrat et visez des économies réelles.",
    keywords: [
      "changer assurance emprunteur",
      "loi lemoine 2026",
      "economiser assurance pret",
      "delegation assurance emprunteur",
      "devis assurance emprunteur",
    ],
    cta: { href: devis("credit", "emprunteur-change"), label: "Étude emprunteur" },
    blocks: [
      {
        type: "p",
        text:
          "Grâce à la <strong>loi Lemoine</strong>, vous pouvez en principe <strong>changer d’assurance emprunteur</strong> à tout moment, à garanties au moins équivalentes. L’enjeu : baisser le coût total du crédit sans bloquer la banque. <a href=\"" +
          devis("credit", "emprunteur-hero") +
          "\"><strong>Demander une étude</strong></a> · <a href=\"" +
          quest("credit", "emprunteur-quest") +
          "\">questionnaire crédit</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi ça peut rapporter gros" },
      {
        type: "p",
        text: "L’assurance groupe de la banque est pratique mais pas toujours la moins chère, surtout si vous êtes non-fumeur, cadre, ou si votre profil a évolué depuis la signature.",
      },
      { type: "h2", text: "2. Équivalence de garanties" },
      {
        type: "ul",
        items: [
          "Décès / PTIA",
          "ITT / IPT selon le prêt",
          "Quotités co-emprunteurs",
          "Exclusions et délais de carence",
        ],
      },
      { type: "h2", text: "3. Documents utiles" },
      {
        type: "ul",
        items: [
          "Tableau d’amortissement",
          "Conditions de l’assurance actuelle",
          "Questionnaire de santé si demandé (selon montant / règles en vigueur)",
        ],
      },
      {
        type: "p",
        text:
          "Aussi : <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">guide loi Lemoine</a>. <a href=\"" +
          devis("credit", "emprunteur-cta") +
          "\"><strong>Lancer mon étude emprunteur</strong></a>.",
      },
      { type: "bridge" },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé" },
      { href: "../landings/credit-immo.html", label: "Landing crédit immo" },
    ],
    faq: [
      {
        q: "La banque peut-elle refuser ?",
        a: "Elle peut exiger l’équivalence de garanties. Un refus sans motif valable sur ce point est contestable — on vous aide à constituer le dossier.",
      },
      {
        q: "Combien peut-on économiser ?",
        a: "Ça dépend de l’âge, du capital restant dû et du contrat actuel. L’étude chiffre l’écart avant toute signature.",
      },
    ],
  },
];
