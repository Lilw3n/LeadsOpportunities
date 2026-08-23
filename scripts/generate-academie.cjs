/**
 * Génère l'Académie Leads Opportunities (hub + cours + leçons).
 * Source : data/academie-curriculum.json
 * Usage : npm run academie:build
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data/academie-curriculum.json"), "utf8"));
const SITE = "https://www.leadsopportunities.fr";
const GSC = "I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Chemin site (/foo) → relatif depuis academie/… (depth 1 ou 2) */
function relFrom(sitePath, depth) {
  var p = String(sitePath || "/");
  if (/^https?:\/\//i.test(p)) return p;
  p = p.replace(/^\//, "");
  var prefix = depth <= 1 ? "../" : "../../";
  return prefix + p;
}

function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
  console.log("  wrote", rel);
}

function head(opts) {
  const depth = opts.depth || 1;
  const prefix = depth === 0 ? "./" : depth === 1 ? "../" : "../../";
  const cssPrefix = depth === 0 ? "./" : depth === 1 ? "../" : "../../";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.description)}" />
  <meta name="robots" content="index,follow" />
  <meta name="geo.region" content="FR" />
  <meta name="language" content="fr-FR" />
  <meta http-equiv="content-language" content="fr" />
  <meta property="og:locale" content="fr_FR" />
  <link rel="canonical" href="${esc(opts.canonical)}" />
  <link rel="alternate" hreflang="fr-FR" href="${esc(opts.canonical)}" />
  <meta name="google-site-verification" content="${GSC}" />
  <meta property="og:title" content="${esc(opts.title)}" />
  <meta property="og:description" content="${esc(opts.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(opts.canonical)}" />
  <meta property="og:image" content="${SITE}/og-default.svg" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JX8E35693F');</script>
  <link rel="stylesheet" href="${cssPrefix}main.css" />
  <link rel="stylesheet" href="${cssPrefix}css/piliers-hub.css" />
  <link rel="stylesheet" href="${cssPrefix}css/academie.css" />
  <link rel="stylesheet" href="${cssPrefix}css/clickable-affordance.css" />
</head>
<body class="pilier-page pilier-page--${esc(opts.pilier || "assurance")} academie-page" data-market-intent="FR">
  <header class="topbar">
    <div class="container nav">
      <a class="logo" href="${prefix}index.html">
        <span class="logo-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
        <span class="logo-text">
          <span class="logo-name">Leads Opportunities</span>
          <span class="logo-tagline">Académie · Courtier ORIAS</span>
        </span>
      </a>
      <nav>
        <a href="${prefix}academie/"${opts.nav === "hub" ? ' aria-current="page"' : ""}>Académie</a>
        <a href="${prefix}assurances/">Assurance</a>
        <a href="${prefix}credit-immo/">Prêt</a>
        <a href="${prefix}immobilier/">Immo</a>
        <a class="btn btn-nav" href="${prefix}landings/rappel.html">Rappel</a>
      </nav>
    </div>
  </header>`;
}

function foot(ldJson) {
  return `
  <footer class="footer">
    <div class="container footer-bottom" style="padding:20px 0">
      <small>&copy; 2026 Leads Opportunities · Académie gratuite · ORIAS 15005935 · <a href="/agence-varangeville/">Cabinet Varangéville</a></small>
    </div>
  </footer>
  ${ldJson ? `<script type="application/ld+json">${JSON.stringify(ldJson)}</script>` : ""}
