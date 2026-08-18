const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { ensureSiteLeadsSchema, ensurePersonLinksSchema } = require("../ensure-schema");
const Ident = require("../../../js/lead-identity-lib");
const { isLeadUuid } = require("../lead-search");

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function displayName(row, payload) {
  var n = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  if (n) return n;
  n = [payload.firstName || payload.first_name, payload.lastName || payload.last_name].filter(Boolean).join(" ").trim();
  if (n) return n;
  return payload.fullName || row.email || row.phone || row.id;
}

function toItem(row, ipCounts) {
  var p = parsePayload(row.payload);
  var ip = row.client_ip || p.clientIp || p.client_ip || "";
  var ua = row.client_ua || p.clientUa || p.userAgent || "";
  var trust = Ident.scoreTrust({
    email: row.email,
    phone: row.phone,
    ip: ip,
    ua: ua,
    ipIdentityCount: ipCounts[Ident.normalizeIp(ip)] || 0,
    country: p.visitor_country,
    honeypot: false,
    phone_format_warning: p.phone_format_warning,
    questionnaire_step: row.questionnaire_step,
    questionnaire_total: row.questionnaire_total,
    gclid: row.gclid || p.gclid,
    fbclid: row.fbclid || p.fbclid,
    ttclid: row.ttclid || p.ttclid,
  });
  var isProspect = !!(row.contact_id && row.contact_type);
  return {
    id: row.id,
    createdAt: row.created_at,
    email: row.email,
    phone: row.phone,
    name: displayName(row, p),
    vertical: row.vertical,
    source: row.source,
    platform: row.platform,
    score: row.lead_score,
    status: row.status,
    contactId: row.contact_id || null,
    contactType: row.contact_type || null,
    isProspect: isProspect,
    isInterlocutor: isProspect,
    ip: ip,
    ua: ua,
    uaLabel: Ident.uaSummary(ua),
    visitorId: row.visitor_id || p.visitor_id || "",
    country: p.visitor_country || "",
    trust: trust,
    parentLeadId: row.parent_lead_id,
    isDuplicate: !!row.is_duplicate,
    archived: !!row.archived_at,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  await ensureSiteLeadsSchema(sql);
  await ensurePersonLinksSchema(sql);

  const url = new URL(req.url, "http://localhost");
  const view = String(url.searchParams.get("view") || "all");
  const q = String(url.searchParams.get("q") || "")
    .trim()
    .toLowerCase();
  const limit = Math.min(400, Math.max(20, Number(url.searchParams.get("limit") || 250)));

  try {
    var rows = await sql`
      SELECT
        l.id, l.created_at, l.email, l.phone, l.vertical, l.source, l.lead_score,
        l.status, l.contact_id, l.client_ip, l.visitor_id, l.payload,
        l.questionnaire_step, l.questionnaire_total, l.gclid, l.fbclid, l.ttclid,
        l.platform, l.parent_lead_id, l.is_duplicate, l.archived_at,
        c.first_name, c.last_name, c.contact_type, c.status AS contact_status
      FROM site_leads l
      LEFT JOIN crm_contacts c ON c.id = l.contact_id
      ORDER BY l.created_at DESC
      LIMIT ${limit}
    `;

    if (isLeadUuid(q)) {
      try {
        const extra = await sql`
          SELECT
            l.id, l.created_at, l.email, l.phone, l.vertical, l.source, l.lead_score,
            l.status, l.contact_id, l.client_ip, l.visitor_id, l.payload,
            l.questionnaire_step, l.questionnaire_total, l.gclid, l.fbclid, l.ttclid,
            l.platform, l.parent_lead_id, l.is_duplicate, l.archived_at,
            c.first_name, c.last_name, c.contact_type, c.status AS contact_status
          FROM site_leads l
          LEFT JOIN crm_contacts c ON c.id = l.contact_id
          WHERE LOWER(l.id) = LOWER(${q})
          LIMIT 1
        `;
        if (extra[0] && !rows.some(function (r) { return String(r.id).toLowerCase() === String(extra[0].id).toLowerCase(); })) {
          rows = [extra[0]].concat(rows);
        }
      } catch (idErr) {
        console.warn("[crm/leads-hub] exact id", idErr.message);
      }
    }

    const rawItems = rows.map(function (r) {
      var p = parsePayload(r.payload);
      return {
        id: r.id,
        email: r.email,
        phone: r.phone,
        ip: r.client_ip || p.clientIp,
        visitorId: r.visitor_id || p.visitor_id,
        clientIp: r.client_ip || p.clientIp,
      };
    });
    const ipCounts = Ident.countIdentitiesByIp(rawItems);
    var items = rows.map(function (r) {
      return toItem(r, ipCounts);
    });

    if (q) {
      items = items.filter(function (it) {
        var hay = [it.id, it.name, it.email, it.phone, it.ip, it.vertical, it.source, it.contactId, it.visitorId].join(" ").toLowerCase();
        if (isLeadUuid(q) && String(it.id || "").toLowerCase() === q) return true;
        return hay.indexOf(q) >= 0;
      });
    }
    if (view === "humain") items = items.filter(function (it) { return it.trust.label === "humain"; });
    if (view === "suspect") items = items.filter(function (it) { return it.trust.label === "suspect"; });
    if (view === "spam") items = items.filter(function (it) { return it.trust.label === "spam"; });
    if (view === "prospects") items = items.filter(function (it) { return it.isProspect; });
    if (view === "leads") items = items.filter(function (it) { return !it.isProspect; });

    const clusters = Ident.clusterItems(items, ipCounts).map(function (g) {
      var pairs = [];
      var a;
      var b;
      for (a = 0; a < g.length; a++) {
        for (b = a + 1; b < g.length; b++) {
          var m = Ident.matchPair(g[a], g[b]);
          if (!m.strength) continue;
          pairs.push({
            a: g[a].id,
            b: g[b].id,
            reasons: m.reasons,
            strength: m.strength,
            canFuse: Ident.canFuse(m),
            canLink: Ident.canLink(m),
          });
        }
      }
      return {
        ids: g.map(function (x) { return x.id; }),
        names: g.map(function (x) { return x.name; }),
        pairs: pairs,
      };
    });

    var pending = [];
    try {
      pending = await sql`
        SELECT * FROM crm_person_links
        WHERE status IN ('pending', 'approved')
        ORDER BY created_at DESC
        LIMIT 80
      `;
    } catch (e) {
      pending = [];
    }

    var kpis = {
      total: items.length,
      humains: items.filter(function (it) { return it.trust.label === "humain"; }).length,
      suspects: items.filter(function (it) { return it.trust.label === "suspect"; }).length,
      spam: items.filter(function (it) { return it.trust.label === "spam"; }).length,
      prospects: items.filter(function (it) { return it.isProspect; }).length,
      matches: clusters.length,
      pending: pending.filter(function (p) { return p.status === "pending"; }).length,
    };

    if (view === "matches") {
      var idSet = {};
      clusters.forEach(function (c) {
        c.ids.forEach(function (id) {
          idSet[id] = true;
        });
      });
      items = items.filter(function (it) {
        return idSet[it.id];
      });
    }

    return res.status(200).json({
      ok: true,
      isAdmin: user.role === "admin" || user.crmRole === "admin",
      kpis: kpis,
      leads: view === "pending" ? [] : items,
      matches: clusters,
      pending: pending,
    });
  } catch (e) {
    console.error("[crm/leads-hub]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
