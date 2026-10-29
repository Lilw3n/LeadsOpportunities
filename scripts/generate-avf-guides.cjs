#!/usr/bin/env node
/**
 * Guides SEO de assurancevtcfrance.com (servis sous /guide/… par vercel.json).
 * Écrit assurance-vtc-france/guide/*.html et assurance-vtc-france/sitemap.xml.
 * Ce sitemap est déclaré dans le robots.txt commun (un fichier existant à la racine,
 * comme /robots.txt, passe avant les règles host de vercel.json).
 *   node scripts/generate-avf-guides.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "assurance-vtc-france");
const OUT = path.join(ROOT, "guide");
const SITE = "https://assurancevtcfrance.com";
const TODAY = new Date().toISOString().slice(0, 10);

const GUIDES = [
  {
    slug: "prix-assurance-vtc",
    title: "Prix d'une assurance VTC en 2026 : ce qui fait varier le tarif",
    h1: "Prix d'une assurance VTC : ce qui fait vraiment varier le tarif",
    description:
      "Combien coûte une assurance VTC ? Les éléments qui font monter ou baisser la prime : ville, véhicule, bonus, ancienneté, garanties. Devis gratuit en 2 minutes.",
    intro:
      "Le prix d'une assurance VTC n'a rien à voir avec celui d'une assurance auto classique : vous transportez des passagers contre rémunération, vous roulez beaucoup, souvent en ville et la nuit. L'assureur tarife ce risque. Voici ce qui pèse sur la prime, et comment la faire baisser sans perdre la couverture exigée par les plateformes.",
    sections: [
      {
        h2: "Les ordres de grandeur",
        p: [
          "À titre indicatif, une assurance VTC se situe le plus souvent entre 1 500 € et 4 000 € par an pour un chauffeur avec un historique correct, et peut dépasser ce montant pour un profil malussé, résilié ou un véhicule haut de gamme en Île-de-France. Ces chiffres ne remplacent pas un devis : deux chauffeurs dans la même ville peuvent avoir des tarifs très différents.",
        ],
      },
      {
        h2: "Ce qui fait monter le tarif",
        list: [
          "La zone de circulation : Paris et la petite couronne, Lyon, Marseille ou Nice coûtent plus cher que les villes moyennes.",
          "Le véhicule : valeur, puissance, modèle souvent volé, véhicule en LOA ou LLD (le loueur exige souvent le tous risques).",
          "L'historique : sinistres responsables, malus, résiliation par un précédent assureur.",
          "L'ancienneté du permis et de l'activité VTC : un démarrage d'activité est tarifé plus prudemment.",
          "Le niveau de garanties : franchise basse, véhicule de remplacement, perte d'exploitation.",
        ],
      },
      {
        h2: "Comment payer moins sans être mal couvert",
        list: [
          "Fournir un relevé d'information complet : sans lui, l'assureur applique un tarif par défaut.",
          "Ajuster la franchise : une franchise un peu plus haute réduit la prime, à condition de pouvoir l'assumer.",
          "Garder la RC transport de personnes à titre onéreux et la RC professionnelle : ce sont elles que les plateformes contrôlent.",
          "Comparer plusieurs assureurs spécialisés VTC via un courtier plutôt qu'un seul devis en ligne.",
          "Anticiper l'échéance : chercher un mois avant évite de signer dans l'urgence au prix fort.",
        ],
      },
    ],
    faq: [
      ["Le prix est-il mensualisable ?", "Oui, la plupart des contrats VTC se paient au mois. Le coût total annuel est souvent un peu plus élevé qu'en paiement annuel."],
      ["Un devis VTC engage-t-il ?", "Non. Le devis est gratuit et sans engagement : vous signez seulement si le tarif et les garanties vous conviennent."],
      ["Pourquoi mon assurance auto perso ne suffit pas ?", "Elle exclut le transport de passagers contre rémunération. En cas d'accident pendant une course, l'assureur peut refuser de vous couvrir."],
    ],
  },
  {
    slug: "attestation-uber-bolt-heetch",
    title: "Attestation d'assurance VTC pour Uber, Bolt et Heetch : ce qui est demandé",
    h1: "Attestation d'assurance pour Uber, Bolt et Heetch",
    description:
      "Quelle attestation fournir à Uber, Bolt ou Heetch ? Mention transport de personnes à titre onéreux, RC pro, dates de validité. Évitez la coupure de compte.",
    intro:
      "Pour rester actif sur Uber, Bolt ou Heetch, vous devez téléverser une attestation d'assurance valide. Une attestation incomplète, expirée ou au mauvais nom suffit à suspendre le compte, donc vos revenus. Voici ce que les plateformes vérifient.",
    sections: [
      {
        h2: "Ce que l'attestation doit montrer",
        list: [
          "L'usage « transport de personnes à titre onéreux » (ou mention équivalente VTC) : c'est le point le plus contrôlé.",
          "Le véhicule exact (immatriculation) utilisé sur la plateforme.",
          "Le nom du titulaire, cohérent avec votre compte chauffeur ou votre société.",
          "Des dates de validité couvrant la période en cours, sans interruption.",
          "Selon la plateforme, une attestation de responsabilité civile professionnelle séparée.",
        ],
      },
      {
        h2: "Éviter le « trou » d'attestation au renouvellement",
        p: [
          "La coupure arrive souvent à l'échéance : l'ancien contrat s'arrête, le nouveau n'est pas encore émis, la plateforme bloque le compte. Pour l'éviter, demandez votre relevé d'information tôt, faites partir le nouveau contrat le jour même où l'ancien s'arrête, et téléversez la nouvelle attestation dès réception.",
          "Si votre assureur actuel arrête le VTC ou ne renouvelle pas, il faut changer de porteur de risque avant la date d'échéance : c'est exactement le cas que traite notre courtier.",
        ],
      },
    ],
    faq: [
      ["Combien de temps pour obtenir une attestation ?", "Une fois le contrat accepté et le premier paiement fait, l'attestation provisoire est en général envoyée rapidement par mail, souvent le jour même."],
      ["Une carte verte suffit-elle ?", "Non. Les plateformes demandent une attestation qui mentionne l'usage VTC ; la carte verte seule ne le prouve pas."],
      ["Je change de voiture : que faire ?", "Prévenez l'assureur avant de rouler avec le nouveau véhicule, puis téléversez la nouvelle attestation sur chaque plateforme."],
    ],
  },
  {
    slug: "garanties-assurance-vtc",
    title: "Garanties d'une assurance VTC : obligatoires et vraiment utiles",
    h1: "Garanties d'une assurance VTC : l'obligatoire et l'utile",
    description:
      "RC transport de personnes à titre onéreux, RC professionnelle, dommages, vol, protection du conducteur, perte d'exploitation : quelles garanties choisir en VTC.",
    intro:
      "Une assurance VTC combine une base obligatoire et des garanties qui protègent votre véhicule et votre revenu. Bien les choisir évite deux erreurs fréquentes : payer pour des options inutiles, ou découvrir après un accident que la voiture est immobilisée sans indemnité.",
    sections: [
      {
        h2: "La base obligatoire",
        list: [
          "Responsabilité civile circulation pour le transport de personnes à titre onéreux : elle indemnise les dommages causés aux passagers et aux tiers.",
          "Responsabilité civile professionnelle : exigée pour l'activité de VTC et vérifiée par les plateformes.",
        ],
      },
      {
        h2: "Les garanties qui protègent votre outil de travail",
        list: [
          "Dommages tous accidents : indispensable en LOA ou LLD, souvent imposé par le loueur.",
          "Vol et incendie, bris de glace.",
          "Protection du conducteur : vos propres blessures ne sont pas couvertes par la responsabilité civile.",
          "Véhicule de remplacement et perte d'exploitation : quelques jours d'immobilisation peuvent coûter plus cher que l'option.",
          "Assistance 0 km : utile quand on roule tous les jours.",
        ],
      },
      {
        h2: "Les franchises, à lire avant de signer",
        p: [
          "Un tarif bas cache parfois des franchises élevées, notamment en cas de sinistre responsable ou de jeune conducteur. Comparez toujours la franchise à côté de la prime : c'est ce que vous paierez réellement le jour de l'accident.",
        ],
      },
    ],
    faq: [
      ["La protection du conducteur est-elle obligatoire ?", "Non, mais sans elle vos propres blessures après un accident responsable ne sont pas indemnisées. En VTC, c'est l'une des garanties les plus utiles."],
      ["La perte d'exploitation, c'est quoi ?", "Une indemnité qui compense une partie de votre revenu pendant l'immobilisation du véhicule après un sinistre couvert."],
    ],
  },
  {
    slug: "assurance-vtc-resilie-malus",
    title: "Assurance VTC après résiliation ou malus : comment se réassurer",
    h1: "Résilié ou malussé : se réassurer en VTC",
    description:
      "Résilié par votre assureur, malus, sinistres : il existe des assureurs VTC qui acceptent ces profils. Les étapes pour retrouver une attestation rapidement.",
    intro:
      "Une résiliation pour sinistres ou non-paiement, ou un malus élevé, ferme beaucoup de portes. Pas toutes : des assureurs spécialisés acceptent ces profils, à un tarif adapté. L'enjeu est de retrouver vite une attestation pour ne pas perdre l'accès aux plateformes.",
    sections: [
      {
        h2: "Les étapes",
        list: [
          "Récupérer le relevé d'information des 3 à 5 dernières années (l'assureur doit vous le fournir).",
          "Être transparent sur les sinistres et le motif de résiliation : une fausse déclaration peut entraîner la nullité du contrat.",
          "Passer par un courtier qui connaît les assureurs acceptant les profils aggravés.",
          "Accepter éventuellement une franchise plus élevée la première année, le temps de refaire un historique.",
        ],
      },
      {
        h2: "Et si personne n'accepte ?",
        p: [
          "En dernier recours, le Bureau central de tarification (BCT) peut imposer à un assureur de vous couvrir pour la responsabilité civile obligatoire. Cette solution ne couvre que le minimum légal : pour l'activité VTC et les plateformes, un contrat spécialisé reste préférable.",
        ],
      },
    ],
    faq: [
      ["Combien de temps reste-t-on « résilié » ?", "La résiliation figure dans le fichier des assureurs pendant plusieurs années, mais son poids diminue avec le temps sans sinistre."],
      ["Le malus disparaît-il ?", "Le coefficient redescend progressivement chaque année sans sinistre responsable."],
    ],
  },
  {
    slug: "assurance-vtc-creation-activite",
    title: "Nouveau chauffeur VTC : bien s'assurer pour démarrer son activité",
    h1: "Démarrer en VTC : l'assurance étape par étape",
    description:
      "Carte VTC, registre, statut, véhicule : à quel moment souscrire l'assurance VTC, quelles garanties prendre au démarrage et comment éviter de payer trop cher.",
    intro:
      "Quand on démarre en VTC, l'assurance arrive en même temps que la carte professionnelle, le statut et le véhicule. La faire au bon moment évite de payer un contrat avant de pouvoir travailler, ou au contraire de rater le démarrage faute d'attestation.",
    sections: [
      {
        h2: "Le bon ordre",
        list: [
          "Carte professionnelle VTC (après l'examen) et choix du statut (micro-entreprise, SASU…).",
          "Véhicule conforme aux exigences VTC, acheté ou en LOA / LLD.",
          "Assurance VTC souscrite au nom du titulaire, avec l'usage transport de personnes à titre onéreux.",
          "Inscription au registre des VTC, puis ouverture des comptes Uber, Bolt, Heetch avec l'attestation.",
        ],
      },
      {
        h2: "Rappels utiles",
        p: [
          "Le permis B doit avoir au moins 3 ans (2 ans en cas de conduite accompagnée) pour exercer. Côté assurance, un démarrage d'activité est tarifé prudemment : un relevé d'information propre sur votre auto personnelle aide à obtenir un meilleur prix.",
        ],
      },
    ],
    faq: [
      ["Puis-je m'assurer avant d'avoir ma carte VTC ?", "Le devis peut être fait avant ; la souscription se cale sur la date à laquelle vous pourrez réellement travailler."],
      ["Faut-il une société pour s'assurer ?", "Non. Un micro-entrepreneur peut souscrire une assurance VTC à son nom."],
    ],
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** GA4 du domaine en mode consentement : rien n'est stocké avant « Tout accepter ». */
const HEAD_TRACKING = `  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    (function(){
      var c = null;
      try { c = localStorage.getItem("lo_cookie_consent_v1"); } catch (e) {}
      var g = c && c !== "essential" ? "granted" : "denied";
      gtag("consent", "default", { analytics_storage: g, ad_storage: g, ad_user_data: g, ad_personalization: g });
    })();
    gtag("js", new Date());
    gtag("config", "G-85H2R0KDEN");
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-85H2R0KDEN"></script>
  <script src="/api/google-config-env"></script>
  <script src="/google-config.js"></script>
  <script src="/js/clarity-init.js" defer></script>
  <script src="/js/site-host-brand.js"></script>
  <script src="/assurance-vtc-france/attr-boot.js"></script>`;

