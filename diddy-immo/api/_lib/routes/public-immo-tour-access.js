/**
 * POST /api/immo-tour-access
 * - request_access { token, first_name, email, phone } → file d’attente (pas de code auto)
 * - verify_access { token, email, phone, email_code, phone_code? } → après validation Wendy
 * - view_tour { token, grant }
 * - advisor_preview { token } + Bearer CRM
 * - list_requests / decide_request { approve | decline } + Bearer CRM
 * GET /api/immo-tour-access?token=… → méta publique (sans URL Matterport)
 * GET /api/immo-tour-access?inbox=1 + Bearer CRM → file des demandes
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

async function ensureTourRequestSchema(sql) {
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS crm_immo_tour_requests (
        id TEXT PRIMARY KEY,
        tour_token TEXT NOT NULL,
        property_id TEXT,
        property_title TEXT,
        link_name TEXT,
        first_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        decline_reason TEXT,
        utm_source TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        decided_at TIMESTAMPTZ,
        decided_by TEXT,
        code_sent_at TIMESTAMPTZ
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_immo_tour_req_unique ON crm_immo_tour_requests (tour_token, email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_immo_tour_req_status ON crm_immo_tour_requests (status, created_at DESC)`;
    await sql`ALTER TABLE crm_immo_tour_requests ADD COLUMN IF NOT EXISTS contact_id TEXT`;
    await sql`ALTER TABLE crm_immo_tour_requests ADD COLUMN IF NOT EXISTS lead_id TEXT`;
  } catch (e) {
    console.warn("[immo-tour-access] request schema", e && e.message);
  }
}

function publicRequestRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tour_token: row.tour_token,
    property_id: row.property_id || "",
    property_title: row.property_title || "",
    link_name: row.link_name || "",
    first_name: row.first_name || "",
    email: row.email || "",
    phone: row.phone || "",
    status: row.status || "pending",
    decline_reason: row.decline_reason || "",
    utm_source: row.utm_source || "",
    created_at: row.created_at,
    decided_at: row.decided_at,
    decided_by: row.decided_by || "",
    code_sent_at: row.code_sent_at,
    contact_id: row.contact_id || "",
    lead_id: row.lead_id || "",
  };
}

async function findTourRequest(sql, token, email) {
  if (!sql || !token || !email) return null;
  try {
    var rows = await sql`
      SELECT * FROM crm_immo_tour_requests
      WHERE tour_token = ${token} AND email = ${email}
      LIMIT 1
    `;
    return rows && rows[0] ? rows[0] : null;
  } catch (e) {
    return null;
  }
}

async function findTourRequestById(sql, id) {
  if (!sql || !id) return null;
  try {
    var rows = await sql`
      SELECT * FROM crm_immo_tour_requests
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows && rows[0] ? rows[0] : null;
  } catch (e) {
    return null;
  }
}

async function listTourRequests(sql, filters) {
  if (!sql) return [];
  var f = filters || {};
  var status = String(f.status || "").trim();
  var token = String(f.token || "").trim();
  var propertyId = String(f.property_id || "").trim();
  try {
    if (status && token) {
      return await sql`
        SELECT * FROM crm_immo_tour_requests
        WHERE status = ${status} AND tour_token = ${token}
        ORDER BY created_at DESC
        LIMIT 200
      `;
    }
    if (status && propertyId) {
      return await sql`
        SELECT * FROM crm_immo_tour_requests
        WHERE status = ${status} AND property_id = ${propertyId}
        ORDER BY created_at DESC
        LIMIT 200
      `;
    }
    if (token) {
      return await sql`
        SELECT * FROM crm_immo_tour_requests
        WHERE tour_token = ${token}
        ORDER BY created_at DESC
        LIMIT 200
      `;
    }
    if (propertyId) {
      return await sql`
        SELECT * FROM crm_immo_tour_requests
        WHERE property_id = ${propertyId}
        ORDER BY created_at DESC
        LIMIT 200
      `;
    }
    if (status) {
      return await sql`
        SELECT * FROM crm_immo_tour_requests
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 200
      `;
    }
    return await sql`
      SELECT * FROM crm_immo_tour_requests
      ORDER BY created_at DESC
      LIMIT 200
    `;
  } catch (e) {
    console.warn("[immo-tour-access] list requests", e && e.message);
    return [];
  }
}

async function sendVisitorOtpEmail(email, firstName, code) {
  var e = Tour.normalizeEmail(email);
  if (!e || e.indexOf("@visite.local") !== -1) return { ok: false, reason: "no_email" };
  return sendViaResend({
    to: e,
    subject: "Code visite virtuelle — Wendy BUCHET",
    text:
      "Bonjour " +
      (firstName || "") +
      ",\n\nWendy BUCHET a validé votre demande. Votre code pour la visite virtuelle : " +
      code +
      "\nValable 10 minutes.\nUsage unique et personnel — Wendy BUCHET, mandataire immobilier, ORIAS n° 15005935.\n\nLeads Opportunities",
    html:
      "<p>Bonjour " +
      (firstName || "") +
      ",</p><p>Wendy BUCHET a <strong>validé</strong> votre demande de visite virtuelle.</p>" +
      "<p>Votre code :</p>" +
      "<p style=\"font-size:28px;font-weight:800;letter-spacing:4px\">" +
      code +
      "</p><p>Valable 10 minutes. Usage unique et personnel.</p><p>Wendy BUCHET — Mandataire immobilier — ORIAS n° 15005935</p>",
  });
}

async function notifyAdvisorNewRequest(row) {
  var to = (Tour.AUTHOR && Tour.AUTHOR.email) || "contact@leadsopportunities.fr";
  var title = row.property_title || "Visite virtuelle";
  var who = [row.first_name, row.email, row.phone].filter(Boolean).join(" · ");
  var off = row.allowlisted === false ? "\nHors liste prévue — à valider ou décliner quand même.\n" : "";
  return sendViaResend({
    to: to,
    subject: "Demande de visite à valider — " + (row.first_name || row.email || "visiteur"),
    text:
      "Nouvelle demande de visite virtuelle (à valider ou décliner).\n\n" +
      who +
      off +
      "\nBien : " +
      title +
      (row.link_name ? "\nLien : " + row.link_name : "") +
      "\n\nOuvrir le CRM : https://www.leadsopportunities.fr/crm-immo-tour-requests.html",
    html:
      "<p>Nouvelle demande de visite virtuelle — <strong>à valider ou décliner</strong>.</p>" +
      "<p>" +
      String(who).replace(/</g, "") +
      "</p>" +
      (row.allowlisted === false
        ? "<p><strong>Hors liste prévue</strong> — tu peux quand même valider ou décliner.</p>"
        : "") +
      "<p>Bien : " +
      String(title).replace(/</g, "") +
      (row.link_name ? " · " + String(row.link_name).replace(/</g, "") : "") +
      "</p><p><a href=\"https://www.leadsopportunities.fr/crm-immo-tour-requests.html\">Ouvrir les demandes de visite</a></p>",
  });
}

async function sendDeclineEmail(email, firstName, reason) {
  var e = Tour.normalizeEmail(email);
  if (!e || e.indexOf("@visite.local") !== -1) return { ok: false, reason: "no_email" };
  var extra = reason ? "\nMotif : " + reason + "\n" : "";
  return sendViaResend({
    to: e,
    subject: "Demande de visite — non acceptée",
    text:
      "Bonjour " +
      (firstName || "") +
      ",\n\nVotre demande d’accès à la visite virtuelle n’a pas été acceptée." +
      extra +
      "\nWendy BUCHET — Mandataire immobilier — ORIAS n° 15005935\ncontact@leadsopportunities.fr",
    html:
      "<p>Bonjour " +
      (firstName || "") +
      ",</p><p>Votre demande d’accès à la visite virtuelle <strong>n’a pas été acceptée</strong>.</p>" +
      (reason ? "<p>" + String(reason).replace(/</g, "") + "</p>" : "") +
      "<p>Wendy BUCHET — Mandataire immobilier — ORIAS n° 15005935</p>",
  });
}

async function upsertTourRequest(sql, payload) {
  var id = payload.id || "tr_" + randomUUID();
  await sql`
    INSERT INTO crm_immo_tour_requests (
      id, tour_token, property_id, property_title, link_name, first_name, email, phone,
      status, decline_reason, utm_source, decided_at, decided_by, code_sent_at
    ) VALUES (
      ${id},
      ${payload.tour_token},
      ${payload.property_id || null},
      ${payload.property_title || null},
      ${payload.link_name || null},
      ${payload.first_name || null},
      ${payload.email},
      ${payload.phone || null},
      ${payload.status || "pending"},
      ${payload.decline_reason || null},
      ${payload.utm_source || null},
      ${payload.decided_at || null},
      ${payload.decided_by || null},
      ${payload.code_sent_at || null}
    )
    ON CONFLICT (tour_token, email) DO UPDATE SET
      first_name = COALESCE(EXCLUDED.first_name, crm_immo_tour_requests.first_name),
      phone = COALESCE(EXCLUDED.phone, crm_immo_tour_requests.phone),
      property_title = COALESCE(EXCLUDED.property_title, crm_immo_tour_requests.property_title),
      link_name = COALESCE(EXCLUDED.link_name, crm_immo_tour_requests.link_name),
      status = EXCLUDED.status,
      decline_reason = EXCLUDED.decline_reason,
      decided_at = EXCLUDED.decided_at,
      decided_by = COALESCE(EXCLUDED.decided_by, crm_immo_tour_requests.decided_by),
      code_sent_at = COALESCE(EXCLUDED.code_sent_at, crm_immo_tour_requests.code_sent_at)
  `;
  return findTourRequest(sql, payload.tour_token, payload.email);
}

function visitorCodes(token, email, phone) {
  var e = Tour.normalizeEmail(email);
  var p = Tour.normalizePhone(phone);
  return {
    email_code: e ? Tour.otpCode(token, "email|" + e) : "",
    phone_code: p ? Tour.otpCode(token, "phone|" + p) : "",
  };
}

function requestAllowlisted(row, properties) {
  if (!row || !properties || !AdLib.findByTourToken) return true;
  var found = AdLib.findByTourToken(properties, row.tour_token);
  if (!found) return true;
  var ad = (AdLib.getAdMeta(found).ad || {});
  var access =
    (Tour.getTourAccessForToken && Tour.getTourAccessForToken(ad, row.tour_token)) ||
    Tour.normalizeTourAccess(ad.tour_access || {}, null);
  var hasList =
    (access.allow_emails && access.allow_emails.length) ||
    (access.allow_phones && access.allow_phones.length);
  if (!hasList) return true;
  return Tour.isAllowlisted(access, row.email, row.phone);
}

function inboxPayload(rows, properties) {
  var list = (rows || [])
    .map(function (row) {
      var pub = publicRequestRow(row);
      if (!pub) return null;
      pub.allowlisted = requestAllowlisted(pub, properties);
      return pub;
    })
    .filter(Boolean);
  var pending = list.filter(function (r) {
    return r.status === "pending";
  }).length;
  return { ok: true, pending_count: pending, requests: list };
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
  if (!sql) return null;
  try {
    await require("../ensure-schema").ensureSiteLeadsSchema(sql);
    var emailKey = String(payload.email || "").replace(/[^a-z0-9]/g, "").slice(0, 24);
    var phoneKey = String(payload.phone || "").replace(/\D/g, "").slice(-10);
    var id =
      "lead_tour_" +
      String(payload.token || "").slice(0, 18) +
      "_" +
      (emailKey || phoneKey || "x");
    if (id.length < 16) id = "lead_tour_" + randomUUID();
    var bag = {
      first_name: payload.first_name,
      firstName: payload.first_name,
      need: "visite_virtuelle",
      property_id: payload.property_id,
      propertyIds: payload.property_id ? [payload.property_id] : [],
      tour_token: payload.token,
      city: payload.city,
      title: payload.title,
      utm_source: payload.utm_source || "leboncoin",
    };
    await sql`
      INSERT INTO site_leads (id, source, vertical, email, phone, city, payload, status)
      VALUES (
        ${id},
        ${"visite-virtuelle"},
        ${"acheteur_immo"},
        ${payload.email || null},
        ${payload.phone || null},
        ${payload.city || null},
        ${JSON.stringify(bag)},
        ${"new"}
      )
      ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, site_leads.phone),
        city = COALESCE(EXCLUDED.city, site_leads.city),
        payload = EXCLUDED.payload,
        updated_at = NOW()
    `;
    return id;
  } catch (e) {
    console.warn("[immo-tour-access] lead", e && e.message);
    return null;
  }
}

async function registerTourProspect(sql, ctx) {
  if (!sql) return { leadId: null, contactId: null };
  var email = Tour.normalizeEmail(ctx.email);
  var phone = Tour.normalizePhone(ctx.phone);
  var leadId = await recordLead(sql, {
    token: ctx.token,
    email: email || ctx.store_email || "",
    phone: phone || "",
    first_name: ctx.first_name,
    property_id: ctx.property_id,
    city: ctx.city,
    title: ctx.title,
    utm_source: ctx.utm_source,
  });
  var contactId = null;
  if (email || phone) {
    try {
      var ingest = require("../crm-ingest-from-lead");
      contactId = await ingest.ensureContactLinked(sql, {
        leadId: leadId,
        email: email,
        phone: phone,
        firstName: ctx.first_name,
        source: "visite-virtuelle",
        vertical: "acheteur_immo",
        autoFrom: "tour_request_access",
      });
    } catch (e) {
      console.warn("[immo-tour-access] contact", e && e.message);
    }
  }
  if (contactId && ctx.property_id) {
    try {
      var store = require("../immo-properties-store");
      await store.ensureImmoSchema(sql);
      var existingParty = await sql`
        SELECT id FROM crm_immo_parties
        WHERE property_id = ${ctx.property_id} AND contact_id = ${contactId}
        LIMIT 1
      `;
      if (existingParty[0]) {
        await sql`
          UPDATE crm_immo_parties
          SET
            notes = COALESCE(notes, ${"Demande visite virtuelle"}),
            email = COALESCE(${email || null}, email),
            phone = COALESCE(${phone || null}, phone),
            updated_at = NOW()
          WHERE id = ${existingParty[0].id}
        `;
      } else {
        await store.upsertParty(sql, {
          property_id: ctx.property_id,
          contact_id: contactId,
          role: "prospect",
          name: ctx.first_name || email || "Prospect visite",
          email: email || null,
          phone: phone || null,
          notes: "Demande code visite · " + String(ctx.token || "").slice(0, 14),
        });
      }
    } catch (e2) {
      console.warn("[immo-tour-access] party", e2 && e2.message);
    }
  }
  if (ctx.request_id && (contactId || leadId)) {
    try {
      await sql`
        UPDATE crm_immo_tour_requests
        SET
          contact_id = COALESCE(${contactId || null}, contact_id),
          lead_id = COALESCE(${leadId || null}, lead_id)
        WHERE id = ${ctx.request_id}
      `;
    } catch (e3) {
      console.warn("[immo-tour-access] request link", e3 && e3.message);
    }
  }
  return { leadId: leadId, contactId: contactId };
}

module.exports = async function immoTourAccess(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var ip = getClientIp(req);
  res.setHeader("Cache-Control", "private, no-store");
  var sql = getSql();
  if (sql) {
    await ensureTourSchema(sql);
    await ensureTourRequestSchema(sql);
  }

  if (req.method === "GET") {
    var rlGet = rateLimit("immo-tour-get:" + ip, 40, 60 * 1000);
    if (!rlGet.allowed) return res.status(429).json({ error: "Trop de requêtes" });
    var inboxFlag = String((req.query && (req.query.inbox || req.query.requests)) || "") === "1";
    if (inboxFlag) {
      var userInbox = await getAuthUser(req);
      if (!userInbox) return res.status(401).json({ error: "Connexion CRM requise" });
      if (!sql) return res.status(503).json({ error: "File d’attente indisponible (base)." });
      var listed = await listTourRequests(sql, {
        status: req.query && req.query.status,
        token: req.query && (req.query.token || req.query.t),
        property_id: req.query && req.query.property_id,
      });
      var propsInbox = [];
      try {
        propsInbox = await loadProperties();
      } catch (eIn) {
        propsInbox = [];
      }
      return res.status(200).json(inboxPayload(listed, propsInbox));
    }
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

  if (action === "list_requests") {
    var userList = await getAuthUser(req);
    if (!userList) return res.status(401).json({ error: "Connexion CRM requise" });
    if (!sql) return res.status(503).json({ error: "File d’attente indisponible (base)." });
    var listedPost = await listTourRequests(sql, {
      status: body.status,
      token: token,
      property_id: body.property_id,
    });
    var propsList = [];
    try {
      propsList = await loadProperties();
    } catch (eList) {
      propsList = [];
    }
    return res.status(200).json(inboxPayload(listedPost, propsList));
  }

  if (action === "decide_request") {
    var userDec = await getAuthUser(req);
    if (!userDec) return res.status(401).json({ error: "Connexion CRM requise" });
    if (!sql) return res.status(503).json({ error: "File d’attente indisponible (base)." });
    var reqId = String(body.request_id || body.id || "").trim();
    var rowDec = await findTourRequestById(sql, reqId);
    if (!rowDec && Tour.isTourToken(token)) {
      var keyDec = Tour.storeContactKey(body.email, body.phone, token);
      rowDec = await findTourRequest(sql, token, keyDec);
    }
    if (!rowDec) return res.status(404).json({ ok: false, error: "Demande introuvable." });
    var decision = Tour.applyRequestDecision(body.decision || body.status);
    if (!decision.ok) {
      return res.status(400).json({ ok: false, error: "Indiquez approve ou decline." });
    }
    var reason = String(body.reason || body.decline_reason || "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 240);
    var nowIso = new Date().toISOString();
    var codes = { email_code: "", phone_code: "" };
    var sentCode = { ok: false };
    if (decision.status === "approved") {
      codes = visitorCodes(rowDec.tour_token, rowDec.email, rowDec.phone);
      if (codes.email_code) {
        sentCode = await sendVisitorOtpEmail(rowDec.email, rowDec.first_name, codes.email_code);
      }
      if (Tour.normalizePhone(rowDec.phone) && codes.phone_code) {
        await maybeSendSms(rowDec.phone, codes.phone_code);
      }
    } else if (decision.status === "declined") {
      await sendDeclineEmail(rowDec.email, rowDec.first_name, reason);
    }
    try {
      await sql`
        UPDATE crm_immo_tour_requests
        SET
          status = ${decision.status},
          decline_reason = ${decision.status === "declined" ? reason || null : null},
          decided_at = ${nowIso},
          decided_by = ${String(userDec.email || userDec.userId || "crm")},
          code_sent_at = ${decision.status === "approved" && sentCode.ok ? nowIso : rowDec.code_sent_at || null}
        WHERE id = ${rowDec.id}
      `;
    } catch (eUp) {
      return res.status(500).json({ ok: false, error: "Enregistrement impossible." });
    }
    var linked = await registerTourProspect(sql, {
      token: rowDec.tour_token,
      email: rowDec.email,
      phone: rowDec.phone,
      store_email: rowDec.email,
      first_name: rowDec.first_name,
      property_id: rowDec.property_id,
      city: "",
      title: rowDec.property_title,
      utm_source: rowDec.utm_source || "leboncoin",
      request_id: rowDec.id,
    });
    var fresh = await findTourRequestById(sql, rowDec.id);
    if (fresh && linked && linked.contactId) fresh.contact_id = linked.contactId;
    if (fresh && linked && linked.leadId) fresh.lead_id = linked.leadId;
    return res.status(200).json({
      ok: true,
      request: publicRequestRow(fresh || rowDec),
      email_code: codes.email_code || "",
      phone_code: codes.phone_code || "",
      delivery_email: !!(decision.status === "approved" && sentCode.ok),
      expires_minutes: decision.status === "approved" ? 10 : 0,
      message:
        decision.status === "declined"
          ? "Demande déclinée. Le visiteur ne pourra pas ouvrir la visite."
          : sentCode.ok
            ? "Demande validée. Code envoyé par e-mail (10 min)."
            : codes.email_code
              ? "Demande validée. Code à transmettre : " + codes.email_code + " (e-mail non parti)."
              : "Demande validée.",
    });
  }

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
    var storeC = Tour.storeContactKey(emailC, phoneC, token);
    if (sql) {
      try {
        await upsertTourRequest(sql, {
          tour_token: token,
          property_id: found.id,
          property_title: (info.ad && info.ad.headline) || found.title || "",
          link_name: info.access && info.access.name,
          first_name: Tour.normalizeName(body.first_name),
          email: storeC,
          phone: phoneC,
          status: "approved",
          decided_at: new Date().toISOString(),
          decided_by: String(userCode.email || userCode.userId || "crm"),
        });
      } catch (eCode) {
        console.warn("[immo-tour-access] advisor_code request", eCode && eCode.message);
      }
      var reqC = await findTourRequest(sql, token, storeC);
      await registerTourProspect(sql, {
        token: token,
        email: emailC,
        phone: phoneC,
        store_email: storeC,
        first_name: Tour.normalizeName(body.first_name),
        property_id: found.id,
        city: found.city,
        title: (info.ad && info.ad.headline) || found.title,
        utm_source: "crm",
        request_id: reqC && reqC.id,
      });
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
    var onAllowlist = Tour.isAllowlisted(info.access, email, phone);
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
        pending: false,
        delivery_email: false,
        delivery_sms: false,
        message: "Cochez l’acceptation des droits d’auteur, puis ouvrez la visite.",
      });
    }

    if (!sql) {
      return res.status(503).json({
        ok: false,
        error: "Demande enregistrée localement impossible. Réessayez dans un instant.",
      });
    }

    var storeEmail = Tour.storeContactKey(email, phone, token);
    var existingReq = await findTourRequest(sql, token, storeEmail);
    var ask = Tour.nextAskOutcome(existingReq && existingReq.status);
    if (!ask.ok) {
      return res.status(403).json({
        ok: false,
        pending: false,
        declined: true,
        error: Tour.requestStatusMessage("declined"),
        contact: { name: Tour.AUTHOR.name, href: Tour.AUTHOR.contact_path, email: Tour.AUTHOR.email },
      });
    }

    if (ask.create || !existingReq) {
      try {
        existingReq = await upsertTourRequest(sql, {
          tour_token: token,
          property_id: found.id,
          property_title: (info.ad && info.ad.headline) || found.title || "",
          link_name: info.access && info.access.name,
          first_name: firstName,
          email: storeEmail,
          phone: phone,
          status: "pending",
          utm_source: body.utm_source || "leboncoin",
        });
      } catch (eAsk) {
        console.warn("[immo-tour-access] request upsert", eAsk && eAsk.message);
        return res.status(500).json({ ok: false, error: "Impossible d’enregistrer la demande." });
      }
      notifyAdvisorNewRequest(
        Object.assign({}, existingReq || {}, {
          first_name: firstName,
          email: email,
          phone: phone,
          property_title: (info.ad && info.ad.headline) || found.title || "",
          link_name: info.access && info.access.name,
          allowlisted: onAllowlist,
        })
      ).catch(function () {});
    }

    await registerTourProspect(sql, {
      token: token,
      email: email,
      phone: phone,
      store_email: storeEmail,
      first_name: firstName,
      property_id: found.id,
      city: found.city,
      title: (info.ad && info.ad.headline) || found.title,
      utm_source: body.utm_source || "leboncoin",
      request_id: existingReq && existingReq.id,
    });

    if (ask.resend) {
      var resendCodes = visitorCodes(token, email, phone);
      var resent = { ok: false };
      if (resendCodes.email_code) {
        resent = await sendVisitorOtpEmail(email, firstName, resendCodes.email_code);
      }
      return res.status(200).json({
        ok: true,
        skip_otp: false,
        pending: false,
        approved: true,
        delivery_email: !!resent.ok,
        delivery_sms: false,
        contact_email: email ? Tour.maskEmail(email) : "",
        contact_phone: phone ? Tour.maskPhone(phone) : "",
        message: resent.ok
          ? "Votre accès est déjà validé. Un nouveau code a été envoyé par e-mail (10 min)."
          : "Votre accès est déjà validé. Saisissez le code reçu, ou contactez Wendy BUCHET.",
      });
    }

    return res.status(200).json({
      ok: true,
      skip_otp: false,
      pending: true,
      delivery_email: false,
      delivery_sms: false,
      contact_email: email ? Tour.maskEmail(email) : "",
      contact_phone: phone ? Tour.maskPhone(phone) : "",
      message:
        "Demande envoyée. Wendy BUCHET va la valider ou la décliner. Si elle accepte, vous recevrez un code par e-mail.",
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
    // Accès libre (verify_mode none) : lien public (LBC/site) — la allowlist ne bloque pas.
    // Elle ne s’applique qu’aux modes e-mail / SMS (OTP).
    if (Tour.needsEmail(info.access) && !emailV) {
      return res.status(400).json({ ok: false, error: "E-mail requis." });
    }
    if (Tour.needsPhone(info.access) && !phoneV) {
      return res.status(400).json({ ok: false, error: "Téléphone requis." });
    }
    if (Tour.needsOtp(info.access) && sql) {
      var storePending = Tour.storeContactKey(emailV, phoneV, token);
      var gateReq = await findTourRequest(sql, token, storePending);
      var gateStatus = gateReq ? gateReq.status : "";
      if (!Tour.requestCanVerify(gateStatus)) {
        return res.status(403).json({
          ok: false,
          pending: gateStatus === "pending",
          declined: gateStatus === "declined",
          error: Tour.requestStatusMessage(gateStatus),
          contact: { name: Tour.AUTHOR.name, href: Tour.AUTHOR.contact_path, email: Tour.AUTHOR.email },
        });
      }
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
      await registerTourProspect(sql, {
        token: token,
        email: emailV,
        phone: phoneV,
        store_email: storeEmail,
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