</body>
</html>`;
}

function renderHub() {
  const h = DATA.hub;
  const cards = DATA.courses
    .map(function (c) {
      return `<a class="academie-course-card" href="./${esc(c.slug)}/">
        <strong>${esc(c.title)}</strong>
        <p>${esc(c.subtitle)}</p>
        <span class="aca-go">${esc(c.lessons.length)} leçons · ${esc(c.duration)} →</span>
      </a>`;
    })
    .join("\n      ");

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h.h1,
    description: h.description,
    url: SITE + "/academie/",
    isPartOf: { "@type": "WebSite", name: "Leads Opportunities", url: SITE + "/" },
    about: DATA.courses.map(function (c) {
      return { "@type": "Course", name: c.title, description: c.description, url: SITE + "/academie/" + c.slug + "/" };
    }),
  };

  const html =
    head({
      title: h.title,
      description: h.description,
      canonical: SITE + "/academie/",
      pilier: "assurance",
      depth: 1,
      nav: "hub",
    }) +
    `
  <header class="pilier-hero-media" aria-label="Académie">
    <div class="pilier-hero-inner">
      <span class="section-badge">Formation gratuite</span>
      <h1>${esc(h.h1)}</h1>
      <p class="lead">${esc(h.lead)}</p>
      <div class="pilier-actions">
        <a class="btn btn-primary btn-lg" href="./assurance/">Cours Assurance (courtier)</a>
        <a class="btn btn-outline btn-lg" href="./conformite/">Conformité ORIAS / IOBSP</a>
        <a class="btn btn-outline btn-lg" href="../landings/rappel.html">Parler à un conseiller</a>
      </div>
    </div>
  </header>
  <main class="pilier-wrap">
    <p class="academie-kicker">Six parcours · volume formation longue</p>
    <h2 class="pilier-section-title">Choisissez votre cours</h2>
    <p>Chaque leçon dure 25 à 45&nbsp;min (cas pratiques et ateliers inclus). Volume total affiché par parcours : <strong>environ 90&nbsp;heures</strong> cumulées — niveau cabinet de courtage / IOBSP.</p>
    <div class="academie-grid">
      ${cards}
    </div>
    <div class="academie-cta-band">
      <h2>Besoin d’un conseil personnalisé ?</h2>
      <p>L’Académie explique. Le courtier ORIAS compare et rappelle — sans engagement.</p>
      <a class="btn btn-primary" href="../landings/devis.html">Devis gratuit</a>
      <a class="btn btn-outline" href="../methode.html" style="margin-left:8px">Notre méthode</a>
    </div>
  </main>
` +
    foot(ld);

  write("academie/index.html", html);
}

function renderCourse(course) {
  const base = SITE + "/academie/" + course.slug + "/";
  const lessons = course.lessons
    .map(function (l) {
      return `<li>
        <a href="./${esc(l.slug)}.html">
          <span class="academie-lesson-num" aria-hidden="true"></span>
          <span>
            <strong>${esc(l.title)}</strong>
            <p style="margin:0.35rem 0 0;color:#64748b;font-size:0.95rem">${esc(l.summary)}</p>
          </span>
          <span class="dur">${esc(l.duration)}</span>
        </a>
      </li>`;
    })
    .join("\n      ");

  const objs = (course.objectives || [])
    .map(function (o) {
      return `<li>${esc(o)}</li>`;
    })
    .join("");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: base,
    provider: {
      "@type": "InsuranceAgency",
      name: "Leads Opportunities",
      url: SITE + "/",
    },
    educationalLevel: course.level,
    timeRequired: "PT" + (parseInt(course.duration, 10) || 40) + "M",
    inLanguage: "fr",
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration,
    },
  };

  const html =
    head({
      title: course.title + " | Académie Leads Opportunities",
      description: course.description,
      canonical: base,
      pilier: course.pilier,
      depth: 2,
    }) +
    `
  <header class="pilier-hero-media" aria-label="${esc(course.title)}">
    <div class="pilier-hero-inner">
      <p class="academie-breadcrumb"><a href="../">Académie</a> · ${esc(course.label)}</p>
      <span class="section-badge">${esc(course.label)}</span>
      <h1>${esc(course.title)}</h1>
      <p class="lead">${esc(course.subtitle)}</p>
      <ul class="academie-meta">
        <li>${esc(course.lessons.length)} leçons</li>
        <li>${esc(course.duration)}</li>
        <li>${esc(course.level)}</li>
      </ul>
      <div class="pilier-actions">
        <a class="btn btn-primary btn-lg" href="./${esc(course.lessons[0].slug)}.html">Démarrer la leçon 1</a>
        <a class="btn btn-outline btn-lg" href="${esc(relFrom(course.hubHref, 2))}">Hub métier</a>
      </div>
    </div>
  </header>
  <main class="pilier-wrap">
    <div class="academie-objectives">
      <h2>Objectifs du cours</h2>
      <ul>${objs}</ul>
    </div>
    <h2 class="pilier-section-title">Programme</h2>
    <ol class="academie-lesson-list">
      ${lessons}
    </ol>
    <div class="academie-cta-band">
      <h2>Prêt à passer à l’action ?</h2>
      <p>Quand les notions sont claires, on compare pour votre dossier.</p>
      <a class="btn btn-primary" href="${esc(relFrom(course.cta.href, 2))}">${esc(course.cta.label)}</a>
    </div>
  </main>
