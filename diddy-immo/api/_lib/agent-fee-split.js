/**
 * Répartition encaissement agent (poche vs réserves charges FR).
 * Stripe encaisse le brut ; la séparation est un ledger métier (URSSAF, CFE, compta).
 */
function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

const DEFAULT_PREFS = {
  chargesPct: 22,
  cfePct: 0.5,
  accountingPct: 1,
  agentSharePct: 100,
  splitMode: "agent_gross",
  presetId: "custom_22",
};

/**
 * @param {number} amountEur — montant Stripe encaissé
 * @param {object} prefs
 * @param {string} [prefs.splitMode] agent_gross | full_agency_fee
 * @param {number} [prefs.agentSharePct] si full_agency_fee : % de l'honoraire agence pour toi
 * @param {number} [prefs.chargesPct] URSSAF + impôts sur ta part
 * @param {number} [prefs.cfePct] réserve CFE estimée
 * @param {number} [prefs.accountingPct] réserve compta / expert-comptable
 */
function computeAgentSplit(amountEur, prefs) {
  prefs = Object.assign({}, DEFAULT_PREFS, prefs || {});
  var gross = round2(amountEur);
  var mode = prefs.splitMode === "full_agency_fee" ? "full_agency_fee" : "agent_gross";
  var sharePct = Math.max(0, Math.min(100, Number(prefs.agentSharePct) || 100));
  var agentGross = mode === "full_agency_fee" ? round2((gross * sharePct) / 100) : gross;

  var chargesPct = Math.max(0, Number(prefs.chargesPct) || 0);
  var cfePct = Math.max(0, Number(prefs.cfePct) || 0);
  var accountingPct = Math.max(0, Number(prefs.accountingPct) || 0);

  var urssafReserve = round2((agentGross * chargesPct) / 100);
  var cfeReserve = round2((agentGross * cfePct) / 100);
  var accountingReserve = round2((agentGross * accountingPct) / 100);
  var totalReserves = round2(urssafReserve + cfeReserve + accountingReserve);
  var agentNet = round2(Math.max(0, agentGross - totalReserves));
  var agencyKeep = mode === "full_agency_fee" ? round2(gross - agentGross) : 0;

  return {
    amountEur: gross,
    splitMode: mode,
    agentSharePct: sharePct,
    agentGross: agentGross,
    agencyKeep: agencyKeep,
    chargesPct: chargesPct,
    cfePct: cfePct,
    accountingPct: accountingPct,
    urssafReserve: urssafReserve,
    cfeReserve: cfeReserve,
    accountingReserve: accountingReserve,
    totalReserves: totalReserves,
    agentNet: agentNet,
    presetId: prefs.presetId || null,
  };
}

function prefsFromMetadata(meta) {
  meta = meta || {};
  var out = {};
  if (meta.splitMode) out.splitMode = meta.splitMode;
  if (meta.agentSharePct != null) out.agentSharePct = Number(meta.agentSharePct);
  if (meta.chargesPct != null) out.chargesPct = Number(meta.chargesPct);
  if (meta.cfePct != null) out.cfePct = Number(meta.cfePct);
  if (meta.accountingPct != null) out.accountingPct = Number(meta.accountingPct);
  if (meta.taxPresetId) out.presetId = meta.taxPresetId;
  return out;
}

function splitToStripeMetadata(prefs) {
  prefs = Object.assign({}, DEFAULT_PREFS, prefs || {});
  return {
    splitMode: String(prefs.splitMode || "agent_gross"),
    agentSharePct: String(prefs.agentSharePct != null ? prefs.agentSharePct : 100),
    chargesPct: String(prefs.chargesPct != null ? prefs.chargesPct : 22),
    cfePct: String(prefs.cfePct != null ? prefs.cfePct : 0.5),
    accountingPct: String(prefs.accountingPct != null ? prefs.accountingPct : 1),
    taxPresetId: String(prefs.presetId || "custom_22"),
  };
}

module.exports = {
  DEFAULT_PREFS: DEFAULT_PREFS,
  computeAgentSplit: computeAgentSplit,
  prefsFromMetadata: prefsFromMetadata,
  splitToStripeMetadata: splitToStripeMetadata,
  round2: round2,
};
