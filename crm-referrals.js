(function () {
  var TOKEN_KEY = "lo_token";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtEur(n) {
    var v = Number(n) || 0;
    return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }

  function authHeaders() {
    var t = localStorage.getItem(TOKEN_KEY);
    return t ? { Authorization: "Bearer " + t } : {};
  }

  async function api(path, opts) {
    opts = opts || {};
    var res = await fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign({ "Content-Type": "application/json" }, authHeaders(), opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.error || "Erreur API");
    return data;
  }

  function renderTotals(totals) {
    document.getElementById("totLeads").textContent = totals.total_leads != null ? totals.total_leads : "0";
    document.getElementById("totPayments").textContent = totals.total_payments != null ? totals.total_payments : "0";
    document.getElementById("totRevenue").textContent = fmtEur(totals.total_revenue_eur);
    document.getElementById("totRewards").textContent = fmtEur(totals.total_rewards_eur);
  }

  function renderPartners(partners) {
    var el = document.getElementById("refPartners");
    if (!partners || !partners.length) {
      el.innerHTML = "<p class='muted'>Aucun code parrain. Créez le premier ci-dessus.</p>";
      return;
    }
    var html =
      "<table class='ref-table'><thead><tr>" +
      "<th>Code</th><th>Nom</th><th>Leads</th><th>Paiements</th><th>Revenus</th><th>Récompenses</th><th>Lien</th>" +
      "</tr></thead><tbody>";
    partners.forEach(function (p) {
      var s = p.stats || {};
      var link = "https://www.leadsopportunities.fr/?ref=" + encodeURIComponent(p.code);
      html +=
        "<tr><td><strong>" +
        esc(p.code) +
        "</strong></td><td>" +
        esc(p.display_name) +
        "</td><td>" +
        (s.leads || 0) +
        "</td><td>" +
        (s.payments || 0) +
        "</td><td>" +
        fmtEur(s.revenue_eur) +
        "</td><td>" +
        fmtEur(s.rewards_eur) +
        (s.rewards_pending_eur > 0 ? " <span class='muted'>(" + fmtEur(s.rewards_pending_eur) + " pending)</span>" : "") +
        "</td><td><a href='" +
        esc(link) +
        "' target='_blank' rel='noopener noreferrer'>Partager</a></td></tr>";
    });
    html += "</tbody></table>";
    el.innerHTML = html;
  }

  async function load() {
    try {
      var data = await api("/api/dashboard/referral-stats");
      renderTotals(data.totals || {});
      renderPartners(data.partners || []);
    } catch (e) {
      document.getElementById("refPartners").innerHTML =
        "<p style='color:#b91c1c'>" + esc(e.message) + "</p>";
    }
  }

  document.getElementById("btnRefRefresh").addEventListener("click", load);

  document.getElementById("refPartnerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var msg = document.getElementById("refFormMsg");
    msg.hidden = false;
    msg.textContent = "Enregistrement…";
    try {
      await api("/api/dashboard/referral-partners", {
        method: "POST",
        body: {
          code: fd.get("code"),
          displayName: fd.get("displayName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          rewardPct: fd.get("rewardPct") ? Number(fd.get("rewardPct")) : undefined,
          rewardFlatEur: fd.get("rewardFlatEur") ? Number(fd.get("rewardFlatEur")) : undefined,
          notes: fd.get("notes"),
        },
      });
      msg.textContent = "Code enregistré.";
      e.target.reset();
      load();
    } catch (err) {
      msg.textContent = err.message || "Erreur";
      msg.style.color = "#b91c1c";
    }
  });

  load();
})();
