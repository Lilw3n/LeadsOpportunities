/**
 * Deep links financement CRM ↔ demande de prêt (landings).
 * Params partagés : prix FAI/net, apport, durée, propertyId, contactId…
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.FinanceDeepLink = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var CREDIT_PATH = "/landings/credit-immo.html";
  var ACHETEUR_PATH = "/landings/acheteur-immo.html";
  var BAREMES_PATH = "/crm-agency-fees.html";
  var PRET_PATH = "/crm-pret-immo-sim.html";
  var PRET_LIST_PATH = "/crm-pret-immo.html";
  var PROJECTION_PATH = "/credit-immo/simulation/";

  function num(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  }

  function readParams(search) {
    var q = new URLSearchParams(search || (typeof location !== "undefined" ? location.search : ""));
    function g(keys) {
      for (var i = 0; i < keys.length; i++) {
        var v = q.get(keys[i]);
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    }
    return {
      propertyPrice: num(g(["propertyPrice", "prixFai", "prix", "price"])),
      prixNet: num(g(["prixNet", "netVendeur", "net"])),
      priceMode: g(["priceMode", "prixMode"]) || "",
      downPayment: num(g(["downPayment", "apport"])),
      loanDuration: num(g(["loanDuration", "duree", "years"])),
      income: num(g(["income", "revenus"])),
      propertyId: g(["propertyId", "bienId"]),
      contactId: g(["contactId"]),
      agency: g(["agency", "agence"]),
      loanType: g(["loanType", "typePret"]),
      utmSource: g(["utm_source"]) || "crm-agency-fees",
      surface: num(g(["surface", "surfaceHabitable"])),
      dpe: g(["dpe"]),
      taxeFonciere: num(g(["taxeFonciere", "taxe"])),
      chargesCopro: num(g(["chargesCopro", "copro"])),
      travaux: num(g(["travaux"])),
      patrimoine: num(g(["patrimoine", "liquidAssets"])),
    };
  }

  function buildQuery(data, extras) {
    var p = new URLSearchParams();
    data = data || {};
    extras = extras || {};
    function set(k, v) {
      if (v == null || v === "") return;
      p.set(k, String(v));
    }
    set("propertyPrice", data.propertyPrice != null ? Math.round(data.propertyPrice) : null);
    set(
      "prixFai",
      data.prixFai != null
        ? Math.round(data.prixFai)
        : data.propertyPrice != null
          ? Math.round(data.propertyPrice)
          : null
    );
    set("prixNet", data.prixNet != null ? Math.round(data.prixNet) : null);
    set("priceMode", data.priceMode);
    set("downPayment", data.downPayment != null ? Math.round(data.downPayment) : null);
    set("apport", data.downPayment != null ? Math.round(data.downPayment) : null);
    set("loanDuration", data.loanDuration);
    set("duree", data.loanDuration);
    set("income", data.income != null ? Math.round(data.income) : null);
    set("propertyId", data.propertyId);
    set("contactId", data.contactId);
    set("agency", data.agency);
    set("loanType", data.loanType);
    set("surface", data.surface != null ? Math.round(data.surface) : null);
    set("dpe", data.dpe);
    set("taxeFonciere", data.taxeFonciere != null ? Math.round(data.taxeFonciere) : null);
    set("chargesCopro", data.chargesCopro != null ? Math.round(data.chargesCopro) : null);
    set("travaux", data.travaux != null ? Math.round(data.travaux) : null);
    set("patrimoine", data.patrimoine != null ? Math.round(data.patrimoine) : null);
    set("utm_source", data.utmSource || "crm-agency-fees");
    set("utm_medium", extras.utmMedium || "crm");
    set("utm_campaign", extras.utmCampaign || "demande-pret");
    if (extras.need) set("need", extras.need);
    return p.toString();
  }

  function creditUrl(data, extras) {
    var qs = buildQuery(data, Object.assign({ need: "credit-immo" }, extras || {}));
    return CREDIT_PATH + (qs ? "?" + qs : "") + "#demande";
  }

  function acheteurUrl(data, extras) {
    var qs = buildQuery(data, Object.assign({ need: "acheteur-immo" }, extras || {}));
    return ACHETEUR_PATH + (qs ? "?" + qs : "") + "#demande";
  }

  function baremesUrl(data) {
    var qs = buildQuery(data || {}, { utmMedium: "immo-fiche", utmCampaign: "baremes" });
    return BAREMES_PATH + (qs ? "?" + qs : "");
  }

  function projectionUrl(data, extras) {
    var qs = buildQuery(data || {}, Object.assign({ utmCampaign: "projection-achat" }, extras || {}));
    return PROJECTION_PATH + (qs ? "?" + qs : "") + "#simulateur";
  }

  function pretImmoUrl(data, extras) {
    extras = extras || {};
    var qs = buildQuery(data || {}, Object.assign({ utmCampaign: "pret-immo" }, extras));
    var type = extras.type || "immo";
    var housing = extras.housing ? "&housing=" + encodeURIComponent(extras.housing) : "";
    return PRET_PATH + "?type=" + encodeURIComponent(type) + housing + (qs ? "&" + qs : "");
  }

  function pretListUrl() {
    return PRET_LIST_PATH;
  }

  function applyToForm(root) {
    root = root || (typeof document !== "undefined" ? document : null);
    if (!root) return null;
    var data = readParams();
    function setVal(id, val) {
      if (val == null || val === "") return;
      var el = root.getElementById ? root.getElementById(id) : null;
      if (!el) return;
      el.value = String(val);
      try {
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    if (data.propertyPrice != null) setVal("propertyPrice", Math.round(data.propertyPrice));
    if (data.downPayment != null) setVal("downPayment", Math.round(data.downPayment));
    if (data.loanDuration != null) {
      var dur = String(Math.round(data.loanDuration));
      var sel = root.getElementById("loanDuration");
      if (sel) {
        var matched = false;
        Array.prototype.slice.call(sel.options || []).forEach(function (o) {
          var hay = (o.value + " " + o.textContent).toLowerCase();
          if (hay.indexOf(dur + " ans") !== -1 || o.value === dur) {
            sel.value = o.value;
            matched = true;
          }
        });
        if (!matched) setVal("loanDuration", dur + " ans");
      }
    }
    if (data.income != null) {
      setVal("monthlyIncome", Math.round(data.income));
      setVal("income", Math.round(data.income));
      setVal("revenus", Math.round(data.income));
    }

    ["propertyId", "contactId", "prixNet", "priceMode", "agency"].forEach(function (key) {
      var val = data[key];
      if (!val && val !== 0) return;
      var id = "lo_" + key;
      var el = root.getElementById(id);
      if (!el) {
        el = root.createElement("input");
        el.type = "hidden";
        el.id = id;
        el.name = key;
        var form = root.querySelector("form") || root.body;
        if (form) form.appendChild(el);
      }
      el.value = String(val);
    });

    return data;
  }

  function applyToBaremesForm() {
    var data = readParams();
    function set(id, val) {
      if (val == null || val === "") return;
      var el = document.getElementById(id);
      if (!el) return;
      el.value = String(val);
      try {
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    if (data.priceMode === "fai" || data.priceMode === "net_vendeur") set("cmpPriceMode", data.priceMode);
    if (data.propertyPrice != null) set("cmpPrice", Math.round(data.propertyPrice));
    else if (data.prixNet != null) {
      set("cmpPriceMode", "net_vendeur");
      set("cmpPrice", Math.round(data.prixNet));
    }
    if (data.downPayment != null) set("bfDown", Math.round(data.downPayment));
    if (data.loanDuration != null) set("bfYears", Math.round(data.loanDuration));
    if (data.income != null) set("bfIncome", Math.round(data.income));
    if (data.surface != null) set("bfSurface", Math.round(data.surface));
    if (data.taxeFonciere != null) set("bfTaxe", Math.round(data.taxeFonciere));
    if (data.chargesCopro != null) set("bfCopro", Math.round(data.chargesCopro));
    if (data.travaux != null) set("bfTravaux", Math.round(data.travaux));
    if (data.patrimoine != null) set("bfPatrimoine", Math.round(data.patrimoine));
    if (data.dpe) set("bfDpe", data.dpe.toUpperCase());
    return data;
  }

  return {
    CREDIT_PATH: CREDIT_PATH,
    ACHETEUR_PATH: ACHETEUR_PATH,
    BAREMES_PATH: BAREMES_PATH,
    PROJECTION_PATH: PROJECTION_PATH,
    readParams: readParams,
    buildQuery: buildQuery,
    creditUrl: creditUrl,
    acheteurUrl: acheteurUrl,
    baremesUrl: baremesUrl,
    projectionUrl: projectionUrl,
    pretImmoUrl: pretImmoUrl,
    pretListUrl: pretListUrl,
    applyToForm: applyToForm,
    applyToBaremesForm: applyToBaremesForm,
  };
});
