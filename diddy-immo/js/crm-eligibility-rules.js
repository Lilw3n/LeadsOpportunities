window.CrmEligibilityRules = {
  KEY: "lo_eligibility_rules_off",

  RULES: [
    { id: "vtc_license_5y", name: "Permis VTC ≥ 5 ans", product: "vtc-taxi", severity: "high" },
    { id: "bonus_malus_vtc", name: "Bonus 0.50 – 0.85", product: "vtc-taxi", severity: "high" },
    { id: "claims_max_3", name: "Max 3 sinistres / 36 mois", product: "auto", severity: "critical" },
    { id: "driver_min_21", name: "Âge conducteur ≥ 21 ans", product: "auto", severity: "medium" },
    { id: "experience_36m", name: "36 mois d'assurance auto", product: "auto", severity: "high" },
    { id: "rc_pro_activity", name: "Activité déclarée RC Pro", product: "rc-pro", severity: "medium" },
    { id: "claim_expiry_alert", name: "Alerte sinistre expirant", product: "vtc-taxi", severity: "medium" },
    { id: "recontact_client", name: "Recontacter client — sinistres OK", product: "vtc-taxi", severity: "low" },
  ],

  isOn: function (id) {
    var off = [];
    try {
      off = JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {}
    return off.indexOf(id) < 0;
  },

  render: function (mount) {
    var self = this;
    mount.innerHTML =
      '<p style="margin:0 0 12px"><button type="button" class="btn btn-ghost btn-sm" id="btnRulesAllOn">Tout activer</button> ' +
      '<a href="./crm-eligibility-test.html" class="btn btn-primary btn-sm">Lancer un test</a></p>' +
      "<table><thead><tr><th>Règle</th><th>Produit</th><th>Sévérité</th><th>Active</th></tr></thead><tbody>" +
      this.RULES.map(function (r) {
        var on = self.isOn(r.id);
        return (
          "<tr><td><strong>" +
          r.name +
          "</strong><br><code style='font-size:.75rem'>" +
          r.id +
          "</code></td><td>" +
          r.product +
          "</td><td>" +
          r.severity +
          '</td><td><input type="checkbox" data-rule="' +
          r.id +
          '" ' +
          (on ? "checked" : "") +
          " /></td></tr>"
        );
      }).join("") +
      "</tbody></table><p style='margin-top:12px;color:var(--muted);font-size:.85rem'>Les règles alimentent les alertes intelligentes et le test éligibilité partenaires (max 3 sinistres / 36 mois).</p>";

    mount.querySelectorAll("[data-rule]").forEach(function (cb) {
      cb.onchange = function () {
        var off = [];
        try {
          off = JSON.parse(localStorage.getItem(self.KEY) || "[]");
        } catch (e) {}
        var id = cb.getAttribute("data-rule");
        if (!cb.checked && off.indexOf(id) < 0) off.push(id);
        if (cb.checked) off = off.filter(function (x) { return x !== id; });
        localStorage.setItem(self.KEY, JSON.stringify(off));
      };
    });

    var btnAll = document.getElementById("btnRulesAllOn");
    if (btnAll) {
      btnAll.onclick = function () {
        localStorage.removeItem(self.KEY);
        self.render(mount);
      };
    }
  },
};
