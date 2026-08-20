/**
 * Prêt immobilier refusé → solutions (courtier, endettement, apport, santé, fichiers…).
 * Chargé par blog-articles-manifest.cjs.
 */
module.exports = [
  {
    file: "pret-immobilier-refuse-que-faire-2026.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt immobilier refusé : que faire en 2026 ? (guide 2e chance)",
    description:
      "Banque a refusé votre crédit immo ? Causes fréquentes (endettement, apport, CDI, santé) et solutions concrètes avec un courtier ORIAS — sans attendre 6 mois.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Prêt refusé : causes + plan d'action pour une 2e chance.",
    keywords: [
      "prêt immobilier refusé",
      "crédit immobilier refusé que faire",
      "refus de prêt immobilier",
      "dossier bancaire refusé",
      "courtier après refus banque",
      "deuxième chance crédit immo",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=pret-refuse", label: "Étude 2e chance crédit" },
    heroImage: {
      src: "./images/finance/signature-pret.jpg",
      alt: "Signature de prêt immobilier — dossier et banque",
      caption: "Un refus n'est pas la fin du projet — on reconstruit le dossier.",
    },
    blocks: [
      {
        type: "p",
        text: "Un <strong>prêt immobilier refusé</strong> fait mal — surtout après un compromis ou des mois de recherche. Ce n'est pas forcément « vous n'achèterez jamais » : c'est souvent <strong>une banque, un moment, un dossier mal présenté</strong>. Endettement HCSF, apport trop faible, CDD, assurance emprunteur, découverts : chaque cause a des leviers. Voici le plan pour une <strong>2e chance</strong> avec un courtier multi-banques. <a href=\"../landings/credit-immo.html?utm_content=pret-refuse\"><strong>Faire étudier mon dossier refusé</strong></a> · <a href=\"../landings/questionnaire.html?need=credit-immo&journey=standard\">questionnaire crédit</a> · <a href=\"../landings/projection-achat.html\">projection capacité</a>.",
      },
      { type: "bridge" },
      {
        type: "gallery",
        label: "Trois leviers après un refus",
        items: [
          {
            src: "./images/finance/budget-famille.jpg",
            alt: "Budget foyer — endettement et reste à vivre",
            caption: "Recalculer endettement et reste à vivre",
          },
          {
            src: "./images/finance/credit-immo-cles.jpg",
            alt: "Clés et crédit immobilier",
            caption: "Ajuster prix, apport, durée",
          },
          {
            src: "./images/finance/signature-pret.jpg",
            alt: "Nouvelle offre de prêt",
            caption: "Présenter le dossier à d'autres banques",
          },
        ],
      },
      { type: "h2", text: "1. Demandez (par écrit) le motif du refus" },
      {
        type: "p",
        text: "Sans motif clair, vous corrigez à l'aveugle. Demandez à la banque : endettement, reste à vivre, stabilité pro, scoring interne, assurance, fichiers. Notez la date et gardez les échanges. Articles dédiés : <a href=\"./pret-refuse-endettement-35-hcsf-solutions.html\">endettement 35 %</a> · <a href=\"./pret-refuse-assurance-emprunteur-sante.html\">refus lié à la santé / emprunteur</a>.",
      },
      { type: "h2", text: "2. Les causes les plus fréquentes (et ce qu'on peut faire)" },
      {
        type: "ul",
        items: [
          "Endettement > ~35 % (HCSF) → rachat conso, allonger durée, baisser prix",
          "Apport insuffisant → don familial, délai épargne, PTZ / zones",
          "CDD, intérim, période d'essai → co-emprunteur, attendre CDI, banques plus souples",
          "Incidents bancaires / FICP → assainir, délais, parfois alternative",
          "Assurance emprunteur refusée / trop chère → délégation, surprimes, exclusions",
          "Projet trop cher vs revenus → projection réelle des charges",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "3. Pourquoi un courtier après un refus ?" },
      {
        type: "p",
        text: "Votre banque de dépôt n'est pas tout le marché. Un <strong>courtier</strong> connaît les critères des partenaires (ex. La Centrale de Financement) et reformule le dossier : tableau d'endettement propre, lettre d'explication, assurance en parallèle. Voir <a href=\"./pret-refuse-courtier-multibanque-deuxieme-chance.html\">courtier multi-banques</a>.",
      },
      { type: "h2", text: "4. Ne précipitez pas un 2e dossier identique" },
      {
        type: "p",
        text: "Resoumettre le même dossier demain à 5 banques peut graver le refus. Corrigez d'abord (crédits conso, découverts, apport), puis relancez. Délais : <a href=\"./pret-refuse-apres-refus-delai-nouveau-dossier.html\">quand représenter un dossier</a>.",
      },
      { type: "h2", text: "Checklist immédiate" },
      {
        type: "ul",
        items: [
          "Motif écrit du refus",
          "3 bulletins + avis d'imposition prêts",
          "Liste des crédits avec mensualités et capital restant",
          "Simulation capacité (projection + charges)",
          "Devis assurance emprunteur en délégation",
          "Prise de contact courtier « dossier déjà refusé »",
        ],
      },
    ],
    faq: [
      {
        q: "Un refus d'une banque bloque-t-il toutes les autres ?",
        a: "Non. Chaque établissement a ses critères. En revanche, multipliez les demandes identiques sans corriger le dossier peut nuire au scoring.",
      },
      {
        q: "Combien de temps après un refus puis-je représenter ?",
        a: "Dès que le motif est traité (ex. crédit conso soldé). Parfois 1 à 3 mois suffisent ; un fichage demande plus. Un courtier calibre le timing.",
      },
      {
        q: "Le courtier peut-il garantir une acceptation ?",
        a: "Non — personne ne peut. En revanche il maximise les chances en ciblant les bonnes banques et en soignant le montage.",
      },
    ],
    related: [
      { href: "./pret-refuse-endettement-35-hcsf-solutions.html", label: "Endettement 35 %" },
      { href: "./pret-refuse-courtier-multibanque-deuxieme-chance.html", label: "Courtier 2e chance" },
      { href: "./visites-sans-financement-vente-negociateur-courtier.html", label: "Visites sans financement" },
      { href: "./pret-immo-erreurs-a-eviter.html", label: "Erreurs prêt immo" },
      { href: "../pret-immobilier/", label: "Hub prêt immobilier" },
      { href: "../recherche-bien/", label: "Recherche de bien" },
      { href: "../credit-immo/", label: "Crédit immobilier" },
      { href: "../landings/credit-immo.html", label: "Landing crédit" },
      { href: "../landings/projection-achat.html", label: "Projection achat" },
    ],
  },

  {
    file: "pret-refuse-endettement-35-hcsf-solutions.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt refusé pour endettement 35 % (HCSF) : solutions concrètes",
    description:
      "Refus lié au taux d'endettement HCSF ~35 % : rachat de crédits conso, durée, co-emprunteur, baisse du prix — guide pratique.",
    meta: "8 min · 2026",
    cardExcerpt: "Endettement 35 % : comment repasser sous le plafond.",
    keywords: [
      "endettement 35 % prêt immobilier",
      "HCSF crédit immobilier",
      "taux d'endettement trop élevé",
      "refus prêt endettement",
      "rachat crédit pour emprunter",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=endettement-35", label: "Recalculer mon dossier" },
    heroImage: {
      src: "./images/finance/budget-famille.jpg",
      alt: "Budget famille — taux d'endettement",
      caption: "HCSF : ~35 % d'endettement max assurance comprise.",
    },
    blocks: [
      {
        type: "p",
        text: "Le régulateur (HCSF) cadre le <strong>taux d'endettement</strong> autour de <strong>35 %</strong> des revenus nets (assurance emprunteur comprise, avec souplesses limitées). Si votre banque a dit non pour cette raison, l'objectif est clair : <strong>baisser les mensualités existantes</strong> ou <strong>le besoin d'emprunt</strong>. <a href=\"../landings/credit-immo.html?utm_content=endettement-35\"><strong>Faire recalculer</strong></a> · <a href=\"./pret-refuse-rachat-credits-consommateurs.html\">rachat de crédits conso</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Leviers qui marchent" },
      {
        type: "ul",
        items: [
          "Solder ou racheter crédits auto / conso / revolving",
          "Allonger la durée du prêt immo (dans les limites)",
          "Augmenter l'apport ou baisser le prix du bien",
          "Ajouter un co-emprunteur solvable",
          "Réduire l'assurance emprunteur (délégation)",
        ],
      },
      { type: "h2", text: "Piège : regarder seulement la mensualité immo" },
      {
        type: "p",
        text: "La banque additionne <strong>toutes</strong> les mensualités. Un petit crédit conso de 180 €/mois peut faire basculer le dossier. Utilisez la <a href=\"../landings/projection-achat.html\">projection achat</a> pour voir le réel (taxe foncière, charges).",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Peut-on dépasser 35 % ?",
        a: "Des souplesses existent (primo-accédants, certains profils) mais restent encadrées. Ne misez pas dessus sans montage solide.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé : que faire" },
      { href: "./pret-refuse-rachat-credits-consommateurs.html", label: "Rachat conso" },
      { href: "./rachat-credit-immobilier-guide-2026.html", label: "Rachat crédit immo" },
    ],
  },

  {
    file: "pret-refuse-apport-insuffisant-solutions.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt refusé faute d'apport : solutions (don, PTZ, délai, neuf)",
    description:
      "Apport insuffisant ou inexistant : refus banque. Don familial, PTZ, VEFA, négociation prix — options réalistes 2026.",
    meta: "7 min · 2026",
    cardExcerpt: "Sans apport : pistes pour débloquer le financement.",
    keywords: [
      "prêt immobilier sans apport",
      "apport insuffisant banque",
      "refus prêt apport",
      "PTZ primo-accédant",
      "don familial apport immobilier",
    ],
    cta: { href: "../landings/questionnaire.html?need=credit-immo&journey=standard", label: "Questionnaire crédit" },
    heroImage: {
      src: "./images/finance/credit-immo-cles.jpg",
      alt: "Clés logement — apport et financement",
      caption: "Apport : frais de notaire + matelas de sécurité.",
    },
    blocks: [
      {
        type: "p",
        text: "Beaucoup de banques veulent un <strong>apport</strong> qui couvre au moins les frais (notaire, garantie) — idéalement 10 %. Sans cela, le refus est fréquent. Pistes : <strong>don familial</strong> documenté, <strong>PTZ</strong> (si éligible), délai d'épargne, bien moins cher, ou neuf / VEFA selon les offres. <a href=\"../landings/credit-immo.html?utm_content=apport\"><strong>Étudier mon apport</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce que l'apport finance vraiment" },
      {
        type: "p",
        text: "Frais de notaire, garantie, éventuels travaux : si l'apport ne les couvre pas, la banque finance « à 110 % » — plus risqué. Voir aussi <a href=\"./pret-refuse-primo-accedant-ptz-solutions.html\">primo-accédant et PTZ</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un prêt à 100 % est-il encore possible ?",
        a: "Plus rare, réservé à des profils excellents ou à certaines offres. Un courtier sait où chercher — sans promettre.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Guide prêt refusé" },
      { href: "./pret-refuse-primo-accedant-ptz-solutions.html", label: "Primo et PTZ" },
    ],
  },

  {
    file: "pret-refuse-cdi-cdd-interim-freelance.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt refusé en CDD, intérim ou freelance : quelles banques écouter ?",
    description:
      "CDD, intérim, période d'essai, auto-entrepreneur : pourquoi la banque refuse et comment monter un dossier alternatif.",
    meta: "8 min · 2026",
    cardExcerpt: "Statut pro fragile : co-emprunteur, historique, banques adaptées.",
    keywords: [
      "prêt immobilier CDD",
      "crédit immo intérim",
      "prêt immobilier auto-entrepreneur",
      "refus prêt période d'essai",
      "freelance crédit immobilier",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=statut-pro", label: "Dossier selon mon statut" },
    heroImage: {
      src: "./images/finance/signature-pret.jpg",
      alt: "Dossier de prêt — situation professionnelle",
      caption: "La stabilité des revenus pèse autant que le taux.",
    },
    blocks: [
      {
        type: "p",
        text: "Les banques adorent le <strong>CDI hors période d'essai</strong>. En <strong>CDD</strong>, <strong>intérim</strong>, <strong>freelance</strong> ou <strong>période d'essai</strong>, le refus est classique — pas une condamnation. Leviers : ancienneté d'activité, bilans 2–3 ans, co-emprunteur CDI, apport renforcé, banques plus ouvertes aux TNS. <a href=\"../landings/credit-immo.html?utm_content=statut-pro\"><strong>Monter mon dossier</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Documents qui rassurent" },
      {
        type: "ul",
        items: [
          "Contrats / attestations d'activité",
          "Avis d'imposition + bilans / liasse fiscale",
          "Relevés sans découvert chronique",
          "Épargne de précaution visible",
        ],
      },
      { type: "h2", text: "Co-emprunteur" },
      {
        type: "p",
        text: "Un conjoint ou parent en CDI peut transformer le dossier. Voir <a href=\"./pret-refuse-co-emprunteur-caution-solutions.html\">co-emprunteur et caution</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Combien d'années d'activité pour un indépendant ?",
        a: "Souvent 2 à 3 bilans. Certaines banques acceptent moins avec un excellent apport — à confirmer dossier par dossier.",
      },
    ],
    related: [
      { href: "./pret-refuse-co-emprunteur-caution-solutions.html", label: "Co-emprunteur" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Que faire après refus" },
    ],
  },

  {
    file: "pret-refuse-assurance-emprunteur-sante.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt bloqué par l'assurance emprunteur (santé) : délégation et solutions",
    description:
      "Banque OK mais assurance refusée ou surprime : convention AERAS, délégation, exclusions — ne laissez pas le médical tuer le projet.",
    meta: "8 min · 2026",
    cardExcerpt: "Refus / surprime emprunteur : AERAS, délégation, Lemoine.",
    keywords: [
      "assurance emprunteur refusée",
      "surprime assurance prêt",
      "AERAS crédit immobilier",
      "délégation assurance emprunteur",
      "prêt refusé pour raison de santé",
    ],
    cta: { href: "../landings/credit-immo.html#formules", label: "Comparer emprunteur" },
    heroImage: {
      src: "./images/finance/signature-pret.jpg",
      alt: "Assurance de prêt et signature",
      caption: "Le médical se négocie aussi — pas seulement le taux.",
    },
    blocks: [
      {
        type: "p",
        text: "Parfois le crédit est « accepté sous condition d'assurance »… et l'<strong>assurance emprunteur</strong> refuse ou applique une <strong>surprime</strong> impossible. Solutions : <strong>délégation</strong> (pas seulement le contrat groupe banque), questionnaire médical soigné, <strong>convention AERAS</strong> si éligible, exclusions ciblées. <a href=\"../landings/credit-immo.html#formules\"><strong>Comparer les formules</strong></a> · <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">loi Lemoine</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ne signez pas le contrat groupe par défaut" },
      {
        type: "p",
        text: "La banque propose son assurance : ce n'est pas toujours la seule option. Un courtier monte l'<strong>équivalence de garanties</strong> pour faire accepter une délégation.",
      },
      { type: "h2", text: "Santé et transparence" },
      {
        type: "p",
        text: "Omettre un antécédent peut faire annuler la garantie au sinistre. Mieux vaut un dossier honnête + assureurs spécialisés risques aggravés.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Qu'est-ce que la convention AERAS ?",
        a: "Un dispositif pour faciliter l'assurance et l'emprunt des personnes à risque de santé aggravé, sous conditions. Un professionnel vérifie l'éligibilité.",
      },
    ],
    related: [
      { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé" },
      { href: "../assurance-emprunteur/", label: "Hub emprunteur" },
    ],
  },

  {
    file: "pret-refuse-fichiers-banque-de-france-ficp-fcc.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt refusé pour FICP / FCC : délais, radiation et alternatives",
    description:
      "Fiché Banque de France (FICP, FCC) : impact sur le crédit immo, délais de radiation, ce qu'un courtier peut encore tenter.",
    meta: "7 min · 2026",
    cardExcerpt: "FICP/FCC : comprendre le blocage et les sorties possibles.",
    keywords: [
      "FICP prêt immobilier",
      "FCC crédit immobilier",
      "fiché Banque de France crédit",
      "refus prêt FICP",
      "radiation FICP emprunter",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=ficp", label: "Parler à un courtier" },
    heroImage: {
      src: "./images/finance/budget-famille.jpg",
      alt: "Situation budgétaire — incidents de paiement",
      caption: "Assainir les comptes avant de représenter un dossier.",
    },
    blocks: [
      {
        type: "p",
        text: "Un <strong>fichage FICP</strong> (incidents de crédit) ou <strong>FCC</strong> (chèques) bloque presque tous les prêts immobiliers classiques. Priorité : <strong>régulariser</strong>, obtenir la radiation, prouver une gestion saine sur plusieurs mois. Un courtier est honnête : parfois il faut attendre — parfois un montage existe après radiation. <a href=\"../landings/credit-immo.html?utm_content=ficp\"><strong>Faire le point</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Pendant le fichage" },
      {
        type: "ul",
        items: [
          "Ne multipliez pas les demandes de crédit",
          "Coupez les découverts et prélèvements à risque",
          "Constituez une épargne visible",
          "Gardez les preuves de régularisation",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Peut-on emprunter fichage en cours ?",
        a: "En pratique très difficile pour un prêt immo classique. L'objectif est la radiation puis un dossier nickel.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Que faire après refus" },
      { href: "./pret-refuse-apres-refus-delai-nouveau-dossier.html", label: "Délai nouveau dossier" },
    ],
  },

  {
    file: "pret-refuse-courtier-multibanque-deuxieme-chance.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Après un refus banque : le courtier multi-banques pour une 2e chance",
    description:
      "Votre banque a dit non : un courtier ORIAS présente le dossier autrement à d'autres établissements — sans garantie magique, avec méthode.",
    meta: "7 min · 2026",
    cardExcerpt: "Courtier après refus : reformuler et cibler les bonnes banques.",
    keywords: [
      "courtier crédit après refus",
      "courtier multi banques",
      "deuxième chance prêt immobilier",
      "comparer banques crédit immo",
      "La Centrale de Financement",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=courtier-2e-chance", label: "Demander une 2e chance" },
    heroImage: {
      src: "./images/finance/signature-pret.jpg",
      alt: "Accompagnement courtier crédit",
      caption: "Une banque ≠ tout le marché du crédit.",
    },
    blocks: [
      {
        type: "p",
        text: "Rester chez sa <strong>banque de dépôt</strong> après un refus, c'est souvent tourner en rond. Un <strong>courtier multi-banques</strong> (partenaires type La Centrale de Financement) sait quelles enseignes acceptent encore un profil « limite » si le dossier est propre. <a href=\"../landings/credit-immo.html?utm_content=courtier-2e-chance\"><strong>Étude 2e chance</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce que le courtier change concrètement" },
      {
        type: "ul",
        items: [
          "Lettre d'explication du refus précédent",
          "Tableau d'endettement à jour",
          "Assurance emprunteur montée en parallèle",
          "Ciblage des banques selon statut pro et zone",
        ],
      },
      { type: "h2", text: "Transparence" },
      {
        type: "p",
        text: "Si le dossier est impossible aujourd'hui, un bon courtier le dit et propose un plan (rachat conso, délai, apport). Mieux vaut un non clair qu'un mirage.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le courtage est-il gratuit pour moi ?",
        a: "Les modalités varient ; le conseil initial et l'étude de faisabilité sont souvent sans engagement. Demandez la transparence des frais dès le premier échange.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Guide prêt refusé" },
      { href: "./visites-sans-financement-vente-negociateur-courtier.html", label: "Visites sans financement" },
      { href: "../landings/credit-immo.html", label: "Landing crédit" },
      { href: "../pret-immobilier/", label: "Hub prêt immobilier" },
      { href: "../credit-immo/", label: "Crédit immobilier" },
    ],
  },

  {
    file: "pret-refuse-rachat-credits-consommateurs.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Rachat de crédits conso pour débloquer un prêt immobilier",
    description:
      "Trop de crédits conso = refus immo. Rachat / regroupement pour baisser l'endettement avant de représenter le dossier.",
    meta: "7 min · 2026",
    cardExcerpt: "Regrouper les crédits conso pour repasser sous 35 %.",
    keywords: [
      "rachat crédits pour prêt immobilier",
      "regroupement crédits endettement",
      "solder crédits avant emprunter",
      "refus prêt à cause crédits conso",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=rachat-conso", label: "Étudier rachat + immo" },
    heroImage: {
      src: "./images/finance/budget-famille.jpg",
      alt: "Budget et crédits en cours",
      caption: "Moins de mensualités conso = plus de capacité immo.",
    },
    blocks: [
      {
        type: "p",
        text: "Auto + conso + revolving : chaque ligne pèse dans le <strong>35 %</strong>. Un <strong>rachat / regroupement</strong> peut baisser la mensualité globale et rouvrir un prêt immo — attention aux frais et à la durée. <a href=\"../landings/credit-immo.html?utm_content=rachat-conso\"><strong>Chiffrer rachat + projet</strong></a> · <a href=\"./pret-refuse-endettement-35-hcsf-solutions.html\">endettement 35 %</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Quand ça vaut le coup" },
      {
        type: "p",
        text: "Si le seul frein est un endettement conso, et que le projet immo est réaliste après regroupement. Sinon, soldez d'abord les petits crédits rapidement.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Rachat de crédit = nouveau prêt immo ?",
        a: "Non. Le rachat traite les crédits existants. Le prêt immo vient ensuite, une fois la capacité libérée.",
      },
    ],
    related: [
      { href: "./rachat-credit-immobilier-guide-2026.html", label: "Rachat crédit immo" },
      { href: "./pret-refuse-endettement-35-hcsf-solutions.html", label: "HCSF 35 %" },
    ],
  },

  {
    file: "pret-refuse-primo-accedant-ptz-solutions.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Primo-accédant : prêt refusé malgré le PTZ — que tenter ?",
    description:
      "Primo-accédant refusé : PTZ, zones, apport, HCSF souplesse — checklist pour remettre le dossier sur les rails.",
    meta: "7 min · 2026",
    cardExcerpt: "Primo + PTZ : le refus n'annule pas toutes les aides.",
    keywords: [
      "primo-accédant prêt refusé",
      "PTZ refus banque",
      "primo-accédant que faire",
      "achat premier logement financement",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=primo", label: "Dossier primo-accédant" },
    heroImage: {
      src: "./images/habitat/maison-famille.jpg",
      alt: "Premier logement famille",
      caption: "Premier achat : aides + montage bancaire réaliste.",
    },
    blocks: [
      {
        type: "p",
        text: "Être <strong>primo-accédant</strong> n'impose pas l'acceptation automatique. Le <strong>PTZ</strong> aide mais ne remplace pas un reste à vivre correct. Vérifiez éligibilité zone / ressources, cumuls, et présentez un plan B (prix, apport, durée). <a href=\"../landings/credit-immo.html?utm_content=primo\"><strong>Étude primo</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Erreurs fréquentes" },
      {
        type: "ul",
        items: [
          "Compter sur le PTZ sans apport pour les frais",
          "Ignorer taxe foncière et charges dans le budget",
          "Viser un bien au maximum de la capacité théorique",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le PTZ suffit-il comme apport ?",
        a: "Non. C'est un prêt complémentaire. Les frais annexes restent à financer autrement.",
      },
    ],
    related: [
      { href: "./pret-refuse-apport-insuffisant-solutions.html", label: "Apport insuffisant" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Prêt refusé" },
    ],
  },

  {
    file: "pret-refuse-co-emprunteur-caution-solutions.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Co-emprunteur, caution parentale : débloquer un prêt refusé",
    description:
      "Seul, le dossier ne passe pas : co-emprunteur, caution, donation — précautions juridiques et bancaires.",
    meta: "7 min · 2026",
    cardExcerpt: "Ajouter un co-emprunteur ou une caution pour solidifier le dossier.",
    keywords: [
      "co-emprunteur prêt immobilier",
      "caution parentale crédit",
      "garant prêt immobilier",
      "refus prêt seul",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=co-emprunteur", label: "Monter un dossier à deux" },
    heroImage: {
      src: "./images/finance/budget-famille.jpg",
      alt: "Foyer — co-emprunt",
      caption: "Deux revenus = autre lecture bancaire.",
    },
    blocks: [
      {
        type: "p",
        text: "Un <strong>co-emprunteur</strong> solvable (conjoint, parfois parent) change le calcul d'endettement. Une <strong>caution</strong> rassure certaines banques mais engage le garant. Cadrez notaire / régime matrimonial. <a href=\"../landings/credit-immo.html?utm_content=co-emprunteur\"><strong>Étudier à deux</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Attention" },
      {
        type: "p",
        text: "Le co-emprunteur est solidaire de la dette. Ce n'est pas une signature « de complaisance ». Expliquez clairement les risques.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un parent caution suffit-il toujours ?",
        a: "Non. Les banques préfèrent souvent un vrai co-emprunteur avec revenus. La caution est un outil parmi d'autres.",
      },
    ],
    related: [
      { href: "./pret-refuse-cdi-cdd-interim-freelance.html", label: "Statut pro" },
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Guide refus" },
    ],
  },

  {
    file: "pret-refuse-apres-refus-delai-nouveau-dossier.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Après un refus de prêt : quel délai avant un nouveau dossier ?",
    description:
      "Faut-il attendre 1 mois, 3 mois, 6 mois ? Timing selon la cause du refus et comment éviter de griller le marché.",
    meta: "6 min · 2026",
    cardExcerpt: "Timing après refus : corriger d'abord, représenter ensuite.",
    keywords: [
      "délai après refus prêt immobilier",
      "quand refaire un dossier crédit",
      "nouveau dossier après refus banque",
    ],
    cta: { href: "../landings/credit-immo.html?utm_content=delai-refus", label: "Planifier ma 2e chance" },
    heroImage: {
      src: "./images/finance/credit-immo-cles.jpg",
      alt: "Nouveau départ financement",
      caption: "Corriger le frein, puis relancer au bon moment.",
    },
    blocks: [
      {
        type: "p",
        text: "Il n'y a pas de délai légal unique. Après un <strong>refus pour endettement</strong>, attendez d'avoir soldé / racheté. Après un <strong>incident bancaire</strong>, montrez plusieurs mois propres. Après un refus « scoring », changez l'angle (autre banque via courtier) plutôt que spammer. <a href=\"../landings/credit-immo.html?utm_content=delai-refus\"><strong>Caler le timing</strong></a>.",
      },
      { type: "bridge" },
      {
        type: "ul",
        items: [
          "Apport en cours : 1–6 mois d'épargne",
          "Rachat conso : après déblocage des fonds",
          "FICP : après radiation",
          "Assurance santé : après devis délégation OK",
        ],
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Puis-je déposer ailleurs le lendemain ?",
        a: "Techniquement oui, stratégiquement non si rien n'a changé. Corrigez le motif du refus d'abord.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Que faire" },
      { href: "./pret-refuse-courtier-multibanque-deuxieme-chance.html", label: "Courtier 2e chance" },
    ],
  },

  {
    file: "pret-refuse-investissement-locatif-ou-moins-cher.html",
    section: "finance",
    tag: "Prêt refusé",
    tagClass: "tag-actu",
    themes: ["emprunteur", "pret-refuse"],
    title: "Prêt résidence principale refusé : et si on recalibre le projet ?",
    description:
      "Bien trop cher, zone tendue, charges sous-estimées : parfois la solution n'est pas « forcer la banque » mais ajuster le projet (prix, ville, type).",
    meta: "7 min · 2026",
    cardExcerpt: "Recaler prix / ville / type de bien pour faire passer le dossier.",
    keywords: [
      "prêt refusé bien trop cher",
      "baisser prix achat immobilier",
      "capacité d'emprunt réelle",
      "projection achat charges",
    ],
    cta: { href: "../landings/projection-achat.html", label: "Recalculer mon projet" },
    heroImage: {
      src: "./images/habitat/maison-famille.jpg",
      alt: "Choix du bien immobilier",
      caption: "Le bon bien au bon prix débloque souvent le crédit.",
    },
    blocks: [
      {
        type: "p",
        text: "Si la banque refuse parce que le <strong>projet est trop tendu</strong>, insister sur le même bien peut être vain. Recalculez avec la <a href=\"../landings/projection-achat.html\"><strong>projection achat</strong></a> (taxe foncière, énergie, copro). Parfois un bien à -10 % ou une autre commune fait passer le dossier. Puis <a href=\"../landings/credit-immo.html\">retour crédit</a> / <a href=\"../landings/acheteur-immo.html\">recherche de bien</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Investissement locatif ?" },
      {
        type: "p",
        text: "Les critères sont différents (loyers pris en compte partiellement). Un refus sur résidence principale n'implique pas automatiquement un oui sur du locatif — et inversement.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Dois-je abandonner mon compromis ?",
        a: "Parlez-en à votre notaire / agent. Condition suspensive de prêt : respectez les délais. Un courtier accélère l'étude alternative.",
      },
    ],
    related: [
      { href: "./pret-immobilier-refuse-que-faire-2026.html", label: "Guide refus" },
      { href: "../landings/projection-achat.html", label: "Projection" },
      { href: "../landings/acheteur-immo.html", label: "Recherche bien" },
    ],
  },
];
