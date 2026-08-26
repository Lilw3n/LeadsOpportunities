const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");
const { ensureEInvoicingSchema } = require("../ensure-schema");
const einv = require("../e-invoicing");

function isAdmin(user) {
  return user.role === "admin" || effectiveCrmRole({ role: user.role, crm_role: user.crmRole }) === "admin";
}

async function loadSettings(sql) {
  try {
    const rows = await sql`
      SELECT payload FROM e_invoicing_settings WHERE id = 'default' LIMIT 1
    `;
    if (!rows.length) return einv.mergeSettings(null);
    let parsed = rows[0].payload;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        parsed = {};
      }
    }
    return einv.mergeSettings(parsed);
  } catch (e) {
    return einv.mergeSettings(null);
  }
}

async function saveSettings(sql, settings, userId) {
  const payload = JSON.stringify(settings);
  await sql`
    INSERT INTO e_invoicing_settings (id, payload, updated_at, updated_by)
    VALUES ('default', ${payload}, NOW(), ${userId || null})
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by
  `;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  await ensureEInvoicingSchema(sql);

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("sub") || url.searchParams.get("view") || "status";

  if (req.method === "GET" && (action === "status" || action === "summary")) {
    const settings = await loadSettings(sql);
    let receivedCount = 0;
    let issuedCount = 0;
    try {
      const [r] = await sql`SELECT COUNT(*)::int AS c FROM e_invoices_received`;
      receivedCount = r?.c || 0;
      const [i] = await sql`SELECT COUNT(*)::int AS c FROM e_invoices_issued`;
      issuedCount = i?.c || 0;
    } catch (e) {
      /* tables may be creating */
    }
    return res.status(200).json({
      ok: true,
      settings: settings,
      readiness: einv.readiness(settings),
      counts: { received: receivedCount, issued: issuedCount },
      links: {
        officialGuide: "https://www.impots.gouv.fr/facturation-electronique",
        pdpList: "https://www.impots.gouv.fr/liste-des-plateformes-agreees-pdp",
        servicePublic: "https://entreprendre.service-public.gouv.fr/actualites/A15683",
        assistance: "0 806 807 807",
      },
    });
  }

  if (req.method === "GET" && action === "received") {
    try {
      const rows = await sql`
        SELECT * FROM e_invoices_received
        ORDER BY COALESCE(invoice_date, created_at::date) DESC
        LIMIT 200
      `;
      return res.status(200).json({ ok: true, invoices: rows });
    } catch (e) {
      console.error("[e-invoicing received]", e);
      return res.status(500).json({ error: "Erreur lecture factures reçues" });
    }
  }

  if (req.method === "GET" && action === "issued") {
    try {
      const rows = await sql`
        SELECT id, buyer_name, buyer_siren, invoice_number, invoice_date, due_date,
               currency, operation_type, amount_ht, vat_rate, amount_tva, amount_ttc,
               delivery_address, vat_on_debits, line_description, status, contact_id,
               quote_id, notes, created_at, updated_at
        FROM e_invoices_issued
        ORDER BY invoice_date DESC
        LIMIT 200
      `;
      return res.status(200).json({ ok: true, invoices: rows });
    } catch (e) {
      console.error("[e-invoicing issued]", e);
      return res.status(500).json({ error: "Erreur lecture factures émises" });
    }
  }

  if (req.method === "GET" && action === "xml") {
    const id = url.searchParams.get("id");
    if (!id) return res.status(400).json({ error: "id requis" });
    try {
      const rows = await sql`SELECT xml_cii, invoice_number FROM e_invoices_issued WHERE id = ${id} LIMIT 1`;
      if (!rows.length || !rows[0].xml_cii) {
        return res.status(404).json({ error: "XML introuvable" });
      }
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + (rows[0].invoice_number || id) + "-factur-x.xml"'
      );
      return res.status(200).send(rows[0].xml_cii);
    } catch (e) {
      return res.status(500).json({ error: "Erreur export XML" });
    }
  }

  if (req.method === "POST") {
    if (!isAdmin(user)) return res.status(403).json({ error: "Admin requis" });
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error || "JSON invalide" });
    const body = parsed.body || {};
    const postAction = body.action || action;

    if (postAction === "save-settings") {
      const current = await loadSettings(sql);
      const next = einv.mergeSettings(
        Object.assign({}, current, body.settings || {}, {
          checklist: Object.assign({}, current.checklist, (body.settings && body.settings.checklist) || {}),
          emitDeadline: einv.emitDeadlineForSize(
            (body.settings && body.settings.companySize) || current.companySize
          ),
        })
      );
      if (next.pdpStatus === "designated" || next.pdpStatus === "active") {
        if (!next.pdpDesignatedAt) next.pdpDesignatedAt = new Date().toISOString();
        next.checklist.designatedReceptionPlatform = true;
        next.checklist.chosenPdpOrAccountingTool = true;
      }
      await saveSettings(sql, next, user.id || user.email);
      return res.status(200).json({ ok: true, settings: next, readiness: einv.readiness(next) });
    }

    if (postAction === "register-received") {
      const id = "eir_" + crypto.randomBytes(8).toString("hex");
      const amountHt = body.amountHt != null ? Number(body.amountHt) : null;
      const amountTva = body.amountTva != null ? Number(body.amountTva) : null;
      const amountTtc =
        body.amountTtc != null
          ? Number(body.amountTtc)
          : amountHt != null && amountTva != null
            ? amountHt + amountTva
            : null;
      try {
        await sql`
          INSERT INTO e_invoices_received (
            id, supplier_name, supplier_siren, invoice_number, invoice_date, due_date,
            currency, amount_ht, amount_tva, amount_ttc, format, pdp_status, channel, notes,
            payload, created_by
          ) VALUES (
            ${id},
            ${body.supplierName || null},
            ${einv.digitsOnly(body.supplierSiren) || null},
            ${body.invoiceNumber || null},
            ${body.invoiceDate || null},
            ${body.dueDate || null},
            ${body.currency || "EUR"},
            ${amountHt},
            ${amountTva},
            ${amountTtc},
            ${body.format || "unknown"},
            ${body.pdpStatus || "manual"},
            ${body.channel || "email_pdf"},
            ${body.notes || null},
            ${JSON.stringify(body.payload || {})},
            ${user.id || user.email || null}
          )
        `;
        return res.status(200).json({ ok: true, id: id });
      } catch (e) {
        console.error("[e-invoicing register-received]", e);
        return res.status(500).json({ error: "Erreur enregistrement" });
      }
    }

    if (postAction === "issue") {
      const settings = await loadSettings(sql);
      const check = einv.validateIssuePayload(body, settings);
      if (!check.ok) return res.status(400).json({ ok: false, errors: check.errors });

      let invoiceNumber = String(body.invoiceNumber || "").trim();
      if (body.autoNumber) {
        const existing = await sql`SELECT invoice_number FROM e_invoices_issued`;
        invoiceNumber = einv.nextInvoiceNumber(
          "FAC",
          existing.map(function (r) {
            return r.invoice_number;
          })
        );
      }

      const ht = Number(body.amountHt);
      const vatRate = body.vatRate != null ? Number(body.vatRate) : 20;
      const tva = body.amountTva != null ? Number(body.amountTva) : (ht * vatRate) / 100;
      const ttc = body.amountTtc != null ? Number(body.amountTtc) : ht + tva;
      const invoice = {
        invoiceNumber: invoiceNumber,
        invoiceDate: body.invoiceDate || einv.isoDate(new Date()),
        dueDate: body.dueDate || null,
        buyerName: body.buyerName,
        buyerSiren: einv.digitsOnly(body.buyerSiren),
        operationType: body.operationType || "services",
        amountHt: ht,
        vatRate: vatRate,
        amountTva: tva,
        amountTtc: ttc,
        deliveryAddress: body.deliveryAddress || "",
        vatOnDebits: !!body.vatOnDebits,
        lineDescription: body.lineDescription || "Honoraires / prestation",
        currency: body.currency || "EUR",
      };
      const xml = einv.buildCiiXml(invoice, settings);
      const mentions = einv.buildMandatoryMentions(invoice, settings);
      const id = "eis_" + crypto.randomBytes(8).toString("hex");
      try {
        await sql`
          INSERT INTO e_invoices_issued (
            id, buyer_name, buyer_siren, invoice_number, invoice_date, due_date, currency,
            operation_type, amount_ht, vat_rate, amount_tva, amount_ttc, delivery_address,
            vat_on_debits, line_description, status, xml_cii, contact_id, quote_id, notes, created_by
          ) VALUES (
            ${id},
            ${invoice.buyerName},
            ${invoice.buyerSiren},
            ${invoice.invoiceNumber},
            ${invoice.invoiceDate},
            ${invoice.dueDate},
            ${invoice.currency},
            ${invoice.operationType},
            ${invoice.amountHt},
            ${invoice.vatRate},
            ${invoice.amountTva},
            ${invoice.amountTtc},
            ${invoice.deliveryAddress || null},
            ${invoice.vatOnDebits},
            ${invoice.lineDescription},
            ${body.status || "draft"},
            ${xml},
            ${body.contactId || null},
            ${body.quoteId || null},
            ${body.notes || null},
            ${user.id || user.email || null}
          )
        `;
        return res.status(200).json({
          ok: true,
          id: id,
          invoiceNumber: invoice.invoiceNumber,
          mentions: mentions,
          xmlPreview: xml.slice(0, 500),
          downloadPath: "/api/crm/e-invoicing?sub=xml&id=" + id,
          warning:
            "Un XML Factur-X seul ne suffit pas : transmission via une plateforme agréée (PDP) obligatoire pour être conforme.",
        });
      } catch (e) {
        console.error("[e-invoicing issue]", e);
        if (String(e.message || "").indexOf("unique") !== -1 || String(e.code) === "23505") {
          return res.status(409).json({ error: "Numéro de facture déjà utilisé" });
        }
        return res.status(500).json({ error: "Erreur création facture" });
      }
    }

    return res.status(400).json({ error: "Action inconnue" });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
