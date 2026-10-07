/**
 * Connecteur tarifs FMA (exemple) — configurez FMA_API_URL + FMA_API_KEY sur Vercel.
 * Sans clé : grille indicative locale pour édition bordereau.
 */
async function fetchFmaApi(params) {
  var base = process.env.FMA_API_URL;
  var key = process.env.FMA_API_KEY;
  if (!base || !key) return null;
  var url =
    base.replace(/\/$/, "") +
    "/tariffs?product=" +
    encodeURIComponent(params.product || "vtc") +
    "&zone=" +
    encodeURIComponent(params.zone || "metropole");
  var r = await fetch(url, {
    headers: { Authorization: "Bearer " + key, Accept: "application/json" },
  });
  if (!r.ok) return null;
  return r.json();
}

function mockGrid(product) {
  var base = product === "sante" ? 420 : product === "rc_pro" ? 380 : 890;
  return {
    insurer: "FMA",
    insurerLabel: "FMA Assurances",
    product: product || "vtc",
    currency: "EUR",
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    source: "mock",
    rows: [
      { code: "RC", label: "Responsabilité civile", franchise: 0, annualPremium: base, commissionPct: 12 },
      { code: "DR", label: "Défense recours", franchise: 150, annualPremium: Math.round(base * 0.08), commissionPct: 10 },
      { code: "BDG", label: "Bris de glace", franchise: 100, annualPremium: Math.round(base * 0.06), commissionPct: 8 },
      { code: "VOL", label: "Vol & incendie", franchise: 300, annualPremium: Math.round(base * 0.14), commissionPct: 11 },
      { code: "ASS", label: "Assistance 0 km", franchise: 0, annualPremium: Math.round(base * 0.04), commissionPct: 15 },
      { code: "FLOTTE", label: "Option flotte (+1 véh.)", franchise: 500, annualPremium: Math.round(base * 0.22), commissionPct: 9 },
    ],
  };
}

module.exports = {
  getRates: async function (params) {
    params = params || {};
    try {
      var api = await fetchFmaApi(params);
      if (api && api.rows && api.rows.length) {
        return { ok: true, grid: api, source: "fma_api" };
      }
    } catch (e) {
      console.warn("[fma-tariff]", e.message);
    }
    return { ok: true, grid: mockGrid(params.product), source: "mock", note: "Configurez FMA_API_URL et FMA_API_KEY pour les tarifs live." };
  },
};
