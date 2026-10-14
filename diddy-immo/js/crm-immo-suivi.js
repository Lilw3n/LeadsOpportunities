/**
 * Vues « Suivi » pipeline immo (ventes / locations / offres / sorties).
 */
window.CrmImmoSuivi = (function () {
  var PIPELINE_OPEN = [
    "prospection",
    "estimation",
    "mandat",
    "suspendu",
    "sous_offre",
    "reserve_sru",
    "compromis",
  ];
  var OFFERS = ["sous_offre", "reserve_sru", "compromis"];
  var EXIT = ["vendu_loue", "archive", "a_supprimer"];

  var VIEWS = [
    {
      id: "ventes",
      label: "Suivi des ventes",
      transaction: "vente",
      statuses: PIPELINE_OPEN,
      hint: "Biens à vendre encore en stock (prospection → compromis).",
    },
    {
      id: "locations",
      label: "Suivi des locations",
      transaction: "location",
      statuses: PIPELINE_OPEN,
      hint: "Biens à louer encore en stock.",
    },
    {
      id: "offres",
      label: "Suivi des offres",
      transaction: "",
      statuses: OFFERS,
      hint: "Sous offre, réservé SRU, compromis — ventes et locations.",
    },
    {
      id: "sorties_ventes",
      label: "Sorties de stock ventes",
      transaction: "vente",
      statuses: EXIT,
      hint: "Vendus, archivés ou à supprimer (vente).",
    },
    {
      id: "sorties_locations",
      label: "Sorties de stock locations",
      transaction: "location",
      statuses: EXIT,
      hint: "Loués, archivés ou à supprimer (location).",
    },
  ];

  function getView(id) {
    return (
      VIEWS.find(function (v) {
        return v.id === id;
      }) || VIEWS[0]
    );
  }

  function filterProperties(list, view, Matcher) {
    view = typeof view === "string" ? getView(view) : view || VIEWS[0];
    return (list || []).filter(function (p) {
      var status = Matcher.normalizePropertyStatus(p.status);
      var tx = p.transaction || "vente";
      if (view.transaction && tx !== view.transaction) return false;
      if (view.statuses && view.statuses.indexOf(status) === -1) return false;
      return true;
    });
  }

  function groupByStatus(list, Matcher) {
    var groups = {};
    (list || []).forEach(function (p) {
      var id = Matcher.normalizePropertyStatus(p.status);
      if (!groups[id]) groups[id] = [];
      groups[id].push(p);
    });
    return groups;
  }

  function kpis(list, Matcher) {
    var total = list.length;
    var sumFai = 0;
    var sumNet = 0;
    var nPrice = 0;
    list.forEach(function (p) {
      var price = p.price_fai != null ? Number(p.price_fai) : p.price_net != null ? Number(p.price_net) : null;
      if (price != null && !isNaN(price)) {
        sumFai += Number(p.price_fai) || 0;
        sumNet += Number(p.price_net) || 0;
        nPrice += 1;
      }
    });
    var byStatus = {};
    list.forEach(function (p) {
      var s = Matcher.normalizePropertyStatus(p.status);
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    return {
      total: total,
      withPrice: nPrice,
      sumFai: sumFai,
      sumNet: sumNet,
      byStatus: byStatus,
    };
  }

  return {
    VIEWS: VIEWS,
    PIPELINE_OPEN: PIPELINE_OPEN,
    OFFERS: OFFERS,
    EXIT: EXIT,
    getView: getView,
    filterProperties: filterProperties,
    groupByStatus: groupByStatus,
    kpis: kpis,
  };
})();
