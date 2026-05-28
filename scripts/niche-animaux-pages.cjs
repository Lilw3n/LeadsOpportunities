/**
 * Pages SEO longue traîne — silo assurance animaux (chien, chat, tarifs…)
 */
function buildAnimauxLongtailPages(page, base) {
  const LANDING = "/landings/animaux.html";
  const LANDING_EXPRESS = "/landings/animaux-express.html";
  const BASE = base || "/assurance-animaux/";

  function lt(data) {
    return page(
      Object.assign(
        {
          theme: "animaux",
          cta: { href: LANDING, label: data.ctaLabel || "Demande de rappel — devis animaux" },
          benefits: [
            { title: "Marques connues", text: "Santévet, Bulle Bleue, Kozoo : des assureurs specialises." },
            { title: "Tarif indicatif", text: "Fourchette claire avant rappel conseiller." },
            { title: "Sans engagement", text: "Comparatif gratuit, vous decidez apres le devis." },
          ],
          faq: data.faq || [],
          related: data.related || [
            { href: BASE, label: "Guide assurance animaux" },
            { href: BASE + "chien/", label: "Assurance chien" },
            { href: BASE + "chat/", label: "Assurance chat" },
            { href: BASE + "villes/", label: "Par ville en France" },
            { href: LANDING_EXPRESS, label: "Rappel express 30 sec" },
          ],
        },
        data
      )
    );
  }

  const chienLongtail = [
    {
      slug: "pas-cher",
      badge: "Budget",
      title: "Assurance chien pas cher | Devis 2026",
      description:
        "Assurance chien pas cher : formules essentielles, plafonds et franchises expliques. Comparatif gratuit, courtier ORIAS.",
      h1: "Assurance chien pas cher : trouver le bon rapport garanties / prix",
      intro:
        "Un contrat a petit prix peut laisser de gros restes a charge en chirurgie. Nous comparons les offres pas cheres mais exploitables, pas les promesses irreelles.",
      ctaLabel: "Comparer assurance chien pas cher",
    },
    {
      slug: "chiot",
      badge: "Chiot",
      title: "Assurance chiot | Des 2-3 mois — devis gratuit",
      description:
        "Assurance chiot : adhesion jeune, prevention, vaccins. Devis en ligne et rappel conseiller, courtier ORIAS.",
      h1: "Assurer un chiot : anticiper des la premiere annee",
      intro:
        "Plus vous assurez tot, plus vous limitez les exclusions liees aux antecedents. Nous ciblons les formules favorables aux chiots et jeunes chiens.",
      ctaLabel: "Devis assurance chiot",
    },
    {
      slug: "senior",
      badge: "Chien senior",
      title: "Assurance chien senior | Chien age — devis",
      description:
        "Assurance pour chien senior : plafonds, franchises, exclusions. Solutions selon l age et l etat de sante.",
      h1: "Assurance chien senior : encore assurable apres 8 ans ?",
      intro:
        "Les assureurs fixent des limites d age a l adhesion. Nous testons votre profil et expliquons les plafonds realistes pour un chien age.",
      ctaLabel: "Devis chien senior",
    },
    {
      slug: "prix",
      badge: "Prix",
      title: "Prix assurance chien | Tarif mensuel 2026",
      description:
        "Prix assurance chien : facteurs (race, age, formule). Tarif indicatif en ligne puis devis personnalise.",
      h1: "Prix assurance chien : ce qui fait varier la cotisation",
      intro:
        "Race, poids, zone, niveau de garanties : le prix peut aller d une quinzaine a plus de 60 EUR par mois. Nous calibrons selon votre usage veterinaire reel.",
      ctaLabel: "Voir mon tarif chien",
    },
    {
      slug: "mutuelle",
      badge: "Mutuelle chien",
      title: "Mutuelle chien | Comparatif formules",
      description:
        "Mutuelle chien : remboursement consult, chirurgie, prevention. Comparatif des mutuelles animaux du marche.",
      h1: "Mutuelle chien : la difference entre marketing et remboursements",
      intro:
        "Mutuelle ou assurance animaux : l important est le plafond annuel, le taux et la franchise. Nous alignons le comparatif sur vos priorites.",
      ctaLabel: "Comparer mutuelle chien",
    },
  ];

  const chatLongtail = [
    {
      slug: "pas-cher",
      badge: "Budget",
      title: "Assurance chat pas cher | Devis 2026",
      description:
        "Assurance chat pas cher : formules accessibles, plafonds expliques. Courtier ORIAS, devis gratuit.",
      h1: "Assurance chat pas cher sans mauvaises surprises",
      intro:
        "Chat d interieur ou d exterieur : le risque n est pas le meme. Nous adaptons le niveau de couverture au budget que vous pouvez tenir.",
      ctaLabel: "Assurance chat pas cher — devis",
    },
    {
      slug: "chaton",
      badge: "Chaton",
      title: "Assurance chaton | Prevention incluse",
      description:
        "Assurance chaton : jeune chat, vaccins, sterilisation. Devis rapide et conseil telephone.",
      h1: "Assurer un chaton des les premiers mois",
      intro:
        "Adhesion precoce = moins d exclusions. Nous orientons vers les contrats avec bonne prise en charge prevention.",
      ctaLabel: "Devis assurance chaton",
    },
    {
      slug: "senior",
      badge: "Chat senior",
      title: "Assurance chat senior | Chat age",
      description:
        "Assurance chat senior : maladies liees a l age, plafonds. Comparatif gratuit.",
      h1: "Assurance chat senior : couvrir les soins du vieillissement",
      intro:
        "Insuffisance renale, arthrose, diabete : les soins coutent cher. Nous cherchons une formule encore ouverte a l adhesion.",
      ctaLabel: "Devis chat senior",
    },
    {
      slug: "prix",
      badge: "Prix",
      title: "Prix assurance chat | Tarif mensuel",
      description:
        "Prix assurance chat : fourchette selon age et formule. Tarif indicatif en ligne.",
      h1: "Prix assurance chat : combien prevoir par mois ?",
      intro:
        "En moyenne les chats coutent moins cher a assurer que les gros chiens, mais une urgence reste lourde. Nous chiffrons selon votre profil.",
      ctaLabel: "Estimer le prix chat",
    },
  ];

  const nationalLongtail = [
    {
      file: "assurance-animaux/mutuelle/index.html",
      badge: "Mutuelle animaux",
      title: "Mutuelle animaux | Chien et chat — comparatif",
      description:
        "Mutuelle animaux pour chien et chat : plafonds, franchises, prevention. Courtier ORIAS, devis gratuit.",
      h1: "Mutuelle animaux : comment choisir en 2026",
      intro:
        "Le mot mutuelle rassure, mais ce sont les garanties qui comptent. Nous comparons les contrats a prestations equivalentes.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Mutuelle animaux", url: BASE + "mutuelle/" },
      ],
    },
    {
      file: "assurance-animaux/chiot/index.html",
      badge: "Chiot & chaton",
      title: "Assurance chiot et chaton | Devis jeune animal",
      description:
        "Assurer chiot ou chaton : prevention, vaccins, tarifs jeunes animaux. Devis en ligne.",
      h1: "Assurance chiot et chaton : bien demarrer",
      intro:
        "Un seul parcours pour chien ou chat : questionnaire 3 minutes, tarif indicatif, rappel conseiller.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Chiot & chaton", url: BASE + "chiot/" },
      ],
    },
    {
      file: "assurance-animaux/senior/index.html",
      badge: "Animaux seniors",
      title: "Assurance animal senior | Chien et chat ages",
      description:
        "Assurance pour animal senior : plafonds, delais, exclusions. Accompagnement courtier.",
      h1: "Assurance animal senior : solutions selon l age",
      intro:
        "Passé 8-10 ans, les choix se reduisent. Nous identifions les assureurs encore ouverts et expliquons les limites.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Animaux seniors", url: BASE + "senior/" },
      ],
    },
    {
      file: "assurance-animaux/nac/index.html",
      badge: "NAC",
      title: "Assurance NAC | Lapin, furet, rongeur…",
      description:
        "Assurance nouveaux animaux de compagnie : lapin, furet, oiseau selon disponibilite assureurs.",
      h1: "Assurance NAC : quels animaux peut-on couvrir ?",
      intro:
        "Le marche est plus restreint que chien/chat. Nous orientons vers les partenaires qui couvrent votre espece ou une alternative adaptee.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "NAC", url: BASE + "nac/" },
      ],
    },
    {
      file: "assurance-animaux/tarif/index.html",
      badge: "Tarif",
      title: "Tarif assurance animaux | Prix chien et chat",
      description:
        "Tarif assurance animaux : fourchettes, formules, facteurs de prix. Devis personnalise gratuit.",
      h1: "Tarif assurance animaux : comprendre votre cotisation",
      intro:
        "Accident seul, equilibre ou premium : trois niveaux de prix pour trois niveaux de remboursement. Estimez en ligne puis affinez au telephone.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Tarif", url: BASE + "tarif/" },
      ],
      sections: [
        {
          h2: "Fourchettes indicatives (a affiner selon profil)",
          list: [
            "Formule essentielle / accident : souvent 12–25 EUR / mois",
            "Formule equilibre : souvent 25–45 EUR / mois",
            "Formule confort / premium : 45 EUR / mois et plus",
          ],
        },
      ],
    },
    {
      file: "assurance-animaux/devis-rapide/index.html",
      badge: "Devis rapide",
      title: "Devis assurance animaux rapide | Rappel 30 sec",
      description:
        "Devis assurance animaux express : nom, telephone, rappel conseiller. Chien, chat, comparatif.",
      h1: "Devis assurance animaux en 30 secondes",
      intro:
        "Pas le temps pour le questionnaire complet ? Laissez vos coordonnees : un conseiller vous rappelle avec un comparatif cible.",
      cta: { href: LANDING_EXPRESS, label: "Demande de rappel express" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Devis rapide", url: BASE + "devis-rapide/" },
      ],
    },
    {
      file: "assurance-animaux/pas-cher/index.html",
      badge: "Pas cher",
      title: "Assurance animaux pas cher | Chien et chat",
      description:
        "Assurance animaux pas cher : limites, plafonds, pieges a eviter. Devis gratuit.",
      h1: "Assurance animaux pas cher : attention aux trous dans la raquette",
      intro:
        "Le moins cher n est pas toujours le plus economique apres un sinistre. Nous filtrons les contrats trop limites.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Pas cher", url: BASE + "pas-cher/" },
      ],
    },
    {
      file: "assurance-animaux/santevet/index.html",
      badge: "Santévet",
      title: "Assurance animaux Santévet | Devis comparatif",
      description:
        "Comparer Santévet et alternatives pour chien et chat. Courtier ORIAS, devis gratuit.",
      h1: "Assurance Santévet : comparer avant de souscrire",
      intro:
        "Santévet est une reference du marche. Nous le positionnons dans un comparatif avec Bulle Bleue, Kozoo et le reseau courtage.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Santévet", url: BASE + "santevet/" },
      ],
    },
    {
      file: "assurance-animaux/bulle-bleue/index.html",
      badge: "Bulle Bleue",
      title: "Assurance animaux Bulle Bleue | Comparatif",
      description:
        "Bulle Bleue assurance animaux : garanties, prix, alternatives. Devis et conseil.",
      h1: "Bulle Bleue : une option parmi d autres",
      intro:
        "Nous comparons Bulle Bleue a garanties equivalentes pour que vous payiez le juste prix.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: BASE },
        { name: "Bulle Bleue", url: BASE + "bulle-bleue/" },
      ],
    },
  ];

  const out = [];

  chienLongtail.forEach(function (item) {
    out.push(
      lt({
        file: "assurance-animaux/chien/" + item.slug + "/index.html",
        badge: item.badge,
        title: item.title,
        description: item.description,
        h1: item.h1,
        intro: item.intro,
        ctaLabel: item.ctaLabel,
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: "Assurance animaux", url: BASE },
          { name: "Assurance chien", url: BASE + "chien/" },
          { name: item.badge, url: BASE + "chien/" + item.slug + "/" },
        ],
        related: [
          { href: BASE + "chien/", label: "Guide assurance chien" },
          { href: BASE + "chat/", label: "Assurance chat" },
          { href: BASE + "comparatif/", label: "Comparatif" },
          { href: LANDING, label: "Questionnaire complet" },
        ],
      })
    );
  });

  chatLongtail.forEach(function (item) {
    out.push(
      lt({
        file: "assurance-animaux/chat/" + item.slug + "/index.html",
        badge: item.badge,
        title: item.title,
        description: item.description,
        h1: item.h1,
        intro: item.intro,
        ctaLabel: item.ctaLabel,
        crumbs: [
          { name: "Accueil", url: "/" },
          { name: "Assurance animaux", url: BASE },
          { name: "Assurance chat", url: BASE + "chat/" },
          { name: item.badge, url: BASE + "chat/" + item.slug + "/" },
        ],
        related: [
          { href: BASE + "chat/", label: "Guide assurance chat" },
          { href: BASE + "chien/", label: "Assurance chien" },
          { href: BASE + "pas-cher/", label: "Assurance animaux pas cher" },
          { href: LANDING, label: "Devis en ligne" },
        ],
      })
    );
  });

  nationalLongtail.forEach(function (item) {
    out.push(lt(item));
  });

  return out;
}

module.exports = { buildAnimauxLongtailPages };
