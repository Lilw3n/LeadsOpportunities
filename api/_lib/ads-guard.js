/**
 * Sécurité pubs Meta : si personne n'a cliqué « Relancer » dans le CRM depuis
 * ADS_GUARD_DAYS jours, toutes les campagnes actives du compte sont mises en pause.
 *
 * Variables Vercel :
 *   META_ADS_TOKEN        jeton Meta avec la permission ads_management (obligatoire)
 *   META_AD_ACCOUNT_ID    compte pub (défaut : 997768686183548)
 *   ADS_GUARD_DAYS        délai en jours (défaut : 7)
 */
const GRAPH = "https://graph.facebook.com/v21.0";
const DEFAULT_ACCOUNT = "997768686183548";
const DEFAULT_DAYS = 7;

function config() {
  const days = parseInt(process.env.ADS_GUARD_DAYS || "", 10);
  return {
    token: process.env.META_ADS_TOKEN || process.env.META_SYSTEM_USER_TOKEN || "",
    account: String(process.env.META_AD_ACCOUNT_ID || DEFAULT_ACCOUNT).replace(/^act_/, ""),
    days: Number.isFinite(days) && days > 0 ? days : DEFAULT_DAYS,
  };
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ads_guard (
      id TEXT PRIMARY KEY,
      last_relaunch_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      relaunched_by TEXT,
      last_check_at TIMESTAMPTZ,
      last_paused_at TIMESTAMPTZ,
      last_result TEXT
    )
  `;
  await sql`INSERT INTO ads_guard (id) VALUES ('main') ON CONFLICT (id) DO NOTHING`;
}

async function getState(sql) {
  await ensureTable(sql);
  const rows = await sql`SELECT * FROM ads_guard WHERE id = 'main'`;
  const row = rows[0];
  const cfg = config();
  const deadline = new Date(new Date(row.last_relaunch_at).getTime() + cfg.days * 86400000);
  return {
    days: cfg.days,
    account: cfg.account,
    tokenConfigured: !!cfg.token,
    lastRelaunchAt: row.last_relaunch_at,
    relaunchedBy: row.relaunched_by,
    deadline: deadline.toISOString(),
    expired: Date.now() > deadline.getTime(),
    lastCheckAt: row.last_check_at,
    lastPausedAt: row.last_paused_at,
    lastResult: row.last_result,
  };
}

async function relaunch(sql, who) {
  await ensureTable(sql);
  await sql`
    UPDATE ads_guard SET last_relaunch_at = NOW(), relaunched_by = ${who || null}
    WHERE id = 'main'
  `;
  return getState(sql);
}

async function graph(path, token, opts) {
  const sep = path.indexOf("?") >= 0 ? "&" : "?";
  const res = await fetch(GRAPH + path + sep + "access_token=" + encodeURIComponent(token), opts);
  const body = await res.json().catch(function () {
    return {};
  });
  if (!res.ok || body.error) {
    throw new Error((body.error && body.error.message) || "Meta API " + res.status);
  }
  return body;
}

async function pauseActiveCampaigns(cfg) {
  const filter = encodeURIComponent(JSON.stringify(["ACTIVE"]));
  const list = await graph(
    "/act_" + cfg.account + "/campaigns?fields=id,name&limit=100&effective_status=" + filter,
    cfg.token
  );
  const paused = [];
  for (const c of list.data || []) {
    await graph("/" + c.id, cfg.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "status=PAUSED",
    });
    paused.push({ id: c.id, name: c.name });
  }
  return paused;
}

/** Appelé chaque jour par le cron. Ne fait rien tant que le délai n'est pas dépassé. */
async function runAdsGuardCheck(sql) {
  if (!sql) return { ok: false, skipped: true, reason: "Base de données indisponible" };
  const state = await getState(sql);
  const cfg = config();
  let result;
  if (!state.expired) {
    result = { ok: true, action: "none", deadline: state.deadline };
  } else if (!cfg.token) {
    result = { ok: false, action: "none", reason: "META_ADS_TOKEN manquant : impossible de couper les pubs" };
  } else {
    const paused = await pauseActiveCampaigns(cfg);
    result = { ok: true, action: "paused", paused: paused };
    if (paused.length) {
      await sql`UPDATE ads_guard SET last_paused_at = NOW() WHERE id = 'main'`;
    }
  }
  await sql`
    UPDATE ads_guard SET last_check_at = NOW(), last_result = ${JSON.stringify(result).slice(0, 2000)}
    WHERE id = 'main'
  `;
  return result;
}

module.exports = { getState, relaunch, runAdsGuardCheck, config };
