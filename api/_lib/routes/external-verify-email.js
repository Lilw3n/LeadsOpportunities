/**
 * GET /api/external/verify-email?token=... — confirme l'e-mail client
 */
const { applyApiGuards } = require("../security");
const { getSql } = require("../db");
const { verifyEmailVerifyToken, makeExtToken, getAppUrl, safeReturnPath } = require("../external-client-auth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var url = new URL(req.url, "http://localhost");
  var token = url.searchParams.get("token") || "";
  var returnTo = safeReturnPath(url.searchParams.get("return") || "/external/dashboard.html");
  var decoded = verifyEmailVerifyToken(token);

  if (!decoded) {
    res.writeHead(302, {
      Location: getAppUrl() + "/external/login.html?verify_error=" + encodeURIComponent("Lien expiré ou invalide"),
    });
    res.end();
    return;
  }

  var sql = getSql();
  if (!sql) {
    res.writeHead(302, { Location: getAppUrl() + "/external/login.html?verify_error=db" });
    res.end();
    return;
  }

  try {
    var rows = await sql`
      SELECT id, email, first_name, last_name, phone, metadata FROM crm_contacts WHERE id = ${decoded.contactId} LIMIT 1
    `;
    if (!rows.length || String(rows[0].email).toLowerCase() !== String(decoded.email).toLowerCase()) {
      res.writeHead(302, {
        Location: getAppUrl() + "/external/login.html?verify_error=" + encodeURIComponent("Compte introuvable"),
      });
      res.end();
      return;
    }
    var contact = rows[0];
    var meta = {};
    try {
      meta = contact.metadata ? JSON.parse(contact.metadata) : {};
    } catch (e) {}
    meta.emailVerifiedAt = new Date().toISOString();
    meta.confirmByEmail = true;
    await sql`
      UPDATE crm_contacts SET metadata = ${JSON.stringify(meta)}, updated_at = NOW(), last_activity_at = NOW()
      WHERE id = ${contact.id}
    `;

    var extToken = makeExtToken();
    var q = new URLSearchParams({
      verify: "success",
      token: extToken,
      email: contact.email,
      dest: returnTo,
    });
    res.writeHead(302, { Location: getAppUrl() + "/external/login.html?" + q.toString() });
    res.end();
  } catch (e) {
    console.error("[external/verify-email]", e);
    res.writeHead(302, {
      Location: getAppUrl() + "/external/login.html?verify_error=" + encodeURIComponent("Erreur de confirmation"),
    });
    res.end();
  }
};
