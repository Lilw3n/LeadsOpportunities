/**
 * Génère le forum SEO thématique (/forum/) — hub, thèmes, fils Q/R.
 * Usage: node scripts/generate-forum.cjs
 */
const fs = require("fs");
const path = require("path");
const clarityInlineHtml = require("./clarity-inline-html.cjs");
const { franceMetaBlock, logoBlock, brandIconsMeta, LOGO_BANNER_SRC } = require("./france-brand.cjs");
const { SITE_ORIGIN: BASE } = require("./site-url.cjs");
const { organizationJsonLd, AUTHOR, authorBlockHtml, breadcrumbListJsonLd, ORG } = require("./seo-org-schema.cjs");
const { footerSocialLinksHtml } = require("./social-links-lib.cjs");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "forum");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "forum-themes.json"), "utf8"));
const CLARITY = clarityInlineHtml();
const TODAY = new Date().toISOString().slice(0, 10);

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absUrl(p) {
  if (!p) return BASE + "/";
  if (String(p).indexOf("http") === 0) return p;
  return BASE + (p.charAt(0) === "/" ? p : "/" + p);
}

function ogImageFor(theme) {
  var src = (theme && theme.ogImage) || "/og/og-brand.jpg";
  return absUrl(src);
}

function shell(opts) {
  var title = opts.title;
  var description = opts.description;
  var canonical = opts.canonical;
  var ogImage = opts.ogImage || absUrl("/og/og-brand.jpg");
  var bodyClass = opts.bodyClass || "";
  var jsonLd = opts.jsonLd || [];
  var extraHead = opts.extraHead || "";
  var depth = opts.depth || 0;
  var prefix = depth === 0 ? "../" : depth === 1 ? "../../" : "../../../";

  var ldHtml = jsonLd
    .map(function (obj) {
      return '  <script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + "\n  </script>";
    })
    .join("\n");

  return (
    "<!doctype html>\n<html lang=\"fr\">\n<head>\n" +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
    "  <title>" +
    esc(title) +
    " | Leads Opportunities</title>\n" +
    '  <meta name="description" content="' +
    esc(description) +
    '" />\n' +
    '  <meta name="robots" content="index,follow,max-image-preview:large" />\n' +
    '  <link rel="canonical" href="' +
    esc(canonical) +
    '" />\n' +
    "  " +
    franceMetaBlock() +
    "\n" +
    "  " +
    brandIconsMeta() +
    "\n" +
    '  <meta property="og:type" content="article" />\n' +
    '  <meta property="og:site_name" content="Leads Opportunities" />\n' +
    '  <meta property="og:title" content="' +
    esc(title) +
    '" />\n' +
    '  <meta property="og:description" content="' +
    esc(description) +
    '" />\n' +
    '  <meta property="og:url" content="' +
    esc(canonical) +
    '" />\n' +
    '  <meta property="og:image" content="' +
    esc(ogImage) +
    '" />\n' +
    '  <meta property="og:image:width" content="1200" />\n' +
    '  <meta property="og:image:height" content="630" />\n' +
    '  <meta name="twitter:card" content="summary_large_image" />\n' +
    '  <meta name="twitter:title" content="' +
    esc(title) +
    '" />\n' +
    '  <meta name="twitter:description" content="' +
    esc(description) +
    '" />\n' +
    '  <meta name="twitter:image" content="' +
    esc(ogImage) +
    '" />\n' +
    '  <link rel="stylesheet" href="' +
    prefix +
    'main.css" />\n' +
    '  <link rel="stylesheet" href="' +
    (depth === 0 ? "./" : depth === 1 ? "../" : "../../") +
    'forum.css" />\n' +
    CLARITY +
    "\n" +
    extraHead +
    "\n" +
    ldHtml +
    "\n</head>\n<body class=\"forum-body " +
    esc(bodyClass) +
    '" data-market-intent="FR">\n' +
    headerNav(prefix, opts.activeTheme) +
    opts.body +
    footerBlock(prefix) +
    '  <script src="' +
    prefix +
    'js/attribution.js" defer></script>\n' +
    '  <script src="' +
    prefix +
    'js/forum-ask.js" defer></script>\n' +
    "</body>\n</html>\n"
  );
}

