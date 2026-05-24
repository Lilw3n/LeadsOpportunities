/**
 * GET /api/crm/financial-entries?type=receivables|payments|debits
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const type = url.searchParams.get("type") || "receivables";
  const id = url.searchParams.get("id");

  try {
    if (id) {
      const ct = await sql`
        SELECT ct.*, c.first_name, c.last_name, c.email
        FROM crm_contracts ct
        INNER JOIN crm_contacts c ON c.id = ct.contact_id
        WHERE ct.id = ${id} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!ct.length) return res.status(404).json({ error: "Entrée introuvable" });
      var row = ct[0];
      return res.status(200).json({
        ok: true,
        entry: {
          id: row.id,
          type: type,
          label: row.policy_number || row.contract_type,
          amount: Number(row.premium) || 0,
          status: row.status,
          contactId: row.contact_id,
          contactName: ((row.first_name || "") + " " + (row.last_name || "")).trim(),
          insurer: row.insurer,
          startDate: row.start_date,
          endDate: row.end_date,
        },
      });
    }

    const contracts = await sql`
      SELECT ct.id, ct.policy_number, ct.contract_type, ct.premium, ct.status, ct.contact_id,
        c.first_name, c.last_name
      FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY ct.updated_at DESC NULLS LAST
      LIMIT 50
    `;

    var entries = contracts.map(function (ct, i) {
      var amt = Number(ct.premium) || 0;
      var st = String(ct.status || "").toLowerCase();
      var entryType = type;
      if (type === "payments") entryType = st.indexOf("actif") >= 0 || st === "active" ? "payment" : "pending";
      if (type === "debits") entryType = "debit";
      return {
        id: ct.id,
        type: entryType,
        label: ct.policy_number || ct.contract_type || "Contrat",
        amount: amt,
        status: ct.status,
        contactId: ct.contact_id,
        contactName: ((ct.first_name || "") + " " + (ct.last_name || "")).trim(),
      };
    });

    if (type === "receivables") {
      entries = entries.filter(function (e) {
        var s = String(e.status || "").toLowerCase();
        return s.indexOf("attente") >= 0 || s === "pending" || s.indexOf("actif") >= 0;
      });
    }

    return res.status(200).json({ ok: true, type: type, entries: entries });
  } catch (e) {
    console.error("[crm/financial-entries]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