function header() {
  return `  <header class="avf-hero avf-hero--guide" role="banner">
    <div class="avf-top">
      <div class="avf-brand-block">
        <a class="avf-brand" href="/">Assurance <span>VTC</span> France</a>
        <p class="avf-byline">par <a href="https://www.leadsopportunities.fr/">leadsopportunities.fr</a> · courtier ORIAS</p>
      </div>
      <a class="avf-nav-cta" href="/#devis-vtc">Devis VTC</a>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="avf-footer">
    <p>
      <strong>assurancevtcfrance.com</strong> — par <a href="https://www.leadsopportunities.fr/">leadsopportunities.fr</a>
      · Courtier ORIAS · <a href="/guide/">Guides VTC</a>
      · <a href="https://www.leadsopportunities.fr/mentions-legales.html">Mentions</a>
      · <a href="https://www.leadsopportunities.fr/politique-confidentialite.html">Confidentialité</a>
    </p>
  </footer>
  <script src="/js/cookie-banner.js"></script>
  <script src="/js/attribution.js"></script>
  <script src="/landings/tracking.js"></script>`;
}

function cta() {
  return `      <aside class="avf-cta-box">
        <p class="avf-cta-title">Votre devis VTC, sans engagement</p>
        <p>Téléphone + e-mail : un conseiller spécialisé VTC vous rappelle et compare plusieurs assureurs pour vous.</p>
        <a class="avf-btn avf-btn-primary" href="/#devis-vtc">Demander mon devis VTC</a>
      </aside>`;
}

