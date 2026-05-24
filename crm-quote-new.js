(function () {
  var TOKEN_KEY = "lo_token";
  var step = 1;
  var maxStep = 3;

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
    document.querySelectorAll(".qw-step").forEach(function (el) {
      var n = Number(el.getAttribute("data-step"));
      el.classList.toggle("active", n === step);
      el.classList.toggle("done", n < step);
    });
    document.querySelectorAll(".qw-panel").forEach(function (p) {
      p.classList.toggle("active", Number(p.getAttribute("data-panel")) === step);
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

  document.getElementById("btnNext").onclick = function () {
    if (step === 1 && !document.getElementById("productType").value) {
      document.getElementById("qwMsg").textContent = "Choisissez un produit.";
      return;
    }
    document.getElementById("qwMsg").textContent = "";
    if (step < maxStep) { step += 1; paintSteps(); }
  };

  document.getElementById("btnPrev").onclick = function () {
    if (step > 1) { step -= 1; paintSteps(); }
  };

  document.getElementById("quoteWizard").onsubmit = function (e) {
    e.preventDefault();
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

  paintSteps();
})();
