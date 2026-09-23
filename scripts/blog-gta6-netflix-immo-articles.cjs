/**
 * Actu — Extended Look GTA 6 sur Netflix → hub Leonida Vice (GTA VI).
 */
var { leonidaUrl, leonidaCta } = require("./leonida-vice-lib.cjs");

var FILE = "gta-6-netflix-extended-look-immobilier-france-2026.html";
var LANDING_HUB = leonidaUrl(FILE, "/");
var LANDING_BLOG = leonidaUrl(FILE, "/blog");
var LANDING_BOUTIQUE = leonidaUrl(FILE, "/boutique");
var CTA = leonidaCta(FILE);

module.exports = [
  {
    file: FILE,
    section: "actu",
    tag: "GTA 6 & immobilier",
    tagClass: "tag-actu",
    themes: ["gta6", "immobilier", "credit", "habitation", "actu"],
    title: "Trailer Netflix GTA 6 : Vice City, immobilier et vrai budget en France",
    description:
      "Extended Look GTA 6 sur Netflix (27 août 2026) : Léonida, villas et skyline — ce que ça dit de l’immobilier réel, du prêt et de l’assurance habitation en France.",
    meta: "9 min · Août 2026",
    cardExcerpt:
      "Netflix diffuse l’Extended Look GTA 6 : après la hype Vice City, calculez achat, prêt et MRH en France.",
    keywords: [
      "GTA 6 Netflix",
      "GTA 6 Extended Look",
      "trailer GTA 6 Netflix",
      "GTA 6 immobilier",
      "Vice City immobilier",
      "prêt immobilier gaming",
      "assurance habitation",
    ],
    heroImage: "./images/gta6/gta6-vice-city-02.jpg",
    ogImage: "https://www.leadsopportunities.fr/blog/images/gta6/gta6-vice-city-02.jpg",
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Le <strong>27 août 2026</strong>, Rockstar et Netflix lancent <strong>Grand Theft Auto VI: An Extended Look</strong> — environ 26 minutes de gameplay filmé sur PS5, d’abord exclusif Netflix quelques heures, puis YouTube. Léonida, Vice City, Lucia et Jason : la skyline et les villas font rêver. En France, la question utile n’est pas « combien de likes », c’est <strong>combien coûte un vrai toit</strong>, un <strong>prêt</strong> et une <strong>assurance habitation</strong> quand la hype pousse à dépenser. <a href=\"" +
          LANDING_BLOG +
          "\" rel=\"noopener noreferrer\" target=\"_blank\"><strong>Lire sur Leonida Vice</strong></a> · <a href=\"" +
          LANDING_HUB +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">hub GTA VI</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qu’est vraiment l’Extended Look Netflix" },
      {
        type: "ul",
        items: [
          "Format : deep dive / trailer long (~26–27 min), pas un film GTA",
          "Diffusion : Netflix d’abord (fenêtre courte), puis gratuit sur YouTube Rockstar",
          "Horaires FR : autour de 21 h CEST sur Netflix le 27 août 2026",
          "Sortie jeu annoncée : 19 novembre 2026 (PS5 / Xbox Series)",
        ],
      },
      {
        type: "p",
        text: "C’est un <strong>moment culturel</strong> — comme les trailers précédents. Les images de plages, mansions et tours rappellent une fantasy immobilière américaine. Le marché français, lui, a ses règles : taux, apport, DPE, assurance emprunteur.",
      },
      { type: "h2", text: "2. Vice City fantasy vs immobilier réel en France" },
      {
        type: "p",
        text:
          "Dans GTA, on « achète » une propriété en quelques clics. Dans la vraie vie : <strong>compromis</strong>, notaire, <strong>prêt immobilier</strong>, frais de notaire, éventuellement travaux et <strong>DPE</strong>. La hype Netflix peut donner envie d’un loft « style Vice » — vérifiez d’abord la capacité d’emprunt. <a href=\"" +
          LANDING_BLOG +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">Guides GTA VI sur Leonida Vice</a> · <a href=\"./passoire-energetique-dpe-g-vendre-2026.html\">DPE G et vente</a>.",
      },
      {
        type: "ul",
        items: [
          "Appartement / maison : estimation + visite, pas un screenshot",
          "Endettement HCSF ~35 % : un crédit conso PS5+GTA peut freiner le dossier",
          "Assurance emprunteur : loi Lemoine = comparer hors banque",
          "Habitation (MRH) : obligatoire pour le locataire, indispensable pour le proprio",
        ],
      },
      { type: "bridge" },
      { type: "h2", text: "3. Après le trailer : 3 budgets à séparer" },
      {
        type: "ol",
        items: [
          "<strong>Loisirs</strong> — jeu + console : cash ou petit crédit conso (voir nos guides GTA / PS5)",
          "<strong>Projet immo</strong> — apport, mensualité, assurance emprunteur : ne pas mélanger avec le gaming",
          "<strong>Protection du foyer</strong> — MRH / PNO : vol console, dégât des eaux, incendie",
        ],
      },
      {
        type: "p",
        text:
          "Si vous regardez le trailer en coloc ou en couple avec un <strong>achat prévu dans l’année</strong> : évitez tout nouvel endettement conso. La banque additionne les mensualités. <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et prêt immobilier</a> · <a href=\"" +
          LANDING_BOUTIQUE +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">boutique GTA VI</a>.",
      },
      { type: "h2", text: "4. Investissement locatif « vibe GTA » : attention" },
      {
        type: "p",
        text:
          "Les villas au bord de l’eau font fantasmer un <strong>investissement locatif</strong> style Florida. En France : rentabilité nette, vacance locataire, fiscalité, et souvent un <strong>prêt</strong> plus serré que le résidentiel. On calcule le vrai cash-flow avant le rêve Netflix. <a href=\"./rentree-2026-investissement-locatif-encore-rentable.html\">Investissement locatif rentrée 2026</a> · <a href=\"" +
          LANDING_HUB +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">hub Leonida Vice</a>.",
      },
      { type: "h2", text: "5. Checklist après l’Extended Look" },
      {
        type: "ul",
        items: [
          "Regarder le trailer (Netflix ou YouTube) — OK, c’est gratuit côté émotions",
          "Noter ce que vous voulez vraiment : console, déménagement, achat, colocation",
          "Si achat : projection mensualité + assurance emprunteur",
          "Si locataire / proprio : plafonds MRH (vol high-tech, responsabilité)",
          "Éviter les arnaques précommande / memecoin « GTA » — hype ≠ investissement",
        ],
      },
      {
        type: "p",
        text:
          "Pour l’actu, la boutique et la communauté GTA VI : <a href=\"" +
          LANDING_HUB +
          "\" rel=\"noopener noreferrer\" target=\"_blank\"><strong>Leonida Vice</strong></a> · <a href=\"" +
          LANDING_BLOG +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">blog</a> · <a href=\"" +
          LANDING_BOUTIQUE +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">boutique</a>.",
      },
    ],
    related: [
      { href: CTA.href, label: CTA.label },
      { href: "./gta-6-leak-netflix-extended-look-precommande-budget.html", label: "Netflix Extended Look & précommande" },
      { href: "./gta-6-pret-immobilier-budget-gaming.html", label: "GTA 6 et prêt immo" },
      { href: "./gta-6-ps5-pro-budget-1000-euros-pret-conso.html", label: "Budget PS5 Pro + GTA" },
      { href: "./taux-pret-immobilier-aout-2026-rentree.html", label: "Taux prêt août 2026" },
    ],
    faq: [
      {
        q: "C’est quoi l’Extended Look GTA 6 sur Netflix ?",
        a: "Une présentation longue (~26 min) de gameplay GTA VI, diffusée d’abord sur Netflix le 27 août 2026, puis sur YouTube. Ce n’est pas le jeu complet.",
      },
      {
        q: "Faut-il un abonnement Netflix pour le voir ?",
        a: "Pour la fenêtre exclusive Netflix, oui. Ensuite le contenu est prévu gratuitement sur les chaînes Rockstar / YouTube.",
      },
      {
        q: "Quel lien avec l’immobilier ?",
        a: "Les images de villas et de skyline nourrissent un fantasme d’achat. En France, on vérifie prêt, apport, DPE et assurance avant de cliquer « précommande » sur un style de vie.",
      },
      {
        q: "Un crédit conso gaming bloque-t-il un prêt immo ?",
        a: "Il entre dans l’endettement. Un petit crédit peut faire basculer un dossier juste. Mieux vaut séparer loisirs et projet immobilier.",
      },
    ],
  },
];
