/**
 * Métadonnées des dépôts (Drive + copie o2switch) — pas le binaire.
 */
const crypto = require("crypto");
const { getSql } = require("./db");

let schemaReady = false;

async function ensureDocumentFilesSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS site_document_files (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        contact_id TEXT,
        file_name TEXT NOT NULL,
        mime_type TEXT,
        bytes INT,
        document_type TEXT,
        subfolder TEXT,
        drive_file_id TEXT,
        drive_web_view_link TEXT,
        backup_path TEXT,
        backup_ok BOOLEAN DEFAULT FALSE,
        simulated BOOLEAN DEFAULT FALSE,
        backup_only BOOLEAN DEFAULT FALSE,
        source TEXT,
        extra TEXT NOT NULL DEFAULT '{}'
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_document_files_contact ON site_document_files (contact_id, created_at DESC)`;
    schemaReady = true;
    return true;
  } catch (e) {
    console.warn("[document-files] schema", e.message);
    return false;
  }
}

async function recordDocumentFile(meta) {
  const sql = getSql();
  if (!sql) return null;
  await ensureDocumentFilesSchema(sql);
  const id = "docf_" + crypto.randomUUID();
  const extra = JSON.stringify(meta.extra || {});
  try {
    await sql`
      INSERT INTO site_document_files (
        id, contact_id, file_name, mime_type, bytes, document_type, subfolder,
        drive_file_id, drive_web_view_link, backup_path, backup_ok, simulated,
        backup_only, source, extra
      ) VALUES (
        ${id},
        ${meta.contactId || null},
        ${meta.fileName || "document"},
        ${meta.mimeType || null},
        ${meta.bytes || null},
        ${meta.documentType || null},
        ${meta.subfolder || null},
        ${meta.driveFileId || null},
        ${meta.webViewLink || null},
        ${meta.backupPath || null},
        ${!!meta.backupOk},
        ${!!meta.simulated},
        ${!!meta.backupOnly},
        ${meta.source || null},
        ${extra}
      )
    `;
    return id;
  } catch (e) {
    console.warn("[document-files] insert", e.message);
    return null;
  }
}

async function listDocumentFiles({ contactId, limit }) {
  const sql = getSql();
  if (!sql) return { ok: false, error: "no_db", files: [] };
  await ensureDocumentFilesSchema(sql);
  const cap = Math.min(Math.max(Number(limit) || 40, 1), 100);
  try {
    var rows;
    if (contactId) {
      rows = await sql`
        SELECT id, created_at, contact_id, file_name, mime_type, bytes, document_type,
               subfolder, drive_file_id, drive_web_view_link, backup_path, backup_ok,
               simulated, backup_only, source
        FROM site_document_files
        WHERE contact_id = ${contactId}
        ORDER BY created_at DESC
        LIMIT ${cap}
      `;
    } else {
      rows = await sql`
        SELECT id, created_at, contact_id, file_name, mime_type, bytes, document_type,
               subfolder, drive_file_id, drive_web_view_link, backup_path, backup_ok,
               simulated, backup_only, source
        FROM site_document_files
        ORDER BY created_at DESC
        LIMIT ${cap}
      `;
    }
    return { ok: true, files: rows };
  } catch (e) {
    return { ok: false, error: e.message, files: [] };
  }
}

module.exports = {
  ensureDocumentFilesSchema,
  recordDocumentFile,
  listDocumentFiles,
};
