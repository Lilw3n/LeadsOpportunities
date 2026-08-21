/**
 * SEO vendeur → acquéreur (matching, mandat, honoraires).
 */
module.exports = [
  {
    file: "vendeur-cherche-acquereur-mandat-matching.html",
    section: "finance",
    tag: "Vente",
    tagClass: "tag-immo",
    themes: ["immo", "vendeur", "mandat"],
    title: "Vendeur cherche acquéreur : mandat, matching et acquéreurs financés",
    description:
      "Vendre plus vite : mandat clair, plusieurs annonces, matching avec acquéreurs dont le prêt est calé. Entrant / sortant, durée de mandat privée.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Vendeur → acquéreur : le pipeline qui convertit.",
    keywords: [
      "vendeur cherche acquéreur",
      "mandat de vente matching",
      "trouver acquéreur financé",
      "vendre maison plus vite",
      "négociateur entrant sortant",
    ],
    cta: { href: "../vendeur-cherche-acquereur/?utm_content=blog-vendeur", label: "Hub vendeur" },
    blocks: [
      {
        type: "p",
        text: "Un <strong>vendeur cherche un acquéreur</strong> — pas des curieux. Le bon ordre : estimation, <strong>mandat</strong>, multi-diffusion, puis matching avec des dossiers qui ont une <a href=\"../landings/credit-immo.html\">enveloppe prêt</a>. Hub : <a href=\"../vendeur-cherche-acquereur/\"><strong>vendeur-cherche-acquereur</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Entrée : dépôt + liens d'annonces" },
      {
        type: "p",
        text: "Déposez le bien avec <strong>plusieurs URLs</strong> (Leboncoin, SeLoger…). Un seul mandat, plusieurs vitrines. <a href=\"../landings/acheteur-immo.html?role=vendeur\">Dépôt vendeur</a>.",
      },
      { type: "h2", text: "Sortie : acquéreur solvable" },
      {
        type: "p",
        text: "Priorité aux profils avec simulation ou apport clair. Les partenaires <a href=\"../partenaires-immo/\">négociateurs</a> peuvent être entrants (amener l'acheteur) ou sortants (mandat).",
      },
      { type: "bridge" },
      { type: "h2", text: "Durée de mandat : privée" },
      {
        type: "p",
        text: "La durée (début / échéance) est visible <strong>uniquement</strong> pour le propriétaire et Wendy — pas sur les annonces publiques. <a href=\"../partenaires-immo/mandat-duree.html\">Consulter ma durée</a>.",
      },
    ],
    faq: [
      {
        q: "Dois-je signer un mandat exclusif ?",
        a: "Simple, semi-exclusif ou exclusif : selon votre stratégie. On documente la forme sur la fiche.",
      },
      {
        q: "Les négociateurs voient-ils ma durée de mandat ?",
        a: "Non. Réservé propriétaire + administratrice.",
      },
    ],
    related: [
      { href: "../vendeur-cherche-acquereur/", label: "Hub vendeur" },
      { href: "./honoraires-entrant-sortant-partage-legal.html", label: "Honoraires légaux" },
      { href: "./plusieurs-annonces-un-mandat-liens-portails.html", label: "Multi-liens" },
      { href: "../partenaires-immo/", label: "Partenaires" },
    ],
  },
  {
    file: "honoraires-entrant-sortant-partage-legal.html",
    section: "finance",
    tag: "Honoraires",
    tagClass: "tag-immo",
    themes: ["immo", "honoraires", "legal"],
    title: "Honoraires entrant / sortant : partager conformément à la loi",
    description:
      "Partage d'honoraires entre négociateurs entrant et sortant, apporteur, notaire, avocat : affichage, convention écrite, transparence client.",
    meta: "9 min · Août 2026",
    cardExcerpt: "Entrant / sortant : le partage d'honoraires sans zone grise.",
    keywords: [
      "honoraires entrant sortant",
      "partage commission immobilière",
      "convention co-négociation",
      "apporteur affaires honoraires",
      "affichage honoraires mandat",
    ],
    cta: { href: "../partenaires-immo/?utm_content=blog-honoraires", label: "Devenir partenaire" },
    blocks: [
      {
        type: "p",
        text: "En immo, le <strong>sortant</strong> a le mandat vendeur ; l'<strong>entrant</strong> amène l'acquéreur. Le partage de la commission doit être <strong>écrit</strong>, et les honoraires d'agence <strong>affichés</strong> au mandat. Notaire et avocat : circuits séparés.",
      },
      { type: "bridge" },
      { type: "h2", text: "Règles pratiques" },
      {
        type: "ul",
        items: [
          "Afficher montant ou % + assiette sur le mandat",
          "Convention co-négociation avant l'acte",
          "Apporteur : rémunération seulement si convention préalable",
          "Notaire : émoluments réglementés ≠ commission agence",
          "Avocat : lettre de mission",
        ],
      },
      { type: "h2", text: "Sur le site" },
      {
        type: "p",
        text: "Le CRM enregistre des <strong>accords de partage</strong> par bien. Calculateur barèmes : <a href=\"../crm-agency-fees.html\">crm-agency-fees</a>. Doc : <code>docs/MANDAT-PARTENAIRES-HONORAIRES.md</code>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Peut-on promettre un % à un apporteur sur une page publique ?",
        a: "Non — jamais de promesse publique. Uniquement si convention écrite déjà signée.",
      },
    ],
    related: [
      { href: "./vendeur-cherche-acquereur-mandat-matching.html", label: "Matching vendeur" },
      { href: "../partenaires-immo/", label: "Partenaires" },
      { href: "../vendeur-cherche-acquereur/", label: "Hub vendeur" },
    ],
  },
  {
    file: "plusieurs-annonces-un-mandat-liens-portails.html",
    section: "finance",
    tag: "Diffusion",
    tagClass: "tag-immo",
    themes: ["immo", "annonces", "mandat"],
    title: "Plusieurs annonces, un mandat : multi-liens Leboncoin, SeLoger…",
    description:
      "Un mandat de vente, plusieurs URLs d'annonces. Centraliser Leboncoin, SeLoger et le site pour matcher plus d'acquéreurs.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Multi-portails sans perdre le fil du mandat.",
    keywords: [
      "plusieurs annonces mandat",
      "lien leboncoin seloger mandat",
      "diffuser bien immobilier",
      "multi portails vente",
    ],
    cta: { href: "../landings/acheteur-immo.html?role=vendeur&utm_content=blog-multiliens", label: "Déposer avec mes liens" },
    blocks: [
      {
        type: "p",
        text: "Un bien sous <strong>mandat</strong> peut vivre sur plusieurs portails. Le site stocke une liste de <strong>liens</strong> (jusqu'à 12) + un lien principal, sans écraser le mandat.",
      },
      { type: "bridge" },
      { type: "h2", text: "Pourquoi plusieurs liens" },
      {
        type: "ul",
        items: [
          "Audiences différentes selon le portail",
          "Suivi centralisé pour le matching",
          "Partenaires qui voient le bien sans accès aux dates de mandat",
        ],
      },
      { type: "h2", text: "Déposer" },
      {
        type: "p",
        text: "<a href=\"../landings/acheteur-immo.html?role=vendeur\">Parcours vendeur</a> · <a href=\"../vendeur-cherche-acquereur/\">hub vendeur cherche acquéreur</a>.",
      },
    ],
    faq: [
      {
        q: "Combien de liens maximum ?",
        a: "Jusqu'à 12 URLs normalisées par bien côté plateforme.",
      },
    ],
    related: [
      { href: "./vendeur-cherche-acquereur-mandat-matching.html", label: "Matching" },
      { href: "../vendeur-cherche-acquereur/", label: "Hub vendeur" },
      { href: "../partenaires-immo/", label: "Partenaires" },
    ],
  },
];
