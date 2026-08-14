/**
 * GET/POST /api/crm/leads-roi — dashboard leads avancé (volume, dépense, CPL).
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, sanitizeEnum } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { ensureSiteLeadsSchema, ensureAdPlatformCostsSchema } = require("../ensure-schema");
const { loadHubConfig } = require("../ad-platform-hub");
const { detectNetwork } = require("../lead-network");
const Roi = require("../leads-roi-lib");

async function fetchLeadRows(sql, since) {
  try {
    return await sql`
      SELECT id, source, vertical, lead_score, email, phone, status,
             utm_source, utm_medium, utm_campaign, gclid, fbclid, ttclid,
             platform, created_at, payload, relevance
      FROM site_leads
      WHERE created_at >= ${since}
      ORDER BY created_at DESC
      LIMIT 3000
    `;
  } catch (e) {
    try {
      return await sql`
        SELECT id, source, vertical, lead_score, email, phone,
               utm_source, utm_campaign, gclid, platform, created_at, payload
        FROM site_leads
        WHERE created_at >= ${since}
        ORDER BY created_at DESC
        LIMIT 3000
      `;
    } catch (e2) {
      console.warn("[crm/leads-roi] fetch", e2.message);
      return [];
    }
  }
}

async function loadCosts(sql, fromDay, toDay) {
  var budgets = {};
  var actual = {};
  Roi.PAID_IDS.forEach(function (id) {
    budgets[id] = 0;
    actual[id] = {};
  });
  try {
    var budgetRows = await sql`SELECT platform, daily_budget_eur FROM ad_platform_costs`;
    budgetRows.forEach(function (r) {
      budgets[r.platform] = Number(r.daily_budget_eur) || 0;
    });
  } catch (e) {
    console.warn("[crm/leads-roi] budgets", e.message);
  }
  try {
    var spendRows = await sql`
      SELECT platform, spend_date::text AS spend_date, amount_eur
      FROM ad_platform_spend
      WHERE spend_date >= ${fromDay}::date AND spend_date <= ${toDay}::date
    `;
    spendRows.forEach(function (r) {
      var p = r.platform;
      if (!actual[p]) actual[p] = {};
      actual[p][String(r.spend_date).slice(0, 10)] = Number(r.amount_eur) || 0;
    });
  } catch (e) {
    console.warn("[crm/leads-roi] spend", e.message);
  }
  var costs = {};
  Roi.PAID_IDS.concat(["site_web", "autre"]).forEach(function (id) {
    costs[id] = {
      daily_budget_eur: budgets[id] || 0,
      actualByDay: actual[id] || {},
    };
  });
  return costs;
}

function recentFromRows(rows, limit) {
  var labels = {};
  Roi.ROI_PLATFORMS.forEach(function (p) {
    labels[p.id] = p.label;
  });
  return (rows || []).slice(0, limit || 25).map(function (row) {
    var net = detectNetwork(row);
    return {
      id: row.id,
      network: net,
      network_label: labels[net] || net,
      vertical: row.vertical,
      lead_score: row.lead_score,
      email: row.email,
      phone: row.phone,
      status: row.status,
      utm_campaign: row.utm_campaign,
      created_at: row.created_at,
    };
  });
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  await ensureSiteLeadsSchema(sql);
  await ensureAdPlatformCostsSchema(sql);

  if (req.method === "POST") {
    var parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    var body = parsed.body || {};
    var op = String(body.op || "").toLowerCase();
    var platform = sanitizeEnum(body.platform, Roi.PAID_IDS, null);
    if (!platform) return res.status(400).json({ error: "Plateforme inconnue" });

    try {
      if (op === "budget") {
        var daily = Math.max(0, Math.min(500, Number(body.daily_budget_eur) || 0));
        daily = Roi.round2(daily);
        await sql`
          INSERT INTO ad_platform_costs (platform, daily_budget_eur, updated_at)
          VALUES (${platform}, ${daily}, NOW())
          ON CONFLICT (platform) DO UPDATE SET
            daily_budget_eur = EXCLUDED.daily_budget_eur,
            updated_at = NOW()
        `;
        return res.status(200).json({ ok: true, platform: platform, daily_budget_eur: daily });
      }

      if (op === "spend") {
        var fromDay = String(body.from || "").slice(0, 10);
        var toDay = String(body.to || body.from || "").slice(0, 10);
        var amount = Number(body.amount_eur);
        var parts = Roi.distributeSpend(amount, fromDay, toDay);
        if (!parts.length) {
          return res.status(400).json({ error: "Période ou montant invalide" });
        }
        for (var i = 0; i < parts.length; i++) {
          var id = "spd_" + crypto.randomBytes(8).toString("hex");
          var day = parts[i].day;
          var val = parts[i].amount_eur;
          await sql`
            INSERT INTO ad_platform_spend (id, platform, spend_date, amount_eur)
            VALUES (${id}, ${platform}, ${day}::date, ${val})
            ON CONFLICT (platform, spend_date) DO UPDATE SET amount_eur = EXCLUDED.amount_eur
          `;
        }
        return res.status(200).json({
          ok: true,
          platform: platform,
          days: parts.length,
          amount_eur: Roi.round2(amount),
        });
      }

      return res.status(400).json({ error: "op inconnu (budget|spend)" });
    } catch (e) {
      console.error("[crm/leads-roi POST]", e);
      return res.status(500).json({ error: "Erreur serveur", detail: e.message });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var url = new URL(req.url, "http://localhost");
    var days = Math.min(90, Math.max(7, parseInt(url.searchParams.get("days") || "30", 10) || 30));
    var platformFilter = sanitizeEnum(url.searchParams.get("platform"), Roi.PAID_IDS.concat(["site_web", "autre"]), null);
    var sinceDate = new Date(Date.now() - days * 86400000);
    sinceDate.setUTCHours(0, 0, 0, 0);
    var since = sinceDate.toISOString();
    var daysList = Roi.eachDay(since, days);
    var fromDay = daysList[0];
    var toDay = daysList[daysList.length - 1];

    var rows = await fetchLeadRows(sql, since);
    var costs = await loadCosts(sql, fromDay, toDay);
    var agg = Roi.aggregateLeadsRoi(rows, {
      days: days,
      since: since,
      daysList: daysList,
      costs: costs,
      platform: platformFilter,
    });
    var hub = loadHubConfig();

    return res.status(200).json({
      ok: true,
      generated_at: new Date().toISOString(),
      filter_platform: platformFilter,
      from: fromDay,
      to: toDay,
      truncated: rows.length >= 3000,
      kpis: {
        leads: agg.total,
        paid_leads: agg.paid_leads,
        organic_leads: agg.organic_leads,
        qualified: agg.qualified,
        spend_eur: agg.spend_eur,
        cpl_eur: agg.cpl_eur,
        cpl_all_eur: agg.cpl_all_eur,
        cpl_qualified_eur: agg.cpl_qualified_eur,
        best_platform: agg.best_platform,
      },
      platforms: agg.platforms,
      matrix: agg.matrix,
      by_campaign: agg.by_campaign,
      by_vertical: agg.by_vertical,
      trend: agg.trend,
      recent: recentFromRows(rows, 30),
      platform_links: hub.platforms || [],
      paid_ids: Roi.PAID_IDS,
      note: "Budget Meta par défaut 1 €/jour. Saisissez la dépense Ads Manager pour un CPL réel.",
    });
  } catch (e) {
    console.error("[crm/leads-roi GET]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
