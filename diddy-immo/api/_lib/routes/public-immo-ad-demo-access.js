/**
 * POST /api/immo-ad-demo-access
 * - request_code { token, email? | phone? }
 * - verify_code { token, email? | phone?, code }
 * - advisor_phone_code { token, phone } + Bearer CRM
 * GET /api/immo-ad-demo-access?token=… → méthodes d'accès (sans listing)
 */
const crypto = require("crypto");
const { applyApiGuards, rateLimit, getClientIp, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const { getAuthUser } = require("../auth");
const AdLib = require("../../../js/immo-ad-listings-lib.js");
const Access = require("../../../js/immo-ad-demo-access-lib.js");
const { sendViaResend } = require("../mail-send");

async function loadProperties() {
  var sql = getSql();
  if (!sql) return [];
  var store = require("../immo-properties-store");
  var db = await store.loadAll(sql);
  return db.properties || [];
}

function findDemo(properties, token) {
  return AdLib.findByShareToken(properties, token);
}

async function maybeSendSms(phone, code) {
  var flag = String(process.env.TWILIO_SMS_ENABLED || "").toLowerCase();
  if (flag !== "1" && flag !== "true" && flag !== "on") return { ok: false, reason: "sms_disabled" };
  var sid = process.env.TWILIO_ACCOUNT_SID;
  var token = process.env.TWILIO_AUTH_TOKEN;
  var from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false, reason: "no_twilio" };
  try {
    var auth = Buffer.from(sid + ":" + token).toString("base64");
    var body = new URLSearchParams({
      To: phone.replace(/^0/, "+33"),
      From: from,
      Body: "Leads Opportunities — code démo pub : " + code + " (valable 10 min)",
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

module.exports = async function immoAdDemoAccess(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var ip = getClientIp(req);
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method === "GET") {
    var rlGet = rateLimit("immo-demo-access-get:" + ip, 40, 60 * 1000);
    if (!rlGet.allowed) return res.status(429).json({ error: "Trop de requêtes" });
    var tokenGet = String((req.query && req.query.token) || "").trim();
    if (!tokenGet) return res.status(400).json({ error: "token requis" });
    var propsGet = [];
    try {
      propsGet = await loadProperties();
    } catch (e) {
      propsGet = [];
    }
    var demoGet = findDemo(propsGet, tokenGet);
    if (!demoGet) return res.status(404).json({ ok: false, error: "Démo introuvable" });
    var bagGet = AdLib.getAdMeta(demoGet);
    var restricted = Access.hasRestrictedAccess(bagGet.ad);
    return res.status(200).json({
      ok: true,
      requires_auth: restricted,
      methods: Access.accessMethods(bagGet.ad),
      title: String((bagGet.ad && bagGet.ad.headline) || demoGet.title || "Démo privée").slice(0, 80),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var rl = rateLimit("immo-demo-access:" + ip, 30, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  var parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  var action = String(body.action || "").trim();
  var token = String(body.token || "").trim();
  if (!token || token.length < 8) return res.status(400).json({ error: "token invalide" });

  var properties = [];
  try {
    properties = await loadProperties();
  } catch (err) {
    properties = [];
  }
  var demo = findDemo(properties, token);
  if (!demo) return res.status(404).json({ ok: false, error: "Démo introuvable ou expirée" });
  var bag = AdLib.getAdMeta(demo);
  var ad = bag.ad || {};

  if (action === "advisor_phone_code") {
    var user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Connexion CRM requise" });
    var phoneAdv = Access.normalizePhone(body.phone);
    if (!phoneAdv) return res.status(400).json({ error: "Téléphone invalide" });
    var allowedAdv = Access.contactAllowed(ad, "", phoneAdv);
    if (!allowedAdv.ok) return res.status(403).json({ error: "Téléphone non autorisé sur cette démo" });
    var codeAdv = Access.otpCode(token, phoneAdv);
    return res.status(200).json({
      ok: true,
      phone: Access.maskPhone(phoneAdv),
      code: codeAdv,
      valid_minutes: Math.round(Access.WINDOW_MS / 60000),
    });
  }

  if (action === "advisor_preview_grant") {
    var userPrev = await getAuthUser(req);
    if (!userPrev) return res.status(401).json({ error: "Connexion CRM requise" });
    var contactKey = "admin:" + String(userPrev.userId || userPrev.email || "crm");
    var grantPrev = Access.makeGrant(token, contactKey);
    return res.status(200).json({
      ok: true,
      grant: grantPrev,
      preview_url:
        "/immobilier/demo-pub-vendeur.html?token=" +
        encodeURIComponent(token) +
        "&grant=" +
        encodeURIComponent(grantPrev) +
        "&admin=1",
      listing: AdLib.toAdListing(demo),
    });
  }

  if (action === "request_code") {
    var allowed = Access.contactAllowed(ad, body.email, body.phone);
    if (!allowed.ok) {
      return res.status(403).json({
        ok: false,
        error: "Cet e-mail ou téléphone n’est pas autorisé pour cette démo.",
      });
    }
    var code = Access.otpCode(token, allowed.contact);
    if (allowed.kind === "email") {
      var sent = await sendViaResend({
        to: allowed.contact,
        subject: "Code d’accès — démo pub Leads Opportunities",
        text:
          "Bonjour,\n\nVotre code d’accès à la démonstration publicitaire est : " +
          code +
          "\nValable 10 minutes.\n\nLeads Opportunities — Wendy Buchet",
        html:
          "<p>Bonjour,</p><p>Votre code d’accès à la démonstration publicitaire est :</p>" +
          "<p style=\"font-size:28px;font-weight:800;letter-spacing:4px\">" +
          code +
          "</p><p>Valable 10 minutes.</p><p>Leads Opportunities — Wendy Buchet</p>",
      });
      if (!sent.ok) {
        return res.status(502).json({
          ok: false,
          error: sent.error || "Envoi e-mail impossible. Réessayez ou contactez votre conseiller.",
        });
      }
      return res.status(200).json({
        ok: true,
        delivery: "email",
        contact_masked: Access.maskEmail(allowed.contact),
        message: "Code envoyé par e-mail.",
      });
    }

    var sms = await maybeSendSms(allowed.contact, code);
    if (sms.ok) {
      return res.status(200).json({
        ok: true,
        delivery: "sms",
        contact_masked: Access.maskPhone(allowed.contact),
        message: "Code envoyé par SMS.",
      });
    }
    return res.status(200).json({
      ok: true,
      delivery: "advisor",
      contact_masked: Access.maskPhone(allowed.contact),
      message:
        "SMS non configuré : demandez le code à 6 chiffres à votre conseiller (il l’affiche dans le CRM).",
    });
  }

  if (action === "verify_code") {
    var allowedV = Access.contactAllowed(ad, body.email, body.phone);
    if (!allowedV.ok) {
      return res.status(403).json({ ok: false, error: "Contact non autorisé" });
    }
    if (!Access.verifyOtp(token, allowedV.contact, body.code)) {
      return res.status(401).json({ ok: false, error: "Code incorrect ou expiré" });
    }
    var grant = Access.makeGrant(token, allowedV.contact);
    return res.status(200).json({
      ok: true,
      grant: grant,
      listing: AdLib.toAdListing(demo),
      contact_masked:
        allowedV.kind === "email" ? Access.maskEmail(allowedV.contact) : Access.maskPhone(allowedV.contact),
    });
  }

  return res.status(400).json({ error: "action inconnue" });
};
