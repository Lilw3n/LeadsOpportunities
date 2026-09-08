/**
 * POST /api/immo-tour-access
 * - request_access { token, first_name, email, phone }
 * - verify_access { token, email, phone, email_code, phone_code? }
 * - view_tour { token, grant }
 * - advisor_preview { token } + Bearer CRM
 * GET /api/immo-tour-access?token=… → méta publique (sans URL Matterport)
 */
const { randomUUID } = require("crypto");
const { applyApiGuards, rateLimit, getClientIp, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const { getAuthUser } = require("../auth");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const Tour = require("../../../js/immo-tour-access-lib.js");
const { sendViaResend } = require("../mail-send");

async function loadProperties() {
  var sql = getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return db.properties || [];
}

async function ensureTourSchema(sql) {
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_immo_tour_views (
        id TEXT PRIMARY KEY,
        tour_token TEXT NOT NULL,
        property_id TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        first_name TEXT,
        email_verified_at TIMESTAMPTZ,
        phone_verified_at TIMESTAMPTZ,
        view_count INT NOT NULL DEFAULT 0,
        last_viewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_immo_tour_unique ON crm_immo_tour_views (tour_token, email)`;
  } catch (e) {
    console.warn("[immo-tour-access] schema", e && e.message);
  }
}

async function maybeSendSms(phone, code) {
  var sid = process.env.TWILIO_ACCOUNT_SID;
  var token = process.env.TWILIO_AUTH_TOKEN;
  var from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false, reason: "no_twilio" };
  try {
    var auth = Buffer.from(sid + ":" + token).toString("base64");
    var body = new URLSearchParams({
      To: phone.replace(/^0/, "+33"),
      From: from,
      Body: "Leads Opportunities — code visite virtuelle : " + code + " (valable 10 min)",
    });
    var r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json", {
      method: "POST",
      headers: {
        Authorization: "Basic " + auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!r.ok) return { ok: false, reason: "twilio_error" };
    return { ok: true, reason: "sms" };
  } catch (e) {
    return { ok: false, reason: "twilio_error" };
  }
}

function bagOf(property) {
  var bag = AdLib.getAdMeta(property);
  var access = Tour.normalizeTourAccess((bag.ad && bag.ad.tour_access) || {}, null);
  return { bag: bag, ad: bag.ad || {}, access: access };
}

function publicHint(property, ad) {
  return {
    title: (ad && ad.headline) || property.title || "Visite virtuelle",
    city: property.city || "",
    headline: ad && ad.headline,
  };
}

async function bumpLinkViews(sql, property, access) {
  if (!sql || !property || !property.id) return access.view_count || 0;
  var next = (Number(access.view_count) || 0) + 1;
  var meta = Object.assign({}, bagOf(property).bag.meta || {});
  var ad = Object.assign({}, meta.ad || {});
  ad.tour_access = Object.assign({}, access, { view_count: next, updated_at: new Date().toISOString() });
  meta.ad = ad;
  try {
    await sql`
      UPDATE crm_immo_properties
      SET metadata_json = ${JSON.stringify(meta)}, updated_at = NOW()
      WHERE id = ${property.id}
    `;
  } catch (e) {
    console.warn("[immo-tour-access] bump views", e && e.message);
  }
  return next;
}

async function recordLead(sql, payload) {
  if (!sql) return;
  try {
    await require("../ensure-schema").ensureSiteLeadsSchema(sql);
    var id = "lead_tour_" + String(payload.token || "").slice(0, 18) + "_" + String(payload.email || "").replace(/[^a-z0-9]/g, "").slice(0, 24);
    if (id.length < 16) id = "lead_tour_" + randomUUID();
    await sql`
      INSERT INTO site_leads (id, source, vertical, email, phone, payload, status)
      VALUES (
        ${id},
        ${"visite-virtuelle"},
        ${"acheteur_immo"},
        ${payload.email},
        ${payload.phone},
        ${JSON.stringify({
          first_name: payload.first_name,
          need: "visite_virtuelle",
          property_id: payload.property_id,
          tour_token: payload.token,
          city: payload.city,
          title: payload.title,
          utm_source: payload.utm_source || "leboncoin",
        })},
        ${"new"}
      )
      ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, site_leads.phone),
        updated_at = NOW()
    `;
  } catch (e) {
    console.warn("[immo-tour-access] lead", e && e.message);
  }
}

module.exports = async function immoTourAccess(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var ip = getClientIp(req);
  res.setHeader("Cache-Control", "private, no-store");
  var sql = getSql();
  if (sql) await ensureTourSchema(sql);

  if (req.method === "GET") {
    var rlGet = rateLimit("immo-tour-get:" + ip, 40, 60 * 1000);
    if (!rlGet.allowed) return res.status(429).json({ error: "Trop de requêtes" });
    var tokenGet = String((req.query && (req.query.token || req.query.t)) || "").trim();
    if (!Tour.isTourToken(tokenGet)) return res.status(400).json({ error: "Lien invalide" });
    var propsGet = [];
    try {
      propsGet = await loadProperties();
    } catch (e) {
      propsGet = [];
    }
    var foundGet = AdLib.findByTourToken(propsGet, tokenGet);
    if (!foundGet) return res.status(404).json({ ok: false, error: "Lien introuvable ou renouvelé" });
    var infoGet = bagOf(foundGet);
    var meta = Tour.publicMeta(infoGet.access, publicHint(foundGet, infoGet.ad));
    return res.status(200).json(Object.assign({ token: tokenGet }, meta));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var rl = rateLimit("immo-tour-post:" + ip, 24, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  var parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  var action = String(body.action || "").trim();
  var token = String(body.token || "").trim();
  if (!Tour.isTourToken(token)) return res.status(400).json({ error: "Lien invalide" });

  var properties = [];
  try {
    properties = await loadProperties();
  } catch (err) {
    properties = [];
  }
  var found = AdLib.findByTourToken(properties, token);
  if (!found) return res.status(404).json({ ok: false, error: "Lien introuvable ou renouvelé" });
  var info = bagOf(found);
  var status = Tour.tourLinkStatus(info.access);
  if (!status.ok) {
    var msg =
      status.reason === "expired"
        ? "Ce lien de visite a expiré. Demandez un nouveau lien à votre conseiller."
        : status.reason === "quota"
          ? "Le nombre de consultations de ce lien est atteint."
          : "Cette visite n’est plus accessible.";
    return res.status(410).json({ ok: false, error: msg, reason: status.reason });
  }

  if (action === "advisor_preview") {
    var user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Connexion CRM requise" });
    var grantPrev = Tour.makeGrant(token, "admin:" + String(user.userId || user.email || "crm"));
    return res.status(200).json({
      ok: true,
      grant: grantPrev,
      preview_url:
        "/immobilier/visite.html?t=" + encodeURIComponent(token) + "&grant=" + encodeURIComponent(grantPrev) + "&admin=1",
      listing: AdLib.toAdListing(found, { includeTourUrl: false }),
      embed_url: Tour.embedUrl(info.ad.virtual_tour),
    });
  }

  if (action === "request_access") {
    var email = Tour.normalizeEmail(body.email);
    var phone = Tour.normalizePhone(body.phone);
    var firstName = Tour.normalizeName(body.first_name);
    if (!email) return res.status(400).json({ ok: false, error: "E-mail réel obligatoire." });
    if (!phone) return res.status(400).json({ ok: false, error: "Téléphone français obligatoire." });
    if (!firstName) return res.status(400).json({ ok: false, error: "Indiquez votre prénom." });

    var emailCode = Tour.otpCode(token, "email|" + email);
    var phoneCode = Tour.otpCode(token, "phone|" + phone);
    var sent = await sendViaResend({
      to: email,
      subject: "Code visite virtuelle — Leads Opportunities",
      text:
        "Bonjour " +
        firstName +
        ",\n\nVotre code pour la visite virtuelle : " +
        emailCode +
        "\nValable 10 minutes.\nCe lien est réservé aux acquéreurs — ne le partagez pas.\n\nWendy Buchet — Leads Opportunities",
      html:
        "<p>Bonjour " +
        firstName +
        ",</p><p>Votre code pour la visite virtuelle :</p>" +
        "<p style=\"font-size:28px;font-weight:800;letter-spacing:4px\">" +
        emailCode +
        "</p><p>Valable 10 minutes. Ce lien est réservé aux acquéreurs.</p><p>Wendy Buchet — Leads Opportunities</p>",
    });
    if (!sent.ok) {
      return res.status(502).json({
        ok: false,
        error: sent.error || "Envoi e-mail impossible. Réessayez dans un instant.",
      });
    }
    var sms = await maybeSendSms(phone, phoneCode);
    return res.status(200).json({
      ok: true,
      delivery_email: true,
      delivery_sms: !!sms.ok,
      contact_email: Tour.maskEmail(email),
      contact_phone: Tour.maskPhone(phone),
      message: sms.ok
        ? "Codes envoyés par e-mail et SMS."
        : "Code envoyé par e-mail. Le SMS n’est pas actif : le téléphone est quand même enregistré.",
    });
  }

  if (action === "verify_access") {
    var emailV = Tour.normalizeEmail(body.email);
    var phoneV = Tour.normalizePhone(body.phone);
    var firstV = Tour.normalizeName(body.first_name);
    if (!emailV || !phoneV) {
      return res.status(400).json({ ok: false, error: "E-mail et téléphone requis." });
    }
    if (!Tour.verifyOtp(token, "email|" + emailV, body.email_code)) {
      return res.status(401).json({ ok: false, error: "Code e-mail incorrect ou expiré." });
    }
    var phoneVerified = Tour.verifyOtp(token, "phone|" + phoneV, body.phone_code);
    if (body.phone_code && !phoneVerified) {
      return res.status(401).json({ ok: false, error: "Code SMS incorrect ou expiré." });
    }

    if (sql) {
      var existing = [];
      try {
        existing = await sql`
          SELECT view_count FROM crm_immo_tour_views
          WHERE tour_token = ${token} AND email = ${emailV}
          LIMIT 1
        `;
      } catch (e) {
        existing = [];
      }
      var used = existing[0] ? Number(existing[0].view_count) || 0 : 0;
      if (!Tour.contactQuotaOk(used, info.access)) {
        return res.status(429).json({
          ok: false,
          error: "Vous avez déjà consulté cette visite trop de fois avec cet e-mail.",
        });
      }
      try {
        await sql`
          INSERT INTO crm_immo_tour_views (
            id, tour_token, property_id, email, phone, first_name, email_verified_at, phone_verified_at, view_count
          ) VALUES (
            ${"tv_" + randomUUID()},
            ${token},
            ${found.id},
            ${emailV},
            ${phoneV},
            ${firstV},
            NOW(),
            ${phoneVerified ? new Date().toISOString() : null},
            0
          )
          ON CONFLICT (tour_token, email) DO UPDATE SET
            phone = EXCLUDED.phone,
            first_name = COALESCE(EXCLUDED.first_name, crm_immo_tour_views.first_name),
            email_verified_at = COALESCE(crm_immo_tour_views.email_verified_at, NOW())
        `;
      } catch (e2) {
        /* table sans contrainte unique : on continue */
      }
    }

    await recordLead(sql, {
      token: token,
      email: emailV,
      phone: phoneV,
      first_name: firstV,
      property_id: found.id,
      city: found.city,
      title: (info.ad && info.ad.headline) || found.title,
      utm_source: body.utm_source,
    });

    var grant = Tour.makeGrant(token, emailV + "|" + phoneV);
    var listing = AdLib.toAdListing(found, { includeTourUrl: false });
    return res.status(200).json({
      ok: true,
      grant: grant,
      listing: listing,
      phone_verified: phoneVerified,
      contact_email: Tour.maskEmail(emailV),
    });
  }

  if (action === "view_tour") {
    var granted = Tour.verifyGrant(body.grant, token);
    if (!granted) return res.status(401).json({ ok: false, error: "Session expirée. Recueillez un nouveau code." });
    var embed = Tour.embedUrl(info.ad.virtual_tour);
    if (!embed) return res.status(404).json({ ok: false, error: "Visite 3D non configurée." });

    var contactEmail = String(granted.contact || "").split("|")[0];
    if (sql && Tour.normalizeEmail(contactEmail)) {
      var rows = [];
      try {
        rows = await sql`
          SELECT view_count FROM crm_immo_tour_views
          WHERE tour_token = ${token} AND email = ${Tour.normalizeEmail(contactEmail)}
          LIMIT 1
        `;
      } catch (e) {
        rows = [];
      }
      var usedC = rows[0] ? Number(rows[0].view_count) || 0 : 0;
      if (!Tour.contactQuotaOk(usedC, info.access)) {
        return res.status(429).json({ ok: false, error: "Quota de consultations atteint pour votre e-mail." });
      }
      try {
        await sql`
          UPDATE crm_immo_tour_views
          SET view_count = view_count + 1, last_viewed_at = NOW()
          WHERE tour_token = ${token} AND email = ${Tour.normalizeEmail(contactEmail)}
        `;
      } catch (e3) {}
    }

    var live = Tour.tourLinkStatus(info.access, 1);
    if (!live.ok) {
      return res.status(410).json({
        ok: false,
        error: "Ce lien a atteint sa limite de consultations.",
        reason: live.reason,
      });
    }
    await bumpLinkViews(sql, found, info.access);

    return res.status(200).json({
      ok: true,
      embed_url: embed,
      listing: AdLib.toAdListing(found, { includeTourUrl: false }),
    });
  }

  return res.status(400).json({ error: "action inconnue" });
};
