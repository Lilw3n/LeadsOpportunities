/**
 * Compte client externe : jeton session, e-mail de confirmation, Google.
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");
const { buildProfileMetadata, mergeMeta } = require("./crm-profile-meta");

function getAppUrl() {
  var raw = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.leadsopportunities.fr";
  return String(raw).trim().replace(/\/$/, "");
}

function makeExtToken() {
  return "ext_" + crypto.randomBytes(24).toString("hex");
}

function signEmailVerifyToken(contactId, email) {
  return jwt.sign(
    { purpose: "email_verify", contactId: contactId, email: email },
    requireJwtSecret(),
    { expiresIn: "72h", algorithm: "HS256", issuer: "leads-opportunities" }
  );
}

function verifyEmailVerifyToken(token) {
  try {
    var decoded = jwt.verify(token, requireJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "leads-opportunities",
    });
    if (!decoded || decoded.purpose !== "email_verify" || !decoded.contactId || !decoded.email) return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendClientEmail({ to, subject, html }) {
  var key = process.env.RESEND_API_KEY;
  if (!key || !to) return { ok: false, reason: "no_resend" };
  var from = process.env.LEAD_FROM_EMAIL || "Leads Opportunities <contact@leadsopportunities.fr>";
  var res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: from, to: [to], subject: subject, html: html }),
  });
  if (!res.ok) {
    var errText = await res.text();
    console.warn("[external-client-auth] resend", res.status, errText);
    return { ok: false, reason: "resend_error" };
  }
  return { ok: true };
}

async function sendEmailVerification(contactId, email, firstName, returnPath) {
  var token = signEmailVerifyToken(contactId, email);
  var base = getAppUrl();
  var verifyUrl =
    base + "/api/external/verify-email?token=" + encodeURIComponent(token) + "&return=" + encodeURIComponent(returnPath || "/external/dashboard.html");
  var resumeUrl = base + "/landings/acheteur-immo.html?hat=vendeur&reprise=1#deposer-bien";
  var name = firstName || "Bonjour";
  var html =
    "<div style=\"font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;line-height:1.55;color:#334155\">" +
    "<h2 style=\"color:#0f766e\">Confirmez votre adresse e-mail</h2>" +
    "<p>" +
    escapeHtml(name) +
    ",</p>" +
    "<p>Merci pour votre dépôt sur <strong>Leads Opportunities</strong>. Cliquez pour confirmer votre e-mail et accéder à votre espace client :</p>" +
    "<p><a href=\"" +
    verifyUrl +
    "\" style=\"display:inline-block;background:#0d9488;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700\">Confirmer mon e-mail</a></p>" +
    "<p style=\"font-size:0.9rem;color:#64748b\">Vous pourrez aussi reprendre votre dossier vendeur : <a href=\"" +
    resumeUrl +
    "\">Reprendre mon formulaire</a></p>" +
    "<p style=\"font-size:0.82rem;color:#94a3b8\">Lien valable 72 h. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>" +
    "</div>";
  return sendClientEmail({
    to: email,
    subject: "Confirmez votre e-mail — Leads Opportunities",
    html: html,
  });
}

async function upsertContactGoogle(sql, profile) {
  var email = String(profile.email || "")
    .trim()
    .toLowerCase();
  if (!email) throw new Error("Email Google manquant");
  var googleId = String(profile.id || "");
  var firstName = profile.given_name || (profile.name || email.split("@")[0]).split(" ")[0];
  var lastName = profile.family_name || "";
  var avatarUrl = profile.picture || null;

  var existing = await sql`
    SELECT id, metadata FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
  `;

  var metaPatch = {
    authProvider: "google",
    googleId: googleId,
    avatarUrl: avatarUrl,
    emailVerifiedAt: new Date().toISOString(),
    confirmByEmail: true,
  };

  var contactId;
  if (existing.length) {
    contactId = existing[0].id;
    var meta = {};
    try {
      meta = existing[0].metadata ? JSON.parse(existing[0].metadata) : {};
    } catch (e) {}
    meta = mergeMeta(meta, buildProfileMetadata({ primaryNeed: "vendeur_immo", source: "google_oauth" }));
    Object.assign(meta, metaPatch);
    await sql`
      UPDATE crm_contacts SET
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName || null}, last_name),
        metadata = ${JSON.stringify(meta)},
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE id = ${contactId}
    `;
  } else {
    contactId = "ct_" + crypto.randomUUID();
    var meta = mergeMeta({}, buildProfileMetadata({ primaryNeed: "vendeur_immo", source: "google_oauth" }));
    Object.assign(meta, metaPatch);
    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone,
        status, source, notes, metadata, last_activity_at
      ) VALUES (
        ${contactId}, 'prospect', ${firstName}, ${lastName || null}, ${email}, ${null},
        'active', 'google_oauth_client',
        ${"Connexion Google portail client"},
        ${JSON.stringify(meta)},
        NOW()
      )
    `;
  }

  return { contactId: contactId, email: email, firstName: firstName, lastName: lastName, avatarUrl: avatarUrl };
}

function safeReturnPath(path) {
  var p = String(path || "").trim();
  if (!p || p.indexOf("http") === 0) return "/external/dashboard.html";
  if (p.indexOf("/") !== 0) p = "/" + p;
  var allowed =
    p.indexOf("/external/") === 0 ||
    p.indexOf("/landings/") === 0 ||
    p === "/external/dashboard.html";
  return allowed ? p : "/external/dashboard.html";
}

module.exports = {
  getAppUrl,
  makeExtToken,
  sendEmailVerification,
  verifyEmailVerifyToken,
  upsertContactGoogle,
  safeReturnPath,
  sendClientEmail,
};
