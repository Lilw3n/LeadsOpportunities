(function () {
  function showSection(show) {
    var sec = document.getElementById("adminLeadsSection");
    if (sec) sec.style.display = show ? "block" : "none";
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    } catch (e) {
      return String(iso);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var state = document.getElementById("adminState");
    if (!state || state.textContent.indexOf("Bienvenue admin") === -1) {
      return;
    }
    showSection(true);

    var tokInput = document.getElementById("adminLeadToken");
    var msg = document.getElementById("adminLeadMsg");
    var tbody = document.getElementById("adminLeadRows");
    var btn = document.getElementById("adminLeadLoad");

    var stored = sessionStorage.getItem("lo_admin_lead_token");
    if (stored && tokInput) tokInput.value = stored;

    if (!btn || !tbody) return;

    btn.addEventListener("click", function () {
      var t = tokInput ? tokInput.value.trim() : "";
      if (!t) {
        if (msg) msg.textContent = "Token requis.";
        return;
      }
      sessionStorage.setItem("lo_admin_lead_token", t);
      if (msg) msg.textContent = "Chargement...";
      fetch("/api/leads-recent?token=" + encodeURIComponent(t))
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          tbody.innerHTML = "";
          if (!data.ok) {
            if (msg) msg.textContent = data.error || "Erreur";
            return;
          }
          if (data.message && msg) {
            msg.textContent = data.message;
          } else if (msg) {
            msg.textContent = String((data.leads || []).length) + " lead(s).";
          }
          (data.leads || []).forEach(function (row) {
            var tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" +
              fmtDate(row.created_at) +
              "</td>" +
              "<td>" +
              (row.lead_score != null ? row.lead_score : "") +
              "</td>" +
              "<td>" +
              escapeHtml(row.vertical || "") +
              "</td>" +
              "<td>" +
              escapeHtml(row.email || "") +
              "</td>" +
              "<td>" +
              escapeHtml(row.utm_source || "") +
              "</td>";
            tbody.appendChild(tr);
          });
        })
        .catch(function () {
          if (msg) msg.textContent = "Erreur reseau ou API.";
        });
    });
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