` +
    foot(ld);

  write("academie/" + course.slug + "/index.html", html);
}

function renderLesson(course, lesson, index) {
  const base = SITE + "/academie/" + course.slug + "/" + lesson.slug + ".html";
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const sections = (lesson.sections || [])
    .map(function (s) {
      return `<h2>${esc(s.h)}</h2>\n      <p>${esc(s.p)}</p>`;
    })
    .join("\n      ");

  const nav =
    `<div class="academie-nav-lessons">` +
    (prev
      ? `<a href="./${esc(prev.slug)}.html">← ${esc(prev.title)}</a>`
      : `<a href="./">← Programme ${esc(course.label)}</a>`) +
    (next
      ? `<a href="./${esc(next.slug)}.html">${esc(next.title)} →</a>`
      : `<a href="${esc(relFrom(course.cta.href, 2))}">${esc(course.cta.label)} →</a>`) +
    `</div>`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.summary,
    url: base,
    isPartOf: { "@type": "Course", name: course.title, url: SITE + "/academie/" + course.slug + "/" },
    learningResourceType: "Lesson",
    timeRequired: "PT" + (parseInt(lesson.duration, 10) || 8) + "M",
    inLanguage: "fr",
    isAccessibleForFree: true,
    provider: { "@type": "InsuranceAgency", name: "Leads Opportunities", url: SITE + "/" },
  };

  const cta = lesson.cta || course.cta;

  const html =
    head({
      title: lesson.title + " | " + course.title + " — Académie",
      description: lesson.summary + " " + course.title + ". Courtier ORIAS Leads Opportunities.",
      canonical: base,
      pilier: course.pilier,
      depth: 2,
    }) +
    `
  <main class="pilier-wrap" style="padding-top:2rem">
    <p class="academie-breadcrumb">
      <a href="../">Académie</a> ·
      <a href="./">${esc(course.label)}</a> ·
      Leçon ${index + 1}/${course.lessons.length}
    </p>
    <span class="academie-kicker">${esc(lesson.duration)}</span>
    <h1>${esc(lesson.title)}</h1>
    <p class="lead" style="max-width:40rem">${esc(lesson.summary)}</p>
    <article class="academie-lesson-body">
      ${sections}
    </article>
    <div class="academie-cta-band">
      <h2>Étape suivante</h2>
      <p>Appliquez tout de suite ou continuez le programme.</p>
      <a class="btn btn-primary" href="${esc(relFrom(cta.href, 2))}">${esc(cta.label)}</a>
      ${next ? `<a class="btn btn-outline" href="./${esc(next.slug)}.html" style="margin-left:8px">Leçon suivante</a>` : ""}
    </div>
    ${nav}
  </main>
` +
    foot(ld);

  write("academie/" + course.slug + "/" + lesson.slug + ".html", html);
}

console.log("Académie — génération…");
renderHub();
DATA.courses.forEach(function (course) {
  renderCourse(course);
  course.lessons.forEach(function (lesson, i) {
    renderLesson(course, lesson, i);
  });
});
console.log("OK —", 1 + DATA.courses.length + DATA.courses.reduce(function (n, c) {
  return n + c.lessons.length;
}, 0), "pages");
