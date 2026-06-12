const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId");
  const quoteId = url.searchParams.get("id");

  if (req.method === "GET") {
    try {
      if (quoteId) {
        const rows = await sql`
          SELECT q.*, c.email AS contact_email, c.first_name, c.last_name
          FROM crm_quotes q
          INNER JOIN crm_contacts c ON c.id = q.contact_id
          WHERE q.id = ${quoteId}
            AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
          LIMIT 1
        `;
        if (!rows.length) return res.status(404).json({ error: "Devis introuvable" });
        return res.status(200).json({ ok: true, quote: rows[0] });
      }
      const rows = await sql`
        SELECT q.*, c.first_name, c.last_name, c.email
        FROM crm_quotes q
        INNER JOIN crm_contacts c ON c.id = q.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
          AND (${contactId}::text IS NULL OR q.contact_id = ${contactId})
        ORDER BY q.updated_at DESC
        LIMIT 50
      `;
      return res.status(200).json({ ok: true, quotes: rows });
    } catch (e) {
      console.error("[crm/quotes GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const cid = body.contactId || body.contact_id;
    if (!cid) return res.status(400).json({ error: "contactId requis" });

    try {
      const ok = await sql`
        SELECT id FROM crm_contacts
        WHERE id = ${cid} AND (${scope}::text IS NULL OR assigned_to = ${scope})
        LIMIT 1
      `;
      if (!ok.length) return res.status(404).json({ error: "Contact introuvable" });

      const id = "qte_" + crypto.randomUUID();
      const dataJson = JSON.stringify(body.data || body.quoteData || {});
      await sql`
        INSERT INTO crm_quotes (id, contact_id, product_type, status, title, data, premium_estimate, assigned_to)
        VALUES (
          ${id}, ${cid},
          ${body.productType || body.product_type || "vtc-taxi"},
          ${body.status || "brouillon"},
          ${body.title || "Devis"},
          ${dataJson},
          ${body.premiumEstimate != null ? Number(body.premiumEstimate) : null},
          ${user.id}
        )
      `;
      const created = await sql`SELECT * FROM crm_quotes WHERE id = ${id} LIMIT 1`;
      return res.status(201).json({ ok: true, quote: created[0] });
    } catch (e) {
      console.error("[crm/quotes POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH" && quoteId) {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    try {
      const dataJson = body.data ? JSON.stringify(body.data) : null;
      const exists = await sql`
        SELECT q.id FROM crm_quotes q
        INNER JOIN crm_contacts c ON c.id = q.contact_id
        WHERE q.id = ${quoteId}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!exists.length) return res.status(404).json({ error: "Devis introuvable" });
      const depositAmount =
        body.depositAmount != null
          ? Number(body.depositAmount)
          : body.data &&
              body.data.document &&
              body.data.document.pricing &&
              body.data.document.pricing.brokerageFees != null
            ? Number(body.data.document.pricing.brokerageFees)
            : null;

      await sql`
        UPDATE crm_quotes SET
          status = COALESCE(${body.status ?? null}, status),
          title = COALESCE(${body.title ?? null}, title),
          data = COALESCE(${dataJson}, data),
          premium_estimate = COALESCE(${body.premiumEstimate != null ? Number(body.premiumEstimate) : null}, premium_estimate),
          deposit_amount = COALESCE(${depositAmount}, deposit_amount),
          updated_at = NOW()
        WHERE id = ${quoteId}
      `;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/quotes PATCH]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
