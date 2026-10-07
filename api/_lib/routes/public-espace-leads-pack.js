/**
 * GET /api/espace-leads-pack?token= — fiche pack acheteur (sans prix fournisseur / dû partenaire).
 */
const { applyApiGuards } = require("../security");
const { getSql } = require("../db");
const { ensureLeadSalesSchema } = require("../lead-sales-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = new URL(req.url, "http://localhost");
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token || token.length < 8) {
    return res.status(400).json({ error: "Token invalide" });
  }

  const sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) {
    return res.status(500).json({ error: "Service indisponible" });
  }

  try {
    const rows = await sql`
      SELECT id, label, vertical, buyer_email, sale_price_eur, status, payment_url,
             portal_token, product_label, sold_at, created_at
      FROM lead_sales
      WHERE portal_token = ${token}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Pack introuvable" });

    return res.status(200).json({
      ok: true,
      pack: {
        id: row.id,
        token: row.portal_token,
        title: row.product_label || row.label || "Accès Espace Leads",
        vertical: row.vertical || "",
        buyerEmailHint: row.buyer_email
          ? String(row.buyer_email).replace(/(.{2}).+(@.+)/, "$1***$2")
          : "",
        buyerEmailRequired: !!row.buyer_email,
        amountEur: Number(row.sale_price_eur) || 0,
        status: row.status,
        paymentUrl: row.status === "paid" || row.status === "sold_manual" ? null : row.payment_url,
        unlocked: row.status === "paid" || row.status === "sold_manual",
        soldAt: row.sold_at,
        createdAt: row.created_at,
      },
    });
  } catch (e) {
    console.error("[espace-leads-pack]", e.message);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
