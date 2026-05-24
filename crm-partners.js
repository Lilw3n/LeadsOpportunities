(function () {
  var TOKEN_KEY = "lo_token";
  var filter = "all";

  var PARTNER_DETAILS = {
    sollyazar: {
      logo: "🛡️",
      verified: true,
      requirements: ["Age 27-65 ans", "Permis ≥ 5 ans", "Bonus 0.50-0.85", "Max 2 sinistres matériels"],
      href: "./crm-eligibility-test.html?product=vtc-taxi",
      detail: "./crm-partner-solly-azar.html",
    },
    zephir: {
      logo: "🌪️",
      verified: true,
      requirements: ["Age 23-70 ans", "Permis ≥ 3 ans", "Bonus ≤ 1.50", "Max 3 sinistres mat., 1 corporel resp."],
      href: "./crm-eligibility-test.html?product=vtc-taxi",
      detail: "./crm-partner-zephir.html",
    },
    "2m2a": {
      logo: "🚡",
      verified: true,
      requirements: ["Age 25-68 ans", "Permis ≥ 4 ans", "Bonus ≤ 1.0", "0 sinistre matériel admis"],
      href: "./crm-eligibility-test.html?product=vtc-taxi",
    },
    april: {
      logo: "💚",
      verified: true,
      requirements: ["Santé, habitation, auto", "Age 18-75 ans", "Conditions souples"],
      href: "./crm-eligibility-test.html?product=sante",
    },
  };

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function render() {
    var partners = window.PartnerEligibility ? window.PartnerEligibility.PARTNERS : [];
    var grid = document.getElementById("partnersGrid");
    var list = partners.filter(function (p) {
      if (filter === "all") return true;
      if (filter === "vtc") return p.products.indexOf("vtc-taxi") !== -1;
      if (filter === "sante") return p.products.indexOf("sante") !== -1;
      return true;
    });
    grid.innerHTML = list
      .map(function (p) {
        var d = PARTNER_DETAILS[p.id] || { logo: "🏢", verified: false, requirements: [], href: "#" };
        return (
          '<article class="partner-card' +
          (d.verified ? " verified" : "") +
          '"><h3><span>' +
          d.logo +
          "</span> " +
          p.displayName +
          (d.verified ? ' <span class="badge-ok">Vérifié</span>' : "") +
          '</h3><p>Produits : ' +
          p.products.join(", ") +
          '</p><ul class="req-list">' +
          d.requirements
            .map(function (r) {
              return "<li>" + r + "</li>";
            })
            .join("") +
          '</ul><p style="margin-top:12px"><a href="' +
          d.href +
          '">Tester éligibilité →</a>' +
          (d.detail ? ' · <a href="' + d.detail + '">Fiche partenaire</a>' : "") +
          "</p></article>"
        );
      })
      .join("");
  }

  document.querySelectorAll("[data-filter]").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll("[data-filter]").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      filter = btn.getAttribute("data-filter");
      render();
    };
  });

  render();

  document.querySelectorAll(".btn-copy-template").forEach(function (btn) {
    btn.onclick = function () {
      var pre = btn.closest("details").querySelector("pre");
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent.trim()).then(function () {
        btn.textContent = "Copié ✓";
        setTimeout(function () { btn.textContent = "Copier"; }, 2000);
      });
    };
  });
})();
