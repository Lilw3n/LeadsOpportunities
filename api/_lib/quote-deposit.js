const DEPOSIT_MIN_EUR = 1;
const DEPOSIT_MAX_EUR = 5000;
const DEPOSIT_MAX_PCT = 0.5;

function parseQuoteData(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function resolveDepositAmountEur(quote) {
  if (!quote) return null;

  if (quote.deposit_amount != null && Number(quote.deposit_amount) > 0) {
    return Number(quote.deposit_amount);
  }

  const data = parseQuoteData(quote.data);
  if (data.depositAmount != null && Number(data.depositAmount) > 0) {
    return Number(data.depositAmount);
  }
  if (data.acompte != null && Number(data.acompte) > 0) {
    return Number(data.acompte);
  }

  const premium = Number(quote.premium_estimate);
  if (premium > 0) {
    const pctAmount = premium * 0.2;
    const capped = Math.min(pctAmount, premium * DEPOSIT_MAX_PCT);
    return Math.round(Math.max(DEPOSIT_MIN_EUR, Math.min(capped, DEPOSIT_MAX_EUR)) * 100) / 100;
  }

  return null;
}

function validateDepositAmountEur(amountEur, quote) {
  const amount = Number(amountEur);
  if (!amount || amount < DEPOSIT_MIN_EUR) {
    return { ok: false, error: "Montant acompte invalide." };
  }
  if (amount > DEPOSIT_MAX_EUR) {
    return { ok: false, error: "Montant acompte trop eleve." };
  }
  const premium = Number(quote?.premium_estimate);
  if (premium > 0 && amount > premium * DEPOSIT_MAX_PCT + 0.01) {
    return { ok: false, error: "Acompte superieur au plafond autorise pour ce devis." };
  }
  return { ok: true, amountEur: amount };
}

module.exports = {
  DEPOSIT_MIN_EUR,
  DEPOSIT_MAX_EUR,
  parseQuoteData,
  resolveDepositAmountEur,
  validateDepositAmountEur,
};
