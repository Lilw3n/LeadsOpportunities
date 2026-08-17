/**
 * Capacité de financement acquéreur (indicatif HCSF 35 %).
 * Après l'alerte : on calcule ce qu'ils peuvent viser, puis on propose le prêt.
 */
(function (global) {
  var CONTACT_KEY = "lo_buyer_contact";
  var CAP_KEY = "lo_buyer_capacity";
  var TAUX = 3.45;
  var ASSUR_PCT = 0.34;
  var HCSF = 35;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function num(v) {
    if (v == null || v === "") return 0;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : 0;
  }

  function euro(n) {
    return (
      Math.round(Number(n) || 0).toLocaleString("fr-FR") + "\u00a0€"
    );
  }

  function maxPrincipal(monthly, annualRatePct, months) {
    var M = Math.max(0, Number(monthly) || 0);
    var n = Math.max(1, Math.round(Number(months) || 0));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (M <= 0) return 0;
    if (r <= 0) return Math.round(M * n);
    var f = Math.pow(1 + r, n);
    return Math.round((M * (f - 1)) / (r * f));
  }

  function compute(input) {
    var revenus = Math.max(0, num(input.revenus));
    var apport = Math.max(0, num(input.apport));
    var credits = Math.max(0, num(input.credits));
    var years = num(input.duree) || 25;
    if (years < 10) years = 10;
    if (years > 25) years = 25;
    var months = years * 12;
    var maxMens = Math.max(0, revenus * (HCSF / 100) - credits);
    var principal = maxPrincipal(maxMens, TAUX, months);
    var i;
    for (i = 0; i < 5; i++) {
      var ins = (principal * ASSUR_PCT) / 100 / 12;
      var forPmt = Math.max(0, maxMens - ins);
      principal = maxPrincipal(forPmt, TAUX, months);
    }
    var budget = Math.max(0, principal + apport);
    var tight = revenus > 0 && maxMens < 200;
    return {
      revenus: revenus,
      apport: apport,
      credits: credits,
      duree: years,
      maxMens: Math.round(maxMens),
      principal: principal,
      budget: budget,
      taux: TAUX,
      hcsf: HCSF,
      tight: tight,
      ok: revenus >= 800,
    };
  }

  function readContact() {
    try {
      var raw = sessionStorage.getItem(CONTACT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveContact(data) {
    var prev = readContact();
    var next = {
      phone: data.phone || prev.phone || "",
      email: data.email || prev.email || "",
      city: data.city || prev.city || "",
    };
    try {
      sessionStorage.setItem(CONTACT_KEY, JSON.stringify(next));
    } catch (e) {}
    return next;
  }

  function saveCapacity(cap) {
    try {
      sessionStorage.setItem(CAP_KEY, JSON.stringify(cap));
    } catch (e) {}
  }

  function readCapacity() {
    try {
      var raw = sessionStorage.getItem(CAP_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function creditHref(cap, contact) {
    var p = new URLSearchParams();
    if (cap.budget) p.set("propertyPrice", String(cap.budget));
    if (cap.apport) p.set("downPayment", String(Math.round(cap.apport)));
    if (cap.duree) p.set("loanDuration", String(cap.duree));
    if (cap.revenus) p.set("income", String(Math.round(cap.revenus)));
    if (cap.credits) p.set("currentLoans", String(Math.round(cap.credits)));
    if (contact.phone) p.set("phone", contact.phone);
    if (contact.email) p.set("email", contact.email);
    if (contact.city) p.set("ville", contact.city);
    p.set("need", "credit-immo");
    p.set("utm_source", "acheteur-immo");
    p.set("utm_medium", "capacite");
    p.set("utm_campaign", "offre-inversee-pret");
    p.set("propertyFound", "En recherche active");
    return "./credit-immo.html?" + p.toString() + "#demande";
  }

  function projectionHref(cap, contact) {
    var p = new URLSearchParams();
    if (cap.budget) p.set("prix", String(cap.budget));
    if (cap.apport) p.set("apport", String(Math.round(cap.apport)));
    if (cap.revenus) p.set("salaire", String(Math.round(cap.revenus)));
    if (cap.duree) p.set("duree", String(cap.duree));
    if (contact.city) p.set("ville", contact.city);
    p.set("utm_source", "acheteur-immo");
    p.set("utm_campaign", "capacite-acquereur");
    return "./projection-achat.html?" + p.toString() + "#simulateur";
  }

  function applyBudgetToSearch(budget) {
    if (!budget) return;
    var listing = qs("[data-listing-budget]");
    if (listing && !listing.value) listing.value = String(Math.round(budget));
    var wizard = qs("#budgetMax") || qs("#propertyPrice");
    if (wizard && !wizard.value) wizard.value = String(Math.round(budget));
  }

  function renderResult(root, cap, contact) {
    var box = qs("[data-capacity-result]", root);
    if (!box) return;
    if (!cap.ok) {
      box.hidden = false;
      box.innerHTML =
        "<p>Indiquez vos <strong>revenus nets du foyer</strong> pour estimer la capacité (règle HCSF ~35&nbsp;%).</p>";
      return;
    }
    var creditUrl = creditHref(cap, contact);
    var projUrl = projectionHref(cap, contact);
    var warn = cap.tight
      ? "<p class=\"capacity-warn\">Avec ces charges, la mensualité max est très juste. Un courtier peut chercher une 2e lecture (durée, co-emprunteur, rachat conso).</p>"
      : "";
    box.hidden = false;
    box.innerHTML =
      '<div class="capacity-kpis">' +
      '<div><span>Mensualité max</span><strong>' +
      euro(cap.maxMens) +
      "</strong><em>/ mois · HCSF " +
      cap.hcsf +
      "&nbsp;%</em></div>" +
      "<div><span>Capital empruntable</span><strong>" +
      euro(cap.principal) +
      "</strong><em>indicatif " +
      cap.duree +
      " ans · " +
      String(cap.taux).replace(".", ",") +
      "&nbsp;%</em></div>" +
      "<div><span>Budget bien visé</span><strong>" +
      euro(cap.budget) +
      "</strong><em>prêt + apport (frais de notaire en plus)</em></div>" +
      "</div>" +
      warn +
      '<p class="capacity-note">Estimation pédagogique, pas une offre de crédit. On peut <strong>vous proposer le prêt</strong> (courtier ORIAS, multi-banques).</p>' +
      '<div class="capacity-actions">' +
      '<a class="btn btn-primary" data-capacity-credit href="' +
      creditUrl.replace(/"/g, "&quot;") +
      '">Faire étudier mon prêt</a>' +
      '<a class="btn btn-soft" href="' +
      projUrl.replace(/"/g, "&quot;") +
      '">Coût réel (charges + TF)</a>' +
      "</div>";
  }

  function collect(root) {
    return {
      revenus: qs("[name='capRevenus']", root) && qs("[name='capRevenus']", root).value,
      apport: qs("[name='capApport']", root) && qs("[name='capApport']", root).value,
      credits: qs("[name='capCredits']", root) && qs("[name='capCredits']", root).value,
      duree: qs("[name='capDuree']", root) && qs("[name='capDuree']", root).value,
    };
  }

  function postCreditLead(cap, contact) {
    if (!contact.phone && !contact.email) return Promise.resolve(null);
    var payload = {
      source: "buyer_capacity",
      journey: "callback",
      callbackRequested: true,
      need: "credit-immo",
      serviceNeed: "credit-immo",
      vertical: "credit_immo",
      phone: contact.phone || "",
      email: contact.email || "",
      city: contact.city || "",
      searchCities: contact.city || "",
      netIncome: cap.revenus,
      downPayment: cap.apport,
      currentLoans: cap.credits,
      loanDuration: cap.duree + " ans",
      propertyPrice: cap.budget,
      estimatedBudget: cap.budget,
      capaciteEmprunt: cap.principal,
      mensualiteMax: cap.maxMens,
      alsoBuyer: true,
      wantsCredit: true,
      page: window.location.pathname + window.location.search,
      message:
        "Acquéreur — alerte + capacité indicative " +
        euro(cap.budget) +
        " (prêt ~" +
        euro(cap.principal) +
        ", mensualité max " +
        euro(cap.maxMens) +
        "). Proposer le dossier prêt.",
    };
    if (global.QuoteIntelligence && global.QuoteIntelligence.attachLeadIdToPayload) {
      global.QuoteIntelligence.attachLeadIdToPayload(payload);
    }
    if (typeof global.saveLeadRequest === "function") {
      global.saveLeadRequest(payload);
    }
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return null;
        });
      })
      .catch(function () {
        return null;
      });
  }

  function refresh(root) {
    var cap = compute(collect(root));
    var contact = readContact();
    saveCapacity(cap);
    renderResult(root, cap, contact);
    if (cap.ok) applyBudgetToSearch(cap.budget);
    var missing = qs("[data-capacity-need-contact]", root);
    if (missing) missing.hidden = !!(contact.phone || contact.email);
    return cap;
  }

  function bind(root) {
    if (!root || root.dataset.capacityBound) return;
    root.dataset.capacityBound = "1";
    ["capRevenus", "capApport", "capCredits", "capDuree"].forEach(function (name) {
      var el = qs("[name='" + name + "']", root);
      if (!el) return;
      el.addEventListener("input", function () {
        refresh(root);
      });
      el.addEventListener("change", function () {
        refresh(root);
      });
    });
    root.addEventListener("click", function (e) {
      var a = e.target.closest("[data-capacity-credit]");
      if (!a) return;
      var contact = readContact();
      if (!contact.phone && !contact.email) {
        e.preventDefault();
        var alerte = document.getElementById("alerte");
        var hint = qs("[data-capacity-need-contact]", root);
        if (hint) hint.hidden = false;
        if (alerte) alerte.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      var cap = compute(collect(root));
      saveCapacity(cap);
      postCreditLead(cap, contact);
    });
    var stored = readCapacity();
    if (stored && stored.revenus) {
      var set = function (name, v) {
        var el = qs("[name='" + name + "']", root);
        if (el && v != null && v !== "" && !el.value) el.value = String(v);
      };
      set("capRevenus", stored.revenus);
      set("capApport", stored.apport);
      set("capCredits", stored.credits);
      set("capDuree", stored.duree);
    }
    refresh(root);
  }

  function onAlertSent(ev) {
    var payload = (ev && ev.detail && ev.detail.payload) || {};
    if (!payload.phone && !payload.email) return;
    saveContact({
      phone: payload.phone,
      email: payload.email,
      city: payload.city || payload.searchCities,
    });
    var next = document.getElementById("alerte-next");
    if (next) next.hidden = false;
    var cap = document.getElementById("capacite");
    if (cap) {
      cap.classList.add("is-next");
      window.setTimeout(function () {
        cap.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
    var root = qs("[data-buyer-capacity]");
    if (root) refresh(root);
  }

  function restoreContactOnCredit() {
    var contact = readContact();
    var cap = readCapacity();
    function setVal(id, v) {
      if (v == null || v === "") return;
      var el = document.getElementById(id);
      if (!el || el.value) return;
      el.value = String(v);
      try {
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (e) {}
    }
    setVal("phone", contact.phone);
    setVal("email", contact.email);
    if (cap) {
      setVal("netIncome", cap.revenus);
      setVal("downPayment", cap.apport);
      setVal("currentLoans", cap.credits);
      setVal("propertyPrice", cap.budget);
      if (cap.duree) {
        var sel = document.getElementById("loanDuration");
        if (sel && !sel.value) {
          var want = String(cap.duree) + " ans";
          Array.prototype.slice.call(sel.options || []).forEach(function (o) {
            if (o.value === want || o.textContent.indexOf(String(cap.duree)) >= 0) sel.value = o.value;
          });
        }
      }
    }
    var found = document.getElementById("propertyFound");
    if (found && !found.value) {
      Array.prototype.slice.call(found.options || []).forEach(function (o) {
        if (/recherche active/i.test(o.textContent)) found.value = o.value || o.textContent;
      });
    }
  }

  function boot() {
    var nodes = document.querySelectorAll("[data-buyer-capacity]");
    for (var i = 0; i < nodes.length; i++) bind(nodes[i]);
    if (/credit-immo/.test(window.location.pathname)) restoreContactOnCredit();
  }

  global.BuyerCapacity = {
    compute: compute,
    creditHref: creditHref,
    saveContact: saveContact,
    readContact: readContact,
    readCapacity: readCapacity,
  };

  document.addEventListener("lo:lead-sent", onAlertSent);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this);
