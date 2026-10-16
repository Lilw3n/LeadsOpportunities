/**
 * Cluster pro : garage / négociant auto, MRP, RC Pro,
 * métiers du bâtiment, transport marchandises et voyageurs.
 * Santé collective et décennale restent leurs silos déjà live.
 */
var LT = require("./seo-long-term-related.cjs");

function siblingsForLanding(landing, file) {
  var key = String(landing || "");
  if (key.indexOf("../") === 0) key = key.slice(2);
  if (key.charAt(0) !== "/") key = "/" + key;
  var groups = LT.PARTENARIAT || {};
  var ids = Object.keys(groups);
  for (var i = 0; i < ids.length; i++) {
    var arr = groups[ids[i]];
    var hit = arr.some(function (l) {
      return l.href === key;
    });
    if (!hit) continue;
    return arr
      .filter(function (l) {
        if (l.href === key) return false;
        if (file && l.href.indexOf(file) >= 0) return false;
        return true;
      })
      .slice(0, 3)
      .map(function (l) {
        return { href: ".." + l.href, label: l.label };
      });
  }
  return [];
}

function utm(path, campaign) {
  var sep = path.indexOf("?") >= 0 ? "&" : "?";
  return path + sep + "utm_source=blog&utm_medium=article&utm_campaign=" + encodeURIComponent(campaign);
}

function article(opts) {
  return {
    file: opts.file,
    section: "pro",
    skipImages: true,
    tag: opts.tag,
    tagClass: "tag-pro",
    themes: opts.themes || ["pro"],
    title: opts.title,
    description: opts.description,
    meta: "8 min · Octobre 2026",
    cardExcerpt: opts.cardExcerpt,
    keywords: opts.keywords,
    cta: { href: utm(opts.landing, opts.campaign), label: opts.ctaLabel },
    blocks: opts.blocks,
    faq: opts.faq || [],
    related: [
      { href: "../assurances-niches.html", label: "Assurances de niche" },
      { href: "../landings/metiers-batiment.html", label: "Métiers du bâtiment" },
    ].concat(siblingsForLanding(opts.landing, opts.file)),
  };
}

