/**
 * /api/crm/leads-import — leads importés (fichiers d'export, anciens clients, devis non signés).
 * Table séparée `imported_leads` pour ne pas fausser les stats d'acquisition (site_leads).
 *   GET   → liste (+ échéance calculée)
 *   POST  { batch, rows:[{segment,lastName,firstName,fullName,email,emailBroker,phone,product,refDate}] }
 *   PATCH { id, status?, notes? }
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

const STATUSES = [
  "a_traiter",
  "mail_envoye",
  "appele",
  "devis_envoye",
  "plus_cher_retour",
  "gagne",
  "perdu",
  "injoignable",
];

let schemaReady = false;
async function ensureSchema(sql) {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS imported_leads (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      batch TEXT,
      segment TEXT,
      last_name TEXT,
      first_name TEXT,
      full_name TEXT,
      email TEXT,
      email_broker TEXT,
      phone TEXT,
      product TEXT,
      ref_date DATE,
      status TEXT NOT NULL DEFAULT 'a_traiter',
      notes TEXT,
      owner_id TEXT,
      dedup_key TEXT UNIQUE
    )
  `;
  schemaReady = true;
}

function clean(v, max) {
  if (v == null) return null;
  var s = String(v).trim();
  return s ? s.slice(0, max || 200) : null;
}

function normPhone(p) {
  var d = String(p || "").replace(/[^\d+]/g, "");
  if (/^33\d{9}$/.test(d)) d = "+" + d;
  if (/^[67]\d{8}$/.test(d)) d = "0" + d;
  return d.length >= 9 ? d : null;
}

function isoDate(v) {
  if (!v) return null;
  var m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

function dedupKey(r) {
  var who = (r.email || r.phone || (r.fullName || "").toLowerCase().replace(/\s+/g, " ")).toLowerCase();
  return (r.segment || "x") + "|" + who;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });
  await ensureSchema(sql);

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, created_at, batch, segment, last_name, first_name, full_name, email, email_broker,
               phone, product, ref_date, status, notes, updated_at
        FROM imported_leads ORDER BY ref_date ASC NULLS LAST, full_name ASC LIMIT 5000
      `;
      return res.status(200).json({ ok: true, items: rows, statuses: STATUSES });
    }

    const body = parseJsonBody(req, 1000000);
    if (body.error) return res.status(400).json({ error: body.error });
    const data = body.body !== undefined ? body.body : body;

    if (req.method === "POST") {
      const rows = Array.isArray(data.rows) ? data.rows.slice(0, 3000) : [];
      if (!rows.length) return res.status(400).json({ error: "Aucune ligne à importer" });
      const batch = clean(data.batch, 120) || "import " + new Date().toISOString().slice(0, 10);
      let inserted = 0;
      let skipped = 0;
      for (const raw of rows) {
        const r = {
          segment: raw.segment === "client" ? "client" : "prospect",
          lastName: clean(raw.lastName, 120),
          firstName: clean(raw.firstName, 120),
          fullName: clean(raw.fullName, 200) || [raw.firstName, raw.lastName].filter(Boolean).join(" ").trim() || null,
          email: clean(raw.email, 320) ? String(raw.email).trim().toLowerCase() : null,
          emailBroker: clean(raw.emailBroker, 320),
          phone: normPhone(raw.phone),
          product: clean(raw.product, 80) || "VTC",
          refDate: isoDate(raw.refDate),
        };
        if (!r.fullName && !r.email && !r.phone) {
          skipped++;
          continue;
        }
        const id = "imp_" + crypto.randomBytes(8).toString("hex");
        const out = await sql`
          INSERT INTO imported_leads (id, batch, segment, last_name, first_name, full_name, email, email_broker,
                                      phone, product, ref_date, owner_id, dedup_key)
          VALUES (${id}, ${batch}, ${r.segment}, ${r.lastName}, ${r.firstName}, ${r.fullName}, ${r.email},
                  ${r.emailBroker}, ${r.phone}, ${r.product}, ${r.refDate}, ${String(user.id || "")}, ${dedupKey(r)})
          ON CONFLICT (dedup_key) DO NOTHING
          RETURNING id
        `;
        if (out.length) inserted++;
        else skipped++;
      }
      return res.status(200).json({ ok: true, inserted, skipped, batch });
    }

    if (req.method === "PATCH") {
      const id = clean(data.id, 80);
      if (!id) return res.status(400).json({ error: "id requis" });
      const status = data.status && STATUSES.indexOf(data.status) >= 0 ? data.status : null;
      const notes = data.notes !== undefined ? clean(data.notes, 4000) : undefined;
      if (status) await sql`UPDATE imported_leads SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
      if (notes !== undefined) await sql`UPDATE imported_leads SET notes = ${notes}, updated_at = NOW() WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[leads-import]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: String(e.message || e).slice(0, 200) });
  }
};
