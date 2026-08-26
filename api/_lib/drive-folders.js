const { getSql } = require("./db");

const CLIENT_SUBFOLDERS = [
  "01_identite",
  "02_justificatifs_revenus",
  "03_contrats_existants",
  "04_vehicule_ou_bien",
  "05_devis_signes",
  "06_entreprise_collective",
];

const DOC_TYPE_SUBFOLDER = {
  kbis: "06_entreprise_collective",
  avis_insee: "06_entreprise_collective",
  rib_entreprise: "06_entreprise_collective",
  convention_collective: "06_entreprise_collective",
  liste_salaries: "06_entreprise_collective",
  dsn: "06_entreprise_collective",
  attestation_vtc: "06_entreprise_collective",
  qualifications: "06_entreprise_collective",
  carte_grise: "04_vehicule_ou_bien",
  liste_vehicules: "04_vehicule_ou_bien",
  bail: "04_vehicule_ou_bien",
  titre_propriete: "04_vehicule_ou_bien",
  diagnostics: "04_vehicule_ou_bien",
  compromis_offre: "04_vehicule_ou_bien",
  carnet_sante_animal: "04_vehicule_ou_bien",
  sire_cheval: "04_vehicule_ou_bien",
  acte_francisation: "04_vehicule_ou_bien",
  permis: "01_identite",
  piece_identite: "01_identite",
  carte_vtc: "01_identite",
  carte_vitale: "01_identite",
  attestation_secu: "01_identite",
  questionnaire_sante: "01_identite",
  permis_chasser: "01_identite",
  permis_bateau: "01_identite",
  releve_info: "03_contrats_existants",
  contrat_mutuelle: "03_contrats_existants",
  attestation_assurance: "03_contrats_existants",
  attestation_habitation: "03_contrats_existants",
  offre_pret: "03_contrats_existants",
  contrat_rc_pro: "03_contrats_existants",
  contrat_mrp: "03_contrats_existants",
  contrat_decennale: "03_contrats_existants",
  validation_chasse: "03_contrats_existants",
  rib: "02_justificatifs_revenus",
  avis_imposition: "02_justificatifs_revenus",
  bulletins_salaire: "02_justificatifs_revenus",
  releves_bancaires: "02_justificatifs_revenus",
  contrat_travail: "02_justificatifs_revenus",
  apport_justificatif: "02_justificatifs_revenus",
  tableau_amortissement: "02_justificatifs_revenus",
  taxe_fonciere: "02_justificatifs_revenus",
  generic: "01_identite",
  autre: "01_identite",
};

const { getDriveAccessToken, getRootFolderId } = require("./google-drive-auth");
const { shareFolderWithBroker, resolveFolderWebLink, isValidDriveId } = require("./drive-share");

var contactsDriveSchemaReady = false;

async function ensureContactsDriveSchema(sql) {
  if (!sql || contactsDriveSchemaReady) return contactsDriveSchemaReady;
  try {
    await sql`ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS drive_folder_id TEXT`;
    contactsDriveSchemaReady = true;
  } catch (e) {
    console.warn("[drive-folders] ensure drive_folder_id", e.message);
  }
  return contactsDriveSchemaReady;
}

async function getDriveToken() {
  // OAuth courtier en priorité : dossiers créés directement sur le Drive Gmail perso.
  var oauth = await getDriveAccessToken({ forUpload: true });
  if (oauth && oauth.accessToken) return oauth.accessToken;
  var sa = await getDriveAccessToken({ forUpload: false });
  return sa ? sa.accessToken : null;
}

async function driveCreateFolder(token, name, parentId) {
  const meta = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : undefined,
  };
  const resp = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meta),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || "Drive folder create failed");
  return data;
}

async function driveGetFile(token, fileId) {
  if (!fileId || !token) return null;
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      encodeURIComponent(fileId) +
      "?fields=id,name,parents,webViewLink,mimeType,trashed",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!resp.ok) return null;
  return resp.json();
}

async function driveListChildren(token, parentId) {
  const q = "'" + parentId + "' in parents and trashed=false";
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name,mimeType,parents)&pageSize=100",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.files || [];
}

