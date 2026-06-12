const crypto = require("crypto");
const { getSql } = require("./db");

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const VTC_DOSSIER_SLOTS = [
  { type: "carte_grise", defaultName: "Carte grise", defaultFile: "carte-grise" },
  { type: "permis", defaultName: "Permis de conduire", defaultFile: "permis-conduire" },
  { type: "kbis", defaultName: "KBIS ou extrait INPI", defaultFile: "kbis" },
  { type: "releve_info", defaultName: "Releve d'information assurance", defaultFile: "releve-information" },
  { type: "attestation_vtc", defaultName: "Carte ou attestation VTC", defaultFile: "attestation-vtc" },
  { type: "rib", defaultName: "RIB", defaultFile: "rib" },
  { type: "autre", defaultName: "Autre piece", defaultFile: "document", optional: true },
];

const SANTE_DOSSIER_SLOTS = [
  { type: "piece_identite", defaultName: "Piece d'identite", defaultFile: "piece-identite" },
  { type: "carte_vitale", defaultName: "Carte Vitale ou attestation droits", defaultFile: "carte-vitale" },
  { type: "justificatif_domicile", defaultName: "Justificatif de domicile", defaultFile: "justificatif-domicile" },
  { type: "avis_imposition", defaultName: "Dernier avis d'imposition", defaultFile: "avis-imposition", optional: true },
  { type: "releve_mutuelle", defaultName: "Releve mutuelle actuelle", defaultFile: "releve-mutuelle", optional: true },
  { type: "rib", defaultName: "RIB", defaultFile: "rib" },
  { type: "autre", defaultName: "Autre piece", defaultFile: "document", optional: true },
];

const CREDIT_IMMO_DOSSIER_SLOTS = [
  { type: "piece_identite", defaultName: "Piece d'identite", defaultFile: "piece-identite" },
  { type: "bulletins_salaire", defaultName: "3 derniers bulletins de salaire", defaultFile: "bulletins-salaire" },
  { type: "avis_imposition", defaultName: "2 derniers avis d'imposition", defaultFile: "avis-imposition" },
  { type: "rib", defaultName: "RIB", defaultFile: "rib" },
  { type: "compromis_vente", defaultName: "Compromis ou offre d'achat", defaultFile: "compromis-vente", optional: true },
  { type: "tableau_amortissement", defaultName: "Tableau amortissement (rachat)", defaultFile: "tableau-amortissement", optional: true },
  { type: "autre", defaultName: "Autre piece", defaultFile: "document", optional: true },
];

const DOSSIER_LABELS = {
  vtc: "Completer votre dossier VTC",
  sante: "Completer votre dossier mutuelle sante",
  credit_immo: "Completer votre dossier credit immobilier",
};

function normalizeVertical(vertical) {
  var s = String(vertical || "vtc").toLowerCase().replace(/-/g, "_");
  if (s.indexOf("credit") !== -1 || s.indexOf("immo") !== -1) return "credit_immo";
  if (s.indexOf("sante") !== -1 || s.indexOf("mutuelle") !== -1) return "sante";
  return "vtc";
}

function getDossierSlots(vertical) {
  var v = normalizeVertical(vertical);
  if (v === "sante") return SANTE_DOSSIER_SLOTS;
  if (v === "credit_immo") return CREDIT_IMMO_DOSSIER_SLOTS;
  return VTC_DOSSIER_SLOTS;
}

function getDossierLabel(vertical) {
  return DOSSIER_LABELS[normalizeVertical(vertical)] || DOSSIER_LABELS.vtc;
}

async function ensureLeadDocumentsSchema(sql) {
  if (!sql) return false;
  await sql`
    CREATE TABLE IF NOT EXISTS lead_documents (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      contact_id TEXT,
      email TEXT,
      vertical TEXT NOT NULL DEFAULT 'vtc',
      doc_type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT,
      file_size INT,
      content_base64 TEXT,
      drive_file_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      reject_reason TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS lead_documents_lead_idx ON lead_documents (lead_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS lead_documents_status_idx ON lead_documents (status, created_at DESC)
  `;
  try {
    await sql`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS drive_folder_id TEXT`;
  } catch (e) {}
  return true;
}

function sanitizeFileName(name) {
  var base = String(name || "document")
    .trim()
    .replace(/[^\w.\-àâäéèêëïîôùûüç ]+/gi, "_")
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return base || "document";
}

function extensionFromMime(mime, fallbackName) {
  var m = String(mime || "").toLowerCase();
  if (m.indexOf("pdf") !== -1) return ".pdf";
  if (m.indexOf("png") !== -1) return ".png";
  if (m.indexOf("jpeg") !== -1 || m.indexOf("jpg") !== -1) return ".jpg";
  var match = String(fallbackName || "").match(/\.[a-z0-9]+$/i);
  return match ? match[0].toLowerCase() : ".pdf";
}

function defaultDisplayName(docType, vertical) {
  var slot = getDossierSlots(vertical).find(function (s) {
    return s.type === docType;
  });
  return slot ? slot.defaultName : "Document";
}

function defaultFileStem(docType, vertical) {
  var slot = getDossierSlots(vertical).find(function (s) {
    return s.type === docType;
  });
  return slot ? slot.defaultFile : "document";
}

function parseBase64Payload(raw) {
  var s = String(raw || "").trim();
  if (!s) return { error: "Fichier vide" };
  var data = s;
  var mime = "application/octet-stream";
  var m = s.match(/^data:([^;]+);base64,(.+)$/);
  if (m) {
    mime = m[1];
    data = m[2];
  }
  var buf;
  try {
    buf = Buffer.from(data, "base64");
  } catch (e) {
    return { error: "Encodage base64 invalide" };
  }
  if (!buf.length) return { error: "Fichier vide" };
  if (buf.length > MAX_FILE_BYTES) {
    return { error: "Fichier trop volumineux (max 8 Mo)" };
  }
  return { mime: mime, buffer: buf, base64: buf.toString("base64") };
}

async function verifyLeadAccess(sql, leadId, email) {
  if (!leadId || !email) return { ok: false, error: "leadId et email requis" };
  var rows = await sql`
    SELECT id, email, contact_id, vertical, drive_folder_id
    FROM site_leads
    WHERE id = ${leadId}
    LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "Demande introuvable" };
  var lead = rows[0];
  var leadEmail = String(lead.email || "").trim().toLowerCase();
  if (leadEmail !== String(email).trim().toLowerCase()) {
    return { ok: false, error: "E-mail non concordant avec la demande" };
  }
  return { ok: true, lead: lead };
}

function newDocId() {
  return "ldoc_" + crypto.randomUUID();
}

module.exports = {
  VTC_DOSSIER_SLOTS,
  SANTE_DOSSIER_SLOTS,
  CREDIT_IMMO_DOSSIER_SLOTS,
  normalizeVertical,
  getDossierSlots,
  getDossierLabel,
  MAX_FILE_BYTES,
  ensureLeadDocumentsSchema,
  sanitizeFileName,
  extensionFromMime,
  defaultDisplayName,
  defaultFileStem,
  parseBase64Payload,
  verifyLeadAccess,
  newDocId,
};
