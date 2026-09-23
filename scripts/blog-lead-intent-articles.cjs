/**
 * Articles intent Google → leads chauds (immo, crédit, vendeur, chasseur).
 * Requêtes précises, actu août/rentrée 2026 + longue traîne peu couverte.
 */
module.exports = [
  {
    file: "heritiers-pas-daccord-prix-vente-maison-que-faire.html",
    section: "finance",
    tag: "Succession",
    tagClass: "tag-immo",
    themes: ["succession", "heritage", "vendeur"],
    title: "Héritiers pas d'accord sur le prix de vente : que faire ? (guide 2026)",
    description:
      "Plusieurs héritiers, indivision, désaccord sur le prix ou le calendrier : comment vendre sans brader. Estimation, notaire, médiation — plan concret.",
    meta: "11 min · Août 2026",
    cardExcerpt: "Héritiers en désaccord : vendre sans se déchirer ni brader.",
    keywords: [
      "héritiers pas d'accord prix vente",
      "indivision vente maison désaccord",
      "succession plusieurs héritiers vendre",
      "héritiers ne veulent pas vendre",
      "prix vente succession indivision",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=heritiers-desaccord", label: "Parler de ma succession à vendre" },
    blocks: [
      {
        type: "p",
        text: "Vous héritez d'une <strong>maison ou d'un appartement</strong> avec d'autres héritiers — frères, sœurs, cousins, neveux — et <strong>personne ne tombe d'accord sur le prix</strong> ? L'un veut vendre vite, l'autre attend, un troisième trouve l'estimation trop basse. Ce n'est pas rare : c'est même l'une des situations les plus stressantes de l'<strong>indivision successorale</strong>. Avant de baisser le prix « pour en finir », voici un plan. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=heritiers-desaccord\"><strong>Décrire ma situation de vente</strong></a> · <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">guide vente 3D</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Qui peut vraiment signer la vente ?" },
      {
        type: "p",
        text: "Sans cadre juridique clair, toute discussion sur le prix est vaine. Le <strong>notaire</strong> vérifie les parts, les éventuels testaments, les indivisions. Parfois un seul héritier peut bloquer ; parfois une majorité suffit selon les statuts ou la procédure. <strong>Ne mettez pas en vente</strong> tant que ce point n'est pas tranché.",
      },
      { type: "h2", text: "2. Une estimation neutre (pas celle du plus pressé)" },
      {
        type: "p",
        text: "Chacun a « son » prix dans la tête — souvent influencé par des souvenirs ou une urgence financière. Faites réaliser une <strong>estimation argumentée</strong> (comparables, état du bien, DPE, travaux). C'est la base pour discuter calmement. Voir aussi <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">impact DPE G sur la vente</a>.",
      },
      { type: "h2", text: "3. Alternatives à la vente immédiate" },
      {
        type: "ul",
        items: [
          "Un héritier rachète les parts des autres (avec financement)",
          "Location temporaire en attendant l'accord",
          "Vente en viager si un profil convient — <a href=\"./viager-occupe-libre-bouquet-rente-2026.html\">guide viager</a>",
          "Médiation familiale ou judiciaire en dernier recours",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "4. Notre rôle : coordonner sans forcer" },
      {
        type: "p",
        text: "Nous ne remplaçons pas le notaire. On peut <strong>documenter l'estimation</strong>, organiser les visites quand le cadre le permet, et recroiser avec des acquéreurs — sans promettre un mandat ni imposer un prix. L'objectif : que chaque partie comprenne le marché réel, pas qu'on vende dans la colère. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=heritiers-coordination\">Déposer le bien à vendre</a> · <a href=\"../landings/chasseur-bien.html?utm_content=heritiers-signalement\">signaler un bien (chasseur)</a>.",
      },
    ],
    related: [
      { href: "./vente-immobiliere-3d-divorce-deces-demenagement.html", label: "Vente 3D et situations complexes" },
      { href: "./sci-familiale-vendre-dissoudre-heritiers-2026.html", label: "SCI familiale" },
      { href: "../landings/credit-immo.html", label: "Crédit si un héritier rachète" },
    ],
    faq: [
      {
        q: "Un héritier peut-il bloquer la vente ?",
        a: "Oui, selon l'indivision et les parts. Le notaire précise les règles : parfois une vente judiciaire est la seule issue.",
      },
      {
        q: "Faut-il baisser le prix pour que tout le monde signe ?",
        a: "Pas systématiquement. Une estimation neutre et des alternatives (rachat de parts) évitent souvent le bradage.",
      },
      {
        q: "Combien de temps dure une vente en succession ?",
        a: "De quelques mois à plus d'un an selon le notaire, les héritiers et l'état du bien. La précipitation coûte cher.",
      },
    ],
  },
  {
    file: "divorce-vente-maison-ex-conjoint-refuse-prix.html",
    section: "finance",
    tag: "Divorce",
    tagClass: "tag-immo",
    themes: ["divorce", "vendeur"],
    title: "Divorce : ex-conjoint refuse de vendre ou bloque le prix — solutions 2026",
    description:
      "Vente du bien commun après séparation : ex refuse de signer, désaccord sur le prix, crédit en cours. Avocat, notaire, calendrier — que faire.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Ex-conjoint bloque la vente : cadre juridique + coordination immo.",
    keywords: [
      "divorce vente maison ex refuse",
      "ex conjoint refuse vendre maison",
      "vente bien commun divorce désaccord",
      "divorce qui paie crédit maison",
      "vendre maison séparation sans accord",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=divorce-ex-refuse", label: "Parler de ma vente en divorce" },
    blocks: [
      {
        type: "p",
        text: "Après une <strong>séparation ou un divorce</strong>, la <strong>vente du bien commun</strong> devrait être simple — sauf quand l'ex <strong>refuse de vendre</strong>, bloque le prix ou traîne sur les signatures. Crédit en cours, enfants encore dans la maison, désaccord sur l'estimation : chaque semaine de blocage coûte (mensualités, charges, usure nerveuse). Voici comment avancer sans aggraver le conflit. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=divorce\"><strong>Décrire ma situation</strong></a> · <a href=\"../landings/credit-immo.html?utm_content=divorce-credit\">crédit &amp; co-emprunt</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Séparer le juridique de l'immobilier" },
      {
        type: "p",
        text: "L'<strong>avocat</strong> gère le divorce et le partage ; le <strong>notaire</strong> sécurise l'acte. Notre rôle n'est pas de trancher qui a raison — c'est de <strong>préparer la mise en vente</strong> quand le cadre le permet : estimation, acquéreurs, calendrier réaliste.",
      },
      { type: "h2", text: "2. Crédit immobilier : qui paie en attendant ?" },
      {
        type: "p",
        text: "Tant que le prêt court, les deux co-emprunteurs restent engagés. Anticipez le <strong>solde du crédit</strong>, les indemnités de remboursement anticipé et la répartition du prix de vente. Voir <a href=\"./pret-refuse-co-emprunteur-caution-solutions.html\">co-emprunteur et caution</a> si un nouveau projet est en vue.",
      },
      { type: "h2", text: "3. Si l'ex refuse catégoriquement" },
      {
        type: "ul",
        items: [
          "Ordonnance de vente judiciaire (dernier recours, long)",
          "Rachat de parts par l'un des ex (avec financement)",
          "Location d'un des lots si le bien est divisible — rare",
          "Médiation avant contentieux",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "Nous ne promettons pas de « forcer » l'ex à signer. On documente le marché, on recoupe acquéreur-vendeur quand les deux parties ou le juge ont fixé le cadre. <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">Guide complet divorce &amp; vente</a> · <a href=\"../landings/projection-achat.html?utm_content=divorce-rachat\">projection si vous rachetez seul</a>.",
      },
    ],
    related: [
      { href: "./vente-immobiliere-3d-divorce-deces-demenagement.html", label: "Les 3D de la vente" },
      { href: "../landings/credit-immo.html", label: "Dossier crédit" },
      { href: "./people-divorce-assurance-habitation-emprunteur.html", label: "Divorce & assurance emprunteur" },
    ],
    faq: [
      {
        q: "Puis-je vendre seul si je suis propriétaire à 50 % ?",
        a: "Non sans l'accord de l'autre indivisaire ou une décision de justice. Le notaire vous le confirme.",
      },
      {
        q: "L'ex habite encore le bien : peut-on visiter ?",
        a: "Souvent oui avec accord ou procédure. Les visites se organisent sans escalade — c'est sensible.",
      },
    ],
  },
  {
    file: "viager-occupe-libre-bouquet-rente-2026.html",
    section: "finance",
    tag: "Viager",
    tagClass: "tag-immo",
    themes: ["viager", "vendeur", "seniors"],
    title: "Vente en viager 2026 : occupé ou libre, bouquet, rente — calcul et pièges",
    description:
      "Viager occupé, viager libre, bouquet et rente viagère : comment ça marche, pour qui, avec le notaire. Acheteur ou vendeur — comprendre avant de signer.",
    meta: "12 min · Août 2026",
    cardExcerpt: "Viager 2026 : bouquet, rente, occupé/libre — le guide sans jargon.",
    keywords: [
      "vente en viager 2026",
      "viager occupé ou libre",
      "calcul bouquet rente viagère",
      "vendre sa maison en viager",
      "acheter en viager risques",
      "viager rente mensuelle",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=viager", label: "Étudier une vente en viager" },
    blocks: [
      {
        type: "p",
        text: "La <strong>vente en viager</strong> revient dans les recherches Google — surtout quand les taux restent élevés et que les vendeurs seniors cherchent un <strong>revenu complémentaire</strong> sans quitter leur logement. Mais <strong>viager occupé</strong>, <strong>viager libre</strong>, <strong>bouquet</strong>, <strong>rente viagère</strong> : ce n'est pas une annonce classique. Une erreur de calcul ou de contrat peut coûter des dizaines de milliers d'euros. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=viager-vendeur\"><strong>Parler viager avec un conseiller</strong></a> · <a href=\"../landings/acheteur-immo.html?utm_content=viager-acheteur\">je cherche un bien (viager inclus)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Viager occupé vs viager libre" },
      {
        type: "ul",
        items: [
          "Occupé : le vendeur (crédirentier) reste dans les lieux — décote importante sur le prix",
          "Libre : le bien est libre à la vente — proche d'une vente classique avec rente",
          "Le bouquet (capital initial) + la rente mensuelle = prix décomposé",
        ],
      },
      { type: "h2", text: "Pour qui c'est pertinent — et pour qui ce ne l'est pas" },
      {
        type: "p",
        text: "Vendeur : retraite, patrimoine à transmettre autrement, besoin de trésorerie sans déménager. Acheteur : budget limité, horizon long terme, acceptation du risque viager (espérance de vie). <strong>Le notaire</strong> est indispensable pour chiffrer la rente et sécuriser le contrat. Ce n'est pas un montage à faire entre particuliers sur Leboncoin.",
      },
      { type: "h2", text: "Pièges fréquents" },
      {
        type: "ul",
        items: [
          "Sous-estimer la décote en viager occupé",
          "Oublier l'entretien, taxes, gros travaux dans le contrat",
          "Pas de clause de révision ou d'indexation comprise",
          "Acheteur qui n'a pas simulé la rente sur 20–30 ans",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "On vous aide à voir si le viager colle à votre projet — sans vous pousser vers un montage inadapté. <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">Autres ventes sensibles</a> · <a href=\"../landings/projection-achat.html?utm_content=viager-capacite\">simuler ma capacité d'achat</a>.",
      },
    ],
    related: [
      { href: "../landings/credit-immo.html", label: "Crédit classique vs viager" },
      { href: "./heritiers-pas-daccord-prix-vente-maison-que-faire.html", label: "Héritiers en désaccord" },
    ],
    faq: [
      {
        q: "Peut-on annuler un viager après signature ?",
        a: "Très difficile. D'où l'importance du notaire et de la simulation avant acte.",
      },
      {
        q: "Viager et succession : compatible ?",
        a: "Oui mais la rente et le bouquet ont des impacts successoraux. Le notaire les intègre.",
      },
    ],
  },
  {
    file: "sci-familiale-vendre-dissoudre-heritiers-2026.html",
    section: "finance",
    tag: "SCI",
    tagClass: "tag-immo",
    themes: ["sci", "succession", "vendeur"],
    title: "SCI familiale : vendre le bien, céder des parts ou dissoudre en 2026",
    description:
      "SCI montée pour la succession : vendre l'immeuble, racheter des parts, dissolution — associés, statuts, notaire. Guide pratique.",
    meta: "11 min · Août 2026",
    cardExcerpt: "SCI familiale : vendre, céder ou dissoudre sans surprise.",
    keywords: [
      "SCI familiale vendre bien",
      "dissoudre SCI héritiers",
      "cession parts SCI succession",
      "SCI indivision familiale",
      "vendre appartement SCI",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=sci", label: "Parler SCI & vente" },
    blocks: [
      {
        type: "p",
        text: "Beaucoup de familles ont monté une <strong>SCI</strong> pour faciliter la <strong>transmission</strong> ou détenir un bien à plusieurs. Vingt ans plus tard : associés multiples, générations différentes, parfois <strong>désaccord sur une vente</strong>. Faut-il vendre l'immeuble de la SCI ? Céder ses parts ? Dissoudre ? Chaque option a un coût fiscal et humain. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=sci-vendeur\"><strong>Décrire ma SCI à vendre</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Lire les statuts avant tout" },
      {
        type: "p",
        text: "Clause d'agrément, droit de préemption entre associés, majorité pour vendre : tout est dans les <strong>statuts</strong>. Sans ça, vous négociez dans le vide. L'expert-comptable et le notaire sont vos repères.",
      },
      { type: "h2", text: "Trois scénarios fréquents" },
      {
        type: "ul",
        items: [
          "Vente de l'actif par la SCI (tous associés d'accord)",
          "Rachat de parts par un associé (avec crédit)",
          "Dissolution et partage — long, fiscalité à anticiper",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "On recoupe estimation, acquéreurs et calendrier avec vos conseils. <a href=\"./heritiers-pas-daccord-prix-vente-maison-que-faire.html\">Héritiers en désaccord</a> · <a href=\"../landings/credit-immo.html?utm_content=sci-rachat\">financer un rachat de parts</a>.",
      },
    ],
    related: [
      { href: "./vente-immobiliere-3d-divorce-deces-demenagement.html", label: "Vente complexe" },
      { href: "../pret-immobilier/nancy-metropole/", label: "Prêt Nancy métropole" },
    ],
    faq: [
      {
        q: "Un associé minoritaire peut-il bloquer ?",
        a: "Souvent oui sur les décisions majeures. Les statuts et le pacte d'associés précisent les règles.",
      },
    ],
  },
  {
    file: "passoire-energetique-dpe-g-vendre-2026.html",
    section: "actu",
    tag: "DPE & climat",
    tagClass: "tag-actu",
    themes: ["dpe", "vendeur", "actu"],
    title: "Passoire énergétique DPE G : vendre en 2026 malgré la loi climat",
    description:
      "Logement classé G ou F : interdictions location, travaux, décote à la vente. Comment vendre un DPE G en 2026 — vendeur et acquéreur.",
    meta: "10 min · Août 2026",
    cardExcerpt: "DPE G en 2026 : vendre sans panique — travaux, prix, acquéreurs.",
    keywords: [
      "passoire énergétique vendre",
      "DPE G vendre maison 2026",
      "loi climat DPE G vente",
      "vendre appartement classe G",
      "DPE F G interdiction location",
      "rénovation énergétique avant vente",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=dpe-g", label: "Estimer mon bien DPE G/F" },
    blocks: [
      {
        type: "p",
        text: "Votre bien est classé <strong>DPE G</strong> (ou F) et vous entendez parler d'<strong>interdiction de location</strong>, de travaux obligatoires, de <strong>décote à la vente</strong> ? En août 2026, c'est l'une des recherches les plus fréquentes des vendeurs — et des acquéreurs qui espèrent une « bonne affaire ». Voici comment aborder la vente sans vous faire avoir. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=dpe-vendeur\"><strong>Parler de ma vente</strong></a> · <a href=\"../landings/acheteur-immo.html?utm_content=dpe-acheteur\">chercher un bien (budget travaux)</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce que change la loi climat (en résumé)" },
      {
        type: "ul",
        items: [
          "Logements G interdits à la location depuis 2025 (progression F, E…)",
          "Un acquéreur investisseur regardera le coût travaux + décote",
          "Un acquéreur résidentiel peut accepter — s'il a le budget rénovation",
        ],
      },
      { type: "h2", text: "Vendre tel quel ou rénover avant ?" },
      {
        type: "p",
        text: "Parfois des <strong>travaux ciblés</strong> (isolation, chauffage) font passer la note — parfois le coût dépasse le gain. Une estimation <strong>avec et sans travaux</strong> aide à décider. <a href=\"../landings/projection-achat.html?utm_content=dpe-travaux\">projection achat avec travaux</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "On ne vous promet pas un « miracle DPE ». On vous aide à positionner le prix et à trouver le bon profil d'acquéreur. <a href=\"../landings/credit-immo.html?utm_content=dpe-credit\">crédit travaux + achat</a>.",
      },
    ],
    related: [
      { href: "./diagnostics-immobiliers-obligatoires-vente-2026.html", label: "Diagnostics obligatoires vente" },
      { href: "../landings/chasseur-bien.html", label: "Chasseur de bien" },
      { href: "./taux-pret-immobilier-aout-2026-rentree.html", label: "Taux août 2026" },
    ],
    faq: [
      {
        q: "Un DPE G se vend-il encore en 2026 ?",
        a: "Oui, souvent avec décote ou à un acquéreur qui prévoit des travaux. Le marché local compte.",
      },
    ],
  },
  {
    file: "taux-pret-immobilier-aout-2026-rentree.html",
    section: "finance",
    tag: "Taux 2026",
    tagClass: "tag-actu",
    themes: ["taux", "actu", "rentree"],
    title: "Taux prêt immobilier août 2026 : faut-il acheter à la rentrée ?",
    description:
      "Taux crédit immo août/rentrée 2026, BCE, capacité d'emprunt, fenêtre d'achat. Simulation avant la banque — Nancy, France.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Taux août 2026 + rentrée : acheter, attendre ou renégocier ?",
    keywords: [
      "taux prêt immobilier août 2026",
      "taux crédit immo rentrée 2026",
      "faut il acheter immobilier 2026",
      "taux immobilier baisse 2026",
      "capacité emprunt 2026",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=taux-aout-2026", label: "Simulation crédit gratuite" },
    blocks: [
      {
        type: "p",
        text: "Chaque <strong>rentrée</strong>, la même question revient sur Google : <strong>« quel est le taux du moment ? »</strong> et <strong>« faut-il acheter maintenant ? »</strong> En août 2026, les taux ne sont plus au plus bas de 2021 — mais le marché des vendeurs s'ajuste, et certains biens se négocient. La vraie question n'est pas le taux seul : c'est <strong>votre capacité réelle</strong> sur 20 ans. <a href=\"../landings/projection-achat.html?utm_content=taux-projection\"><strong>Projection achat complète</strong></a> · <a href=\"../landings/credit-immo.html?utm_content=taux-credit\">dossier crédit</a> · <a href=\"../pret-immobilier/nancy-metropole/\">prêt Nancy métropole</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Taux : ce qui bouge vraiment" },
      {
        type: "ul",
        items: [
          "OAT, BCE, inflation — contexte macro",
          "Votre profil (apport, CDI, endettement) pèse autant que le taux affiché",
          "Assurance emprunteur : levier Lemoine souvent oublié — <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">guide Lemoine</a>",
        ],
      },
      { type: "h2", text: "Rentrée 2026 : fenêtre vendeur ou acheteur ?" },
      {
        type: "p",
        text: "Moins de concurrence estivale, vendeurs qui reviennent de vacances, banques qui relancent les dossiers : la <strong>rentrée</strong> peut être le bon moment pour <strong>verrouiller une capacité</strong> — pas pour acheter n'importe quel bien. Voir <a href=\"./pret-immo-erreurs-a-eviter.html\">erreurs prêt à éviter</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"../landings/acheteur-immo.html?utm_content=taux-recherche\">Chercher un bien</a> · <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=taux-vendeur\">je vends à la rentrée</a> · <a href=\"./pret-relais-vente-rachat-enchaine-2026.html\">prêt relais vente-rachat</a>.",
      },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
      { href: "../credit-immo/nancy-metropole/", label: "Crédit Nancy" },
    ],
    faq: [
      {
        q: "Dois-je attendre une baisse des taux ?",
        a: "Personne ne peut le garantir. Mieux vaut simuler à plusieurs taux et voir si le projet tient avec votre reste à vivre.",
      },
    ],
  },
  {
    file: "pret-relais-vente-rachat-enchaine-2026.html",
    section: "finance",
    tag: "Prêt relais",
    tagClass: "tag-immo",
    themes: ["pret-relais", "vendeur", "acheteur"],
    title: "Prêt relais 2026 : vendre et racheter en chaîne sans vous retrouver à la rue",
    description:
      "Vente en chaîne, prêt relais, délai entre deux biens. Calendrier, banque, compromis — éviter le piège du logement temporaire.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Prêt relais : enchaîner vente et achat sans rupture.",
    keywords: [
      "prêt relais 2026",
      "vente rachat enchaîné",
      "vendre et racheter même temps",
      "vente en chaîne immobilier",
      "prêt relais banque conditions",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=pret-relais", label: "Monter un prêt relais" },
    blocks: [
      {
        type: "p",
        text: "Vous devez <strong>vendre pour racheter</strong> — maison trop petite, mutation, divorce, héritage à transformer — et vous avez peur du <strong>trou entre les deux dates</strong> ? Le <strong>prêt relais</strong> (ou vente-achat simultané) est fait pour ça. Mal monté, il coûte cher ; bien préparé, il évite le double déménagement ou l'hôtel pendant des mois. <a href=\"../landings/acheteur-immo.html?role=les_deux&utm_content=relais\"><strong>Je vends et je rachète</strong></a> · <a href=\"../landings/credit-immo.html?utm_content=relais-credit\">étude prêt relais</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Comment fonctionne le prêt relais" },
      {
        type: "p",
        text: "La banque avance une partie de la valeur de votre bien <strong>en cours de vente</strong> pour financer l'achat du suivant. À la vente effective, le relais est soldé. Durée limitée, intérêts à prévoir, bien souvent à avoir déjà un acquéreur ou une mise en vente avancée.",
      },
      { type: "h2", text: "Les 4 pièges classiques" },
      {
        type: "ul",
        items: [
          "Surestimer le prix de vente du bien actuel",
          "Acheter avant d'avoir une offre ferme sur la vente",
          "Oublier les frais de double notaire et déménagement",
          "Pas de plan B si la vente traîne (délai relais dépassé)",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"../landings/projection-achat.html?utm_content=relais-projection\">Simuler capacité + relais</a> · <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">vente sensible (3D)</a>.",
      },
    ],
    related: [
      { href: "../landings/acheteur-immo.html?role=les_deux", label: "Vendre et racheter" },
      { href: "./taux-pret-immobilier-aout-2026-rentree.html", label: "Taux août 2026" },
    ],
    faq: [
      {
        q: "Peut-on avoir un prêt relais sans acquéreur ?",
        a: "Certaines banques exigent une vente avancée ou une clause suspensive maîtrisée. Chaque banque diffère.",
      },
    ],
  },
  {
    file: "cession-local-commercial-bail-fonds-commerce-2026.html",
    section: "finance",
    tag: "Locaux pro",
    tagClass: "tag-immo",
    themes: ["pro", "vendeur", "commerce"],
    title: "Vendre un local commercial : bail, fonds de commerce, murs ou pas",
    description:
      "Cession local pro, bail 3-6-9, murs commerciaux, fonds de commerce. Vendeur ou repreneur — étapes et erreurs à éviter en 2026.",
    meta: "11 min · Août 2026",
    cardExcerpt: "Local commercial : murs, bail, fonds — vendre sans mélanger les dossiers.",
    keywords: [
      "vendre local commercial",
      "cession fonds de commerce",
      "bail commercial vendre murs",
      "vendre boutique murs",
      "local professionnel vente 2026",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=local-pro", label: "Parler local commercial" },
    blocks: [
      {
        type: "p",
        text: "Vendre un <strong>local commercial</strong>, une <strong>boutique avec murs</strong>, ou seulement un <strong>fonds de commerce</strong> : ce n'est pas la même annonce qu'un appartement. Le <strong>bail 3-6-9</strong>, la clientèle, les travaux d'accessibilité, la taxe foncière : tout compte. Que vous cessiez votre activité ou transmettiez à un repreneur, le dossier se prépare avec le notaire et souvent un expert-comptable. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=commerce\"><strong>Décrire mon local à vendre</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Murs seuls, fonds seul, ou les deux ?" },
      {
        type: "ul",
        items: [
          "Murs : vente immobilière classique (avec locataire en place ou non)",
          "Fonds de commerce : clientèle, enseigne, matériel — valorisation spécifique",
          "Droit au bail : revente du bail sans les murs",
        ],
      },
      { type: "h2", text: "Qui achète en 2026 ?" },
      {
        type: "p",
        text: "Repreneurs, investisseurs, enseignes qui cherchent des emplacements — parfois via un <strong>chasseur de bien</strong> plutôt que SeLoger. <a href=\"../landings/chasseur-bien.html?utm_content=local-pro\">Signaler un local (chasseur)</a> · <a href=\"../landings/devis.html?need=rc-pro\">RC Pro si vous reprenez</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">Ventes complexes (SCI, succession)</a> · <a href=\"../landings/credit-immo.html?utm_content=local-invest\">crédit investisseur</a>.",
      },
    ],
    related: [
      { href: "../landings/chasseur-bien.html", label: "Chasseur de bien" },
      { href: "./sci-familiale-vendre-dissoudre-heritiers-2026.html", label: "SCI & murs" },
    ],
    faq: [
      {
        q: "Le locataire peut-il bloquer la vente des murs ?",
        a: "Le bail continue en principe. Le locataire a souvent un droit de préemption — le notaire vérifie.",
      },
    ],
  },
  {
    file: "signalement-maison-a-vendre-chasseur-bien-prime.html",
    section: "finance",
    tag: "Chasseur",
    tagClass: "tag-immo",
    themes: ["chasseur", "signalement", "niche"],
    title: "Panneau « À vendre » : signaler un bien au chasseur (sans être le vendeur)",
    description:
      "Vous voyez une maison à vendre, un terrain, une pancarte ? Signalez-le au chasseur de bien — photo + ville. Pas de mandat garanti, chaque piste étudiée.",
    meta: "6 min · Août 2026",
    cardExcerpt: "Signalement terrain ou maison : le chasseur vérifie pour ses acquéreurs.",
    keywords: [
      "signaler maison à vendre",
      "chasseur immobilier prime",
      "panneau à vendre signalement",
      "trouver bien hors annonce",
      "chasseur de bien immobilier",
      "signalement terrain à vendre",
    ],
    cta: { href: "../landings/chasseur-bien.html?utm_content=signalement-blog", label: "Envoyer un signalement" },
    blocks: [
      {
        type: "p",
        text: "Vous passez devant une <strong>maison avec panneau « À vendre »</strong>, un <strong>terrain à bâtir</strong>, une façade vide depuis des mois — et vous vous demandez si quelqu'un cherche ce type de bien ? Les gros portails ne listent pas tout. Le <strong>chasseur de bien</strong> travaille comme un détective : vous envoyez une <strong>photo + la ville</strong>, on vérifie et on croise avec nos acquéreurs. <a href=\"../landings/chasseur-bien.html?utm_content=signalement-cta\"><strong>Signaler maintenant</strong></a> · <a href=\"../landings/apporteur-affaires.html?utm_content=signalement-apporteur\">apporteur d'affaires</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce qu'on ne promet pas" },
      {
        type: "p",
        text: "Pas de mandat exclusif garanti, pas de commission promise à l'avance — comme pour un prêt, on ne peut pas garantir que vous serez « récompensé ». En revanche, <strong>chaque signalement utile est étudié</strong>. Si ça matche un acquéreur, on enchaîne contact vendeur, visite, dossier.",
      },
      { type: "h2", text: "Ce qui aide vraiment" },
      {
        type: "ul",
        items: [
          "Photo lisible (façade, panneau, terrain)",
          "Ville ou commune précise",
          "Type : maison, terrain, local, immeuble",
          "Vous n'êtes pas obligé d'être le propriétaire",
        ],
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"../landings/acheteur-immo.html?role=signalement\">Signalement depuis acquéreur</a> · <a href=\"../landings/acheteur-immo.html#recherche\">voir les biens déjà déposés</a>.",
      },
    ],
    related: [
      { href: "../landings/apporteur-affaires.html", label: "Apporteur d'affaires" },
      { href: "./acheter-terrain-nancy-metropole-54-2026.html", label: "Terrain Nancy 54" },
    ],
    faq: [
      {
        q: "Est-ce légal de signaler un bien qui n'est pas à moi ?",
        a: "Signaler une adresse publique (panneau en rue) pour mise en relation n'est pas de l'usurpation. On contacte le vendeur avec respect.",
      },
    ],
  },
  {
    file: "acheter-terrain-nancy-metropole-54-2026.html",
    section: "finance",
    tag: "Nancy 54",
    tagClass: "tag-immo",
    themes: ["nancy", "terrain", "local"],
    title: "Acheter un terrain à Nancy métropole (54) : Jarville, Varangéville, Dombasle, Houdemont, Ludres…",
    description:
      "Terrain à bâtir Nancy, Jarville, Varangéville, Dombasle, Houdemont, Ludres, Saint-Max, Maxéville : prix, PLU, viabilisation, chasseur de bien. Guide local 2026.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Terrain 54 : Jarville, Varangéville, Dombasle, Houdemont, Ludres — où chercher.",
    keywords: [
      "acheter terrain Nancy",
      "terrain à bâtir 54",
      "terrain Jarville Varangéville Dombasle",
      "terrain Houdemont Ludres Saint-Max",
      "terrain Nancy métropole 2026",
      "prix terrain Meurthe et Moselle",
      "constructible Nancy banlieue",
    ],
    cta: { href: "../landings/chasseur-bien.html?utm_content=terrain-54", label: "Signaler ou chercher un terrain" },
    blocks: [
      {
        type: "p",
        text: "Chercher un <strong>terrain à bâtir</strong> autour de <strong>Nancy</strong>, <strong>Jarville-la-Malgrange</strong>, <strong>Varangéville</strong>, <strong>Dombasle-sur-Meurthe</strong>, <strong>Houdemont</strong>, <strong>Ludres</strong>, <strong>Saint-Max</strong> ou les communes de la <strong>métropole du Grand Nancy</strong> : ce n'est pas comme filtrer un appart sur SeLoger. Beaucoup de parcelles sortent par le bouche-à-oreille, les panneaux, les notaires — pas en ligne. <a href=\"../landings/chasseur-bien.html?utm_content=terrain-nancy\"><strong>Chasseur terrain 54</strong></a> · <a href=\"../landings/acheteur-immo.html?utm_content=terrain-recherche\">déposer ma recherche</a> · <a href=\"../pret-immobilier/nancy-metropole/\">prêt Nancy métropole</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Communes où les acquéreurs regardent en 2026" },
      {
        type: "ul",
        items: [
          "Jarville-la-Malgrange, Varangéville, Dombasle-sur-Meurthe, Heillecourt",
          "Houdemont, Ludres, Laxou, Vandœuvre, Saint-Max",
          "Maxéville, Essey-lès-Nancy, Pulnoy, Saulxures-lès-Nancy, Seichamps",
          "Tomblaine, Malzéville, Villers, Laneuveville, Fléville, Art-sur-Meurthe",
          "Champigneulles, Frouard, Liverdun, Bouxières-aux-Dames, Lay-Saint-Christophe",
          "Neuves-Maisons, Méréville, Chavigny, Richardménil, Saint-Nicolas-de-Port, Rosières-aux-Salines",
          "Pont-à-Mousson, Pompey, Custines, Gondreville — selon budget",
          "Vérifier PLU, viabilisation, réseaux avant offre",
        ],
      },
      { type: "h2", text: "Terrain + construction : le bon ordre" },
      {
        type: "p",
        text: "Capacité d'emprunt sur <strong>terrain + maison</strong>, pas seulement le terrain. <a href=\"../landings/projection-achat.html?utm_content=terrain-projection\">projection complète</a> · <a href=\"../landings/credit-immo.html?utm_content=terrain-credit\">dossier crédit</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"../landings/acheteur-immo.html?role=signalement\">Je signale un terrain vu sur place</a> · <a href=\"./signalement-maison-a-vendre-chasseur-bien-prime.html\">comment signaler</a>.",
      },
    ],
    related: [
      { href: "../pret-immobilier/nancy-metropole/", label: "Hub prêt Nancy" },
      { href: "../credit-immo/nancy-metropole/", label: "Crédit Nancy" },
    ],
    faq: [
      {
        q: "Un terrain sans annonce en ligne existe-t-il encore ?",
        a: "Oui, surtout en périphérie de Nancy. D'où le signalement et le chasseur.",
      },
    ],
  },
  {
    file: "rentree-2026-investissement-locatif-encore-rentable.html",
    section: "finance",
    tag: "Investissement",
    tagClass: "tag-immo",
    themes: ["investissement", "actu", "rentree"],
    title: "Investissement locatif rentrée 2026 : encore rentable ou illusoire ?",
    description:
      "Achat locatif 2026 : taux, DPE, loyers, fiscalité Pinel fin, cash-flow. Simulateur et dossier crédit investisseur.",
    meta: "11 min · Août 2026",
    cardExcerpt: "Locatif 2026 : calculer avant d'acheter — pas après.",
    keywords: [
      "investissement locatif 2026",
      "rentabilité locative 2026",
      "acheter pour louer encore rentable",
      "investisseur immobilier rentrée",
      "cash flow locatif 2026",
    ],
    cta: { href: "../landings/projection-achat.html?utm_content=invest-locatif", label: "Simuler mon investissement" },
    blocks: [
      {
        type: "p",
        text: "« <strong>L'immobilier locatif est mort</strong> » vs « <strong>c'est le moment d'acheter</strong> » : en rentrée 2026, les deux camps crient sur les réseaux. La vérité est dans <strong>votre calcul</strong> : taux, charges, vacance locative, DPE, travaux, fiscalité. Pas dans un tweet. <a href=\"../landings/projection-achat.html?utm_content=invest\"><strong>Projection investisseur</strong></a> · <a href=\"../landings/credit-immo.html?utm_content=invest-credit\">crédit investissement</a> · <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">DPE et locatif</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce qui a changé pour les investisseurs" },
      {
        type: "ul",
        items: [
          "Taux plus élevés qu'en 2021 — cash-flow serré",
          "DPE : logements G interdits à la location",
          "Dispositifs fiscaux en mouvement — se fier au comptable",
          "Certaines villes secondaires (ex. Nancy métropole) moins tendues que Paris",
        ],
      },
      { type: "h2", text: "Le test en 5 minutes" },
      {
        type: "p",
        text: "Loyer estimé − charges − crédit − impôt − provision travaux = <strong>cash-flow réel</strong>. Si c'est négatif, assumez-vous de compenser par la revalorisation ? Sinon, repoussez ou changez de bien. <a href=\"../landings/acheteur-immo.html?utm_content=invest-chasse\">chasseur pour trouver le bon actif</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"./taux-pret-immobilier-aout-2026-rentree.html\">Taux août 2026</a> · <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">prêt refusé investisseur</a>.",
      },
    ],
    related: [
      { href: "../pret-immobilier/nancy-metropole/", label: "Prêt Nancy" },
      { href: "./emprunteur-non-residents-investissement-immobilier-2026.html", label: "Non-résidents" },
    ],
    faq: [
      {
        q: "Vaut-il mieux investir en 2026 qu'attendre ?",
        a: "Dépend du bien, du prix d'achat et de votre apport. Simulez — ne devinez pas.",
      },
    ],
  },
  {
    file: "succession-maison-vide-heritiers-eloignes-demarches.html",
    section: "finance",
    tag: "Succession",
    tagClass: "tag-immo",
    themes: ["succession", "niche", "vendeur"],
    title: "Maison vide après décès : héritiers éloignés, que faire à distance ?",
    description:
      "Succession, bien inoccupé, héritiers à l'étranger ou loin : vendre à distance, notaire, estimation, sécurité du bien. Guide 2026.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Bien vide après décès : vendre quand on habite loin.",
    keywords: [
      "vendre maison succession à distance",
      "héritiers éloignés vente bien",
      "maison vide après décès que faire",
      "succession immobilière héritiers étranger",
      "indivision bien inoccupé",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=succession-distance", label: "Vendre à distance" },
    blocks: [
      {
        type: "p",
        text: "La <strong>maison familiale</strong> est vide depuis le <strong>décès</strong>. Vous habitez à Paris, en région ou à l'étranger — et les autres héritiers aussi. Entretenir à distance, payer les charges, éviter la dégradation : la vente devient urgente, mais personne n'est sur place. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=succession\"><strong>Décrire le bien à vendre</strong></a> · <a href=\"./heritiers-pas-daccord-prix-vente-maison-que-faire.html\">héritiers en désaccord</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Sécuriser le bien avant la vente" },
      {
        type: "ul",
        items: [
          "Assurance habitation bien vide (sinistre = cauchemar)",
          "Coupe d'eau, visite régulière, voisin vigilant",
          "Notaire local pour le cadre successoral",
        ],
      },
      { type: "h2", text: "Vendre sans revenir dix fois" },
      {
        type: "p",
        text: "Mandat, estimation, visites organisées, visio avec acquéreurs sérieux : l'objectif est de <strong>limiter les déplacements</strong> tout en respectant le rythme du notaire. <a href=\"../landings/chasseur-bien.html?utm_content=succession-signalement\">signalement si bien déjà repéré</a>.",
      },
      { type: "bridge" },
      {
        type: "p",
        text: "<a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">Guide vente 3D</a> · <a href=\"../landings/credit-immo.html?utm_content=succession-rachat\">un héritier rachète les parts</a>.",
      },
    ],
    related: [
      { href: "./sci-familiale-vendre-dissoudre-heritiers-2026.html", label: "SCI familiale" },
      { href: "../landings/devis.html?need=habitation", label: "Assurance habitation vide" },
    ],
    faq: [
      {
        q: "Faut-il vider et ranger avant la vente ?",
        a: "Souvent oui pour les visites. Le notaire peut gérer le vide successoral si les héritiers ne s'accordent pas sur le contenu.",
      },
    ],
  },
  {
    file: "diagnostics-immobiliers-obligatoires-vente-2026.html",
    section: "finance",
    tag: "Diagnostics",
    tagClass: "tag-immo",
    themes: ["vendeur", "dpe", "actu"],
    title: "Diagnostics immobiliers obligatoires pour vendre en 2026 (DDT)",
    description:
      "DPE, amiante, plomb, gaz, électricité, ERP, Carrez, audit énergétique : quels diagnostics coller au compromis, durées de validité, pièges notaire.",
    meta: "12 min · Septembre 2026",
    cardExcerpt: "DDT 2026 : la checklist vendeur avant le compromis — sans mauvaises surprises.",
    keywords: [
      "diagnostics immobiliers obligatoires vente 2026",
      "DDT vente diagnostics",
      "diagnostics obligatoires avant compromis",
      "durée validité diagnostic immobilier",
      "DPE amiante plomb gaz électricité ERP",
      "audit énergétique vente maison DPE E F G",
    ],
    cta: {
      href: "../landings/acheteur-immo.html?role=vendeur&utm_content=diagnostics-vente-2026",
      label: "Préparer ma vente (diagnostics)",
    },
    blocks: [
      {
        type: "p",
        text: "Vous vendez un <strong>appartement ou une maison</strong> et le notaire parle de <strong>DDT</strong> (dossier de diagnostic technique) ? Sans ce paquet, le compromis patine, l'acquéreur négocie, parfois l'acte est reporté. En septembre 2026, la liste n'est pas la même pour une copropriété récente et une maison d'avant 1949. Voici le <strong>socle obligatoire</strong>, les durées de validité, et ce que vous pouvez lancer dès maintenant. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=diagnostics-vente\"><strong>Décrire mon bien à vendre</strong></a> · <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">vendre un DPE G</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que le notaire attend dans le DDT" },
      {
        type: "p",
        text: "Le DDT réunit les diagnostics que le vendeur doit annexer à la <strong>promesse ou au compromis</strong> (Code de la construction et de l'habitation). Un dossier incomplet, périmé ou au mauvais lot = délai, voire renégociation. Nous ne remplaçons pas le diagnostiqueur certifié ni le notaire : on vous aide à <strong>lister ce qui manque</strong> selon l'année, le type de bien et la copropriété.",
      },
      { type: "h2", text: "2. Le socle presque toujours dû" },
      {
        type: "ul",
        items: [
          "<strong>DPE</strong> — quasi tous les logements, valable 10 ans. Les DPE d'avant le 1er juillet 2021 ont expiré : refaites-le.",
          "<strong>État des risques (ERP / ERNMT)</strong> — valable 6 mois. À coller au plus près du compromis, surtout en zone inondable (Meurthe, Seille…).",
          "<strong>Gaz</strong> et <strong>électricité</strong> — si l'installation a plus de 15 ans : 3 ans de validité à la vente.",
          "<strong>Amiante</strong> — permis de construire antérieur au 1er juillet 1997. Illimité si négatif (après avril 2013) ; à surveiller si présence.",
          "<strong>Plomb (CREP)</strong> — logement avant 1949. Illimité si négatif ; 1 an si présence de plomb.",
        ],
      },
      { type: "h2", text: "3. Selon le bien : Carrez, termites, assainissement, audit" },
      {
        type: "ul",
        items: [
          "<strong>Loi Carrez</strong> — lots de copropriété (appartements). Surface privative ; à refaire après travaux. Voir <a href=\"./loi-carrez-surface-appartement-vente-2026.html\">guide Carrez</a>.",
          "<strong>Termites / mérule</strong> — uniquement si arrêté préfectoral (zone). Validité courte (~6 mois).",
          "<strong>Assainissement non collectif</strong> — maison non raccordée au tout-à-l'égout.",
          "<strong>Audit énergétique</strong> — maisons ou immeubles en monopropriété classés E, F ou G : document distinct du DPE, demandé à la vente.",
        ],
      },
      { type: "h2", text: "4. Calendrier vendeur (éviter l'urgence J-3)" },
      {
        type: "p",
        text: "Lancez DPE, gaz, électricité, amiante et plomb <strong>dès la mise en vente</strong>. Gardez ERP (et termites) pour les 2–3 semaines avant le compromis : leur validité est courte. Un DPE G ou F change le prix et le profil d'acquéreur — autant le savoir avant les photos. <a href=\"./documents-vendre-maison-appartement-checklist-2026.html\">checklist documents vente</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. Bassin nancéien : ERP et inondation" },
      {
        type: "p",
        text: "À <strong>Nancy, Jarville, Varangéville</strong> et autour de la Meurthe, l'<strong>état des risques</strong> n'est pas un détail : un ERP périmé au moment de l'acte, et le notaire recale. Si vous vendez pour racheter, cadrez aussi le <a href=\"../pret-immobilier/nancy-metropole/\">prêt immobilier Nancy métropole</a> en parallèle — diagnostics + capacité d'emprunt, c'est le même calendrier. <a href=\"../landings/credit-immo.html?utm_content=diagnostics-credit\">étude crédit</a>.",
      },
      {
        type: "p",
        text: "On ne réalise pas les diagnostics. On vous dit lesquels manquent, on aligne estimation et dossier, et on recroise acquéreurs. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=diagnostics-cta\">Déposer mon bien</a> · <a href=\"../landings/chasseur-bien.html?utm_content=diagnostics-chasseur\">signaler un bien (chasseur)</a>.",
      },
    ],
    related: [
      { href: "./loi-carrez-surface-appartement-vente-2026.html", label: "Loi Carrez" },
      { href: "./documents-vendre-maison-appartement-checklist-2026.html", label: "Documents à réunir" },
      { href: "./passoire-energetique-dpe-g-vendre-2026.html", label: "Vendre un DPE G" },
    ],
    faq: [
      {
        q: "Puis-je signer le compromis sans DPE ?",
        a: "En pratique, non : le DPE doit être annexé. Un dossier incomplet retarde la signature et affaiblit votre position.",
      },
      {
        q: "Combien coûtent les diagnostics de vente ?",
        a: "Le pack dépend de la surface, de l'année et du type de bien (maison vs appartement). Demandez un devis à un diagnostiqueur certifié — le moins-disant n'est pas toujours le plus solide au notaire.",
      },
      {
        q: "Un diagnostic location (6 ans) suffit-il pour vendre ?",
        a: "Pas pour le gaz et l'électricité : 3 ans à la vente, 6 ans à la location. Vérifiez les dates avant de recycler un ancien dossier.",
      },
    ],
  },
  {
    file: "loi-carrez-surface-appartement-vente-2026.html",
    section: "finance",
    tag: "Loi Carrez",
    tagClass: "tag-immo",
    themes: ["vendeur", "carrez"],
    title: "Loi Carrez 2026 : surface, attestation, erreur de 5 % — ce qui compte",
    description:
      "Surface Carrez vs surface habitable, lots de copropriété, combles, terrasses. Erreur de mesurage > 5 % : baisse de prix. Guide vendeur et acheteur.",
    meta: "11 min · Septembre 2026",
    cardExcerpt: "Carrez : ce qui se mesure, ce qui s'exclut, et le piège des 5 %.",
    keywords: [
      "loi carrez surface appartement",
      "attestation loi carrez vente",
      "surface carrez vs surface habitable",
      "erreur mesurage carrez 5%",
      "diagnostic carrez obligatoire copropriété",
      "surface privative carrez combles",
    ],
    cta: {
      href: "../landings/acheteur-immo.html?role=vendeur&utm_content=loi-carrez-2026",
      label: "Vérifier ma surface avant vente",
    },
    blocks: [
      {
        type: "p",
        text: "En copropriété, la <strong>loi Carrez</strong> n'est pas un « plus » marketing : c'est la <strong>surface privative</strong> qui doit figurer dans l'avant-contrat. Une erreur de plus de <strong>5 %</strong> au détriment de l'acquéreur ouvre droit à une <strong>diminution du prix</strong>. Combles, mezzanine, cave, terrasse : tout le monde confond Carrez et surface habitable. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=carrez\"><strong>Faire le point sur mon lot</strong></a> · <a href=\"./diagnostics-immobiliers-obligatoires-vente-2026.html\">diagnostics vente 2026</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Quand l'attestation Carrez est obligatoire" },
      {
        type: "p",
        text: "Elle concerne les <strong>lots de copropriété</strong> (appartements, parfois maisons en copro). Une maison individuelle hors copropriété n'est pas visée par Carrez — on parle alors plutôt de surface habitable. En copro, sans mesurage à jour, le notaire bloque. Validité <strong>illimitée</strong> tant qu'aucun travaux n'a modifié la surface.",
      },
      { type: "h2", text: "2. Ce qui compte (et ce qui ne compte pas)" },
      {
        type: "ul",
        items: [
          "Pièces d'une <strong>hauteur sous plafond ≥ 1,80 m</strong>",
          "Combles aménagés, vérandas, sous-sols habitables s'ils respectent la hauteur",
          "<strong>Exclus</strong> : caves, garages, parkings, terrasses, balcons, lots de moins de 8 m²",
          "Les murs, cloisons, cages d'escalier, gaines ne rentrent pas dans le mesurage privatif",
        ],
      },
      { type: "h2", text: "3. Carrez vs surface habitable (loi Boutin)" },
      {
        type: "p",
        text: "La <strong>surface habitable</strong> (Boutin) sert surtout à la <strong>location</strong> : elle exclut encore plus (combles non aménagés, etc.). Un même appartement peut afficher 52 m² Carrez et 48 m² habitables. Annonce, DPE et compromis doivent parler le même langage — sinon l'acquéreur a un levier. Pour louer : <a href=\"./diagnostics-location-ddt-bailleur-2026.html\">diagnostics location</a> · <a href=\"../landings/location.html?utm_content=carrez-location\">parcours bailleur</a>.",
      },
      { type: "h2", text: "4. L'erreur de 5 % : ce que ça coûte" },
      {
        type: "p",
        text: "Si la surface réelle est inférieure de plus de 5 % à celle indiquée, l'acquéreur peut demander une <strong>réduction du prix</strong> proportionnelle. À 250 000 €, 6 % d'écart, ce n'est pas symbolique. Un mesurage « à l'œil » ou un ancien plan après abattement de cloison est un risque. Faites refaire Carrez après travaux.",
      },
      { type: "bridge" },
      { type: "h2", text: "5. Appartements Nancy, Jarville, Varangéville" },
      {
        type: "p",
        text: "Sur le bassin nancéien, beaucoup de copropriétés des années 1960-80 ont des <strong>combles, caves et caves hautes</strong> mal décrits. Un lot « 65 m² » peut être 58 m² Carrez. Avant de fixer le prix, on recoupe mesurage, DPE et comparables — pas une photo d'annonce. Si vous vendez pour racheter : <a href=\"../credit-immo/nancy-metropole/\">crédit Nancy métropole</a> · <a href=\"../landings/projection-achat.html?utm_content=carrez-projection\">projection achat</a>.",
      },
      {
        type: "p",
        text: "<a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=carrez-cta\">Déposer mon appartement</a> · <a href=\"../landings/acheteur-immo.html?utm_content=carrez-acheteur\">je cherche un bien (vérifier la surface)</a>.",
      },
    ],
    related: [
      { href: "./diagnostics-immobiliers-obligatoires-vente-2026.html", label: "Diagnostics vente" },
      { href: "./documents-vendre-maison-appartement-checklist-2026.html", label: "Checklist documents" },
      { href: "../landings/acheteur-immo.html", label: "Recherche / dépôt" },
    ],
    faq: [
      {
        q: "Une maison individuelle a-t-elle besoin du Carrez ?",
        a: "Non, hors copropriété. En copropriété horizontale ou lotissement en copro, oui : demandez au notaire.",
      },
      {
        q: "Le Carrez d'il y a 15 ans est-il encore valable ?",
        a: "Oui s'il n'y a pas eu de travaux modifiant la surface. Après réunion de deux pièces ou création d'une mezzanine, refaites le mesurage.",
      },
      {
        q: "Qui paie le mesurage Carrez ?",
        a: "Le vendeur, comme les autres diagnostics. C'est un coût de mise en vente, pas une option.",
      },
    ],
  },
  {
    file: "documents-vendre-maison-appartement-checklist-2026.html",
    section: "finance",
    tag: "Documents vente",
    tagClass: "tag-immo",
    themes: ["vendeur"],
    title: "Documents pour vendre une maison ou un appartement en 2026 (checklist)",
    description:
      "Titre de propriété, diagnostics, copropriété, urbanisme, charges : la liste des pièces à réunir avant compromis. Moins d'allers-retours notaire.",
    meta: "12 min · Septembre 2026",
    cardExcerpt: "Checklist vendeur : pièces, diagnostics, copro — pour signer sans stress.",
    keywords: [
      "documents pour vendre une maison",
      "pièces notaire vente appartement",
      "checklist documents vente immobilière",
      "dossier copropriété vente",
      "titre de propriété vente 2026",
      "documents à fournir pour vendre",
    ],
    cta: {
      href: "../landings/acheteur-immo.html?role=vendeur&utm_content=docs-vente-2026",
      label: "Constituer mon dossier de vente",
    },
    blocks: [
      {
        type: "p",
        text: "Le notaire ne « bloque » pas pour le plaisir : il manque une pièce, et tout le calendrier glisse. <strong>Titre, diagnostics, copro, urbanisme</strong> — la checklist ci-dessous est celle que les vendeurs cherchent le plus en 2026. Plus le dossier est complet, plus les visites sérieuses convertissent. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=docs-vente\"><strong>Déposer mon bien</strong></a> · <a href=\"./diagnostics-immobiliers-obligatoires-vente-2026.html\">diagnostics obligatoires</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Preuve de propriété et identité" },
      {
        type: "ul",
        items: [
          "Titre de propriété (acte d'achat, donation, succession)",
          "Pièces d'identité des vendeurs, contrat de mariage / PACS / jugement de divorce",
          "Si SCI : statuts, Kbis, pouvoir de signer",
          "Si indivision / héritiers : attestation du notaire sur les parts — <a href=\"./heritiers-pas-daccord-prix-vente-maison-que-faire.html\">héritiers pas d'accord</a>",
        ],
      },
      { type: "h2", text: "2. Diagnostics et surfaces" },
      {
        type: "p",
        text: "Le <strong>DDT</strong> (DPE, ERP, gaz, élec, amiante, plomb, etc.) + <strong>Carrez</strong> en copro. Lancez-les tôt : un DPE G change le prix. Voir <a href=\"./loi-carrez-surface-appartement-vente-2026.html\">loi Carrez</a> et <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">passoire énergétique</a>.",
      },
      { type: "h2", text: "3. Copropriété (appartement)" },
      {
        type: "ul",
        items: [
          "Règlement de copropriété et état descriptif de division",
          "Procès-verbaux des 3 dernières AG, carnet d'entretien",
          "Montant des charges, fonds travaux, procédures en cours",
          "Preuve du paiement des charges (quitus syndic)",
        ],
      },
      { type: "h2", text: "4. Maison : urbanisme, assainissement, bornage" },
      {
        type: "ul",
        items: [
          "Servitudes, bornage, cadastre",
          "Permis / déclarations de travaux (extension, véranda)",
          "Assainissement (raccordé ou SPANC)",
          "Taxe foncière, diagnostics assainissement si non collectif",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "5. Crédit en cours et vente-rachat" },
      {
        type: "p",
        text: "Tableau d'amortissement, IRA (indemnités de remboursement anticipé), accord de la banque : le notaire en a besoin pour solder le prêt le jour de l'acte. Si vous rachetez dans la foulée, cadrez un <a href=\"./pret-relais-vente-rachat-enchaine-2026.html\">prêt relais</a> et une <a href=\"../pret-immobilier/nancy-metropole/\">capacité sur Nancy métropole</a> avant de signer. <a href=\"../landings/credit-immo.html?utm_content=docs-vente-credit\">étude crédit</a>.",
      },
      {
        type: "p",
        text: "On ne tient pas le rôle du notaire. On vous aide à <strong>prioriser les pièces manquantes</strong>, à coller estimation et dossier, et à recroiser des acquéreurs. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=docs-cta\">Parler de ma vente</a> · <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">vente 3D (divorce, décès, déménagement)</a>.",
      },
    ],
    related: [
      { href: "./diagnostics-immobiliers-obligatoires-vente-2026.html", label: "Diagnostics vente" },
      { href: "./divorce-vente-maison-ex-conjoint-refuse-prix.html", label: "Divorce et vente" },
      { href: "../landings/chasseur-bien.html", label: "Chasseur de bien" },
    ],
    faq: [
      {
        q: "Combien de temps pour réunir toutes les pièces ?",
        a: "Comptez 2 à 6 semaines selon le syndic, le notaire de la précédente vente et les diagnostics. Ne mettez pas l'annonce en ligne sans DPE.",
      },
      {
        q: "Le syndic peut-il retarder la vente ?",
        a: "Un état daté ou des charges impayées ralentissent l'acte. Demandez les documents d'AG et le solde dès la mise en vente.",
      },
    ],
  },
  {
    file: "diagnostics-location-ddt-bailleur-2026.html",
    section: "finance",
    tag: "Location",
    tagClass: "tag-habitation",
    themes: ["habitat", "dpe", "vendeur"],
    title: "Diagnostics location 2026 : ce que le bailleur doit annexer au bail",
    description:
      "DPE, CREP, ERP, gaz, électricité, surface habitable : DDT location, durées de validité, DPE G interdit. Checklist bailleur 2026.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Louer en 2026 : diagnostics du bail, DPE G, ce qui est dû au locataire.",
    keywords: [
      "diagnostics location obligatoires 2026",
      "DDT location bailleur",
      "diagnostics bail DPE CREP ERP",
      "DPE G location interdite",
      "surface habitable loi Boutin location",
      "gaz électricité diagnostic location 6 ans",
    ],
    cta: { href: "../landings/location.html?utm_content=diagnostics-location-2026", label: "Parcours bailleur / location" },
    blocks: [
      {
        type: "p",
        text: "Mettre un logement en <strong>location</strong> sans le bon paquet de diagnostics, c'est s'exposer à un bail contestable et, pour un <strong>DPE G</strong>, à une <strong>interdiction de louer</strong>. La liste 2026 est plus courte qu'à la vente, mais les <strong>durées de validité diffèrent</strong> (gaz/élec : 6 ans à la location, 3 ans à la vente). <a href=\"../landings/location.html?utm_content=diagnostics-location\"><strong>Parler de mon bien à louer</strong></a> · <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">DPE G : louer ou vendre</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Les pièces annexées au bail" },
      {
        type: "ul",
        items: [
          "<strong>DPE</strong> — 10 ans ; obligatoire dans l'annonce et le bail. Classe G : location interdite (progression F ensuite).",
          "<strong>CREP (plomb)</strong> — logement avant 1949. 6 ans si présence ; illimité si négatif.",
          "<strong>ERP</strong> — état des risques, ~6 mois. À remettre au locataire.",
          "<strong>Gaz et électricité</strong> — installations de plus de 15 ans : <strong>6 ans</strong> à la location.",
          "<strong>Surface habitable (Boutin)</strong> — mentionnée au bail ; ce n'est pas le Carrez.",
        ],
      },
      { type: "h2", text: "2. DPE G / F : louer, rénover ou vendre ?" },
      {
        type: "p",
        text: "Un G ne se loue plus. Un F se rapproche de l'échéance. Travaux, décote à la vente, ou sortie du parc locatif : ce n'est pas le même calcul. <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=location-dpe-vente\">estimer une vente plutôt qu'une location</a> · <a href=\"../landings/projection-achat.html?utm_content=location-travaux\">projection avec travaux</a>.",
      },
      { type: "h2", text: "3. Recyclage vente ↔ location" },
      {
        type: "p",
        text: "Un diagnostic gaz/élec de vente (3 ans) reste bon pour louer s'il n'est pas périmé. L'inverse est faux : un dossier location de 5 ans peut être trop vieux pour un compromis de vente. Avant d'enchaîner vente après location, revoyez les dates. <a href=\"./diagnostics-immobiliers-obligatoires-vente-2026.html\">checklist vente</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Nancy métropole : bailleurs et passoires" },
      {
        type: "p",
        text: "Sur Nancy, Jarville, Varangéville, un stock de copropriétés mal isolées pèse sur les bailleurs. Si le DPE tue la location, on recadre prix de vente, travaux et, le cas échéant, un <a href=\"../pret-immobilier/nancy-metropole/\">financement local</a>. <a href=\"../landings/syndic.html?utm_content=diagnostics-syndic\">syndic / copro</a> · <a href=\"../landings/credit-immo.html?utm_content=diagnostics-location-credit\">crédit travaux</a>.",
      },
      {
        type: "p",
        text: "<a href=\"../landings/location.html?utm_content=diagnostics-cta\">Je mets en location</a> · <a href=\"../landings/acheteur-immo.html?role=vendeur&utm_content=location-vers-vente\">je vends plutôt</a>.",
      },
    ],
    related: [
      { href: "./diagnostics-immobiliers-obligatoires-vente-2026.html", label: "Diagnostics vente" },
      { href: "./loi-carrez-surface-appartement-vente-2026.html", label: "Carrez vs Boutin" },
      { href: "../immobilier/location/", label: "Hub location" },
    ],
    faq: [
      {
        q: "Le locataire peut-il exiger les diagnostics après signature ?",
        a: "Ils doivent être annexés au bail. Un oubli se corrige, mais un DPE G expose à l'interdiction de louer — ce n'est pas cosmétique.",
      },
      {
        q: "Dois-je refaire le DPE entre deux locataires ?",
        a: "Non s'il est encore dans les 10 ans et qu'aucun travaux n'a changé la performance. Vérifiez la date sur le rapport.",
      },
    ],
  },
];
