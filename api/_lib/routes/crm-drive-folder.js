/**
 * GET /api/crm/drive-folder?contactId=
 * Assure le dossier contact Drive + partage courtier + lien ouvrable.
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { ensureClientDriveFolders } = require("../drive-folders");
const { ensurePropertyDriveFolders } = require("../immo-drive");
const { resolveFolderWebLink, isValidDriveId, rootFolderWebLink, fallbackFolderUrl } = require("../drive-share");
const { isDriveConfigured, isDriveUploadConfigured, getRootFolderId } = require("../google-drive-auth");

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
  const propertyId = url.searchParams.get("propertyId");
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

    if (propertyId) {
      const props = await sql`
        SELECT id, title, city, postal_code, drive_folder_id, owner_contact_id, lead_id, metadata_json
        FROM crm_immo_properties
        WHERE id = ${propertyId}
          AND owner_contact_id = ${contactId}
        LIMIT 1
      `;
      if (!props.length) return res.status(404).json({ error: "Bien introuvable pour ce contact" });
      var prop = props[0];
      var propFolderId = prop.drive_folder_id || null;
      if (!isValidDriveId(propFolderId)) {
        var ensuredProp = await ensurePropertyDriveFolders({
          id: prop.id,
          title: prop.title,
          city: prop.city,
          postal_code: prop.postal_code,
          drive_folder_id: prop.drive_folder_id,
        });
        if (ensuredProp && ensuredProp.folderId) {
          propFolderId = ensuredProp.folderId;
          await sql`
            UPDATE crm_immo_properties
            SET drive_folder_id = ${propFolderId}, updated_at = NOW()
            WHERE id = ${prop.id} AND drive_folder_id IS NULL
          `;
        }
      }
      if (!isValidDriveId(propFolderId)) {
        return res.status(200).json({
          ok: false,
          error: "Dossier Drive du bien non créé — vérifiez la configuration Google Drive.",
          contactId: contactId,
          propertyId: propertyId,
          driveConfigured: isDriveConfigured() && !!getRootFolderId(),
          uploadConfigured: isDriveUploadConfigured(),
          setupUrl: "https://www.leadsopportunities.fr/test-drive.html",
        });
      }
      var resolvedProp = await resolveFolderWebLink(propFolderId, { share: true });
      var propLink = resolvedProp.webViewLink || fallbackFolderUrl(propFolderId);
      return res.status(200).json({
        ok: !!propLink,
        contactId: contactId,
        propertyId: propertyId,
        folderId: propFolderId,
        webViewLink: propLink,
        folderName: resolvedProp.name || prop.title || null,
        shared: true,
        error: resolvedProp.error || null,
      });
    }

    var folderId = contacts[0].drive_folder_id || null;
    var ensured = null;
    if (!isValidDriveId(folderId)) {
      ensured = await ensureClientDriveFolders(contactId);
      if (ensured && ensured.folderId) folderId = ensured.folderId;
    }

    if (!isValidDriveId(folderId)) {
      var setupUrl = "https://www.leadsopportunities.fr/test-drive.html";
      var ensuredErr = ensured && ensured.error ? ensured.error : null;
      return res.status(200).json({
        ok: false,
        error:
          ensuredErr ||
          "Dossier Drive non créé — Google Drive n'est pas configuré sur le serveur (GOOGLE_DRIVE_REFRESH_TOKEN requis).",
        contactId: contactId,
        driveConfigured: isDriveConfigured() && !!getRootFolderId(),
        uploadConfigured: isDriveUploadConfigured(),
        rootFolderLink: rootFolderWebLink(),
        setupUrl: setupUrl,
      });
    }

    var resolved = await resolveFolderWebLink(folderId, { share: true });
    var webViewLink = resolved.webViewLink || fallbackFolderUrl(folderId);
    return res.status(200).json({
      ok: !!webViewLink,
      contactId: contactId,
      folderId: folderId,
      webViewLink: webViewLink,
      folderName: resolved.name || null,
      shared: true,
      error: resolved.error || null,
    });
  } catch (e) {
    console.error("[crm/drive-folder]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
