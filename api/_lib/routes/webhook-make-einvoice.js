/**
 * POST /api/webhooks/make-einvoice
 * Make.com → CRM : sync factures Tiime / Drive / saisie manuelle (parcours 0 €).
 * Auth : Bearer MAKE_EINVOICE_WEBHOOK_SECRET (ou query ?secret=)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, safeEqual, readRawBody } = require("../security");
const { getSql } = require("../db");
const { ensureEInvoicingSchema } = require("../ensure-schema");
const make = require("../make-einvoice");
const einv = require("../e-invoicing");

async function parseBody(req) {
  var parsed = parseJsonBody(req, 65536);
  if (!parsed.error) return parsed.body || {};
  try {
    var raw = await readRawBody(req, 65536);
    return JSON.parse(raw.toString("utf8"));
  } catch (e) {
    return null;
  }
}

function authOk(req, body) {
  const expected = make.getMakeInboundSecret();
  if (!expected) return { ok: false, error: "MAKE_EINVOICE_WEBHOOK_SECRET non configure" };
  const header = String(req.headers.authorization || "");
  const bearer = header.toLowerCase().indexOf("bearer ") === 0 ? header.slice(7).trim() : "";
  const q = new URL(req.url, "http://localhost").searchParams.get("secret") || "";
  const fromBody = body && (body.secret || body.token) ? String(body.secret || body.token) : "";
  const provided = bearer || q || fromBody;
  if (!provided || !safeEqual(provided, expected)) return { ok: false, error: "Unauthorized" };
  return { ok: true };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "make-einvoice",
      hint: "POST JSON events from Make.com (Tiime Free / Drive / manuel)",
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("make-einvoice:" + ip, 60, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Rate limit" });

  const body = await parseBody(req);
  if (!body) return res.status(400).json({ error: "JSON invalide" });

  const auth = authOk(req, body);
  if (!auth.ok) return res.status(401).json({ error: auth.error });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensureEInvoicingSchema(sql);

  const evt = make.normalizeInboundEvent(body);
  const syncId = make.newSyncId();

  try {
    await sql`
      INSERT INTO e_invoice_make_sync (
        id, direction, event, external_id, invoice_number, payload, status, created_at
      ) VALUES (
        ${syncId},
        ${evt.direction},
        ${evt.event},
        ${evt.tiimeInvoiceId},
        ${evt.invoiceNumber},
        ${JSON.stringify(evt.raw)},
        ${"received"},
        NOW()
      )
    `;
  } catch (e) {
    console.error("[make-einvoice] sync insert", e);
  }

  if (evt.direction === "received" || evt.event.indexOf("receiv") >= 0 || evt.event === "tiime_supplier_invoice") {
    const id = "eir_" + require("crypto").randomBytes(8).toString("hex");
    try {
      await sql`
        INSERT INTO e_invoices_received (
          id, supplier_name, supplier_siren, invoice_number, invoice_date,
          currency, amount_ht, amount_tva, amount_ttc, format, pdp_status, channel, notes, payload, created_by
        ) VALUES (
          ${id},
          ${evt.supplierName},
          ${einv.digitsOnly(evt.supplierSiren) || null},
          ${evt.invoiceNumber},
          ${evt.invoiceDate},
          ${"EUR"},
          ${evt.amountHt},
          ${evt.amountTva},
          ${evt.amountTtc},
          ${"factur-x"},
          ${"pdp"},
          ${evt.channel},
          ${evt.notes || "Import Make/Tiime"},
          ${JSON.stringify({ makeSyncId: syncId, tiimeInvoiceId: evt.tiimeInvoiceId, raw: evt.raw })},
          ${"make"}
        )
      `;
      return res.status(200).json({ ok: true, action: "received_registered", id: id, syncId: syncId });
    } catch (e) {
      console.error("[make-einvoice] received", e);
      return res.status(500).json({ error: "Erreur enregistrement reçu", syncId: syncId });
    }
  }

  if (evt.event === "tiime_status" || evt.event === "pdp_active" || evt.event === "tiime_account_ready") {
    try {
      const rows = await sql`SELECT payload FROM e_invoicing_settings WHERE id = 'default' LIMIT 1`;
      let current = {};
      if (rows.length) {
        try {
          current = typeof rows[0].payload === "string" ? JSON.parse(rows[0].payload) : rows[0].payload || {};
        } catch (e) {
          current = {};
        }
      }
      const next = einv.mergeSettings(
        Object.assign({}, current, {
          pdpName: current.pdpName || "Tiime",
          pdpStatus: body.pdpStatus || "active",
          pdpDesignatedAt: current.pdpDesignatedAt || new Date().toISOString(),
          stackPrimaryPdp: "tiime",
          tiimeAccountEmail: body.tiimeAccountEmail || current.tiimeAccountEmail || null,
          makeConnectedAt: new Date().toISOString(),
          checklist: Object.assign({}, current.checklist || {}, {
            chosenPdpOrAccountingTool: true,
            designatedReceptionPlatform: true,
          }),
        })
      );
      await sql`
        INSERT INTO e_invoicing_settings (id, payload, updated_at, updated_by)
        VALUES ('default', ${JSON.stringify(next)}, NOW(), 'make')
        ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW(), updated_by = 'make'
      `;
      return res.status(200).json({ ok: true, action: "settings_updated", syncId: syncId, readiness: einv.readiness(next) });
    } catch (e) {
      console.error("[make-einvoice] settings", e);
      return res.status(500).json({ error: "Erreur maj settings", syncId: syncId });
    }
  }

  return res.status(200).json({
    ok: true,
    action: "logged",
    syncId: syncId,
    event: evt.event,
    hint: "Événement journalisé. Utilisez event=tiime_supplier_invoice ou direction=received pour créer une facture reçue.",
  });
};
