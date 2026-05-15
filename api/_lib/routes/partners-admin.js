const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody, sanitizeEnum } = require("../security");
const { listPartners, syncConfigToDb } = require("../partners/registry");

const VALID_STATUS = ["active", "inactive", "pending", "archived"];

function credentialConfigured(partner) {
  const integration = partner.integration || {};
  const envKey = integration.credentialEnv || integration.baseUrlEnv;
  if (!envKey) return false;
  return !!(process.env[envKey] && String(process.env[envKey]).trim());
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const dbUrl = process.env.DATABASE_URL;
  let sql = null;
  if (dbUrl) {
    const { neon } = require("@neondatabase/serverless");
    sql = neon(dbUrl);
  }

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const leadId = url.searchParams.get("leadId");

    if (leadId && sql) {
      const logs = await sql`
        SELECT l.id, l.lead_id, l.partner_id, l.status, l.http_status, l.error_message, l.created_at, p.name AS partner_name
        FROM partner_dispatch_log l
        JOIN partners p ON p.id = l.partner_id
        WHERE l.lead_id = ${leadId}
        ORDER BY l.created_at DESC
      `;
      return res.status(200).json({ ok: true, logs: logs });
    }

    const partners = await listPartners(sql);
    const enriched = partners.map(function (p) {
      return Object.assign({}, p, {
        credentialConfigured: credentialConfigured(p),
        integrationType: (p.integration && p.integration.type) || "manual",
      });
    });

    let recentLogs = [];
    if (sql) {
      try {
        recentLogs = await sql`
          SELECT l.id, l.lead_id, l.partner_id, l.status, l.http_status, l.created_at, p.name AS partner_name
          FROM partner_dispatch_log l
          JOIN partners p ON p.id = l.partner_id
          ORDER BY l.created_at DESC
          LIMIT 40
        `;
      } catch (e) {
        if (e.code !== "42P01") console.warn("[partners-admin] logs", e.message);
      }
    }

    return res.status(200).json({
      ok: true,
      partners: enriched,
      recentDispatches: recentLogs,
    });
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body;

    if (body.action === "sync") {
      if (!sql) return res.status(500).json({ error: "DATABASE_URL requis pour synchroniser" });
      const count = await syncConfigToDb(sql);
      return res.status(200).json({ ok: true, message: count + " partenaire(s) synchronisé(s) depuis config/partners.json" });
    }

    if (body.action === "toggle" && body.partnerId) {
      if (!sql) return res.status(500).json({ error: "DATABASE_URL requis" });
      const status = sanitizeEnum(body.status, VALID_STATUS, "inactive");
      await sql`
        UPDATE partners SET status = ${status}, updated_at = now() WHERE id = ${String(body.partnerId)}
      `;
      return res.status(200).json({ ok: true, partnerId: body.partnerId, status: status });
    }

    if (body.action === "test" && body.partnerId) {
      const partners = await listPartners(sql);
      const partner = partners.find(function (p) {
        return p.id === body.partnerId;
      });
      if (!partner) return res.status(404).json({ error: "Partenaire introuvable" });
      const { dispatchToPartner } = require("../partners/adapters");
      const testLead = {
        source: "test",
        vertical: "vtc",
        email: "test@example.com",
        phone: "0600000000",
        fullName: "Test Leads Opportunities",
      };
      const result = await dispatchToPartner(partner, testLead, 99, "test_" + Date.now());
      return res.status(200).json({ ok: true, result: result });
    }

    return res.status(400).json({ error: "action invalide (sync | toggle | test)" });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
