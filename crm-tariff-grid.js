(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) location.href = "./crm.html";

  var params = new URLSearchParams(location.search);
  if (params.get("leadId")) document.getElementById("leadId").value = params.get("leadId");
  if (params.get("insurer")) document.getElementById("insurer").value = params.get("insurer");

  var grid = null;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function renderTable() {
    if (!grid || !grid.rows) return;
    var tbody = document.querySelector("#tariffTable tbody");
    tbody.innerHTML = grid.rows
      .map(function (r, i) {
        return (
          "<tr data-i='" +
          i +
          "'><td><input data-f='label' value='" +
          esc(r.label) +
          "' /></td><td><input data-f='code' value='" +
          esc(r.code) +
          "' /></td><td><input type='number' data-f='franchise' value='" +
          (r.franchise || 0) +
          "' /></td><td><input type='number' data-f='annualPremium' value='" +
          (r.annualPremium || 0) +
          "' /></td><td><input type='number' data-f='commissionPct' value='" +
          (r.commissionPct || 0) +
          "' /></td></tr>"
        );
      })
      .join("");
    updateTotal();
    tbody.querySelectorAll("input").forEach(function (inp) {
      inp.oninput = function () {
        var tr = inp.closest("tr");
        var i = Number(tr.getAttribute("data-i"));
        var f = inp.getAttribute("data-f");
        grid.rows[i][f] = f === "label" || f === "code" ? inp.value : Number(inp.value);
        updateTotal();
      };
    });
  }

  function updateTotal() {
    var total = (grid.rows || []).reduce(function (s, r) {
      return s + (Number(r.annualPremium) || 0);
    }, 0);
    document.getElementById("tariffTotal").textContent =
      "Prime annuelle totale : " + total.toLocaleString("fr-FR") + " €";
  }

  function collectGrid() {
    return Object.assign({}, grid, {
      rows: grid.rows.map(function (r, i) {
        var tr = document.querySelector('tr[data-i="' + i + '"]');
        if (!tr) return r;
        return {
          code: tr.querySelector('[data-f="code"]').value,
          label: tr.querySelector('[data-f="label"]').value,
          franchise: Number(tr.querySelector('[data-f="franchise"]').value),
          annualPremium: Number(tr.querySelector('[data-f="annualPremium"]').value),
          commissionPct: Number(tr.querySelector('[data-f="commissionPct"]').value),
        };
      }),
      totalAnnual: (grid.rows || []).reduce(function (s, r) {
        return s + (Number(r.annualPremium) || 0);
      }, 0),
      editedAt: new Date().toISOString(),
    });
  }

  document.getElementById("btnLoad").onclick = function () {
    var insurer = document.getElementById("insurer").value;
    var product = document.getElementById("product").value;
    document.getElementById("tariffNote").textContent = "Chargement…";
    fetch(
      "/api/crm/tariff-rates?insurer=" + encodeURIComponent(insurer) + "&product=" + encodeURIComponent(product),
      { headers: { Authorization: "Bearer " + token } }
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok || !res.result || !res.result.grid) {
          document.getElementById("tariffNote").textContent = res.error || "Erreur";
          return;
        }
        grid = res.result.grid;
        document.getElementById("tariffNote").textContent =
          (res.result.grid.insurerLabel || insurer) +
          " — source : " +
          (res.result.source || "?") +
          (res.result.note ? " — " + res.result.note : "");
        renderTable();
        var lid = document.getElementById("leadId").value.trim();
        if (lid) {
          document.getElementById("linkQuote").href =
            "./crm-quote-new.html?leadId=" + encodeURIComponent(lid) + "&premium=" + collectGrid().totalAnnual;
        }
      });
  };

  document.getElementById("btnSave").onclick = function () {
    var lid = document.getElementById("leadId").value.trim();
    if (!lid) {
      alert("Indiquez l'ID du lead.");
      return;
    }
    var snap = collectGrid();
    fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(lid), {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({
        tariff_insurer: document.getElementById("insurer").value,
        tariff_snapshot: snap,
        pipeline_stage: "tariff_editing",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        alert(res.ok ? "Bordereau enregistré sur le lead." : res.error || "Erreur");
      });
  };

  document.getElementById("btnExport").onclick = function () {
    if (!grid) return;
    var g = collectGrid();
    var csv =
      "code;garantie;franchise;prime_annuelle;commission\n" +
      g.rows
        .map(function (r) {
          return [r.code, r.label, r.franchise, r.annualPremium, r.commissionPct].join(";");
        })
        .join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bordereau-" + (g.insurer || "assureur") + ".csv";
    a.click();
  };

  if (params.get("leadId")) document.getElementById("btnLoad").click();
})();
