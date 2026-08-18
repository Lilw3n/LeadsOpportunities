/**
 * Page locale siège Varangéville — URL à coller sur la fiche Google.
 * Usage: node scripts/generate-agence-varangeville.cjs
 */
const fs = require("fs");
const path = require("path");
const { ORG, OFFER_CATALOG, localBusinessJsonLd } = require("./seo-org-schema.cjs");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://www.leadsopportunities.fr";
const PAGE_PATH = "/agence-varangeville/";
const url = ORIGIN + PAGE_PATH;

const SERVICES = [
  {
    href: "../credit-immo/",
    landing: "../landings/credit-immo.html",
    title: "Crédit immobilier",
    text: "Simulation, 2e chance après refus, assurance emprunteur.",
  },
  {
    href: "../rachat-credit/",
    landing: "../landings/rachat.html",
    title: "Rachat / regroupement de crédits",
    text: "RAC : baisser les mensualités, mix immo + conso.",
  },
  {
    href: "../credit-conso/",
    landing: "../landings/conso.html",
    title: "Crédit consommation",
    text: "Travaux, véhicule, trésorerie — dossier calibre.",
  },
  {
    href: "../pret-relais/",
    landing: "../landings/pret-relais.html",
    title: "Prêt relais",
    text: "Acheter avant d’avoir vendu, quotité et durée.",
  },
  {
    href: "../credit-pro/",
    landing: "../landings/credit-pro.html",
    title: "Crédit professionnel",
    text: "TNS et entreprises : matériel, BFR, garanties.",
  },
  {
    href: "../renegociation-pret/",
    landing: "../landings/renegociation.html",
    title: "Renégociation de prêt",
    text: "Baisser le taux chez votre banque, ou comparer un rachat.",
  },
  {
    href: "../assurance-vtc/",
    landing: "../landings/vtc.html",
    title: "Assurance VTC",
    text: "RC pro chauffeur, Uber / Bolt / Heetch.",
  },
  {
    href: "../assurance-sante/",
    landing: "../landings/sante.html",
    title: "Mutuelle santé",
    text: "Comparatif optique, dentaire, hospitalisation.",
  },
  {
    href: "../assurance-habitation/",
    landing: "../landings/devis.html?need=habitation",
    title: "Assurance habitation",
    text: "Locataire, propriétaire, PNO.",
  },
  {
    href: "../recherche-bien/",
    landing: "../landings/acheteur-immo.html",
    title: "Immobilier",
    text: "Recherche de bien, vendeur, parcours vente + achat.",
  },
];

