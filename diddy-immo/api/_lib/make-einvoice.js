/**
 * Pont Make.com ↔ CRM facturation électronique (parcours 0 €).
 * Outbound : CRM → webhook Make custom.
 * Inbound : Make → /api/webhooks/make-einvoice (événements Tiime / Drive / manuel).
 */
const crypto = require("crypto");

function getMakeOutboundUrl() {
  return String(process.env.MAKE_EINVOICE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || "").trim();
}

function getMakeInboundSecret() {
  return String(process.env.MAKE_EINVOICE_WEBHOOK_SECRET || process.env.MAKE_WEBHOOK_SECRET || "").trim();
}

function buildOutboundPayload(event, data) {
  return {
    source: "leads-opportunities",
    module: "e-invoicing",
    event: event,
    sentAt: new Date().toISOString(),
    freePath: true,
    tiimeHint:
      "Parcours 0€ : créer / coller la facture dans Tiime Free (PA). Module Make « Tiime Apps » = offre Business (essai possible).",
    data: data || {},
  };
}

async function dispatchToMake(event, data) {
  const url = getMakeOutboundUrl();
  if (!url) {
    return { ok: false, skipped: true, reason: "MAKE_EINVOICE_WEBHOOK_URL non configuré" };
  }
  const payload = buildOutboundPayload(event, data);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () {
      ctrl.abort();
    }, 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-LO-Module": "e-invoicing" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const text = await res.text().catch(function () {
      return "";
    });
    return {
      ok: res.ok,
      status: res.status,
      bodyPreview: String(text || "").slice(0, 200),
      skipped: false,
    };
  } catch (e) {
    return { ok: false, skipped: false, error: e.message || String(e) };
  }
}

function normalizeInboundEvent(body) {
  const b = body && typeof body === "object" ? body : {};
  const event = String(b.event || b.type || b.action || "tiime_sync").toLowerCase();
  return {
    event: event,
    tiimeInvoiceId: b.tiimeInvoiceId || b.tiime_invoice_id || b.invoiceId || null,
    invoiceNumber: b.invoiceNumber || b.invoice_number || b.number || null,
    direction: b.direction || (event.indexOf("receiv") >= 0 ? "received" : "issued"),
    supplierName: b.supplierName || b.supplier_name || b.vendor || null,
    supplierSiren: b.supplierSiren || b.supplier_siren || null,
    buyerName: b.buyerName || b.buyer_name || b.customer || null,
    buyerSiren: b.buyerSiren || b.buyer_siren || null,
    amountHt: b.amountHt != null ? Number(b.amountHt) : b.amount_ht != null ? Number(b.amount_ht) : null,
    amountTva: b.amountTva != null ? Number(b.amountTva) : null,
    amountTtc: b.amountTtc != null ? Number(b.amountTtc) : b.amount_ttc != null ? Number(b.amount_ttc) : null,
    invoiceDate: b.invoiceDate || b.invoice_date || null,
    status: b.status || "synced",
    channel: b.channel || "make_tiime",
    notes: b.notes || b.message || null,
    raw: b,
  };
}

function newSyncId() {
  return "ems_" + crypto.randomBytes(8).toString("hex");
}

module.exports = {
  getMakeOutboundUrl,
  getMakeInboundSecret,
  buildOutboundPayload,
  dispatchToMake,
  normalizeInboundEvent,
  newSyncId,
};
