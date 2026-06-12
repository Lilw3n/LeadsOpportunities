(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  var quoteId = new URLSearchParams(location.search).get("id");
  var quoteRow = null;
  var contactRow = null;

  if (!token || !quoteId) {
    location.href = "./crm.html";
    return;
  }

  document.getElementById("backLink").href =
    "./crm-quote-detail.html?id=" + encodeURIComponent(quoteId);
  document.getElementById("previewLink").href =
    "./crm-quote-document.html?id=" + encodeURIComponent(quoteId);

  function api(path, opts) {
    return fetch(path, {
      method: (opts && opts.method) || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        { Authorization: "Bearer " + token }
      ),
      body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function lines(val) {
    return String(val || "")
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function joinLines(arr) {
    return (arr || []).join("\n");
  }

  function parseData(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function setStatus(msg, isError) {
    var el = document.getElementById("editorStatus");
    el.textContent = msg || "";
    el.style.color = isError ? "#b91c1c" : "#15803d";
  }

  function fillForm(doc, data, quote, contact) {
    var d = doc || {};
    var v = d.vehicle || {};
    var dr = d.driver || {};
    var pr = d.pricing || {};
    var pi = d.partnerImport || {};
    var g = d.guarantees || {};

    document.getElementById("fReference").value = d.reference || "";
    document.getElementById("fFormula").value = d.formula || data.formula || data.coverage || "";
    document.getElementById("fProduct").value = d.productLabel || quote.product_type || "";
    document.getElementById("fValidity").value = d.validityDays || 30;

    document.getElementById("fPartnerName").value = pi.partnerName || "";
    document.getElementById("fPartnerRef").value = pi.partnerReference || "";
    document.getElementById("fPartnerNotes").value = pi.notes || "";

    document.getElementById("fAnnual").value =
      pr.annualPremiumTtc != null ? pr.annualPremiumTtc : quote.premium_estimate || "";
    document.getElementById("fBrokerage").value =
      pr.brokerageFees != null ? pr.brokerageFees : quote.deposit_amount || data.depositAmount || "";
    document.getElementById("fMonthly").value = pr.monthlyPremiumTtc || "";
    document.getElementById("fAttackTax").value = pr.attackTaxEur != null ? pr.attackTaxEur : 6.5;
    document.getElementById("fInstallNote").value = pr.firstInstallmentsNote || "";

    document.getElementById("fVBrand").value = v.brand || data.brand || "";
    document.getElementById("fVModel").value = v.model || data.model || "";
    document.getElementById("fVFirstReg").value = (v.firstRegistration || "").slice(0, 10);
    document.getElementById("fVAcq").value = (v.acquisitionDate || "").slice(0, 10);
    document.getElementById("fVAcqMode").value = v.acquisitionMode || "";
    document.getElementById("fVUsage").value = v.usage || data.activityType || "";
    document.getElementById("fVPostal").value = v.postalCode || contact.postal_code || data.postalCode || "";

    var name = dr.name || ((contact.first_name || "") + " " + (contact.last_name || "")).trim();
    document.getElementById("fDName").value = name;
    document.getElementById("fDBirth").value = (dr.birthDate || data.birthDate || "").slice(0, 10);
    document.getElementById("fDLicense").value = dr.license || data.license || "";
    document.getElementById("fDLicenseDate").value = (dr.licenseDate || "").slice(0, 10);
    document.getElementById("fDHistory").value = dr.insuranceHistory || "";
    document.getElementById("fDReason").value = dr.reason || "";
    document.getElementById("fDEmail").value = dr.email || contact.email || "";
    document.getElementById("fDPhone").value = dr.phone || contact.phone || "";

    document.getElementById("fClaims").value = joinLines(d.claims || []);
    document.getElementById("fGBase").value = joinLines(g.base || data.garanties || []);
    document.getElementById("fGAcc").value = joinLines(g.accessories || []);
    document.getElementById("fClauses").value = joinLines(d.clauses || []);
    document.getElementById("fSteps").value = joinLines(d.subscriptionSteps || []);
    document.getElementById("fDocs").value = joinLines(d.requiredDocuments || []);
  }

  function collectDocument() {
    return {
      reference: document.getElementById("fReference").value.trim() || null,
      formula: document.getElementById("fFormula").value.trim(),
      productLabel: document.getElementById("fProduct").value.trim(),
      validityDays: Number(document.getElementById("fValidity").value) || 30,
      partnerImport: {
        internalOnly: true,
        partnerName: document.getElementById("fPartnerName").value.trim(),
        partnerReference: document.getElementById("fPartnerRef").value.trim(),
        notes: document.getElementById("fPartnerNotes").value.trim(),
      },
      pricing: {
        annualPremiumTtc: Number(document.getElementById("fAnnual").value) || null,
        brokerageFees: Number(document.getElementById("fBrokerage").value) || null,
        monthlyPremiumTtc: Number(document.getElementById("fMonthly").value) || null,
        attackTaxEur: Number(document.getElementById("fAttackTax").value) || 6.5,
        firstInstallmentsNote: document.getElementById("fInstallNote").value.trim(),
      },
      vehicle: {
        brand: document.getElementById("fVBrand").value.trim(),
        model: document.getElementById("fVModel").value.trim(),
        firstRegistration: document.getElementById("fVFirstReg").value,
        acquisitionDate: document.getElementById("fVAcq").value,
        acquisitionMode: document.getElementById("fVAcqMode").value.trim(),
        usage: document.getElementById("fVUsage").value.trim(),
        postalCode: document.getElementById("fVPostal").value.trim(),
      },
      driver: {
        name: document.getElementById("fDName").value.trim(),
        birthDate: document.getElementById("fDBirth").value,
        license: document.getElementById("fDLicense").value.trim(),
        licenseDate: document.getElementById("fDLicenseDate").value,
        insuranceHistory: document.getElementById("fDHistory").value.trim(),
        reason: document.getElementById("fDReason").value.trim(),
        email: document.getElementById("fDEmail").value.trim(),
        phone: document.getElementById("fDPhone").value.trim(),
      },
      claims: lines(document.getElementById("fClaims").value),
      guarantees: {
        base: lines(document.getElementById("fGBase").value),
        accessories: lines(document.getElementById("fGAcc").value),
      },
      clauses: lines(document.getElementById("fClauses").value),
      subscriptionSteps: lines(document.getElementById("fSteps").value),
      requiredDocuments: lines(document.getElementById("fDocs").value),
    };
  }

  Promise.all([
    api("/api/crm/quotes?id=" + encodeURIComponent(quoteId)),
    api("/api/crm/quote-document?id=" + encodeURIComponent(quoteId)),
  ]).then(function (results) {
    var qRes = results[0];
    var dRes = results[1];
    if (!qRes.ok || !qRes.quote) {
      setStatus(qRes.error || "Devis introuvable", true);
      return;
    }
    quoteRow = qRes.quote;
    var data = parseData(quoteRow.data);
    return api("/api/crm/contact?id=" + encodeURIComponent(quoteRow.contact_id)).then(function (cRes) {
      contactRow = (cRes.ok && cRes.contact) || {};
      fillForm(dRes.document || data.document, data, quoteRow, contactRow);
      setStatus("Devis charge — les infos partenaire restent internes.");
    });
  });

  document.getElementById("fAnnual").addEventListener("input", function () {
    var annual = Number(document.getElementById("fAnnual").value);
    var monthlyEl = document.getElementById("fMonthly");
    if (annual > 0 && !monthlyEl.value) {
      monthlyEl.placeholder = "Auto : " + (Math.round((annual / 12) * 100) / 100) + " €/mois";
    }
  });

  document.getElementById("editorForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var doc = collectDocument();
    var data = parseData(quoteRow.data);
    data.document = doc;

    setStatus("Enregistrement…");
    api("/api/crm/quotes?id=" + encodeURIComponent(quoteId), {
      method: "PATCH",
      body: {
        data: data,
        premiumEstimate: doc.pricing.annualPremiumTtc,
        title: doc.formula || quoteRow.title,
      },
    }).then(function (res) {
      if (!res.ok) {
        setStatus(res.error || "Erreur", true);
        return;
      }
      setStatus("Devis enregistre. Ouvrez l'apercu pour verifier le document client.");
    });
  });
})();
