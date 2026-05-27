(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  var filter = "all";
  var searchQ = "";
  var data = window.CrmWholesalersData.PARTNERS;

  function render() {
    var items = data.filter(function (p) {
      if (filter === "verified") return p.isVerified;
      if (filter === "vtc") return p.products.indexOf("vtc-taxi") >= 0;
      if (filter === "sante") return p.products.indexOf("sante") >= 0;
      return true;
    });
    if (searchQ) {
      var q = searchQ.toLowerCase();
      items = items.filter(function (p) {
        return (
          String(p.displayName || "").toLowerCase().indexOf(q) >= 0 ||
          p.specialties.join(" ").toLowerCase().indexOf(q) >= 0
        );
      });
    }
    document.getElementById("whMount").innerHTML = items
      .map(function (p) {
        var cls = "wh-card" + (p.isVerified ? " verified" : p.status === "doubtful" ? " doubtful" : "");
        var badge = p.isVerified
          ? '<span class="wh-badge ok">Vérifié</span>'
          : '<span class="wh-badge warn">À confirmer</span>';
        return (
          '<div class="' +
          cls +
          '"><div style="display:flex;justify-content:space-between;align-items:start"><div><span style="font-size:2rem">' +
          p.logo +
          "</span> <strong>" +
          esc(p.displayName) +
          '</strong></div>' +
          badge +
          "</div><p style='color:var(--muted);font-size:.85rem;margin:8px 0'>" +
          esc(p.specialties.join(" · ")) +
          "</p><p style='font-size:.8rem'>" +
          p.products.map(esc).join(", ") +
          '</p><p style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">' +
          '<a href="' +
          esc(p.website) +
          '" target="_blank" rel="noopener">Extranet →</a>' +
          '<a href="./crm-partner-detail.html?p=' +
          encodeURIComponent(p.id === "sollyazar" ? "solly-azar" : p.id) +
          '">Fiche CRM</a>' +
          '<a href="./crm-eligibility-test.html?partner=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-ghost btn-sm">Test éligibilité</a>' +
          '<button type="button" class="btn btn-ghost btn-sm btn-compare-wh" data-id="' +
          esc(p.id) +
          '">Comparer</button></p></div>'
        );
      })
      .join("");

    document.querySelectorAll(".btn-compare-wh").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-id");
        var sel = [];
        try {
          sel = JSON.parse(localStorage.getItem("lo_wholesaler_compare") || "[]");
        } catch (e) {}
        if (sel.indexOf(id) < 0) sel.push(id);
        if (sel.length > 3) sel = sel.slice(-3);
        localStorage.setItem("lo_wholesaler_compare", JSON.stringify(sel));
        alert("Comparaison : " + sel.join(", ") + " — ouvrez le test d'éligibilité pour affiner.");
      };
    });
  }

  document.querySelectorAll("#filters .crm-filter-chip").forEach(function (btn) {
    btn.onclick = function () {
      filter = btn.getAttribute("data-f");
      document.querySelectorAll("#filters .crm-filter-chip").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      render();
    };
  });

  var searchInp = document.getElementById("whSearch");
  if (searchInp) {
    searchInp.oninput = function (e) {
      searchQ = e.target.value.trim();
      render();
    };
  }

  render();
})();
