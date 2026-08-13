/**
 * Parcours acquéreur — mode épuré pour visiteurs déjà informés
 * (lien négociateur, deep link CRM, #demande, prix/apport en URL).
 */
(function () {
  function readParams() {
    return window.FinanceDeepLink ? window.FinanceDeepLink.readParams() : {};
  }

  function isInformedVisitor() {
    var params = readParams();
    var q = new URLSearchParams(location.search);
    var utm = (q.get("utm_source") || params.utmSource || "").toLowerCase();
    var hasFinance =
      params.propertyPrice != null ||
      params.downPayment != null ||
      params.income != null ||
      params.loanDuration != null;
    var fromPartner =
      utm === "negociateur" ||
      utm.indexOf("crm") >= 0 ||
      utm.indexOf("negociateur") >= 0;
    return (
      location.hash === "#demande" ||
      q.has("focus") ||
      hasFinance ||
      fromPartner
    );
  }

  function formatEuro(n) {
    try {
      return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " \u20ac";
    } catch (e) {
      return Math.round(n) + " \u20ac";
    }
  }

  function prefillSummary(params) {
    var parts = [];
    if (params.propertyPrice != null) parts.push("Bien : " + formatEuro(params.propertyPrice));
    if (params.downPayment != null) parts.push("Apport : " + formatEuro(params.downPayment));
    if (params.loanDuration != null) parts.push(params.loanDuration + " ans");
    if (params.income != null) parts.push("Revenus : " + formatEuro(params.income) + "/mois");
    return parts.join(" \u00b7 ");
  }

  function applyPrefillExtras() {
    var params = readParams();
    var budgetMax = document.getElementById("budgetMax");
    var propertyPrice = document.getElementById("propertyPrice");
    if (budgetMax && params.propertyPrice != null && !budgetMax.value) {
      budgetMax.value = String(Math.round(params.propertyPrice));
    }
    if (propertyPrice && params.propertyPrice != null && !propertyPrice.value) {
      propertyPrice.value = String(Math.round(params.propertyPrice));
    }

    var q = new URLSearchParams(location.search);
    var utm = (q.get("utm_source") || params.utmSource || "").toLowerCase();
    var referredBy = document.getElementById("referredBy");
    if (referredBy && !referredBy.value && utm.indexOf("negociateur") >= 0) {
      referredBy.value = "Negociateur immobilier";
    }
    var agency = document.getElementById("agencyName");
    if (agency && params.agency && !agency.value) agency.value = params.agency;
  }

  function applyFocusCopy() {
    var heroTitle = document.querySelector("[data-hero-title]");
    var heroSub = document.querySelector("[data-hero-subtitle]");
    if (heroTitle && heroTitle.dataset.focusTitle) {
      heroTitle.textContent = heroTitle.dataset.focusTitle;
    }
    if (heroSub && heroSub.dataset.focusSubtitle) {
      heroSub.textContent = heroSub.dataset.focusSubtitle;
    }
  }

  function init() {
    var informed = isInformedVisitor();
    document.body.classList.add(informed ? "parcours-focus" : "parcours-clean");

    if (informed) {
      applyFocusCopy();
      var params = readParams();
      var summary = prefillSummary(params);
      var banner = document.querySelector("[data-prefill-summary]");
      if (banner && summary) banner.textContent = "Vos informations sont reprises : " + summary;
    }

    applyPrefillExtras();

    if (informed && location.hash === "#demande") {
      requestAnimationFrame(function () {
        var el = document.getElementById("demande");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