function guidePage(g) {
  const url = `${SITE}/guide/${g.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.description,
    inLanguage: "fr-FR",
    dateModified: TODAY,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "Leads Opportunities", url: "https://www.leadsopportunities.fr/" },
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Assurance VTC France", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Guides VTC", item: SITE + "/guide/" },
      { "@type": "ListItem", position: 3, name: g.h1, item: url },
    ],
  };
  const body = g.sections
    .map((s) => {
      let html = `      <h2>${esc(s.h2)}</h2>\n`;
      (s.p || []).forEach((p) => (html += `      <p>${esc(p)}</p>\n`));
      if (s.list) html += `      <ul class="avf-list">\n${s.list.map((li) => `        <li>${esc(li)}</li>`).join("\n")}\n      </ul>\n`;
      return html;
    })
    .join("");
  const others = GUIDES.filter((o) => o.slug !== g.slug)
    .map((o) => `        <li><a href="/guide/${o.slug}">${esc(o.h1)}</a></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(g.title)}</title>
  <meta name="description" content="${esc(g.description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${esc(g.title)}" />
  <meta property="og:description" content="${esc(g.description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="https://www.leadsopportunities.fr/og/og-vtc.jpg" />
${HEAD_TRACKING}
  <link rel="stylesheet" href="/assurance-vtc-france/styles.css" />
  <script type="application/ld+json">${JSON.stringify(articleLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbsLd)}</script>
