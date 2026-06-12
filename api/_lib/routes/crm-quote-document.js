const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const {
  loadBrandConfig,
  buildDocumentModel,
  renderDocumentHtml,
  parseQuoteData,
} = require("../quote-document");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const quoteId = url.searchParams.get("id");
  const format = (url.searchParams.get("format") || "json").toLowerCase();

  if (!quoteId) return res.status(400).json({ error: "id requis" });

  const scope = contactScopeFilter(user);

  try {
    const rows = await sql`
      SELECT q.*, c.first_name, c.last_name, c.email, c.phone, c.postal_code, c.company
      FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE q.id = ${quoteId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Devis introuvable" });

    const row = rows[0];
    const quote = {
      id: row.id,
      contact_id: row.contact_id,
      product_type: row.product_type,
      status: row.status,
      title: row.title,
      data: row.data,
      premium_estimate: row.premium_estimate,
      deposit_amount: row.deposit_amount,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    const contact = {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      postal_code: row.postal_code,
      company: row.company,
    };

    const brand = loadBrandConfig();
    const model = buildDocumentModel(quote, contact, brand);
    const data = parseQuoteData(quote.data);

    if (format === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(renderDocumentHtml(model));
    }

    return res.status(200).json({
      ok: true,
      quoteId,
      model,
      document: data.document || null,
      hasPartnerImport: !!(data.document && data.document.partnerImport && data.document.partnerImport.partnerName),
    });
  } catch (e) {
    console.error("[crm/quote-document]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
