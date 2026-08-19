/**
 * GET /api/external/lookup-coords?email=&phone=
 * Vérifie si des coordonnées existent déjà en CRM (pré-remplissage formulaire vendeur).
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { findExistingContact } = require("../crm-ingest-from-lead");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var ip = getClientIp(req);
  var rl = rateLimit("ext-lookup-coords:" + ip, 30, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de demandes — réessayez dans un instant." });

  var email = req.query.email ? String(req.query.email).trim().toLowerCase() : "";
  var phone = req.query.phone ? String(req.query.phone).trim() : "";
  var digits = phone.replace(/\D/g, "");

  if (!email && digits.length < 10) {
    return res.status(400).json({ error: "Indiquez un e-mail ou un téléphone valide." });
  }

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données indisponible" });

  try {
    var contactId = await findExistingContact(sql, email || null, phone || null);
    if (!contactId) {
      return res.status(200).json({ found: false });
    }

    var rows = await sql`
      SELECT first_name, last_name, email, phone
      FROM crm_contacts
      WHERE id = ${contactId}
      LIMIT 1
    `;
    if (!rows.length) {
      return res.status(200).json({ found: false });
    }

    var c = rows[0];
    return res.status(200).json({
      found: true,
      firstName: c.first_name || "",
      lastName: c.last_name || "",
      email: c.email || "",
      phone: c.phone || "",
      message:
        "Dossier déjà connu — vos coordonnées ont été reprises. Ce dépôt mettra à jour votre espace client.",
    });
  } catch (e) {
    console.error("[external/lookup-coords]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