</head>
<body class="avf avf-guide" data-market-intent="FR" data-site-domain="assurancevtcfrance.com" data-vertical="vtc" data-need="vtc">
${header()}
  <main class="avf-article">
    <nav class="avf-crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <a href="/guide/">Guides VTC</a></nav>
    <article>
      <h1>${esc(g.h1)}</h1>
      <p class="avf-intro">${esc(g.intro)}</p>
${body}${cta()}
      <h2>Questions fréquentes</h2>
      <div class="avf-faq">
${g.faq.map(([q, a]) => `        <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
      </div>
      <h2>À lire aussi</h2>
      <ul class="avf-list">
${others}
      </ul>
      <p class="avf-note">Informations générales, à jour du ${TODAY.split("-").reverse().join("/")}. Elles ne remplacent pas les conditions du contrat proposé par l'assureur.</p>
    </article>
  </main>
${footer()}
</body>
</html>
`;
}

function hubPage() {
  const url = `${SITE}/guide/`;
  const cards = GUIDES.map(
    (g) => `        <article><h2><a href="/guide/${g.slug}">${esc(g.h1)}</a></h2><p>${esc(g.description)}</p></article>`
  ).join("\n");
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Guides assurance VTC : prix, attestation Uber, garanties, résilié | Assurance VTC France</title>
  <meta name="description" content="Tout comprendre de l'assurance VTC : prix, attestation pour Uber Bolt Heetch, garanties, résiliation et malus, démarrage d'activité. Par un courtier ORIAS." />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${url}" />
${HEAD_TRACKING}
  <link rel="stylesheet" href="/assurance-vtc-france/styles.css" />
</head>
<body class="avf avf-guide" data-market-intent="FR" data-site-domain="assurancevtcfrance.com" data-vertical="vtc" data-need="vtc">
${header()}
  <main class="avf-article">
    <nav class="avf-crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › Guides VTC</nav>
    <h1>Guides assurance VTC</h1>
    <p class="avf-intro">Les réponses aux questions que les chauffeurs nous posent le plus, avant de demander un devis.</p>
    <div class="avf-guides">
${cards}
    </div>
${cta()}
  </main>
${footer()}
</body>
</html>
`;
}

function sitemap() {
  const urls = [`${SITE}/`, `${SITE}/devis`, `${SITE}/guide/`].concat(GUIDES.map((g) => `${SITE}/guide/${g.slug}`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
}

fs.mkdirSync(OUT, { recursive: true });
GUIDES.forEach((g) => fs.writeFileSync(path.join(OUT, g.slug + ".html"), guidePage(g)));
fs.writeFileSync(path.join(OUT, "index.html"), hubPage());
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap());
console.log("Guides AVF : " + GUIDES.length + " pages + sommaire et sitemap écrits.");

module.exports = { GUIDES };