function headerNav(prefix, activeTheme) {
  var themes = DATA.themes
    .map(function (t) {
      var cur = activeTheme === t.slug ? ' aria-current="page"' : "";
      return (
        '<a href="' +
        prefix +
        "forum/" +
        t.slug +
        '/"' +
        cur +
        ">" +
        esc(t.navLabel) +
        "</a>"
      );
    })
    .join("\n        ");
  return (
    '  <header class="topbar forum-topbar">\n' +
    '    <div class="container nav">\n' +
    '      ' +
    logoBlock({
      href: prefix + "index.html",
      wrapClass: "logo",
      iconClass: "logo-icon",
      iconSize: 28,
      tagline: "Forum · Courtier ORIAS",
    }) +
    "\n" +
    "      <nav aria-label=\"Forum\">\n" +
    '        <a href="' +
    prefix +
    'forum/">Forum</a>\n' +
    "        " +
    themes +
    "\n" +
    '        <a class="btn btn-nav" href="mailto:' +
    esc(DATA.contactEmail) +
    '">Écrire</a>\n' +
    "      </nav>\n" +
    "    </div>\n" +
    "  </header>\n"
  );
}

function footerBlock(prefix) {
  return (
    '  <footer class="forum-footer">\n' +
    '    <div class="container">\n' +
    "      <p>Courtier ORIAS 15005935 · <a href=\"mailto:" +
    esc(DATA.contactEmail) +
    '">' +
    esc(DATA.contactEmail) +
    "</a> · <a href=\"tel:" +
    esc(DATA.phoneE164) +
    '">' +
    esc(DATA.phoneDisplay) +
    "</a></p>\n" +
    "      <p><a href=\"" +
    prefix +
    'blog/">Blog</a> · <a href="' +
    prefix +
    'landings/">Devis</a> · <a href="' +
    prefix +
    'nancy-54/">Nancy 54</a>' +
    (footerSocialLinksHtml({ separator: " · " })
      ? " · " + footerSocialLinksHtml({ separator: " · " })
      : "") +
    "</p>\n" +
    "    </div>\n" +
    "  </footer>\n"
  );
}

function breadcrumbNav(items) {
  return (
    '    <nav class="forum-bc" aria-label="Fil d\'Ariane">\n' +
    '      <ol class="forum-bc-list">\n' +
    items
      .map(function (it, i) {
        var last = i === items.length - 1;
        if (last) {
          return (
            '        <li><span aria-current="page">' + esc(it.name) + "</span></li>\n"
          );
        }
        return (
          "        <li><a href=\"" + esc(it.href) + '">' + esc(it.name) + "</a></li>\n"
        );
      })
      .join("") +
    "      </ol>\n" +
    "    </nav>\n"
  );
}

function askFormHtml(theme, opts) {
  opts = opts || {};
  var threadSlug = opts.threadSlug || "";
  return (
    '<section class="forum-ask" id="poser-question" data-forum-ask data-need="' +
    esc(theme.need) +
    '" data-theme="' +
    esc(theme.slug) +
    '" data-thread="' +
    esc(threadSlug) +
    '">\n' +
    "  <h2>Posez votre question ou demande</h2>\n" +
    "  <p>Publique côté SEO (thème « " +
    esc(theme.navLabel) +
    " ») — votre message arrive chez le courtier. Gratuit, sans engagement. Réponse à <strong>" +
    esc(DATA.contactEmail) +
    "</strong>.</p>\n" +
    '  <form class="forum-ask-form" novalidate>\n' +
    '    <label>Votre question / demande<textarea name="question" required rows="4" maxlength="2000" placeholder="Ex. Combien coûte une mutuelle famille à Nancy avec bons postes optique ?"></textarea></label>\n' +
    '    <div class="forum-ask-row">\n' +
    '      <label>Prénom<input type="text" name="first_name" required autocomplete="given-name" /></label>\n' +
    '      <label>E-mail<input type="email" name="email" required autocomplete="email" /></label>\n' +
    "    </div>\n" +
    '    <div class="forum-ask-row">\n' +
    '      <label>Téléphone<input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="06…" /></label>\n' +
    '      <label>Code postal<input type="text" name="postal_code" maxlength="5" inputmode="numeric" placeholder="54xxx" /></label>\n' +
    "    </div>\n" +
    '    <input type="text" name="_hp" class="forum-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />\n' +
    '    <button type="submit" class="btn btn-primary">Envoyer ma demande</button>\n' +
    '    <p class="forum-ask-alt">Ou écrivez directement : <a href="mailto:' +
    esc(DATA.contactEmail) +
    "?subject=" +
    encodeURIComponent(theme.navLabel || theme.title) +
    '">' +
    esc(DATA.contactEmail) +
    "</a></p>\n" +
    '    <p class="forum-ask-msg" data-forum-msg hidden></p>\n' +
    "  </form>\n" +
    "</section>\n"
  );
}

