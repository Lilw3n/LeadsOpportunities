/**
 * GET /api/crm/drive-folder?contactId=
 * Assure le dossier contact Drive + partage courtier + lien ouvrable.
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { ensureClientDriveFolders } = require("../drive-folders");
const { ensurePropertyDriveFolders } = require("../immo-drive");
const { inspectDriveFolder, isValidDriveId, rootFolderWebLink, fallbackFolderUrl } = require("../drive-share");
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
        SELECT id, title, city, postal_code, surface_m2, rooms, bedrooms, dpe, price_fai, description,
               drive_folder_id, owner_contact_id, lead_id, metadata_json
        FROM crm_immo_properties
        WHERE id = ${propertyId}
          AND owner_contact_id = ${contactId}
        LIMIT 1
      `;
      if (!props.length) return res.status(404).json({ error: "Bien introuvable pour ce contact" });
      var prop = props[0];
      var meta = {};
      try {
        meta = prop.metadata_json ? JSON.parse(prop.metadata_json) : {};
      } catch (e) {
        meta = {};
      }
      var propFolderId =
        prop.drive_folder_id ||
        (meta.drive && meta.drive.folderId) ||
        (meta.staging && meta.staging.bienFolderId) ||
        null;
      if (!isValidDriveId(propFolderId)) {
        var ensuredProp = await ensurePropertyDriveFolders({
          id: prop.id,
          title: prop.title,
          city: prop.city,
          postal_code: prop.postal_code,
          surface_m2: prop.surface_m2,
          firstName: contacts[0].first_name || "",
          lastName: contacts[0].last_name || "",
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
      var inspectedProp = await inspectDriveFolder(propFolderId, { share: true });
      var propLink = inspectedProp.webViewLink || fallbackFolderUrl(propFolderId);
      try {
        var ficheSync = require("../immo-property-fiche-drive");
        await ficheSync.syncPropertyFicheToDrive({
          id: prop.id,
          title: prop.title,
          city: prop.city,
          postal_code: prop.postal_code,
          surface_m2: prop.surface_m2,
          rooms: prop.rooms,
          bedrooms: prop.bedrooms,
          dpe: prop.dpe,
          price_fai: prop.price_fai,
          description: prop.description,
          firstName: contacts[0].first_name || "",
          lastName: contacts[0].last_name || "",
          drive_folder_id: propFolderId,
          sellDossier: meta.sellDossier || null,
          depositDraft: meta.depositDraft || (meta.drive && meta.drive.depositDraft) || null,
          roomDetails: meta.roomDetails || null,
        });
      } catch (ficheErr) {
        console.warn("[crm/drive-folder] fiche", ficheErr && ficheErr.message);
      }
      return res.status(200).json({
        ok: !!propLink,
        contactId: contactId,
        propertyId: propertyId,
        folderId: propFolderId,
        webViewLink: propLink,
        folderName: inspectedProp.name || prop.title || null,
        fileCount: inspectedProp.fileCount,
        isEmpty: inspectedProp.isEmpty,
        shared: true,
        error: inspectedProp.error || null,
      });
    }

    var folderId = contacts[0].drive_folder_id || null;
    var ensured = null;
    /* Toujours passer par ensure : crée l’arborescence Nom_Prenom/ct_xxx
       et migre les anciens dossiers plats ct_xxx_Nom_Prenom_… */
    ensured = await ensureClientDriveFolders(contactId);
    if (ensured && ensured.folderId) folderId = ensured.folderId;

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

    var inspected = await inspectDriveFolder(folderId, { share: true });
    var webViewLink = inspected.webViewLink || fallbackFolderUrl(folderId);
    return res.status(200).json({
      ok: !!webViewLink,
      contactId: contactId,
      folderId: folderId,
      webViewLink: webViewLink,
      folderName: inspected.name || null,
      personFolderName: (ensured && ensured.personFolderName) || null,
      path: (ensured && ensured.path) || null,
      migrated: !!(ensured && ensured.migrated),
      fileCount: inspected.fileCount,
      isEmpty: inspected.isEmpty,
      shared: true,
      error: inspected.error || null,
    });
  } catch (e) {
    console.error("[crm/drive-folder]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
