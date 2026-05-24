/**
 * Genere les pages SEO silo (assurance-vtc, assurance-sante, credit-immo).
 * Usage: node scripts/generate-seo-pages.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://leads-opportunities.vercel.app";

const PAGES = [
  {
    file: "assurance-vtc/index.html",
    title: "Assurance VTC | Devis et comparatif chauffeur",
    description:
      "Assurance VTC pour chauffeurs actifs et creation d activite : devis rapide, garanties expliquees, accompagnement courtier ORIAS.",
    h1: "Assurance VTC : couverture adaptee aux chauffeurs",
    intro:
      "Comparez les offres assurance VTC selon votre statut, votre zone d activite et votre budget. Un conseiller vous aide a choisir les garanties utiles sans surpayer.",
    cta: { href: "/landings/vtc.html", label: "Obtenir un devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis assurance VTC rapide" },
      { href: "/assurance-vtc/tarif/", label: "Tarif assurance VTC" },
      { href: "/assurance-vtc/paris/", label: "Assurance VTC Paris" },
      { href: "/blog/assurance-vtc-moins-cher-2026.html", label: "Comment payer moins cher" },
    ],
    faq: [
      {
        q: "Quelle assurance est obligatoire pour un chauffeur VTC ?",
        a: "La responsabilite civile professionnelle et une assurance vehicule adaptee a l activite VTC sont indispensables avant de prendre des courses.",
      },
      {
        q: "Combien de temps pour obtenir un devis ?",
        a: "En moyenne sous 15 minutes en heures ouvrables apres envoi du formulaire.",
      },
    ],
  },
  {
    file: "assurance-vtc/devis-rapide/index.html",
    title: "Devis assurance VTC rapide | Reponse sous 15 min",
    description:
      "Demandez un devis assurance VTC en ligne. Formulaire court, rappel rapide, sans engagement.",
    h1: "Devis assurance VTC rapide",
    intro:
      "Renseignez votre profil chauffeur en quelques clics. Nous comparons les offres et vous rappelez avec une proposition claire.",
    cta: { href: "/landings/vtc.html", label: "Lancer mon devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Devis rapide", url: "/assurance-vtc/devis-rapide/" },
    ],
    related: [
      { href: "/assurance-vtc/tarif/", label: "Tarifs VTC" },
      { href: "/assurance-vtc/paris/", label: "VTC a Paris" },
    ],
    faq: [
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui, le devis et l accompagnement initial sont sans frais et sans engagement.",
      },
    ],
  },
  {
    file: "assurance-vtc/tarif/index.html",
    title: "Tarif assurance VTC | Comparez les prix",
    description:
      "Comprendre le tarif assurance VTC : garanties, franchises, bonus et leviers pour optimiser votre budget.",
    h1: "Tarif assurance VTC : ce qui fait varier le prix",
    intro:
      "Le tarif depend du vehicule, de l experience, des sinistres et du niveau de garanties. Nous vous aidons a comparer a garanties equivalentes.",
    cta: { href: "/landings/vtc.html", label: "Comparer mon tarif VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Tarif", url: "/assurance-vtc/tarif/" },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis rapide" },
      { href: "/blog/assurance-vtc-moins-cher-2026.html", label: "Article : payer moins cher" },
    ],
    faq: [],
  },
  {
    file: "assurance-vtc/paris/index.html",
    title: "Assurance VTC Paris | Devis local",
    description:
      "Assurance VTC a Paris et Ile-de-France : devis, garanties et accompagnement pour chauffeurs VTC.",
    h1: "Assurance VTC a Paris",
    intro:
      "Service dedie aux chauffeurs VTC en region parisienne : reponse rapide, garanties expliquees, suivi personnalise.",
    cta: { href: "/landings/vtc.html", label: "Devis VTC Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: "/assurance-vtc/" },
      { name: "Paris", url: "/assurance-vtc/paris/" },
    ],
    related: [
      { href: "/assurance-vtc/devis-rapide/", label: "Devis rapide" },
      { href: "/local/pages-locales-template.md", label: "Guide pages locales" },
    ],
    faq: [],
  },
  {
    file: "assurance-sante/index.html",
    title: "Assurance sante et mutuelle | Comparatif",
    description:
      "Mutuelle sante pour solo, couple et famille. Comparatif des garanties, devis gratuit, courtier ORIAS.",
    h1: "Assurance sante : choisir la bonne mutuelle",
    intro:
      "Optique, dentaire, hospitalisation : nous comparons les offres selon vos priorites budget ou remboursements.",
    cta: { href: "/landings/sante.html", label: "Comparer les mutuelles" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
    ],
    related: [
      { href: "/assurance-sante/comparatif/", label: "Comparatif mutuelle" },
      { href: "/assurance-sante/paris/", label: "Mutuelle Paris" },
      { href: "/blog/mutuelle-sante-5-criteres.html", label: "5 criteres de choix" },
    ],
    faq: [
      {
        q: "Comment comparer deux mutuelles ?",
        a: "A garanties equivalentes, comparez optique, dentaire, hospitalisation et le ticket moderateur restant.",
      },
    ],
  },
  {
    file: "assurance-sante/comparatif/index.html",
    title: "Comparatif mutuelle sante | Devis gratuit",
    description:
      "Comparatif mutuelle sante en ligne : profil solo, couple ou famille. Conseiller dedie, sans engagement.",
    h1: "Comparatif mutuelle sante",
    intro:
      "Recevez une synthese claire des garanties et tarifs adaptes a votre profil.",
    cta: { href: "/landings/sante.html", label: "Lancer le comparatif" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Comparatif", url: "/assurance-sante/comparatif/" },
    ],
    related: [
      { href: "/assurance-sante/remboursement-optique/", label: "Remboursement optique" },
      { href: "/assurance-sante/paris/", label: "Mutuelle Paris" },
    ],
    faq: [],
  },
  {
    file: "assurance-sante/remboursement-optique/index.html",
    title: "Remboursement optique mutuelle | Guide",
    description:
      "Comprendre le remboursement optique de votre mutuelle : plafonds, reseaux et astuces pour mieux couvrir vos lunettes.",
    h1: "Remboursement optique : bien lire votre mutuelle",
    intro:
      "Les ecarts entre contrats sont importants. Nous vous aidons a identifier les postes qui comptent pour votre foyer.",
    cta: { href: "/landings/sante.html", label: "Etude mutuelle personnalisee" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Optique", url: "/assurance-sante/remboursement-optique/" },
    ],
    related: [
      { href: "/assurance-sante/comparatif/", label: "Comparatif mutuelle" },
      { href: "/blog/mutuelle-sante-5-criteres.html", label: "Article 5 criteres" },
    ],
    faq: [],
  },
  {
    file: "assurance-sante/paris/index.html",
    title: "Mutuelle sante Paris | Devis local",
    description:
      "Mutuelle sante a Paris : comparatif, devis et accompagnement pour particuliers et independants.",
    h1: "Mutuelle sante a Paris",
    intro:
      "Un conseiller vous accompagne pour choisir une couverture adaptee a votre situation en region parisienne.",
    cta: { href: "/landings/sante.html", label: "Devis mutuelle Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance sante", url: "/assurance-sante/" },
      { name: "Paris", url: "/assurance-sante/paris/" },
    ],
    related: [{ href: "/assurance-sante/comparatif/", label: "Comparatif" }],
    faq: [],
  },
  {
    file: "credit-immo/index.html",
    title: "Credit immobilier | Simulation et courtier",
    description:
      "Credit immobilier : simulation, faisabilite, accompagnement courtier. Devis gratuit et sans engagement.",
    h1: "Credit immobilier : financer votre projet",
    intro:
      "Nous analysons votre capacite d emprunt, les taux et les assurances associees pour securiser votre plan de financement.",
    cta: { href: "/landings/credit-immo.html", label: "Simulation credit immo" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
    ],
    related: [
      { href: "/credit-immo/simulation/", label: "Simulation" },
      { href: "/credit-immo/paris/", label: "Credit immo Paris" },
      { href: "/blog/pret-immo-erreurs-a-eviter.html", label: "Erreurs a eviter" },
    ],
    faq: [
      {
        q: "Puis-je faire une simulation sans engagement ?",
        a: "Oui, la premiere analyse est gratuite et sans obligation de souscrire.",
      },
    ],
  },
  {
    file: "credit-immo/simulation/index.html",
    title: "Simulation credit immobilier | Gratuit",
    description:
      "Simulation credit immobilier en ligne : mensualite, duree, apport. Reponse rapide d un conseiller.",
    h1: "Simulation credit immobilier",
    intro:
      "Estimez votre capacite d emprunt et preparez votre dossier avec un accompagnement humain.",
    cta: { href: "/landings/credit-immo.html", label: "Demarrer la simulation" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
      { name: "Simulation", url: "/credit-immo/simulation/" },
    ],
    related: [
      { href: "/credit-immo/paris/", label: "Paris" },
      { href: "/blog/pret-immo-erreurs-a-eviter.html", label: "Guide erreurs pret" },
    ],
    faq: [],
  },
  {
    file: "credit-immo/paris/index.html",
    title: "Credit immobilier Paris | Courtier local",
    description:
      "Courtier credit immobilier a Paris : simulation, montage de dossier et negociation des conditions.",
    h1: "Credit immobilier a Paris",
    intro:
      "Accompagnement dedie pour les projets d achat ou de renegociation en region parisienne.",
    cta: { href: "/landings/credit-immo.html", label: "Etude credit Paris" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Credit immobilier", url: "/credit-immo/" },
      { name: "Paris", url: "/credit-immo/paris/" },
    ],
    related: [{ href: "/credit-immo/simulation/", label: "Simulation" }],
    faq: [],
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function depthPrefix(file) {
  const parts = file.split("/").length - 1;
  return parts ? "../".repeat(parts) : "./";
}

function renderPage(p) {
  const prefix = depthPrefix(p.file);
  const canonical = BASE + "/" + p.file.replace(/index\.html$/, "");
  const crumbs = p.crumbs || [];
  const related = p.related || [];
  const faq = p.faq || [];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(function (c, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: BASE + c.url,
      };
    }),
  };

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map(function (f) {
            return {
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            };
          }),
        }
      : null;

  const faqHtml = faq
    .map(function (f) {
      return (
        "<details class=\"seo-faq\"><summary>" +
        esc(f.q) +
        "</summary><p>" +
        esc(f.a) +
        "</p></details>"
      );
    })
    .join("");

  const relatedHtml = related
    .map(function (l) {
      return '<li><a href="' + esc(l.href) + '">' + esc(l.label) + "</a></li>";
    })
    .join("");

  const crumbsHtml = crumbs
    .map(function (c, i) {
      if (i === crumbs.length - 1) return "<span>" + esc(c.name) + "</span>";
      return '<a href="' + esc(c.url) + '">' + esc(c.name) + "</a>";
    })
    .join(' <span aria-hidden="true">/</span> ');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  <link rel="stylesheet" href="${prefix}seo/seo-pages.css" />
  <link rel="stylesheet" href="${prefix}main.css" />
</head>
<body class="seo-page">
  <header class="seo-topbar">
    <div class="seo-container">
      <a href="${prefix}index.html" class="seo-logo">Leads Opportunities</a>
      <nav class="seo-nav">
        <a href="${prefix}assurance-vtc/">VTC</a>
        <a href="${prefix}assurance-sante/">Sante</a>
        <a href="${prefix}credit-immo/">Credit immo</a>
        <a class="seo-cta" href="${prefix}${p.cta.href.replace(/^\//, "")}">${esc(p.cta.label)}</a>
      </nav>
    </div>
  </header>
  <main class="seo-container">
    <nav class="seo-breadcrumb" aria-label="Fil d Ariane">${crumbsHtml}</nav>
    <article class="seo-article">
      <h1>${esc(p.h1)}</h1>
      <p class="seo-intro">${esc(p.intro)}</p>
      <p><a class="btn btn-primary" href="${prefix}${p.cta.href.replace(/^\//, "")}">${esc(p.cta.label)}</a></p>
      ${faqHtml ? "<section class=\"seo-faq-block\"><h2>Questions frequentes</h2>" + faqHtml + "</section>" : ""}
      ${relatedHtml ? "<section><h2>Pages utiles</h2><ul class=\"seo-related\">" + relatedHtml + "</ul></section>" : ""}
    </article>
  </main>
  <footer class="seo-footer">
    <div class="seo-container">
      <small><a href="${prefix}mentions-legales.html">Mentions legales</a> · <a href="${prefix}politique-confidentialite.html">Confidentialite</a></small>
    </div>
  </footer>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
  ${faqLd ? '<script type="application/ld+json">' + JSON.stringify(faqLd) + "</script>" : ""}
</body>
</html>`;
}

const sitemapUrls = [];

PAGES.forEach(function (p) {
  const out = path.join(ROOT, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, renderPage(p), "utf8");
  const loc = BASE + "/" + p.file.replace(/index\.html$/, "");
  sitemapUrls.push(loc);
  console.log("OK", p.file);
});

const sitemapFragment = sitemapUrls
  .map(function (loc) {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-05-24</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>`;
  })
  .join("\n");

fs.writeFileSync(
  path.join(ROOT, "seo", "generated-sitemap-fragment.xml"),
  sitemapFragment,
  "utf8"
);
console.log("Fragment sitemap:", sitemapUrls.length, "URLs");
