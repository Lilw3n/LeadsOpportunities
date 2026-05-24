(function () {
  var TOKEN_KEY = "lo_token";
  var contactId = new URLSearchParams(location.search).get("contactId");

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  if (!token() || !contactId) {
    location.href = "./crm.html";
    return;
  }

  document.getElementById("backContact").href = "./crm-contact.html?id=" + encodeURIComponent(contactId);

  fetch("/api/crm/devis-prefill?contactId=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + token() },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (res.ok && res.data) {
        var box = document.getElementById("prefillBox");
        var known = res.data.fieldStatus.known || [];
        var missing = res.data.fieldStatus.missing || [];
        box.classList.remove("hidden");
        box.innerHTML =
          "<strong>Préremplissage CRM</strong> — " +
          known.length +
          " champs connus" +
          (missing.length ? ', <span class="prefill-missing">' + missing.length + " à compléter</span>" : "") +
          ".";
        window.IntelligentQuoteWizard.render(document.getElementById("wizardMount"), {
          crmContactId: contactId,
          token: token(),
          prefillData: Object.assign({}, res.data.extracted, {
            profileKey: res.data.extracted.profileKey,
          }),
          insuranceType: res.data.extracted.primaryNeed || "",
        });
      } else {
        window.IntelligentQuoteWizard.render(document.getElementById("wizardMount"), {
          crmContactId: contactId,
          token: token(),
        });
      }
    })
    .catch(function () {
      window.IntelligentQuoteWizard.render(document.getElementById("wizardMount"), {
        crmContactId: contactId,
        token: token(),
      });
    });
})();
