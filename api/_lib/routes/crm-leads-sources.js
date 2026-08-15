/**
 * GET /api/crm/leads-sources — agrégation origine leads (plateforme, campagne, UTM)
 */
const { applyApiGuards, sanitizeEnum } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { loadHubConfig } = require("../ad-platform-hub");

const PLATFORMS = [
  "facebook", "instagram", "google", "tiktok", "linkedin", "youtube",
  "snapchat", "bing", "pinterest", "withallo", "site_web", "email", "referral", "autre",
];

function parsePayloadSafe(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function detectPlatform(row) {
  var payload = parsePayloadSafe(row.payload);
  if (row.platform) return row.platform;
  var utm = String(row.utm_source || payload.utm_source || "").toLowerCase();
  var src = String(row.source || payload.source || "").toLowerCase();
  if (/withallo|allo/.test(src + " " + utm)) return "withallo";
  if (row.fbclid || payload.fbclid || /facebook|meta|fb/.test(utm)) {
    return /instagram|ig/.test(utm) ? "instagram" : "facebook";
  }
  if (row.ttclid || payload.ttclid || /tiktok/.test(utm)) return "tiktok";
  if (row.gclid || row.msclkid || payload.gclid || /google|gclid|adwords/.test(utm)) return "google";
  if (/bing|microsoft|msclkid/.test(utm + " " + src)) return "bing";
  if (/linkedin/.test(utm)) return "linkedin";
  if (row.source === "meta_lead_ads") return "facebook";
  if (row.source === "landing_form" || /site|organic|direct|seo/.test(utm + " " + src)) return "site_web";
  return "autre";
}

function bump(map, key, inc) {
  var k = key || "(non renseigné)";
  map[k] = (map[k] || 0) + (inc || 1);
}

function topEntries(map, limit) {
  return Object.keys(map)
    .map(function (k) {
      return { key: k, count: map[k] };
    })
    .sort(function (a, b) {
      return b.count - a.count;
    })
    .slice(0, limit || 20);
}

async function fetchRows(sql, days) {
  if (!sql) return [];
  var since = new Date(Date.now() - days * 86400000).toISOString();
  try {
    return await sql`
      SELECT id, source, vertical, lead_score, email, phone,
             utm_source, utm_medium, utm_campaign, utm_content,
             gclid, fbclid, ttclid, msclkid, visitor_id, platform,
             form_id, created_at, payload, city, postal_code
      FROM site_leads
      WHERE created_at >= ${since}
      ORDER BY created_at DESC
      LIMIT 500
    `;
  } catch (e) {
    try {
      return await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_medium, utm_campaign,
               gclid, visitor_id, platform, created_at, payload
        FROM site_leads
        WHERE created_at >= ${since}
        ORDER BY created_at DESC
        LIMIT 500
      `;
    } catch (e2) {
      console.warn("[crm/leads-sources]", e2.message);
      return [];
    }
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var url = new URL(req.url, "http://localhost");
    var days = Math.min(90, Math.max(7, parseInt(url.searchParams.get("days") || "30", 10) || 30));
    var platformFilter = sanitizeEnum(url.searchParams.get("platform"), PLATFORMS, null);

    var sql = getSql();
    var rows = await fetchRows(sql, days);
    var hub = loadHubConfig();

    var byPlatform = {};
    var byCampaign = {};
    var byMedium = {};
    var bySource = {};
    var byVertical = {};
    var byForm = {};
    var withGclid = 0;
    var withFbclid = 0;
    var withTtclid = 0;
    var withUtm = 0;
    var recent = [];

    PLATFORMS.forEach(function (p) {
      byPlatform[p] = 0;
    });

    rows.forEach(function (row) {
      var payload = parsePayloadSafe(row.payload);
      var platform = detectPlatform(row);
      if (platformFilter && platform !== platformFilter) return;

      byPlatform[platform] = (byPlatform[platform] || 0) + 1;
      bump(byCampaign, row.utm_campaign || payload.utm_campaign);
      bump(byMedium, row.utm_medium || payload.utm_medium);
      bump(bySource, row.utm_source || payload.utm_source || row.source);
      bump(byVertical, row.vertical || payload.vertical || payload.need);
      if (row.form_id || payload.meta_form_id) bump(byForm, row.form_id || payload.meta_form_id);

      if (row.gclid || payload.gclid) withGclid++;
      if (row.fbclid || payload.fbclid) withFbclid++;
      if (row.ttclid || payload.ttclid) withTtclid++;
      if (row.utm_campaign || row.utm_source || payload.utm_campaign) withUtm++;

      if (recent.length < 40) {
        recent.push({
          id: row.id,
          platform: platform,
          vertical: row.vertical,
          lead_score: row.lead_score,
          email: row.email,
          phone: row.phone,
          utm_source: row.utm_source || payload.utm_source,
          utm_medium: row.utm_medium || payload.utm_medium,
          utm_campaign: row.utm_campaign || payload.utm_campaign,
          utm_content: row.utm_content || payload.utm_content,
          gclid: !!(row.gclid || payload.gclid),
          fbclid: !!(row.fbclid || payload.fbclid),
          ttclid: !!(row.ttclid || payload.ttclid),
          visitor_id: row.visitor_id || payload.visitor_id,
          form_id: row.form_id || payload.meta_form_id,
          source: row.source,
          created_at: row.created_at,
        });
      }
    });

    var total = rows.filter(function (row) {
      return !platformFilter || detectPlatform(row) === platformFilter;
    }).length;

    return res.status(200).json({
      ok: true,
      days: days,
      total: total,
      tracking: {
        with_utm: withUtm,
        with_gclid: withGclid,
        with_fbclid: withFbclid,
        with_ttclid: withTtclid,
      },
      by_platform: topEntries(byPlatform, 15),
      by_campaign: topEntries(byCampaign, 15),
      by_medium: topEntries(byMedium, 10),
      by_utm_source: topEntries(bySource, 10),
      by_vertical: topEntries(byVertical, 12),
      by_form_id: topEntries(byForm, 10),
      recent: recent,
      platform_links: hub.platforms || [],
      filter_platform: platformFilter,
    });
  } catch (e) {
    console.error("[crm/leads-sources]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
