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

  try {
    const contracts = await sql`
      SELECT ct.premium, ct.status FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
    `;

    var totalRevenue = 0;
    var pendingReceivables = 0;
    var activeCount = 0;
    contracts.forEach(function (ct) {
      var p = Number(ct.premium) || 0;
      totalRevenue += p;
      var st = String(ct.status || "").toLowerCase();
      if (st.indexOf("attente") >= 0 || st === "pending") pendingReceivables += p;
      if (st.indexOf("cours") >= 0 || st === "active" || st === "actif") activeCount += 1;
    });

    const [quotesPending] = await sql`
      SELECT COUNT(*)::int AS c FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND q.status NOT IN ('signe', 'refuse', 'annule')
    `;

    return res.status(200).json({
      ok: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 12),
        monthlyRevenue: Math.round(totalRevenue),
        pendingReceivables: Math.round(pendingReceivables),
        activeContracts: activeCount,
        quotesPending: quotesPending.c,
        netProfit: Math.round(totalRevenue * 0.15),
      },
    });
  } catch (e) {
    console.error("[crm/financial-overview]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
