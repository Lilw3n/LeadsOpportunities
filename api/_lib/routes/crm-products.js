/**
 * GET/POST/PATCH/DELETE /api/crm/products — catalogue produits CRM fiable.
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, sanitizeEnum } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

const STATUSES = ["draft", "verified", "disabled"];

function parseAudience(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function rowToProduct(row) {
  let audience = [];
  try {
    audience = row.audience ? JSON.parse(row.audience) : [];
  } catch {
    audience = [];
  }
  return {
    id: row.id,
    name: row.name,
    category: row.category || "",
    type: row.product_type || "",
    status: row.status || "draft",
    description: row.description || "",
    price: row.indicative_price_eur == null ? null : Number(row.indicative_price_eur),
    commission: row.commission_rate == null ? null : Number(row.commission_rate),
    audience,
    internalNotes: row.internal_notes || "",
    validatedAt: row.validated_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeBody(body) {
  const status = sanitizeEnum(body.status || "draft", STATUSES, "draft");
  const price =
    body.price === "" || body.price == null ? null : Number(String(body.price).replace(",", "."));
  const commission =
    body.commission === "" || body.commission == null ? null : Number(String(body.commission).replace(",", "."));
  return {
    name: String(body.name || "").trim().slice(0, 180),
    category: String(body.category || "").trim().slice(0, 80) || null,
    productType: String(body.type || body.product_type || "").trim().slice(0, 80) || null,
    status,
    description: String(body.description || "").trim().slice(0, 2000) || null,
    price: Number.isFinite(price) ? price : null,
    commission: Number.isFinite(commission) ? commission : null,
    audience: parseAudience(body.audience),
    internalNotes: String(body.internalNotes || body.internal_notes || "").trim().slice(0, 4000) || null,
    validatedAt: status === "verified" ? body.validatedAt || body.validated_at || new Date().toISOString() : null,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT *
        FROM crm_products
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 500
      `;
      return res.status(200).json({ ok: true, products: rows.map(rowToProduct) });
    } catch (e) {
      if (e.code === "42P01") return res.status(200).json({ ok: true, products: [] });
      console.error("[crm/products GET]", e);
      return res.status(500).json({ error: "Erreur chargement catalogue" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req, 65536);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const product = normalizeBody(parsed.body || {});
    if (!product.name) return res.status(400).json({ error: "Nom produit requis" });
    const productId = "prd_" + crypto.randomUUID();
    try {
      await sql`
        INSERT INTO crm_products (
          id, name, category, product_type, status, description,
          indicative_price_eur, commission_rate, audience, internal_notes,
          validated_at, created_by, updated_by
        ) VALUES (
          ${productId}, ${product.name}, ${product.category}, ${product.productType}, ${product.status}, ${product.description},
          ${product.price}, ${product.commission}, ${JSON.stringify(product.audience)}, ${product.internalNotes},
          ${product.validatedAt}, ${user.id}, ${user.id}
        )
      `;
      return res.status(201).json({ ok: true, id: productId });
    } catch (e) {
      console.error("[crm/products POST]", e);
      return res.status(500).json({ error: "Erreur creation produit" });
    }
  }

  if (req.method === "PATCH") {
    if (!id) return res.status(400).json({ error: "id requis" });
    const parsed = parseJsonBody(req, 65536);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const product = normalizeBody(parsed.body || {});
    if (!product.name) return res.status(400).json({ error: "Nom produit requis" });
    try {
      await sql`
        UPDATE crm_products
        SET name = ${product.name},
            category = ${product.category},
            product_type = ${product.productType},
            status = ${product.status},
            description = ${product.description},
            indicative_price_eur = ${product.price},
            commission_rate = ${product.commission},
            audience = ${JSON.stringify(product.audience)},
            internal_notes = ${product.internalNotes},
            validated_at = ${product.validatedAt},
            updated_by = ${user.id},
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/products PATCH]", e);
      return res.status(500).json({ error: "Erreur modification produit" });
    }
  }

  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "id requis" });
    try {
      await sql`DELETE FROM crm_products WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/products DELETE]", e);
      return res.status(500).json({ error: "Erreur suppression produit" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
