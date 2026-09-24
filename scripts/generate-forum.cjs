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
  var hubMode = !!opts.hubMode;
  var themeSelect = "";
  if (hubMode) {
    themeSelect =
      '    <label>Thème<select name="forum_theme_select" required>\n' +
      '      <option value="">Choisir un thème…</option>\n' +
      DATA.themes
        .map(function (t) {
          return (
            '      <option value="' +
            esc(t.slug) +
            '" data-need="' +
            esc(t.need) +
            '">' +
            esc(t.navLabel) +
            " — " +
            esc(t.title) +
            "</option>\n"
          );
        })
        .join("") +
      "    </select></label>\n";
  }
  var need = theme ? theme.need : "sante";
  var themeSlug = theme ? theme.slug : "";
  var themeLabel = theme ? theme.navLabel : "assurance & crédit";
  return (
    '<section class="forum-ask" id="poser-question" data-forum-ask data-need="' +
    esc(need) +
    '" data-theme="' +
    esc(themeSlug) +
    '" data-thread="' +
    esc(threadSlug) +
    '"' +
    (hubMode ? ' data-hub-ask="1"' : "") +
    ">\n" +
    "  <h2>Posez votre question</h2>\n" +
    "  <p>Une vraie question, une réponse de courtier ORIAS. Gratuit, sans engagement — message reçu à <strong>" +
    esc(DATA.contactEmail) +
    "</strong>" +
    (hubMode ? "" : " (thème « " + esc(themeLabel) + " »)") +
    ".</p>\n" +
    '  <form class="forum-ask-form" novalidate>\n' +
    themeSelect +
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
    '    <button type="submit" class="btn btn-primary">Envoyer ma question</button>\n' +
    '    <p class="forum-ask-alt">Ou écrivez directement : <a href="mailto:' +
    esc(DATA.contactEmail) +
    "?subject=" +
    encodeURIComponent(themeLabel) +
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
    "  <span>Partager ce fil :</span>\n" +
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
    "  <h2>Recherches associées</h2>\n" +
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

function allThreadsFlat() {
  var list = [];
  DATA.themes.forEach(function (t) {
    t.threads.forEach(function (th) {
      list.push({ theme: t, thread: th });
    });
  });
  return list;
}

function forumStats() {
  var n = 0;
  DATA.themes.forEach(function (t) {
    n += t.threads.length;
  });
  return { themes: DATA.themes.length, threads: n, replies: n };
}

function buildHub() {
  var canonical = BASE + "/forum/";
  var stats = forumStats();
  var desc =
    "Forum assurance et crédit : " +
    stats.threads +
    " questions (mutuelle, VTC, crédit immo, habitation, Nancy 54). Posez la vôtre — réponses courtier ORIAS, contact@leadsopportunities.fr.";

  var themeChips = DATA.themes
    .map(function (t) {
      return (
        '<a class="forum-chip" href="./' +
        esc(t.slug) +
        '/">' +
        esc(t.navLabel) +
        " <span>" +
        t.threads.length +
        "</span></a>"
      );
    })
    .join("\n        ");

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
        " questions · 1 réponse courtier / fil</em>\n" +
        "      </a>\n"
      );
    })
    .join("");

  var rows = allThreadsFlat()
    .map(function (item) {
      var t = item.theme;
      var th = item.thread;
      return (
        '        <tr>\n' +
        '          <td class="forum-q"><a href="./' +
        esc(t.slug) +
        "/" +
        esc(th.slug) +
        '.html">' +
        esc(th.question) +
        "</a>\n" +
        '            <p class="forum-q-excerpt">' +
        esc(th.excerpt) +
        "</p></td>\n" +
        '          <td><a class="forum-badge" href="./' +
        esc(t.slug) +
        '/">' +
        esc(t.navLabel) +
        "</a></td>\n" +
        '          <td class="forum-meta-num">1</td>\n' +
        "        </tr>\n"
      );
    })
    .join("");

  var phraseCloud = (DATA.seoPhrases || [])
    .map(function (p) {
      return "<li>" + esc(p) + "</li>";
    })
    .join("");

  var hubTheme = {
    need: "sante",
    slug: "",
    navLabel: "Forum",
    title: "Forum",
  };

  var body =
    '  <main class="forum-main container">\n' +
    '    <header class="forum-hero">\n' +
    '      <p class="forum-kicker">Forum communautaire · Courtier ORIAS</p>\n' +
    "      <h1>Forum assurance &amp; crédit</h1>\n" +
    '      <p class="lead">Les questions que vous tapez sur Google — « combien ça coûte vraiment », « mon prêt est refusé », « attestation VTC Uber » — sont ici en fils de discussion, avec réponse de courtier. Posez la vôtre : <a href="mailto:' +
    esc(DATA.contactEmail) +
    '">' +
    esc(DATA.contactEmail) +
    "</a>.</p>\n" +
    '      <p class="forum-stats" aria-label="Statistiques du forum"><span><strong>' +
    stats.threads +
    "</strong> questions</span><span><strong>" +
    stats.themes +
    "</strong> thèmes</span><span><strong>" +
    stats.replies +
    "</strong> réponses courtier</span></p>\n" +
    '      <p class="forum-cta-row"><a class="btn btn-primary" href="#poser-question">Poser une question</a> <a class="btn btn-outline" href="#toutes-les-questions">Voir toutes les questions</a></p>\n' +
    "    </header>\n" +
    '    <nav class="forum-chips" aria-label="Thèmes du forum">\n' +
    "        " +
    themeChips +
    "\n" +
    "    </nav>\n" +
    '    <section class="forum-theme-grid" aria-label="Thèmes">\n' +
    cards +
    "    </section>\n" +
    '    <section class="forum-board" id="toutes-les-questions" aria-labelledby="forum-board-title">\n' +
    '      <div class="forum-board-head">\n' +
    '        <h2 id="forum-board-title">Toutes les questions</h2>\n' +
    '        <p class="forum-board-lead">Chaque question = une page indexable (SEO) + une réponse courtier. Cliquez pour lire le fil.</p>\n' +
    "      </div>\n" +
    '      <div class="forum-table-wrap">\n' +
    '        <table class="forum-table">\n' +
    "          <thead>\n" +
    "            <tr><th scope=\"col\">Question</th><th scope=\"col\">Thème</th><th scope=\"col\">Réponses</th></tr>\n" +
    "          </thead>\n" +
    "          <tbody>\n" +
    rows +
    "          </tbody>\n" +
    "        </table>\n" +
    "      </div>\n" +
    "    </section>\n" +
    '    <section class="forum-cloud">\n' +
    "      <h2>Tournures fréquentes (longue traîne)</h2>\n" +
    "      <p class=\"forum-cloud-lead\">Ces phrases sont aussi notre SEO : ce que les gens tapent avant de comparer un devis.</p>\n" +
    "      <ul>" +
    phraseCloud +
    "</ul>\n" +
    '      <p class="forum-fb-note">Partagez un fil sur <strong>Facebook</strong> (groupes locaux Nancy, VTC, immo) : chaque page a un bouton Partager + Open Graph.</p>\n' +
    "    </section>\n" +
    askFormHtml(hubTheme, { hubMode: true }) +
    "  </main>\n";

  var itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Questions du forum Leads Opportunities",
    numberOfItems: stats.threads,
    itemListElement: allThreadsFlat().map(function (item, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        url: BASE + "/forum/" + item.theme.slug + "/" + item.thread.slug + ".html",
        name: item.thread.question,
      };
    }),
  };

  var jsonLd = [
    organizationJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Forum Leads Opportunities",
      description: desc,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Leads Opportunities", url: BASE + "/" },
      mainEntity: itemList,
    },
    itemList,
  ];

  return shell({
    title: "Forum assurance & crédit — questions et réponses",
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
        '        <div class="forum-thread-card-meta"><span class="forum-badge">' +
        esc(theme.navLabel) +
        '</span><span class="forum-pill">1 réponse</span></div>\n' +
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
        '.html">Ouvrir le fil →</a>\n' +
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
    '      <p class="forum-stats"><span><strong>' +
    theme.threads.length +
    "</strong> questions</span><span><strong>" +
    theme.threads.length +
    "</strong> réponses</span></p>\n" +
    '      <p class="forum-cta-row"><a class="btn btn-primary" href="#poser-question">Poser une question</a> <a class="btn btn-outline" href="' +
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

function relatedThreadsHtml(theme, currentSlug) {
  var others = theme.threads.filter(function (th) {
    return th.slug !== currentSlug;
  }).slice(0, 4);
  if (!others.length) return "";
  return (
    '<aside class="forum-related">\n' +
    "  <h2>Autres questions — " +
    esc(theme.navLabel) +
    "</h2>\n" +
    "  <ul>\n" +
    others
      .map(function (th) {
        return (
          '    <li><a href="./' +
          esc(th.slug) +
          '.html">' +
          esc(th.question) +
          "</a></li>\n"
        );
      })
      .join("") +
    "  </ul>\n" +
    '  <p><a href="./">Toutes les questions « ' +
    esc(theme.navLabel) +
    " » →</a></p>\n" +
    "</aside>\n"
  );
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
    '        <p class="forum-kicker">Fil · ' +
    esc(theme.navLabel) +
    "</p>\n" +
    "        <h1>" +
    esc(thread.question) +
    "</h1>\n" +
    '        <p class="forum-date"><time datetime="' +
    TODAY +
    '">Mis à jour le ' +
    TODAY +
    "</time> · 1 réponse</p>\n" +
    "      </header>\n" +
    '      <div class="forum-post forum-post--question">\n' +
    '        <div class="forum-post-head"><span class="forum-avatar" aria-hidden="true">Q</span><div><strong>Question du forum</strong><span class="forum-post-role">Membre · ' +
    esc(theme.navLabel) +
    "</span></div></div>\n" +
    "        <p>" +
    esc(thread.excerpt) +
    "</p>\n" +
    "      </div>\n" +
    '      <div class="forum-post forum-post--answer forum-answer" id="acceptedAnswer">\n' +
    '        <div class="forum-post-head"><span class="forum-avatar forum-avatar--pro" aria-hidden="true">W</span><div><strong>Wendy Buchet</strong><span class="forum-post-role">Courtier ORIAS 15005935 · réponse acceptée</span></div></div>\n' +
    "        <p>" +
    esc(thread.answer) +
    "</p>\n" +
    '        <p class="forum-fb-hook">' +
    esc(fbHook) +
    "</p>\n" +
    "      </div>\n" +
    phrasesList(thread.phrases) +
    relatedThreadsHtml(theme, thread.slug) +
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
    '</a> <a class="btn btn-soft" href="#poser-question">Répondre / poser une suite</a></p>\n' +
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
      author: { "@type": "Person", name: "Membre forum" },
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