function shareBox(url, title) {
  var fb =
    "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
  var mail =
    "mailto:" +
    DATA.contactEmail +
    "?subject=" +
    encodeURIComponent(title) +
    "&body=" +
    encodeURIComponent("Lien : " + url);
  return (
    '<div class="forum-share" role="group" aria-label="Partager">\n' +
    "  <span>Partager (Facebook indexe aussi les liens) :</span>\n" +
    '  <a class="btn btn-outline btn-sm" href="' +
    esc(fb) +
    '" target="_blank" rel="noopener noreferrer">Facebook</a>\n' +
    '  <a class="btn btn-outline btn-sm" href="' +
    esc(mail) +
    '">E-mail courtier</a>\n' +
    '  <button type="button" class="btn btn-soft btn-sm" data-copy-link data-url="' +
    esc(url) +
    '">Copier le lien</button>\n' +
    "</div>\n"
  );
}

function phrasesList(phrases) {
  if (!phrases || !phrases.length) return "";
  return (
    '<aside class="forum-phrases">\n' +
    "  <h2>Formulations proches (SEO)</h2>\n" +
    "  <ul>\n" +
    phrases
      .map(function (p) {
        return "    <li>« " + esc(p) + " »</li>\n";
      })
      .join("") +
    "  </ul>\n" +
    "</aside>\n"
  );
}

function buildHub() {
  var canonical = BASE + "/forum/";
  var desc =
    "Forum assurance et crédit : mutuelle, VTC, crédit immo, habitation, Nancy 54. Posez une question, lisez les Q/R SEO, contactez contact@leadsopportunities.fr.";
  var cards = DATA.themes
    .map(function (t) {
      return (
        '      <a class="forum-theme-card" href="./' +
        esc(t.slug) +
        '/">\n' +
        "        <strong>" +
        esc(t.title) +
        "</strong>\n" +
        "        <span>" +
        esc(t.tagline) +
        "</span>\n" +
        "        <em>" +
        t.threads.length +
        " fils · poser une demande</em>\n" +
        "      </a>\n"
      );
    })
    .join("");

  var phraseCloud = (DATA.seoPhrases || [])
    .map(function (p) {
      return "<li>" + esc(p) + "</li>";
    })
    .join("");

  var body =
    '  <main class="forum-main container">\n' +
    '    <header class="forum-hero">\n' +
    "      <p class=\"forum-kicker\">Forum SEO · Google + Facebook</p>\n" +
    "      <h1>Questions, demandes &amp; Q/R assurance-crédit</h1>\n" +
    "      <p class=\"lead\">Les gens cherchent en phrases naturelles — « combien ça coûte vraiment », « est-ce que ça vaut le coup », « où trouver un courtier à Nancy ». Ce forum transforme ces tournures en pages indexables, partageables sur Facebook, avec contact direct <a href=\"mailto:" +
    esc(DATA.contactEmail) +
    '">' +
    esc(DATA.contactEmail) +
    "</a>.</p>\n" +
    "    </header>\n" +
    '    <section class="forum-theme-grid" aria-label="Thèmes">\n' +
    cards +
    "    </section>\n" +
    '    <section class="forum-cloud">\n' +
    "      <h2>Tournures qu’on vise (longue traîne)</h2>\n" +
    "      <ul>" +
    phraseCloud +
    "</ul>\n" +
    "      <p class=\"forum-fb-note\">Facebook agit comme un moteur : un lien avec bon titre + Open Graph se diffuse dans les groupes locaux (Nancy, VTC, immo). Chaque fil a un bouton <strong>Partager sur Facebook</strong>.</p>\n" +
    "    </section>\n" +
    "  </main>\n";

  var jsonLd = [
    organizationJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Forum Leads Opportunities",
      description: desc,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Leads Opportunities", url: BASE + "/" },
    },
  ];

  return shell({
    title: "Forum assurance & crédit — questions et demandes",
    description: desc,
    canonical: canonical,
    ogImage: absUrl(LOGO_BANNER_SRC || "/og/og-brand.jpg"),
    bodyClass: "forum-hub",
    depth: 0,
    jsonLd: jsonLd,
    body: body,
  });
}