module.exports = [
  article({
    file: "assurance-garage-negociant-auto-rc-mrp-2026.html",
    tag: "Garage & négociant",
    campaign: "garage_negociant",
    landing: "../landings/garage-negociant-auto.html",
    themes: ["pro", "auto"],
    title: "Assurance garage et négociant auto : dépôt, atelier, essai",
    description:
      "Garage, carrosserie, négociant automobile : RC exploitation, véhicules en dépôt, essai, MRP atelier. Ce que le courtier doit déclarer avant le devis.",
    cardExcerpt: "Un garage n’est pas une auto particulière : dépôt, essai et atelier se déclarent à part.",
    keywords: [
      "assurance garage automobile",
      "assurance négociant auto",
      "responsabilité dépositaire véhicules",
      "assurance atelier carrosserie",
      "véhicules en dépôt garage",
      "devis assurance garage",
    ],
    ctaLabel: "Devis garage / négociant",
    blocks: [
      {
        type: "p",
        text: "Un <strong>garage</strong> ou un <strong>négociant automobile</strong> cumule trois risques que l’assurance auto du dirigeant ne couvre pas : les véhicules des clients en dépôt, les essais sur route, et l’atelier (incendie, vol d’outillage, dommages aux tiers). <a href=\"../landings/garage-negociant-auto.html\"><strong>Préparer un devis garage</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Véhicules qui ne vous appartiennent pas" },
      {
        type: "p",
        text: "La responsabilité du dépositaire vise les voitures confiées pour réparation, stockage ou revente. Le nombre de places, la valeur moyenne et le stationnement (atelier, cour, voirie) changent le devis. Un négociant qui achète pour revendre déclare aussi son stock propre.",
      },
      { type: "h2", text: "2. Essai, convoyage interne, flotte" },
      {
        type: "ul",
        items: [
          "Essais clients : qui conduit, quel périmètre, plaque d’essai ou non",
          "Déplacements pour contrôle technique ou expertise",
          "Véhicules de prêt et de courtoisie",
          "Utilitaires de l’entreprise, distincts du stock",
        ],
      },
      { type: "h2", text: "3. Atelier : MRP, pas seulement RC" },
      {
        type: "p",
        text: "La RC couvre le dommage causé à un tiers. L’incendie du local, le vol du pont ou la perte d’exploitation relèvent de la <a href=\"../landings/multirisque-professionnelle.html\">multirisque professionnelle</a>. Les deux contrats se lisent ensemble, pas l’un à la place de l’autre.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "L’assurance auto du gérant couvre-t-elle le garage ?",
        a: "Non. L’usage personnel ou « tous déplacements » du dirigeant ne remplace pas la responsabilité du dépôt ni l’activité de réparation ou de négoce.",
      },
      {
        q: "Négociant et garagiste, même questionnaire ?",
        a: "Le parcours est le même. On sépare ensuite le stock destiné à la revente, les véhicules en réparation et l’atelier.",
      },
    ],
  }),

  article({
    file: "assurance-multirisque-professionnelle-locaux-2026.html",
    tag: "Multirisque pro",
    campaign: "mrp",
    landing: "../landings/multirisque-professionnelle.html",
    themes: ["pro"],
    title: "Multirisque professionnelle : locaux, stock, perte d’exploitation",
    description:
      "MRP pour commerces, ateliers et bureaux : incendie, dégât des eaux, vol, bris, perte d’exploitation. Différence avec l’assurance immeuble et la RC Pro.",
    cardExcerpt: "La MRP protège ce que vous occupez et votre matériel. Elle ne remplace pas la RC ni la décennale.",
    keywords: [
      "multirisque professionnelle",
      "assurance locaux professionnels",
      "MRP commerce",
      "perte d'exploitation",
      "assurance atelier",
      "devis multirisque pro",
    ],
    ctaLabel: "Devis multirisque pro",
    blocks: [
      {
        type: "p",
        text: "La <strong>multirisque professionnelle</strong> couvre en principe les locaux que vous occupez, le matériel, le stock et souvent une perte d’exploitation. Elle ne répond pas à la place de la RC Pro, ni à la place d’une décennale, ni à la place de l’assurance de l’immeuble si vous êtes seulement locataire. <a href=\"../landings/multirisque-professionnelle.html\"><strong>Lancer un devis MRP</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qu’on aligne avant de comparer" },
      {
        type: "ul",
        items: [
          "Surface, adresse, activité réelle exercée dans les murs",
          "Valeur du matériel et du stock, pas seulement le loyer",
          "Mesures de protection : alarme, extincteurs, détection",
          "Durée d’indemnisation de la perte d’exploitation",
          "Contenu extérieur, enseignes, vitrines",
        ],
      },
      { type: "h2", text: "2. MRP, immeuble, RC : trois contrats" },
      {
        type: "p",
        text: "L’<a href=\"./assurance-immeuble-professionnel-multirisque-2026.html\">immeuble professionnel</a> concerne surtout le propriétaire du bâtiment. La MRP concerne l’exploitant. La <a href=\"./assurance-rc-pro-entreprise-guide-2026.html\">RC Pro</a> concerne les dommages causés aux clients et aux tiers. Un devis « pas cher » qui mélange les trois postes n’est pas comparable.",
      },
      { type: "h2", text: "3. Salariés : un autre contrat" },
      {
        type: "p",
        text: "Dès qu’il y a des salariés, la <a href=\"../landings/sante-collective.html\">mutuelle collective</a> est un sujet employeur distinct de la MRP. On ne le glisse pas dans la même prime.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Locataire : la MRP du bailleur suffit-elle ?",
        a: "Non. Le propriétaire assure le bâtiment. Vous assurez votre contenu, votre activité et votre responsabilité d’exploitant.",
      },
    ],
  }),

  article({
    file: "assurance-rc-pro-entreprise-guide-2026.html",
    tag: "RC Pro",
    campaign: "rc_pro",
    landing: "../landings/rc-pro.html",
    themes: ["pro"],
    title: "RC Pro : ce qu’elle couvre, et ce qu’elle ne remplace pas",
    description:
      "Responsabilité civile professionnelle : dommages aux tiers, activité déclarée, plafond, franchise. Pourquoi elle ne remplace ni la décennale, ni la MRP, ni l’auto.",
    cardExcerpt: "La RC Pro suit l’activité déclarée. Une activité oubliée est une garantie absente.",
    keywords: [
      "rc pro",
      "responsabilité civile professionnelle",
      "assurance rc entreprise",
      "devis rc pro",
      "rc exploitation",
      "différence rc pro décennale",
    ],
    ctaLabel: "Devis RC Pro",
    blocks: [
      {
        type: "p",
        text: "La <strong>RC professionnelle</strong> intervient quand l’activité cause un dommage à un client ou à un tiers : blessure, dégât matériel, parfois erreur ou omission selon le métier. Le libellé de l’activité sur le contrat compte plus que l’intitulé du KBIS. <a href=\"../landings/rc-pro.html\"><strong>Décrire l’activité pour un devis</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Activité déclarée = périmètre réel" },
      {
        type: "p",
        text: "Pose, conseil, vente, sous-traitance, travail chez le client : chaque verbe peut être une extension. Si le chiffre d’affaires mélange plusieurs métiers, on les liste. Une RC « bureau » ne couvre pas un chantier.",
      },
      { type: "h2", text: "2. Ce que la RC Pro ne remplace pas" },
      {
        type: "ul",
        items: [
          "Décennale : solidité de l’ouvrage pendant dix ans",
          "MRP : vos locaux, votre stock, votre matériel",
          "Auto ou flotte : circulation des véhicules",
          "Santé collective : salariés",
        ],
      },
      { type: "h2", text: "3. Plafond et franchise" },
      {
        type: "p",
        text: "Deux devis à la même prime peuvent avoir un plafond corporel très différent. On compare le plafond, la franchise et les exclusions d’activité, pas seulement le prix annuel. Pour le bâtiment, partir du <a href=\"../landings/metiers-batiment.html\">parcours métiers du bâtiment</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "RC Pro et décennale, faut-il les deux ?",
        a: "Souvent oui pour un artisan du bâtiment. La décennale vise l’ouvrage. La RC vise les autres dommages liés à l’activité, y compris avant réception ou hors ouvrage.",
      },
    ],
  }),

  article({
    file: "assurance-metiers-batiment-decennale-rc-2026.html",
    tag: "Métiers du bâtiment",
    campaign: "metiers_batiment",
    landing: "../landings/metiers-batiment.html",
    themes: ["pro"],
    title: "Métiers du bâtiment : décennale, RC chantier et atelier",
    description:
      "Maçon, couvreur, électricien, plombier, second œuvre : quel contrat pour l’ouvrage, le chantier et l’atelier. Parcours courtier pour artisans du bâtiment.",
    cardExcerpt: "Bâtiment : la décennale n’est qu’une pièce. RC chantier et MRP atelier complètent le dossier.",
    keywords: [
      "assurance métiers du bâtiment",
      "assurance artisan bâtiment",
      "décennale et rc pro",
      "assurance chantier artisan",
      "corps d'état assurance",
      "devis artisan bâtiment",
    ],
    ctaLabel: "Parcours bâtiment",
    blocks: [
      {
        type: "p",
        text: "Les <strong>métiers du bâtiment</strong> n’ont pas un seul contrat. L’ouvrage relève de la <a href=\"../landings/decennale.html\">décennale</a>, les dommages aux tiers pendant le travail de la <a href=\"../landings/rc-pro.html\">RC</a>, l’atelier et l’outillage de la <a href=\"../landings/multirisque-professionnelle.html\">multirisque</a>. Le ramonage et la fumisterie ont déjà leur page. <a href=\"../landings/metiers-batiment.html\"><strong>Choisir le bon parcours</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Corps d’état à déclarer tels quels" },
      {
        type: "p",
        text: "Gros œuvre, couverture, électricité, plomberie, menuiserie, peinture, isolation : l’assureur lit les techniques (ITE, étanchéité, travail en hauteur, sous-traitance). Un devis unique « tous corps d’état » sans détail est souvent refusé ou mal tarifé.",
      },
      { type: "h2", text: "2. Pièces qui accélèrent" },
      {
        type: "ul",
        items: [
          "CA travaux, pas le CA de vente de matériaux si vous le séparez",
          "Part de sous-traitance donnée et reçue",
          "Sinistres décennale et RC sur cinq ans",
          "Attestation en cours si c’est un renouvellement",
          "Effectif, pour la mutuelle collective en parallèle",
        ],
      },
      { type: "h2", text: "3. Ne pas confondre avec le transport de chantier" },
      {
        type: "p",
        text: "L’utilitaire qui va au chantier n’est pas une assurance marchandises. S’il y a livraison ou enlèvement pour compte d’autrui, ouvrir aussi le <a href=\"../landings/transport-logistique.html\">parcours transport</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Auto-entrepreneur du bâtiment : décennale obligatoire ?",
        a: "Le statut ne dispense pas. Dès que les travaux peuvent engager la responsabilité décennale sur un ouvrage, l’attestation est demandée par les donneurs d’ordre.",
      },
    ],
  }),

  article({
    file: "assurance-transport-logistique-marchandises-2026.html",
    tag: "Transport & logistique",
    campaign: "transport_logistique",
    landing: "../landings/transport-logistique.html",
    themes: ["pro", "auto"],
    title: "Assurance transport et logistique : marchandises, lot, entrepôt",
    description:
      "Transporteur, commissionnaire, entrepositaire : RC exploitation, marchandises transportées, entrepôt. À ne pas confondre avec l’assurance du camion ni avec le convoyage.",
    cardExcerpt: "Le camion assuré ne veut pas dire la marchandise assurée.",
    keywords: [
      "assurance transport marchandises",
      "assurance logistique",
      "rc transporteur",
      "commissionnaire de transport",
      "assurance entrepôt",
      "devis assurance transport",
    ],
    ctaLabel: "Devis transport / logistique",
    blocks: [
      {
        type: "p",
        text: "En <strong>logistique</strong>, trois couches se superposent : le véhicule (flotte), la marchandise transportée ou entreposée, et la responsabilité du commissionnaire ou du transporteur. Assurer le camion ne couvre pas le lot. <a href=\"../landings/transport-logistique.html\"><strong>Décrire l’activité de transport</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce qu’il faut séparer dans le devis" },
      {
        type: "ul",
        items: [
          "Transport pour compte d’autrui ou compte propre",
          "National, international, messagerie, lot complet",
          "Marchandises sensibles, température dirigée, valeur déclarée",
          "Entrepôt : surface, sprinklers, marchandises de tiers",
          "Sous-traitance à d’autres transporteurs",
        ],
      },
      { type: "h2", text: "2. Convoyage et VTC ne sont pas ce métier" },
      {
        type: "p",
        text: "Le <a href=\"../landings/convoyage-vehicules.html\">convoyage</a> déplace un véhicule, en général sans marchandise commerciale. Le VTC transporte des personnes en voiture. Un contrat de l’un ne se recycle pas pour l’autre.",
      },
      { type: "h2", text: "3. Atelier et quai" },
      {
        type: "p",
        text: "Le bâtiment d’exploitation (quai, bureau, atelier de maintenance) se regarde avec la <a href=\"../landings/multirisque-professionnelle.html\">multirisque professionnelle</a>, à part de la marchandise confiée.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "La RC du contrat type transporteur suffit-elle ?",
        a: "Elle cadre une partie de la responsabilité sur la marchandise. Elle ne remplace pas l’assurance du véhicule, ni l’entrepôt, ni une marchandise sous valeur déclarée si le plafond du contrat est trop bas.",
      },
    ],
  }),

  article({
    file: "assurance-transport-voyageurs-commun-2026.html",
    tag: "Transport de voyageurs",
    campaign: "transport_voyageurs",
    landing: "../landings/transport-voyageurs.html",
    themes: ["pro", "vtc"],
    title: "Transport de voyageurs : autocar, lignes, VTC et commun",
    description:
      "Transport de personnes : VTC et taxi d’un côté, autocar, navette et transport scolaire de l’autre. Activité, capacité, lignes. Parcours distinct du convoyage.",
    cardExcerpt: "Transporter des personnes n’est pas convoyer une voiture vide.",
    keywords: [
      "assurance transport de voyageurs",
      "assurance autocar",
      "assurance transport en commun",
      "transport scolaire assurance",
      "rc transport personnes",
      "différence vtc autocar",
    ],
    ctaLabel: "Devis transport de personnes",
    blocks: [
      {
        type: "p",
        text: "Le <strong>transport de voyageurs</strong> se découpe par le véhicule et par l’autorisation. Une voiture avec chauffeur (VTC, taxi) n’a pas le même dossier qu’un autocar, une navette d’entreprise ou un transport scolaire. <a href=\"../landings/transport-voyageurs.html\"><strong>Choisir le bon parcours</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Voiture avec chauffeur" },
      {
        type: "p",
        text: "VTC et plateformes : le hub <a href=\"../assurance-vtc/\">assurance VTC</a> et, pour le site dédié, Assurance VTC France. L’attestation doit mentionner le transport de personnes. Une auto « domicile-travail » ne convient pas.",
      },
      { type: "h2", text: "2. Autocar, navette, scolaire, lignes" },
      {
        type: "ul",
        items: [
          "Capacité des véhicules et nombre de conducteurs",
          "Régulier, occasionnel, tourisme, scolaire",
          "Périmètre géographique et gares / aéroports",
          "Sous-traitance et véhicules en location",
          "Historique des sinistres corporels",
        ],
      },
      { type: "h2", text: "3. Ce qui reste à côté" },
      {
        type: "p",
        text: "Le transport de colis reste sur la page <a href=\"../landings/transport-logistique.html\">logistique</a>. Le déplacement d’un véhicule sans passager commercial reste sur le <a href=\"../landings/convoyage-vehicules.html\">convoyage</a>. Mélanger les trois dans un seul formulaire produit un devis inutilisable.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Un autocar peut-il partir du questionnaire VTC ?",
        a: "Non. Le questionnaire VTC est calibré pour la voiture de tourisme avec chauffeur. L’autocar, le scolaire et les lignes passent par le parcours transport de voyageurs.",
      },
    ],
  }),
];
