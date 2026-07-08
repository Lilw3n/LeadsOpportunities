const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function quarterLabel(d) {
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return "Non daté";
  var q = Math.floor(dt.getMonth() / 3) + 1;
  return dt.getFullYear() + " Q" + q;
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
    const contracts = await sql`
      SELECT ct.*, c.first_name, c.last_name, c.email AS contact_email
      FROM crm_contracts ct
      INNER JOIN crm_contacts c ON c.id = ct.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY ct.start_date DESC NULLS LAST
      LIMIT 500
    `;

    var byPeriod = {};
    contracts.forEach(function (ct) {
      var key = quarterLabel(ct.start_date || ct.created_at);
      if (!byPeriod[key]) {
        byPeriod[key] = {
          id: key,
          name: "Période " + key,
          contracts: 0,
          totalPremium: 0,
          claims: 0,
          status: "Active",
        };
      }
      byPeriod[key].contracts += 1;
      byPeriod[key].totalPremium += Number(ct.premium) || 0;
    });

    var expiring = contracts
      .filter(function (ct) {
        if (!ct.end_date) return false;
        var end = new Date(ct.end_date);
        var now = new Date();
        var in90 = new Date();
        in90.setDate(in90.getDate() + 90);
        return end >= now && end <= in90;
      })
      .map(function (ct) {
        return {
          id: ct.id,
          contactId: ct.contact_id,
          contactName: ((ct.first_name || "") + " " + (ct.last_name || "")).trim() || ct.contact_email,
          insurer: ct.insurer,
          endDate: ct.end_date,
          premium: ct.premium,
          policyNumber: ct.policy_number,
        };
      });

    var periods = Object.keys(byPeriod)
      .sort()
      .reverse()
      .map(function (k) {
        return byPeriod[k];
      });

    return res.status(200).json({ ok: true, periods: periods, expiring: expiring });
  } catch (e) {
    console.error("[crm/periods]", e);
    return res.status(200).json({ ok: true, partial: true, periods: [], expiring: [] });
  }
};
