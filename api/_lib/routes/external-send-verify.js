/**
 * POST /api/external/send-verify — renvoie l'e-mail de confirmation client
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { sendEmailVerification, safeReturnPath } = require("../external-client-auth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var ip = getClientIp(req);
  var rl = rateLimit("ext-send-verify:" + ip, 5, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de demandes — réessayez plus tard." });

  var parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  var email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (!email) return res.status(400).json({ error: "E-mail requis" });

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données indisponible" });

  try {
    var rows = await sql`
      SELECT id, first_name, metadata FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ error: "Aucun compte pour cet e-mail — déposez d'abord votre bien ou inscrivez-vous." });
    }
    var contact = rows[0];
    var sent = await sendEmailVerification(
      contact.id,
      email,
      contact.first_name,
      safeReturnPath(body.returnTo || "/external/dashboard.html")
    );
    return res.status(200).json({
      ok: true,
      sent: sent.ok,
      message: sent.ok
        ? "E-mail de confirmation envoyé — vérifiez votre boîte (et les spams)."
        : "Compte trouvé mais l'e-mail n'a pas pu être envoyé (configuration serveur).",
    });
  } catch (e) {
    console.error("[external/send-verify]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
