/**
 * GET /api/external/resume-deposit?rt=
 * POST /api/external/resume-deposit { email, phone, leadId? }
 *
 * Reprise du questionnaire vendeur.
 * - Jeton `rt` (lien CRM) : ouvre le dossier ciblé, sans e-mail dans l’URL.
 * - GET avec leadId / e-mail / téléphone en query : ignoré (anciens liens fuités).
 * - POST : e-mail/tél saisis dans le formulaire (pas lus depuis l’URL).
 */
const { applyApiGuards, rateLimit, getClientIp, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const { verifyResumeToken } = require("../resume-link-token");
const { identityMatchesLead, normEmail, normPhone } = require("../resume-identity");

function parsePayload(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : Object.assign({}, raw);
  } catch (e) {
    return {};
  }
}

function fillFormGaps(form, source) {
  if (!form || !source || typeof source !== "object") return form;
  [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "postal_code",
    "description",
    "details",
    "property_type",
    "price_fai",
    "rooms",
    "bedrooms",
    "surface_m2",
    "dpe",
    "sellerKind",
    "sellerName",
    "sellerPhone",
    "sellerEmail",
    "confirmMethod",
    "role",
  ].forEach(function (k) {
    var cur = form[k];
    var next = source[k];
    if ((cur == null || String(cur).trim() === "") && next != null && String(next).trim() !== "") {
      form[k] = typeof next === "number" ? String(next) : next;
    }
  });
  return form;
}

function buildDraftFromLeadPayload(p, leadRow) {
  if (!p || typeof p !== "object") return null;
  leadRow = leadRow || {};
  var leadFields = {
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    email: p.email || leadRow.email || "",
    phone: p.phone || leadRow.phone || "",
    city: p.city || "",
    postal_code: p.postal_code || "",
    description: p.description || "",
    details: p.details || "",
    property_type: p.property_type || "",
    price_fai: p.price_fai != null ? String(p.price_fai) : "",
    rooms: p.rooms != null ? String(p.rooms) : "",
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
    surface_m2: p.surface_m2 != null ? String(p.surface_m2) : "",
    dpe: p.dpe || "",
    sellerKind: p.sellerKind || "",
    sellerName: p.sellerName || "",
    sellerPhone: p.sellerPhone || "",
    sellerEmail: p.sellerEmail || "",
    confirmMethod: p.confirmMethod || "",
    role: p.role || "vendeur",
  };

  if (p.depositDraft && typeof p.depositDraft === "object") {
    var stored = Object.assign({}, p.depositDraft);
    stored.form = fillFormGaps(Object.assign({}, stored.form || {}), leadFields);
    stored.fromServer = true;
    var storedHas =
      Object.keys(stored.form || {}).some(function (k) {
        return String(stored.form[k] || "").trim();
      }) ||
      Object.keys(stored.panel || {}).some(function (k) {
        return String((stored.panel || {})[k] || "").trim();
      }) ||
      (Array.isArray(stored.owners) && stored.owners.length);
    return storedHas ? stored : null;
  }

  var sd = p.sellDossier;
  var form = Object.assign({}, leadFields);
  if (Array.isArray(p.listingUrls) && p.listingUrls.length) {
    form.listingUrlsText = p.listingUrls.join("\n");
  } else if (Array.isArray(p.urls) && p.urls.length) {
    form.listingUrlsText = p.urls.join("\n");
  }
  var panel = {};
  if (sd && typeof sd === "object") {
    Object.keys(sd).forEach(function (k) {
      if (
        k === "owners" ||
        k === "coproWorks" ||
        k === "sellPhotos" ||
        k === "tracfinDocs" ||
        k === "tracfinRequiresFollowUp"
      ) {
        return;
      }
      var val = sd[k];
      if (val == null) return;
      if (Array.isArray(val)) panel[k] = val;
      else panel[k] = String(val);
    });
  }
  if (p.questionnaireDraft && typeof p.questionnaireDraft === "object") {
    fillFormGaps(form, p.questionnaireDraft);
  }
  var draft = {
    v: 2,
    savedAt: Date.now(),
    hat: p.role === "les_deux" ? "les_deux" : p.role === "signalement" ? "signalement" : "vendeur",
    form: form,
    panel: panel,
    owners: sd && Array.isArray(sd.owners) ? sd.owners : [],
    fromServer: true,
  };
  var hasData =
    Object.keys(form).some(function (k) {
      return String(form[k] || "").trim();
    }) ||
    Object.keys(panel).some(function (k) {
      return String(panel[k] || "").trim();
    }) ||
    draft.owners.length;
  return hasData ? draft : null;
}