const GBP_POSTS = [
  {
    title: "Rachat de crédits à Varangéville",
    body:
      "Plusieurs crédits (auto, conso, immo) qui pèsent chaque mois ? On étudie un regroupement (RAC) pour une mensualité plus basse. Courtier ORIAS, 15 rue Pierre Curie, 54110 Varangéville. Étude gratuite.",
    cta: ORIGIN + "/landings/rachat.html",
  },
  {
    title: "Crédit immobilier — y compris après un refus",
    body:
      "Projet d’achat autour de Nancy / Varangéville ? Simulation de capacité et 2e chance multi-banques si un prêt a déjà été refusé. Wendy Buchet — Leads Opportunities, ORIAS 15005935.",
    cta: ORIGIN + "/landings/credit-immo.html",
  },
  {
    title: "Crédit conso : travaux, auto, trésorerie",
    body:
      "Un projet à financer sans tout casser le budget. On calibre montant et durée, et on dit si un rachat est plus malin qu’un 4e crédit. Devis gratuit.",
    cta: ORIGIN + "/landings/conso.html",
  },
  {
    title: "Prêt relais : vendre et racheter",
    body:
      "Vous vendez un bien et en visez un autre en Meurthe-et-Moselle. Le prêt relais fait le pont. Quotité, durée 12–24 mois, plan B si la vente tarde.",
    cta: ORIGIN + "/landings/pret-relais.html",
  },
  {
    title: "Mutuelle et assurances du quotidien",
    body:
      "Mutuelle santé, habitation, VTC, emprunteur : comparatif à garanties équivalentes, sans jargon. Rappel sous 15 min en journée.",
    cta: ORIGIN + "/landings/sante.html",
  },
  {
    title: "Horaires du cabinet",
    body:
      "Leads Opportunities — Wendy Buchet, courtier ORIAS. 15 rue Pierre Curie, 54110 Varangéville. Lun–Ven 9h–18h. Tél. 06 95 82 08 66. Site : étude en ligne 24h/24.",
    cta: ORIGIN + "/agence-varangeville/",
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var cards = SERVICES.map(function (s) {
  return (
    '      <a class="pilier-card" href="' +
    s.href +
    '">\n        <span class="pilier-card-body">\n          <strong>' +
    esc(s.title) +
    "</strong>\n          <p>" +
    esc(s.text) +
    '</p>\n          <span class="go">Guide →</span>\n        </span>\n      </a>'
  );
}).join("\n");

var postsHtml = GBP_POSTS.map(function (p, i) {
  return (
    "        <article class=\"gbp-post\">\n          <h3>" +
    (i + 1) +
    ". " +
    esc(p.title) +
    "</h3>\n          <pre>" +
    esc(p.body) +
    "</pre>\n          <p>Lien à coller : <code>" +
    esc(p.cta) +
    "</code></p>\n        </article>"
  );
}).join("\n");

var ld = JSON.stringify(localBusinessJsonLd());

var html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Courtier Varangéville (54) | Assurance, crédit, RAC — Leads Opportunities</title>
  <meta name="description" content="Courtier ORIAS à Varangéville près de Nancy : crédit immobilier, rachat de crédits, crédit conso, prêt relais, mutuelle. Wendy Buchet, 15 rue Pierre Curie, 06 95 82 08 66." />
  <meta name="keywords" content="courtier Varangéville, courtier Nancy, rachat de crédits 54, crédit immobilier Meurthe-et-Moselle, courtier assurance Varangéville, Wendy Buchet, Leads Opportunities" />
  <meta name="robots" content="index,follow" />
  <meta name="geo.region" content="FR-54" />
  <meta name="geo.placename" content="Varangéville" />
  <meta name="geo.position" content="${ORG.geo.latitude};${ORG.geo.longitude}" />
  <meta name="ICBM" content="${ORG.geo.latitude}, ${ORG.geo.longitude}" />
  <meta name="language" content="fr-FR" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="fr-FR" href="${url}" />
  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />
  <meta property="og:title" content="Courtier à Varangéville | Leads Opportunities — Wendy Buchet" />
  <meta property="og:description" content="Assurance, crédit immo, rachat de crédits, conso, prêt relais. Cabinet 15 rue Pierre Curie, 54110 Varangéville." />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ORIGIN}/og-default.svg" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JX8E35693F');
  </script>
  <link rel="stylesheet" href="../main.css" />
  <link rel="stylesheet" href="../css/piliers-hub.css" />
  <link rel="stylesheet" href="../css/clickable-affordance.css" />
  <style>
    .nap-card { background:#fff; border-radius:16px; padding:20px 24px; box-shadow:0 8px 30px rgba(15,23,42,.06); margin: 0 0 28px; }
    .nap-card p { margin: 6px 0; }
    .nap-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
    .gbp-box { background:#fffbeb; border:1px solid #f59e0b; border-radius:16px; padding:20px 24px; margin: 32px 0; }
    .gbp-post { margin: 16px 0; padding: 12px 0; border-top: 1px solid #fde68a; }
    .gbp-post pre { white-space: pre-wrap; font-family: inherit; background:#fff; padding:12px; border-radius:8px; }
    .gbp-post code { font-size: .85rem; word-break: break-all; }
  </style>
</head>
<body class="pilier-page pilier-page--finance" data-market-intent="FR">
  <header class="topbar">
    <div class="container nav">
      <a class="logo" href="../index.html">
        <span class="logo-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
        <span class="logo-text">
          <span class="logo-name">Leads Opportunities</span>
          <span class="logo-tagline">Wendy Buchet · Varangéville · ORIAS</span>
        </span>
      </a>
      <nav>
        <a href="../assurances/">Assurance</a>
        <a href="../credit-immo/">Prêt immo</a>
        <a href="../rachat-credit/">Rachat</a>
        <a href="../finance/">Finance</a>
        <a class="btn btn-nav" href="tel:${ORG.telephone}">Appeler</a>
      </nav>
    </div>
  </header>
  <header class="pilier-hero-media" aria-label="Agence Varangéville">
    <div class="pilier-hero-inner">
      <span class="section-badge">Cabinet · 54110</span>
      <h1>Courtier à Varangéville : assurance, crédit et rachat</h1>
      <p class="lead">Wendy Buchet — Leads Opportunities. Un interlocuteur ORIAS pour le Grand Nancy : crédit immobilier, RAC, conso, prêt relais, mutuelle et habitation.</p>
      <div class="pilier-actions">
        <a class="btn btn-primary btn-lg" href="tel:${ORG.telephone}">Appeler ${esc(ORG.telephoneDisplay)}</a>
        <a class="btn btn-outline btn-lg" href="../landings/rappel.html">Demander un rappel</a>
      </div>
    </div>
  </header>
  <main class="pilier-wrap">
    <div class="nap-card" itemscope itemtype="https://schema.org/LocalBusiness">
      <meta itemprop="name" content="Leads Opportunities" />
      <p><strong itemprop="alternateName">Wendy Buchet</strong> · Courtier ORIAS n° ${ORG.orias}</p>
      <p itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <span itemprop="streetAddress">${esc(ORG.address.streetAddress)}</span>,
        <span itemprop="postalCode">${ORG.address.postalCode}</span>
        <span itemprop="addressLocality">Varangéville</span>
        (${esc(ORG.address.addressRegion)})
      </p>
      <p>Téléphone : <a itemprop="telephone" href="tel:${ORG.telephone}">${esc(ORG.telephoneDisplay)}</a></p>
      <p>E-mail : <a href="mailto:${ORG.email}">${ORG.email}</a></p>
      <p>Horaires : <strong>${esc(ORG.openingHoursDisplay)}</strong> · Étude en ligne 24h/24</p>
      <p>Zone : Varangéville, Saint-Nicolas-de-Port, Dombasle, Nancy, Lunéville, Meurthe-et-Moselle — dossiers partout en France.</p>
      <div class="nap-actions">
        <a class="btn btn-primary" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent("15 rue Pierre Curie 54110 Varangéville")}" rel="noopener">Itinéraire Google Maps</a>
        <a class="btn btn-outline" href="../landings/rachat.html">Étude rachat</a>
        <a class="btn btn-outline" href="../landings/credit-immo.html">Crédit immo</a>
      </div>
    </div>

    <h2 class="pilier-section-title">Ce que vous pouvez faire étudier ici</h2>
    <p>La fiche Google ne doit plus dire « seulement courtier d’assurances ». Le métier, c’est aussi le <strong>financement</strong> — les mêmes parcours que sur le site national.</p>
    <section class="pilier-grid">
${cards}
    </section>

    <aside class="pilier-aside">
      <h2>Un clic depuis Google = un dossier</h2>
      <p>Cette page est l’URL du bouton <strong>Site web</strong> de la fiche établissement. Choisissez le besoin, on vous rappelle.</p>
      <a class="btn btn-lg" href="../landings/rappel.html">Rappel 15 min</a>
    </aside>

    <section>
      <h2>Pourquoi un cabinet à Varangéville</h2>
      <p>Le siège est à <strong>15 rue Pierre Curie, 54110 Varangéville</strong>, aux portes de Nancy. Les dossiers se montent à distance pour toute la France ; les rendez-vous locaux (Nancy, Saint-Nicolas-de-Port, Dombasle) restent possibles.</p>
      <p>Immatriculation ORIAS <strong>${ORG.orias}</strong>, SIREN ${ORG.siren}. Un seul interlocuteur : Wendy Buchet.</p>
    </section>

    <details class="gbp-box">
      <summary><strong>Textes à coller dans Google Business Profile</strong> (nom, catégories, services, publications)</summary>
      <p>À faire dans <a href="https://business.google.com/">business.google.com</a> — Google ne laisse pas le site modifier la fiche tout seul.</p>
      <h3>Nom de l’établissement</h3>
      <pre>Leads Opportunities - Wendy Buchet</pre>
      <p>Gardez « Wendy Buchet » en nom secondaire si Google refuse de retirer le nom perso. L’important : la <strong>marque du site</strong> apparaît.</p>
      <h3>Catégorie principale</h3>
      <pre>Courtier d'assurances</pre>
      <h3>Catégories supplémentaires (ajouter toutes celles proposées)</h3>
      <ul>
        <li>Courtier en crédit immobilier</li>
        <li>Courtier en prêts</li>
        <li>Conseiller financier</li>
        <li>Agence immobilière (si Google la propose — sinon ignorer)</li>
      </ul>
      <h3>Site web (bouton « Site Web »)</h3>
      <pre>${url}</pre>
      <h3>Téléphone / adresse / horaires</h3>
      <pre>${ORG.telephoneDisplay}
15 rue Pierre Curie
54110 Varangéville
Lundi–Vendredi 09:00–18:00</pre>
      <h3>Description (750 caractères max)</h3>
      <pre>Leads Opportunities, cabinet de courtage ORIAS n° 15005935 dirigé par Wendy Buchet à Varangéville (54), près de Nancy.

Assurances : mutuelle santé, habitation, VTC, emprunteur.
Financement : crédit immobilier (y compris après un refus), rachat / regroupement de crédits (RAC), crédit consommation, prêt relais, crédit professionnel, renégociation de prêt.

Étude gratuite, sans engagement. Rappel sous 15 min en journée. Dossiers partout en France, rendez-vous possibles en Meurthe-et-Moselle.

15 rue Pierre Curie, 54110 Varangéville — 06 95 82 08 66 — leadsopportunities.fr</pre>
      <h3>Services / produits à cocher sur la fiche</h3>
      <ul>
        ${OFFER_CATALOG.map(function (s) {
          return "<li>" + esc(s.name) + " — " + ORIGIN + s.url + "</li>";
        }).join("\n        ")}
      </ul>
      <h3>6 publications Google (1 par semaine, coller le texte + le lien)</h3>
${postsHtml}
      <p>Photos : façade, logo Leads Opportunities, portrait Wendy Buchet (<code>/assets/team/wendy-buchet.jpg</code>), bureau. Une photo neuve toutes les 2 semaines relance le classement local.</p>
    </details>
  </main>
  <footer class="footer">
    <div class="container footer-bottom" style="padding:20px 0">
      <small>&copy; 2026 Leads Opportunities — ORIAS n° ${ORG.orias} — ${esc(ORG.address.streetAddress)}, ${ORG.address.postalCode} Varangéville</small>
      <small><a href="../index.html">Accueil</a> · <a href="tel:${ORG.telephone}">${esc(ORG.telephoneDisplay)}</a> · <a href="../mentions-legales.html">Mentions légales</a></small>
    </div>
  </footer>
  <script type="application/ld+json">${ld}</script>
</body>
</html>
`;

var dir = path.join(ROOT, "agence-varangeville");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
console.log("wrote agence-varangeville/index.html");
