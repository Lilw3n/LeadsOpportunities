/**
 * Store ventes de leads + dû partenaire (part = % du prix fournisseur).
 */
const { getSql } = require("./db");
const LeadSaleSplit = require("../../js/lead-sale-split-lib.js");

var schemaReady = false;

function newSaleId() {
  return "lsale_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function ensureLeadSalesSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS lead_sales (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        label TEXT,
        vertical TEXT,
        buyer_email TEXT,
        buyer_name TEXT,
        supplier_name TEXT DEFAULT 'Partenaire',
        supplier_price_eur NUMERIC NOT NULL DEFAULT 0,
        partner_share_pct NUMERIC NOT NULL DEFAULT 50,
        partner_due_eur NUMERIC NOT NULL DEFAULT 0,
        sale_price_eur NUMERIC NOT NULL DEFAULT 0,
        you_keep_eur NUMERIC NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        stripe_session_id TEXT,
        payment_url TEXT,
        hide_sale_from_partner BOOLEAN NOT NULL DEFAULT TRUE,
        partner_settled_at TIMESTAMPTZ,
        partner_settled_note TEXT,
        sold_at TIMESTAMPTZ,
        notes TEXT,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_sales_status ON lead_sales(status, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_sales_partner ON lead_sales(partner_settled_at, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lead_sales_stripe ON lead_sales(stripe_session_id)`;
    schemaReady = true;
    return true;
  } catch (e) {
    console.error("[lead-sales-store] schema", e.message);
    return false;
  }
}

function rowToSale(row) {
  if (!row) return null;
  var split = LeadSaleSplit.compute({
    supplierPriceEur: row.supplier_price_eur,
    partnerSharePct: row.partner_share_pct,
    salePriceEur: row.sale_price_eur,
  });
  return {
    id: row.id,
    leadId: row.lead_id || null,
    label: row.label || "",
    vertical: row.vertical || "",
    buyerEmail: row.buyer_email || "",
    buyerName: row.buyer_name || "",
    supplierName: row.supplier_name || "Partenaire",
    supplierPriceEur: split.supplierPriceEur,
    partnerSharePct: split.partnerSharePct,
    partnerDueEur: Number(row.partner_due_eur) || split.partnerDueEur,
    salePriceEur: split.salePriceEur,
    youKeepEur: Number(row.you_keep_eur) || split.youKeepEur,
    status: row.status || "draft",
    stripeSessionId: row.stripe_session_id || null,
    paymentUrl: row.payment_url || null,
    hideSaleFromPartner: row.hide_sale_from_partner !== false,
    partnerSettledAt: row.partner_settled_at || null,
    partnerSettledNote: row.partner_settled_note || "",
    soldAt: row.sold_at || null,
    notes: row.notes || "",
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    partnerView: LeadSaleSplit.partnerView(split),
  };
}

async function listLeadSales(opts) {
  opts = opts || {};
  var sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) {
    return { ok: false, error: "db_unavailable", sales: [], totals: null };
  }
  var limit = Math.min(200, Math.max(1, parseInt(opts.limit, 10) || 100));
  var rows = await sql`
    SELECT * FROM lead_sales
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  var sales = rows.map(rowToSale);
  var totals = {
    partnerDueOpen: 0,
    partnerDueSettled: 0,
    youKeepPaid: 0,
    saleVolumePaid: 0,
    countOpen: 0,
    countPaid: 0,
  };
  sales.forEach(function (s) {
    var owed =
      s.status === "paid" || s.status === "sold_manual" || s.status === "link_sent"
        ? s.partnerDueEur
        : 0;
    if (s.partnerSettledAt) {
      totals.partnerDueSettled = LeadSaleSplit.round2(totals.partnerDueSettled + s.partnerDueEur);
    } else if (owed > 0 && (s.status === "paid" || s.status === "sold_manual")) {
      totals.partnerDueOpen = LeadSaleSplit.round2(totals.partnerDueOpen + s.partnerDueEur);
      totals.countOpen += 1;
    }
    if (s.status === "paid" || s.status === "sold_manual") {
      totals.youKeepPaid = LeadSaleSplit.round2(totals.youKeepPaid + s.youKeepEur);
      totals.saleVolumePaid = LeadSaleSplit.round2(totals.saleVolumePaid + s.salePriceEur);
      totals.countPaid += 1;
    }
  });
  return { ok: true, sales: sales, totals: totals };
}

async function getLeadSale(id) {
  var sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) return null;
  var rows = await sql`SELECT * FROM lead_sales WHERE id = ${id} LIMIT 1`;
  return rowToSale(rows[0] || null);
}

async function createLeadSale(input, createdBy) {
  var sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) {
    return { ok: false, error: "db_unavailable" };
  }
  var split = LeadSaleSplit.compute({
    supplierPriceEur: input.supplierPriceEur,
    partnerSharePct: input.partnerSharePct,
    salePriceEur: input.salePriceEur,
  });
  if (split.salePriceEur <= 0 && split.supplierPriceEur <= 0) {
    return { ok: false, error: "Indiquez au moins un prix fournisseur ou un prix de vente." };
  }
  var id = newSaleId();
  var rows = await sql`
    INSERT INTO lead_sales (
      id, lead_id, label, vertical, buyer_email, buyer_name, supplier_name,
      supplier_price_eur, partner_share_pct, partner_due_eur, sale_price_eur, you_keep_eur,
      status, hide_sale_from_partner, notes, created_by
    ) VALUES (
      ${id},
      ${input.leadId || null},
      ${String(input.label || "Lead professionnel").slice(0, 200)},
      ${String(input.vertical || "").slice(0, 80)},
      ${String(input.buyerEmail || "").slice(0, 200) || null},
      ${String(input.buyerName || "").slice(0, 160) || null},
      ${String(input.supplierName || "Partenaire").slice(0, 120)},
      ${split.supplierPriceEur},
      ${split.partnerSharePct},
      ${split.partnerDueEur},
      ${split.salePriceEur},
      ${split.youKeepEur},
      ${input.status || "draft"},
      ${input.hideSaleFromPartner !== false},
      ${String(input.notes || "").slice(0, 2000) || null},
      ${createdBy || null}
    )
    RETURNING *
  `;
  return { ok: true, sale: rowToSale(rows[0]) };
}

