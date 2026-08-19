/**
 * GET /api/crm/drive-folder?contactId=
 * Assure le dossier contact Drive + partage courtier + lien ouvrable.
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { ensureClientDriveFolders } = require("../drive-folders");
const { resolveFolderWebLink, isValidDriveId } = require("../drive-share");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId") || url.searchParams.get("id");
  if (!contactId) return res.status(400).json({ error: "contactId requis" });

  try {
    const contacts = await sql`
      SELECT id, first_name, last_name, email, drive_folder_id
      FROM crm_contacts
      WHERE id = ${contactId}
        AND (${scope}::text IS NULL OR assigned_to = ${scope})
      LIMIT 1
    `;
    if (!contacts.length) return res.status(404).json({ error: "Contact introuvable" });

    var folderId = contacts[0].drive_folder_id || null;
    if (!isValidDriveId(folderId)) {
      var ensured = await ensureClientDriveFolders(contactId);
      if (ensured && ensured.folderId) folderId = ensured.folderId;
    }

    if (!isValidDriveId(folderId)) {
      return res.status(200).json({
        ok: false,
        error: "Dossier Drive non créé — vérifiez docs/DRIVE-SETUP.md (GOOGLE_DRIVE_REFRESH_TOKEN)",
        contactId: contactId,
      });
    }

    var resolved = await resolveFolderWebLink(folderId, { share: true });
    return res.status(200).json({
      ok: !!resolved.ok,
      contactId: contactId,
      folderId: folderId,
      webViewLink: resolved.webViewLink || null,
      folderName: resolved.name || null,
      shared: true,
      error: resolved.error || null,
    });
  } catch (e) {
    console.error("[crm/drive-folder]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
