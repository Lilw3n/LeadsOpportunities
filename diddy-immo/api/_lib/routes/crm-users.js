const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const {
  requireCrm,
  canManageCollaborators,
  COLLABORATOR_CRM_ROLES,
  isSiteAdmin,
} = require("../rbac");
const { getSql } = require("../db");
const { hashPassword } = require("../auth");

function collaboratorRoleOrError(crmRole) {
  const r = String(crmRole || "commercial").toLowerCase();
  if (COLLABORATOR_CRM_ROLES.indexOf(r) === -1) {
    return { error: "Role collaborateur invalide (staff, commercial, apporteur)" };
  }
  return { role: r };
}

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
      const { getAdminEmails, getMatterportAdminEmails, primaryMatterportAdminEmail } = require("../admin-emails");
      return res.status(200).json({
        ok: true,
        users: rows,
        canManage: canManageCollaborators(user),
        adminEmails: getAdminEmails(),
        matterportAdminEmails: getMatterportAdminEmails(),
        matterportAdminEmail: primaryMatterportAdminEmail(),
      });
    } catch (e) {
      console.error("[crm/users GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    if (!canManageCollaborators(user)) {
      return res.status(403).json({ error: "Seul l administrateur peut creer des collaborateurs" });
    }

    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const asSiteAdmin =
      body.siteAdmin === true ||
      body.asSiteAdmin === true ||
      String(body.crmRole || body.crm_role || "").toLowerCase() === "admin";

    if (!email || password.length < 8) {
      return res.status(400).json({ error: "Email et mot de passe (8+ caracteres) requis" });
    }

    let siteRole = "user";
    let crmRole = null;
    if (asSiteAdmin) {
      if (!isSiteAdmin(user)) {
        return res.status(403).json({ error: "Seul un administrateur site peut creer un co-admin" });
      }
      siteRole = "admin";
      crmRole = "admin";
    } else {
      const roleCheck = collaboratorRoleOrError(body.crmRole || body.crm_role);
      if (roleCheck.error) return res.status(400).json({ error: roleCheck.error });
      crmRole = roleCheck.role;
    }

    const { hash, salt } = hashPassword(password);
    const id = "usr_" + crypto.randomUUID();

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
      return res.status(201).json({
        ok: true,
        id,
        crmRole,
        siteAdmin: siteRole === "admin",
      });
    } catch (e) {
      if (String(e.message || "").indexOf("unique") !== -1) {
        return res.status(409).json({ error: "Email deja utilise" });
      }
      console.error("[crm/users POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH") {
    if (!canManageCollaborators(user)) {
      return res.status(403).json({ error: "Seul l administrateur peut modifier les collaborateurs" });
    }

    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const targetId = String(body.id || "").trim();
    if (!targetId) return res.status(400).json({ error: "id requis" });

    try {
      const existing = await sql`
        SELECT id, email, role, crm_role FROM users WHERE id = ${targetId} LIMIT 1
      `;
      if (!existing.length) return res.status(404).json({ error: "Utilisateur introuvable" });
      const target = existing[0];
      const promoteToSiteAdmin =
        body.promoteToSiteAdmin === true || body.siteAdmin === true || body.asSiteAdmin === true;

      if (promoteToSiteAdmin) {
        if (!isSiteAdmin(user)) {
          return res.status(403).json({ error: "Seul un administrateur site peut promouvoir un co-admin" });
        }
        if (target.id === user.id) {
          return res.status(400).json({ error: "Compte deja administrateur" });
        }
        await sql`
          UPDATE users SET role = 'admin', crm_role = 'admin', status = 'active', updated_at = now()
          WHERE id = ${targetId}
        `;
        return res.status(200).json({ ok: true, siteAdmin: true, promoted: true });
      }

      if (target.role === "admin") {
        return res.status(403).json({
          error: "Le compte administrateur ne peut pas etre modifie ici (sauf promotion co-admin deja appliquee)",
        });
      }

      const updates = {};
      if (body.fullName != null || body.full_name != null) {
        updates.full_name = String(body.fullName || body.full_name || "").trim() || null;
      }
      if (body.phone != null) updates.phone = String(body.phone || "").trim() || null;
      if (body.status != null) {
        const st = String(body.status).toLowerCase();
        if (st !== "active" && st !== "inactive") {
          return res.status(400).json({ error: "status: active ou inactive" });
        }
        updates.status = st;
      }
      if (body.crmRole != null || body.crm_role != null) {
        const roleCheck = collaboratorRoleOrError(body.crmRole || body.crm_role);
        if (roleCheck.error) return res.status(400).json({ error: roleCheck.error });
        updates.crm_role = roleCheck.role;
      }
      if (body.password && String(body.password).length >= 8) {
        const hp = hashPassword(String(body.password));
        updates.password_hash = hp.hash;
        updates.salt = hp.salt;
      }

      const keys = Object.keys(updates);
      if (!keys.length) return res.status(400).json({ error: "Aucune modification" });

      if (updates.full_name !== undefined) {
        await sql`UPDATE users SET full_name = ${updates.full_name}, updated_at = now() WHERE id = ${targetId}`;
      }
      if (updates.phone !== undefined) {
        await sql`UPDATE users SET phone = ${updates.phone}, updated_at = now() WHERE id = ${targetId}`;
      }
      if (updates.status !== undefined) {
        await sql`UPDATE users SET status = ${updates.status}, updated_at = now() WHERE id = ${targetId}`;
      }
      if (updates.crm_role !== undefined) {
        await sql`UPDATE users SET crm_role = ${updates.crm_role}, updated_at = now() WHERE id = ${targetId}`;
      }
      if (updates.password_hash) {
        await sql`UPDATE users SET password_hash = ${updates.password_hash}, salt = ${updates.salt}, updated_at = now() WHERE id = ${targetId}`;
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/users PATCH]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
