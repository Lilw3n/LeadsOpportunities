/**
 * Gestionnaire Meta — pages, santé intégration, stats leads.
 */
const fs = require("fs");
const path = require("path");
const { getMetaAccessToken } = require("./meta-lead-ads");
const { buildPubsHub, loadHubConfig } = require("./ad-platform-hub");

const PAGES_CONFIG = path.join(process.cwd(), "config/meta-pages.json");
const PAGES_REGISTRY = path.join(process.cwd(), "data/meta-pages-registry.json");

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function parsePayloadSafe(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function parseFacebookUrl(input) {
  var s = String(input || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/\//, "");
  var url;
  try {
    url = new URL(s);
  } catch (e) {
    return null;
  }
  if (!/facebook\.com|fb\.com|fb\.me|instagram\.com/i.test(url.hostname)) {
    return { type: "other", url: url.href, id: null, name: null };
  }
  var parts = url.pathname.split("/").filter(Boolean);
  var type = "page";
  if (parts[0] === "groups" && parts[1]) {
    return {
      type: "group",
      id: parts[1],
      url: url.href.split("?")[0],
      name: null,
      trackable: false,
      hint: "Groupe : pas de récupération auto de leads — utilisez un lien UTM vers une landing.",
    };
  }
  if (/^\d+$/.test(parts[0])) {
    return { type: "page", id: parts[0], url: url.href.split("?")[0], name: null, trackable: true };
  }
  if (parts[0] === "profile.php" && url.searchParams.get("id")) {
    return {
      type: "page",
      id: url.searchParams.get("id"),
      url: url.href.split("?")[0] + "?id=" + url.searchParams.get("id"),
      name: null,
      trackable: true,
    };
  }
  if (parts.length) {
    return {
      type: "page",
      id: parts[parts.length - 1],
      slug: parts[parts.length - 1],
      url: url.href.split("?")[0],
      name: null,
      trackable: true,
    };
  }
  return { type: "page", id: null, url: url.href, name: null, trackable: false };
}

function loadPagesConfig() {
  var cfg = readJson(PAGES_CONFIG, { pages: [] });
  var reg = readJson(PAGES_REGISTRY, { pages: [] });
  var seen = {};
  var merged = [];
  (cfg.pages || []).concat(reg.pages || []).forEach(function (p) {
    var key = String(p.id || p.url || p.name || "").toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = true;
    merged.push(p);
  });
  return {
    primary_page_id: cfg.primary_page_id || process.env.META_PAGE_ID || "",
    pages: merged,
    groups_policy: cfg.groups_policy || "",
    messenger_policy: cfg.messenger_policy || "",
    registry_count: (reg.pages || []).length,
  };
}

function registerPage(entry) {
  var parsed = parseFacebookUrl(entry.url);
  if (!parsed || !parsed.url) throw new Error("URL Facebook invalide");
  var reg = readJson(PAGES_REGISTRY, { pages: [], updated_at: null });
  var page = {
    id: parsed.id || entry.id || null,
    name: String(entry.name || parsed.name || parsed.slug || parsed.id || "Page Facebook").trim(),
    url: parsed.url,
    type: parsed.type || "page",
    trackable: parsed.trackable !== false && parsed.type !== "group",
    notes: String(entry.notes || "").trim().slice(0, 500),
    added_at: new Date().toISOString(),
    utm_template:
      "https://www.leadsopportunities.fr/landings/rappel.html?utm_source=facebook&utm_medium=" +
      (parsed.type === "group" ? "group" : "page") +
      "&utm_campaign=" +
      encodeURIComponent(String(entry.name || "meta-page").toLowerCase().replace(/\s+/g, "-")),
  };
  if (parsed.type === "group") {
    page.trackable = false;
    page.hint = parsed.hint;
  }
  var dup = (reg.pages || []).some(function (x) {
    return String(x.url).toLowerCase() === String(page.url).toLowerCase();
  });
  if (dup) throw new Error("Cette page est déjà enregistrée");
  reg.pages = [page].concat(reg.pages || []);
  reg.updated_at = new Date().toISOString();
  writeJson(PAGES_REGISTRY, reg);
  return page;
}

function isMetaLeadAds(row) {
  return row.source === "meta_lead_ads";
}

function isSiteMetaLead(row) {
  if (isMetaLeadAds(row)) return false;
  var p = parsePayloadSafe(row.payload);
  var utm = String(row.utm_source || p.utm_source || "").toLowerCase();
  return !!(row.fbclid || p.fbclid || /facebook|meta|fb|instagram/.test(utm));
}

function leadChannel(row) {
  if (isMetaLeadAds(row)) return "lead_ads";
  if (isSiteMetaLead(row)) return "site_meta";
  return "other";
}

function summarizeLead(row) {
  var p = parsePayloadSafe(row.payload);
  var name =
    p.fullName ||
    p.full_name ||
    [p.firstName || p.first_name, p.lastName || p.last_name].filter(Boolean).join(" ") ||
    "";
  return {
    id: row.id,
    channel: leadChannel(row),
    email: row.email || p.email || "",
    phone: row.phone || p.phone || "",
    name: name,
    vertical: row.vertical || "",
    score: row.lead_score,
    source: row.source,
    form_id: row.form_id || p.meta_form_id || null,
    created_at: row.created_at,
    utm_campaign: row.utm_campaign || p.utm_campaign || "",
  };
}

async function fetchRecentLeads(sql, days) {
  if (!sql) return [];
  var since = new Date(Date.now() - days * 86400000).toISOString();
  try {
    var rows = await sql`
      SELECT id, source, vertical, lead_score, email, phone, fbclid,
             utm_source, utm_medium, utm_campaign, form_id, created_at, payload
      FROM site_leads
      WHERE created_at >= ${since}
      ORDER BY created_at DESC
      LIMIT 400
    `;
    return rows.filter(function (r) {
      return leadChannel(r) !== "other";
    });
  } catch (e) {
    return [];
  }
}

async function fetchLeadStats(sql, days) {
  var rows = await fetchRecentLeads(sql, days);
  var stats = {
    lead_ads: 0,
    site_meta: 0,
    unopened_lead_ads: 0,
    last_lead_ads_at: null,
    last_site_meta_at: null,
  };
  rows.forEach(function (r) {
    var ch = leadChannel(r);
    if (ch === "lead_ads") {
      stats.lead_ads++;
      if (!stats.last_lead_ads_at || r.created_at > stats.last_lead_ads_at) {
        stats.last_lead_ads_at = r.created_at;
      }
      var p = parsePayloadSafe(r.payload);
      if (!p.openedAt) stats.unopened_lead_ads++;
    }
    if (ch === "site_meta") {
      stats.site_meta++;
      if (!stats.last_site_meta_at || r.created_at > stats.last_site_meta_at) {
        stats.last_site_meta_at = r.created_at;
      }
    }
  });
  return stats;
}

async function checkGraphPage(pageId) {
  var token = getMetaAccessToken();
  if (!token) return { ok: false, error: "META_PAGE_ACCESS_TOKEN manquant" };
  if (!pageId) return { ok: false, error: "META_PAGE_ID manquant" };
  var version = process.env.META_CAPI_VERSION || "v20.0";
  var url =
    "https://graph.facebook.com/" +
    version +
    "/" +
    encodeURIComponent(String(pageId)) +
    "?fields=name,id&access_token=" +
    encodeURIComponent(token);
  try {
    var r = await fetch(url);
    var body = await r.json();
    if (!r.ok) {
      return { ok: false, error: body.error && body.error.message ? body.error.message : "Graph API " + r.status };
    }
    return { ok: true, name: body.name, id: body.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function buildHealthEnv() {
  return {
    pixel: !!process.env.META_PIXEL_ID,
    capi: !!process.env.META_CAPI_TOKEN,
    page_token: !!process.env.META_PAGE_ACCESS_TOKEN,
    app_secret: !!process.env.META_APP_SECRET,
    verify_token: !!process.env.META_VERIFY_TOKEN,
    page_id: process.env.META_PAGE_ID || "",
    webhook_url: "https://www.leadsopportunities.fr/api/webhooks/meta-lead",
  };
}

async function buildMetaHealth(sql) {
  var env = buildHealthEnv();
  var pageId = env.page_id || loadPagesConfig().primary_page_id;
  var graph = await checkGraphPage(pageId);
  var stats = await fetchLeadStats(sql, 30);
  var configured =
    env.pixel && env.page_token && env.app_secret && env.verify_token;
  return {
    configured: configured,
    env: env,
    graph: graph,
    last_lead_ads_at: stats.last_lead_ads_at,
    last_site_meta_at: stats.last_site_meta_at,
    webhook_hint:
      "Meta Developers → Webhooks → Page → leadgen → URL " + env.webhook_url,
  };
}

async function buildMetaManagerOverview(sql, options) {
  options = options || {};
  var days = Math.min(Math.max(Number(options.days) || 7, 1), 90);
  var pagesCfg = loadPagesConfig();
  var hub = await buildPubsHub({ sql: sql });
  var adHub = loadHubConfig();
  var metaPlatform = (adHub.platforms || []).find(function (p) {
    return p.id === "meta";
  });
  var rows = await fetchRecentLeads(sql, days);
  var stats = await fetchLeadStats(sql, days);
  var health = await buildMetaHealth(sql);

  function envOrInactive(tokenOk) {
    return tokenOk ? "ready" : "inactive";
  }

  var channels = [
    {
      id: "lead_ads",
      label: "Formulaires instantanés (Lead Ads)",
      trackable: true,
      status: health.last_lead_ads_at ? "active" : envOrInactive(health.env.page_token),
      count_7d: stats.lead_ads,
      crm_path: "./crm-meta-inbox.html",
    },
    {
      id: "site_meta",
      label: "Site — clic pub / fbclid",
      trackable: true,
      status: stats.site_meta > 0 ? "active" : health.env.pixel ? "ready" : "inactive",
      count_7d: stats.site_meta,
      crm_path: "./crm-sources.html",
    },
    {
      id: "messenger",
      label: "Messages privés Page (Messenger)",
      trackable: false,
      status: "planned",
      count_7d: 0,
      note: pagesCfg.messenger_policy,
    },
    {
      id: "groups",
      label: "Groupes Facebook",
      trackable: false,
      status: "unsupported",
      count_7d: 0,
      note: pagesCfg.groups_policy,
    },
  ];

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    days: days,
    health: health,
    stats: stats,
    channels: channels,
    pages: pagesCfg.pages,
    pages_policy: {
      groups: pagesCfg.groups_policy,
      messenger: pagesCfg.messenger_policy,
    },
    recent_leads: rows.slice(0, 40).map(summarizeLead),
    meta_forms: hub.meta_forms || [],
    rotation: hub.rotation || null,
    active_campaign: hub.active_campaign || null,
    meta_links: metaPlatform ? metaPlatform.links || [] : [],
    accounts: hub.accounts || adHub.accounts || {},
  };
}

module.exports = {
  parseFacebookUrl,
  loadPagesConfig,
  registerPage,
  buildMetaHealth,
  buildMetaManagerOverview,
  leadChannel,
  summarizeLead,
};
