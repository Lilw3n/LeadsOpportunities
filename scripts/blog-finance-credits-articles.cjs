/**
 * Cluster blog crédits hors immo : RAC, conso, relais, pro, renégociation.
 * Chargé par blog-articles-manifest.cjs.
 */
module.exports = [
  {
    file: "regroupement-credits-baisser-mensualites-2026.html",
    section: "finance",
    tag: "Rachat",
    tagClass: "tag-immo",
    themes: ["emprunteur", "rachat"],
    title: "Regroupement de credits 2026 : baisser ses mensualites sans se tromper",
    description:
      "RAC / regroupement : comment baisser la mensualite, ce que coutent IRA et duree, quand ca vaut le coup. Courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Baisser la mensualite via un regroupement : le calcul avant de signer.",
    keywords: [
      "regroupement de credits",
      "rachat de credits mensualites",
      "RAC baisse mensualite",
      "consolidation credits France",
    ],
    cta: { href: "../landings/rachat.html?utm_content=mensualites", label: "Chiffrer ma nouvelle mensualite" },
    blocks: [
      {
        type: "p",
        text: "Le <strong>regroupement de credits</strong> (RAC) fusionne plusieurs prets en une mensualite. L objectif n 1 est souvent de <strong>respirer chaque mois</strong> — pas d obtenir le taux le plus bas du marche. En 2026, ca reste un outil utile si auto + conso + immo s additionnent trop haut, ou si un projet immo bute sur le <strong>35 % HCSF</strong>. <a href=\"../landings/rachat.html?utm_content=mensualites\"><strong>Faire etudier un rachat</strong></a> · <a href=\"../rachat-credit/\">hub rachat</a> · <a href=\"./rachat-vs-renegociation-pret-2026.html\">rachat vs renegociation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que le regroupement change (et ce qu il ne change pas)" },
      {
        type: "ul",
        items: [
          "Une mensualite a la place de plusieurs prelevements",
          "Souvent une duree plus longue → mensualite plus basse, cout total parfois plus eleve",
          "Les revolving doivent etre soldes, sinon le gain s evapore",
          "Ce n est pas un effacement de dette ni une solution magique FICP",
        ],
      },
      { type: "h2", text: "2. Le seul chiffre qui compte : mensualite vs cout total" },
      {
        type: "p",
        text: "Passer de 1 200 € a 780 €/mois peut justifier un rachat meme si vous payez plus d interets sur 15 ans. A l inverse, si vos credits conso se terminent dans 18 mois, solder ou attendre peut etre plus malin. Un courtier pose les deux colonnes : <strong>confort mensuel</strong> et <strong>facture globale</strong> (IRA + dossier + assurance).",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Mix immo + conso ou conso seul" },
      {
        type: "p",
        text: "Avec un pret immobilier, le rachat s appuie souvent sur le bien. Sans bien, le rachat conso reste possible dans des enveloppes plus petites. Detail : <a href=\"./rachat-credits-mix-immo-conso-2026.html\">mix immo + conso</a>.",
      },
      { type: "h2", text: "4. Pieces utiles des le premier echange" },
      {
        type: "ul",
        items: [
          "Tableaux d amortissement / releves des credits",
          "3 releves de comptes, bulletins de salaire ou bilans TNS",
          "Estimation du bien si hypotheque envisagee",
        ],
      },
    ],
    related: [
      { href: "../rachat-credit/", label: "Hub rachat de credits" },
      { href: "../rachat-credit/mensualites/", label: "Page mensualites" },
      { href: "./rachat-credit-immobilier-guide-2026.html", label: "Guide rachat immo" },
      { href: "../landings/rachat.html", label: "Landing rachat" },
    ],
  },
  {
    file: "rachat-vs-renegociation-pret-2026.html",
    section: "finance",
    tag: "Rachat",
    tagClass: "tag-immo",
    themes: ["emprunteur", "rachat"],
    title: "Rachat de credits ou renegociation de pret : que choisir en 2026 ?",
    description:
      "Rachat externe vs renegociation interne : frais, IRA, regroupement d autres credits. Guide pour choisir. Courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Rester dans sa banque ou tout racheter : le comparatif frais / gain.",
    keywords: [
      "rachat vs renegociation",
      "renegocier pret ou racheter",
      "IRA rachat credit",
      "renegociation pret immobilier",
    ],
    cta: { href: "../landings/renegociation.html?utm_content=vs-rachat", label: "Comparer rachat et renegociation" },
    blocks: [
      {
        type: "p",
        text: "Deux leviers pour baisser un pret : la <strong>renegociation</strong> (meme banque) et le <strong>rachat</strong> (autre etablissement, parfois avec d autres credits). En 2026, on compare d abord l ecart de taux, les <strong>IRA</strong> et l envie de regrouper du conso. <a href=\"../landings/renegociation.html\"><strong>Etude renegociation</strong></a> · <a href=\"../landings/rachat.html\">etude rachat</a> · <a href=\"../renegociation-pret/\">hub renegociation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Renegociation : moins de paperasse, moins de frais" },
      {
        type: "p",
        text: "Vous restez client. La banque peut baisser le taux ou ajuster la duree. Souvent moins d IRA qu un rachat externe. Limite : elle n a pas d interet a tout ceder, et elle ne regroupera pas vos credits conso d une autre enseigne.",
      },
      { type: "h2", text: "2. Rachat : plus souple, plus de frais potentiels" },
      {
        type: "p",
        text: "Changer de banque permet de <strong>fusionner immo + conso</strong> et de viser une mensualite unique. Contrepartie : IRA sur l ancien pret, garantie, nouvelle assurance. Voir <a href=\"./regroupement-credits-baisser-mensualites-2026.html\">baisse de mensualites</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Une regle simple pour demarrer" },
      {
        type: "ul",
        items: [
          "Un seul pret immo, taux trop haut, pas d autres credits → renegociation d abord",
          "Plusieurs lignes + mensualite trop haute → rachat / regroupement",
          "Banque actuelle refuse → rachat externe",
        ],
      },
    ],
    related: [
      { href: "../renegociation-pret/", label: "Hub renegociation" },
      { href: "../rachat-credit/", label: "Hub rachat" },
      { href: "./renegociation-pret-immobilier-taux-2026.html", label: "Guide renegociation" },
      { href: "../landings/rachat.html", label: "Landing rachat" },
    ],
  },
  {
    file: "rachat-credits-mix-immo-conso-2026.html",
    section: "finance",
    tag: "Rachat",
    tagClass: "tag-immo",
    themes: ["emprunteur", "rachat"],
    title: "Rachat mix immo + credits conso : comment ca se monte",
    description:
      "Regrouper pret immobilier et credits consommation : hypotheque, quotite, mensualite. Guide courtier ORIAS 2026.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Fusionner le pret immo et les consos : garantie, plafonds, pieges.",
    keywords: [
      "rachat credit immobilier et conso",
      "regroupement pret immo credits conso",
      "RAC hypothecaire",
      "solder credits avant emprunter",
    ],
    cta: { href: "../landings/rachat.html?utm_content=mix-immo-conso", label: "Etudier un rachat mixte" },
    blocks: [
      {
        type: "p",
        text: "Le cas le plus frequent en RAC : un <strong>pret immobilier</strong> encore long, plus 1 a 3 <strong>credits conso</strong> (auto, travaux, revolving). Les solder dans le rachat peut faire redescendre l endettement sous le seuil HCSF et deverrouiller un nouveau projet — ou simplement le budget. <a href=\"../landings/rachat.html\"><strong>Etude rachat mixte</strong></a> · <a href=\"../rachat-credit/regroupement/\">page regroupement</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi le bien change tout" },
      {
        type: "p",
        text: "La garantie hypothecaire (ou privilege de preteur) permet des montants et des durees plus longs. Sans bien, on reste sur un rachat conso, plus petit. L estimation du logement et le capital restant du pret actuel determinent la marge.",
      },
      { type: "h2", text: "2. Revolving : a solder, pas a « oublier »" },
      {
        type: "p",
        text: "Une reserve d argent qui reste ouverte detruit le gain du rachat. Le montage predit le solde des revolving. Si vous en rouvrez un le mois suivant, le dossier n avait aucun interet.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Pret immo refuse a cause des consos" },
      {
        type: "p",
        text: "Classique : trop de lignes conso → taux d endettement > ~35 %. Un rachat avant de representer le dossier immo est souvent plus propre qu un nouvel emprunt. Voir aussi <a href=\"./pret-refuse-rachat-credits-consommateurs.html\">refus a cause des consos</a> et <a href=\"../credit-immo/\">hub credit immo</a>.",
      },
    ],
    related: [
      { href: "../rachat-credit/regroupement/", label: "Regroupement" },
      { href: "../credit-conso/", label: "Credit conso" },
      { href: "../credit-immo/", label: "Credit immo" },
      { href: "../landings/rachat.html", label: "Landing rachat" },
    ],
  },
  {
    file: "credit-consommation-guide-france-2026.html",
    section: "finance",
    tag: "Conso",
    tagClass: "tag-immo",
    themes: ["emprunteur", "conso"],
    title: "Credit consommation 2026 : guide (travaux, auto, tresorerie)",
    description:
      "Credit conso en France : TAEG, duree, pret personnel vs affecte, endettement. Guide courtier ORIAS, sans angle gadget.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Le cadre du credit conso en France : projet, TAEG, capacite.",
    keywords: [
      "credit consommation",
      "credit conso France",
      "pret personnel 2026",
      "TAEG credit consommation",
      "credit travaux",
    ],
    cta: { href: "../landings/conso.html?utm_content=guide-conso", label: "Demander un credit conso" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>credit consommation</strong> finance un projet (travaux, vehicule, tresorerie) hors achat immobilier. Durees plus courtes, taux souvent plus eleves qu un pret immo, droit de retractation. Ce guide pose le cadre legal et le bon usage — pas un pretexte pour s endetter sur une console. <a href=\"../landings/conso.html\"><strong>Etude credit conso</strong></a> · <a href=\"../credit-conso/\">hub credit conso</a> · <a href=\"./credit-travaux-conso-guide-2026.html\">credit travaux</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pret personnel ou credit affecte" },
      {
        type: "ul",
        items: [
          "Affecte : fonds lies a une facture (auto, travaux) — parfois meilleur taux, moins de souplesse",
          "Personnel : usage libre, souvent un peu plus cher",
          "Revolving : a eviter comme solution de tresorerie permanente",
        ],
      },
      { type: "h2", text: "2. TAEG, duree, mensualite" },
      {
        type: "p",
        text: "Comparez le <strong>TAEG</strong>, pas le taux d appel. Allonger la duree baisse la mensualite mais augmente le cout. Au-dela de 60-84 mois, posez-vous la question d un autre montage (rachat, pret travaux plus long).",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Endettement et projet immo" },
      {
        type: "p",
        text: "Un conso signe aujourd hui pèse dans le 35 % demain. Si un achat immobilier est prevu dans l annee, parlez-en avant. Parfois un <a href=\"../rachat-credit/\">rachat</a> ou attendre vaut mieux qu un 4e pret.",
      },
      { type: "h2", text: "4. Pieces habituelles" },
      {
        type: "ul",
        items: [
          "Identite, justificatif de domicile",
          "Revenus (bulletins, avis d imposition, bilans TNS)",
          "Releves de comptes et credits en cours",
        ],
      },
    ],
    related: [
      { href: "../credit-conso/", label: "Hub credit conso" },
      { href: "../credit-conso/travaux/", label: "Credit travaux" },
      { href: "../credit-conso/tresorerie/", label: "Tresorerie" },
      { href: "../landings/conso.html", label: "Landing conso" },
    ],
  },
  {
    file: "credit-travaux-conso-guide-2026.html",
    section: "finance",
    tag: "Conso",
    tagClass: "tag-immo",
    themes: ["emprunteur", "conso"],
    title: "Credit travaux 2026 : conso, eco-PTZ ou pret immobilier ?",
    description:
      "Financer des travaux : credit consommation, eco-PTZ, pret immo. Cuisine, renovation, reste a charge. Courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Quel pret pour quels travaux : conso, eco-PTZ ou immo.",
    keywords: ["credit travaux", "pret travaux renovation", "eco-PTZ reste a charge", "credit conso travaux"],
    cta: { href: "../landings/conso.html?utm_content=travaux", label: "Etude credit travaux" },
    blocks: [
      {
        type: "p",
        text: "Cuisine, toiture, isolation : le bon financement depend du <strong>montant</strong> et d un pret immo deja en cours. Un <strong>credit conso</strong> va vite ; un <strong>eco-PTZ</strong> peut couvrir un bouquet energetique ; un gros chantier se discute parfois en rachat ou pret immo. <a href=\"../landings/conso.html\"><strong>Demander une etude travaux</strong></a> · <a href=\"../credit-conso/travaux/\">page credit travaux</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Petits montants : conso affecte" },
      {
        type: "p",
        text: "Devis artisan, duree 24 a 84 mois, retractation. Simple si l endettement le permet. Evitez de financer du confort sur du revolving.",
      },
      { type: "h2", text: "2. Renovation energetique : verifier l eco-PTZ" },
      {
        type: "p",
        text: "Sous conditions (bouquet de travaux, plafonds, installateur). Le reste a charge peut partir en conso. Ne cumulez pas les aides « au feeling » : demandez un chiffrage qui les deduit.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Gros travaux + pret immo en cours" },
      {
        type: "p",
        text: "Ajouter 25 000 € de conso peut casser un futur rachat ou un nouvel achat. Parfois mieux de <a href=\"../rachat-credit/\">regrouper</a> ou d attendre. Lien : <a href=\"./credit-consommation-guide-france-2026.html\">guide credit conso</a>.",
      },
    ],
    related: [
      { href: "../credit-conso/travaux/", label: "Hub credit travaux" },
      { href: "../credit-conso/", label: "Credit conso" },
      { href: "../landings/conso.html", label: "Landing conso" },
      { href: "../credit-immo/", label: "Credit immo" },
    ],
  },
  {
    file: "credit-tresorerie-foyer-guide-2026.html",
    section: "finance",
    tag: "Conso",
    tagClass: "tag-immo",
    themes: ["emprunteur", "conso"],
    title: "Credit tresorerie foyer : pret personnel plutot que revolving",
    description:
      "Besoin de tresorerie : pret personnel amortissable vs reserve revolving. Cout, duree, pieges. Courtier ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Tresorerie foyer : un pret avec une date de fin, pas une reserve sans fin.",
    keywords: ["credit tresorerie", "pret personnel tresorerie", "alternatives revolving", "rachat credits revolving"],
    cta: { href: "../landings/conso.html?utm_content=tresorerie", label: "Demander une tresorerie" },
    blocks: [
      {
        type: "p",
        text: "Un imprevu (voiture, sante, cash-flow) n oblige pas a ouvrir une <strong>reserve revolving</strong>. Un <strong>pret personnel</strong> a duree fixe a une date de fin et un TAEG comparable. Si plusieurs lignes tournent deja, un <strong>rachat</strong> peut etre plus propre. <a href=\"../landings/conso.html\"><strong>Etude tresorerie</strong></a> · <a href=\"../credit-conso/tresorerie/\">page tresorerie</a> · <a href=\"../rachat-credit/\">rachat</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Pourquoi le revolving coute cher" },
      {
        type: "p",
        text: "Taux eleves, minimum de remboursement, dette qui ne se termine jamais si on reutilise la reserve. Pour un besoin ponctuel, un pret amortissable est en general plus honnete.",
      },
      { type: "h2", text: "2. Quand preferer un rachat" },
      {
        type: "p",
        text: "Trois consos + un revolving : ajouter un 4e pret aggrave le probleme. Un regroupement lisse et solde les reserves. Voir <a href=\"./regroupement-credits-baisser-mensualites-2026.html\">baisse de mensualites</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Montant justifie" },
      {
        type: "p",
        text: "Les partenaires demandent un objet (meme large). Un montant coherent avec les revenus passe mieux qu une enveloppe « au cas ou ».",
      },
    ],
    related: [
      { href: "../credit-conso/tresorerie/", label: "Hub tresorerie" },
      { href: "../rachat-credit/", label: "Rachat de credits" },
      { href: "../landings/conso.html", label: "Landing conso" },
      { href: "./credit-consommation-guide-france-2026.html", label: "Guide conso" },
    ],
  },
  {
    file: "pret-relais-vente-achat-guide-2026.html",
    section: "finance",
    tag: "Relais",
    tagClass: "tag-immo",
    themes: ["emprunteur", "relais"],
    title: "Pret relais 2026 : vendre et racheter sans rater le bien",
    description:
      "Pret relais : acheter avant d avoir vendu. Quotite, compromis, pret d acquisition. Guide courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Pont vente / achat : comment le relais se calcule vraiment.",
    keywords: ["pret relais", "credit relais achat vente", "quotite pret relais", "acheter avant de vendre"],
    cta: { href: "../landings/pret-relais.html?utm_content=vente-achat", label: "Etudier un pret relais" },
    blocks: [
      {
        type: "p",
        text: "Vous vendez un logement et en achetez un autre. Attendre la vente, c est souvent <strong>perdre le bien vise</strong>. Le <strong>pret relais</strong> avance une partie de la valeur du bien a vendre pour signer l achat. Ce n est pas magique : quotite, interets du pont et plan B si la vente tarde. <a href=\"../landings/pret-relais.html\"><strong>Chiffrer un relais</strong></a> · <a href=\"../pret-relais/\">hub pret relais</a> · <a href=\"../landings/acheteur-immo.html?role=les_deux\">parcours vente + achat</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Relais sec vs relais-acquisition" },
      {
        type: "ul",
        items: [
          "Relais sec : seulement le pont, si l apport apres vente couvre le nouvel achat",
          "Relais-acquisition : pont + pret principal sur le nouveau bien",
          "Le bon schema depend du prix de vente net, du prix d achat et du timing notaire",
        ],
      },
      { type: "h2", text: "2. La quotite n est pas 100 %" },
      {
        type: "p",
        text: "Les banques avancent souvent <strong>60 a 80 %</strong> de l estimation (parfois plus avec un compromis solide). Le reste, c est votre marge de securite si le prix baisse. Une estimation trop optimiste est le piege n 1.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Calendrier type" },
      {
        type: "p",
        text: "Estimation → compromis d achat (condition suspensive pret) → offre relais + acquisition → signature → remboursement du relais a la vente. Detail duree / taux : <a href=\"./pret-relais-duree-taux-quand-utiliser-2026.html\">quand utiliser un relais</a>.",
      },
    ],
    related: [
      { href: "../pret-relais/", label: "Hub pret relais" },
      { href: "../credit-immo/", label: "Credit immo" },
      { href: "../recherche-bien/", label: "Recherche de bien" },
      { href: "../landings/pret-relais.html", label: "Landing relais" },
    ],
  },
  {
    file: "pret-relais-duree-taux-quand-utiliser-2026.html",
    section: "finance",
    tag: "Relais",
    tagClass: "tag-immo",
    themes: ["emprunteur", "relais"],
    title: "Pret relais : duree, taux, quand l utiliser (et quand eviter)",
    description:
      "Duree typique 12-24 mois, interets souvent seuls, risques si la vente tarde. Guide pret relais 2026.",
    meta: "8 min · Août 2026",
    cardExcerpt: "12 a 24 mois, interets du pont, plan B si le bien ne part pas.",
    keywords: ["duree pret relais", "taux pret relais", "interets pret relais", "pret relais risques"],
    cta: { href: "../landings/pret-relais.html?utm_content=duree-taux", label: "Simuler duree et cout relais" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>pret relais</strong> dure en general <strong>12 a 24 mois</strong>. Pendant cette periode, vous payez souvent les <strong>interets seuls</strong> (pas le capital). Si la vente glisse, le compteur tourne — d ou l interet d une estimation prudente et d un plan B. <a href=\"../landings/pret-relais.html\"><strong>Etude pret relais</strong></a> · <a href=\"./pret-relais-vente-achat-guide-2026.html\">guide vente + achat</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Quand le relais est pertinent" },
      {
        type: "ul",
        items: [
          "Bien a vendre liquide (secteur demande, prix coherent)",
          "Bien vise rare / delai notaire serre",
          "Apport apres vente suffisant pour tenir le nouvel emprunt",
        ],
      },
      { type: "h2", text: "2. Quand l eviter" },
      {
        type: "p",
        text: "Bien atypique, prix trop haut, marche local lent, ou vous n avez aucune marge si la vente rate de 10 %. Mieux vaut vendre d abord, ou viser une condition suspensive plus large.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Cout du pont" },
      {
        type: "p",
        text: "Le taux du relais n est pas celui du pret 25 ans. Multipliez interets mensuels × duree realiste (pas la duree optimiste). Ajoutez charges des deux logements (taxe fonciere, energie) le temps du chevauchement.",
      },
    ],
    related: [
      { href: "../pret-relais/", label: "Hub pret relais" },
      { href: "../landings/pret-relais.html", label: "Landing relais" },
      { href: "../credit-immo/", label: "Credit immo" },
      { href: "./pret-relais-vente-achat-guide-2026.html", label: "Vente + achat" },
    ],
  },
  {
    file: "credit-professionnel-tns-entreprise-2026.html",
    section: "finance",
    tag: "Credit pro",
    tagClass: "tag-immo",
    themes: ["emprunteur", "pro"],
    title: "Credit professionnel 2026 : TNS, entreprise, materiel et BFR",
    description:
      "Credit pro pour TNS et societes : materiel, tresorerie, garanties BPI / caution. Guide courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Financer l activite : bilans, objet du pret, garanties.",
    keywords: [
      "credit professionnel",
      "pret pro TNS",
      "financement entreprise materiel",
      "credit BFR",
      "garantie BPI credit",
    ],
    cta: { href: "../landings/credit-pro.html?utm_content=tns", label: "Demander un credit pro" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>credit professionnel</strong> finance l outil de travail (materiel, vehicule, locaux, BFR), pas la residence principale. Le dossier se juge sur l <strong>activite</strong>, les <strong>bilans</strong> et les <strong>garanties</strong> — pas seulement sur le salaire. <a href=\"../landings/credit-pro.html\"><strong>Etude credit pro</strong></a> · <a href=\"../credit-pro/\">hub credit pro</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. TNS et petites structures" },
      {
        type: "p",
        text: "EI, micro, SARL, SAS : pieces differentes (avis d imposition, liasse, Kbis, SIREN). Beaucoup d independants mixent patrimoine perso et pro : un pret peut s appuyer sur un bien perso. Il faut le dire clairement pour rester lisible.",
      },
      { type: "h2", text: "2. Objet du financement" },
      {
        type: "ul",
        items: [
          "Materiel / vehicule : facture, duree alignee sur l usage",
          "BFR / tresorerie : justification d exploitation, pas un trou sans fond",
          "Locaux : parfois pret immo pro, pas un conso",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "3. Garanties" },
      {
        type: "p",
        text: "Caution du dirigeant, nantissement, hypotheque, parfois garantie BPI. L etude dit ce qui est exige avant de deposer, pour eviter un refus « surprise ».",
      },
      { type: "h2", text: "4. Creation recente" },
      {
        type: "p",
        text: "Sans 2-3 ans de bilans, le credit classique est plus dur. D autres montages existent ; on ne promet pas l impossible.",
      },
    ],
    related: [
      { href: "../credit-pro/", label: "Hub credit pro" },
      { href: "../landings/credit-pro.html", label: "Landing credit pro" },
      { href: "../credit-immo/", label: "Credit immo" },
      { href: "../rachat-credit/", label: "Rachat" },
    ],
  },
  {
    file: "renegociation-pret-immobilier-taux-2026.html",
    section: "finance",
    tag: "Renegociation",
    tagClass: "tag-immo",
    themes: ["emprunteur", "renegociation"],
    title: "Renegociation de pret immobilier 2026 : quel ecart de taux vise-t-on ?",
    description:
      "Renegocier son credit immo : ecart de taux, IRA, duree restante, assurance Lemoine. Alternative au rachat. Courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Chez votre banque d abord : calcul d economie vs frais.",
    keywords: [
      "renegociation pret immobilier",
      "baisser taux credit 2026",
      "ecart taux renegociation",
      "IRA pret immobilier",
    ],
    cta: { href: "../landings/renegociation.html?utm_content=taux-2026", label: "Etudier une renegociation" },
    blocks: [
      {
        type: "p",
        text: "Si votre pret a ete signe a un taux nettement au-dessus du marche 2026, une <strong>renegociation interne</strong> peut suffire — souvent moins de frais qu un rachat externe. On calcule l <strong>ecart de taux</strong>, le capital restant du et les IRA. <a href=\"../landings/renegociation.html\"><strong>Chiffrer une renegociation</strong></a> · <a href=\"../renegociation-pret/\">hub renegociation</a> · <a href=\"./rachat-vs-renegociation-pret-2026.html\">rachat vs renegociation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Un ordre de grandeur, pas une magie" },
      {
        type: "p",
        text: "On entend souvent « 0,7 a 1 point d ecart ». Ca depend de l encours et de la duree restante : 0,5 point sur 220 000 € a 18 ans peut valoir le coup ; 1 point sur un petit CRD, non. Le calcul se fait, il ne s affiche pas sur un bandeau pub.",
      },
      { type: "h2", text: "2. Assurance emprunteur en parallele" },
      {
        type: "p",
        text: "La loi Lemoine permet de changer d assurance a tout moment. Parfois l economie est la, meme si le taux du pret bouge peu. Lien : <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">loi Lemoine</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Si la banque dit non" },
      {
        type: "p",
        text: "On chiffre un <a href=\"../rachat-credit/\">rachat externe</a>. IRA + garantie + nouvelle assurance : le comparatif doit rester honnete. Si d autres credits conso pesent, le rachat mixte peut etre le vrai sujet.",
      },
    ],
    related: [
      { href: "../renegociation-pret/", label: "Hub renegociation" },
      { href: "../rachat-credit/", label: "Rachat" },
      { href: "../credit-immo/", label: "Credit immo" },
      { href: "../landings/renegociation.html", label: "Landing renegociation" },
    ],
  },
];