async function driveMoveInto(token, fileId, newParentId, oldParentIds) {
  var remove = (oldParentIds || []).filter(Boolean).join(",");
  var url =
    "https://www.googleapis.com/drive/v3/files/" +
    encodeURIComponent(fileId) +
    "?addParents=" +
    encodeURIComponent(newParentId) +
    (remove ? "&removeParents=" + encodeURIComponent(remove) : "") +
    "&fields=id,parents";
  const resp = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  if (!resp.ok) {
    var err = await resp.text();
    throw new Error("Drive move " + resp.status + ": " + err.slice(0, 160));
  }
  return resp.json();
}

function sanitizeNamePart(s, max) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, max || 32);
}

/**
 * Dossier visible humain : Nom_Prenom (éventuellement + téléphone si homonyme).
 * L’identifiant technique ct_… va dans un SOUS-dossier.
 */
function buildContactPersonFolderName(firstName, lastName, phone) {
  var last = sanitizeNamePart(lastName, 28);
  var first = sanitizeNamePart(firstName, 24);
  var parts = [last, first].filter(Boolean);
  if (!parts.length) {
    var tel = String(phone || "").replace(/\D/g, "").slice(-10);
    return tel ? "Client_" + tel : "Client";
  }
  return parts.join("_").slice(0, 64);
}

/** Identifiant brut crm_contacts.id (préfixe ct_ = contact, pas lead ni questionnaire). */
function rawContactId(contactId) {
  return String(contactId || "")
    .replace(/[^\w\-]/g, "")
    .slice(0, 80);
}

/** Sous-dossier technique lisible : « Id contact : ct_uuid ». */
function buildContactIdFolderName(contactId) {
  var id = rawContactId(contactId) || "ct_unknown";
  return "Id contact : " + id;
}

function isTechnicalContactFolderName(folderName, contactId) {
  var name = String(folderName || "");
  var raw = rawContactId(contactId);
  if (!name || !raw) return false;
  if (name === raw) return true;
  if (name === buildContactIdFolderName(contactId)) return true;
  return name.indexOf("Id contact") === 0 && name.indexOf(raw) !== -1;
}

/**
 * Ancien libellé plat (ct_xxx_Nom_Prenom_tel_mail) — conservé pour détection / migration.
 */
function safeFolderLabel(contactId, firstName, lastName, phone, email) {
  var id = rawContactId(contactId) || "ct_unknown";
  var namePart = buildContactPersonFolderName(firstName, lastName, phone) || "client";
  var tel = String(phone || "").replace(/\D/g, "").slice(-10);
  var mailLocal = String(email || "")
    .split("@")[0]
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 24);
  var parts = [id, namePart];
  if (tel) parts.push(tel);
  if (mailLocal) parts.push(mailLocal);
  return parts.join("_").slice(0, 96);
}

function isOldFlatContactFolderName(folderName, contactId) {
  var name = String(folderName || "");
  var raw = rawContactId(contactId);
  if (!name || !raw) return false;
  if (isTechnicalContactFolderName(name, contactId)) return false;
  return name.indexOf(raw + "_") === 0 || (name.indexOf("ct_") === 0 && name.indexOf("_") > 3 && name !== raw);
}

function safeDocTypeFolderName(documentType) {
  return String(documentType || "autre_doc")
    .toLowerCase()
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 48);
}

async function findExistingChildFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name,webViewLink)&pageSize=10&orderBy=createdTime",
    { headers: { Authorization: "Bearer " + token } }
  );
  const data = await resp.json();
  if (data.files && data.files.length) return data.files[0];
  return null;
}

async function findChildFolder(token, parentId, name) {
  var found = await findExistingChildFolder(token, parentId, name);
  if (found) return found;
  return driveCreateFolder(token, name, parentId);
}

async function driveRename(token, fileId, newName) {
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?fields=id,name,webViewLink",
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || "Drive rename failed");
  return data;
}

