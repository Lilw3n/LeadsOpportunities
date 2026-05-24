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
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json();
    });
  }

  function paintSteps() {
    document.querySelectorAll(".cw-step").forEach(function (el) {
      var n = Number(el.getAttribute("data-step"));
      el.classList.toggle("active", n === step);
      el.classList.toggle("done", n < step);
    });
    document.querySelectorAll(".cw-panel").forEach(function (p) {
      p.classList.toggle("active", Number(p.getAttribute("data-panel")) === step);
    });
    document.getElementById("btnPrev").disabled = step === 1;
    document.getElementById("btnNext").classList.toggle("hidden", step === maxStep);
    document.getElementById("btnSubmit").classList.toggle("hidden", step !== maxStep);
  }

  document.querySelectorAll(".cw-prod").forEach(function (el) {
    el.onclick = function () {
      document.querySelectorAll(".cw-prod").forEach(function (x) {
        x.classList.remove("selected");
      });
      el.classList.add("selected");
      document.getElementById("contractType").value = el.getAttribute("data-product");
    };
  });

  document.getElementById("btnNext").onclick = function () {
    if (step === 1 && !document.getElementById("contractType").value) {
      document.getElementById("cwMsg").textContent = "Choisissez un produit.";
      return;
    }
    document.getElementById("cwMsg").textContent = "";
    if (step < maxStep) {
      step += 1;
      paintSteps();
    }
  };

  document.getElementById("btnPrev").onclick = function () {
    if (step > 1) {
      step -= 1;
      paintSteps();
    }
  };

  document.getElementById("contractWizard").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var contactId = fd.get("contactId");
    var desc = fd.get("description") || "";
    if (fd.get("formule")) desc = "Formule: " + fd.get("formule") + "\n" + desc;
    if (fd.get("frequency")) desc = "Fréquence: " + fd.get("frequency") + "\n" + desc;

    api(
      "/api/crm/modules?resource=contracts&contactId=" + encodeURIComponent(contactId),
      {
        contract_type: fd.get("contractType") || document.getElementById("contractType").value,
        status: fd.get("status") || "En attente",
        start_date: fd.get("startDate") || null,
        end_date: fd.get("endDate") || null,
        premium: fd.get("premium") ? Number(fd.get("premium")) : null,
        insurer: fd.get("insurer") || null,
        policy_number: fd.get("policyNumber") || null,
        description: desc.trim() || null,
      }
    ).then(function (res) {
      if (!res.ok) {
        document.getElementById("cwMsg").textContent = res.error || "Erreur";
        return;
      }
      var id = (res.item && res.item.id) || "";
      location.href =
        "./crm-contract-detail.html?id=" +
        encodeURIComponent(id) +
        "&contactId=" +
        encodeURIComponent(contactId);
    });
  };

  paintSteps();
})();
