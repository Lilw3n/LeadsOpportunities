/**
 * Pack assurance auto — tarifs agressifs / comparatif 2026 (blog → devis).
 */
var UTM = "utm_source=blog&utm_medium=article&utm_campaign=auto_tarifs_2026";
var LANDING =
  "../landings/devis.html?need=auto&" + UTM;
var QUEST =
  "../landings/questionnaire.html?need=auto&journey=standard&" + UTM;
var RAPPEL =
  "../landings/rappel.html?need=auto&" + UTM;
var CTA = { href: LANDING, label: "Comparer mon assurance auto" };

function p(text) {
  return { type: "p", text: text };
}
function h2(text) {
  return { type: "h2", text: text };
}
function ul(items) {
  return { type: "ul", items: items };
}
function bridge() {
  return { type: "bridge" };
}

module.exports = [
  {
    file: "assurance-auto-tarifs-fous-comparer-2026.html",
    section: "auto",
    tag: "Tarifs auto",
    tagClass: "tag-auto",
    themes: ["auto", "tarif", "comparatif"],
    title: "Assurance auto : des tarifs de fou en 2026 — comment comparer vraiment",
    description:
      "Primes auto qui explosent : bonus-malus, usage, franchises — comparer à garanties équivalentes et baisser la cotisation sans se sous-assurer.",
    meta: "8 min · Sept 2026",
    cardExcerpt: "Auto trop chère ? On compare les vrais postes, pas le prix affiché.",
    keywords: [
      "assurance auto moins cher 2026",
      "comparer assurance auto",
      "tarif assurance voiture",
      "baisser prime auto",
      "devis assurance auto gratuit",
    ],
    cta: CTA,
    blocks: [
      p(
        "Vous avez vu des <strong>tarifs d’assurance auto</strong> qui font tiquer — ou au contraire une offre « imbattable » trop belle pour être vraie. En 2026, les primes bougent selon sinistralité, pièce détachée, et usage déclaré. Le seul réflexe utile : <strong>comparer à garanties égales</strong>, pas au seul prix du mois. <a href=\"" +
          LANDING +
          "\"><strong>Devis auto gratuit</strong></a> · <a href=\"" +
          QUEST +
          "\">questionnaire 3 min</a>."
      ),
      bridge(),
      h2("1. Pourquoi les tarifs auto semblent « de fou »"),
      ul([
        "Coût des réparations et pièces en hausse",
        "Profil (jeune permis, sinistres, bonus-malus)",
        "Usage : trajets domicile-travail vs tous déplacements",
        "Options : bris de glace, assistance 0 km, véhicule de prêt",
      ]),
      p(
        "Un prix bas avec franchise élevée ou plafond assistance ridicule n’est pas une bonne affaire. Un prix haut peut cacher des garanties déjà payées deux fois (carte bancaire, contrat flotte). On aligne les postes : responsabilité civile, dommages, vol/incendie, assistance."
      ),
      h2("2. Les 5 leviers pour baisser sans se mettre à nu"),
      ul([
        "<strong>Kilométrage réel</strong> — ne surdéclarez pas",
        "<strong>Conducteurs désignés</strong> — évitez « tous conducteurs » si inutile",
        "<strong>Franchise</strong> — un cran plus haut si trésorerie OK",
        "<strong>Stationnement</strong> — garage / box déclaré correctement",
        "<strong>Regroupement</strong> — auto + habitation chez le même courtier parfois",
      ]),
      bridge(),
      h2("3. Comparer en 3 minutes (méthode courtier)"),
      p(
        "On part de votre avis d’échéance (ou capture mobile), on fixe le même niveau de garanties, puis on fait jouer la concurrence. <a href=\"" +
          RAPPEL +
          "\">Rappel sous 15 min</a> ou <a href=\"" +
          LANDING +
          "\">devis en ligne</a> — ORIAS, sans engagement."
      ),
      h2("4. Pièges à éviter"),
      ul([
        "Changer pour 5 €/mois en perdant le bonus affiché correctement",
        "Oublier le conducteur secondaire (conjoint, enfant)",
        "Souscrire « tiers » sur une voiture encore financée",
        "Ignorer la résidence fiscale / usage professionnel occasionnel",
      ]),
      p(
        "Courtier ORIAS : on vous dit clairement si l’économie est réelle. <a href=\"" +
          LANDING +
          "\"><strong>Comparer mon auto maintenant</strong></a>."
      ),
    ],
    related: [
      { href: CTA.href, label: CTA.label },
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus auto" },
      { href: "./assurance-auto-jeune-conducteur-2026.html", label: "Jeune conducteur" },
      { href: "../assurance-auto/", label: "Hub assurance auto" },
    ],
    faq: [
      {
        q: "Puis-je changer d’assurance auto en cours d’année ?",
        a: "Oui dans plusieurs cas (loi Hamon après 1 an, vente du véhicule, etc.). Un courtier vérifie le préavis et l’équivalence de garanties.",
      },
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui chez Leads Opportunities — devis et rappel sans engagement.",
      },
    ],
  },
  {
    file: "assurance-auto-resilier-comparer-hamon-2026.html",
    section: "auto",
    tag: "Résiliation auto",
    tagClass: "tag-auto",
    themes: ["auto", "hamon", "resiliation"],
    title: "Résilier son assurance auto pour payer moins : loi Hamon et mode d’emploi 2026",
    description:
      "Loi Hamon, échéance, vente du véhicule : comment résilier et basculer vers un meilleur tarif auto sans trou de garantie.",
    meta: "7 min · Sept 2026",
    cardExcerpt: "Trop cher ? Résilier proprement et comparer avant de signer.",
    keywords: [
      "résilier assurance auto",
      "loi Hamon auto",
      "changer assurance voiture",
      "résiliation infra-annuelle auto",
    ],
    cta: { href: QUEST, label: "Questionnaire auto (3 min)" },
    blocks: [
      p(
        "Votre prime a grimpé et vous voulez <strong>changer d’assureur auto</strong> sans stress. La <strong>loi Hamon</strong> permet souvent de résilier après un an, à tout moment, sous conditions. Avant : comparez. Après : attestation et date d’effet sans jour blanc. <a href=\"" +
          LANDING +
          "\">Comparer d’abord</a>."
      ),
      bridge(),
      h2("1. Quand peut-on résilier ?"),
      ul([
        "Après 12 mois : résiliation infra-annuelle (Hamon) dans la plupart des cas",
        "À l’échéance annuelle (loi Chatel — avis d’échéance)",
        "Vente / destruction du véhicule",
        "Changement de situation (déménagement, mariage…) selon contrat",
      ]),
      h2("2. Ordre des opérations (pour ne pas rester sans couverture)"),
      ul([
        "1. Obtenir un devis concurrent à garanties équivalentes",
        "2. Signer le nouveau contrat avec date d’effet claire",
        "3. Faire résilier l’ancien (souvent le nouvel assureur s’en charge)",
        "4. Garder l’attestation et le relevé d’informations",
      ]),
      bridge(),
      h2("3. Documents utiles"),
      p(
        "Relevé d’informations, avis d’échéance, carte grise, permis. Plus le dossier est propre, plus le tarif est juste. <a href=\"" +
          RAPPEL +
          "\">Demander un rappel</a>."
      ),
    ],
    related: [
      { href: "./assurance-auto-tarifs-fous-comparer-2026.html", label: "Tarifs auto 2026" },
      { href: "./assurance-auto-bonus-malus.html", label: "Bonus-malus" },
      { href: "../assurance-auto/", label: "Hub auto" },
      { href: LANDING, label: "Devis auto" },
    ],
    faq: [
      {
        q: "Dois-je écrire moi-même la résiliation ?",
        a: "Souvent le nouvel assureur / courtier s’occupe de la résiliation Hamon. Vérifiez toujours la date d’effet.",
      },
    ],
  },
  {
    file: "assurance-auto-tous-risques-ou-tiers-2026.html",
    section: "auto",
    tag: "Tous risques",
    tagClass: "tag-auto",
    themes: ["auto", "tous-risques", "tiers"],
    title: "Auto tous risques ou au tiers en 2026 : que choisir selon l’âge du véhicule ?",
    description:
      "Tiers, tiers + , tous risques : arbitrage valeur vénale, crédit auto, franchise — guide courtier 2026.",
    meta: "7 min · Sept 2026",
    cardExcerpt: "Tiers vs tous risques : le bon niveau pour votre voiture.",
    keywords: [
      "assurance tous risques ou tiers",
      "assurance auto au tiers",
      "tous risques voiture ancienne",
      "formule assurance auto 2026",
    ],
    cta: CTA,
    blocks: [
      p(
        "Une voiture neuve ou en crédit = souvent <strong>tous risques</strong>. Une citadine de 12 ans sans prêt = parfois <strong>tiers étendu</strong> suffit. Le critère : valeur du véhicule vs coût annuel des garanties dommages. <a href=\"" +
          LANDING +
          "\">Simuler les deux formules</a>."
      ),
      bridge(),
      h2("Tiers simple"),
      p("RC obligatoire + défense pénale souvent. Pas de dommages sur votre propre véhicule (sauf options)."),
      h2("Tiers + (vol, incendie, bris de glace…)"),
      p("Bon compromis si la cote est moyenne et que vous voulez vol / incendie / vitre."),
      h2("Tous risques"),
      p(
        "Dommages tous accidents, y compris responsable. Utile si valeur élevée, leasing, ou petit bonus encore fragile. Attention aux franchises."
      ),
      bridge(),
      p(
        "On calcule le vrai coût : prime + franchise × sinistres probables. <a href=\"" +
          QUEST +
          "\">Questionnaire auto</a> · <a href=\"" +
          LANDING +
          "\">devis</a>."
      ),
    ],
    related: [
      { href: "./assurance-auto-tarifs-fous-comparer-2026.html", label: "Comparer les tarifs" },
      { href: "./assurance-auto-jeune-conducteur-2026.html", label: "Jeune conducteur" },
      { href: "../assurance-auto/", label: "Hub auto" },
    ],
    faq: [
      {
        q: "Le crédit auto impose-t-il le tous risques ?",
        a: "Souvent oui (organisme de financement). Vérifiez le contrat de prêt avant de passer au tiers.",
      },
    ],
  },
  {
    file: "assurance-auto-malus-sinistre-que-faire-2026.html",
    section: "auto",
    tag: "Malus / sinistre",
    tagClass: "tag-auto",
    themes: ["auto", "malus", "sinistre"],
    title: "Malus auto après sinistre : que faire pour retrouver un tarif correct ?",
    description:
      "Coefficient bonus-malus dégradé, résiliation pour sinistre : pistes pour se réassurer et lisser le coût.",
    meta: "6 min · Sept 2026",
    cardExcerpt: "Malus ou sinistre : on trouve des solutions assureur.",
    keywords: [
      "malus assurance auto",
      "assurance après sinistre",
      "coefficient bonus malus",
      "réassurance malussé",
    ],
    cta: { href: RAPPEL, label: "Rappel auto — dossier malus" },
    blocks: [
      p(
        "Un <strong>malus</strong> ou plusieurs sinistres font exploser les devis. Ce n’est pas une fin de parcours : relevé d’informations à jour, période sans sinistre, et assureurs spécialisés. <a href=\"" +
          RAPPEL +
          "\">Exposer votre cas en 15 min</a>."
      ),
      bridge(),
      h2("Comprendre le coefficient"),
      p(
        "Le CRM / bonus-malus évolue chaque année sans sinistre responsable. Un sinistre responsable augmente le coefficient — l’effet se dilue avec le temps si vous restez clean."
      ),
      h2("Ce qu’un courtier regarde"),
      ul([
        "Nature des sinistres (matériel, corporel, responsable ou non)",
        "Ancienneté du permis et usage",
        "Valeur et puissance du véhicule",
        "Possibilité de franchises plus hautes pour baisser la prime",
      ]),
      bridge(),
      p(
        "Évitez les comparateurs qui refusent automatiquement les profils malussés : un humain ORIAS ouvre d’autres portes. <a href=\"" +
          LANDING +
          "\">Devis auto</a>."
      ),
    ],
    related: [
      { href: "./assurance-auto-bonus-malus.html", label: "Guide bonus-malus" },
      { href: "./assurance-auto-tarifs-fous-comparer-2026.html", label: "Tarifs auto" },
      { href: "../assurance-auto/", label: "Hub auto" },
    ],
    faq: [
      {
        q: "Suis-je inassurable avec un gros malus ?",
        a: "Rarement. Le tarif est plus élevé, mais des solutions existent. Contactez un courtier avec votre relevé d’informations.",
      },
    ],
  },
];
