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
    file: "louer-appartement-nancy-54-locataire-2026.html",
    section: "finance",
    tag: "Location",
    tagClass: "tag-immo",
    themes: ["location", "locataire", "nancy"],
    title: "Louer un appartement à Nancy (54) : critères, dossier, assurances 2026",
    description:
      "Chercher une location à Nancy, Lunéville, Varangéville : budget, dossier locataire, visites, assurance habitation. Matching local, pas un portail anonyme.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Location Nancy 54 : dossier, visites, MRH locataire — un interlocuteur.",
    keywords: [
      "location appartement Nancy",
      "chercher location Nancy 54",
      "location Lunéville Varangéville",
      "dossier locataire Nancy",
      "assurance habitation locataire Nancy",
    ],
    cta: {
      href: "../landings/location.html?role=locataire&utm_content=location-nancy-locataire",
      label: "Décrire le logement que je cherche",
    },
    blocks: [
      {
        type: "p",
        text: "Vous cherchez une <strong>location à Nancy</strong>, Lunéville, Varangéville ou Jarville — et les portails vous noient sous des annonces déjà louées ? Un <strong>dossier locataire</strong> incomplet, un budget mal calé, une visite ratée : le marché 54 reste tendu sur les T2/T3 corrects. On inverse la logique : vos critères d’abord, le matching ensuite. <a href=\"../landings/location.html?role=locataire&utm_content=location-nancy-intro\"><strong>Décrire mon besoin de location</strong></a> · <a href=\"../immobilier/location/\">hub location locataire &amp; bailleur</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Caler le budget réel (pas seulement le loyer)" },
      {
        type: "p",
        text: "Le loyer affiché n’est pas le coût mensuel. Ajoutez <strong>charges</strong>, assurance habitation locataire, parfois parking, et un reste à vivre réaliste. Les bailleurs sérieux filtrent trop juste. Un T2 Nancy centre n’a pas le même loyer qu’un T2 à Jarville ou Dombasle : dites la <strong>ville prioritaire</strong> et 1–2 communes de repli.",
      },
      {
        type: "ul",
        items: [
          "Loyer max charges comprises (chiffre honnête)",
          "Surface mini, pièces, étage, extérieur",
          "Meublé / nu / indifférent",
          "Animaux, date d’entrée, durée souhaitée",
        ],
      },
      { type: "h2", text: "2. Un dossier que le bailleur ouvre vraiment" },
      {
        type: "p",
        text: "Pièce d’identité, justificatif de revenus, contrat de travail ou avis d’imposition, garant si besoin : le dossier type n’a pas changé, mais <strong>l’ordre et la lisibilité</strong> si. Un PDF unique, à jour, sans 40 photos de bulletins, accélère la décision. On peut relayer votre dossier vers des bailleurs du bassin — sans promettre un logement magique le lendemain.",
      },
      { type: "h2", text: "3. Assurance locataire : obligatoire, pas un détail" },
      {
        type: "p",
        text: "L’<strong>assurance habitation locataire</strong> (risques locatifs) est exigée à la remise des clés. Colocation : clarifier qui est assuré. Sous-location : souvent exclue. Une fois le logement trouvé, on peut enchaîner un devis MRH. Voir <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">locataire vs propriétaire</a> et <a href=\"./canicule-orage-inondation-cave-assurance-locataire.html\">cave inondée en location</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Pourquoi un parcours local (pas un comparateur national)" },
      {
        type: "p",
        text: "On ne « scrape » pas Leboncoin pour vous. Le matching sert le <strong>bassin Nancy / Lunéville / Varangéville</strong> : biens suivis, bailleurs déjà en mandat, ou critères trop précis pour un portail. Vous restez libre. <a href=\"../landings/location.html?role=locataire&utm_content=location-nancy-cta\">Lancer ma recherche</a> · <a href=\"../landings/questionnaire.html?need=location&journey=standard&utm_content=location-nancy-quest\">questionnaire location (3 min)</a> · <a href=\"../pret-immobilier/nancy-metropole/\">si le projet devient un achat</a>.",
      },
    ],
    related: [
      { href: "./mettre-appartement-en-location-mandat-pno-gli-2026.html", label: "Bailleur : mettre en location" },
      { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "Assurance PNO" },
      { href: "../immobilier/location/", label: "Hub location 54" },
    ],
    faq: [
      {
        q: "Faut-il un garant pour louer à Nancy ?",
        a: "Souvent oui pour un primo-locataire ou des revenus justes. Visale, parent, ou caution : selon le bailleur. Indiquez-le dans le questionnaire.",
      },
      {
        q: "Vous avez des appartements exclusifs ?",
        a: "Des biens en mandat location, oui — pas un stock secret. Le questionnaire sert à matcher, pas à inventer des clés.",
      },
      {
        q: "L’assurance habitation est-elle obligatoire ?",
        a: "Oui pour le locataire (risques locatifs). On peut comparer un contrat une fois le logement identifié.",
      },
    ],
  },
  {
    file: "mettre-appartement-en-location-mandat-pno-gli-2026.html",
    section: "finance",
    tag: "Bailleur",
    tagClass: "tag-immo",
    themes: ["location", "bailleur", "pno"],
    title: "Mettre un appartement en location : mandat, locataire, PNO et GLI (2026)",
    description:
      "Bailleur : mandat de location, recherche locataire, état des lieux, honoraires au m². PNO et garantie loyers impayés. Nancy, Lunéville, Varangéville.",
    meta: "11 min · Septembre 2026",
    cardExcerpt: "Bailleur 54 : mandat location, dossier locataire, PNO / GLI.",
    keywords: [
      "mettre appartement en location",
      "mandat location Nancy",
      "gestion locative Meurthe-et-Moselle",
      "PNO GLI bailleur",
      "recherche locataire Nancy 54",
    ],
    cta: {
      href: "../landings/location.html?role=bailleur&utm_content=location-bailleur",
      label: "Mandat location — décrire mon bien",
    },
    blocks: [
      {
        type: "p",
        text: "Vous voulez <strong>mettre un appartement ou une maison en location</strong> (Nancy, Lunéville, Varangéville, Jarville) sans y passer vos week-ends : annonces, dossiers fantaisistes, no-show, état des lieux. Un <strong>mandat de location</strong> cadre la recherche locataire, les honoraires au m² (barème public) et, si besoin, <strong>PNO</strong> et <strong>GLI</strong>. <a href=\"../landings/location.html?role=bailleur&utm_content=location-bailleur-intro\"><strong>Décrire le bien à louer</strong></a> · <a href=\"../immobilier/location/\">parcours location</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Mandat location ≠ gestion locative à vie" },
      {
        type: "p",
        text: "Le mandat location, c’est surtout <strong>trouver le locataire</strong> : estimation du loyer, annonce, visites, sélection du dossier, état des lieux. La gestion courante (quittances, sinistres, relances) peut venir ensuite — ce n’est pas automatique. On ne mélange pas avec un mandat de vente.",
      },
      {
        type: "ul",
        items: [
          "Loyer cible et charges (comparables du 54, pas un souhait)",
          "Meublé, nu, saisonnier : fiscalité et bail différents",
          "DPE : un G ne se loue plus — voir <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">passoire énergétique</a>",
          "Honoraires : forfaits TTC / m² selon zone — <a href=\"../bareme-honoraires/\">barème public</a>",
        ],
      },
      { type: "h2", text: "2. Choisir le locataire sans bricoler" },
      {
        type: "p",
        text: "Un « bon feeling » ne remplace pas un dossier. Revenus, stabilité, garant, cohérence du projet : on documente. Mieux vaut 10 jours de vacance qu’un impayé de 8 mois. Les visites groupées et un unique interlocuteur évitent les allers-retours.",
      },
      { type: "h2", text: "3. PNO et GLI : deux filets différents" },
      {
        type: "p",
        text: "La <strong>PNO</strong> (propriétaire non occupant) couvre le bien quand vous n’y habitez pas — dégât des eaux, incendie, RC. La <strong>GLI</strong> (loyers impayés) est un autre contrat, avec conditions d’éligibilité du locataire. Les deux se discutent <em>avec</em> le mandat, pas « plus tard si ça va mal ». Guide : <a href=\"./pno-bailleur-proprietaire-non-occupant.html\">assurance PNO</a> · <a href=\"./rentree-2026-investissement-locatif-encore-rentable.html\">investissement locatif 2026</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Lots en copropriété : le syndic ne gère pas votre locataire" },
      {
        type: "p",
        text: "Le <strong>syndic</strong> gère l’immeuble (charges, AG, travaux). Il ne sélectionne pas votre locataire et ne fait pas l’état des lieux. Si les charges explosent, c’est un autre dossier. <a href=\"./changer-syndic-copropriete-mise-en-concurrence-2026.html\">Changer de syndic</a> · <a href=\"../landings/location.html?role=bailleur&utm_content=location-bailleur-cta\">déposer le bien en location</a> · <a href=\"../landings/questionnaire.html?need=location&journey=standard&utm_content=location-bailleur-quest\">questionnaire bailleur</a>.",
      },
    ],
    related: [
      { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "PNO bailleur" },
      { href: "./louer-appartement-nancy-54-locataire-2026.html", label: "Côté locataire" },
      { href: "../landings/syndic.html", label: "Devis syndic" },
    ],
    faq: [
      {
        q: "Puis-je louer un DPE G en 2026 ?",
        a: "Les logements classés G sont interdits à la location (progression F ensuite). Travaux ou vente : on cadre avant le mandat.",
      },
      {
        q: "La GLI accepte-t-elle tous les locataires ?",
        a: "Non. Plafonds de loyer, taux d’effort, pièces du dossier : l’assureur filtre. On le dit avant de promettre une garantie.",
      },
      {
        q: "Les honoraires sont-ils à la charge du locataire ou du bailleur ?",
        a: "Selon les postes (visite, dossier, EDL) et la zone tendue. Le barème public détaille les forfaits au m².",
      },
    ],
  },
  {
    file: "changer-syndic-copropriete-mise-en-concurrence-2026.html",
    section: "finance",
    tag: "Syndic",
    tagClass: "tag-immo",
    themes: ["syndic", "copropriete", "nancy"],
    title: "Changer de syndic de copropriété : mise en concurrence, charges, AG (2026)",
    description:
      "Conseil syndical, fin de mandat, charges trop élevées : comment changer de syndic sans improvisation. Devis local Nancy, Lunéville, Varangéville — Loi Hoguet.",
    meta: "10 min · Septembre 2026",
    cardExcerpt: "Syndic 54 : mise en concurrence, charges, AG — devis cadré.",
    keywords: [
      "changer de syndic",
      "mise en concurrence syndic",
      "syndic copropriété Nancy",
      "charges copropriété trop élevées",
      "conseil syndical devis syndic",
    ],
    cta: {
      href: "../landings/syndic.html?utm_content=syndic-concurrence",
      label: "Demander un devis syndic",
    },
    blocks: [
      {
        type: "p",
        text: "Charges en hausse, AG tendue, syndic injoignable, fin de mandat : le <strong>conseil syndical</strong> veut <strong>mettre en concurrence</strong> — sans se tromper de procédure. Changer de syndic n’est pas un clic : contrat en cours, préavis, vote en AG, contrat-type. Sur Nancy, Lunéville, Varangéville et Jarville, on étudie d’abord lots, travaux et règlement. <a href=\"../landings/syndic.html?utm_content=syndic-intro\"><strong>Décrire la copropriété</strong></a> · <a href=\"../immobilier/syndic/\">hub syndic 54</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que le syndic fait (et ne fait pas)" },
      {
        type: "p",
        text: "Le syndic exécute les décisions d’AG, appelle les charges, suit les prestataires, représente le syndicat. Il ne vend pas vos lots et ne gère pas le locataire d’un bailleur. Activité <strong>réglementée (Loi Hoguet)</strong> : carte professionnelle Gestion et garantie financière. Selon le dossier, mandat en direct <em>ou</em> mise en relation avec un syndic habilité — rien sans écrit.",
      },
      {
        type: "ul",
        items: [
          "Nombre de lots (approx.) et usage (habité, loué, mixte)",
          "Syndic actuel : professionnel, bénévole, ou aucun",
          "Travaux votés (ravalement, toiture, ascenseur)",
          "Griefs concrets : délais, honoraires, litiges",
        ],
      },
      { type: "h2", text: "2. Mise en concurrence : le calendrier compte" },
      {
        type: "p",
        text: "On ne « vire » pas un syndic du jour au lendemain. Le contrat fixe durée et préavis ; le vote se fait en <strong>assemblée générale</strong>, avec un contrat alternatif à comparer. Un dossier lisible pour le conseil syndical (honoraires, astreinte, suivi travaux) évite le débat émotionnel. L’académie interne : <a href=\"../academie/immobilier/copropriete.html\">lire charges et copro</a>.",
      },
      { type: "h2", text: "3. Charges élevées : syndic ou immeuble ?" },
      {
        type: "p",
        text: "Parfois l’honoraires syndic est le problème. Parfois ce sont le <strong>chauffage collectif</strong>, un ravalement, un contentieux, un fonds travaux trop bas. Avant de changer pour « payer moins », on sépare : poste syndic vs poste immeuble. Sinon le prochain contrat décevra autant.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Copro récente, syndic bénévole, lots loués" },
      {
        type: "p",
        text: "Immeuble neuf ou livré récemment : règlement, AE, fonds travaux à poser tôt. Syndic bénévole épuisé : bascule vers un professionnel avant l’incident. Bailleurs dans l’immeuble : le mandat location est un autre parcours. <a href=\"../landings/syndic.html?utm_content=syndic-cta\">Devis syndic</a> · <a href=\"../landings/questionnaire.html?need=syndic&journey=standard&utm_content=syndic-quest\">questionnaire copro (3 min)</a> · <a href=\"./mettre-appartement-en-location-mandat-pno-gli-2026.html\">lots à louer</a>.",
      },
    ],
    related: [
      { href: "../immobilier/syndic/", label: "Hub syndic Nancy 54" },
      { href: "./mettre-appartement-en-location-mandat-pno-gli-2026.html", label: "Location bailleur" },
      { href: "../academie/immobilier/copropriete.html", label: "Cours copropriété" },
    ],
    faq: [
      {
        q: "Peut-on changer de syndic en cours d’année ?",
        a: "Oui si le contrat et le vote d’AG le permettent (révocation, terme, préavis). Le notaire / le contrat-type précisent les règles — on ne force pas.",
      },
      {
        q: "Vous êtes syndic sur tout le Grand Est ?",
        a: "Priorité bassin Nancy / Lunéville / Varangéville. Pas de promesse nationale. Selon le mandat : gestion directe ou partenaire habilité.",
      },
      {
        q: "Faut-il déjà un PV d’AG pour demander un devis ?",
        a: "Non. Nombre de lots, ville, griefs et travaux connus suffisent pour un premier cadrage.",
      },
    ],
  },
];
