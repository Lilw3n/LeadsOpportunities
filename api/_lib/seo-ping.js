/**
 * Signaux SEO : ping sitemap (Google/Bing) + IndexNow (Bing, Yandex, etc.)
 * Google n'indexe pas via IndexNow — Search Console reste obligatoire.
 */
const SITE = "https://www.leadsopportunities.fr";
const INDEXNOW_KEY = "7c4e9f2a1b8d6035leadsop";
const INDEXNOW_KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;

const PRIORITY_URLS = [
  `${SITE}/`,
  `${SITE}/nos-services.html`,
  `${SITE}/landings/vtc.html`,
  `${SITE}/landings/sante.html`,
  `${SITE}/landings/sante-collective.html`,
  `${SITE}/landings/credit-immo.html`,
  `${SITE}/landings/devis.html`,
  `${SITE}/landings/questionnaire.html?need=collective`,
  `${SITE}/blog/`,
  `${SITE}/blog/mutuelle-collective-obligations-employeur-ani.html`,
  `${SITE}/blog/mutuelle-collective-pme-tpe-budget-2026.html`,
  `${SITE}/blog/mutuelle-collective-mise-en-place-due-portabilite.html`,
  `${SITE}/assurance-sante/`,
  `${SITE}/france/`,
  `${SITE}/france/regions/`,
  `${SITE}/france/departements/`,
];

async function fetchStatus(url, options) {
  try {
    const res = await fetch(url, options);
    return { ok: res.ok, status: res.status, url };
  } catch (e) {
    return { ok: false, status: 0, url, error: e.message || String(e) };
  }
}

async function pingSitemapEngines() {
  const sitemap = encodeURIComponent(`${SITE}/sitemap.xml`);
  const targets = [
    `https://www.google.com/ping?sitemap=${sitemap}`,
    `https://www.bing.com/ping?sitemap=${sitemap}`,
  ];
  const results = await Promise.all(
    targets.map((url) => fetchStatus(url, { method: "GET" }))
  );
  return results;
}

async function pingIndexNow(urlList) {
  const body = {
    host: "www.leadsopportunities.fr",
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urlList.slice(0, 10000),
  };
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok || res.status === 202, status: res.status, count: urlList.length };
}

async function runSeoPing() {
  const sitemapPings = await pingSitemapEngines();
  const indexNow = await pingIndexNow(PRIORITY_URLS);
  return {
    ok: indexNow.ok || sitemapPings.some((p) => p.ok),
    sitemapPings,
    indexNow,
    priorityUrls: PRIORITY_URLS.length,
    indexNowKeyFile: INDEXNOW_KEY_LOCATION,
    note:
      "Google indexe surtout via Search Console (demande d'indexation + sitemap). IndexNow aide Bing.",
  };
}

module.exports = {
  runSeoPing,
  INDEXNOW_KEY,
  PRIORITY_URLS,
};
