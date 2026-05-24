const fma = require("./fma-tariff");

const REGISTRY = {
  fma: fma,
  zephir: {
    getRates: async function (params) {
      var g = await fma.getRates(params);
      g.grid.insurer = "zephir";
      g.grid.insurerLabel = "Zéphir";
      g.grid.rows = g.grid.rows.map(function (r) {
        return Object.assign({}, r, { annualPremium: Math.round(r.annualPremium * 0.95) });
      });
      g.source = g.source === "fma_api" ? "zephir_via_api" : "mock_zephir";
      return g;
    },
  },
  sollyazar: {
    getRates: async function (params) {
      var g = await fma.getRates(params);
      g.grid.insurer = "sollyazar";
      g.grid.insurerLabel = "Solly Azar";
      g.grid.rows = g.grid.rows.map(function (r) {
        return Object.assign({}, r, { annualPremium: Math.round(r.annualPremium * 1.05) });
      });
      return g;
    },
  },
  "2m2a": {
    getRates: async function (params) {
      var g = await fma.getRates({ product: params.product });
      g.grid.insurer = "2m2a";
      g.grid.insurerLabel = "2M2A";
      return g;
    },
  },
};

module.exports = {
  getInsurerRates: async function (insurerId, params) {
    var mod = REGISTRY[insurerId] || REGISTRY.fma;
    return mod.getRates(params);
  },
  listInsurers: function () {
    return [
      { id: "fma", label: "FMA", apiReady: !!(process.env.FMA_API_URL && process.env.FMA_API_KEY) },
      { id: "zephir", label: "Zéphir", apiReady: false },
      { id: "sollyazar", label: "Solly Azar", apiReady: false },
      { id: "2m2a", label: "2M2A", apiReady: false },
    ];
  },
};
