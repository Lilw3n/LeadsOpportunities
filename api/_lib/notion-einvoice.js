/**
 * Sync facturation → Notion (API gratuite via Internal Integration).
 * Env : NOTION_TOKEN + NOTION_EINVOICE_DATABASE_ID
 * Alternative 0 € sans token : Make → module Notion (docs/NOTION-EINVOICE.md).
 */
const NOTION_VERSION = "2022-06-28";

function getNotionToken() {
  return String(process.env.NOTION_TOKEN || process.env.NOTION_API_KEY || "").trim();
}

function getNotionDatabaseId() {
  return String(process.env.NOTION_EINVOICE_DATABASE_ID || process.env.NOTION_DATABASE_ID || "")
    .trim()
    .replace(/-/g, "");
}

function configured() {
  return !!(getNotionToken() && getNotionDatabaseId());
}

function titleProp(content) {
  return { title: [{ type: "text", text: { content: String(content || "").slice(0, 2000) } }] };
}

function richText(content) {
  return { rich_text: [{ type: "text", text: { content: String(content || "").slice(0, 2000) } }] };
}

function numberProp(n) {
  var x = Number(n);
  return { number: Number.isFinite(x) ? x : null };
}

function selectProp(name) {
  if (!name) return { select: null };
  return { select: { name: String(name).slice(0, 100) } };
}

function dateProp(iso) {
  if (!iso) return { date: null };
  return { date: { start: String(iso).slice(0, 10) } };
}

function checkboxProp(v) {
  return { checkbox: !!v };
}

/**
 * Schéma attendu (noms de propriétés Notion — à créer une fois).
 * Voir data/notion/einvoice-database-schema.json
 */
function buildPageProperties(event, data) {
  var d = data || {};
  var title =
    d.invoiceNumber ||
    d.supplierName ||
    d.buyerName ||
    event ||
    "Facture LO";
  return {
    Nom: titleProp(title),
    Type: selectProp(
      event === "invoice_received_registered" || event === "tiime_supplier_invoice"
        ? "Reçue"
        : event === "invoice_issued"
          ? "Émise"
          : "Sync"
    ),
    "N° facture": richText(d.invoiceNumber || ""),
    Client: richText(d.buyerName || d.supplierName || ""),
    SIREN: richText(d.buyerSiren || d.supplierSiren || ""),
    "Montant HT": numberProp(d.amountHt),
    "Montant TTC": numberProp(d.amountTtc),
    Date: dateProp(d.invoiceDate || new Date().toISOString()),
    Canal: selectProp(d.channel || (event === "invoice_issued" ? "crm" : "make")),
    Statut: selectProp(d.status || "brouillon"),
    "Via Make": checkboxProp(!!d.viaMake),
    Notes: richText(d.notes || d.lineDescription || ""),
  };
}

async function createDatabaseItem(event, data) {
  if (!configured()) {
    return { ok: false, skipped: true, reason: "NOTION_TOKEN / NOTION_EINVOICE_DATABASE_ID manquants" };
  }
  var dbId = getNotionDatabaseId();
  // Notion IDs often with dashes — restore if stripped to 32 hex
  if (dbId.length === 32) {
    dbId =
      dbId.slice(0, 8) +
      "-" +
      dbId.slice(8, 12) +
      "-" +
      dbId.slice(12, 16) +
      "-" +
      dbId.slice(16, 20) +
      "-" +
      dbId.slice(20);
  }
  var body = {
    parent: { database_id: dbId },
    properties: buildPageProperties(event, data),
  };
  try {
    var ctrl = new AbortController();
    var timer = setTimeout(function () {
      ctrl.abort();
    }, 10000);
    var res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getNotionToken(),
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    var json = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) {
      return {
        ok: false,
        skipped: false,
        status: res.status,
        error: json.message || json.code || "Notion API error",
        bodyPreview: JSON.stringify(json).slice(0, 300),
      };
    }
    return { ok: true, skipped: false, pageId: json.id, url: json.url || null };
  } catch (e) {
    return { ok: false, skipped: false, error: e.message || String(e) };
  }
}

async function dispatchToNotion(event, data) {
  return createDatabaseItem(event, data);
}

module.exports = {
  NOTION_VERSION,
  getNotionToken,
  getNotionDatabaseId,
  configured,
  buildPageProperties,
  createDatabaseItem,
  dispatchToNotion,
};
