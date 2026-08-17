/**
 * Hubs SEO financement hors crédit immo (RAC, conso, relais, pro, renégociation).
 * Branché dans generate-seo-pages.cjs via buildFinanceHubPages(page).
 */
const LT = require("./seo-long-term-related.cjs");

function buildFinanceHubPages(page) {
  var FINANCE = LT.SILOS_FINANCE || [];
  return [
    page({
      file: "rachat-credit/index.html",
      theme: "credit",
      badge: "Rachat de credits",
      title: "Rachat de credits | Regroupement RAC — courtier",
      description:
        "Rachat de credits (RAC) et regroupement : baisse de mensualites, mix immo + conso, tresorerie. Courtier ORIAS, etude gratuite France.",
      h1: "Rachat et regroupement de credits",
      intro:
        "Plusieurs credits (immo, conso, auto, revolving) pèsent sur le budget. Un rachat les fusionne en une mensualite — souvent plus basse, parfois plus longue. Nous etudions faisabilite, frais (IRA) et cout total avant tout depot.",
      cta: { href: "/landings/rachat.html", label: "Etudier mon rachat" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Rachat de credits", url: "/rachat-credit/" },
      ],
      benefits: [
        { title: "Mensualite unique", text: "Une ligne a la place de plusieurs prelevements." },
        { title: "Reste a vivre", text: "Objectif HCSF / 35 % si un pret immo suit." },
        { title: "Transparence des frais", text: "IRA, dossier, assurance : le vrai cout." },
      ],
      steps: [
        { title: "Encours", text: "Liste des credits, mensualites, capital restant." },
        { title: "Simulation", text: "Nouvelle duree, taux, economie mensuelle vs cout total." },
        { title: "Dossier", text: "Pieces, partenaires, offre si le rachat tient." },
      ],
      sections: [
        {
          h2: "RAC, rachat, regroupement : le meme outil",
          paragraphs: [
            "Rachat de credits, regroupement, consolidation : l operation solde les anciens prets pour n en ouvrir qu un. L interet est la mensualite, pas forcement le taux le plus bas du marche.",
            "Un mix immo + conso peut etre rachete avec garantie hypothecaire. Un rachat conso seul se monte sans bien, avec des plafonds plus bas.",
          ],
        },
        {
          h2: "Quand le rachat vaut le coup",
          list: [
            "Mensualites trop hautes / reste a vivre serre",
            "Credits revolving ou taux eleves a solder",
            "Projet immo bloque par l endettement HCSF",
            "Besoin de tresorerie en plus du lissage",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: "/rachat-credit/regroupement/", label: "Regroupement de credits" },
          { href: "/rachat-credit/mensualites/", label: "Baisser les mensualites" },
          { href: "/rachat-credit/villes/", label: "Rachat par ville" },
          { href: "/landings/rachat.html", label: "Landing rachat" },
          { href: "/credit-conso/", label: "Credit consommation" },
          { href: "/renegociation-pret/", label: "Renegociation de pret" },
          { href: "/credit-immo/", label: "Credit immobilier" },
          { href: "/blog/regroupement-credits-baisser-mensualites-2026.html", label: "Blog : baisse de mensualites" },
          { href: "/blog/rachat-vs-renegociation-pret-2026.html", label: "Rachat vs renegociation" },
        ],
        FINANCE
      ),
      faq: [
        {
          q: "Quelle difference entre rachat et renegociation ?",
          a: "La renegociation se fait avec votre banque actuelle. Le rachat change d etablissement et peut inclure d autres credits. On compare les frais des deux.",
        },
        {
          q: "Puis-je racheter si je suis fiché Banque de France ?",
          a: "C est plus difficile. Certains partenaires etudient au cas par cas ; l etude dit clairement si c est jouable ou non.",
        },
      ],
    }),
    page({
      file: "rachat-credit/regroupement/index.html",
      theme: "credit",
      badge: "Regroupement",
      title: "Regroupement de credits | RAC immo + conso",
      description:
        "Regroupement de credits : fusionner pret immobilier et credits conso. Courtier ORIAS, simulation mensualite et duree.",
      h1: "Regroupement de credits : une seule echeance",
      intro:
        "Le regroupement vise a simplifier le budget : une mensualite, un interlocuteur, un tableau d amortissement. Utile quand auto + conso + immo s additionnent au-dela du confort — ou du 35 % HCSF.",
      cta: { href: "/landings/rachat.html", label: "Simuler un regroupement" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Rachat de credits", url: "/rachat-credit/" },
        { name: "Regroupement", url: "/rachat-credit/regroupement/" },
      ],
      sections: [
        {
          h2: "Immo inclus ou conso seul",
          paragraphs: [
            "Avec un pret immobilier, le regroupement s appuie souvent sur le bien (hypotheque ou privilege). Sans bien, le rachat conso reste possible dans des enveloppes plus petites.",
          ],
        },
        {
          h2: "Points de vigilance",
          list: [
            "Allonger la duree baisse la mensualite mais augmente le cout total",
            "Les revolving doivent etre soldes pour que le gain soit reel",
            "Assurance emprunteur a recalculer sur le nouvel encours",
          ],
        },
      ],
      related: [
        { href: "/rachat-credit/", label: "Hub rachat" },
        { href: "/rachat-credit/mensualites/", label: "Mensualites" },
        { href: "/blog/rachat-credits-mix-immo-conso-2026.html", label: "Mix immo + conso" },
        { href: "/landings/rachat.html", label: "Etude rachat" },
      ],
      faq: [],
    }),
    page({
      file: "rachat-credit/mensualites/index.html",
      theme: "credit",
      badge: "Mensualites",
      title: "Baisser ses mensualites | Rachat de credits",
      description:
        "Baisser les mensualites via un rachat de credits : simulation, duree, reste a vivre. Courtier ORIAS France.",
      h1: "Baisser ses mensualites avec un rachat",
      intro:
        "L objectif n 1 du RAC est souvent une mensualite plus basse. Le levier principal est la duree. Nous chiffrons aussi le cout total pour eviter de payer trop cher un confort mensuel.",
      cta: { href: "/landings/rachat.html", label: "Chiffrer ma nouvelle mensualite" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Rachat de credits", url: "/rachat-credit/" },
        { name: "Mensualites", url: "/rachat-credit/mensualites/" },
      ],
      sections: [
        {
          h2: "Mensualite vs cout total",
          paragraphs: [
            "Passer de 1 200 € a 780 €/mois peut justifier un rachat meme si le cout total augmente. A l inverse, si vous etes proche de la fin des credits, solder ou renegocier peut etre plus malin.",
          ],
        },
      ],
      related: [
        { href: "/rachat-credit/", label: "Hub rachat" },
        { href: "/blog/regroupement-credits-baisser-mensualites-2026.html", label: "Guide mensualites 2026" },
        { href: "/credit-immo/", label: "Credit immobilier" },
      ],
      faq: [],
    }),
    page({
      file: "credit-conso/index.html",
      theme: "credit",
      badge: "Credit consommation",
      title: "Credit consommation | Travaux, auto, tresorerie",
      description:
        "Credit consommation en France : travaux, vehicule, projet perso, tresorerie. Courtier ORIAS, etude montant et duree.",
      h1: "Credit consommation : financer un projet sans tout casser",
      intro:
        "Un credit conso n est pas un pret immobilier : montants plus bas, durees plus courtes, taux souvent plus eleves. Nous calibrons le besoin (travaux, auto, tresorerie) et verifions que l endettement reste tenable.",
      cta: { href: "/landings/conso.html", label: "Demander un credit conso" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit consommation", url: "/credit-conso/" },
      ],
      benefits: [
        { title: "Projet clair", text: "Travaux, vehicule, perso ou tresorerie." },
        { title: "Capacite reelle", text: "Credits en cours et reste a vivre integres." },
        { title: "Alternative RAC", text: "Si trop de lignes, un rachat peut etre plus sain." },
      ],
      steps: [
        { title: "Projet et montant", text: "Objet, apport eventuel, duree visee." },
        { title: "Faisabilite", text: "Revenus, charges, autres credits." },
        { title: "Offre", text: "Partenaires conso, pieces, deblocage." },
      ],
      sections: [
        {
          h2: "Credit affecte ou pret personnel",
          paragraphs: [
            "Un credit auto ou travaux peut etre affecte (fonds lies a une facture). Un pret personnel est plus souple mais parfois plus cher. Nous expliquons le cadre legal (retractation, TAEG) sans jargon.",
          ],
        },
        {
          h2: "Attention a l endettement",
          paragraphs: [
            "Un conso de 15 000 € sur 60 mois pèse dans le 35 % si un achat immo suit. Mieux vaut le dire avant de signer.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: "/credit-conso/travaux/", label: "Credit travaux" },
          { href: "/credit-conso/tresorerie/", label: "Tresorerie" },
          { href: "/credit-conso/villes/", label: "Credit conso par ville" },
          { href: "/landings/conso.html", label: "Landing conso" },
          { href: "/rachat-credit/", label: "Rachat de credits" },
          { href: "/blog/credit-consommation-guide-france-2026.html", label: "Guide credit conso 2026" },
        ],
        FINANCE
      ),
      faq: [
        {
          q: "Quel montant maximum ?",
          a: "Cela depend des revenus, de l anciennete pro et des credits deja en cours. L etude donne une enveloppe realiste, pas un plafond publicitaire.",
        },
      ],
    }),
    page({
      file: "credit-conso/travaux/index.html",
      theme: "credit",
      badge: "Travaux",
      title: "Credit travaux | Credit consommation renovation",
      description:
        "Financer des travaux par un credit conso : cuisine, renovation, reste a charge. Courtier ORIAS, etude gratuite.",
      h1: "Credit travaux : conso, eco-PTZ ou pret immo ?",
      intro:
        "Cuisine, toiture, isolation : le bon outil depend du montant et d un pret immo deja en cours. Credit conso, eco-PTZ ou rachat : on oriente.",
      cta: { href: "/landings/conso.html", label: "Etude credit travaux" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit consommation", url: "/credit-conso/" },
        { name: "Travaux", url: "/credit-conso/travaux/" },
      ],
      sections: [
        {
          h2: "Choisir le bon financement",
          list: [
            "Petit montant / urgence : credit conso affecte ou personnel",
            "Bouquet renovation energetique : eco-PTZ si eligible",
            "Gros travaux + pret immo : parfois mieux de racheter ou rallonger",
          ],
        },
      ],
      related: [
        { href: "/credit-conso/", label: "Hub credit conso" },
        { href: "/blog/credit-travaux-conso-guide-2026.html", label: "Guide credit travaux" },
        { href: "/landings/conso.html", label: "Landing conso" },
      ],
      faq: [],
    }),
    page({
      file: "credit-conso/tresorerie/index.html",
      theme: "credit",
      badge: "Tresorerie",
      title: "Credit tresorerie | Pret personnel foyer",
      description:
        "Credit tresorerie / pret personnel : lisser un imprevu sans revolving. Courtier ORIAS France.",
      h1: "Credit tresorerie : un pret personnel cadre",
      intro:
        "Un besoin de tresorerie n est pas une carte revolving. Un pret personnel a duree fixe coute souvent moins cher qu un renouvelable — a condition que le montant soit justifie.",
      cta: { href: "/landings/conso.html", label: "Demander une tresorerie" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit consommation", url: "/credit-conso/" },
        { name: "Tresorerie", url: "/credit-conso/tresorerie/" },
      ],
      sections: [
        {
          h2: "Pret personnel vs revolving",
          paragraphs: [
            "Le revolving entretient la dette. Un pret amortissable a une date de fin. Si plusieurs lignes tournent deja, un rachat peut etre plus propre qu un 4e conso.",
          ],
        },
      ],
      related: [
        { href: "/credit-conso/", label: "Hub credit conso" },
        { href: "/rachat-credit/", label: "Rachat de credits" },
        { href: "/blog/credit-tresorerie-foyer-guide-2026.html", label: "Guide tresorerie" },
      ],
      faq: [],
    }),
    page({
      file: "pret-relais/index.html",
      theme: "credit",
      badge: "Pret relais",
      title: "Pret relais | Acheter avant d avoir vendu",
      description:
        "Pret relais : financer l achat d un bien avant la vente du precedent. Quotite, duree, interets. Courtier ORIAS.",
      h1: "Pret relais : le pont entre vente et achat",
      intro:
        "Vous avez un bien a vendre et un autre a acheter. Le pret relais avance une partie de la valeur du bien vendu pour ne pas rater le bien vise. Nous chiffrons quotite, duree (souvent 12-24 mois) et le pret d acquisition qui suit.",
      cta: { href: "/landings/pret-relais.html", label: "Etudier un pret relais" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Pret relais", url: "/pret-relais/" },
      ],
      benefits: [
        { title: "Quotite realiste", text: "Souvent 60 a 80 % de l estimation, pas 100 %." },
        { title: "Interets du pont", text: "Souvent interets seuls pendant la duree relais." },
        { title: "Plan B", text: "Si la vente tarde : duree, prix, ou location." },
      ],
      steps: [
        { title: "Deux biens", text: "Estimation vente + budget achat." },
        { title: "Montage", text: "Relais sec ou relais + pret principal." },
        { title: "Calendrier", text: "Compromis, offre, signature, remboursement a la vente." },
      ],
      sections: [
        {
          h2: "Relais sec ou relais-acquisition",
          paragraphs: [
            "Le relais sec couvre seulement le pont. Le relais-acquisition combine pont + pret classique sur le nouveau bien. Le bon schema depend de l apport apres vente et du timing notaire.",
          ],
        },
        {
          h2: "Risques a avoir en tete",
          list: [
            "Vente plus longue que prevu → interets qui courent",
            "Prix de vente inferieur a l estimation → reste a charge",
            "Deux logements a financer un temps (charges, taxe fonciere)",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: "/pret-relais/villes/", label: "Pret relais par ville" },
          { href: "/landings/pret-relais.html", label: "Landing pret relais" },
          { href: "/credit-immo/", label: "Credit immobilier" },
          { href: "/recherche-bien/", label: "Recherche de bien" },
          { href: "/blog/pret-relais-vente-achat-guide-2026.html", label: "Guide vente + achat" },
          { href: "/blog/pret-relais-duree-taux-quand-utiliser-2026.html", label: "Duree et taux" },
        ],
        FINANCE
      ),
      faq: [
        {
          q: "Combien de temps dure un pret relais ?",
          a: "Le plus souvent 12 a 24 mois. Au-dela, il faut un plan (prolongation, baisse de prix, location).",
        },
      ],
    }),
    page({
      file: "credit-pro/index.html",
      theme: "credit",
      badge: "Credit professionnel",
      title: "Credit professionnel | TNS, entreprise, materiel",
      description:
        "Credit professionnel : materiel, BFR, developpement TNS et societe. Courtier ORIAS, etude selon bilans.",
      h1: "Credit professionnel : financer l activite",
      intro:
        "Un credit pro ne se monte pas comme un pret immobilier particulier. Bilans, CA, garanties (caution, BPI, hypotheque perso) et objet du financement (materiel, BFR, locaux) structurent le dossier.",
      cta: { href: "/landings/credit-pro.html", label: "Demander un credit pro" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit professionnel", url: "/credit-pro/" },
      ],
      benefits: [
        { title: "Objet clair", text: "Materiel, vehicule, tresorerie, locaux." },
        { title: "Statut", text: "TNS, EI, SARL, SAS : pieces differentes." },
        { title: "Garanties", text: "On dit ce qui est exigé avant de deposer." },
      ],
      steps: [
        { title: "Activite", text: "Metier, anciennete, SIREN / SIRET." },
        { title: "Besoin", text: "Montant, horizon, garanties possibles." },
        { title: "Partenaires", text: "Banques pro et organismes specialises." },
      ],
      sections: [
        {
          h2: "TNS et petites structures",
          paragraphs: [
            "Les independants mixent souvent patrimoine perso et outil pro. Un pret peut s appuyer sur un bien perso. Nous sepaons ce qui est pro de ce qui est perso pour rester lisible.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: "/landings/credit-pro.html", label: "Landing credit pro" },
          { href: "/credit-immo/", label: "Credit immobilier" },
          { href: "/rachat-credit/", label: "Rachat de credits" },
          { href: "/blog/credit-professionnel-tns-entreprise-2026.html", label: "Guide credit pro TNS" },
        ],
        FINANCE
      ),
      faq: [
        {
          q: "Faut-il 2 ou 3 ans de bilans ?",
          a: "Souvent oui pour un credit classique. Une creation recente oriente vers d autres montages (parfois garantie BPI). L etude le dit d emblée.",
        },
      ],
    }),
    page({
      file: "renegociation-pret/index.html",
      theme: "credit",
      badge: "Renegociation",
      title: "Renegociation de pret immobilier | Baisse de taux",
      description:
        "Renegocier son pret immobilier aupres de sa banque : taux, duree, assurance. Alternative au rachat externe. Courtier ORIAS.",
      h1: "Renegociation de pret : d abord chez votre banque",
      intro:
        "Si les taux ont baisse depuis votre offre, une renegociation interne (meme banque) peut suffire, avec moins de frais qu un rachat externe. Nous comparons economie, IRA et effort de la banque.",
      cta: { href: "/landings/renegociation.html", label: "Etudier une renegociation" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Renegociation de pret", url: "/renegociation-pret/" },
      ],
      benefits: [
        { title: "Moins de frais", text: "Pas toujours d IRA si la banque accepte." },
        { title: "Comparatif rachat", text: "Si elle refuse, on chiffre un rachat externe." },
        { title: "Assurance", text: "Loi Lemoine : deleguer l emprunteur en parallele." },
      ],
      steps: [
        { title: "Offre actuelle", text: "Taux, CRD, duree, mensualite." },
        { title: "Marche", text: "Ecart de taux vs 2026, economique ou non." },
        { title: "Negociation", text: "Banque actuelle, sinon rachat." },
      ],
      sections: [
        {
          h2: "Renegociation ou rachat ?",
          paragraphs: [
            "Renegociation = rester. Rachat = changer de banque (et parfois regrouper d autres credits). Le bon choix depend de l ecart de taux, des IRA et de l encours.",
          ],
        },
      ],
      related: LT.mergeUnique(
        [
          { href: "/landings/renegociation.html", label: "Landing renegociation" },
          { href: "/rachat-credit/", label: "Rachat de credits" },
          { href: "/credit-immo/", label: "Credit immobilier" },
          { href: "/blog/rachat-vs-renegociation-pret-2026.html", label: "Rachat vs renegociation" },
          { href: "/blog/renegociation-pret-immobilier-taux-2026.html", label: "Guide renegociation 2026" },
        ],
        FINANCE
      ),
      faq: [
        {
          q: "Quel ecart de taux justifie une renegociation ?",
          a: "Souvent autour de 0,7 a 1 point selon l encours et la duree restante. Nous faisons le calcul, pas une regle magique.",
        },
      ],
    }),
    page({
      file: "credit-immo/rachat-credit/index.html",
      theme: "credit",
      badge: "Rachat",
      title: "Rachat de credit immobilier | Hub credit immo",
      description:
        "Rachat de credit immobilier et regroupement : page reliee au hub RAC. Courtier ORIAS, etude mensualites.",
      h1: "Rachat de credit immobilier",
      intro:
        "Vous cherchez un rachat dans le parcours credit immobilier. Le dossier RAC (regroupement, mix conso, mensualites) est desormais sur le hub dedie — meme courtier, meme etude.",
      cta: { href: "/landings/rachat.html", label: "Etudier mon rachat" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit immobilier", url: "/credit-immo/" },
        { name: "Rachat de credit", url: "/credit-immo/rachat-credit/" },
      ],
      sections: [
        {
          h2: "Aller au bon endroit",
          paragraphs: [
            "Le rachat de credits n est plus un sous-onglet cache : il a son silo national, ses pages villes et sa landing. Le credit immo classique (achat, simulation, 2e chance) reste sur /credit-immo/.",
          ],
        },
      ],
      related: [
        { href: "/rachat-credit/", label: "Hub rachat de credits" },
        { href: "/rachat-credit/regroupement/", label: "Regroupement" },
        { href: "/landings/rachat.html", label: "Landing rachat" },
        { href: "/credit-immo/", label: "Credit immobilier" },
      ],
      faq: [],
    }),
    page({
      file: "credit-immo/taux-pret/index.html",
      theme: "credit",
      badge: "Taux",
      title: "Taux pret immobilier | Courtier credit immo",
      description:
        "Taux de pret immobilier : lecture du TAEG, negociation, assurance emprunteur. Courtier ORIAS, simulation.",
      h1: "Taux de pret immobilier : ce qui compte vraiment",
      intro:
        "Le taux nominal n est pas le TAEG. Assurance emprunteur, frais de dossier et garanties pesent. Nous comparons des offres a garanties equivalentes, pas un taux affiche isolé.",
      cta: { href: "/landings/credit-immo.html", label: "Simulation credit immo" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Credit immobilier", url: "/credit-immo/" },
        { name: "Taux pret", url: "/credit-immo/taux-pret/" },
      ],
      sections: [
        {
          h2: "Taux, TAEG, assurance",
          paragraphs: [
            "Deux pret a 3,2 % peuvent couter tres different une fois l assurance et les frais inclus. La loi Lemoine permet de deleguer l emprunteur. Voir aussi simulation et projection cout reel.",
          ],
        },
      ],
      related: [
        { href: "/credit-immo/", label: "Hub credit immo" },
        { href: "/credit-immo/simulation/", label: "Simulation" },
        { href: "/blog/taux-credit-immobilier-2026-frais-dossier.html", label: "Taux et frais 2026" },
        { href: "/renegociation-pret/", label: "Renegociation" },
        { href: "/landings/credit-immo.html", label: "Landing credit immo" },
      ],
      faq: [],
    }),
  ];
}

function getFinanceHubSitemapEntries(base) {
  var paths = [
    "/rachat-credit/",
    "/rachat-credit/regroupement/",
    "/rachat-credit/mensualites/",
    "/credit-conso/",
    "/credit-conso/travaux/",
    "/credit-conso/tresorerie/",
    "/pret-relais/",
    "/credit-pro/",
    "/renegociation-pret/",
    "/credit-immo/rachat-credit/",
    "/credit-immo/taux-pret/",
    "/landings/rachat.html",
    "/landings/conso.html",
    "/landings/pret-relais.html",
    "/landings/credit-pro.html",
    "/landings/renegociation.html",
    "/finance/",
    "/banque/",
  ];
  return paths.map(function (p) {
    return { loc: base + p, priority: p.indexOf("/landings/") === 0 ? "0.9" : "0.88", changefreq: "weekly" };
  });
}

module.exports = {
  buildFinanceHubPages: buildFinanceHubPages,
  getFinanceHubSitemapEntries: getFinanceHubSitemapEntries,
};