async function ensureContactIdFolder(token, personFolderId, contactId) {
  var labeled = buildContactIdFolderName(contactId);
  var existing = await findExistingChildFolder(token, personFolderId, labeled);
  if (existing) return existing;
  var raw = rawContactId(contactId);
  if (raw && raw !== labeled) {
    var old = await findExistingChildFolder(token, personFolderId, raw);
    if (old) {
      try {
        return await driveRename(token, old.id, labeled);
      } catch (e) {
        console.warn("[drive-folders] rename Id contact", e.message);
        return old;
      }
    }
  }
  return findChildFolder(token, personFolderId, labeled);
}

async function ensureYearFolder(token, rootId) {
  const year = String(new Date().getFullYear());
  return findChildFolder(token, rootId, year);
}

/**
 * Arborescence contact :
 *   année / Nom_Prenom / Id contact : ct_xxx [/ type_doc ]
 * drive_folder_id pointe vers le dossier technique « Id contact ».
 */
async function createContactFolderTree(token, rootId, contact) {
  const yearFolder = await ensureYearFolder(token, rootId);
  const personLabel = buildContactPersonFolderName(contact.first_name, contact.last_name, contact.phone);
  const personFolder = await findChildFolder(token, yearFolder.id, personLabel);
  const idFolder = await ensureContactIdFolder(token, personFolder.id, contact.id);
  const idLabel = idFolder.name || buildContactIdFolderName(contact.id);
  return {
    yearFolderId: yearFolder.id,
    personFolderId: personFolder.id,
    personFolderName: personLabel,
    folderId: idFolder.id,
    folderName: idLabel,
    path: yearFolder.name
      ? String(new Date().getFullYear()) + "/" + personLabel + "/" + idLabel
      : personLabel + "/" + idLabel,
    webViewLink: idFolder.webViewLink || personFolder.webViewLink || null,
  };
}

async function migrateOldFlatFolder(token, rootId, contact, oldFolderId) {
  const tree = await createContactFolderTree(token, rootId, contact);
  if (tree.folderId === oldFolderId) return tree;

  const children = await driveListChildren(token, oldFolderId);
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    try {
      await driveMoveInto(token, child.id, tree.folderId, child.parents || [oldFolderId]);
    } catch (moveErr) {
      console.warn("[drive-folders] migrate move", child.name, moveErr.message);
    }
  }

  /* Ne pas supprimer l’ancien dossier plat (partagé / historique) — juste le vider. */
  return Object.assign({}, tree, { migratedFrom: oldFolderId });
}

async function ensureClientDriveFolders(contactId) {
  const token = await getDriveToken();
  const rootId = getRootFolderId();
  const sql = getSql();

  if (!sql) return { ok: false, error: "no_db" };
  await ensureContactsDriveSchema(sql);
  if (!token || !rootId) {
    return {
      ok: false,
      simulated: true,
      error: "Drive non configuré sur le serveur (GOOGLE_DRIVE_REFRESH_TOKEN + GOOGLE_DRIVE_FOLDER_ID)",
      setupUrl: "https://www.leadsopportunities.fr/test-drive.html",
    };
  }

  const contacts = await sql`
    SELECT id, first_name, last_name, phone, email, drive_folder_id
    FROM crm_contacts WHERE id = ${contactId} LIMIT 1
  `;
  if (!contacts.length) return { ok: false, error: "contact_not_found" };
  const c = contacts[0];

  if (c.drive_folder_id) {
    var meta = await driveGetFile(token, c.drive_folder_id);
    if (meta && !meta.trashed) {
      if (isOldFlatContactFolderName(meta.name, c.id)) {
        try {
          var migrated = await migrateOldFlatFolder(token, rootId, c, c.drive_folder_id);
          await sql`
            UPDATE crm_contacts
            SET drive_folder_id = ${migrated.folderId}, updated_at = NOW()
            WHERE id = ${contactId}
          `;
          if (token) await shareFolderWithBroker(token, migrated.folderId);
          var migLink = await resolveFolderWebLink(migrated.folderId, { share: false });
          return {
            ok: true,
            folderId: migrated.folderId,
            personFolderId: migrated.personFolderId,
            personFolderName: migrated.personFolderName,
            path: migrated.path,
            existing: false,
            migrated: true,
            subfolders: CLIENT_SUBFOLDERS,
            lazy: true,
            webViewLink: (migLink && migLink.webViewLink) || migrated.webViewLink || null,
          };
        } catch (migErr) {
          console.warn("[drive-folders] migrate failed, keep old folder", migErr.message);
        }
      }
      /* Dossier déjà au bon format (Id contact : ct_xxx sous Nom_Prenom) ou autre. */
      if (meta.name === rawContactId(c.id)) {
        try {
          await driveRename(token, meta.id, buildContactIdFolderName(c.id));
        } catch (renErr) {
          console.warn("[drive-folders] rename existing Id contact", renErr.message);
        }
      }
      var existing = await resolveFolderWebLink(c.drive_folder_id, { share: true });
      return {
        ok: true,
        folderId: c.drive_folder_id,
        existing: true,
        webViewLink: existing.webViewLink || meta.webViewLink || null,
      };
    }
  }

  var tree;
  try {
    tree = await createContactFolderTree(token, rootId, c);
  } catch (createErr) {
    console.error("[drive-folders] create tree", createErr.message);
    return { ok: false, error: createErr.message || "create_failed" };
  }

  await sql`
    UPDATE crm_contacts SET drive_folder_id = COALESCE(drive_folder_id, ${tree.folderId}), updated_at = NOW()
    WHERE id = ${contactId}
  `;

  if (token) {
    await shareFolderWithBroker(token, tree.folderId);
  }

  var link = await resolveFolderWebLink(tree.folderId, { share: false });

  return {
    ok: true,
    folderId: tree.folderId,
    personFolderId: tree.personFolderId,
    personFolderName: tree.personFolderName,
    path: tree.path,
    subfolders: CLIENT_SUBFOLDERS,
    lazy: true,
    webViewLink: (link && link.webViewLink) || tree.webViewLink || null,
  };
}

