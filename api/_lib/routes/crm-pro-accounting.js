const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");

function isAdmin(user) {
  return user.role === "admin" || effectiveCrmRole({ role: user.role, crm_role: user.crmRole }) === "admin";
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("action") || "summary";

  if (req.method === "GET" && action === "summary") {
    try {
      const expenses = await sql`
        SELECT category, SUM(amount_eur)::float AS total
        FROM pro_expenses
        GROUP BY category
        ORDER BY total DESC
      `;
      const revenue = await sql`
        SELECT COALESCE(SUM(amount_eur), 0)::float AS total FROM pro_revenue
      `;
      const expenseTotal = await sql`
        SELECT COALESCE(SUM(amount_eur), 0)::float AS total FROM pro_expenses
      `;
      return res.status(200).json({
        ok: true,
        expensesByCategory: expenses,
        revenueTotal: revenue[0]?.total || 0,
        expenseTotal: expenseTotal[0]?.total || 0,
        margin: (revenue[0]?.total || 0) - (expenseTotal[0]?.total || 0),
      });
    } catch (e) {
      console.error("[crm/pro-accounting summary]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "GET" && action === "export") {
    const month = url.searchParams.get("month");
    try {
      const rows = await sql`
        SELECT category, amount_eur, expense_date, vendor, notes, tax_deductible
        FROM pro_expenses
        WHERE (${month}::text IS NULL OR TO_CHAR(expense_date, 'YYYY-MM') = ${month})
        ORDER BY expense_date DESC
      `;
      var csv =
        "category,amount_eur,expense_date,vendor,notes,tax_deductible\n" +
        rows
          .map(function (r) {
            return [
              r.category,
              r.amount_eur,
              r.expense_date,
              (r.vendor || "").replace(/,/g, " "),
              (r.notes || "").replace(/,/g, " "),
              r.tax_deductible,
            ].join(",");
          })
          .join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="expenses.csv"');
      return res.status(200).send(csv);
    } catch (e) {
      return res.status(500).json({ error: "Erreur export" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const type = body.type || "expense";

    try {
      if (type === "expense") {
        const id = "exp_" + crypto.randomUUID();
        await sql`
          INSERT INTO pro_expenses (
            id, category, amount_eur, expense_date, vendor, notes, tax_deductible, created_by
          ) VALUES (
            ${id},
            ${String(body.category || "autre").slice(0, 40)},
            ${Number(body.amountEur)},
            ${body.expenseDate || new Date().toISOString().slice(0, 10)},
            ${body.vendor || null},
            ${body.notes || null},
            ${body.taxDeductible !== false},
            ${user.id}
          )
        `;
        return res.status(201).json({ ok: true, id });
      }
      if (type === "revenue") {
        const id = "rev_" + crypto.randomUUID();
        await sql`
          INSERT INTO pro_revenue (
            id, source, amount_eur, revenue_date, stripe_session_id, quote_id, contact_id, notes
          ) VALUES (
            ${id},
            ${body.source || "manual"},
            ${Number(body.amountEur)},
            ${body.revenueDate || new Date().toISOString().slice(0, 10)},
            ${body.stripeSessionId || null},
            ${body.quoteId || null},
            ${body.contactId || null},
            ${body.notes || null}
          )
        `;
        return res.status(201).json({ ok: true, id });
      }
      return res.status(400).json({ error: "type invalide" });
    } catch (e) {
      console.error("[crm/pro-accounting POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
