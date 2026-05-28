(function () {
  var TOKEN_KEY = "lo_token";
  var step = 1;
  var maxStep = 2;

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function api(path, body) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
      body: JSON.stringify(body),
    }).then(function (r) { return r.json(); });
  }

  function paintSteps() {
    var vehicleStepEnabled = !!document.getElementById("needVehicleStep")?.checked;
    maxStep = vehicleStepEnabled ? 3 : 2;

    document.querySelectorAll(".qw-step").forEach(function (el) {
      var n = Number(el.getAttribute("data-step"));
      el.classList.toggle("active", n === step);
      el.classList.toggle("done", n < step);
      if (n === 3) el.classList.toggle("disabled", !vehicleStepEnabled);
    });
    document.querySelectorAll(".qw-panel").forEach(function (p) {
      var pNum = Number(p.getAttribute("data-panel"));
      p.classList.toggle("active", pNum === step && (pNum !== 3 || vehicleStepEnabled));
    });
    document.getElementById("btnPrev").disabled = step === 1;
    document.getElementById("btnNext").classList.toggle("hidden", step === maxStep);
    document.getElementById("btnSubmit").classList.toggle("hidden", step !== maxStep);
  }

  document.querySelectorAll(".qw-prod").forEach(function (el) {
    el.onclick = function () {
      document.querySelectorAll(".qw-prod").forEach(function (x) { x.classList.remove("selected"); });
      el.classList.add("selected");
      document.getElementById("productType").value = el.getAttribute("data-product");
    };
  });

  function currentStepValidation() {
    if (step === 1 && !document.getElementById("productType").value) {
      document.getElementById("qwMsg").textContent = "Choisissez un produit.";
      return false;
    }
    if (step === 2 && !document.querySelector('input[name="contactId"]').value) {
      document.getElementById("qwMsg").textContent = "Renseignez un contact CRM.";
      return false;
    }
    document.getElementById("qwMsg").textContent = "";
    return true;
  }

  document.getElementById("btnNext").onclick = function () {
    if (!currentStepValidation()) return;
    if (step < maxStep) { step += 1; paintSteps(); }
  };

  document.getElementById("btnPrev").onclick = function () {
    if (step > 1) { step -= 1; paintSteps(); }
  };

  document.getElementById("quoteWizard").onsubmit = function (e) {
    e.preventDefault();
    if (!currentStepValidation()) return;
    var fd = new FormData(e.target);
    var notes = fd.get("notes") || "";
    if (fd.get("registration")) notes += "\nVéhicule: " + fd.get("registration") + " " + (fd.get("brand") || "") + " " + (fd.get("model") || "");
    if (fd.get("energy")) notes += "\nÉnergie: " + fd.get("energy");
    api("/api/crm/quotes", {
      contactId: fd.get("contactId"),
      productType: fd.get("productType"),
      title: fd.get("title"),
      notes: notes.trim(),
      premiumEstimate: fd.get("premiumEstimate") ? Number(fd.get("premiumEstimate")) : undefined,
    }).then(function (res) {
      if (!res.ok) {
        document.getElementById("qwMsg").textContent = res.error || "Erreur";
        return;
      }
      location.href = "./crm-quote-detail.html?id=" + encodeURIComponent((res.quote && res.quote.id) || res.id || "");
    });
  };

  function initFromQuery() {
    var q = new URLSearchParams(location.search);
    var leadId = q.get("leadId");
    var premium = q.get("premium");
    var contactId = q.get("contactId");
    if (contactId) {
      var cInput = document.querySelector('input[name="contactId"]');
      if (cInput && !cInput.value) cInput.value = contactId;
    }
    if (premium) {
      var pInput = document.querySelector('input[name="premiumEstimate"]');
      if (pInput && !pInput.value) pInput.value = premium;
    }
    if (leadId && !document.querySelector('textarea[name="notes"]').value) {
      document.querySelector('textarea[name="notes"]').value = "Lead source: " + leadId;
    }
  }

  function resetWizardStart() {
    step = 1;
    document.getElementById("qwMsg").textContent = "";
    paintSteps();
  }

  var needVehicleStep = document.getElementById("needVehicleStep");
  if (needVehicleStep) {
    needVehicleStep.addEventListener("change", function () {
      if (!needVehicleStep.checked && step > 2) step = 2;
      paintSteps();
    });
  }

  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) resetWizardStart();
  });

  initFromQuery();
  resetWizardStart();
})();
