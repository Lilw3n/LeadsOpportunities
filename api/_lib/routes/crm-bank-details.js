const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function parseMeta(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    return {};
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);

  try {
    const rows = await sql`
      SELECT id, first_name, last_name, email, metadata
      FROM crm_contacts
      WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
      ORDER BY updated_at DESC
      LIMIT 200
    `;

    const items = [];
    rows.forEach(function (c) {
      var meta = parseMeta(c.metadata);
      var bank = meta.bank;
      if (!bank || (!bank.iban && !bank.accountHolder)) return;
      items.push({
        contactId: c.id,
        contactName: ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email,
        email: c.email,
        accountHolder: bank.accountHolder || "",
        iban: bank.iban || "",
        bic: bank.bic || "",
        bankName: bank.bankName || "",
        accountType: bank.accountType || "Compte courant",
        isDefault: bank.isDefault !== false,
      });
    });

    return res.status(200).json({ ok: true, items: items });
  } catch (e) {
    console.error("[crm/bank-details]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