function buildTheme(theme) {
  var canonical = BASE + "/forum/" + theme.slug + "/";
  var desc = theme.tagline + " " + (theme.keywords || []).slice(0, 4).join(", ") + ".";
  var threads = theme.threads
    .map(function (th) {
      return (
        '      <article class="forum-thread-card">\n' +
        "        <h2><a href=\"./" +
        esc(th.slug) +
        '.html">' +
        esc(th.question) +
        "</a></h2>\n" +
        "        <p>" +
        esc(th.excerpt) +
        "</p>\n" +
        '        <a class="forum-read" href="./' +
        esc(th.slug) +
        '.html">Lire la réponse à « ' +
        esc(th.question.slice(0, 48)) +
        (th.question.length > 48 ? "…" : "") +
        ' »</a>\n' +
        "      </article>\n"
      );
    })
    .join("");

  var crumbs = [
    { name: "Accueil", href: "../../index.html", item: BASE + "/" },
    { name: "Forum", href: "../", item: BASE + "/forum/" },
    { name: theme.navLabel, href: "./", item: canonical },
  ];

  var body =
    '  <main class="forum-main container">\n' +
    breadcrumbNav(crumbs) +
    '    <header class="forum-hero forum-hero--theme">\n' +
    "      <h1>" +
    esc(theme.title) +
    "</h1>\n" +
    "      <p class=\"lead\">" +
    esc(theme.intro) +
    "</p>\n" +
    '      <p class="forum-cta-row"><a class="btn btn-primary" href="#poser-question">Poser une question sur ' +
    esc(theme.navLabel) +
    '</a> <a class="btn btn-outline" href="' +
    esc(theme.landing) +
    '">Parcours devis ' +
    esc(theme.navLabel) +
    '</a> <a class="btn btn-soft" href="mailto:' +
    esc(DATA.contactEmail) +
    "?subject=" +
    encodeURIComponent(theme.title) +
    '">' +
    esc(DATA.contactEmail) +
    "</a></p>\n" +
    "    </header>\n" +
    '    <section class="forum-thread-list" aria-label="Fils de discussion">\n' +
    threads +
    "    </section>\n" +
    authorBlockHtml() +
    askFormHtml(theme) +
    shareBox(canonical, theme.title) +
    "  </main>\n";

  var itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: theme.title,
    itemListElement: theme.threads.map(function (th, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        url: BASE + "/forum/" + theme.slug + "/" + th.slug + ".html",
        name: th.question,
      };
    }),
  };

  return shell({
    title: theme.title + " — questions et réponses",
    description: desc,
    canonical: canonical,
    ogImage: ogImageFor(theme),
    bodyClass: "forum-theme",
    depth: 1,
    activeTheme: theme.slug,
    jsonLd: [organizationJsonLd(), breadcrumbListJsonLd(crumbs), itemList],
    body: body,
  });
}