async function resolveContactUploadFolderId(contactId) {
  if (!contactId) return getRootFolderId();
  const sql = getSql();
  if (!sql) return getRootFolderId();
  await ensureContactsDriveSchema(sql);

  const rows = await sql`
    SELECT drive_folder_id FROM crm_contacts WHERE id = ${contactId} LIMIT 1
  `;
  if (rows.length && rows[0].drive_folder_id) {
    /* Déclencher migration éventuelle (ancien libellé plat). */
    const ensured = await ensureClientDriveFolders(contactId);
    if (ensured.folderId) return ensured.folderId;
    return rows[0].drive_folder_id;
  }

  const ensured = await ensureClientDriveFolders(contactId);
  if (ensured.folderId) return ensured.folderId;
  return getRootFolderId();
}

async function resolveContactSubfolderId(contactId, subfolderName) {
  if (!contactId || !subfolderName) {
    return resolveContactUploadFolderId(contactId);
  }
  const token = await getDriveToken();
  if (!token) return resolveContactUploadFolderId(contactId);
  const clientFolder = await resolveContactUploadFolderId(contactId);
  if (!clientFolder) return null;
  const found = await findChildFolder(token, clientFolder, subfolderName);
  return found && found.id ? found.id : found;
}

async function resolveContactDocTypeFolderId(contactId, documentType) {
  if (!contactId) return resolveContactUploadFolderId(contactId);
  const token = await getDriveToken();
  const clientFolder = await resolveContactUploadFolderId(contactId);
  if (!token || !clientFolder) return clientFolder;
  const typeName = safeDocTypeFolderName(documentType);
  const found = await findChildFolder(token, clientFolder, typeName);
  return found && found.id ? found.id : found;
}

function subfolderForDocumentType(documentType) {
  return DOC_TYPE_SUBFOLDER[documentType] || "01_identite";
}

module.exports = {
  CLIENT_SUBFOLDERS,
  DOC_TYPE_SUBFOLDER,
  ensureContactsDriveSchema,
  ensureClientDriveFolders,
  resolveContactUploadFolderId,
  resolveContactSubfolderId,
  resolveContactDocTypeFolderId,
  safeFolderLabel,
  safeDocTypeFolderName,
  buildContactPersonFolderName,
  buildContactIdFolderName,
  rawContactId,
  isOldFlatContactFolderName,
  subfolderForDocumentType,
};
