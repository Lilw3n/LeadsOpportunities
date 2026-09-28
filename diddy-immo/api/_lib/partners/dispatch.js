const { randomUUID } = require("crypto");
const { getPartnersForLead } = require("./registry");
const { dispatchToPartner } = require("./adapters");

async function logDispatch(sql, leadId, partnerId, result) {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO partner_dispatch_log (id, lead_id, partner_id, status, http_status, error_message, response_snippet)
      VALUES (
        ${randomUUID()},
        ${leadId},
        ${partnerId},
        ${result.status || (result.ok ? "sent" : "error")},
        ${result.httpStatus},
        ${result.error ? String(result.error).slice(0, 500) : null},
        ${result.responseSnippet ? String(result.responseSnippet).slice(0, 300) : null}
      )
    `;
  } catch (e) {
    console.warn("[partners] log dispatch", e.message);
  }
}

/**
 * Envoie le lead vers tous les partenaires actifs correspondants (non bloquant pour le visiteur).
 */
async function dispatchLeadToPartners(lead, score, leadId) {
  const dbUrl = process.env.DATABASE_URL;
  let sql = null;
  if (dbUrl) {
    try {
      const { neon } = require("@neondatabase/serverless");
      sql = neon(dbUrl);
    } catch (e) {
      console.warn("[partners] neon", e.message);
    }
  }

  const partners = await getPartnersForLead(sql, lead, score);
  if (!partners.length) {
    console.log("[partners] aucun partenaire actif pour", leadId, lead.vertical, score);
    return { dispatched: 0, results: [] };
  }

  const results = [];
  for (const partner of partners) {
    const result = await dispatchToPartner(partner, lead, score, leadId);
    results.push({ partnerId: partner.id, partnerName: partner.name, ...result });
    await logDispatch(sql, leadId, partner.id, result);
    console.log(
      "[partners]",
      partner.id,
      result.status,
      result.httpStatus || "",
      result.error || "ok"
    );
  }

  return { dispatched: results.length, results: results };
}

module.exports = { dispatchLeadToPartners, logDispatch };
