/**
 * GET/PUT /api/crm/agent-tax-prefs — préférences charges FR liées Stripe
 */
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { parseJsonBody } = require("../security");
const { DEFAULT_PREFS, computeAgentSplit } = require("../agent-fee-split");

async function ensurePrefsSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS agent_tax_prefs (
      user_id TEXT PRIMARY KEY,
      charges_pct NUMERIC(6,2) NOT NULL DEFAULT 22,
      cfe_pct NUMERIC(6,2) NOT NULL DEFAULT 0.5,
      accounting_pct NUMERIC(6,2) NOT NULL DEFAULT 1,
      agent_share_pct NUMERIC(6,2) NOT NULL DEFAULT 100,
      split_mode TEXT NOT NULL DEFAULT 'agent_gross',
      preset_id TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function rowToPrefs(row) {
  if (!row) return Object.assign({}, DEFAULT_PREFS);
  return {
    chargesPct: Number(row.charges_pct),
    cfePct: Number(row.cfe_pct),
    accountingPct: Number(row.accounting_pct),
    agentSharePct: Number(row.agent_share_pct),
    splitMode: row.split_mode || "agent_gross",
    presetId: row.preset_id || "custom_22",
  };
}

module.exports = async (req, res) => {
  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ ok: false, error: "Base de donnees non configuree" });

  try {
    await ensurePrefsSchema(sql);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }

  const userId = user.id || user.email || "default";

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM agent_tax_prefs WHERE user_id = ${userId} LIMIT 1`;
    const prefs = rowToPrefs(rows[0]);
    const sample = computeAgentSplit(1000, prefs);
    return res.status(200).json({ ok: true, prefs: prefs, samplePer1000: sample });
  }

  if (req.method === "PUT" || req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
    const b = parsed.body || {};
    const prefs = {
      chargesPct: b.chargesPct != null ? Number(b.chargesPct) : DEFAULT_PREFS.chargesPct,
      cfePct: b.cfePct != null ? Number(b.cfePct) : DEFAULT_PREFS.cfePct,
      accountingPct: b.accountingPct != null ? Number(b.accountingPct) : DEFAULT_PREFS.accountingPct,
      agentSharePct: b.agentSharePct != null ? Number(b.agentSharePct) : DEFAULT_PREFS.agentSharePct,
      splitMode: b.splitMode === "full_agency_fee" ? "full_agency_fee" : "agent_gross",
      presetId: b.presetId || "custom",
    };

    await sql`
      INSERT INTO agent_tax_prefs (
        user_id, charges_pct, cfe_pct, accounting_pct, agent_share_pct, split_mode, preset_id, updated_at
      ) VALUES (
        ${userId},
        ${prefs.chargesPct},
        ${prefs.cfePct},
        ${prefs.accountingPct},
        ${prefs.agentSharePct},
        ${prefs.splitMode},
        ${prefs.presetId},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        charges_pct = EXCLUDED.charges_pct,
        cfe_pct = EXCLUDED.cfe_pct,
        accounting_pct = EXCLUDED.accounting_pct,
        agent_share_pct = EXCLUDED.agent_share_pct,
        split_mode = EXCLUDED.split_mode,
        preset_id = EXCLUDED.preset_id,
        updated_at = NOW()
    `;

    return res.status(200).json({
      ok: true,
      prefs: prefs,
      samplePer1000: computeAgentSplit(1000, prefs),
    });
  }

  res.setHeader("Allow", "GET, PUT, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
};
