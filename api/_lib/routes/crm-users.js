const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, canManageUsers, ALL_CRM_ROLES } = require("../rbac");
const { getSql } = require("../db");
const { hashPassword } = require("../auth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, email, role, crm_role, full_name, phone, status, created_at, last_login_at
        FROM users
        WHERE role = 'admin' OR crm_role IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 200
      `;
      return res.status(200).json({ ok: true, users: rows });
    } catch (e) {
      console.error("[crm/users GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    if (!canManageUsers(user)) {
      return res.status(403).json({ error: "Droits insuffisants" });
    }

    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const crmRole = String(body.crmRole || body.crm_role || "commercial").toLowerCase();

    if (!email || password.length < 8) {
      return res.status(400).json({ error: "Email et mot de passe (8+ caracteres) requis" });
    }
    if (ALL_CRM_ROLES.indexOf(crmRole) === -1) {
      return res.status(400).json({ error: "Role CRM invalide" });
    }

    const { hash, salt } = hashPassword(password);
    const id = "usr_" + crypto.randomUUID();
    const siteRole = crmRole === "admin" ? "admin" : "user";

    try {
      await sql`
        INSERT INTO users (id, email, password_hash, salt, role, crm_role, full_name, phone, status)
        VALUES (
          ${id}, ${email}, ${hash}, ${salt}, ${siteRole}, ${crmRole},
          ${body.fullName || body.full_name || null},
          ${body.phone || null},
          'active'
        )
      `;
      return res.status(201).json({ ok: true, id });
    } catch (e) {
      if (String(e.message || "").indexOf("unique") !== -1) {
        return res.status(409).json({ error: "Email deja utilise" });
      }
      console.error("[crm/users POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
