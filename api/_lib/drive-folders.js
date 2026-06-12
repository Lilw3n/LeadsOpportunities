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
  convention_collective: "06_entreprise_collective",
  contrat_mutuelle: "03_contrats_existants",
  liste_salaries: "06_entreprise_collective",
  dsn: "06_entreprise_collective",
  carte_grise: "04_vehicule_ou_bien",
  permis: "01_identite",
  releve_info: "03_contrats_existants",
  rib: "02_justificatifs_revenus",
  generic: "01_identite",
  autre: "01_identite",
};

const { getDriveAccessToken, getRootFolderId } = require("./google-drive-auth");

async function getDriveToken() {
  const auth = await getDriveAccessToken();
  return auth ? auth.accessToken : null;
}

async function driveCreateFolder(token, name, parentId) {
  const meta = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : undefined,
  };
  const resp = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
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

function safeFolderLabel(contactId, firstName, lastName) {
  const name = ((firstName || "") + "_" + (lastName || "")).trim().replace(/[^\w\-@.]/g, "_") || "client";
  return String(contactId).replace(/[^\w\-]/g, "") + "_" + name.slice(0, 40);
}

async function ensureClientDriveFolders(contactId) {
  const token = await getDriveToken();
  const rootId = getRootFolderId();
  const sql = getSql();

  if (!sql) return { ok: false, error: "no_db" };
  if (!token || !rootId) {
    return { ok: true, simulated: true, message: "Drive non configure (token ou dossier racine)" };
  }

  const contacts = await sql`
    SELECT id, first_name, last_name, drive_folder_id
    FROM crm_contacts WHERE id = ${contactId} LIMIT 1
  `;
  if (!contacts.length) return { ok: false, error: "contact_not_found" };
  const c = contacts[0];
  if (c.drive_folder_id) {
    return { ok: true, folderId: c.drive_folder_id, existing: true };
  }

  const year = String(new Date().getFullYear());
  let yearFolderId;

  const yearSearch = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(
        "mimeType='application/vnd.google-apps.folder' and name='" +
          year +
          "' and '" +
          rootId +
          "' in parents and trashed=false"
      ) +
      "&fields=files(id,name)&pageSize=1",
    { headers: { Authorization: "Bearer " + token } }
  );
  const yearData = await yearSearch.json();
  if (yearData.files && yearData.files.length) {
    yearFolderId = yearData.files[0].id;
  } else {
    const createdYear = await driveCreateFolder(token, year, rootId);
    yearFolderId = createdYear.id;
  }

  const clientLabel = safeFolderLabel(c.id, c.first_name, c.last_name);
  const clientFolder = await driveCreateFolder(token, clientLabel, yearFolderId);

  for (var i = 0; i < CLIENT_SUBFOLDERS.length; i++) {
    await driveCreateFolder(token, CLIENT_SUBFOLDERS[i], clientFolder.id);
  }

  await sql`
    UPDATE crm_contacts SET drive_folder_id = ${clientFolder.id}, updated_at = NOW()
    WHERE id = ${contactId}
  `;

  return { ok: true, folderId: clientFolder.id, subfolders: CLIENT_SUBFOLDERS };
}

async function resolveContactUploadFolderId(contactId) {
  if (!contactId) return getRootFolderId();
  const sql = getSql();
  if (!sql) return getRootFolderId();

  const rows = await sql`
    SELECT drive_folder_id FROM crm_contacts WHERE id = ${contactId} LIMIT 1
  `;
  if (rows.length && rows[0].drive_folder_id) {
    return rows[0].drive_folder_id;
  }

  const ensured = await ensureClientDriveFolders(contactId);
  if (ensured.folderId) return ensured.folderId;
  return getRootFolderId();
}

async function findChildFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) + "&fields=files(id,name)&pageSize=1",
    { headers: { Authorization: "Bearer " + token } }
  );
  const data = await resp.json();
  if (data.files && data.files.length) return data.files[0].id;
  const created = await driveCreateFolder(token, name, parentId);
  return created.id;
}

async function resolveContactSubfolderId(contactId, subfolderName) {
  if (!contactId || !subfolderName) {
    return resolveContactUploadFolderId(contactId);
  }
  const token = await getDriveToken();
  if (!token) return resolveContactUploadFolderId(contactId);
  const clientFolder = await resolveContactUploadFolderId(contactId);
  if (!clientFolder) return null;
  return findChildFolder(token, clientFolder, subfolderName);
}

function subfolderForDocumentType(documentType) {
  return DOC_TYPE_SUBFOLDER[documentType] || "01_identite";
}

module.exports = {
  CLIENT_SUBFOLDERS,
  DOC_TYPE_SUBFOLDER,
  ensureClientDriveFolders,
  resolveContactUploadFolderId,
  resolveContactSubfolderId,
  subfolderForDocumentType,
};