async function updateLeadSale(id, patch) {
  var sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) {
    return { ok: false, error: "db_unavailable" };
  }
  var current = await getLeadSale(id);
  if (!current) return { ok: false, error: "not_found" };

  var supplier =
    patch.supplierPriceEur != null ? patch.supplierPriceEur : current.supplierPriceEur;
  var share = patch.partnerSharePct != null ? patch.partnerSharePct : current.partnerSharePct;
  var sale = patch.salePriceEur != null ? patch.salePriceEur : current.salePriceEur;
  var split = LeadSaleSplit.compute({
    supplierPriceEur: supplier,
    partnerSharePct: share,
    salePriceEur: sale,
  });

  var status = patch.status != null ? String(patch.status) : current.status;
  var soldAt = current.soldAt;
  if ((status === "paid" || status === "sold_manual") && !soldAt) {
    soldAt = new Date().toISOString();
  }
  if (patch.soldAt) soldAt = patch.soldAt;

  var partnerSettledAt = current.partnerSettledAt;
  var partnerSettledNote = current.partnerSettledNote;
  if (patch.partnerSettled === true) {
    partnerSettledAt = new Date().toISOString();
    partnerSettledNote = String(patch.partnerSettledNote || partnerSettledNote || "").slice(0, 500);
  } else if (patch.partnerSettled === false) {
    partnerSettledAt = null;
  }
  if (patch.partnerSettledNote != null && patch.partnerSettled !== true) {
    partnerSettledNote = String(patch.partnerSettledNote).slice(0, 500);
  }

  var rows = await sql`
    UPDATE lead_sales SET
      lead_id = ${patch.leadId !== undefined ? patch.leadId || null : current.leadId},
      label = ${patch.label != null ? String(patch.label).slice(0, 200) : current.label},
      vertical = ${patch.vertical != null ? String(patch.vertical).slice(0, 80) : current.vertical},
      buyer_email = ${
        patch.buyerEmail !== undefined
          ? String(patch.buyerEmail || "").slice(0, 200) || null
          : current.buyerEmail || null
      },
      buyer_name = ${
        patch.buyerName !== undefined
          ? String(patch.buyerName || "").slice(0, 160) || null
          : current.buyerName || null
      },
      supplier_name = ${
        patch.supplierName != null
          ? String(patch.supplierName).slice(0, 120)
          : current.supplierName
      },
      supplier_price_eur = ${split.supplierPriceEur},
      partner_share_pct = ${split.partnerSharePct},
      partner_due_eur = ${split.partnerDueEur},
      sale_price_eur = ${split.salePriceEur},
      you_keep_eur = ${split.youKeepEur},
      status = ${status},
      stripe_session_id = ${
        patch.stripeSessionId !== undefined ? patch.stripeSessionId : current.stripeSessionId
      },
      payment_url = ${patch.paymentUrl !== undefined ? patch.paymentUrl : current.paymentUrl},
      hide_sale_from_partner = ${
        patch.hideSaleFromPartner !== undefined
          ? !!patch.hideSaleFromPartner
          : current.hideSaleFromPartner
      },
      partner_settled_at = ${partnerSettledAt},
      partner_settled_note = ${partnerSettledNote || null},
      sold_at = ${soldAt},
      notes = ${patch.notes !== undefined ? String(patch.notes || "").slice(0, 2000) || null : current.notes || null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return { ok: true, sale: rowToSale(rows[0]) };
}

async function markLeadSalePaidBySession(sessionId, opts) {
  opts = opts || {};
  var sql = getSql();
  if (!sql || !(await ensureLeadSalesSchema(sql))) return null;
  var rows = await sql`
    UPDATE lead_sales SET
      status = 'paid',
      sold_at = COALESCE(sold_at, ${opts.paidAt || new Date().toISOString()}::timestamptz),
      sale_price_eur = COALESCE(${opts.amountEur != null ? Number(opts.amountEur) : null}, sale_price_eur),
      you_keep_eur = ROUND(
        (COALESCE(${opts.amountEur != null ? Number(opts.amountEur) : null}, sale_price_eur) - partner_due_eur)::numeric,
        2
      ),
      updated_at = NOW()
    WHERE stripe_session_id = ${sessionId}
    RETURNING *
  `;
  if (rows[0]) return rowToSale(rows[0]);

  var saleId = opts.leadSaleId || null;
  if (!saleId) return null;
  var byId = await sql`
    UPDATE lead_sales SET
      status = 'paid',
      stripe_session_id = COALESCE(stripe_session_id, ${sessionId}),
      sold_at = COALESCE(sold_at, ${opts.paidAt || new Date().toISOString()}::timestamptz),
      sale_price_eur = COALESCE(${opts.amountEur != null ? Number(opts.amountEur) : null}, sale_price_eur),
      you_keep_eur = ROUND(
        (COALESCE(${opts.amountEur != null ? Number(opts.amountEur) : null}, sale_price_eur) - partner_due_eur)::numeric,
        2
      ),
      updated_at = NOW()
    WHERE id = ${saleId}
    RETURNING *
  `;
  return rowToSale(byId[0] || null);
}

module.exports = {
  ensureLeadSalesSchema,
  listLeadSales,
  getLeadSale,
  createLeadSale,
  updateLeadSale,
  markLeadSalePaidBySession,
  rowToSale,
};