function buildThread(theme, thread) {
  var canonical = BASE + "/forum/" + theme.slug + "/" + thread.slug + ".html";
  var answerUrl = canonical + "#acceptedAnswer";
  var desc = thread.excerpt + " Réponse courtier ORIAS Wendy Buchet · " + DATA.contactEmail;
  var fbHook = (DATA.facebookHooks && DATA.facebookHooks[0]) || "";

  var crumbs = [
    { name: "Accueil", href: "../../index.html", item: BASE + "/" },
    { name: "Forum", href: "../", item: BASE + "/forum/" },
    { name: theme.navLabel, href: "./", item: BASE + "/forum/" + theme.slug + "/" },
    { name: thread.question.slice(0, 60), href: "./" + thread.slug + ".html", item: canonical },
  ];

  var body =
    '  <main class="forum-main container forum-thread-page">\n' +
    breadcrumbNav(crumbs) +
    "    <article>\n" +
    '      <header class="forum-hero forum-hero--thread">\n' +
    "        <p class=\"forum-kicker\">Question · " +
    esc(theme.navLabel) +
    "</p>\n" +
    "        <h1>" +
    esc(thread.question) +
    "</h1>\n" +
    "        <p class=\"lead\">" +
    esc(thread.excerpt) +
    "</p>\n" +
    '        <p class="forum-date"><time datetime="' +
    TODAY +
    '">Mis à jour le ' +
    TODAY +
    "</time></p>\n" +
    "      </header>\n" +
    '      <div class="forum-answer" id="acceptedAnswer">\n' +
    "        <h2>Réponse du courtier</h2>\n" +
    "        <p>" +
    esc(thread.answer) +
    "</p>\n" +
    "        <p class=\"forum-fb-hook\">" +
    esc(fbHook) +
    "</p>\n" +
    "      </div>\n" +
    phrasesList(thread.phrases) +
    authorBlockHtml() +
    shareBox(canonical, thread.question) +
    '      <p class="forum-cta-row"><a class="btn btn-primary" href="' +
    esc(theme.questionnaire) +
    (theme.questionnaire.indexOf("?") >= 0 ? "&" : "?") +
    "utm_source=forum&utm_medium=thread&utm_campaign=" +
    esc(theme.slug) +
    '">Questionnaire ' +
    esc(theme.navLabel) +
    ' (3 min)</a> <a class="btn btn-outline" href="mailto:' +
    esc(DATA.contactEmail) +
    "?subject=" +
    encodeURIComponent(thread.question.slice(0, 80)) +
    '">Écrire à ' +
    esc(DATA.contactEmail) +
    "</a></p>\n" +
    "    </article>\n" +
    askFormHtml(theme, { threadSlug: thread.slug }) +
    "  </main>\n";

  var qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: thread.question,
      text: thread.excerpt || thread.question,
      answerCount: 1,
      upvoteCount: 1,
      dateCreated: TODAY,
      author: AUTHOR,
      acceptedAnswer: {
        "@type": "Answer",
        text: thread.answer,
        upvoteCount: 1,
        url: answerUrl,
        dateCreated: TODAY,
        author: AUTHOR,
      },
    },
  };

  var webPageDiscussion = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: thread.question,
    url: canonical,
    datePublished: TODAY,
    dateModified: TODAY,
    author: AUTHOR,
    mainEntity: {
      "@type": "DiscussionForumPosting",
      headline: thread.question,
      text: thread.answer,
      url: canonical,
      datePublished: TODAY,
      author: AUTHOR,
      sharedContent: {
        "@type": "WebPage",
        url: BASE + "/forum/" + theme.slug + "/",
        name: theme.title,
      },
    },
  };

  return shell({
    title: thread.question,
    description: desc,
    canonical: canonical,
    ogImage: ogImageFor(theme),
    bodyClass: "forum-thread",
    depth: 1,
    activeTheme: theme.slug,
    jsonLd: [qaPage, webPageDiscussion, breadcrumbListJsonLd(crumbs), organizationJsonLd()],
    body: body,
  });
}

function writeFile(rel, content) {
  var full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

function getForumSitemapEntries(base) {
  var today = new Date().toISOString().slice(0, 10);
  var b = base || BASE;
  var urls = [{ loc: b + "/forum/", priority: "0.92", changefreq: "daily", lastmod: today }];
  DATA.themes.forEach(function (t) {
    urls.push({
      loc: b + "/forum/" + t.slug + "/",
      priority: "0.88",
      changefreq: "weekly",
      lastmod: today,
    });
    t.threads.forEach(function (th) {
      urls.push({
        loc: b + "/forum/" + t.slug + "/" + th.slug + ".html",
        priority: "0.8",
        changefreq: "monthly",
        lastmod: today,
      });
    });
  });
  return urls;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  // CSS copied/written once
  var cssSrc = path.join(ROOT, "forum", "forum.css");
  if (!fs.existsSync(cssSrc)) {
    /* written separately */
  }

  writeFile("index.html", buildHub());
  var n = 1;
  DATA.themes.forEach(function (theme) {
    writeFile(theme.slug + "/index.html", buildTheme(theme));
    n += 1;
    theme.threads.forEach(function (th) {
      writeFile(theme.slug + "/" + th.slug + ".html", buildThread(theme, th));
      n += 1;
    });
  });
  console.log("forum:build —", n, "pages ·", DATA.themes.length, "thèmes");
}

module.exports = {
  getForumSitemapEntries: getForumSitemapEntries,
  DATA: DATA,
};

if (require.main === module) {
  main();
}
