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

function twilioSmsEnabled() {
  var flag = String(process.env.TWILIO_SMS_ENABLED || "").toLowerCase();
  return flag === "1" || flag === "true" || flag === "on";
}

async function maybeSendSms(phone, code) {
  if (!twilioSmsEnabled()) return { ok: false, reason: "sms_disabled" };
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

function bagOf(property, token) {
  var bag = AdLib.getAdMeta(property);
  var ad = bag.ad || {};
  var access =
    (Tour.getTourAccessForToken && Tour.getTourAccessForToken(ad, token)) ||
    Tour.normalizeTourAccess(ad.tour_access || {}, null);
  return { bag: bag, ad: ad, access: access };
}

function isHttps(req) {
  return String((req.headers && req.headers["x-forwarded-proto"]) || "") === "https";
}

function attachGrantCookie(req, res, grant) {
  if (!grant || !Tour.grantSetCookie) return;
  res.setHeader("Set-Cookie", Tour.grantSetCookie(grant, isHttps(req)));
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
  var meta = Object.assign({}, bagOf(property, access && access.token).bag.meta || {});
  var ad = Object.assign({}, meta.ad || {});
  var started = Tour.startDurationOnFirstView
    ? Tour.startDurationOnFirstView(access)
    : access;
  var nextAccess = Object.assign({}, started, { view_count: next, updated_at: new Date().toISOString() });
  if (Tour.replaceTourLink) {
    ad = Tour.replaceTourLink(ad, nextAccess);
  } else {
    ad.tour_access = nextAccess;
  }
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
    if (!foundGet) {
      return res.status(404).json({
        ok: false,
        error: "Lien introuvable ou renouvelé",
        contact: Tour.AUTHOR
          ? { name: Tour.AUTHOR.name, role: Tour.AUTHOR.role, email: Tour.AUTHOR.email, href: Tour.AUTHOR.contact_path }
          : null,
      });
    }
    var infoGet = bagOf(foundGet, tokenGet);
    var meta = Tour.publicMeta(infoGet.access, publicHint(foundGet, infoGet.ad), foundGet);
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
  var info = bagOf(found, token);
  var status = Tour.tourLinkStatus(info.access, 0, found);
  if (!status.ok) {
    return res.status(410).json({
      ok: false,
      error: Tour.statusMessage(status.reason),
      reason: status.reason,
      contact: {
        name: Tour.AUTHOR.name,
        role: Tour.AUTHOR.role,
        email: Tour.AUTHOR.email,
        href: Tour.AUTHOR.contact_path,
      },
    });
  }

  if (action === "advisor_code") {
    var userCode = await getAuthUser(req);
    if (!userCode) return res.status(401).json({ error: "Connexion CRM requise" });
    var emailC = Tour.normalizeEmail(body.email);
    var phoneC = Tour.normalizePhone(body.phone);
    if (!emailC && !phoneC) {
      return res.status(400).json({ ok: false, error: "E-mail ou téléphone du contact requis." });
    }
    return res.status(200).json({
      ok: true,
      expires_minutes: 10,
      email_code: emailC ? Tour.otpCode(token, "email|" + emailC) : "",
      phone_code: phoneC ? Tour.otpCode(token, "phone|" + phoneC) : "",
    });
  }

  if (action === "advisor_preview") {
    var user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Connexion CRM requise" });
    var grantPrev = Tour.makeGrant(token, "admin:" + String(user.userId || user.email || "crm"));
    attachGrantCookie(req, res, grantPrev);
    return res.status(200).json({
      ok: true,
      grant: grantPrev,
      preview_url:
        "/immobilier/visite.html?t=" + encodeURIComponent(token) + "&grant=" + encodeURIComponent(grantPrev) + "&admin=1",
      player_url: Tour.playerPath ? Tour.playerPath(token) : "/api/immo-tour-player?t=" + encodeURIComponent(token),
      listing: AdLib.toAdListing(found, { includeTourUrl: false }),
    });
  }

  if (action === "request_access") {
    var email = Tour.normalizeEmail(body.email);
    var phone = Tour.normalizePhone(body.phone);
    var firstName = Tour.normalizeName(body.first_name);
    if (!Tour.isAllowlisted(info.access, email, phone)) {
      return res.status(403).json({
        ok: false,
        error: "Cette visite est réservée à une liste de personnes. Contactez Wendy BUCHET.",
        contact: { name: Tour.AUTHOR.name, href: Tour.AUTHOR.contact_path, email: Tour.AUTHOR.email },
      });
    }
    if (Tour.needsEmail(info.access) && !email) {
      return res.status(400).json({ ok: false, error: "E-mail réel obligatoire." });
    }
    if (Tour.needsPhone(info.access) && !phone) {
      return res.status(400).json({ ok: false, error: "Téléphone français obligatoire." });
    }
    if (!firstName && Tour.needsOtp(info.access)) {
      return res.status(400).json({ ok: false, error: "Indiquez votre prénom." });
    }

    if (!Tour.needsOtp(info.access)) {
      return res.status(200).json({
        ok: true,
        skip_otp: true,
        delivery_email: false,
        delivery_sms: false,
        message: "Cochez l’acceptation des droits d’auteur, puis ouvrez la visite.",
      });
    }

    var emailCode = email ? Tour.otpCode(token, "email|" + email) : null;
    var phoneCode = phone ? Tour.otpCode(token, "phone|" + phone) : null;
    var sent = { ok: true };
    if (Tour.needsEmail(info.access)) {
      sent = await sendViaResend({
        to: email,
        subject: "Code visite virtuelle — Wendy BUCHET",
        text:
          "Bonjour " +
          firstName +
          ",\n\nVotre code pour la visite virtuelle : " +
          emailCode +
          "\nValable 10 minutes.\nUsage unique et personnel — Wendy BUCHET, mandataire immobilier, ORIAS n° 15005935.\n\nLeads Opportunities",
        html:
          "<p>Bonjour " +
          firstName +
          ",</p><p>Votre code pour la visite virtuelle :</p>" +
          "<p style=\"font-size:28px;font-weight:800;letter-spacing:4px\">" +
          emailCode +
          "</p><p>Valable 10 minutes. Usage unique et personnel.</p><p>Wendy BUCHET — Mandataire immobilier — ORIAS n° 15005935</p>",
      });
      if (!sent.ok) {
        return res.status(502).json({
          ok: false,
          error: sent.error || "Envoi e-mail impossible. Réessayez dans un instant.",
        });
      }
    }
    var sms = { ok: false };
    if (Tour.needsPhone(info.access) && phoneCode) {
      sms = await maybeSendSms(phone, phoneCode);
      if (!sms.ok && info.access.verify_mode === "sms") {
        return res.status(502).json({
          ok: false,
          error: "SMS désactivé (pas de frais). Utilisez la vérif e-mail.",
        });
      }
    }
    return res.status(200).json({
      ok: true,
      skip_otp: false,
      delivery_email: Tour.needsEmail(info.access),
      delivery_sms: !!sms.ok,
      contact_email: email ? Tour.maskEmail(email) : "",
      contact_phone: phone ? Tour.maskPhone(phone) : "",
      message: sms.ok && Tour.needsEmail(info.access)
        ? "Codes envoyés par e-mail et SMS."
        : Tour.needsEmail(info.access)
          ? sms.ok
            ? "Codes envoyés."
            : "Code envoyé par e-mail. Le SMS est configuré mais désactivé (pas de frais)."
          : "Code envoyé par SMS.",
    });
  }

  if (action === "verify_access") {
    var emailV = Tour.normalizeEmail(body.email);
    var phoneV = Tour.normalizePhone(body.phone);
    var firstV = Tour.normalizeName(body.first_name);
    if (!body.accepted_terms) {
      return res.status(400).json({
        ok: false,
        error: "Cochez l’acceptation des droits d’auteur (usage unique et personnel).",
      });
    }
    if (!Tour.needsOtp(info.access) && !Tour.isAllowlisted(info.access, emailV, phoneV)) {
      return res.status(403).json({
        ok: false,
        error: "Vous n’êtes pas sur la liste autorisée. Contactez Wendy BUCHET.",
        contact: { name: Tour.AUTHOR.name, href: Tour.AUTHOR.contact_path, email: Tour.AUTHOR.email },
      });
    }
    if (Tour.needsEmail(info.access) && !emailV) {
      return res.status(400).json({ ok: false, error: "E-mail requis." });
    }
    if (Tour.needsPhone(info.access) && !phoneV) {
      return res.status(400).json({ ok: false, error: "Téléphone requis." });
    }
    if (Tour.needsEmail(info.access) && !Tour.verifyOtp(token, "email|" + emailV, body.email_code)) {
      return res.status(401).json({ ok: false, error: "Code e-mail incorrect ou expiré." });
    }
    var phoneVerified = phoneV && Tour.verifyOtp(token, "phone|" + phoneV, body.phone_code);
    if (info.access.verify_mode === "sms" && !phoneVerified) {
      return res.status(401).json({ ok: false, error: "Code SMS incorrect ou expiré." });
    }
    if (body.phone_code && !phoneVerified) {
      return res.status(401).json({ ok: false, error: "Code SMS incorrect ou expiré." });
    }

    var storeEmail =
      emailV || (phoneV ? "sms+" + phoneV + "@visite.local" : "anon+" + token.slice(-12) + "@visite.local");

    if (sql) {
      var existing = [];
      try {
        existing = await sql`
          SELECT view_count FROM crm_immo_tour_views
          WHERE tour_token = ${token} AND email = ${storeEmail}
          LIMIT 1
        `;
      } catch (e) {
        existing = [];
      }
      var used = existing[0] ? Number(existing[0].view_count) || 0 : 0;
      if (!Tour.contactQuotaOk(used, info.access)) {
        return res.status(429).json({
          ok: false,
          error: "Vous avez déjà consulté cette visite trop de fois.",
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
            ${storeEmail},
            ${phoneV},
            ${firstV},
            ${emailV ? new Date().toISOString() : null},
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

    if (emailV || phoneV) {
      await recordLead(sql, {
        token: token,
        email: emailV || storeEmail,
        phone: phoneV,
        first_name: firstV,
        property_id: found.id,
        city: found.city,
        title: (info.ad && info.ad.headline) || found.title,
        utm_source: body.utm_source,
      });
    }

    var grant = Tour.makeGrant(token, storeEmail + "|" + (phoneV || ""));
    attachGrantCookie(req, res, grant);
    var listing = AdLib.toAdListing(found, { includeTourUrl: false });
    return res.status(200).json({
      ok: true,
      grant: grant,
      player_url: Tour.playerPath ? Tour.playerPath(token) : "/api/immo-tour-player?t=" + encodeURIComponent(token),
      listing: listing,
      phone_verified: phoneVerified,
      contact_email: Tour.maskEmail(emailV),
    });
  }

  if (action === "view_tour") {
    var granted = Tour.verifyGrant(body.grant, token);
    if (!granted) return res.status(401).json({ ok: false, error: "Session expirée. Recueillez un nouveau code." });
    var embed = Tour.resolveTourUrl
      ? Tour.resolveTourUrl(info.ad, info.access)
      : Tour.embedUrl(info.ad.virtual_tour);
    if (!embed) return res.status(404).json({ ok: false, error: "Visite 3D non configurée." });
    attachGrantCookie(req, res, body.grant);

    var playerUrl = Tour.playerPath ? Tour.playerPath(token) : "/api/immo-tour-player?t=" + encodeURIComponent(token);
    var isAdvisor = String(granted.contact || "").indexOf("admin:") === 0;
    if (isAdvisor) {
      return res.status(200).json({
        ok: true,
        preview: true,
        player_url: playerUrl,
        listing: AdLib.toAdListing(found, { includeTourUrl: false }),
      });
    }

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

    var live = Tour.tourLinkStatus(info.access, 0, found);
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
      player_url: playerUrl,
      listing: AdLib.toAdListing(found, { includeTourUrl: false }),
    });
  }

  return res.status(400).json({ error: "action inconnue" });
};
