const { getSql } = require("./db");

const CLIENT_SUBFOLDERS = [
  "01_identite",
  "02_justificatifs_revenus",
  "03_contrats_existants",
  "04_vehicule_ou_bien",
  "05_devis_signes",
];

/** Sous-dossier Drive selon le type de piece deposee */
const DOC_TYPE_SUBFOLDER = {
  carte_grise: "04_vehicule_ou_bien",
  permis: "01_identite",
  kbis: "01_identite",
  piece_identite: "01_identite",
  carte_vitale: "01_identite",
  attestation_vtc: "04_vehicule_ou_bien",
  compromis_vente: "04_vehicule_ou_bien",
  tableau_amortissement: "03_contrats_existants",
  releve_info: "03_contrats_existants",
  releve_mutuelle: "03_contrats_existants",
  justificatif_domicile: "02_justificatifs_revenus",
  avis_imposition: "02_justificatifs_revenus",
  bulletins_salaire: "02_justificatifs_revenus",
  rib: "02_justificatifs_revenus",
  autre: "03_contrats_existants",
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

async function findChildFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    String(name).replace(/'/g, "\\'") +
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

async function ensureYearFolder(token, rootId) {
  const year = String(new Date().getFullYear());
  return findChildFolder(token, rootId, year);
}

function safeLeadFolderLabel(leadId, email) {
  var local = String(email || "lead").split("@")[0].replace(/[^\w\-]/g, "_").slice(0, 24);
  return String(leadId).replace(/[^\w\-]/g, "").slice(0, 40) + "_" + local;
}

/**
 * Dossier Drive pour un lead sans contact CRM (landing).
 * Structure : {racine}/{annee}/leads/{leadId_email}/
 */
async function ensureLeadDriveFolder(leadId, email) {
  const token = await getDriveToken();
  const rootId = getRootFolderId();
  const sql = getSql();

  if (!sql || !leadId) return { ok: false, error: "no_db" };
  if (!token || !rootId) {
    return { ok: true, simulated: true, message: "Drive non configure" };
  }

  const rows = await sql`
    SELECT drive_folder_id FROM site_leads WHERE id = ${leadId} LIMIT 1
  `;
  if (rows.length && rows[0].drive_folder_id) {
    return { ok: true, folderId: rows[0].drive_folder_id, existing: true };
  }

  const yearFolderId = await ensureYearFolder(token, rootId);
  const leadsRootId = await findChildFolder(token, yearFolderId, "leads");
  const leadFolder = await driveCreateFolder(token, safeLeadFolderLabel(leadId, email), leadsRootId);

  for (var i = 0; i < CLIENT_SUBFOLDERS.length; i++) {
    await driveCreateFolder(token, CLIENT_SUBFOLDERS[i], leadFolder.id);
  }

  try {
    await sql`
      UPDATE site_leads SET drive_folder_id = ${leadFolder.id}, updated_at = NOW()
      WHERE id = ${leadId}
    `;
  } catch (e) {
    console.warn("[drive] lead folder id save", e.message);
  }

  return { ok: true, folderId: leadFolder.id, subfolders: CLIENT_SUBFOLDERS };
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

/**
 * Dossier cible pour un upload : contact CRM ou lead landing, avec sous-dossier par type de piece.
 */
async function resolveDocumentUploadFolder(opts) {
  opts = opts || {};
  const token = await getDriveToken();
  const docType = opts.docType || "autre";
  const subName = DOC_TYPE_SUBFOLDER[docType] || "03_contrats_existants";
  let baseFolderId = null;

  if (opts.contactId) {
    baseFolderId = await resolveContactUploadFolderId(opts.contactId);
  } else if (opts.leadId && opts.email) {
    const ensured = await ensureLeadDriveFolder(opts.leadId, opts.email);
    baseFolderId = ensured.folderId || null;
  }

  if (!baseFolderId) return getRootFolderId();
  if (!token) return baseFolderId;

  try {
    return await findChildFolder(token, baseFolderId, subName);
  } catch (e) {
    console.warn("[drive] subfolder", e.message);
    return baseFolderId;
  }
}

module.exports = {
  CLIENT_SUBFOLDERS,
  DOC_TYPE_SUBFOLDER,
  ensureClientDriveFolders,
  ensureLeadDriveFolder,
  resolveContactUploadFolderId,
  resolveDocumentUploadFolder,
};