function foundPayload(row) {
  var payload = parsePayload(row.payload);
  var draft = buildDraftFromLeadPayload(payload, row);
  if (!draft) return { found: false };
  return {
    found: true,
    leadId: row.id,
    email: row.email || payload.email || (draft.form && draft.form.email) || "",
    phone: row.phone || payload.phone || (draft.form && draft.form.phone) || "",
    firstName: payload.firstName || (draft.form && draft.form.firstName) || "",
    lastName: payload.lastName || (draft.form && draft.form.lastName) || "",
    savedAt: row.created_at,
    draft: draft,
    message: "Dossier repris — complétez les informations manquantes puis renvoyez.",
  };
}

async function loadLeadById(sql, leadId) {
  var rows = await sql`
    SELECT id, email, phone, vertical, payload, created_at
    FROM site_leads
    WHERE id = ${leadId}
    LIMIT 1
  `;
  return rows[0] || null;
}

module.exports = async function externalResumeDeposit(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("ext-resume-deposit:" + ip, 40, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de demandes — réessayez dans un instant." });

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données indisponible" });

  var token = req.query.rt || req.query.token || "";
  var body = {};
  if (req.method === "POST") {
    var parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    body = parsed.body || {};
    if (!token) token = body.rt || body.token || "";
  }
  token = String(token || "").trim();

  try {
    if (token) {
      var decoded = verifyResumeToken(token);
      if (!decoded || !decoded.leadId) {
        return res.status(200).json({ found: false, reason: "invalid_token" });
      }
      var tokenLead = await loadLeadById(sql, decoded.leadId);
      if (!tokenLead) return res.status(200).json({ found: false });
      return res.status(200).json(foundPayload(tokenLead));
    }

    // GET sans jeton : ne plus honorer leadId / e-mail / tél en query (liens CRM fuités).
    if (req.method === "GET") {
      return res.status(200).json({ found: false, reason: "token_required" });
    }

    var email = normEmail(body.email);
    var phone = String(body.phone || "").trim();
    var digits = normPhone(phone);
    var leadId = body.leadId ? String(body.leadId).trim() : "";

    if (!leadId && !email && digits.length < 10) {
      return res.status(400).json({ error: "Indiquez un e-mail ou un téléphone." });
    }

    var row = null;
    if (leadId) {
      row = await loadLeadById(sql, leadId);
      if (!row || !identityMatchesLead(row, { email: email, phone: phone })) {
        return res.status(200).json({ found: false });
      }
    } else if (email) {
      var byEmail = await sql`
        SELECT id, email, phone, vertical, payload, created_at
        FROM site_leads
        WHERE vertical IN ('vendeur_immo', 'acheteur_vendeur_immo', 'chasseur_immo')
          AND LOWER(TRIM(email)) = ${email}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      row =
        byEmail.filter(function (r) {
          return identityMatchesLead(r, { email: email, phone: phone });
        })[0] || null;
    } else {
      var candidates = await sql`
        SELECT id, email, phone, vertical, payload, created_at
        FROM site_leads
        WHERE vertical IN ('vendeur_immo', 'acheteur_vendeur_immo', 'chasseur_immo')
          AND phone IS NOT NULL AND TRIM(phone) <> ''
        ORDER BY created_at DESC
        LIMIT 25
      `;
      row =
        candidates.filter(function (r) {
          return identityMatchesLead(r, { email: email, phone: phone });
        })[0] || null;
    }

    if (!row) return res.status(200).json({ found: false });
    return res.status(200).json(foundPayload(row));
  } catch (e) {
    console.error("[external/resume-deposit]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
