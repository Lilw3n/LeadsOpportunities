/**
 * GET/POST/PATCH /api/crm/lead-sales — ventes de leads + dû partenaire.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const LeadSaleSplit = require("../../../js/lead-sale-split-lib.js");
const {
  listLeadSales,
  getLeadSale,
  createLeadSale,
  updateLeadSale,
} = require("../lead-sales-store");

const STATUSES = ["draft", "link_sent", "paid", "sold_manual", "cancelled"];

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const id = url.searchParams.get("id");
    if (id) {
      const sale = await getLeadSale(id);
      if (!sale) return res.status(404).json({ error: "Vente introuvable" });
      return res.status(200).json({ ok: true, sale: sale });
    }
    const result = await listLeadSales({
      limit: url.searchParams.get("limit") || 100,
    });
    if (!result.ok) return res.status(500).json({ error: result.error || "Erreur" });
    return res.status(200).json({
      ok: true,
      sales: result.sales,
      totals: result.totals,
      example: LeadSaleSplit.compute({
        supplierPriceEur: 80,
        partnerSharePct: 50,
        salePriceEur: 180,
      }),
    });
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const created = await createLeadSale(body, user.id || user.email);
    if (!created.ok) return res.status(400).json({ error: created.error });
    return res.status(201).json({ ok: true, sale: created.sale });
  }

  if (req.method === "PATCH") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const id = body.id || new URL(req.url, "http://localhost").searchParams.get("id");
    if (!id) return res.status(400).json({ error: "id requis" });
    if (body.status && STATUSES.indexOf(body.status) === -1) {
      return res.status(400).json({ error: "Statut invalide" });
    }
    const updated = await updateLeadSale(id, body);
    if (!updated.ok) {
      return res.status(updated.error === "not_found" ? 404 : 400).json({
        error: updated.error === "not_found" ? "Vente introuvable" : updated.error,
      });
    }
    return res.status(200).json({ ok: true, sale: updated.sale });
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
};
