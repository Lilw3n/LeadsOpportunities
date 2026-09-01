const { applyApiGuards, rateLimit, getClientIp, parseJsonBody } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { getSql } = require("../db");
const { ensureESignatureSchema } = require("../e-signature-store");

function newId() {
  return (
    "esig_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 10)
  );
}

function newToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

function publicUrl(token) {
  var base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.PUBLIC_SITE_URL ||
    "https://www.leadsopportunities.fr";
  return String(base).replace(/\/$/, "") + "/landings/signature-electronique.html?t=" + encodeURIComponent(token);
}

function mapRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    token: r.token,
    title: r.title,
    bodyText: r.body_text,
    signerName: r.signer_name,
    signerEmail: r.signer_email,
    status: r.status,
    signatureDataUrl: r.signature_data_url,
    signedAt: r.signed_at,
    signerIp: r.signer_ip,
    signerUa: r.signer_ua,
    consent: !!r.consent,
    createdBy: r.created_by,
    leadId: r.lead_id,
    contactId: r.contact_id,
    meta: r.meta || {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    signUrl: r.token ? publicUrl(r.token) : null,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ ok: false, error: "DATABASE_URL manquant" });
  }

  try {
    await ensureESignatureSchema(sql);
  } catch (e) {
    console.error("[e-signature] schema", e);
    return res.status(500).json({ ok: false, error: "Schema signature impossible" });
  }

  var action = String(req.query.action || "").toLowerCase();
  if (!action && req.url) {
    var m = String(req.url).match(/[?&]action=([^&]+)/);
    if (m) action = decodeURIComponent(m[1]).toLowerCase();
  }

  // ——— Public : lire une demande par token ———
  if (action === "public-get" && req.method === "GET") {
    var token = String(req.query.token || "").trim();
    if (!token) return res.status(400).json({ ok: false, error: "token manquant" });
    const rows = await sql`
      SELECT id, token, title, body_text, signer_name, signer_email, status,
             signature_data_url, signed_at, consent, created_at,
             signer_ip, signer_ua
      FROM e_signature_requests WHERE token = ${token} LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ ok: false, error: "Lien invalide ou expiré" });
    var row = rows[0];
    return res.status(200).json({
      ok: true,
      request: {
        id: row.id,
        title: row.title,
        bodyText: row.body_text,
        signerName: row.signer_name,
        signerEmail: row.signer_email,
        status: row.status,
        signedAt: row.signed_at,
        consent: !!row.consent,
        hasSignature: !!row.signature_data_url,
        signatureDataUrl: row.status === "signed" ? row.signature_data_url : null,
        signerIp: row.status === "signed" ? row.signer_ip : null,
        signerUa: row.status === "signed" ? row.signer_ua : null,
        createdAt: row.created_at,
      },
    });
  }

  // ——— Public : signer ———
  if (action === "public-sign" && req.method === "POST") {
    const rl = rateLimit("esig-sign:" + getClientIp(req), 30, 60 * 60 * 1000);
    if (!rl.allowed) {
      return res.status(429).json({ ok: false, error: "Trop de tentatives. Réessayez plus tard." });
    }
    const parsed = parseJsonBody(req, 900000);
    if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
    const body = parsed.body || {};
    var tok = String(body.token || "").trim();
    var signerName = String(body.signerName || "").trim().slice(0, 120);
    var signerEmail = String(body.signerEmail || "").trim().slice(0, 160);
    var signatureDataUrl = String(body.signatureDataUrl || "").trim();
    var consent = !!body.consent;

    if (!tok) return res.status(400).json({ ok: false, error: "token manquant" });
    if (!signerName) return res.status(400).json({ ok: false, error: "Nom du signataire requis" });
    if (!consent) return res.status(400).json({ ok: false, error: "Consentement requis" });
    if (!signatureDataUrl || signatureDataUrl.indexOf("data:image/") !== 0) {
      return res.status(400).json({ ok: false, error: "Signature invalide" });
    }
    if (signatureDataUrl.length > 800000) {
      return res.status(400).json({ ok: false, error: "Signature trop volumineuse" });
    }

    const existing = await sql`
      SELECT id, status FROM e_signature_requests WHERE token = ${tok} LIMIT 1
    `;
    if (!existing.length) return res.status(404).json({ ok: false, error: "Lien invalide" });
    if (existing[0].status === "signed") {
      return res.status(409).json({ ok: false, error: "Document déjà signé" });
    }
    if (existing[0].status === "cancelled") {
      return res.status(410).json({ ok: false, error: "Demande annulée" });
    }

    const ip = getClientIp(req);
    const ua = String(req.headers["user-agent"] || "").slice(0, 250);
    await sql`
      UPDATE e_signature_requests SET
        status = 'signed',
        signer_name = ${signerName},
        signer_email = ${signerEmail || null},
        signature_data_url = ${signatureDataUrl},
        signed_at = NOW(),
        signer_ip = ${ip},
        signer_ua = ${ua},
        consent = TRUE,
        updated_at = NOW()
      WHERE token = ${tok}
    `;
    const refreshed = await sql`
      SELECT * FROM e_signature_requests WHERE token = ${tok} LIMIT 1
    `;
    return res.status(200).json({ ok: true, request: mapRow(refreshed[0]) });
  }

  // ——— Admin CRM ———
  if (!(await requireDashboardAdmin(req, res))) return;

  if (action === "list" && req.method === "GET") {
    const rows = await sql`
      SELECT * FROM e_signature_requests
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return res.status(200).json({
      ok: true,
      requests: rows.map(mapRow),
    });
  }

  if (action === "create" && req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
    const b = parsed.body || {};
    var title = String(b.title || "").trim().slice(0, 200);
    var bodyText = String(b.bodyText || b.body || "").trim().slice(0, 20000);
    if (!title) return res.status(400).json({ ok: false, error: "Titre requis" });
    if (!bodyText) return res.status(400).json({ ok: false, error: "Texte du document requis" });

    var id = newId();
    var token = newToken();
    var signerName = String(b.signerName || "").trim().slice(0, 120) || null;
    var signerEmail = String(b.signerEmail || "").trim().slice(0, 160) || null;
    var leadId = String(b.leadId || "").trim().slice(0, 80) || null;
    var contactId = String(b.contactId || "").trim().slice(0, 80) || null;

    await sql`
      INSERT INTO e_signature_requests (
        id, token, title, body_text, signer_name, signer_email, status, lead_id, contact_id
      ) VALUES (
        ${id}, ${token}, ${title}, ${bodyText}, ${signerName}, ${signerEmail},
        'pending', ${leadId}, ${contactId}
      )
    `;
    const created = await sql`SELECT * FROM e_signature_requests WHERE id = ${id} LIMIT 1`;
    return res.status(200).json({ ok: true, request: mapRow(created[0]) });
  }

  if (action === "get" && req.method === "GET") {
    var idGet = String(req.query.id || "").trim();
    if (!idGet) return res.status(400).json({ ok: false, error: "id manquant" });
    const rows = await sql`SELECT * FROM e_signature_requests WHERE id = ${idGet} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ ok: false, error: "Introuvable" });
    return res.status(200).json({ ok: true, request: mapRow(rows[0]) });
  }

  if (action === "cancel" && req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
    var idCancel = String((parsed.body && parsed.body.id) || "").trim();
    if (!idCancel) return res.status(400).json({ ok: false, error: "id manquant" });
    await sql`
      UPDATE e_signature_requests
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${idCancel} AND status = 'pending'
    `;
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ ok: false, error: "Action inconnue" });
};
