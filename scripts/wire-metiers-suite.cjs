#!/usr/bin/env node
/** Branche le catalogue métiers sur marchés, niches, questionnaire, sitemap et flux. Idempotent. */
var fs = require("fs");
var path = require("path");
var catalog = require("./metiers-suite-catalog.cjs");

var root = path.join(__dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}
function writeJson(rel, data) {
  fs.writeFileSync(path.join(root, rel), JSON.stringify(data, null, 2) + "\n");
}

function upsertMarket(markets, item) {
  var found = markets.markets.find(function (m) {
    return m.id === item.id;
  });
  var patch = {
    status: "live",
    tier: "tier1_indexNow",
    competition: found && found.competition ? found.competition : "faible",
    label: item.marketLabel,
    primaryKeyword: item.primaryKeyword,
    longTail: item.longTail,
    landing: "/landings/" + item.file,
    moneyUrls: ["/landings/" + item.file],
    blogUrls: ["/blog/" + item.blog],
    whyWin: item.whyWin,
    questionnaireReady: true,
  };
  if (!found) {
    markets.markets.push(Object.assign({ id: item.id }, patch));
  } else {
    Object.keys(patch).forEach(function (k) {
      found[k] = patch[k];
    });
    delete found.eta;
  }
  ["indexationWeek1", "blogPartenariatNiches"].forEach(function (key) {
    var url = key === "blogPartenariatNiches" ? "/blog/" + item.blog : "/landings/" + item.file;
    if (key === "indexationWeek1") {
      ["/landings/" + item.file, "/blog/" + item.blog].forEach(function (u) {
        if (markets.indexationWeek1.indexOf(u) < 0) markets.indexationWeek1.push(u);
      });
    } else if (markets[key].indexOf(url) < 0) {
      markets[key].push(url);
    }
  });
  if (markets.partenariatNiches.indexOf(item.id) < 0) markets.partenariatNiches.push(item.id);
}

function upsertNiche(doc, item) {
  var found = doc.niches.find(function (n) {
    return n.id === item.id;
  });
  var patch = {
    status: "live",
    featured: true,
    landing: "/landings/" + item.file,
    questionnaire: "/landings/questionnaire.html?need=" + item.need + "&journey=standard",
    pageCount: 2,
    highlights: ["Landing dédiée", "Questionnaire", "Article SEO"],
    quickLinks: [
      { label: "Landing", href: "/landings/" + item.file },
      { label: "Guide blog", href: "/blog/" + item.blog },
    ],
    seoPaths: ["/landings/" + item.file, "/blog/" + item.blog],
  };
  if (!found) {
    doc.niches.push(
      Object.assign(
        {
          id: item.id,
          slug: item.file.replace(/\.html$/, ""),
          category: item.category,
          theme: "pro-metiers",
          emoji: item.emoji,
          label: item.marketLabel,
          tagline: item.h1,
          priority: 40,
          keywords: item.blogKeywords,
        },
        patch
      )
    );
  } else {
    Object.keys(patch).forEach(function (k) {
      found[k] = patch[k];
    });
    delete found.eta;
  }
  var live = doc.niches.filter(function (n) {
    return n.status === "live";
  }).length;
  var planned = doc.niches.filter(function (n) {
    return n.status === "planned";
  }).length;
  if (doc.hub && doc.hub.stats) {
    doc.hub.stats.liveNiches = live;
    doc.hub.stats.plannedNiches = planned;
  }
}

function upsertMap(map, item) {
  map.sections[item.id] = {
    need: item.need,
    questionnaire: "/landings/questionnaire.html?need=" + item.need + "&journey=standard",
    landing: "/landings/" + item.file,
    hook: item.cardExcerpt,
    question: item.question,
    primaryLabel: item.primary,
    questionnaireLabel: "Questionnaire " + item.marketLabel,
    landingLabel: item.primary,
  };
  map.articles[item.blog] = { section: item.id };
}

var markets = readJson("data/seo-niche-markets.json");
var niches = readJson("seo/niches.json");
var admin = readJson("data/niches-admin.json");
var map = readJson("data/blog-questionnaire-map.json");

catalog.forEach(function (item) {
  upsertMarket(markets, item);
  upsertNiche(niches, item);
  upsertNiche(admin, item);
  upsertMap(map, item);
});
map.articles["assurance-metiers-quel-contrat-choisir-2026.html"] = { section: "pro" };
map.updated = "2026-10-16";
markets.updated = "2026-10-16";

writeJson("data/seo-niche-markets.json", markets);
writeJson("seo/niches.json", niches);
writeJson("data/niches-admin.json", admin);
writeJson("data/blog-questionnaire-map.json", map);

var sitemapPath = path.join(root, "sitemap-main.xml");
var sitemap = fs.readFileSync(sitemapPath, "utf8");
var urls = [];
catalog.forEach(function (item) {
  urls.push("/landings/" + item.file);
  urls.push("/blog/" + item.blog);
});
urls.push("/blog/assurance-metiers-quel-contrat-choisir-2026.html");
var block = urls
  .filter(function (u) {
    return sitemap.indexOf(u) < 0;
  })
  .map(function (u) {
    return (
      "  <url>\n    <loc>https://www.leadsopportunities.fr" +
      u +
      "</loc>\n    <lastmod>2026-10-16</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
    );
  })
  .join("");
if (block) {
  sitemap = sitemap.replace("</urlset>", block + "</urlset>");
  fs.writeFileSync(sitemapPath, sitemap);
  console.log("sitemap +", block.split("<loc>").length - 1);
}

var feedPath = path.join(root, "blog", "feed.xml");
var feed = fs.readFileSync(feedPath, "utf8");
var items = catalog
  .map(function (item) {
    return { title: item.blogTitle, file: item.blog };
  })
  .concat([{ title: "Quel contrat selon le métier : RC, MRP, décennale, flotte", file: "assurance-metiers-quel-contrat-choisir-2026.html" }]);
var feedBlock = items
  .filter(function (it) {
    return feed.indexOf(it.file) < 0;
  })
  .map(function (it) {
    var link = "https://www.leadsopportunities.fr/blog/" + it.file;
    return (
      "  <item>\n    <title>" +
      it.title.replace(/&/g, "&amp;") +
      "</title>\n    <link>" +
      link +
      "</link>\n    <guid isPermaLink=\"true\">" +
      link +
      "</guid>\n    <pubDate>2026-10-16</pubDate>\n  </item>\n"
    );
  })
  .join("");
if (feedBlock) {
  var marker = "<language>fr-FR</language>";
  var at = feed.indexOf(marker);
  feed = feed.slice(0, at + marker.length) + "\n" + feedBlock + feed.slice(at + marker.length);
  fs.writeFileSync(feedPath, feed);
  console.log("feed +", feedBlock.split("<item>").length - 1);
}

console.log("wired", catalog.length, "métiers");
